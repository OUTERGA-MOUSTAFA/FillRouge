<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Services\ImageService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    protected $imageService;
    protected $notificationService;

    public function __construct(ImageService $imageService, NotificationService $notificationService)
    {
        $this->imageService = $imageService;
        $this->notificationService = $notificationService;
    }

    public function conversations(Request $request)
    {
        $user = $request->user();
        $userId = (int) $user->id;

        $conversationUserIds = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->selectRaw('DISTINCT CASE 
                WHEN sender_id = ? THEN receiver_id 
                ELSE sender_id 
            END as other_user_id', [$userId])
            ->pluck('other_user_id')
            ->filter()
            ->values();

        if ($conversationUserIds->isEmpty()) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $users = User::withTrashed()->whereIn('id', $conversationUserIds)->get()->keyBy('id');

        $lastMessages = Message::whereIn('id', function ($query) use ($userId) {
            $query->selectRaw('MAX(id)')
                ->from('messages')
                ->where(function ($q) use ($userId) {
                    $q->where('sender_id', $userId)
                        ->orWhere('receiver_id', $userId);
                })
                ->groupByRaw('CASE 
                    WHEN sender_id = ? THEN receiver_id 
                    ELSE sender_id 
                END', [$userId]);
        })->get()->keyBy(function ($message) use ($userId) {
            return $message->sender_id == $userId ? $message->receiver_id : $message->sender_id;
        });

        $unreadCounts = Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->selectRaw('sender_id, COUNT(*) as count')
            ->groupBy('sender_id')
            ->pluck('count', 'sender_id');

        $conversations = [];
        foreach ($conversationUserIds as $otherId) {
            $otherUser = $users->get($otherId);
            if (!$otherUser) continue;

            $conversations[] = [
                'user' => [
                    'id'        => $otherUser->id,
                    'full_name' => $otherUser->full_name,
                    'avatar'    => $otherUser->avatar,
                ],
                'last_message' => $lastMessages->get($otherId),
                'unread_count' => $unreadCounts->get($otherId, 0),
            ];
        }

        usort($conversations, function ($a, $b) {
            $dateA = $a['last_message']?->created_at ?? now()->subYear();
            $dateB = $b['last_message']?->created_at ?? now()->subYear();
            return $dateB <=> $dateA;
        });

        return response()->json(['success' => true, 'data' => $conversations]);
    }

    public function conversation(Request $request, $userId)
    {
        $otherUser = User::findOrFail($userId);
        $currentUserId = (int) $request->user()->id;
        $otherUserId = (int) $otherUser->id;

        $messages = Message::betweenUsers($currentUserId, $otherUserId)
            ->notDeletedFor($currentUserId)
            ->orderBy('created_at', 'asc')
            ->with('sender')
            ->get();

        Message::betweenUsers($currentUserId, $otherUserId)
            ->where('receiver_id', $currentUserId)
            ->where('is_read', false)
            ->get()
            ->each->markAsRead();

        return response()->json([
            'success' => true,
            'data' => [
                'user'     => $otherUser->only(['id', 'full_name', 'avatar']),
                'messages' => $messages,
            ]
        ]);
    }

    public function send(Request $request, $userId)
    {
        // 1. Find receiver
        $receiver = User::find($userId);
        if (!$receiver) {
            return response()->json(['success' => false, 'message' => 'Utilisateur non trouvé'], 404);
        }

        $sender = $request->user();

        // 2. Check policy — ONE check, correct direction
        if (!Gate::inspect('send', [Message::class, $receiver])) {
            $errorMessage = match (true) {
                $sender->id === $receiver->id
                => 'Vous ne pouvez pas vous envoyer de message à vous-même.',

                $receiver->role === 'admin'
                => 'Vous ne pouvez pas contacter un administrateur.', 
                $receiver->hasBlocked($sender->id) 
            => 'Cet utilisateur vous a bloqué. Vous ne pouvez pas le contacter.',
                $sender->role === 'semsar'
                => 'Vous ne pouvez répondre qu\'aux chercheurs qui vous ont contacté en premier.',
                $receiver->role !== 'semsar'
                => 'Vous ne pouvez contacter que des propriétaires (semsar).',
                !$sender->canSendMessage()
                => 'Vous avez atteint votre limite de messages aujourd\'hui. Passez à un plan supérieur.',
                default
                => 'Vous ne pouvez pas envoyer de message à cet utilisateur. tester',
            };

            return response()->json([
                'success'          => false,
                'message'          => $errorMessage,
                'upgrade_required' => !$sender->canSendMessage() && $sender->subscription_plan === 'free',
            ], 403);
        }

        // 3. Validate — content OR attachments required, not both mandatory
        $validator = Validator::make($request->all(), [
            'content'       => 'nullable|string|max:5000',
            'listing_id'    => 'nullable|exists:listings,id',
            'attachments'   => 'nullable|array|max:5',
            'attachments.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // 4. Must have text OR image
        $hasText  = !empty(trim($request->content ?? ''));
        $hasFiles = $request->hasFile('attachments');

        if (!$hasText && !$hasFiles) {
            return response()->json([
                'success' => false,
                'message' => 'Le message doit contenir du texte ou au moins une image.',
            ], 422);
        }

        // 5. Upload attachments
        $attachments = [];
        if ($hasFiles) {
            foreach ($request->file('attachments') as $file) {
                try {
                    $attachments[] = $this->imageService->upload($file, 'messages');
                } catch (\Exception $e) {
                    Log::error('Image upload failed', ['error' => $e->getMessage()]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Erreur upload image: ' . $e->getMessage(),
                    ], 500);
                }
            }
        }

        // 6. Create message
        $message = Message::create([
            'sender_id'   => $sender->id,
            'receiver_id' => $receiver->id,
            'listing_id'  => $request->listing_id,
            'content'     => trim($request->content ?? ''),
            'attachments' => $attachments,
            'is_read'     => false,
        ]);

        // 7. Increment daily counter
        $sender->increment('daily_messages_count');

        // 8. WebSocket event (optional — won't break if Reverb isn't running)
        try {
            event(new MessageSent($message));
        } catch (\Exception $e) {
            Log::warning('WebSocket event failed', ['error' => $e->getMessage()]);
        }

        // 9. Notification (optional)
        try {
            $this->notificationService->newMessage($receiver, $sender, $message);
        } catch (\Exception $e) {
            Log::warning('Notification failed', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Message envoyé',
            'data'    => $message->load('sender'),
        ], 201);
    }

    public function index(Request $request)
    {
        return $this->conversations($request);
    }

    public function markAsRead(Message $message)
    {
        if (!Gate::allows('view', $message)) {
            return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }
        $message->markAsRead();
        return response()->json(['success' => true, 'message' => 'Message marqué comme lu']);
    }

    public function destroy(Message $message)
    {
        if (!Gate::allows('delete', $message)) {
            return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }
        $message->deleteForUser(auth()->id());
        return response()->json(['success' => true, 'message' => 'Message supprimé']);
    }

    public function report(Request $request, Message $message)
    {
        if (!Gate::allows('report', $message)) {
            return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|in:spam,harassment,inappropriate,other',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $message->report($request->reason);
        return response()->json(['success' => true, 'message' => 'Message signalé']);
    }
}

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

class MessageController extends Controller
{
    protected $imageService;
    protected $notificationService;

    public function __construct(ImageService $imageService, NotificationService $notificationService)
    {
        $this->imageService = $imageService;
        $this->notificationService = $notificationService;
    }

    /**
     * Liste des conversations (corrigé: N+1, null safety, eager loading)
     */
    public function conversations(Request $request)
    {
        $user = $request->user();
        $userId = (int) $user->id; // Cast explicite

        // Récupérer tous les IDs des utilisateurs avec qui on a conversé
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

        // Eager loading: une seule requête pour tous les users
        $users = User::withTrashed()->whereIn('id', $conversationUserIds)->get()->keyBy('id');

        // Récupérer le dernier message pour chaque conversation
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

        // Compter les messages non lus par conversation
        $unreadCounts = Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->selectRaw('sender_id, COUNT(*) as count')
            ->groupBy('sender_id')
            ->pluck('count', 'sender_id');

        $conversations = [];
        foreach ($conversationUserIds as $otherId) {
            $otherUser = $users->get($otherId);
            // ✅ Vérification null
            if (!$otherUser) continue;

            $conversations[] = [
                'user' => [
                    'id' => $otherUser->id,
                    'full_name' => $otherUser->full_name,
                    'avatar' => $otherUser->avatar,
                ],
                'last_message' => $lastMessages->get($otherId),
                'unread_count' => $unreadCounts->get($otherId, 0),
            ];
        }

        // Trier par date du dernier message
        usort($conversations, function ($a, $b) {
            $dateA = $a['last_message']?->created_at ?? now()->subYear();
            $dateB = $b['last_message']?->created_at ?? now()->subYear();
            return $dateB <=> $dateA;
        });

        return response()->json(['success' => true, 'data' => $conversations]);
    }

    /**
     * Conversation avec un utilisateur spécifique
     */
    public function conversation(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $currentUser = $request->user();
        $currentUserId = (int) $currentUser->id;
        $otherUserId = (int) $user->id;

        $messages = Message::betweenUsers($currentUserId, $otherUserId)
            ->notDeletedFor($currentUserId)
            ->orderBy('created_at', 'asc')
            ->with('sender')
            ->get();

        // mark as read...
        Message::betweenUsers($currentUserId, $otherUserId)
            ->where('receiver_id', $currentUserId)
            ->where('is_read', false)
            ->get()
            ->each->markAsRead();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user->only(['id', 'full_name', 'avatar']),
                'messages' => $messages
            ]
        ]);
    }
    /**
     * Envoyer un message (avec notifications)
     */
    // public function send(Request $request, User $receiver)
    // {
    //     $sender = $request->user();

    //     if (!Gate::allows('send', $receiver)) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Vous ne pouvez pas envoyer de message à cet utilisateur'
    //         ], 403);
    //     }

    //     $validator = Validator::make($request->all(), [
    //         'content' => 'required|string|max:5000',
    //         'listing_id' => 'nullable|exists:listings,id',
    //         'attachments' => 'nullable|array|max:5',
    //         'attachments.*' => 'image|mimes:jpeg,png,jpg|max:5120'
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }

    //     // Upload des pièces jointes
    //     $attachments = [];
    //     if ($request->hasFile('attachments')) {
    //         foreach ($request->file('attachments') as $file) {
    //             $attachments[] = $this->imageService->upload($file, 'messages');
    //         }
    //     }

    //     $message = Message::create([
    //         'sender_id' => $sender->id,
    //         'receiver_id' => $receiver->id,
    //         'listing_id' => $request->listing_id,
    //         'content' => $request->content,
    //         'attachments' => $attachments,
    //     ]);

    //     // Incrémenter le compteur
    //     $sender->incrementMessagesCount();

    //     // Envoyer notification (correction du TODO)
    //     $this->notificationService->newMessage($receiver, $sender, $message);

    //     // Déclencher l'event WebSocket
    //     event(new MessageSent($message));

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Message envoyé',
    //         'data' => $message->load('sender')
    //     ], 201);
    // }

    public function send(Request $request, $userId)
    {
        $receiver = User::find($userId);

        if (!$receiver) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $sender = $request->user();

        if ($sender->id === $receiver->id) {
            return response()->json(['success' => false, 'message' => 'Vous ne pouvez pas vous envoyer un message'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
            'listing_id' => 'nullable|exists:listings,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message = Message::create([
            'sender_id'   => $sender->id,
            'receiver_id' => $receiver->id,
            'listing_id'  => $request->listing_id,
            'content'     => $request->content,
            'attachments' => [],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message envoyé',
            'data'    => $message->load('sender')
        ], 201);
    }

    /**
     * Méthode index manquante
     */
    public function index(Request $request)
    {
        return $this->conversations($request);
    }

    /**
     * Marquer un message comme lu
     */
    public function markAsRead(Message $message)
    {
        if (!Gate::allows('view', $message)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $message->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Message marqué comme lu'
        ]);
    }

    /**
     * Supprimer un message
     */
    public function destroy(Message $message)
    {
        if (!Gate::allows('delete', $message)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $message->deleteForUser(auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Message supprimé'
        ]);
    }

    /**
     * Signaler un message
     */
    public function report(Request $request, Message $message)
    {
        if (!Gate::allows('report', $message)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|in:spam,harassment,inappropriate,other'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $message->report($request->reason);

        return response()->json([
            'success' => true,
            'message' => 'Message signalé'
        ]);
    }
}

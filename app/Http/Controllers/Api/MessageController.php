<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;

class MessageController extends Controller
{
    /**
     * Liste des conversations
     */
    public function conversations(Request $request)
    {
        $user = $request->user();
        
        // Récupérer tous les utilisateurs avec qui l'utilisateur a échangé des messages
        $conversations = Message::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->with(['sender', 'receiver'])
            ->get()
            ->groupBy(function($message) use ($user) {
                return $message->sender_id === $user->id 
                    ? $message->receiver_id 
                    : $message->sender_id;
            })
            ->map(function($messages, $userId) use ($user) {
                $otherUser = User::find($userId);
                $lastMessage = $messages->sortByDesc('created_at')->first();
                $unreadCount = $messages->where('receiver_id', $user->id)
                                        ->where('is_read', false)
                                        ->count();
                
                return [
                    'user' => $otherUser->only(['id', 'full_name', 'avatar']),
                    'last_message' => $lastMessage,
                    'unread_count' => $unreadCount,
                    'updated_at' => $lastMessage->created_at
                ];
            })
            ->sortByDesc('updated_at')
            ->values();
        
        return response()->json([
            'success' => true,
            'data' => $conversations
        ]);
    }

    /**
     * Conversation avec un utilisateur spécifique
     */
    public function conversation(Request $request, User $user)
    {
        $currentUser = $request->user();
        
        $messages = Message::betweenUsers($currentUser->id, $user->id)
            ->notDeletedFor($currentUser->id)
            ->orderBy('created_at', 'asc')
            ->with('sender')
            ->get();
        
        // Marquer les messages non lus comme lus
        Message::betweenUsers($currentUser->id, $user->id)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user->only(['id', 'full_name', 'avatar']),
                'messages' => $messages
            ]
        ]);
    }

    /**
     * Envoyer un message
     */
    public function send(Request $request, User $receiver)
    {
        $sender = $request->user();
        
        if (!Gate::allows('send', $receiver)) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas envoyer de message à cet utilisateur'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
            'listing_id' => 'nullable|exists:listings,id',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'image|mimes:jpeg,png,jpg|max:5120'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Upload des pièces jointes git commit -m "SEM-40 Implémenter l'envoi et réception de fichiers/images"
        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $attachments[] = $this->imageService->upload($file, 'messages');
            }
        }
        
        $message = Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'listing_id' => $request->listing_id,
            'content' => $request->content,
            'attachments' => $attachments,
        ]);
        
        // Incrémenter le compteur
        $sender->incrementMessagesCount();
        
        // TODO: Envoyer notification push/SMS/Email
        
        return response()->json([
            'success' => true,
            'message' => 'Message envoyé',
            'data' => $message->load('sender')
        ], 201);
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
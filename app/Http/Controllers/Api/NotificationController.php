<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // /**
     * Liste des notifications
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        $unreadCount = $user->unreadNotifications()->count();
        
        return response()->json([
            'success' => true,
            'data' => [
                'notifications' => $notifications,
                'unread_count' => $unreadCount
            ]
        ]);
    }
    /**
     * Liste des notifications
     */
    // public function index(Request $request)
    // {
    //     $user = $request->user();
        
    //     $notifications = $user->notifications()
    //         ->orderBy('created_at', 'desc')
    //         ->paginate(20);
        
    //     $unreadCount = $user->unreadNotifications()->count();
        
    //     return response()->json([
    //         'success' => true,
    //         'data' => [
    //             'notifications' => $notifications,
    //             'unread_count' => $unreadCount
    //         ]
    //     ]);
    // }
    
    /**
     * Marquer une notification comme lue
     */
    public function markAsRead(Notification $notification)
    {
        if ($notification->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }
        
        $notification->markAsRead();
        
        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue'
        ]);
    }
    
    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()->unread()->update([
            'is_read' => true,
            'read_at' => now()
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications ont été marquées comme lues'
        ]);
    }
    
    /**
     * Supprimer une notification
     */
    public function destroy(Notification $notification)
    {
        if ($notification->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }
        
        $notification->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Notification supprimée'
        ]);
    }
}
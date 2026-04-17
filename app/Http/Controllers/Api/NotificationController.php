<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use PHPUnit\Framework\Exception;

class NotificationController extends Controller
{
    /**
     * Liste des notifications
     */
    //  public function index(Request $request)
    // {
    //     try {
    //         $user = $request->user();
            
    //         if (!$user) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Non authentifié'
    //             ], 401);
    //         }
            
    //         $notifications = $user->notifications()
    //             ->orderBy('created_at', 'desc')
    //             ->paginate(20);
            
    //         $unreadCount = $user->notifications()->where('is_read', false)->count();
            
    //         return response()->json([
    //             'success' => true,
    //             'data' => [
    //                 'notifications' => $notifications,
    //                 'unread_count' => $unreadCount
    //             ]
    //         ]);
    //     } catch (Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => $e->getMessage()
    //         ], 500);
    //     }
    // }
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
    // public function markAsRead(Notification $notification)
    // {
    //     if ($notification->user_id !== auth()->id()) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Non autorisé'
    //         ], 403);
    //     }
        
    //     $notification->markAsRead();
        
    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Notification marquée comme lue'
    //     ]);
    // }
    
    /**
     * Marquer toutes les notifications comme lues
     */
    // public function markAllAsRead(Request $request)
    // {
    //     $request->user()->notifications()->unread()->update([
    //         'is_read' => true,
    //         'read_at' => now()
    //     ]);
        
    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Toutes les notifications ont été marquées comme lues'
    //     ]);
    // }
    
    /**
     * Supprimer une notification
     */
    // public function destroy(Notification $notification)
    // {
    //     if ($notification->user_id !== auth()->id()) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Non autorisé'
    //         ], 403);
    //     }
        
    //     $notification->delete();
        
    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Notification supprimée'
    //     ]);
    // }

    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié'
                ], 401);
            }
            
            $notifications = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(20);
            
            $unreadCount = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications,
                    'unread_count' => $unreadCount
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function markAsRead(Request $request, $id)
    {
        try {
            $notification = Notification::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->first();
                
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification non trouvée'
                ], 404);
            }
            
            $notification->update(['is_read' => true, 'read_at' => now()]);
            
            return response()->json([
                'success' => true,
                'message' => 'Notification marquée comme lue'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function markAllAsRead(Request $request)
    {
        try {
            Notification::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);
            
            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications ont été marquées comme lues'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function destroy(Request $request, $id)
    {
        try {
            $notification = Notification::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->first();
                
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification non trouvée'
                ], 404);
            }
            
            $notification->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Notification supprimée'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
}
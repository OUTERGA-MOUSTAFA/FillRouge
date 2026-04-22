<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Liste des notifications de l'utilisateur connecté
     * Retourne les notifications paginées + le nombre de non lues
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Récupérer les notifications triées par date décroissante (les plus récentes en premier)
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Compter séparément les non lues pour l'affichage du badge
        $unreadCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'notifications' => $notifications,
                'unread_count'  => $unreadCount,
            ],
        ]);
    }

    /**
     * Marquer une notification spécifique comme lue
     * Vérifie que la notification appartient bien à l'utilisateur connecté
     */
    public function markAsRead(Request $request, $id)
    {
        // where('user_id') empêche un utilisateur de lire les notifications d'un autre
        $notification = Notification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification non trouvée',
            ], 404);
        }

        // Mettre à jour seulement si pas déjà lue (optimisation — évite une écriture inutile)
        if (!$notification->is_read) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue',
        ]);
    }

    /**
     * Marquer TOUTES les notifications comme lues en une seule requête
     * Plus efficace que d'appeler markAsRead() en boucle depuis le frontend
     */
    public function markAllAsRead(Request $request)
    {
        // update() en masse → une seule requête SQL au lieu de N requêtes
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false) // seulement les non lues → optimisation
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications ont été marquées comme lues',
        ]);
    }

    /**
     * Supprimer une notification
     * Vérifie que la notification appartient bien à l'utilisateur connecté
     */
    public function destroy(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification non trouvée',
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification supprimée',
        ]);
    }
}
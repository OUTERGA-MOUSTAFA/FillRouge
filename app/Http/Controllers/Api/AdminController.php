<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Listing;
use App\Models\Report;
use App\Models\Subscription;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Dashboard - Statistiques clés
     */
    public function statistics(Request $request)
    {
        // Période
        $period = $request->get('period', 'month'); // week, month, year
        $startDate = match($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'year' => now()->subYear(),
            default => now()->subMonth(),
        };
        
        // Statistiques utilisateurs
        $totalUsers = User::count();
        $newUsers = User::where('created_at', '>=', $startDate)->count();
        $verifiedUsers = User::whereNotNull('email_verified_at')->count();
        $premiumUsers = User::where('subscription_plan', 'premium')
            ->where(function($q) {
                $q->whereNull('subscription_ends_at')
                  ->orWhere('subscription_ends_at', '>', now());
            })->count();
        
        // Statistiques annonces
        $totalListings = Listing::count();
        $activeListings = Listing::where('status', 'active')->count();
        $newListings = Listing::where('created_at', '>=', $startDate)->count();
        $featuredListings = Listing::where('is_featured', true)->count();
        
        // Statistiques signalements
        $pendingReports = Report::where('status', 'pending')->count();
        $resolvedReports = Report::where('status', 'resolved')->count();
        
        // Statistiques messages
        $totalMessages = Message::count();
        $messagesToday = Message::whereDate('created_at', today())->count();
        
        // Statistiques revenus
        $totalRevenue = Subscription::where('is_active', true)
            ->where('created_at', '>=', $startDate)
            ->sum('amount');
        
        $revenueByPlan = Subscription::where('is_active', true)
            ->where('created_at', '>=', $startDate)
            ->select('plan', DB::raw('SUM(amount) as total'))
            ->groupBy('plan')
            ->get();
        
        // Évolution des inscriptions (7 derniers jours)
        $usersEvolution = User::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        // Top villes
        $topCities = Listing::select('city', DB::raw('count(*) as count'))
            ->where('city', '!=', '')
            ->groupBy('city')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'users' => [
                    'total' => $totalUsers,
                    'new' => $newUsers,
                    'verified' => $verifiedUsers,
                    'premium' => $premiumUsers,
                    'premium_rate' => $totalUsers > 0 ? round(($premiumUsers / $totalUsers) * 100, 2) : 0,
                    'evolution' => $usersEvolution,
                ],
                'listings' => [
                    'total' => $totalListings,
                    'active' => $activeListings,
                    'new' => $newListings,
                    'featured' => $featuredListings,
                    'active_rate' => $totalListings > 0 ? round(($activeListings / $totalListings) * 100, 2) : 0,
                ],
                'reports' => [
                    'pending' => $pendingReports,
                    'resolved' => $resolvedReports,
                    'resolution_rate' => ($pendingReports + $resolvedReports) > 0 ? 
                        round(($resolvedReports / ($pendingReports + $resolvedReports)) * 100, 2) : 0,
                ],
                'messages' => [
                    'total' => $totalMessages,
                    'today' => $messagesToday,
                ],
                'revenue' => [
                    'total' => $totalRevenue,
                    'by_plan' => $revenueByPlan,
                    'average_per_user' => $premiumUsers > 0 ? round($totalRevenue / $premiumUsers, 2) : 0,
                ],
                'top_cities' => $topCities,
            ]
        ]);
    }
    
    /**
     * Liste des utilisateurs avec filtres
     */
    public function users(Request $request)
    {
        $query = User::with(['profile', 'subscription']);
        
        // Filtres
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('full_name', 'LIKE', "%{$request->search}%")
                  ->orWhere('email', 'LIKE', "%{$request->search}%")
                  ->orWhere('phone', 'LIKE', "%{$request->search}%");
            });
        }
        
        if ($request->status === 'verified') {
            $query->whereNotNull('email_verified_at');
        } elseif ($request->status === 'unverified') {
            $query->whereNull('email_verified_at');
        } elseif ($request->status === 'suspended') {
            $query->whereNotNull('suspended_until')->where('suspended_until', '>', now());
        }
        
        if ($request->plan) {
            $query->where('subscription_plan', $request->plan);
        }
        
        if ($request->city) {
            $query->whereHas('profile', function($q) use ($request) {
                $q->where('city', 'LIKE', "%{$request->city}%");
            });
        }
        
        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        // Tri
        $sortField = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortField, $sortOrder);
        
        $perPage = $request->per_page ?? 20;
        $users = $query->paginate($perPage);
        
        // Ajouter des métadonnées
        $users->getCollection()->transform(function($user) {
            $user->is_suspended = $user->suspended_until && $user->suspended_until->isFuture();
            $user->profile_completion = $user->profile ? $user->profile->getCompletionScore() : 0;
            return $user;
        });
        
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
    
    /**
     * Afficher un utilisateur spécifique
     */
    public function showUser(User $user)
    {
        $user->load([
            'profile',
            'subscription',
            'listings' => function($q) {
                $q->latest()->limit(10);
            },
            'reports' => function($q) {
                $q->latest()->limit(10);
            },
            'reviews' => function($q) {
                $q->latest()->limit(10);
            }
        ]);
        
        // Statistiques utilisateur
        $user->stats = [
            'total_listings' => $user->listings()->count(),
            'active_listings' => $user->listings()->where('status', 'active')->count(),
            'total_messages_sent' => $user->sentMessages()->count(),
            'total_messages_received' => $user->receivedMessages()->count(),
            'total_reviews' => $user->reviews()->count(),
            'average_rating' => $user->reviews()->avg('rating') ?? 0,
            'total_reports' => $user->reports()->count(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }
    
    /**
     * Suspendre un utilisateur
     */
    public function suspendUser(Request $request, User $user)
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:365',
            'reason' => 'nullable|string|max:500',
        ]);
        
        $user->update([
            'suspended_until' => now()->addDays($request->days),
            'suspension_reason' => $request->reason,
        ]);
        
        // Révoquer tous les tokens
        $user->tokens()->delete();
        
        // Désactiver toutes les annonces
        $user->listings()->update(['status' => 'inactive']);
        
        return response()->json([
            'success' => true,
            'message' => "Utilisateur suspendu pour {$request->days} jours",
            'data' => [
                'suspended_until' => $user->suspended_until,
                'reason' => $user->suspension_reason,
            ]
        ]);
    }
    
    /**
     * Lever la suspension
     * unsuspendUser
     */
    public function unsuspendUser(User $user)
    {
        $user->update([
            'suspended_until' => null,
            'suspension_reason' => null,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Suspension levée avec succès'
        ]);
    }
    
    /**
     * Vérifier un utilisateur manuellement
     */
    public function verifyUser(User $user)
    {
        $user->update([
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);
        
        if ($user->profile) {
            $user->profile->update([
                'is_identity_verified' => true,
                'identity_verified_at' => now(),
            ]);
            $user->profile->addBadge('identity_verified');
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Utilisateur vérifié avec succès'
        ]);
    }
    
    /**
     * Supprimer un utilisateur
     */
    public function deleteUser(User $user)
    {
        // Supprimer les fichiers associés
        if ($user->avatar) {
            \Storage::delete($user->avatar);
        }
        
        if ($user->profile && $user->profile->id_document_path) {
            \Storage::delete($user->profile->id_document_path);
        }
        
        // Soft delete
        $user->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé'
        ]);
    }
    
    /**
     * Liste des annonces (admin)
     */
    public function listings(Request $request)
    {
        $query = Listing::with(['user', 'user.profile']);
        
        // Filtres
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'LIKE', "%{$request->search}%")
                  ->orWhere('description', 'LIKE', "%{$request->search}%")
                  ->orWhere('city', 'LIKE', "%{$request->search}%");
            });
        }
        
        if ($request->status) {
            $query->where('status', $request->status);
        }
        
        if ($request->type) {
            $query->where('type', $request->type);
        }
        
        if ($request->city) {
            $query->where('city', 'LIKE', "%{$request->city}%");
        }
        
        if ($request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }
        
        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }
        
        if ($request->reported_only) {
            $query->whereHas('reports', function($q) {
                $q->where('status', 'pending');
            });
        }
        
        // Tri
        $sortField = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortField, $sortOrder);
        
        $perPage = $request->per_page ?? 20;
        $listings = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $listings
        ]);
    }
    
    /**
     * Supprimer une annonce (admin)
     */
    public function deleteListing(Listing $listing)
    {
        // Supprimer les photos
        foreach ($listing->photos as $photo) {
            \Storage::delete($photo);
        }
        
        $listing->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Annonce supprimée'
        ]);
    }
    
    /**
     * Liste des signalements
     */
    public function reports(Request $request)
    {
        $query = Report::with(['reporter', 'reportedUser', 'listing', 'message']);
        
        if ($request->status) {
            $query->where('status', $request->status);
        }
        
        if ($request->type === 'user') {
            $query->whereNotNull('reported_user_id');
        } elseif ($request->type === 'listing') {
            $query->whereNotNull('listing_id');
        } elseif ($request->type === 'message') {
            $query->whereNotNull('message_id');
        }
        
        if ($request->reason) {
            $query->where('reason', $request->reason);
        }
        
        $perPage = $request->per_page ?? 20;
        $reports = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }
    
    /**
     * Résoudre un signalement
     */
    public function resolveReport(Request $request, Report $report)
    {
        $request->validate([
            'action' => 'required|in:ignore,warning,suspend_user,delete_listing,delete_message',
            'note' => 'nullable|string|max:500',
        ]);
        
        $adminId = $request->user()->id;
        
        switch ($request->action) {
            case 'ignore':
                $report->update([
                    'status' => 'rejected',
                    'resolved_by' => $adminId,
                    'resolved_at' => now(),
                    'resolution_note' => $request->note,
                ]);
                break;
                
            case 'warning':
                $report->update([
                    'status' => 'resolved',
                    'resolved_by' => $adminId,
                    'resolved_at' => now(),
                    'resolution_note' => $request->note,
                ]);
                // Envoyer un avertissement à l'utilisateur
                break;
                
            case 'suspend_user':
                if ($report->reported_user_id) {
                    $report->reportedUser->update([
                        'suspended_until' => now()->addDays(30),
                        'suspension_reason' => $request->note ?? 'Signalement validé',
                    ]);
                }
                $report->update([
                    'status' => 'resolved',
                    'resolved_by' => $adminId,
                    'resolved_at' => now(),
                    'resolution_note' => $request->note,
                ]);
                break;
                
            case 'delete_listing':
                if ($report->listing_id) {
                    $report->listing->delete();
                }
                $report->update([
                    'status' => 'resolved',
                    'resolved_by' => $adminId,
                    'resolved_at' => now(),
                    'resolution_note' => $request->note,
                ]);
                break;
                
            case 'delete_message':
                if ($report->message_id) {
                    $report->message->delete();
                }
                $report->update([
                    'status' => 'resolved',
                    'resolved_by' => $adminId,
                    'resolved_at' => now(),
                    'resolution_note' => $request->note,
                ]);
                break;
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Signalement traité',
            'data' => $report
        ]);
    }
    
    /**
     * Statistiques avancées pour rapports
     */
    public function advancedStats(Request $request)
    {
        $startDate = $request->start_date ? now()->parse($request->start_date) : now()->subMonth();
        $endDate = $request->end_date ? now()->parse($request->end_date) : now();
        
        // Taux de conversion
        $conversionRate = [
            'registration_to_verified' => $this->calculateConversionRate(
                User::where('created_at', '>=', $startDate)->count(),
                User::whereNotNull('email_verified_at')->where('created_at', '>=', $startDate)->count()
            ),
            'verified_to_premium' => $this->calculateConversionRate(
                User::whereNotNull('email_verified_at')->where('created_at', '>=', $startDate)->count(),
                User::where('subscription_plan', 'premium')->where('created_at', '>=', $startDate)->count()
            ),
        ];
        
        // Rétention utilisateurs
        $retention = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            
            $newUsers = User::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $activeUsers = User::whereBetween('last_seen_at', [$monthStart, $monthEnd])->count();
            
            $retention[] = [
                'month' => $monthStart->format('M Y'),
                'new_users' => $newUsers,
                'active_users' => $activeUsers,
                'retention_rate' => $newUsers > 0 ? round(($activeUsers / $newUsers) * 100, 2) : 0,
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'conversion_rates' => $conversionRate,
                'user_retention' => $retention,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ]
            ]
        ]);
    }
    
    private function calculateConversionRate($total, $converted)
    {
        if ($total == 0) return 0;
        return round(($converted / $total) * 100, 2);
    }
}
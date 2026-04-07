<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;

class ReviewController extends Controller
{
    /**
     * Mes avis reçus
     */
    public function myReviews(Request $request)
    {
        $user = $request->user();
        
        $reviews = Review::where('reviewed_id', $user->id)
            ->with(['reviewer' => function($q) {
                $q->select('id', 'full_name', 'avatar');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        $stats = [
            'average_rating' => $user->average_rating,
            'total_reviews' => $reviews->total(),
            'rating_distribution' => [
                5 => Review::where('reviewed_id', $user->id)->where('rating', 5)->count(),
                4 => Review::where('reviewed_id', $user->id)->where('rating', 4)->count(),
                3 => Review::where('reviewed_id', $user->id)->where('rating', 3)->count(),
                2 => Review::where('reviewed_id', $user->id)->where('rating', 2)->count(),
                1 => Review::where('reviewed_id', $user->id)->where('rating', 1)->count(),
            ]
        ];
        
        return response()->json([
            'success' => true,
            'data' => [
                'reviews' => $reviews,
                'stats' => $stats
            ]
        ]);
    }
    
    /**
     * Laisser un avis
     */
    public function store(Request $request, User $reviewed)
    {
        $reviewer = $request->user();
        
        if (!Gate::allows('create', [$reviewed])) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas laisser d\'avis à cet utilisateur'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'listing_id' => 'nullable|exists:listings,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Vérifier si un avis existe déjà
        $existingReview = Review::where('reviewer_id', $reviewer->id)
            ->where('reviewed_id', $reviewed->id)
            ->first();
            
        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà laissé un avis pour cet utilisateur'
            ], 400);
        }
        
        $review = Review::create([
            'reviewer_id' => $reviewer->id,
            'reviewed_id' => $reviewed->id,
            'listing_id' => $request->listing_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_visible' => false, // En attente d'accord mutuel
        ]);
        
        // Vérifier si l'autre utilisateur a aussi laissé un avis
        $mutualReview = Review::where('reviewer_id', $reviewed->id)
            ->where('reviewed_id', $reviewer->id)
            ->first();
            
        if ($mutualReview) {
            // Les deux avis deviennent visibles
            $review->publish();
            $mutualReview->publish();
        }
        
        return response()->json([
            'success' => true,
            'message' => $mutualReview ? 
                'Avis publié (accord mutuel)' : 
                'Avis en attente. Il sera publié lorsque l\'autre utilisateur vous aura évalué.',
            'data' => $review
        ], 201);
    }
    
    /**
     * Modifier un avis
     */
    public function update(Request $request, Review $review)
    {
        if (!Gate::allows('update', $review)) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas modifier cet avis'
            ], 403);
        }
        
        if (!$review->canBeEdited()) {
            return response()->json([
                'success' => false,
                'message' => 'Les avis ne peuvent être modifiés que dans les 48h suivant leur création'
            ], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $review->update($validator->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Avis modifié avec succès',
            'data' => $review
        ]);
    }
    
    /**
     * Supprimer un avis
     */
    public function destroy(Review $review)
    {
        if (!Gate::allows('delete', $review)) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas supprimer cet avis'
            ], 403);
        }
        
        $review->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Avis supprimé'
        ]);
    }
    
    /**
     * Avis d'un utilisateur (public)
     */
    public function userReviews(User $user)
    {
        $reviews = Review::where('reviewed_id', $user->id)
            ->where('is_visible', true)
            ->with(['reviewer' => function($q) {
                $q->select('id', 'full_name', 'avatar');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        $stats = [
            'average_rating' => $user->average_rating,
            'total_reviews' => Review::where('reviewed_id', $user->id)->where('is_visible', true)->count(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => [
                'reviews' => $reviews,
                'stats' => $stats
            ]
        ]);
    }
}
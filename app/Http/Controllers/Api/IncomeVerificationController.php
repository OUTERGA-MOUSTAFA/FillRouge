<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IncomeVerification;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class IncomeVerificationController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Soumettre une demande de vérification des revenus
     */
    public function submit(Request $request)
    {
        $user = $request->user();
        
        // Vérifier si déjà en attente
        $existing = IncomeVerification::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'verified'])
            ->first();
            
        if ($existing && $existing->status === 'verified') {
            return response()->json([
                'success' => false,
                'message' => 'Votre revenu est déjà vérifié',
                'data' => ['expires_at' => $existing->expires_at]
            ], 400);
        }
        
        if ($existing && $existing->status === 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà une demande en attente'
            ], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'declared_income' => 'required|numeric|min:0|max:1000000',
            'employer_name' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'employment_duration_months' => 'nullable|integer|min:0|max:600',
            'document' => 'required|file|mimes:pdf,jpeg,png,jpg|max:5120',
            'document_type' => 'required|in:pay_stub,tax_return,employment_letter,bank_statement',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Upload du document
        $path = $this->imageService->upload($request->file('document'), 'income_documents');
        
        $verification = IncomeVerification::create([
            'user_id' => $user->id,
            'declared_income' => $request->declared_income,
            'employer_name' => $request->employer_name,
            'job_title' => $request->job_title,
            'employment_duration_months' => $request->employment_duration_months,
            'document_path' => $path,
            'document_type' => $request->document_type,
            'status' => 'pending',
        ]);
        
        // Notification à l'admin
        // TODO: Envoyer notification
        
        return response()->json([
            'success' => true,
            'message' => 'Demande de vérification soumise avec succès',
            'data' => $verification
        ]);
    }
    
    /**
     * Obtenir le statut de la vérification
     */
    public function status(Request $request)
    {
        $user = $request->user();
        
        $verification = IncomeVerification::where('user_id', $user->id)
            ->latest()
            ->first();
            
        if (!$verification) {
            return response()->json([
                'success' => true,
                'data' => ['status' => 'not_submitted']
            ]);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'status' => $verification->status,
                'declared_income' => $verification->declared_income,
                'income_level' => $verification->income_level,
                'submitted_at' => $verification->created_at,
                'verified_at' => $verification->verified_at,
                'expires_at' => $verification->expires_at,
                'is_valid' => $verification->is_valid,
                'rejection_reason' => $verification->rejection_reason,
            ]
        ]);
    }

    /**
 * Liste des demandes (Admin)
 */
public function list(Request $request)
{
    $query = IncomeVerification::with('user');
    
    if ($request->status) {
        $query->where('status', $request->status);
    }
    
    $perPage = $request->per_page ?? 20;
    $verifications = $query->orderBy('created_at', 'desc')->paginate($perPage);
    
    return response()->json([
        'success' => true,
        'data' => $verifications
    ]);
}

/**
 * Approuver une demande (Admin)
 */
public function approve(Request $request, $id)
{
    $verification = IncomeVerification::findOrFail($id);
    
    $validator = Validator::make($request->all(), [
        'expires_in_days' => 'nullable|integer|min:30|max:730',
    ]);
    
    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }
    
    $expiresInDays = $request->expires_in_days ?? 365;
    
    $verification->update([
        'status' => 'verified',
        'verified_by' => $request->user()->id,
        'verified_at' => now(),
        'expires_at' => now()->addDays($expiresInDays),
    ]);
    
    // Ajouter le badge
    if ($verification->user->profile) {
        $verification->user->profile->addBadge('income_verified');
    }
    
    return response()->json([
        'success' => true,
        'message' => 'Vérification des revenus approuvée',
        'data' => $verification
    ]);
}

/**
 * Rejeter une demande (Admin)
 */
public function reject(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'reason' => 'required|string|max:500',
    ]);
    
    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }
    
    $verification = IncomeVerification::findOrFail($id);
    
    $verification->update([
        'status' => 'rejected',
        'verified_by' => $request->user()->id,
        'rejection_reason' => $request->reason,
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Demande rejetée',
        'data' => $verification
    ]);
}
}
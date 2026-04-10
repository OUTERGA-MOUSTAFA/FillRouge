<?php

namespace App\Services;

use App\Models\User;
use App\Models\Matching;

class MatchingService
{
    /**
     * Calculer le score de compatibilité entre deux utilisateurs
     */
    public function calculateCompatibility(User $user1, User $user2)
    {
        $score = 0;
        $total = 0;

        // 1. Budget (20%)
        if ($user1->budget_min && $user1->budget_max && $user2->budget_min && $user2->budget_max) {
            $budgetOverlap = $this->calculateBudgetOverlap($user1, $user2);
            $score += $budgetOverlap * 20;
            $total += 20;
        }

        // 2. Centres d'intérêt (30%)
        $interestsScore = $this->calculateInterestsScore($user1, $user2);
        $score += $interestsScore * 30;
        $total += 30;

        // 3. Mode de vie (30%)
        $lifestyleScore = $this->calculateLifestyleScore($user1, $user2);
        $score += $lifestyleScore * 30;
        $total += 30;

        // 4. Âge (10%)
        $ageScore = $this->calculateAgeScore($user1, $user2);
        $score += $ageScore * 10;
        $total += 10;

        // 5. Genre préféré (10%)
        $genderScore = $this->calculateGenderScore($user1, $user2);
        $score += $genderScore * 10;
        $total += 10;

        return $total > 0 ? round(($score / $total) * 100) : 0;
    }

    private function calculateBudgetOverlap(User $user1, User $user2)
    {
        $min1 = $user1->budget_min;
        $max1 = $user1->budget_max;
        $min2 = $user2->budget_min;
        $max2 = $user2->budget_max;

        // Vérifier si les budgets se chevauchent
        $overlapMin = max($min1, $min2);
        $overlapMax = min($max1, $max2);

        if ($overlapMin <= $overlapMax) {
            return 1.0;
        }

        // Distance relative
        $distance = min(abs($min1 - $max2), abs($min2 - $max1));
        $range = max($max1 - $min1, $max2 - $min2);

        return max(0, 1 - ($distance / $range));
    }

    private function calculateInterestsScore(User $user1, User $user2)
    {
        $interests1 = $user1->profile->interests ?? [];
        $interests2 = $user2->profile->interests ?? [];

        if (empty($interests1) || empty($interests2)) {
            return 0.5;
        }

        $common = array_intersect($interests1, $interests2);
        $total = max(count($interests1), count($interests2));

        return count($common) / $total;
    }

    private function calculateLifestyleScore(User $user1, User $user2)
    {
        $score = 0;
        $count = 0;

        $profile1 = $user1->profile;
        $profile2 = $user2->profile;

        // Smoking
        if ($profile1->smoking && $profile2->smoking) {
            $score += ($profile1->smoking === $profile2->smoking) ? 1 : 0.5;
            $count++;
        }

        // Pets
        if ($profile1->pets && $profile2->pets) {
            $score += ($profile1->pets === $profile2->pets) ? 1 : 0.7;
            $count++;
        }

        // Sleep schedule
        if ($profile1->sleep_schedule && $profile2->sleep_schedule) {
            $score += ($profile1->sleep_schedule === $profile2->sleep_schedule) ? 1 : 0.6;
            $count++;
        }

        // Cleanliness
        if ($profile1->cleanliness && $profile2->cleanliness) {
            $score += ($profile1->cleanliness === $profile2->cleanliness) ? 1 : 0.7;
            $count++;
        }

        // Social level
        if ($profile1->social_level && $profile2->social_level) {
            $score += ($profile1->social_level === $profile2->social_level) ? 1 : 0.8;
            $count++;
        }

        return $count > 0 ? $score / $count : 0.5;
    }

    private function calculateAgeScore(User $user1, User $user2)
    {
        $profile1 = $user1->profile;
        $profile2 = $user2->profile;

        $age1 = $user1->birth_date ? now()->diffInYears($user1->birth_date) : null;
        $age2 = $user2->birth_date ? now()->diffInYears($user2->birth_date) : null;

        if (!$age1 || !$age2) {
            return 0.5;
        }

        // Vérifier les préférences d'âge
        $pref1Min = $profile1->preferred_min_age;
        $pref1Max = $profile1->preferred_max_age;
        $pref2Min = $profile2->preferred_min_age;
        $pref2Max = $profile2->preferred_max_age;

        $ageOk1 = (!$pref1Min || $age2 >= $pref1Min) && (!$pref1Max || $age2 <= $pref1Max);
        $ageOk2 = (!$pref2Min || $age1 >= $pref2Min) && (!$pref2Max || $age1 <= $pref2Max);

        if ($ageOk1 && $ageOk2) {
            return 1.0;
        } elseif ($ageOk1 || $ageOk2) {
            return 0.6;
        }

        return 0.3;
    }

    private function calculateGenderScore(User $user1, User $user2)
    {
        $profile1 = $user1->profile;
        $profile2 = $user2->profile;

        $pref1 = $profile1->preferred_gender;
        $pref2 = $profile2->preferred_gender;

        if ($pref1 === 'any' && $pref2 === 'any') {
            return 1.0;
        }

        $gender1 = $user1->gender;
        $gender2 = $user2->gender;

        $match1 = ($pref1 === 'any' || $pref1 === $gender2);
        $match2 = ($pref2 === 'any' || $pref2 === $gender1);

        if ($match1 && $match2) {
            return 1.0;
        } elseif ($match1 || $match2) {
            return 0.5;
        }

        return 0;
    }

    /**
     * Générer des recommandations pour un utilisateur
     */
    public function getRecommendations(User $user, $limit = 10)
    {
        // Récupérer les utilisateurs potentiels
        $potentialMatches = User::where('id', '!=', $user->id)
            ->whereHas('profile')
            ->with('profile')
            ->limit(50)
            ->get();

        $recommendations = [];

        foreach ($potentialMatches as $match) {
            // Vérifier si déjà matché
            $existingMatch = Matching::where(function ($q) use ($user, $match) {
                $q->where('user_id', $user->id)->where('matched_user_id', $match->id);
            })->orWhere(function ($q) use ($user, $match) {
                $q->where('user_id', $match->id)->where('matched_user_id', $user->id);
            })->first();

            if (!$existingMatch || $existingMatch->status !== 'blocked') {
                $score = $this->calculateCompatibility($user, $match);

                if ($score >= 50) { // Seuil minimum de compatibilité
                    $recommendations[] = [
                        'user' => $match,
                        'score' => $score,
                        'common_interests' => $this->getCommonInterests($user, $match),
                    ];
                }
            }
        }

        // Trier par score
        usort($recommendations, function ($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return array_slice($recommendations, 0, $limit);
    }

    /**
     * Obtenir les centres d'intérêt communs (PUBLIC)
     */
    public function getCommonInterests(User $user1, User $user2)
    {
        $interests1 = $user1->profile->interests ?? [];
        $interests2 = $user2->profile->interests ?? [];

        return array_intersect($interests1, $interests2);
    }
}

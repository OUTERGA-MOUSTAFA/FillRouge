<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ApiGatewayService
{
    protected array $services = [
        'auth' => 'http://127.0.0.1:5001/api/v1',
        // 'user'     => 'http://127.0.0.1:5002/api/v1',
        // 'listing'  => 'http://127.0.0.1:5003/api/v1',
    ];

    public function forwardTo(string $service, Request $request)
    {
        $baseUrl = $this->services[$service] ?? null;

        if (!$baseUrl) {
            return response()->json(['error' => 'Service not configured'], 503);
        }

        $url = $baseUrl . str_replace('/api/v1', '', $request->path());

        try {
            $httpRequest = Http::withHeaders([
                'Accept'          => 'application/json',
                'Content-Type'    => 'application/json',
                'X-Forwarded-For' => $request->ip(),
            ])->timeout(30);

            // Forward Authorization header if exists
            if ($request->hasHeader('Authorization')) {
                $httpRequest->withToken($request->bearerToken());
            }

            $response = $httpRequest->send(
                $request->method(),
                $url,
                [
                    'json'  => $request->all(),
                    'query' => $request->query(),
                ]
            );

            return response()->json(
                $response->json(),
                $response->status()
            );

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Service unavailable',
                'message' => $e->getMessage()
            ], 503);
        }
    }
}

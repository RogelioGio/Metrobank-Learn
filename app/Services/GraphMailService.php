<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GraphMailService
{
    private $tokenPath;

    public function __construct()
    {
        $this->tokenPath = storage_path('app/msgraph/token.json');
    }

   public function getToken()
{
    if (!file_exists($this->tokenPath)) {
        throw new \Exception('Token file not found. Please authenticate first.');
    }

    $token = json_decode(file_get_contents($this->tokenPath), true);

    // Token expired or no expiry set → refresh
    if (!isset($token['expires_at']) || now()->greaterThan($token['expires_at'])) {
        $newToken = $this->refreshToken($token['refresh_token']);

        if (!$newToken) {
            // 🔑 Reset old file so next run forces re-authentication
            @unlink($this->tokenPath);
            throw new \Exception('Failed to refresh Microsoft Graph token. Token reset. Please re-authenticate.');
        }

        $this->saveToken($newToken);
        return $newToken['access_token'];
    }

    return $token['access_token'];
}
    private function refreshToken($refreshToken)
    {
        $response = Http::asForm()->post('https://login.microsoftonline.com/common/oauth2/v2.0/token', [
            'client_id' => env('MS_GRAPH_CLIENT_ID'),
            'client_secret' => env('MS_GRAPH_CLIENT_SECRET'),
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken,
            'scope' => env('MS_GRAPH_SCOPE'),
        ]);

        if ($response->successful()) {
            return $response->json(); // contains new access_token and refresh_token
        }

        Log::error('❌ Failed to refresh Microsoft Graph token.', $response->json());
        return null;
    }
    private function saveToken(array $token)
    {
        $token['expires_at'] = now()->addSeconds($token['expires_in'])->toDateTimeString();
        file_put_contents($this->tokenPath, json_encode($token, JSON_PRETTY_PRINT));
    }


    public function sendEmail($to, $subject, $htmlBody)
    {
        $accessToken = $this->getToken();

        $payload = [
            'message' => [
                'subject' => $subject,
                'body' => [
                    'contentType' => 'HTML',
                    'content' => $htmlBody,
                ],
                'toRecipients' => [
                    [
                        'emailAddress' => ['address' => $to],
                    ],
                ],
            ]
        ];

        $response = Http::withToken($accessToken)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post('https://graph.microsoft.com/v1.0/me/sendMail', $payload);

        if ($response->status() === 202) {
            return true;
        }

        Log::error('Failed to send email', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return false;
    }

}

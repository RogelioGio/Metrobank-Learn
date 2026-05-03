<?php

namespace App\Services;

use Google\Client as GoogleClient;
use Google\Service\Gmail as GoogleGmail;
use Google\Service\Gmail\Message;

class GmailService
{
    private $service;

    public function __construct()
    {
        $client = new GoogleClient();
        $client->setApplicationName('MBLearn Gmail API');
        $client->setScopes(GoogleGmail::GMAIL_SEND);
        // $client->setAuthConfig([
        //     'client_id' => env('GOOGLE_CLIENT_ID'),
        //     'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        //     'refresh_token' => env('GOOGLE_REFRESH_TOKEN'),
        // ]);
        $client->setAuthConfig(storage_path('app\google\credentials.json'));
        $client->setAccessType('offline');

        $tokenPath = storage_path('app/google/token.json');
        if (file_exists($tokenPath)) {
            $accessToken = json_decode(file_get_contents($tokenPath), true);
            $client->setAccessToken($accessToken);
        } else {
            throw new \Exception('Access token not found. Please authenticate first.');
        }

        // Refresh token if expired
        if ($client->isAccessTokenExpired()) {
        if ($client->getRefreshToken()) {
            $newToken = $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());

            // Check for error
            if (isset($newToken['error'])) {
                throw new \Exception('Failed to refresh token: ' . $newToken['error_description']);
            }

            // Merge refresh token back in if not included in new token
            $updatedToken = array_merge($accessToken, $newToken);

            file_put_contents($tokenPath, json_encode($updatedToken));
            $client->setAccessToken($updatedToken);
        } else {
            throw new \Exception('No refresh token available. Please re-authenticate.');
        }
    }

        $this->service = new GoogleGmail($client);
            }

    public function sendEmail($to, $subject, $bodyText) {
        $strRawMessage = "From: MBLEARN Alert <mblearn.alert@gmail.com>\r\n";
        $strRawMessage .= "To: {$to}\r\n";
        $strRawMessage .= "Subject: {$subject}\r\n";
        $strRawMessage .= "MIME-Version: 1.0\r\n";
        $strRawMessage .= "Content-Type: text/html; charset=utf-8\r\n\r\n";
        $strRawMessage .= "{$bodyText}";

        // Encode to base64url
        $rawMessage = strtr(base64_encode($strRawMessage), ['+' => '-', '/' => '_', '=' => '']);

        $message = new Message();
        $message->setRaw($rawMessage);
        error_log('Message prepared for sending: ' . $rawMessage);

        return $this->service->users_messages->send('me', $message);
    }
}

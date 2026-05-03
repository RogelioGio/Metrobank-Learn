<?php

require 'vendor/autoload.php';

$client = new \Google\Client();
$client->setApplicationName('MBLearn Gmail API');
$client->setScopes([\Google\Service\Gmail::GMAIL_SEND]);
$client->setAuthConfig(__DIR__ . '/../../storage/app/google/credentials.json');
$client->setAccessType('offline');
$client->setPrompt('consent'); // Important to get a refresh token

// Redirect to consent screen
$authUrl = $client->createAuthUrl();
echo "Open this URL in your browser:\n$authUrl\n\n";
echo "Enter verification code here: ";
$authCode = trim(fgets(STDIN));

$accessToken = $client->fetchAccessTokenWithAuthCode($authCode);

// Save token
file_put_contents(__DIR__ . '/../../storage/app/google/token.json', json_encode($accessToken));
echo "Token saved to token.json\n";

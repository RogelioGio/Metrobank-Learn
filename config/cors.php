<?php
//'allowed_origins' => ['http://localhost:3000', "https://connected.mblearn.online"],
return [

    'paths' => ['api/*', 'broadcasting/auth', 'sanctum/csrf-cookie', 'login'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:3000', 'https://connected.mblearn.online', 'https://mb-authoringtool.online'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition'],

    'max_age' => 0,

    'supports_credentials' => true,

];
?>

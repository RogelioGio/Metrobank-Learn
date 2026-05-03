<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PhilSMSService{
    protected $apiKey;
    protected $baseUrl;
    protected $sender_id;

    public function __construct()
    {
        $this->apiKey = config('services.philsms.api_key');
        $this->baseUrl = config('services.philsms.url');
        $this->sender_id = config('services.philsms.sender_id');
    }

    public function send($number, $message){
        $send_data = [];

        //START - Parameters to Change
        //Put the SID here
        $send_data['sender_id'] = $this->sender_id;
        //Put the number or numbers here separated by comma w/ the country code +63
        $send_data['recipient'] = $number;
        //Put message content here
        $send_data['message'] = $message;
        //Put your API TOKEN here
        $token = $this->apiKey;
        //END - Parameters to Change

        //No more parameters to change below.
        $parameters = json_encode($send_data);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $parameters);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $headers = [];
        $headers = array(
            "Content-Type: application/json",
            "Authorization: Bearer $token"
        );
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $get_sms_status = curl_exec($ch);
        curl_close($ch);
        return json_decode($get_sms_status, true);
    }
}
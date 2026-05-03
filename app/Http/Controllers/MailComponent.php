<?php
namespace App\Http\Controllers;

    //use App\Services\GmailService;
    use App\Services\GraphMailService;


    class MailComponent{

        protected $graphService;
        protected $gmailService;

        public function __construct(){
            $this->graphService = new GraphMailService();
            // $this->gmailService = new GmailService();
        }

        //Send with outlook
        public function sendOutlook($to, $subject, $body){
            try{
                $this->graphService->sendEmail($to,$subject,$body);
                return true;
            } catch (\Exception $e) {
            error_log('📭 Outlook send failed: ' . $e->getMessage());
            return false;
            }
        }

        // public function send($to, $subject, $body) {
        //     try {

        //         $this->gmailService->sendEmail($to, $subject, $body);
        //         return true;
        //     } catch (\Exception $e) {
        //         error_log('Mail sending failed: ' . $e->getMessage());
        //         return false;
        //     }
        // }
    }

?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Certificate of Completion</title>
        <style>
            @page {
                margin: 0;
                size: letter landscape;
            }
            @font-face {
            font-family: 'Gilroy';
            src: url('{{ resource_path("fonts/Gilroy-Regular.ttf") }}') format('truetype');
            font-weight: normal;
            }
            @font-face {
                font-family: 'Gilroy';
                src: url('{{ resource_path("fonts/Gilroy-Bold.ttf") }}') format('truetype');
                font-weight: bold;
            }
            body {
                background-image: url("{{ public_path('image/certificate_default.png') }}");
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                width: 11in;
                height: 100%;
                margin: 0;
                padding: 0;
                font-family: 'Gilroy', sans-serif;
                display: relative;
            }
            .content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                width: 100%;
            }
            .signatures {
                display: table;
                width: 100%;
            }
            .signatures > div {
                display: table-cell;
                width: 50%;
                text-align: center;
            }

        </style>
    </head>
    <body>
        <div class="content">
            <div style="margin-bottom: 30px;">
                <!-- <h1 style="font-size: 50px; margin-bottom: 0;">Certificate of Completion</h1>
                <p style="font-size: 20px; margin-top: 5px;">This is to certify that</p>
                <p style="font-size: 20px; margin: 5px 0;">has successfully completed the course</p>
                <p style="font-size: 16px; margin-top: 20px;">Date: {{ date('F j, Y') }}</p> -->
                <img src="{{ public_path('image/Logo_Report.png') }}" alt="Logo" width="150px" class="margin-bottom: 0px;">
                <h1 style="font-size: 40px; margin: 0px;">Certificate of Course Completion</h1>
            </div>
            <div style="margin-top: 10px; margin-bottom:10px ;">
                <div>
                    <p style="margin-bottom: 0px;">presented to</p>
                    <h1 style="font-size: 70px; margin: 0px;">Metrobank Learner</h1>
                    <p style="margin: 0px;">from the course</p>
                    <h1 style="font-size: 30px; margin: 0px;">{{ $CourseName }}</h1>

                </div>
                <div>
                    <p style="margin-bottom: 0px;">This certificate is awarded in recognition of the successful completion of the course requirements. on the given date of</p>
                    <h1 style="font-size: 20px; line-height: 80%;">{{ date('F j, Y') }}</h1>
                </div>
            </div>
            <div style="margin-top: 30px;">
                <p style="margin-bottom: 60px;">this certificate is valid only when signed by the authorized officials</p>
                <div class="signatures">
                    @forelse($creditors as $creditor)
                        <div>
                            @if($creditor->SignatureURL_Path)
                                <img src="{{ $creditor->SignatureURL_Path }}" style="height: 50px;" />
                            @else
                                <p>___________________________</p>
                            @endif

                            <h1 style="font-size: small; margin: 0px;">
                                {{ $creditor->CreditorName ?? 'Personnel Name' }}
                            </h1>
                            <p style="font-size: smaller; margin: 0px;">
                                {{ $creditor->CreditorPosition ?? 'Title and Position' }}
                            </p>
                        </div>
                    @empty
                        @for($i = 0; $i < 3; $i++)
                            <div>
                                <p style="margin: 0px;">_____________________________</p>
                                <h1 style="font-size: small; margin: 0px;">Personnel Name</h1>
                                <p style="font-size: smaller; margin: 0px;">Title and Position</p>
                            </div>
                        @endfor
                    @endforelse
                </div>
            </div>
        </div>
    </body>
</html>
 

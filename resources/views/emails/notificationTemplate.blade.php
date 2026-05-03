<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>MBLearn OTP Account Verification</title>
</head>
<body style="margin:0; padding:0; background-color:hsl(0,0%,95%); font-family: Arial, sans-serif;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center">
                <img src="https://i.imgur.com/vwrf1xG.png" alt="MBLearn Banner" style="max-width: 600px; width: 100%; display: block; border: 0;" />
            </td>
        </tr>
        <tr>
            <td align="center">
                <table width="100%" style="max-width: 600px; background-color: #fff; padding: 20px;">
                    <tr>
                        <td align="left" style="max-width: 600px; border: 1px; line-height: 50%;">
                            <h2 style="margin:0px; color:hsl(218,97%,26%); font-size: x-large">{{$heading}}</h2>
                            <p style="font-size: smaller;">Welcome to MBLearn, Metrobank’s official learning platform!</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center">
                <table width="100%" style="max-width: 600px; background-color: #fff; padding: 20px;">
                    <tr>
                        <td align="left" style="max-width: 600px; border: 1px; font-size: small; line-height: 1.8;">
                            <p style="margin: 0px">{{$shortdesc }}</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="max-width: 600px; border: 1px; font-size: small; line-height: 1.8;">
                            <p style="margin:0 0 8px 0;">{{ $fulldesc }}</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="max-width: 600px; border: 1px; font-size: small; line-height: 1.8;">
                            <p style="margin:0 0 8px 0;">{{$followup}}</p>
                            @if($link)
                                <a href="{{ $link }}">Link Here</a>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center">
                <table width="100%" style="max-width: 600px; background-color: #fff; padding: 20px;">
                    <tr>
                        <td align="left" style="max-width: 600px; border: 1px; font-size: small;">
                            <p style="margin: 0px">Thank you,</p>
                            <p style="font-weight: bold; line-height: 2rem; font-size: medium; color: hsl(218,97%,26%); margin: 0px">MBLearn Support Team</p>
                            <p style="font-style:italic; margin: 0px">Metrobank Learning Management System</p>

                            <p style="color:red;">
                                Note: </br>
                                This is an automated notification. Please do not reply directly to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center">
                <img src="https://i.imgur.com/kv2ADfK.png" alt="MBLearn Banner" style="max-width: 600px; width: 100%; display: block; border: 0;" />
            </td>
        </tr>
    </table>
</body>
</html>

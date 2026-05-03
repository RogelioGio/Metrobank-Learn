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
                        <td align="left" style="max-width: 600px; border: 1px;">
                            <h2 style="margin:0px; color:hsl(218,97%,26%)">Reset Password Request</h2>
                            <p style="font-size: small; line-height: 2rem;">This is to inform you that {{$user_fullName}} - [{{$user_MBEmail}}] has requested a password reset for their MBLearn account.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center">
                <table width="100%" style="max-width: 600px; background-color: #fff; padding: 0px 20px;">
                    <tr>
                        <td align="left" style="max-width: 600px; border: 1px;">
                            <h3 style="margin:0px; color:hsl(218,97%,26%)">Request Details:</h3>
                            <p style="font-size: small;">Employee ID: {{$employeeID}} </p>
                            <p style="font-size: small;">Full Name: {{$user_fullName}} </p>
                            <p style="font-size: small;">Division: {{$division}} </p>
                            <p style="font-size: small;">Department: {{$department}} </p>
                            <p style="font-size: small;">Section: {{$section}} </p>
                            <p style="font-size: small;">Branch City and Location: {{$city}} - {{$location}} </p>
                            <p style="font-size: small;">Account Role: {{$role}} </p>
                            <p style="font-size: small;">Last-Logged in: {{$last_Logged_in}} </p>


                            <p style="font-size: xx-small;">Please review the request and take the appropriate action to reset the password or contact the user if further verification is needed.</p>

                            <p style="font-size: xx-small;">If this request appears suspicious or was not initiated by the user, please escalate it immediately according to your internal security procedures.</p>

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

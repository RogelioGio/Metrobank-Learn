<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Course Collaboration Invitation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #e0e7ff, #f4f4f4);
      font-family: 'Segoe UI', Tahoma, sans-serif;
      color: #333;
    }
    .email-wrapper {
      width: 100%;
      padding: 40px 0;
      background: transparent;
    }
    .email-container {
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }
    .email-header {
      background-color: #003366; /* fallback for Outlook */
      background-image: linear-gradient(90deg, #003366, #004a99);
      padding: 40px 20px;
      text-align: center;
      border-bottom: 3px solid #1a73e8;
    }
    .email-header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      text-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }
    .email-body {
      padding: 35px 30px;
    }
    .email-body h2 {
      font-size: 22px;
      color: #003366;
      margin-top: 0;
      margin-bottom: 20px;
      font-weight: 700;
    }
    .email-body p {
      font-size: 16px;
      line-height: 1.7;
      margin: 16px 0;
      color: #444;
    }
    .cta-button {
      display: block;
      width: fit-content;
      margin: 30px auto 0 auto;
      background-color: #1a73e8;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 30px;
      font-weight: 700;
      font-size: 17px;
      box-shadow: 0 6px 12px rgba(26,115,232,0.4);
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
      text-align: center;
    }
    .cta-button:hover,
    .cta-button:focus {
      background-color: #155ab6;
      box-shadow: 0 8px 20px rgba(21,90,182,0.6);
      outline: none;
    }
    .email-footer {
      background: #003366;
      color: #cbd5e1;
      text-align: center;
      padding: 25px 20px;
      font-size: 14px;
      border-top: 4px solid #1a73e8;
      position: relative;
      box-shadow: inset 0 5px 10px rgba(255,255,255,0.05);
    }
    .email-footer p {
      margin: 5px 0 10px 0;
      font-style: italic;
    }
    .footer-decoration {
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 40px;
      background: #1a73e8;
      border-radius: 0 0 40px 40px;
      box-shadow: 0 8px 20px rgba(26, 115, 232, 0.6);
    }

    @media (max-width: 600px) {
      .email-body, .email-footer {
        padding: 25px 20px;
      }
      .cta-button {
        width: 100%;
        padding: 14px 0;
      }
      .footer-decoration {
        width: 60px;
        height: 30px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      
      <div class="email-header">
        <h1>Metrobank Course Collaboration</h1>
      </div>

      <div class="email-body">
        <h2>Hello {{ $recipientName ?? 'User' }},</h2>
        
        <p>
          We are excited to inform you that <strong>{{ $inviterName }}</strong> has invited you to collaborate on the course titled 
          <strong>“{{ $courseName }}”</strong>.
        </p>

        <p>
          To review the invitation and start collaborating, please log in and view the course <strong>“{{ $courseName }}”</strong>.
        </p>

        <a href="{{ $courseUrl }}" class="cta-button">Check Your Course Invitation</a>

        <p>
          Best regards,<br/>
          <strong>The CompELearn Team</strong>
        </p>
      </div>

      <div class="email-footer">
        <div class="footer-decoration"></div>
        <p>&copy; {{ date('Y') }} Metrobank. All rights reserved.</p>
      </div>
      
    </div>
  </div>
</body>
</html>

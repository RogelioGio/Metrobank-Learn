<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Course Published Notification</title>
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
      color: #fff;
      font-size: 26px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .email-body {
      padding: 35px 30px;
    }
    .email-body h2 {
      font-size: 22px;
      color: #003366;
      margin: 0 0 20px;
    }
    .email-body p {
      font-size: 16px;
      line-height: 1.6;
      color: #444;
      margin: 16px 0;
    }
    .cta-button {
      display: inline-block;
      margin: 30px 0;
      padding: 14px 30px;
      background-color: #1a73e8;
      color: #fff !important;
      text-decoration: none;
      font-weight: bold;
      border-radius: 30px;
      font-size: 16px;
      box-shadow: 0 6px 12px rgba(26, 115, 232, 0.3);
      transition: background-color 0.3s;
    }
    .cta-button:hover {
      background-color: #155ab6;
    }
    .email-footer {
      background: #003366;
      color: #cbd5e1;
      text-align: center;
      padding: 25px 20px;
      font-size: 14px;
      border-top: 4px solid #1a73e8;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>Metrobank Course Published</h1>
      </div>
      <div class="email-body">
        <h2>Hello {{ $first_name ?? 'User' }},</h2>
        <p>
          {{ $messageText }}
        </p>
        <p>
          The course <strong>{{ $courseName }}</strong> is now available for distribution.
        </p>

        <a href="{{ $courseUrl }}" class="cta-button">View Course</a>

        <p>
          Thank you for being part of our distribution team!
        </p>
        <p>
          Sincerely,<br>
          <strong>The Metrobank Team</strong>
        </p>
      </div>
      <div class="email-footer">
        &copy; {{ date('Y') }} Metrobank. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>

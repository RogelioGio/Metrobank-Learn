<!DOCTYPE html>
<html>
<head>
    <title>User Report</title>
    <style>
        /* Base styles */
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            color: #000;
            margin: 20px;
            background-color: #fff;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #000;
            text-align: center;
            border-bottom: 1px solid #999;
            padding-bottom: 6px;
        }
        .section {
            margin-bottom: 20px;
            font-size: 14px;
            color: #000;
        }
        .section strong {
            font-weight: 600;
        }

        /* Table styles */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            color: #000;
        }
        thead th {
            background-color: #d9d9d9;
            color: #000;
            font-weight: 600;
            padding: 6px 8px;
            text-align: left;
            border: 1px solid #bfbfbf;
        }
        tbody tr:nth-child(odd) {
            background-color: #fff;
        }
        tbody tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        tbody tr:hover {
            background-color: #d0d0d0;
        }
        th, td {
            border: 1px solid #bfbfbf;
            padding: 6px 8px;
            vertical-align: top;
        }

        /* Nested details table */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 4px;
        }
        .details-table th, .details-table td {
            border: none;
            padding: 2px 6px;
            vertical-align: top;
            color: #000;
        }
        .details-table th {
            width: 30%;
            font-weight: 600;
            white-space: nowrap;
        }
        .details-table td {
            word-break: break-word;
        }

        /* Responsive print adjustments */
        @media print {
            thead th {
                position: static !important;
            }
            tbody tr:hover {
                background-color: transparent !important;
            }
        }
    </style>
</head>
<body>

    <h1>CompELearn User Report</h1>

    <div class="section">
        <strong>User:</strong>
        {{ trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: 'Unknown' }}<br>
        <strong>Report Date:</strong> {{ now()->timezone('Asia/Manila')->format('F j, Y, g:i a') }}
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 40px;">#</th>
                <th style="width: 20%;">Action</th>
                <th style="width: 160px;">Timestamp</th>
                <th>Details</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($actions as $index => $action)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $action->Action }}</td>
                    <td>{{ \Carbon\Carbon::parse($action->created_at)->timezone('Asia/Manila')->format('F j, Y, g:i A') }}</td>
                    <td>
                        @if (is_array($action->Details) && count($action->Details) > 0)
                            <table class="details-table" role="presentation">
                                @foreach ($action->Details as $key => $value)
                                    <tr>
                                        <th>{{ ucwords(str_replace(['_', '-'], ' ', $key)) }}</th>
                                        <td>
                                            @if (is_array($value))
                                                <pre style="margin:0; white-space: pre-wrap;">{{ json_encode($value, JSON_PRETTY_PRINT) }}</pre>
                                            @else
                                                {{ $value }}
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </table>
                        @else
                            <em>No details available.</em>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>

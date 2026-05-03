<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Course Overview - {{ $course->CourseName }}</title>
<style>
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
        font-family: 'Gilroy', sans-serif;
        margin: 0;
        padding: 0;
        background: #f9f9f9;
        color: #333;
        line-height: 1.6;
    }
    .container {
        max-width: 900px;
        margin: 30px auto;
        background: white;
        padding: 30px 50px;
        box-shadow: 0 0 12px rgba(0,0,0,0.1);
        border-radius: 8px;
    }
    header {
        text-align: center;
        margin-bottom: 30px;
    }
    header img {
        max-width: 150px;
        margin-bottom: 20px;
    }
    header h1 {
        font-weight: 700;
        font-size: 28px;
        margin-bottom: 5px;
        color: #005baa;
    }
    .course-meta {
        font-size: 14px;
        color: #666;
        margin-bottom: 30px;
        text-align: center;
    }
    h2 {
        border-bottom: 2px solid #005baa;
        padding-bottom: 8px;
        margin-top: 40px;
        margin-bottom: 15px;
        color: #005baa;
        font-weight: 700;
    }
    p, ul {
        font-size: 16px;
    }
    ul {
        padding-left: 20px;
    }
    ul li {
        margin-bottom: 10px;
    }
    .course-image {
        display: block;
        margin: 20px auto;
        max-width: 300px;
        border-radius: 8px;
        box-shadow: 0 0 8px rgba(0,0,0,0.15);
    }

    /* Lessons and Tests container */
    ul.lessons-list,
    ul.tests-list {
        list-style: none;
        padding-left: 0;
        margin: 0;
    }

    .lessons-list li,
    .tests-list li {
        border: 1px solid #ddd;
        padding: 15px 20px;
        margin-bottom: 20px;
        border-radius: 6px;
        background: #fafafa;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .lessons-list li strong,
    .tests-list li strong {
        display: block;
        margin-bottom: 8px;
        color: #005baa;
        font-size: 18px;
    }

    .lessons-list li p,
    .tests-list li p {
        margin: 8px 0;
        font-size: 16px;
        line-height: 1.4;
    }

    /* Smaller heading for tests inside tests list */
    h3 {
        margin-top: 40px;
        color: #004080;
        font-weight: 600;
        font-size: 20px;
    }

    /* Tests section concise style */
    .tests-list li {
        padding: 12px 18px;
        margin-bottom: 15px;
        font-size: 15px;
        line-height: 1.3;
    }

    .tests-list li strong {
        font-size: 16px;
        margin-bottom: 6px;
        color: #0073e6;
    }

    .tests-list li ul {
        list-style: disc inside;
        margin-top: 6px;
        padding-left: 20px;
        font-size: 14px;
    }

    .tests-list li ul li {
        margin-bottom: 4px;
    }

    /* Correct answers styled inline and smaller */
    .correct-answers {
        font-weight: 600;
        font-size: 14px;
        color: #1a7f1a;
        margin-top: 8px;
        line-height: 1.2;
    }

</style>
</head>
<body>

<div class="container">
    <header>
        @if(!empty($course->ImagePath))
            <img src="{{ $course->ImagePath }}" alt="Course Thumbnail" class="course-image" />
        @else
            <div class="course-image-placeholder">
                No Course Image Available
            </div>
        @endif

        <h1>{{ $course->CourseName }}</h1>
        <div class="course-meta">
            <p>
                <strong>Course ID:</strong> {{ $course->CourseID }} | 
                <strong>Status:</strong> {{ ucfirst($course->CourseStatus) }} | 
                <strong>Training Type:</strong> {{ ucfirst($course->TrainingType) }} | 
                <strong>Career Level:</strong> {{ $course->careerLevel->name ?? 'N/A' }}
            </p>
            <p><strong>Category:</strong> {{ $course->category->category_name ?? 'N/A' }}</p>
        </div>
    </header>

    <section>
        <h2>Course Overview</h2>
        <div>{!! $course->Overview !!}</div>
    </section>

    <section>
        <h2>Course Objectives</h2>
        <div>{!! $course->Objective !!}</div>
    </section>


    @php
        function extractParagraphText($node) {
            $text = '';

            if (!is_array($node)) return '';

            if (isset($node['textType']) && $node['textType'] === 'paragraph' && isset($node['content'])) {
                foreach ($node['content'] as $child) {
                    if (isset($child['type']) && $child['type'] === 'text' && isset($child['text'])) {
                        $text .= $child['text'] . ' ';
                    }
                }
                $text .= "\n";
            }
            else if (isset($node['content']) && is_array($node['content'])) {
                foreach ($node['content'] as $child) {
                    $text .= extractParagraphText($child);
                }
            }

            return $text;
        }
    @endphp 

    <section>
        <h2>Lessons</h2>
        @if($course->lessons->count())
            <ul class="lessons-list">
                @foreach($course->lessons as $lesson)
                    @php
                        $content = json_decode($lesson->LessonContentAsJSON, true);
                        $plainText = extractParagraphText($content);
                    @endphp

                    <li>
                        <strong>{{ $lesson->LessonName }}</strong>
                        <p>{{ $lesson->LessonDescription }}</p>

                        <p><strong>Content:</strong></p>
                        <p>{{ $plainText ?: 'No text content available.' }}</p>
                    </li>
                @endforeach
            </ul>
        @else
            <p>No lessons available.</p>
        @endif 
    </section>

    @php
    function getCorrectAnswers($choices) {
        $correct = [];
        foreach ($choices as $choice) {
            if (is_array($choice)) {
                if (!empty($choice['isCorrect']) && $choice['isCorrect'] === true) {
                    $correct[] = $choice['text'] ?? '[No text]';
                }
            } elseif (is_object($choice)) {
                if (property_exists($choice, 'isCorrect') && $choice->isCorrect === true) {
                    $correct[] = $choice->text ?? '[No text]';
                }
            }
        }
        return implode(', ', $correct);
    }
    @endphp

    <section>
        <h2>Tests</h2>
        @foreach($course->tests as $test)
            <h3>{{ $test->TestName }}</h3>
            <p>{{ $test->TestDescription }}</p>

            @if($test->customBlocks->isNotEmpty())
                <ul class="tests-list">
                    @foreach($test->customBlocks as $block)
                        @php
                            $blockData = $block->BlockData;
                        @endphp

                        @if(isset($blockData['question']) || isset($blockData->question))
                            @php
                                $questionText = $blockData['question'] ?? $blockData->question ?? 'No question text';
                                $choices = $blockData['choices'] ?? $blockData->choices ?? [];
                                $correctAnswers = getCorrectAnswers($choices);
                            @endphp

                            <li>
                                <strong>Question:</strong> {{ $questionText }}

                                @if(!empty($choices) && is_array($choices))
                                    <ul>
                                        @foreach($choices as $choice)
                                            <li>{{ is_array($choice) ? ($choice['text'] ?? '[No text]') : (property_exists($choice, 'text') ? $choice->text : '[No text]') }}</li>
                                        @endforeach
                                    </ul>
                                @endif

                                <p class="correct-answers"><strong>Correct Answer(s):</strong> {{ $correctAnswers ?: 'No correct answer provided' }}</p>
                            </li>
                        @else
                            <li>Unstructured question block</li>
                        @endif
                    @endforeach
                </ul>
            @else
                <p>No questions available for this test.</p>
            @endif
        @endforeach
    </section>

    <section>
        <h2>Additional Details</h2>
        <p><strong>Lesson Count:</strong> {{ $course->lessons->count() }}</p>
        <p><strong>Test Count:</strong> {{ $course->tests->count() }}</p>
        <p><strong>Created At:</strong> {{ \Carbon\Carbon::parse($course->created_at)->format('F j, Y') }}</p>
        <p><strong>Last Updated:</strong> {{ \Carbon\Carbon::parse($course->updated_at)->format('F j, Y') }}</p>
        <p><strong>Course Owner:</strong> {{ $course->userInfo->first_name ?? '' }} {{ $course->userInfo->middle_name ?? '' }} {{ $course->userInfo->last_name ?? '' }} (Employee ID: {{ $course->userInfo->employeeID ?? 'N/A' }})</p>
    </section>
</div>
</body>
</html>

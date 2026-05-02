<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$recipientEmail = 'kontakt@francisco-naranjo.de';
$fromEmail = 'kontakt@francisco-naranjo.de';
$fromName = 'Francisco Naranjo Website';

function jsonResponse(int $statusCode, array $payload): never
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function cleanHeader(string $value): string
{
    return trim(str_replace(["\r", "\n"], '', $value));
}

function cleanText(string $value, int $maxLength): string
{
    $value = trim($value);
    $value = str_replace("\0", '', $value);

    if (function_exists('mb_strlen') && mb_strlen($value, 'UTF-8') > $maxLength) {
        $value = mb_substr($value, 0, $maxLength, 'UTF-8');
    } elseif (strlen($value) > $maxLength) {
        $value = substr($value, 0, $maxLength);
    }

    return $value;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(200, [
        'success' => true
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, [
        'success' => false,
        'error' => 'Method not allowed. Contact form must use POST.'
    ]);
}

if (
    !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL) ||
    !filter_var($fromEmail, FILTER_VALIDATE_EMAIL)
) {
    jsonResponse(500, [
        'success' => false,
        'error' => 'Mail address is not configured correctly'
    ]);
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody ?: '', true);

if (!is_array($data)) {
    $data = $_POST;
}

$name = cleanText((string)($data['name'] ?? ''), 120);
$email = cleanHeader(cleanText((string)($data['email'] ?? ''), 254));
$message = cleanText((string)($data['message'] ?? ''), 5000);
$source = cleanText((string)($data['source'] ?? 'website-contact-form'), 80);

// Optional honeypot field
$website = cleanText((string)($data['website'] ?? ''), 500);

if ($website !== '') {
    jsonResponse(200, [
        'success' => true
    ]);
}

if (
    strlen($name) < 2 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    strlen($message) < 10
) {
    jsonResponse(400, [
        'success' => false,
        'error' => 'Invalid input data'
    ]);
}

$ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
$submittedAt = date('Y-m-d H:i:s');

$subject = cleanHeader('Neue Portfolio-Anfrage von ' . $name);

$mailBody = <<<BODY
Neue Nachricht über das Kontaktformular

Name: {$name}
E-Mail: {$email}
Quelle: {$source}
Zeitpunkt: {$submittedAt}
IP: {$ipAddress}
Browser: {$userAgent}

Nachricht:
{$message}
BODY;

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . cleanHeader($fromName) . ' <' . $fromEmail . '>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'Return-Path: ' . $fromEmail;

$sent = mail(
    $recipientEmail,
    $subject,
    $mailBody,
    implode("\r\n", $headers),
    '-f' . $fromEmail
);

if (!$sent) {
    jsonResponse(500, [
        'success' => false,
        'error' => 'Mail delivery failed'
    ]);
}

jsonResponse(200, [
    'success' => true,
    'message' => 'Message sent successfully'
]);
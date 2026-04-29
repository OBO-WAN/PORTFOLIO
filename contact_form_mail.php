<?php

declare(strict_types=1);

// JSON response for the frontend contact form.
header('Content-Type: application/json; charset=utf-8');

// Optional CORS configuration.
// For normal same-domain hosting, no CORS entry is needed.
// Add your production domain here only if the frontend and PHP endpoint are on different origins.
$allowedOrigins = [
    // Same-domain hosting usually does not require CORS entries.
    // Add these only if the frontend is served from a different origin:
    // 'https://naranjo.io',
    // 'https://www.naranjo.io',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ------------------------------------------------------------
// WICHTIG:
// Diese Adresse muss vor dem Deployment durch deine echte
// Empfangs-/Absenderadresse ersetzt werden.
// Nutze idealerweise eine Mailbox deiner eigenen Domain,
// z. B. kontakt@deine-domain.de.
// ------------------------------------------------------------
$siteEmail = 'francisco@naranjo.io';

function jsonResponse(int $statusCode, array $payload): never
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(200, ['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, ['success' => false, 'error' => 'Method not allowed']);
}

if (!filter_var($siteEmail, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(500, ['success' => false, 'error' => 'Server email is not configured']);
}

$json = file_get_contents('php://input');
$params = json_decode($json ?? '', true);

if (json_last_error() !== JSON_ERROR_NONE || !is_array($params)) {
    jsonResponse(400, ['success' => false, 'error' => 'Invalid JSON']);
}

$email = trim((string)($params['email'] ?? ''));
$name = trim((string)($params['name'] ?? ''));
$userMessage = trim((string)($params['message'] ?? ''));
$source = trim((string)($params['source'] ?? 'website-contact-form'));

if (
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    mb_strlen($name) < 2 ||
    mb_strlen($userMessage) < 10 ||
    mb_strlen($name) > 120 ||
    mb_strlen($email) > 254 ||
    mb_strlen($userMessage) > 5000
) {
    jsonResponse(400, ['success' => false, 'error' => 'Invalid input data']);
}

$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safeSource = htmlspecialchars($source, ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($userMessage, ENT_QUOTES, 'UTF-8'));

$recipient = $siteEmail;
$subject = 'Website Contact Form';

$mailBody = "
    <strong>Name:</strong> {$safeName}<br>
    <strong>Email:</strong> {$safeEmail}<br>
    <strong>Source:</strong> {$safeSource}<br><br>
    <strong>Message:</strong><br>
    {$safeMessage}
";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/html; charset=utf-8';
$headers[] = 'From: Website Kontakt <' . $siteEmail . '>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'Return-Path: ' . $siteEmail;

$success = mail(
    $recipient,
    $subject,
    $mailBody,
    implode("\r\n", $headers),
    '-f' . escapeshellarg($siteEmail)
);

if (!$success) {
    jsonResponse(500, ['success' => false, 'error' => 'Mail delivery failed']);
}

jsonResponse(200, ['success' => true]);

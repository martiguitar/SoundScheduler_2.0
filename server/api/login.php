<?php
require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_out(['error' => 'Method not allowed'], 405);
}

$body = read_json_body();
$username = trim($body['username'] ?? '');
$password = $body['password'] ?? '';

$envUser = $_ENV['ADMIN_USERNAME'] ?? '';
$envHash = $_ENV['ADMIN_PASSWORD_HASH'] ?? '';

if ($username !== $envUser || empty($envHash) || !password_verify($password, $envHash)) {
  usleep(300000); // slow down brute-force
  json_out(['error' => 'Unauthorized'], 401);
}

session_regenerate_id(true);
$_SESSION['admin'] = true;

json_out(['ok' => true]);

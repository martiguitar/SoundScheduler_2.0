<?php
// server/api/bootstrap.php
// Minimal bootstrap: env loading, CORS, secure session, helpers

// --- Simple .env loader (no external deps) ---
function env_load(string $path): void {
  if (!file_exists($path)) return;
  $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    if (str_starts_with(trim($line), '#')) continue;
    $pos = strpos($line, '=');
    if ($pos === false) continue;
    $key = trim(substr($line, 0, $pos));
    $val = trim(substr($line, $pos + 1));
    $val = trim($val, "\"' ");
    $_ENV[$key] = $val;
  }
}

// Load env from project root server/.env if present
$envPath = __DIR__ . '/../.env';
env_load($envPath);

// --- Paths & Config ---
$DATA_DIR   = rtrim($_ENV['DATA_DIR'] ?? (__DIR__ . '/../data'), '/');
$UPLOAD_DIR = rtrim($_ENV['UPLOAD_DIR'] ?? (__DIR__ . '/../uploads/sounds'), '/');
$BASE_URL   = rtrim($_ENV['BASE_URL'] ?? '', '/'); // e.g., https://yourdomain
$CORS_ALLOWED_ORIGINS = $_ENV['CORS_ALLOWED_ORIGINS'] ?? '*';
$SESSION_NAME = $_ENV['SESSION_NAME'] ?? 'ss_admin';
$COOKIE_SAMESITE = $_ENV['COOKIE_SAMESITE'] ?? 'Strict';

// Ensure directories exist
@mkdir($DATA_DIR, 0775, true);
@mkdir($UPLOAD_DIR, 0775, true);

// --- CORS ---
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowOrigin = '';
if ($CORS_ALLOWED_ORIGINS === '*') {
  $allowOrigin = '*';
} else {
  $allowed = array_map('trim', explode(',', $CORS_ALLOWED_ORIGINS));
  // Allow explicit matches, including literal 'null' origin if configured
  if ($origin !== '' && in_array($origin, $allowed, true)) {
    $allowOrigin = $origin;
  } elseif ($origin === '' && !empty($BASE_URL)) {
    // No Origin header (e.g., same-origin/fetch, curl) -> fall back to BASE_URL
    $allowOrigin = $BASE_URL;
  } elseif ($origin === 'null' && in_array('null', $allowed, true)) {
    $allowOrigin = 'null';
  }
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Origin: ' . ($allowOrigin ?: ''));
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, If-Match, X-Requested-With');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// --- Secure session ---
session_name($SESSION_NAME);
session_set_cookie_params([
  'lifetime' => 60 * 60 * 8, // 8h
  'path' => '/',
  'domain' => '',
  'secure' => (!empty($_ENV['COOKIE_SECURE']) ? $_ENV['COOKIE_SECURE'] === 'true' : isset($_SERVER['HTTPS'])),
  'httponly' => true,
  'samesite' => $COOKIE_SAMESITE,
]);
session_start();

// --- Helpers ---
function json_out($data, int $code = 200, array $headers = []): void {
  foreach ($headers as $k => $v) header($k . ': ' . $v);
  header('Content-Type: application/json; charset=utf-8');
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_SLASHES);
  exit;
}

function read_json_body(): array {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function require_admin(): void {
  if (empty($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    json_out(['error' => 'Unauthorized'], 401);
  }
}

function manifest_path(): string {
  global $DATA_DIR;
  return $DATA_DIR . '/manifest.json';
}

function manifest_read(): array {
  $path = manifest_path();
  if (!file_exists($path)) {
    return [
      'version' => 1,
      'sounds' => [],
      'schedules' => [],
    ];
  }
  $json = file_get_contents($path);
  $data = json_decode($json, true);
  if (!is_array($data)) {
    $data = ['version' => 1, 'sounds' => [], 'schedules' => []];
  }
  return $data;
}

function manifest_write(callable $mutator, ?int $expectedVersion = null): array {
  $path = manifest_path();
  $fp = fopen($path, 'c+');
  if (!$fp) json_out(['error' => 'Cannot open manifest'], 500);

  try {
    if (!flock($fp, LOCK_EX)) json_out(['error' => 'Lock failed'], 500);

    // read current
    $size = filesize($path);
    $content = $size > 0 ? fread($fp, $size) : '';
    $data = $content ? json_decode($content, true) : null;
    if (!is_array($data)) $data = ['version' => 1, 'sounds' => [], 'schedules' => []];

    if ($expectedVersion !== null && (($data['version'] ?? 0) !== $expectedVersion)) {
      // version mismatch
      flock($fp, LOCK_UN);
      fclose($fp);
      json_out(['error' => 'Version mismatch', 'currentVersion' => $data['version'] ?? 0], 409);
    }

    // mutate
    $new = $mutator($data);
    if (is_array($new)) $data = $new;

    // bump version
    $data['version'] = ($data['version'] ?? 0) + 1;

    // truncate + write
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $data;
  } catch (Throwable $e) {
    if (is_resource($fp)) {
      @flock($fp, LOCK_UN);
      @fclose($fp);
    }
    json_out(['error' => 'Write failed', 'details' => $e->getMessage()], 500);
  }
}

function file_public_url(string $relativePath): string {
  global $BASE_URL;
  if ($BASE_URL) return $BASE_URL . '/' . ltrim($relativePath, '/');
  // Fallback: relative URL from server root
  return '/' . ltrim($relativePath, '/');
}

function uuidv4(): string {
  $data = random_bytes(16);
  // Set version to 0100
  $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
  // Set bits 6-7 to 10
  $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
  return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function allowed_audio_mimes(): array {
  return [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/mp4',
    'audio/x-m4a',
  ];
}

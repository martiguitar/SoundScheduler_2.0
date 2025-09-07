<?php
require __DIR__ . '/bootstrap.php';

// Allow POST (normal) and GET (fallback), plus handle OPTIONS preflight upstream
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
  json_out(['error' => 'Method not allowed'], 405);
}

// Clear session data
$_SESSION = [];
if (ini_get('session.use_cookies')) {
  $params = session_get_cookie_params();
  // Primary cookie clear with current params
  setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
  // Also attempt common path variants to be safe
  $paths = ['/', '/server', '/server/api'];
  foreach ($paths as $p) {
    setcookie(session_name(), '', time() - 42000, $p, $params['domain'], $params['secure'], $params['httponly']);
  }
}
@session_destroy();

json_out(['ok' => true]);

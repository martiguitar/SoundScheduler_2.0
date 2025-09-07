<?php
require __DIR__ . '/bootstrap.php';

// Returns simple auth status for the current session
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  json_out(['error' => 'Method not allowed'], 405);
}

$authenticated = !empty($_SESSION['admin']) && $_SESSION['admin'] === true;
json_out(['authenticated' => $authenticated]);

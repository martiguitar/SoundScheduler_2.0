<?php
require __DIR__ . '/bootstrap.php';

// GET manifest with version
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $data = manifest_read();
  $etag = (string)($data['version'] ?? 0);
  header('ETag: ' . $etag);
  // Client-side cache revalidation
  $ifNoneMatch = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';
  if ($ifNoneMatch !== '' && $ifNoneMatch === $etag) {
    http_response_code(304);
    exit;
  }
  json_out($data);
}

json_out(['error' => 'Method not allowed'], 405);

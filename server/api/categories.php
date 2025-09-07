<?php
require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

// If it's a GET without an action, return categories as-is from manifest
if ($method === 'GET' && !isset($_GET['action'])) {
  $data = manifest_read();
  $etag = (string)($data['version'] ?? 0);
  header('ETag: ' . $etag);
  json_out([
    'version' => $data['version'] ?? 0,
    'categories' => array_values($data['categories'] ?? []),
  ]);
}

// Allow POST normally. Also allow GET when an action is explicitly provided (to bypass WAFs blocking POST bodies).
if ($method !== 'POST' && !isset($_GET['action'])) {
  json_out(['error' => 'Method not allowed'], 405);
}

require_admin();
$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$body = $_POST;
if (empty($body)) {
  $body = read_json_body();
}

// Also support id via query if not present in body
if (!array_key_exists('id', $body) && isset($_GET['id'])) {
  $body['id'] = $_GET['id'];
}

$expectedVersion = null;
$ifMatch = $_SERVER['HTTP_IF_MATCH'] ?? '';
if ($ifMatch !== '') {
  $expectedVersion = (int)$ifMatch;
}

switch ($action) {
  case 'insert': {
    $name = trim($body['name'] ?? '');
    $display_order = (int)($body['display_order'] ?? 0);
    if ($name === '') json_out(['error' => 'Missing name'], 400);

    $result = manifest_write(function(array $data) use ($name, $display_order) {
      $id = uuidv4();
      if (!isset($data['categories'])) $data['categories'] = [];
      $data['categories'][] = [
        'id' => $id,
        'name' => $name,
        'display_order' => $display_order,
      ];
      return $data;
    }, $expectedVersion);

    $new = end($result['categories']);
    json_out(['version' => $result['version'], 'category' => $new], 201);
  }

  case 'update': {
    $id = trim($body['id'] ?? '');
    if ($id === '') json_out(['error' => 'Missing id'], 400);

    $result = manifest_write(function(array $data) use ($id, $body) {
      foreach ($data['categories'] ?? [] as &$c) {
        if ($c['id'] === $id) {
          // Update known fields (no color handling)
          if (array_key_exists('name', $body)) {
            $c['name'] = $body['name'];
          }
          if (array_key_exists('display_order', $body)) {
            $c['display_order'] = (int)$body['display_order'];
          }
          return $data;
        }
      }
      json_out(['error' => 'Not found'], 404);
    }, $expectedVersion);

    $updated = null;
    foreach ($result['categories'] as $c) if ($c['id'] === $id) { $updated = $c; break; }
    json_out(['version' => $result['version'], 'category' => $updated]);
  }

  case 'delete': {
    $id = trim($body['id'] ?? '');
    if ($id === '') json_out(['error' => 'Missing id'], 400);

    $result = manifest_write(function(array $data) use ($id) {
      $cats = $data['categories'] ?? [];
      $found = null;
      foreach ($cats as $i => $c) {
        if ($c['id'] === $id) { $found = $c; unset($cats[$i]); break; }
      }
      if ($found === null) json_out(['error' => 'Not found'], 404);
      $data['categories'] = array_values($cats);
      // Remove category assignment from sounds
      foreach ($data['sounds'] ?? [] as &$s) {
        if (($s['category_id'] ?? null) === $id) {
          $s['category_id'] = null;
        }
      }
      return $data;
    }, $expectedVersion);

    json_out(['version' => $result['version'], 'ok' => true]);
  }

  default:
    json_out(['error' => 'Unknown action'], 400);
}

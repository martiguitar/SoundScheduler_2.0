<?php
require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $data = manifest_read();
  $etag = (string)($data['version'] ?? 0);
  header('ETag: ' . $etag);
  json_out([
    'version' => $data['version'] ?? 0,
    'schedules' => $data['schedules'] ?? [],
  ]);
}

if ($method !== 'POST') {
  json_out(['error' => 'Method not allowed'], 405);
}

require_admin();
$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$body = $_POST;
if (empty($body)) {
  // Allow JSON body too
  $body = read_json_body();
}

$expectedVersion = null;
$ifMatch = $_SERVER['HTTP_IF_MATCH'] ?? '';
if ($ifMatch !== '') {
  $expectedVersion = (int)$ifMatch;
}

switch ($action) {
  case 'insert': {
    $sound_id = trim($body['sound_id'] ?? '');
    $time = trim($body['time'] ?? '');
    $active = (bool)($body['active'] ?? true);

    if ($sound_id === '' || $time === '') {
      json_out(['error' => 'Missing fields'], 400);
    }

    $result = manifest_write(function(array $data) use ($sound_id,$time,$active) {
      // ensure sound exists
      $exists = false;
      foreach ($data['sounds'] as $s) if ($s['id'] === $sound_id) { $exists = true; break; }
      if (!$exists) json_out(['error' => 'Sound not found'], 404);

      $id = uuidv4();
      $data['schedules'][] = [
        'id' => $id,
        'sound_id' => $sound_id,
        'time' => $time,
        'active' => $active,
        'last_played' => null,
      ];
      return $data;
    }, $expectedVersion);

    $new = end($result['schedules']);
    json_out(['version' => $result['version'], 'schedule' => $new], 201);
  }

  case 'update': {
    $id = trim($body['id'] ?? '');
    if ($id === '') json_out(['error' => 'Missing id'], 400);

    $result = manifest_write(function(array $data) use ($id, $body) {
      foreach ($data['schedules'] as &$sch) {
        if ($sch['id'] === $id) {
          foreach (['time','active','last_played','sound_id'] as $field) {
            if (array_key_exists($field, $body)) {
              $sch[$field] = $body[$field];
            }
          }
          return $data;
        }
      }
      json_out(['error' => 'Not found'], 404);
    }, $expectedVersion);

    $updated = null;
    foreach ($result['schedules'] as $sch) if ($sch['id'] === $id) { $updated = $sch; break; }
    json_out(['version' => $result['version'], 'schedule' => $updated]);
  }

  case 'delete': {
    $id = trim($body['id'] ?? '');
    if ($id === '') json_out(['error' => 'Missing id'], 400);

    $result = manifest_write(function(array $data) use ($id) {
      $schs = $data['schedules'] ?? [];
      $found = false;
      foreach ($schs as $i => $sch) {
        if ($sch['id'] === $id) { unset($schs[$i]); $found = true; break; }
      }
      if (!$found) json_out(['error' => 'Not found'], 404);
      $data['schedules'] = array_values($schs);
      return $data;
    }, $expectedVersion);

    json_out(['version' => $result['version'], 'ok' => true]);
  }

  default:
    json_out(['error' => 'Unknown action'], 400);
}

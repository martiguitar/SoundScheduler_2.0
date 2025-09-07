<?php
require __DIR__ . '/bootstrap.php';

// Returns embedded cover image from an MP3/Audio file using minimal ID3v2 APIC parsing.
// Usage: GET /server/api/cover.php?file=<basename>
// Security: Only allows files within UPLOAD_DIR and only by basename.

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  json_out(['error' => 'Method not allowed'], 405);
}

$file = $_GET['file'] ?? '';
$file = basename($file);
if ($file === '' ) {
  json_out(['error' => 'Missing file parameter'], 400);
}

$full = rtrim($UPLOAD_DIR, '/') . '/' . $file;
if (!is_file($full)) {
  http_response_code(404);
  exit;
}

$fp = fopen($full, 'rb');
if (!$fp) {
  http_response_code(404);
  exit;
}

// Read ID3v2 header
$header = fread($fp, 10);
if (strlen($header) < 10 || substr($header, 0, 3) !== 'ID3') {
  fclose($fp);
  http_response_code(404);
  exit;
}
$ver = ord($header[3]); // 3 or 4
$flags = ord($header[5]);
$size = (ord($header[6]) & 0x7F) << 21 | (ord($header[7]) & 0x7F) << 14 | (ord($header[8]) & 0x7F) << 7 | (ord($header[9]) & 0x7F);

// Extended header skip if present
if ($flags & 0x40) { // extended header present
  $extHeaderSizeBytes = fread($fp, 4);
  if (strlen($extHeaderSizeBytes) < 4) { fclose($fp); http_response_code(404); exit; }
  $extSize = ($ver >= 4)
    ? ((ord($extHeaderSizeBytes[0]) & 0x7F) << 21 | (ord($extHeaderSizeBytes[1]) & 0x7F) << 14 | (ord($extHeaderSizeBytes[2]) & 0x7F) << 7 | (ord($extHeaderSizeBytes[3]) & 0x7F))
    : (ord($extHeaderSizeBytes[0]) << 24 | ord($extHeaderSizeBytes[1]) << 16 | ord($extHeaderSizeBytes[2]) << 8 | ord($extHeaderSizeBytes[3]));
  // Skip rest of extended header
  fseek($fp, $extSize - 4, SEEK_CUR);
}

$bytesRead = 0;
$found = false;
$mime = 'image/jpeg';
$imgData = '';

while ($bytesRead < $size) {
  $frameHeader = fread($fp, ($ver >= 4) ? 10 : 10);
  if (strlen($frameHeader) < 10) break;
  $bytesRead += 10;
  $frameId = substr($frameHeader, 0, 4);
  $frameSize = ($ver >= 4)
    ? ( (ord($frameHeader[4]) & 0x7F) << 21 | (ord($frameHeader[5]) & 0x7F) << 14 | (ord($frameHeader[6]) & 0x7F) << 7 | (ord($frameHeader[7]) & 0x7F) )
    : ( ord($frameHeader[4]) << 24 | ord($frameHeader[5]) << 16 | ord($frameHeader[6]) << 8 | ord($frameHeader[7]) );
  // skip flags (2 bytes)

  if ($frameSize <= 0) { break; }

  if ($frameId === 'APIC') {
    $frameData = fread($fp, $frameSize);
    $bytesRead += $frameSize;
    // Parse APIC: TextEncoding(1) | MIME (null-term) | PictureType(1) | Description (null-term) | PictureData
    $pos = 0;
    $enc = ord($frameData[$pos]); $pos++;
    // MIME
    $mimeEnd = strpos($frameData, "\x00", $pos);
    if ($mimeEnd === false) { break; }
    $mime = substr($frameData, $pos, $mimeEnd - $pos);
    if ($mime === 'image/jpg') $mime = 'image/jpeg';
    $pos = $mimeEnd + 1;
    // Picture type
    if ($pos >= strlen($frameData)) break;
    $pos++;
    // Description (encoding dependent). We'll find next separator.
    if ($enc === 0 || $enc === 3) { // ISO-8859-1 or UTF-8, null-terminated
      $descEnd = strpos($frameData, "\x00", $pos);
      if ($descEnd === false) { $descEnd = $pos; }
      $pos = $descEnd + 1;
    } else { // UTF-16 with BOM or without: terminated by 0x00 0x00
      $descEnd = strpos($frameData, "\x00\x00", $pos);
      if ($descEnd === false) { $descEnd = $pos; }
      $pos = $descEnd + 2;
    }
    if ($pos >= strlen($frameData)) break;
    $imgData = substr($frameData, $pos);
    $found = true;
    break;
  } else {
    // skip frame content
    fseek($fp, $frameSize, SEEK_CUR);
    $bytesRead += $frameSize;
  }
}

fclose($fp);
if (!$found || !$imgData) {
  http_response_code(404);
  exit;
}

header('Content-Type: ' . $mime);
header('Cache-Control: public, max-age=31536000, immutable');
echo $imgData;
exit;

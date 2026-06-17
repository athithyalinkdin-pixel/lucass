<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Upload-Token');
header('Content-Type: application/json');

// Handle preflight options request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure the request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

// Define the shared secret token
// Note: This must match the UPLOADER_SECRET environment variable on the Node.js Render backend
define('UPLOAD_TOKEN', 'LucasAgroMediaUploaderSecret2026!');

// Verify the X-Upload-Token header
$headers = getallheaders();
$receivedToken = isset($headers['X-Upload-Token']) ? $headers['X-Upload-Token'] : (isset($headers['x-upload-token']) ? $headers['x-upload-token'] : null);

if (!$receivedToken || $receivedToken !== UPLOAD_TOKEN) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Invalid or missing upload token']);
    exit();
}

// Ensure a file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded or file upload error']);
    exit();
}

$file = $_FILES['image'];
$fileName = $file['name'];
$fileTmpPath = $file['tmp_name'];

// Validate file extension
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov', 'pdf'];
$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

if (!in_array($fileExtension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File extension not allowed']);
    exit();
}

// Validate MIME type (extra security check)
$allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf'
];
$fileMimeType = mime_content_type($fileTmpPath);

if (!in_array($fileMimeType, $allowedMimeTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File MIME type not allowed']);
    exit();
}

// Create uploads directory if it doesn't exist
$uploadDir = __DIR__ . '/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate a unique filename to prevent collisions
$newFileName = uniqid('lucas_', true) . '.' . $fileExtension;
$destPath = $uploadDir . $newFileName;

// Move the file to the uploads directory
if (move_uploaded_file($fileTmpPath, $destPath)) {
    // Determine target public URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $publicUrl = $protocol . '://' . $host . '/uploads/' . $newFileName;

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'url' => $publicUrl,
        'filename' => $newFileName
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
}
?>

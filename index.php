<?php
// Simple routing for the GummyBear app
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

// Remove leading slash and get the first segment
$segments = explode('/', trim($path, '/'));
$route = $segments[0] ?? '';

// Route to appropriate handler
switch ($route) {
    case 'api':
        // API routes are handled by individual files
        $apiFile = __DIR__ . '/api/' . ($segments[1] ?? 'index') . '.php';
        if (file_exists($apiFile)) {
            include $apiFile;
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'API endpoint not found']);
        }
        break;
        
    case 'static':
        // Serve static files
        $staticFile = __DIR__ . '/static/' . implode('/', array_slice($segments, 1));
        if (file_exists($staticFile)) {
            $mimeType = mime_content_type($staticFile);
            header('Content-Type: ' . $mimeType);
            readfile($staticFile);
        } else {
            http_response_code(404);
            echo 'File not found';
        }
        break;
        
    default:
        // Serve the main app
        include 'src/index.html';
        break;
}
?>

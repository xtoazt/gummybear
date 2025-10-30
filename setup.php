<?php
require_once 'lib/config/database.php';

echo "Setting up GummyBear database...\n";

try {
    $db = new Database();
    $success = $db->createTables();
    
    if ($success) {
        echo "✅ Database tables created successfully!\n";
        echo "✅ Default king user created (username: xtoazt, password: admin123)\n";
        echo "✅ Database setup complete!\n\n";
        echo "You can now access GummyBear at: http://localhost/\n";
        echo "Login as king with username: xtoazt, password: admin123\n";
    } else {
        echo "❌ Failed to create database tables. Check your database connection.\n";
    }
} catch (Exception $e) {
    echo "❌ Database setup failed: " . $e->getMessage() . "\n";
    echo "Please check your database connection string in lib/config/database.php\n";
}
?>

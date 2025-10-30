<?php
// Test database connection
try {
    $host = 'ep-withered-hall-a4imj7yf-pooler.us-east-1.aws.neon.tech';
    $db_name = 'neondb';
    $username = 'neondb_owner';
    $password = 'npg_UAkM9yVp6Hwo';
    $port = '5432';
    
    $dsn = "pgsql:host={$host};port={$port};dbname={$db_name};sslmode=require";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful!\n";
    
    // Test creating a simple table
    $pdo->exec("CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name VARCHAR(50))");
    echo "✅ Table creation successful!\n";
    
    // Test inserting data
    $stmt = $pdo->prepare("INSERT INTO test_table (name) VALUES (?)");
    $stmt->execute(['GummyBear Test']);
    echo "✅ Data insertion successful!\n";
    
    // Test selecting data
    $stmt = $pdo->prepare("SELECT * FROM test_table WHERE name = ?");
    $stmt->execute(['GummyBear Test']);
    $result = $stmt->fetch();
    echo "✅ Data selection successful! Found: " . $result['name'] . "\n";
    
    // Clean up test table
    $pdo->exec("DROP TABLE test_table");
    echo "✅ Test cleanup successful!\n";
    
    echo "\n🎉 Database is ready for GummyBear!\n";
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "Please check your database credentials.\n";
}
?>

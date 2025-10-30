#!/usr/bin/env python3
import psycopg2
import sys

def test_database():
    try:
        # Database connection parameters
        host = 'ep-withered-hall-a4imj7yf-pooler.us-east-1.aws.neon.tech'
        dbname = 'neondb'
        user = 'neondb_owner'
        password = 'npg_UAkM9yVp6Hwo'
        port = '5432'
        
        # Connect to database
        conn = psycopg2.connect(
            host=host,
            database=dbname,
            user=user,
            password=password,
            port=port,
            sslmode='require'
        )
        
        print("✅ Database connection successful!")
        
        # Create cursor
        cur = conn.cursor()
        
        # Test creating a simple table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS test_table (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50)
            )
        """)
        print("✅ Table creation successful!")
        
        # Test inserting data
        cur.execute("INSERT INTO test_table (name) VALUES (%s)", ('GummyBear Test',))
        print("✅ Data insertion successful!")
        
        # Test selecting data
        cur.execute("SELECT * FROM test_table WHERE name = %s", ('GummyBear Test',))
        result = cur.fetchone()
        print(f"✅ Data selection successful! Found: {result[1]}")
        
        # Clean up test table
        cur.execute("DROP TABLE test_table")
        print("✅ Test cleanup successful!")
        
        # Close connection
        cur.close()
        conn.close()
        
        print("\n🎉 Database is ready for GummyBear!")
        print("📝 You can now run the PHP setup script when PHP is available")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please check your database credentials.")
        sys.exit(1)

if __name__ == "__main__":
    test_database()

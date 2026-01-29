# Database Setup Guide - XAMPP MySQL

## 📋 Prerequisites
- XAMPP installed (https://www.apachefriends.org/)
- MySQL running on port 3306 (default)

## 🚀 Quick Setup

### 1. Start XAMPP Services
```bash
# Open XAMPP Control Panel
# Start Apache and MySQL services
```

### 2. Create Database

#### Option A: Via phpMyAdmin (Recommended)
1. Open browser: http://localhost/phpmyadmin
2. Click "New" in left sidebar
3. Database name: `reprogramacion_foca`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

#### Option B: Via Command Line
```bash
# Open MySQL CLI from XAMPP
mysql -u root -p

# Create database
CREATE DATABASE reprogramacion_foca CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reprogramacion_foca;
```

### 3. Import Schema

#### Via phpMyAdmin:
1. Select `reprogramacion_foca` database
2. Click "Import" tab
3. Choose file: `database/schema.sql`
4. Click "Go"

#### Via Command Line:
```bash
# From project root directory
mysql -u root -p reprogramacion_foca < database/schema.sql
```

### 4. Verify Tables
```sql
USE reprogramacion_foca;
SHOW TABLES;

-- You should see:
-- users
-- client_profiles
-- client_week_progress
-- clinical_test_results
-- audio_usage_stats
-- guide_questions
-- client_guide_responses
```

### 5. Insert Sample Data (Optional)
```sql
-- Create test admin user
INSERT INTO users (id, name, email, role, avatar, status)
VALUES ('admin-1', 'Admin Test', 'admin@equilibrar.cl', 'ADMIN', 'https://i.pravatar.cc/150?img=1', 'ACTIVE');

-- Create test client
INSERT INTO users (id, name, email, role, avatar, status)
VALUES ('client-1', 'Lucía Vega', 'lucia@client.com', 'CLIENT', 'https://i.pravatar.cc/150?img=5', 'ACTIVE');

INSERT INTO client_profiles (user_id, program, current_week, start_date)
VALUES ('client-1', 'CULPA', 1, '2024-01-15');
```

## 🔧 Configuration

### Update .env file
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=reprogramacion_foca
PORT=3005
```

### Test Connection
```bash
# Start backend server
node server/index.js

# Test health endpoint
curl http://localhost:3005/api/health
```

Expected response:
```json
{
  "status": "OK",
  "db_check": 1
}
```

## 🐛 Troubleshooting

### Error: "Can't connect to MySQL server"
- Verify MySQL is running in XAMPP
- Check port 3306 is not blocked
- Verify credentials in .env

### Error: "Access denied for user"
- Default XAMPP MySQL has no password
- If password is set, update .env

### Error: "Unknown database"
- Database not created
- Follow step 2 again

### Error: "Table doesn't exist"
- Schema not imported
- Follow step 3 again

## 🔐 Security Notes

**⚠️ IMPORTANT FOR PRODUCTION:**
1. Change default MySQL root password
2. Create dedicated database user with limited privileges
3. Never commit .env file to Git
4. Use environment variables in production

```sql
-- Create dedicated user (production)
CREATE USER 'rfai_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON reprogramacion_foca.* TO 'rfai_user'@'localhost';
FLUSH PRIVILEGES;
```

## ✅ Status
Database setup completed successfully!

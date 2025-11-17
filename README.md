# 🖥️ BluePay - Backend API (Node.js)

<div align="center">
  <h3>Secure Payment Processing API with NFC & Multi-Channel Support</h3>
  <p>RESTful API built with Node.js, Express, and PostgreSQL</p>
  
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
</div>

---

## 🌟 Features

### 🔐 Authentication & Security
- **JWT Authentication** - Secure token-based auth
- **PIN Encryption** - Bcrypt hashed PINs
- **Token Encryption** - AES-256-CBC for payment tokens
- **Rate Limiting** - API request throttling
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Configurable CORS policies

### 💳 Payment Processing
- **NFC Payments** - Receiver-initiated contactless payments
- **QR Code Payments** - Generate & validate QR codes
- **Internal Transfers** - Phone number-based transfers
- **Mobile Money** - MTN MoMo integration (Ready)
- **Bank Transfers** - Payment aggregator support (Ready)
- **Transaction History** - Complete audit trail

### 📊 Transaction Management
- **Real-time Status** - Payment status tracking
- **Balance Management** - Atomic balance updates
- **Transaction Records** - Dual-entry bookkeeping
- **Message Support** - Payment notes (up to 500 chars)
- **Notifications** - Push notification support

### 🛡️ Security Features
- **PIN Verification** - Required for all payments
- **Token Expiry** - 5-minute payment token timeout
- **Balance Validation** - Insufficient funds checks
- **Self-payment Prevention** - Cannot pay yourself
- **Transaction Rollback** - Automatic on failure

---

## 🚀 Technologies

### Core Framework
- **Node.js** (v16+) - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database

### Database
- **PostgreSQL** - Primary database
- **pg** & **pg-hstore** - PostgreSQL drivers

### Security
- **bcryptjs** - Password/PIN hashing
- **jsonwebtoken** - JWT authentication
- **crypto** - Token encryption
- **express-validator** - Input validation
- **helmet** - Security headers

### External Integrations
- **Nodemailer** - Email notifications
- **Twilio** (Optional) - SMS notifications
- **Cloudinary** - Image storage
- **Axios** - HTTP client for external APIs

### Development Tools
- **dotenv** - Environment variables
- **nodemon** - Auto-restart on changes
- **morgan** - HTTP request logging
- **cors** - CORS middleware

---

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **Git**

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bluepay-backend.git
cd bluepay-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE bluepay_db;

# Create user (optional)
CREATE USER bluepay_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bluepay_db TO bluepay_user;

# Exit
\q
```

#### Run Migrations

```bash
# Create tables
npm run migrate

# Or manually run migrations
npx sequelize-cli db:migrate
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bluepay_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# NFC Configuration
NFC_ENCRYPTION_KEY=your_32_char_encryption_key_here
NFC_TOKEN_EXPIRY=300000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password

# SMS Configuration (Optional - Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+250788123456

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mobile Money Configuration (Coming Soon)
MOMO_API_KEY=your_momo_api_key
MOMO_API_SECRET=your_momo_secret
MOMO_CALLBACK_URL=https://your-domain.com/api/momo/callback

# Payment Gateway (Coming Soon)
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret
```

### 5. Generate Encryption Key

```bash
# Generate a secure 32-character key for NFC encryption
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 🏃‍♂️ Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Mode

```bash
npm start
```

### With PM2 (Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start server
pm2 start server.js --name bluepay-api

# Monitor
pm2 monit

# View logs
pm2 logs bluepay-api

# Restart
pm2 restart bluepay-api

# Stop
pm2 stop bluepay-api
```

---

## 📁 Project Structure

```
bluepay-backend/
├── config/
│   └── database.js         # Database configuration
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── nfcController.js    # NFC payment logic
│   ├── qrController.js     # QR code logic
│   ├── transactionController.js
│   ├── userController.js
│   └── notificationController.js
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── validation.js       # Input validation
│   ├── errorHandler.js     # Error handling
│   └── upload.js           # File upload
├── models/
│   ├── index.js            # Sequelize models
│   ├── User.js
│   ├── Transaction.js
│   ├── NFCPayment.js
│   ├── BankAccount.js
│   └── Notification.js
├── routes/
│   ├── authRoutes.js
│   ├── nfcRoutes.js
│   ├── qrRoutes.js
│   ├── transactionRoutes.js
│   ├── userRoutes.js
│   └── notificationRoutes.js
├── services/
│   ├── emailService.js     # Email sending
│   ├── smsService.js       # SMS sending
│   ├── momoService.js      # Mobile Money
│   ├── bankService.js      # Bank transfers
│   └── notificationService.js
├── utils/
│   ├── tokenGenerator.js   # Token generation
│   ├── encryption.js       # Encryption helpers
│   ├── validators.js       # Custom validators
│   └── helpers.js          # Helper functions
├── tests/
│   ├── auth.test.js
│   ├── nfc.test.js
│   └── transaction.test.js
├── .env                    # Environment variables
├── .gitignore
├── server.js               # App entry point
└── package.json
```

---

## 🔌 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+250788123456",
  "pin": "1234",
  "email": "john@example.com" (optional)
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "phone": "+250788123456"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+250788123456",
  "pin": "1234"
}
```

---

### NFC Payments

#### Create Payment Request (Receiver)
```http
POST /api/nfc/create-payment-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "message": "For lunch today"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "payment_token": "1234567890abcdef",
    "merchant": {
      "id": 1,
      "name": "John Doe",
      "phone": "+250788123456"
    },
    "amount": 5000,
    "message": "For lunch today",
    "expires_at": "2025-11-16T14:35:00.000Z",
    "expires_in_seconds": 300
  }
}
```

#### Validate Token (Sender)
```http
POST /api/nfc/validate-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_token": "1234567890abcdef"
}
```

#### Process Payment (Sender)
```http
POST /api/nfc/process-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_token": "1234567890abcdef",
  "pin": "1234"
}
```

#### Get Payment Status
```http
GET /api/nfc/status/:token
Authorization: Bearer <token>
```

---

### Transactions

#### Get Transaction History
```http
GET /api/transactions?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Transaction by ID
```http
GET /api/transactions/:id
Authorization: Bearer <token>
```

---

### User Management

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

#### Get Balance
```http
GET /api/users/balance
Authorization: Bearer <token>
```

---

## 🗃️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  pin VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  balance DECIMAL(15,2) DEFAULT 0,
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### NFCPayments Table
```sql
CREATE TABLE nfc_payments (
  id SERIAL PRIMARY KEY,
  payment_token VARCHAR(255) UNIQUE NOT NULL,
  merchant_id INTEGER REFERENCES users(id),
  customer_id INTEGER REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  expires_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'in' or 'out'
  category VARCHAR(50),
  label VARCHAR(255),
  amount DECIMAL(15,2) NOT NULL,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  balance_before DECIMAL(15,2),
  balance_after DECIMAL(15,2),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Security Best Practices

### PIN Storage
```javascript
const bcrypt = require('bcryptjs');

// Hash PIN before saving
const hashedPin = await bcrypt.hash(pin, 10);

// Verify PIN
const isValid = await bcrypt.compare(pin, user.pin);
```

### Token Encryption
```javascript
const crypto = require('crypto');

// Encrypt payment token
const encryptToken = (token) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.NFC_ENCRYPTION_KEY);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
```

### JWT Authentication
```javascript
const jwt = require('jsonwebtoken');

// Generate token
const token = jwt.sign(
  { id: user.id, phone: user.phone },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
```

---

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Individual Endpoints

#### Using cURL

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"+250788123456","pin":"1234"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+250788123456","pin":"1234"}'

# Create payment request
curl -X POST http://localhost:3000/api/nfc/create-payment-request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"message":"Test payment"}'
```

#### Using Postman

1. Import `bluepay.postman_collection.json` (if provided)
2. Set environment variable `API_URL` to `http://localhost:3000`
3. Run collection

---

## 🚀 Deployment

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create bluepay-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NFC_ENCRYPTION_KEY=your_key

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

### Deploy to AWS EC2

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Clone repository
git clone https://github.com/yourusername/bluepay-backend.git
cd bluepay-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env

# Install PM2
sudo npm install -g pm2

# Start app
pm2 start server.js --name bluepay-api
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt-get install nginx
# Configure Nginx...
```

---

## 📊 Monitoring & Logging

### View Logs

```bash
# Development
npm run dev

# Production with PM2
pm2 logs bluepay-api

# Specific log level
pm2 logs bluepay-api --err  # Errors only
```

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T12:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `DB_HOST` | Database host | Yes | localhost |
| `DB_PORT` | Database port | No | 5432 |
| `DB_NAME` | Database name | Yes | - |
| `DB_USER` | Database user | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `JWT_SECRET` | JWT secret key | Yes | - |
| `JWT_EXPIRES_IN` | Token expiry | No | 7d |
| `NFC_ENCRYPTION_KEY` | NFC token encryption key | Yes | - |
| `NFC_TOKEN_EXPIRY` | Token expiry (ms) | No | 300000 |

---

## 🐛 Common Issues

### Database Connection Failed

**Problem**: Cannot connect to PostgreSQL

**Solutions**:
1. Check PostgreSQL is running: `sudo service postgresql status`
2. Verify credentials in `.env`
3. Check `pg_hba.conf` for authentication settings

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use`

**Solutions**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

### Migration Errors

**Problem**: Database tables not created

**Solutions**:
```bash
# Reset database
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate

# Or manually
psql -U postgres -d bluepay_db -f migrations/schema.sql
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style

- Use **ESLint** for linting
- Follow **Airbnb JavaScript Style Guide**
- Write **JSDoc** comments for functions
- Add **unit tests** for new features

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 👥 Team

**Dream Weavers** - Development Team

- Backend Lead: [Dev.com]
- Frontend Lead: [Dev.com]
- DevOps: [Dev.com]

---

## 📞 Support

- **Email**: dev@bluepay.rw
- **Issues**: [GitHub Issues]()
- **Documentation**: [API Docs](https://docs.bluepay.rw)

---

## 🎉 Acknowledgments

- Node.js Community
- Express.js Team
- Sequelize Contributors
- All open-source libraries used

---

<div align="center">
  <p>Built with Dv.com</p>
  <p>© 2025 BluePay API. All rights reserved.</p>
</div>

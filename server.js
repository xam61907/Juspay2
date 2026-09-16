const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'juspay_secure_jwt_secret_key_2026';
const FIXED_RATE = 111; // Guaranteed fixed rate: 1 USDT = 111 INR
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Initialization (./app.db)
const dbPath = path.resolve(__dirname, 'app.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initDatabase();
  }
});

// Helper functions for Promisified SQLite queries
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Database Schema Setup & Migrations
async function initDatabase() {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        usdt_balance REAL DEFAULT 0.0,
        referral_code TEXT UNIQUE NOT NULL,
        referred_by TEXT,
        upline_code TEXT,
        upline_l2_code TEXT,
        total_deposit REAL DEFAULT 0.0,
        total_withdrawal REAL DEFAULT 0.0,
        total_ref_earning REAL DEFAULT 0.0,
        ip_address TEXT,
        session_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure columns exist if table was previously created
    const userCols = await dbAll('PRAGMA table_info(users)');
    const colNames = userCols.map(c => c.name);
    if (!colNames.includes('ip_address')) {
      await dbRun('ALTER TABLE users ADD COLUMN ip_address TEXT');
    }
    if (!colNames.includes('session_token')) {
      await dbRun('ALTER TABLE users ADD COLUMN session_token TEXT');
    }
    if (!colNames.includes('password_hash')) {
      await dbRun('ALTER TABLE users ADD COLUMN password_hash TEXT');
    }
    if (!colNames.includes('referred_by')) {
      await dbRun('ALTER TABLE users ADD COLUMN referred_by TEXT');
    }

    await dbRun(`
      CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        type TEXT DEFAULT 'LOGIN',
        purpose TEXT DEFAULT 'LOGIN',
        expires_at INTEGER NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const otpCols = await dbAll('PRAGMA table_info(otps)');
    const otpColNames = otpCols.map(c => c.name);
    if (!otpColNames.includes('type')) {
      await dbRun("ALTER TABLE otps ADD COLUMN type TEXT DEFAULT 'LOGIN'");
    }

    await dbRun(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_email TEXT NOT NULL,
        type TEXT NOT NULL,
        details TEXT NOT NULL,
        account_holder TEXT,
        upi_id TEXT,
        paytm_no TEXT,
        phonepe_no TEXT,
        is_default INTEGER DEFAULT 1,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const pmCols = await dbAll('PRAGMA table_info(payment_methods)');
    const pmColNames = pmCols.map(c => c.name);
    if (!pmColNames.includes('upi_id')) {
      await dbRun('ALTER TABLE payment_methods ADD COLUMN upi_id TEXT');
    }
    if (!pmColNames.includes('paytm_no')) {
      await dbRun('ALTER TABLE payment_methods ADD COLUMN paytm_no TEXT');
    }
    if (!pmColNames.includes('phonepe_no')) {
      await dbRun('ALTER TABLE payment_methods ADD COLUMN phonepe_no TEXT');
    }

    await dbRun(`
      CREATE TABLE IF NOT EXISTS deposits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        user_email TEXT NOT NULL,
        amount_usdt REAL NOT NULL,
        amount_inr REAL NOT NULL,
        network TEXT NOT NULL,
        txn_hash TEXT,
        tx_id TEXT,
        screenshot_base64 TEXT,
        status TEXT DEFAULT 'pending',
        admin_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const depCols = await dbAll('PRAGMA table_info(deposits)');
    const depColNames = depCols.map(c => c.name);
    if (!depColNames.includes('txn_hash')) {
      await dbRun('ALTER TABLE deposits ADD COLUMN txn_hash TEXT');
    }

    await dbRun(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        user_email TEXT NOT NULL,
        amount_usdt REAL NOT NULL,
        amount_inr REAL NOT NULL,
        method TEXT,
        payment_method TEXT NOT NULL,
        payment_details TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        admin_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const wthCols = await dbAll('PRAGMA table_info(withdrawals)');
    const wthColNames = wthCols.map(c => c.name);
    if (!wthColNames.includes('method')) {
      await dbRun('ALTER TABLE withdrawals ADD COLUMN method TEXT');
    }
    if (!wthColNames.includes('approved_at')) {
      await dbRun('ALTER TABLE withdrawals ADD COLUMN approved_at DATETIME');
    }

    await dbRun(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer_id INTEGER,
        referee_id INTEGER,
        tier INTEGER,
        total_earned_usdt REAL DEFAULT 0.0,
        deposit_id INTEGER,
        deposit_order_id TEXT,
        depositor_user_id INTEGER,
        depositor_email TEXT,
        upline_user_id INTEGER,
        upline_email TEXT,
        level INTEGER,
        commission_rate REAL,
        amount_usdt REAL,
        amount_inr REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_email TEXT NOT NULL,
        type TEXT NOT NULL,
        order_id TEXT,
        amount_usdt REAL NOT NULL,
        amount_inr REAL NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const txnCols = await dbAll('PRAGMA table_info(transactions)');
    const txnColNames = txnCols.map(c => c.name);
    if (!txnColNames.includes('order_id')) {
      await dbRun('ALTER TABLE transactions ADD COLUMN order_id TEXT');
    }
    if (!txnColNames.includes('status')) {
      await dbRun("ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'successful'");
    }

    await dbRun(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Ensure default settings exist
    const defaultSettings = [
      ['min_deposit', '50'],
      ['max_deposit', '1000'],
      ['min_withdraw', '50'],
      ['max_withdraw', '2000'],
      ['global_notice', 'Official USDT Portal: Guaranteed Fixed Conversion 1 USDT = 111 INR! Instant payouts to UPI, Paytm, and PhonePe.'],
      ['withdraw_notice', 'Withdrawals are processed directly to your linked UPI, Paytm, or PhonePe within 24 hours. Ensure your payout handle is active and KYC verified.'],
      ['trc20_address', 'TYx99M8fQZ4sK21B59Vn2L7xPw9mRtU98Q'],
      ['bep20_address', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'],
      ['support_telegram', 'https://t.me/juspay_support'],
      ['support_whatsapp', 'https://wa.me/919876543210'],
      ['support_email', 'support@juspay-usdt.com']
    ];

    for (const [k, v] of defaultSettings) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING', [k, v]);
    }

    console.log('Database tables & default settings initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Nodemailer Transporter
function getMailTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
}

// Utility: Send OTP Email
async function sendOtpEmail(email, code, purpose = 'LOGIN') {
  const transporter = getMailTransporter();
  const subject = purpose === 'WITHDRAWAL'
    ? `[Juspay] Security Verification Code for Withdrawal: ${code}`
    : `[Juspay] Your Account Verification Code: ${code}`;

  const text = `Hello,

Your 6-digit Juspay verification code for ${purpose} is: ${code}

This code is valid for 10 minutes. Please do not share this code with anyone.

Guaranteed Conversion Rate: 1 USDT = 111 INR.
Juspay Financial Services`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #090d16; padding: 24px; color: #f8fafc; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <h2 style="color: #10b981; margin: 0; font-size: 20px;">Juspay USDT Portal</h2>
      </div>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">Use the single-use 6-digit verification code below to authorize your <strong>${purpose}</strong> request.</p>
      <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">${code}</span>
      </div>
      <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This code expires in 10 minutes. If you did not initiate this request, please contact our support team immediately.</p>
      <div style="border-top: 1px solid #1e293b; padding-top: 14px; margin-top: 20px; font-size: 12px; color: #10b981; font-weight: bold;">
        Fixed Rate Standard: 1 USDT = 111 INR
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Juspay Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        text,
        html
      });
      console.log(`[SMTP] Successfully sent ${purpose} OTP to ${email}`);
      return { sent: true };
    } catch (err) {
      console.error(`[SMTP Error] Failed to send email to ${email}:`, err.message);
      return { sent: false, error: err.message };
    }
  } else {
    console.log(`[DEBUG OTP] No SMTP credentials configured. Verification Code for ${email} (${purpose}) is: >>> ${code} <<<`);
    return { sent: false, simulated: true };
  }
}

// Generate Random Referral Code (e.g. JUS89214)
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'JUS';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate Unique Order Numbers
function generateOrderId(prefix) {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${rand}`;
}

// Client IP extractor
function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();
}

// Helper: Fetch dynamic settings as an object
async function getSettingsMap() {
  const rows = await dbAll('SELECT key, value FROM settings');
  const map = {};
  rows.forEach(r => { map[r.key] = r.value; });
  return map;
}

// Authentication Middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid. Please sign in again.' });
    }

    try {
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [decoded.id]);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      // Update user IP address on active requests
      const currentIp = getClientIp(req);
      if (user.ip_address !== currentIp) {
        await dbRun('UPDATE users SET ip_address = ? WHERE id = ?', [currentIp, user.id]);
        user.ip_address = currentIp;
      }

      req.user = user;
      next();
    } catch (dbErr) {
      return res.status(500).json({ error: 'Internal database error validating user session.' });
    }
  });
}

// Admin Authentication Middleware (Password: 'admin123')
function authenticateAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.headers['authorization']?.replace('Bearer ', '') || req.query.admin_key || req.body.admin_key;
  if (key === ADMIN_PASSWORD) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid Admin Password.' });
}

// -------------------------------------------------------------
// PUBLIC & SETTINGS APIS
// -------------------------------------------------------------

// Public Settings & Dynamic Limits
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getSettingsMap();
    res.json({
      success: true,
      rate: FIXED_RATE,
      settings: {
        min_deposit: parseFloat(settings.min_deposit || '50'),
        max_deposit: parseFloat(settings.max_deposit || '1000'),
        min_withdraw: parseFloat(settings.min_withdraw || '50'),
        max_withdraw: parseFloat(settings.max_withdraw || '2000'),
        global_notice: settings.global_notice || 'Welcome to USDT Trading App',
        withdraw_notice: settings.withdraw_notice || 'Withdrawals are processed within 24 hours.',
        trc20_address: settings.trc20_address || 'TYx99M8fQZ4sK21B59Vn2L7xPw9mRtU98Q',
        bep20_address: settings.bep20_address || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        support_telegram: settings.support_telegram || 'https://t.me/juspay_support',
        support_whatsapp: settings.support_whatsapp || 'https://wa.me/919876543210',
        support_email: settings.support_email || 'support@juspay-usdt.com'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load platform settings.' });
  }
});

// -------------------------------------------------------------
// DUAL AUTHENTICATION & AUTO-LOGIN PERSISTENCE
// -------------------------------------------------------------

// Send OTP (Signup / Login)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, purpose = 'LOGIN' } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Invalidate existing unused OTPs
    await dbRun('UPDATE otps SET used = 1 WHERE email = ? AND purpose = ?', [normalizedEmail, purpose]);

    // Insert new OTP
    await dbRun('INSERT INTO otps (email, code, purpose, expires_at) VALUES (?, ?, ?, ?)', [
      normalizedEmail,
      code,
      purpose,
      expiresAt
    ]);

    await sendOtpEmail(normalizedEmail, code, purpose);

    res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${normalizedEmail}. Valid for 10 minutes.`,
      debugOtp: !process.env.SMTP_USER ? code : undefined
    });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Failed to dispatch verification code.' });
  }
});

// Verify OTP & Login / Auto-Signup
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const code = (req.body.code || req.body.otp || '').trim();
    const refCode = (req.body.refCode || req.body.ref || '').trim();

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    }

    const normalizedEmail = email;
    const clientIp = getClientIp(req);
    const now = Date.now();

    const otpRecord = await dbGet(
      'SELECT * FROM otps WHERE email = ? AND code = ? AND purpose = ? AND used = 0 ORDER BY id DESC LIMIT 1',
      [normalizedEmail, code.trim(), 'LOGIN']
    );

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    if (now > otpRecord.expires_at) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Mark OTP as used
    await dbRun('UPDATE otps SET used = 1 WHERE id = ?', [otpRecord.id]);

    let user = await dbGet('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      // New user registration
      let referralCode = generateReferralCode();
      let unique = false;
      while (!unique) {
        const existing = await dbGet('SELECT id FROM users WHERE referral_code = ?', [referralCode]);
        if (!existing) unique = true;
        else referralCode = generateReferralCode();
      }

      let uplineCode = null;
      let uplineL2Code = null;

      // Link referral hierarchy
      if (refCode && refCode.trim()) {
        const cleanRef = refCode.trim().toUpperCase();
        const uplineUser = await dbGet('SELECT referral_code, upline_code FROM users WHERE referral_code = ?', [cleanRef]);
        if (uplineUser) {
          uplineCode = uplineUser.referral_code;
          uplineL2Code = uplineUser.upline_code || null;
        }
      }

      const insertResult = await dbRun(
        `INSERT INTO users (email, referral_code, upline_code, upline_l2_code, usdt_balance, total_deposit, total_withdrawal, total_ref_earning, ip_address)
         VALUES (?, ?, ?, ?, 0.0, 0.0, 0.0, 0.0, ?)`,
        [normalizedEmail, referralCode, uplineCode, uplineL2Code, clientIp]
      );

      user = await dbGet('SELECT * FROM users WHERE id = ?', [insertResult.lastID]);
    } else {
      // Existing user: update IP address
      await dbRun('UPDATE users SET ip_address = ? WHERE id = ?', [clientIp, user.id]);
      user.ip_address = clientIp;
    }

    // Issue persistent JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, referral_code: user.referral_code },
      JWT_SECRET,
      { expiresIn: '60d' }
    );

    // Save session token in SQLite for auto-login verification
    await dbRun('UPDATE users SET session_token = ? WHERE id = ?', [token, user.id]);

    const paymentMethod = await dbGet('SELECT * FROM payment_methods WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user.id]);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        referral_code: user.referral_code,
        upline_code: user.upline_code,
        usdt_balance: user.usdt_balance,
        inr_balance: (user.usdt_balance * FIXED_RATE).toFixed(2),
        total_deposit: user.total_deposit,
        total_withdrawal: user.total_withdrawal,
        total_ref_earning: user.total_ref_earning,
        ip_address: user.ip_address,
        created_at: user.created_at
      },
      payment_method: paymentMethod || null
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'Internal server error verifying authentication.' });
  }
});

// Auto-Login Profile Fetcher (/api/auth/me)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const paymentMethod = await dbGet('SELECT * FROM payment_methods WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
    const settings = await getSettingsMap();

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        referral_code: user.referral_code,
        upline_code: user.upline_code,
        usdt_balance: user.usdt_balance,
        inr_balance: (user.usdt_balance * FIXED_RATE).toFixed(2),
        total_deposit: user.total_deposit,
        total_withdrawal: user.total_withdrawal,
        total_ref_earning: user.total_ref_earning,
        ip_address: user.ip_address,
        created_at: user.created_at
      },
      payment_method: paymentMethod || null,
      settings: {
        min_deposit: parseFloat(settings.min_deposit || '50'),
        max_deposit: parseFloat(settings.max_deposit || '1000'),
        min_withdraw: parseFloat(settings.min_withdraw || '50'),
        max_withdraw: parseFloat(settings.max_withdraw || '2000'),
        global_notice: settings.global_notice || 'Welcome to USDT Trading App',
        withdraw_notice: settings.withdraw_notice || 'Withdrawals are processed within 24 hours.',
        trc20_address: settings.trc20_address || 'TYx99M8fQZ4sK21B59Vn2L7xPw9mRtU98Q',
        bep20_address: settings.bep20_address || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        support_telegram: settings.support_telegram || 'https://t.me/juspay_support',
        support_whatsapp: settings.support_whatsapp || 'https://wa.me/919876543210',
        support_email: settings.support_email || 'support@juspay-usdt.com'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve user session.' });
  }
});

// -------------------------------------------------------------
// PAYMENT METHOD BINDING SYSTEM (UPI / PAYTM / PHONEPE)
// -------------------------------------------------------------

app.get(['/api/payment-methods', '/api/payment-method'], authenticateToken, async (req, res) => {
  try {
    const method = await dbGet('SELECT * FROM payment_methods WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
    res.json({ success: true, payment_method: method || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment method.' });
  }
});

app.post(['/api/payment-methods', '/api/payment-method'], authenticateToken, async (req, res) => {
  try {
    const { type, details, account_holder } = req.body;
    if (!type || !details) {
      return res.status(400).json({ error: 'Payment method type and account handle/number are required.' });
    }

    const cleanType = type.trim();
    if (!['UPI', 'Paytm', 'PhonePe'].includes(cleanType)) {
      return res.status(400).json({ error: 'Payment method must be UPI, Paytm, or PhonePe.' });
    }

    // Update or insert payment method
    await dbRun('DELETE FROM payment_methods WHERE user_id = ?', [req.user.id]);
    const insertResult = await dbRun(
      'INSERT INTO payment_methods (user_id, user_email, type, details, account_holder, is_default) VALUES (?, ?, ?, ?, ?, 1)',
      [req.user.id, req.user.email, cleanType, details.trim(), account_holder ? account_holder.trim() : '']
    );

    const saved = await dbGet('SELECT * FROM payment_methods WHERE id = ?', [insertResult.lastID]);
    res.json({
      success: true,
      message: `Your ${cleanType} payout account has been linked successfully.`,
      payment_method: saved
    });
  } catch (err) {
    console.error('Payment method error:', err);
    res.status(500).json({ error: 'Failed to link payment method.' });
  }
});

// -------------------------------------------------------------
// DEPOSIT SYSTEM
// -------------------------------------------------------------

app.post('/api/deposits', authenticateToken, async (req, res) => {
  try {
    const { amount_usdt, network, tx_id, screenshot_base64 } = req.body;
    const amount = parseFloat(amount_usdt);

    const settings = await getSettingsMap();
    const minDep = parseFloat(settings.min_deposit || '50');
    const maxDep = parseFloat(settings.max_deposit || '1000');

    if (isNaN(amount) || amount < minDep || amount > maxDep) {
      return res.status(400).json({
        error: `Deposit amount must be between ${minDep} USDT and ${maxDep} USDT.`
      });
    }

    if (!['TRC20', 'BEP20'].includes(network)) {
      return res.status(400).json({ error: 'Network must be TRC20 or BEP20.' });
    }

    if (!tx_id || tx_id.trim().length < 6) {
      return res.status(400).json({ error: 'A valid Transaction Hash (TxID) is required.' });
    }

    if (!screenshot_base64) {
      return res.status(400).json({ error: 'Payment screenshot proof is required.' });
    }

    const amountInr = amount * FIXED_RATE;
    const orderId = generateOrderId('DEP');

    await dbRun(
      `INSERT INTO deposits (order_id, user_id, user_email, amount_usdt, amount_inr, network, tx_id, screenshot_base64, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [orderId, req.user.id, req.user.email, amount, amountInr, network, tx_id.trim(), screenshot_base64]
    );

    await dbRun(
      `INSERT INTO transactions (user_id, user_email, type, order_id, amount_usdt, amount_inr, description, status)
       VALUES (?, ?, 'DEPOSIT', ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.email, orderId, amount, amountInr, `Deposit of ${amount} USDT (${network}) awaiting admin approval`, 'Pending']
    );

    res.json({
      success: true,
      message: 'Deposit submitted successfully! Order is Pending admin verification.',
      order_id: orderId,
      amount_usdt: amount,
      amount_inr: amountInr
    });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ error: 'Failed to submit deposit.' });
  }
});

app.get('/api/deposits/my', authenticateToken, async (req, res) => {
  try {
    const deposits = await dbAll(
      'SELECT id, order_id, amount_usdt, amount_inr, network, tx_id, status, created_at FROM deposits WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    res.json({ success: true, deposits });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve deposits.' });
  }
});

// -------------------------------------------------------------
// WITHDRAWAL SYSTEM WITH OTP SECURITY
// -------------------------------------------------------------

// Send Withdrawal OTP
app.post('/api/withdrawals/send-otp', authenticateToken, async (req, res) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await dbRun('UPDATE otps SET used = 1 WHERE email = ? AND purpose = ?', [req.user.email, 'WITHDRAWAL']);
    await dbRun('INSERT INTO otps (email, code, purpose, expires_at) VALUES (?, ?, ?, ?)', [
      req.user.email,
      code,
      'WITHDRAWAL',
      expiresAt
    ]);

    await sendOtpEmail(req.user.email, code, 'WITHDRAWAL');

    res.json({
      success: true,
      message: `A 6-digit withdrawal authorization code has been dispatched to ${req.user.email}.`,
      debugOtp: !process.env.SMTP_USER ? code : undefined
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to dispatch withdrawal OTP.' });
  }
});

// Check 24-Hour Cooldown & Withdrawal Status
app.get('/api/withdrawals/cooldown-status', authenticateToken, async (req, res) => {
  try {
    const pendingWth = await dbGet(
      "SELECT * FROM withdrawals WHERE user_id = ? AND LOWER(status) = 'pending' ORDER BY id DESC LIMIT 1",
      [req.user.id]
    );

    const lastApproved = await dbGet(
      "SELECT * FROM withdrawals WHERE user_id = ? AND (LOWER(status) = 'successful' OR LOWER(status) = 'approved') AND approved_at IS NOT NULL ORDER BY approved_at DESC LIMIT 1",
      [req.user.id]
    );

    const now = Date.now();
    let cooldownActive = false;
    let remainingMs = 0;
    let nextAvailableTime = null;

    if (lastApproved && lastApproved.approved_at) {
      const approvedMs = new Date(lastApproved.approved_at).getTime();
      const elapsed = now - approvedMs;
      const cooldownDuration = 24 * 60 * 60 * 1000;

      if (elapsed < cooldownDuration) {
        cooldownActive = true;
        remainingMs = cooldownDuration - elapsed;
        nextAvailableTime = new Date(approvedMs + cooldownDuration).toISOString();
      }
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    let canWithdraw = true;
    let reason = '';

    if (pendingWth) {
      canWithdraw = false;
      reason = `Pending request ${pendingWth.order_id} is awaiting admin approval.`;
    } else if (cooldownActive) {
      canWithdraw = false;
      reason = `24-hour limit active. Next withdrawal available in ${hours}h ${minutes}m.`;
    }

    res.json({
      success: true,
      can_withdraw: canWithdraw,
      reason,
      cooldown_active: cooldownActive,
      cooldown_remaining_ms: remainingMs,
      cooldown_remaining_text: cooldownActive ? `${hours}h ${minutes}m` : null,
      next_available_time: nextAvailableTime,
      pending_withdrawal: pendingWth ? {
        order_id: pendingWth.order_id,
        amount_usdt: pendingWth.amount_usdt,
        created_at: pendingWth.created_at
      } : null,
      last_approved_at: lastApproved ? lastApproved.approved_at : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check withdrawal cooldown status.' });
  }
});

// Submit Withdrawal Request
app.post('/api/withdrawals', authenticateToken, async (req, res) => {
  try {
    const { amount_usdt, otp } = req.body;
    const amount = parseFloat(amount_usdt);

    const settings = await getSettingsMap();
    const minWth = parseFloat(settings.min_withdraw || '50');
    const maxWth = parseFloat(settings.max_withdraw || '2000');

    if (isNaN(amount) || amount < minWth || amount > maxWth) {
      return res.status(400).json({
        error: `Withdrawal amount must be between ${minWth} USDT and ${maxWth} USDT.`
      });
    }

    if (!otp) {
      return res.status(400).json({ error: 'Security OTP verification code is required.' });
    }

    // 1. Check linked payment method - REQUIRED!
    const paymentMethod = await dbGet(
      'SELECT * FROM payment_methods WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [req.user.id]
    );

    if (!paymentMethod) {
      return res.status(400).json({
        error: 'No payment account linked! You must link your UPI ID, Paytm, or PhonePe before submitting a withdrawal.'
      });
    }

    // 2. Check pending withdrawal constraint (Strictly 1 request at a time)
    const pendingWth = await dbGet(
      "SELECT * FROM withdrawals WHERE user_id = ? AND LOWER(status) = 'pending' ORDER BY id DESC LIMIT 1",
      [req.user.id]
    );

    if (pendingWth) {
      return res.status(400).json({
        error: `You already have an active pending withdrawal (Order: ${pendingWth.order_id}). Strictly 1 withdrawal at a time. Please wait for admin processing.`
      });
    }

    // 3. Frequency Limit: Strictly 1 withdrawal per 24 hours (resets from last approval timestamp)
    const lastApproved = await dbGet(
      "SELECT * FROM withdrawals WHERE user_id = ? AND (LOWER(status) = 'successful' OR LOWER(status) = 'approved') AND approved_at IS NOT NULL ORDER BY approved_at DESC LIMIT 1",
      [req.user.id]
    );

    if (lastApproved && lastApproved.approved_at) {
      const approvedMs = new Date(lastApproved.approved_at).getTime();
      const elapsed = Date.now() - approvedMs;
      const cooldownDuration = 24 * 60 * 60 * 1000;

      if (elapsed < cooldownDuration) {
        const remainingMs = cooldownDuration - elapsed;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        return res.status(400).json({
          error: `Strictly 1 withdrawal per 24 hours. Cooldown resets from approval time. Next withdrawal available in ${hours}h ${minutes}m.`
        });
      }
    }

    // 4. Verify OTP
    const now = Date.now();
    const otpRecord = await dbGet(
      'SELECT * FROM otps WHERE email = ? AND code = ? AND (purpose = ? OR type = ?) AND used = 0 ORDER BY id DESC LIMIT 1',
      [req.user.email, otp.trim(), 'WITHDRAWAL', 'WITHDRAWAL']
    );

    if (!otpRecord || now > otpRecord.expires_at) {
      return res.status(400).json({ error: 'Invalid or expired withdrawal OTP code.' });
    }

    // 5. Check live user balance
    const currentUser = await dbGet('SELECT usdt_balance FROM users WHERE id = ?', [req.user.id]);
    if (!currentUser || currentUser.usdt_balance < amount) {
      return res.status(400).json({
        error: `Insufficient available balance. You currently have ${currentUser ? currentUser.usdt_balance.toFixed(2) : '0.00'} USDT.`
      });
    }

    // Mark OTP as used
    await dbRun('UPDATE otps SET used = 1 WHERE id = ?', [otpRecord.id]);

    const amountInr = amount * FIXED_RATE;
    const orderId = generateOrderId('WTH');
    const payoutHandle = `${paymentMethod.type}: ${paymentMethod.details}${paymentMethod.account_holder ? ' (' + paymentMethod.account_holder + ')' : ''}`;

    // Note: Balance deducts automatically upon Admin approval as per specification
    await dbRun(
      `INSERT INTO withdrawals (order_id, user_id, user_email, amount_usdt, amount_inr, method, payment_method, payment_details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderId, req.user.id, req.user.email, amount, amountInr, paymentMethod.type, paymentMethod.type, payoutHandle]
    );

    await dbRun(
      `INSERT INTO transactions (user_id, user_email, type, order_id, amount_usdt, amount_inr, description, status)
       VALUES (?, ?, 'WITHDRAWAL', ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.email, orderId, amount, amountInr, `Withdrawal request of ${amount} USDT via ${paymentMethod.type} (${paymentMethod.details})`, 'pending']
    );

    res.json({
      success: true,
      message: `Withdrawal request for ${amount} USDT (₹${amountInr.toLocaleString()}) created successfully! Order ${orderId} is pending admin review.`,
      order_id: orderId,
      amount_usdt: amount,
      amount_inr: amountInr
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Failed to process withdrawal request.' });
  }
});

app.get('/api/withdrawals/my', authenticateToken, async (req, res) => {
  try {
    const withdrawals = await dbAll(
      'SELECT id, order_id, amount_usdt, amount_inr, payment_method, payment_details, status, created_at FROM withdrawals WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    res.json({ success: true, withdrawals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve withdrawals.' });
  }
});

// -------------------------------------------------------------
// 2-TIER REFERRAL ENGINE
// -------------------------------------------------------------

app.get('/api/team', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT referral_code, total_ref_earning FROM users WHERE id = ?', [req.user.id]);

    // Level 1: Direct referrals
    const level1 = await dbAll(
      `SELECT email, usdt_balance, total_deposit, created_at
       FROM users WHERE upline_code = ? ORDER BY id DESC`,
      [user.referral_code]
    );

    // Level 2: Indirect referrals
    const level2 = await dbAll(
      `SELECT email, usdt_balance, total_deposit, created_at
       FROM users WHERE upline_l2_code = ? ORDER BY id DESC`,
      [user.referral_code]
    );

    // Itemized referral commission records
    const commissions = await dbAll(
      `SELECT deposit_order_id, depositor_email, level, commission_rate, amount_usdt, amount_inr, created_at
       FROM referrals WHERE upline_user_id = ? ORDER BY id DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      referral_code: user.referral_code,
      total_ref_earning_usdt: user.total_ref_earning,
      total_ref_earning_inr: (user.total_ref_earning * FIXED_RATE).toFixed(2),
      l1_count: level1.length,
      l2_count: level2.length,
      level1,
      level2,
      commissions
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team data.' });
  }
});

// -------------------------------------------------------------
// TRANSACTION & ORDER HISTORY LEDGER
// -------------------------------------------------------------

app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const transactions = await dbAll(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 200',
      [req.user.id]
    );
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load transaction history.' });
  }
});

// -------------------------------------------------------------
// ADMIN CONTROL PANEL (PASSWORD: 'admin123')
// -------------------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }
  return res.status(401).json({ error: 'Invalid Admin Password.' });
});

// Admin: Get All Pending Deposits
app.get('/api/admin/deposits', authenticateAdmin, async (req, res) => {
  try {
    const deposits = await dbAll(
      `SELECT d.*, u.referral_code, u.upline_code, u.upline_l2_code
       FROM deposits d
       LEFT JOIN users u ON d.user_id = u.id
       ORDER BY CASE WHEN d.status = 'Pending' THEN 0 ELSE 1 END, d.id DESC`
    );
    res.json({ success: true, deposits });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve deposits for admin.' });
  }
});

// Admin: Approve Deposit (Crediting & 2-Tier Referral Commission)
app.post('/api/admin/deposits/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const depositId = parseInt(req.params.id, 10);
    const deposit = await dbGet('SELECT * FROM deposits WHERE id = ?', [depositId]);

    if (!deposit) return res.status(404).json({ error: 'Deposit not found.' });
    if (deposit.status !== 'Pending') {
      return res.status(400).json({ error: `Deposit is already marked as ${deposit.status}.` });
    }

    const amountUsdt = deposit.amount_usdt;
    const amountInr = deposit.amount_inr;

    // 1. Credit depositing user
    await dbRun(
      'UPDATE users SET usdt_balance = usdt_balance + ?, total_deposit = total_deposit + ? WHERE id = ?',
      [amountUsdt, amountUsdt, deposit.user_id]
    );

    // 2. Mark deposit as Approved
    await dbRun(
      'UPDATE deposits SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['Approved', depositId]
    );

    // 3. Mark pending transaction as Approved
    await dbRun(
      'UPDATE transactions SET status = ? WHERE order_id = ? AND type = ?',
      ['Approved', deposit.order_id, 'DEPOSIT']
    );

    // Fetch user for upline calculations
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [deposit.user_id]);

    // 4. Level 1 Direct Referral Commission (5%)
    let l1Bonus = 0;
    if (user.upline_code) {
      const uplineL1 = await dbGet('SELECT * FROM users WHERE referral_code = ?', [user.upline_code]);
      if (uplineL1) {
        l1Bonus = parseFloat((amountUsdt * 0.05).toFixed(4));
        const l1Inr = l1Bonus * FIXED_RATE;

        await dbRun(
          'UPDATE users SET usdt_balance = usdt_balance + ?, total_ref_earning = total_ref_earning + ? WHERE id = ?',
          [l1Bonus, l1Bonus, uplineL1.id]
        );

        await dbRun(
          `INSERT INTO referrals (deposit_id, deposit_order_id, depositor_user_id, depositor_email, upline_user_id, upline_email, level, commission_rate, amount_usdt, amount_inr)
           VALUES (?, ?, ?, ?, ?, ?, 1, 0.05, ?, ?)`,
          [deposit.id, deposit.order_id, user.id, user.email, uplineL1.id, uplineL1.email, l1Bonus, l1Inr]
        );

        await dbRun(
          `INSERT INTO transactions (user_id, user_email, type, order_id, amount_usdt, amount_inr, description, status)
           VALUES (?, ?, 'REFERRAL_L1', ?, ?, ?, ?, ?)`,
          [
            uplineL1.id,
            uplineL1.email,
            `REF1-${deposit.order_id}`,
            l1Bonus,
            l1Inr,
            `5% Direct Commission from deposit by ${user.email} (Order ${deposit.order_id})`,
            'Approved'
          ]
        );
      }
    }

    // 5. Level 2 Indirect Referral Commission (2%)
    let l2Bonus = 0;
    if (user.upline_l2_code) {
      const uplineL2 = await dbGet('SELECT * FROM users WHERE referral_code = ?', [user.upline_l2_code]);
      if (uplineL2) {
        l2Bonus = parseFloat((amountUsdt * 0.02).toFixed(4));
        const l2Inr = l2Bonus * FIXED_RATE;

        await dbRun(
          'UPDATE users SET usdt_balance = usdt_balance + ?, total_ref_earning = total_ref_earning + ? WHERE id = ?',
          [l2Bonus, l2Bonus, uplineL2.id]
        );

        await dbRun(
          `INSERT INTO referrals (deposit_id, deposit_order_id, depositor_user_id, depositor_email, upline_user_id, upline_email, level, commission_rate, amount_usdt, amount_inr)
           VALUES (?, ?, ?, ?, ?, ?, 2, 0.02, ?, ?)`,
          [deposit.id, deposit.order_id, user.id, user.email, uplineL2.id, uplineL2.email, l2Bonus, l2Inr]
        );

        await dbRun(
          `INSERT INTO transactions (user_id, user_email, type, order_id, amount_usdt, amount_inr, description, status)
           VALUES (?, ?, 'REFERRAL_L2', ?, ?, ?, ?, ?)`,
          [
            uplineL2.id,
            uplineL2.email,
            `REF2-${deposit.order_id}`,
            l2Bonus,
            l2Inr,
            `2% Indirect Commission from deposit by ${user.email} (Order ${deposit.order_id})`,
            'Approved'
          ]
        );
      }
    }

    res.json({
      success: true,
      message: `Deposit ${deposit.order_id} Approved! Credited ${amountUsdt} USDT. Paid L1: ${l1Bonus} USDT and L2: ${l2Bonus} USDT.`
    });
  } catch (err) {
    console.error('Approve deposit error:', err);
    res.status(500).json({ error: 'Failed to approve deposit.' });
  }
});

// Admin: Reject Deposit
app.post('/api/admin/deposits/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const depositId = parseInt(req.params.id, 10);
    const { reason = 'Transaction proof verification failed' } = req.body;

    const deposit = await dbGet('SELECT * FROM deposits WHERE id = ?', [depositId]);
    if (!deposit) return res.status(404).json({ error: 'Deposit not found.' });
    if (deposit.status !== 'Pending') {
      return res.status(400).json({ error: `Deposit is already marked as ${deposit.status}.` });
    }

    await dbRun(
      'UPDATE deposits SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['Failed', reason, depositId]
    );

    await dbRun(
      'UPDATE transactions SET status = ? WHERE order_id = ? AND type = ?',
      ['Failed', deposit.order_id, 'DEPOSIT']
    );

    res.json({ success: true, message: `Deposit ${deposit.order_id} marked as Failed.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject deposit.' });
  }
});

// Admin: Get All Pending Withdrawals
app.get('/api/admin/withdrawals', authenticateAdmin, async (req, res) => {
  try {
    const withdrawals = await dbAll(
      `SELECT * FROM withdrawals
       ORDER BY CASE WHEN status = 'Pending' THEN 0 ELSE 1 END, id DESC`
    );
    res.json({ success: true, withdrawals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve withdrawals for admin.' });
  }
});

// Admin: Approve Withdrawal (Deducts balance, sets status to 'successful', starts 24h cooldown)
app.post('/api/admin/withdrawals/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.id, 10);
    const withdrawal = await dbGet('SELECT * FROM withdrawals WHERE id = ?', [withdrawalId]);

    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found.' });
    if (withdrawal.status.toLowerCase() !== 'pending') {
      return res.status(400).json({ error: `Withdrawal is already marked as ${withdrawal.status}.` });
    }

    const user = await dbGet('SELECT * FROM users WHERE id = ?', [withdrawal.user_id]);
    if (!user || user.usdt_balance < withdrawal.amount_usdt) {
      return res.status(400).json({
        error: `Cannot approve withdrawal: User current balance (${user ? user.usdt_balance.toFixed(2) : 0} USDT) is insufficient for ${withdrawal.amount_usdt} USDT withdrawal.`
      });
    }

    // Deduct user balance and increment total_withdrawal upon approval
    await dbRun(
      'UPDATE users SET usdt_balance = usdt_balance - ?, total_withdrawal = total_withdrawal + ? WHERE id = ?',
      [withdrawal.amount_usdt, withdrawal.amount_usdt, withdrawal.user_id]
    );

    // Update status to 'successful' and set approved_at to start 24h reset cooldown
    await dbRun(
      "UPDATE withdrawals SET status = 'successful', approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [withdrawalId]
    );

    await dbRun(
      "UPDATE transactions SET status = 'successful' WHERE order_id = ? AND type = 'WITHDRAWAL'",
      [withdrawal.order_id]
    );

    res.json({
      success: true,
      message: `Withdrawal ${withdrawal.order_id} Approved! Deducted ${withdrawal.amount_usdt} USDT. Payout of ₹${withdrawal.amount_inr} settled and 24h cooldown started.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve withdrawal.' });
  }
});

// Admin: Reject Withdrawal (Marks as failed without deducting balance)
app.post('/api/admin/withdrawals/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.id, 10);
    const { reason = 'Invalid payment details or manual rejection' } = req.body;

    const withdrawal = await dbGet('SELECT * FROM withdrawals WHERE id = ?', [withdrawalId]);
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found.' });
    if (withdrawal.status.toLowerCase() !== 'pending') {
      return res.status(400).json({ error: `Withdrawal is already marked as ${withdrawal.status}.` });
    }

    await dbRun(
      "UPDATE withdrawals SET status = 'failed', admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [reason, withdrawalId]
    );

    await dbRun(
      "UPDATE transactions SET status = 'failed' WHERE order_id = ? AND type = 'WITHDRAWAL'",
      [withdrawal.order_id]
    );

    res.json({
      success: true,
      message: `Withdrawal ${withdrawal.order_id} marked as Failed. User balance was not deducted.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject withdrawal.' });
  }
});

// Admin: Manual Balance Adjuster (Credit or Debit)
app.post(['/api/admin/manual-credit', '/api/admin/manual-adjust'], authenticateAdmin, async (req, res) => {
  try {
    const { email, amount_usdt, action = 'CREDIT', reason = 'Admin Manual Adjustment' } = req.body;
    const amount = parseFloat(amount_usdt);

    if (!email || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid user email and positive USDT amount are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      return res.status(404).json({ error: `No registered user found with email ${normalizedEmail}.` });
    }

    const isDebit = String(action).toUpperCase() === 'DEBIT';

    if (isDebit && user.usdt_balance < amount) {
      return res.status(400).json({
        error: `Cannot debit ${amount} USDT. User current balance is only ${user.usdt_balance.toFixed(2)} USDT.`
      });
    }

    if (isDebit) {
      await dbRun(
        'UPDATE users SET usdt_balance = MAX(0, usdt_balance - ?) WHERE id = ?',
        [amount, user.id]
      );
    } else {
      await dbRun(
        'UPDATE users SET usdt_balance = usdt_balance + ? WHERE id = ?',
        [amount, user.id]
      );
    }

    const amountInr = amount * FIXED_RATE;
    const orderId = generateOrderId(isDebit ? 'DEB' : 'CRED');
    const txType = isDebit ? 'MANUAL_DEBIT' : 'MANUAL_CREDIT';
    const desc = `Manual Admin ${isDebit ? 'Debit' : 'Credit'}: ${reason}`;

    await dbRun(
      `INSERT INTO transactions (user_id, user_email, type, order_id, amount_usdt, amount_inr, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, txType, orderId, amount, amountInr, desc, 'Approved']
    );

    const refreshed = await dbGet('SELECT usdt_balance FROM users WHERE id = ?', [user.id]);

    res.json({
      success: true,
      message: `Successfully ${isDebit ? 'debited' : 'credited'} ${amount} USDT (₹${amountInr.toLocaleString()}) ${isDebit ? 'from' : 'to'} ${user.email}. New Balance: ${refreshed.usdt_balance} USDT.`,
      new_balance: refreshed.usdt_balance
    });
  } catch (err) {
    console.error('Manual credit error:', err);
    res.status(500).json({ error: 'Failed to adjust manual balance: ' + (err && err.message ? err.message : err) });
  }
});

// Admin: Limit Manager
app.post('/api/admin/settings/limits', authenticateAdmin, async (req, res) => {
  try {
    const { min_deposit, max_deposit, min_withdraw, max_withdraw } = req.body;

    if (min_deposit !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['min_deposit', String(min_deposit), String(min_deposit)]);
    }
    if (max_deposit !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['max_deposit', String(max_deposit), String(max_deposit)]);
    }
    if (min_withdraw !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['min_withdraw', String(min_withdraw), String(min_withdraw)]);
    }
    if (max_withdraw !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['max_withdraw', String(max_withdraw), String(max_withdraw)]);
    }

    res.json({ success: true, message: 'Platform deposit and withdrawal limits updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update system limits.' });
  }
});

// Admin: Announcement & Notice Control
app.post('/api/admin/settings/notices', authenticateAdmin, async (req, res) => {
  try {
    const { global_notice, withdraw_notice } = req.body;

    if (global_notice !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['global_notice', global_notice, global_notice]);
    }
    if (withdraw_notice !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['withdraw_notice', withdraw_notice, withdraw_notice]);
    }

    res.json({ success: true, message: 'Announcements and notice texts updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notices.' });
  }
});

// Admin: Support & Help Manager
app.post('/api/admin/settings/support', authenticateAdmin, async (req, res) => {
  try {
    const { support_telegram, support_whatsapp, support_email, trc20_address, bep20_address } = req.body;

    if (support_telegram !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['support_telegram', support_telegram, support_telegram]);
    }
    if (support_whatsapp !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['support_whatsapp', support_whatsapp, support_whatsapp]);
    }
    if (support_email !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['support_email', support_email, support_email]);
    }
    if (trc20_address !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['trc20_address', trc20_address, trc20_address]);
    }
    if (bep20_address !== undefined) {
      await dbRun('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['bep20_address', bep20_address, bep20_address]);
    }

    res.json({ success: true, message: 'Customer support channels and deposit wallet addresses updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update support settings.' });
  }
});

// Admin: User & Referral Directory
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await dbAll('SELECT * FROM users ORDER BY id DESC');
    const enriched = await Promise.all(
      users.map(async (u) => {
        const l1 = await dbGet('SELECT COUNT(*) as cnt FROM users WHERE upline_code = ?', [u.referral_code]);
        const l2 = await dbGet('SELECT COUNT(*) as cnt FROM users WHERE upline_l2_code = ?', [u.referral_code]);
        const pm = await dbGet('SELECT type, details, account_holder FROM payment_methods WHERE user_id = ? ORDER BY id DESC LIMIT 1', [u.id]);

        let uplineEmail = 'None';
        if (u.upline_code) {
          const up = await dbGet('SELECT email FROM users WHERE referral_code = ?', [u.upline_code]);
          if (up) uplineEmail = up.email;
        }

        return {
          id: u.id,
          email: u.email,
          referral_code: u.referral_code,
          upline_code: u.upline_code || 'None',
          upline_email: uplineEmail,
          usdt_balance: u.usdt_balance,
          inr_balance: (u.usdt_balance * FIXED_RATE).toFixed(2),
          total_deposit: u.total_deposit,
          total_withdrawal: u.total_withdrawal,
          total_ref_earning: u.total_ref_earning,
          ip_address: u.ip_address || '127.0.0.1',
          payment_method: pm ? `${pm.type}: ${pm.details}${pm.account_holder ? ' (' + pm.account_holder + ')' : ''}` : 'Not Linked',
          l1_count: l1 ? l1.cnt : 0,
          l2_count: l2 ? l2.cnt : 0,
          created_at: u.created_at
        };
      })
    );

    res.json({ success: true, users: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve user directory.' });
  }
});

// -------------------------------------------------------------
// STATIC FILE SERVING & SPA ROUTING
// -------------------------------------------------------------
const publicDir = path.resolve(__dirname, 'public');
app.use(express.static(publicDir));

// Fallback to index.html for all frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`Juspay Fintech & Rewards Server Running on port ${PORT}`);
  console.log(`Fixed Conversion Rate: 1 USDT = ${FIXED_RATE} INR`);
  console.log(`Admin Panel Password: ${ADMIN_PASSWORD}`);
  console.log(`====================================================`);
});

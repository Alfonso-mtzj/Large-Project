/**
 * auth.test.js
 * Unit tests for all SkillTree backend auth routes:
 *   POST /api/register
 *   GET  /api/verify/:token
 *   POST /api/login
 *   POST /api/forgot-password
 *   POST /api/reset-password/:token
 *
 * Uses Jest + Supertest to send HTTP requests to the Express app.
 * MongoDB is mocked with jest-mock — no real database connection needed.
 * SendGrid is mocked so no emails are actually sent during tests.
 *
 * HOW TO RUN:
 *   1. cd skilltree-backend
 *   2. npm install --save-dev jest supertest jest-mock
 *   3. Add to package.json scripts: "test": "jest --forceExit"
 *   4. npm test
 */

const request  = require('supertest');
const bcrypt   = require('bcryptjs');
const express  = require('express');
const mongoose = require('mongoose');

// ── MOCK SENDGRID ─────────────────────────────────────────────────────────────
// Prevents any real emails from being sent during tests
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send:      jest.fn().mockResolvedValue(true),
}));

// ── MOCK USER MODEL ───────────────────────────────────────────────────────────
// Replaces all database calls with in-memory mock functions
// so tests run instantly without needing a MongoDB connection
jest.mock('../models/User');
const User = require('../models/User');

// ── BUILD A MINIMAL EXPRESS APP FOR TESTING ───────────────────────────────────
// Mirrors how server.js mounts the auth routes
const app = express();
app.use(express.json());
app.use('/api', require('../routes/auth'));

// ── HELPER — build a fake saved user ─────────────────────────────────────────
// Returns an object that looks like a Mongoose document with a .save() method
const makeFakeUser = (overrides = {}) => ({
  _id:                 'abc123',
  firstName:           'Test',
  lastName:            'User',
  username:            'testuser',
  email:               'test@example.com',
  password:            bcrypt.hashSync('Password1!', 10),
  isVerified:          true,
  verificationToken:   null,
  resetPasswordToken:  null,
  resetPasswordExpires: null,
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ── RESET ALL MOCKS BETWEEN TESTS ────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  // Set required env vars
  process.env.CLIENT_URL       = 'https://lifexpskilltree.xyz';
  process.env.SENDGRID_API_KEY = 'SG.test';
  process.env.SMTP_USER        = 'test@skilltree.com';
});

// =============================================================================
//  REGISTER  POST /api/register
// =============================================================================
describe('POST /api/register', () => {

  // ── valid registration ────────────────────────────────────────────────────
  test('returns 200 and success message when user data is valid', async () => {
    // No existing user found
    User.findOne.mockResolvedValue(null);
    // .save() succeeds
    User.prototype.save = jest.fn().mockResolvedValue(true);

    const res = await request(app)
      .post('/api/register')
      .send({
        firstName: 'Alfonso',
        lastName:  'Rivas',
        username:  'alfonso123',
        email:     'alfonso@example.com',
        password:  'Password1!',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/registered successfully/i);
  });

  // ── duplicate email or username ───────────────────────────────────────────
  test('returns 400 when email or username already exists', async () => {
    // Simulate an existing user in the database
    User.findOne.mockResolvedValue(makeFakeUser());

    const res = await request(app)
      .post('/api/register')
      .send({
        firstName: 'Alfonso',
        lastName:  'Rivas',
        username:  'testuser',        // already taken
        email:     'test@example.com', // already taken
        password:  'Password1!',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already exists/i);
  });

  // ── missing required fields ───────────────────────────────────────────────
  test('returns 500 when required fields are missing', async () => {
    User.findOne.mockResolvedValue(null);

    // .save() throws a Mongoose validation error (no firstName/lastName)
    User.prototype.save = jest.fn().mockRejectedValue(
      new Error('User validation failed: firstName is required')
    );

    const res = await request(app)
      .post('/api/register')
      .send({
        username: 'noname',
        email:    'noname@example.com',
        password: 'Password1!',
        // firstName and lastName intentionally missing
      });

    expect(res.status).toBe(500);
  });

});

// =============================================================================
//  VERIFY EMAIL  GET /api/verify/:token
// =============================================================================
describe('GET /api/verify/:token', () => {

  // ── valid token ───────────────────────────────────────────────────────────
  test('verifies the user and returns success message for a valid token', async () => {
    const fakeUser = makeFakeUser({
      isVerified:        false,
      verificationToken: 'validtoken123',
    });
    User.findOne.mockResolvedValue(fakeUser);

    const res = await request(app).get('/api/verify/validtoken123');

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/verified successfully/i);
    // isVerified should have been set to true before saving
    expect(fakeUser.isVerified).toBe(true);
    expect(fakeUser.verificationToken).toBeNull();
    expect(fakeUser.save).toHaveBeenCalledTimes(1);
  });

  // ── invalid token ─────────────────────────────────────────────────────────
  test('returns 400 for an invalid or already-used token', async () => {
    // No user found with this token
    User.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/verify/badtoken');

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/invalid or expired/i);
  });

});

// =============================================================================
//  LOGIN  POST /api/login
// =============================================================================
describe('POST /api/login', () => {

  // ── correct credentials, verified account ────────────────────────────────
  test('returns 200 and user data for valid credentials', async () => {
    const fakeUser = makeFakeUser({ isVerified: true });
    User.findOne.mockResolvedValue(fakeUser);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'Password1!' });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.firstName).toBe('Test');
    // Password should never be returned
    expect(res.body.password).toBeUndefined();
  });

  // ── email not found ───────────────────────────────────────────────────────
  test('returns 400 when email does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'nobody@example.com', password: 'Password1!' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });

  // ── wrong password ────────────────────────────────────────────────────────
  test('returns 400 when password is incorrect', async () => {
    const fakeUser = makeFakeUser({ isVerified: true });
    User.findOne.mockResolvedValue(fakeUser);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'WrongPassword!' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });

  // ── unverified account ────────────────────────────────────────────────────
  test('returns 401 when account email has not been verified', async () => {
    const fakeUser = makeFakeUser({ isVerified: false });
    User.findOne.mockResolvedValue(fakeUser);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'Password1!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/not verified/i);
  });

});

// =============================================================================
//  FORGOT PASSWORD  POST /api/forgot-password
// =============================================================================
describe('POST /api/forgot-password', () => {

  // ── email exists ──────────────────────────────────────────────────────────
  test('returns 200 generic message when email exists', async () => {
    const fakeUser = makeFakeUser();
    User.findOne.mockResolvedValue(fakeUser);

    const res = await request(app)
      .post('/api/forgot-password')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/password reset token has been sent/i);
    // Reset token should have been saved to the user
    expect(fakeUser.save).toHaveBeenCalledTimes(1);
    expect(fakeUser.resetPasswordToken).not.toBeNull();
    expect(fakeUser.resetPasswordExpires).not.toBeNull();
  });

  // ── email does not exist ──────────────────────────────────────────────────
  // Security: should still return 200 so attackers can't tell if email exists
  test('returns 200 generic message even when email does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/forgot-password')
      .send({ email: 'nobody@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/password reset token has been sent/i);
  });

  // ── missing email field ───────────────────────────────────────────────────
  test('returns 400 when no email is provided in the request body', async () => {
    const res = await request(app)
      .post('/api/forgot-password')
      .send({});  // empty body

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email is required/i);
  });

});

// =============================================================================
//  RESET PASSWORD  POST /api/reset-password/:token
// =============================================================================
describe('POST /api/reset-password/:token', () => {

  // ── valid token and new password ──────────────────────────────────────────
  test('returns 200 and resets password for a valid token', async () => {
    const fakeUser = makeFakeUser({
      resetPasswordToken:   'resettoken123',
      resetPasswordExpires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    });
    User.findOne.mockResolvedValue(fakeUser);

    const res = await request(app)
      .post('/api/reset-password/resettoken123')
      .send({ password: 'NewPassword1!' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset successfully/i);
    // Token fields should be cleared after reset
    expect(fakeUser.resetPasswordToken).toBeNull();
    expect(fakeUser.resetPasswordExpires).toBeNull();
    expect(fakeUser.save).toHaveBeenCalledTimes(1);
  });

  // ── invalid or expired token ──────────────────────────────────────────────
  test('returns 400 for an invalid or expired reset token', async () => {
    // No user found matching token + expiry check
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/reset-password/expiredtoken')
      .send({ password: 'NewPassword1!' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });

  // ── missing password field ────────────────────────────────────────────────
  test('returns 400 when no new password is provided', async () => {
    const res = await request(app)
      .post('/api/reset-password/sometoken')
      .send({});  // no password

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password is required/i);
  });

  // ── password is actually hashed before saving ─────────────────────────────
  test('saves a hashed password, not plain text', async () => {
    const fakeUser = makeFakeUser({
      resetPasswordToken:   'hashchecktoken',
      resetPasswordExpires: new Date(Date.now() + 1000 * 60 * 60),
    });
    User.findOne.mockResolvedValue(fakeUser);

    await request(app)
      .post('/api/reset-password/hashchecktoken')
      .send({ password: 'NewPassword1!' });

    // The saved password should NOT equal the plain text
    expect(fakeUser.password).not.toBe('NewPassword1!');
    // And it should be a valid bcrypt hash
    const isHashed = await bcrypt.compare('NewPassword1!', fakeUser.password);
    expect(isHashed).toBe(true);
  });

});
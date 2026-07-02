/**
 * Bazario — Quick Admin Creator (no prompts)
 * Edit the 3 lines below, then run:
 *   node scripts/createAdminQuick.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';



dotenv.config();

// ── EDIT THESE ─────────────────────────────────────────────────────────────
const ADMIN_NAME     = 'Admin';
const ADMIN_EMAIL    = 'rm6915794@bazario.com';
const ADMIN_PASSWORD = 'admin123';
// ───────────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true },
  role:          { type: String, enum: ['buyer','vendor','admin'], default: 'buyer' },
  avatar:        { url: String, public_id: String },
  addresses:     Array,
  wishlist:      Array,
  refreshToken:  String,
  isActive:      { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI not found in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB');

  const hashed   = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    existing.role     = 'admin';
    existing.password = hashed;
    existing.isActive = true;
    await existing.save();
    console.log(`✅  Existing user "${ADMIN_EMAIL}" promoted to admin & password reset.`);
  } else {
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashed, role: 'admin' });
    console.log(`✅  Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  console.log('👉  Log in at: http://localhost:5173/login');
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e.message); process.exit(1); });

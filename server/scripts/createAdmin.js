/**
 * Bazario — Create Admin User Script
 * Run from the server/ folder:
 *   node scripts/createAdmin.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';

dotenv.config();

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

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
  console.log('\n🔧  Bazario Admin Creator\n');

  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI not found in .env\n    Make sure you run this from inside the server/ folder.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB\n');

  const email    = (await ask('Admin email    : ')).trim().toLowerCase();
  const name     = (await ask('Admin name     : ')).trim();
  const password = (await ask('Admin password : ')).trim();

  if (!email || !name || password.length < 6) {
    console.error('\n❌  All fields required; password must be at least 6 characters.');
    rl.close();
    await mongoose.disconnect();
    process.exit(1);
  }

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role     = 'admin';
    existing.isActive = true;
    const changePw = (await ask(`\nUser already exists (current role: ${existing.role}).\nUpdate their password too? (y/n) : `)).trim().toLowerCase();
    if (changePw === 'y') {
      existing.password = await bcrypt.hash(password, 12);
      console.log('   Password updated.');
    }
    await existing.save();
    console.log(`\n✅  User promoted to admin!`);
    console.log(`    Email : ${existing.email}`);
    console.log(`    Name  : ${existing.name}`);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    const admin  = await User.create({ name, email, password: hashed, role: 'admin' });
    console.log(`\n✅  Admin account created!`);
    console.log(`    Name  : ${admin.name}`);
    console.log(`    Email : ${admin.email}`);
  }

  console.log('\n👉  Log in at: http://localhost:5173/login');
  console.log('    Then visit: http://localhost:5173/admin\n');

  rl.close();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('\n❌  Error:', err.message);
  rl.close();
  process.exit(1);
});

import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} from '../utils/tokenUtils.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Only allow buyer or vendor registration publicly
  const allowedRoles = ['buyer', 'vendor'];
  const userRole = allowedRoles.includes(role) ? role : 'buyer';

  const user = await User.create({ name, email, password, role: userRole });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    accessToken,
  });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Account has been deactivated' });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    accessToken,
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (needs refresh token cookie)
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh token invalid or expired' });
  }
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }
  clearTokenCookies(res);
  res.json({ message: 'Logged out successfully' });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

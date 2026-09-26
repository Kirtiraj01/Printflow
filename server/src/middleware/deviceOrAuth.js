import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const deviceOrAuth = async (req, res, next) => {
  // 1. Check for X-Device-Id header
  const deviceId = req.headers['x-device-id'];
  if (deviceId && typeof deviceId === 'string' && deviceId.trim()) {
    req.deviceId = deviceId.trim();
  }

  // 2. Check for Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'printflow_super_secret_campus_key_2026');
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // Ignore token parse error if deviceId is present
    }
  }

  if (!req.deviceId && !req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access requires an X-Device-Id header or valid Admin Authorization token.',
    });
  }

  next();
};

export const requireDevice = (req, res, next) => {
  const deviceId = req.headers['x-device-id'];
  if (!deviceId || typeof deviceId !== 'string' || !deviceId.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid X-Device-Id header. Anonymous device identification required.',
    });
  }
  req.deviceId = deviceId.trim();
  next();
};

import Order from '../models/Order.js';

export async function generateUniqueOrderCode(maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const exists = await Order.exists({ orderCode: code });
    if (!exists) {
      return code;
    }
  }
  // Fallback if 4-digit namespace experiences dense collisions
  return Math.floor(10000 + Math.random() * 90000).toString();
}

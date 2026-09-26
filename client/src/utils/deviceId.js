/**
 * Device ID Resolution:
 * Returns the stored ID if present in localStorage,
 * else 'demo-device-alex' ONLY when import.meta.env.DEV is true,
 * else crypto.randomUUID().
 */
export function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem('printflow_device_id') || localStorage.getItem('weprint_device_id');
  if (deviceId) {
    localStorage.setItem('printflow_device_id', deviceId);
    return deviceId;
  }

  if (import.meta.env.DEV) {
    deviceId = 'demo-device-alex';
  } else {
    deviceId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'device-' + Math.random().toString(36).substring(2, 15);
  }

  localStorage.setItem('printflow_device_id', deviceId);
  return deviceId;
}

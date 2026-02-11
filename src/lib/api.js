import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Get or create device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Add device ID header to every request
api.interceptors.request.use((config) => {
  config.headers['X-Device-Id'] = getDeviceId();
  return config;
});

export default api;

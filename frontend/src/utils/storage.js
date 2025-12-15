const TOKEN_KEY = 'lovers_token';
const USER_KEY = 'lovers_user';
const POINTS_KEY = 'lovers_points';

const storage = {
  setToken(token) {
    try {
      uni.setStorageSync(TOKEN_KEY, token);
    } catch (e) {
      console.error('保存Token失败:', e);
    }
  },

  getToken() {
    try {
      return uni.getStorageSync(TOKEN_KEY) || '';
    } catch (e) {
      console.error('获取Token失败:', e);
      return '';
    }
  },

  removeToken() {
    try {
      uni.removeStorageSync(TOKEN_KEY);
    } catch (e) {
      console.error('删除Token失败:', e);
    }
  },

  setUser(user) {
    try {
      uni.setStorageSync(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('保存用户信息失败:', e);
    }
  },

  getUser() {
    try {
      const userStr = uni.getStorageSync(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('获取用户信息失败:', e);
      return null;
    }
  },

  removeUser() {
    try {
      uni.removeStorageSync(USER_KEY);
    } catch (e) {
      console.error('删除用户信息失败:', e);
    }
  },

  setPoints(points) {
    try {
      uni.setStorageSync(POINTS_KEY, points);
    } catch (e) {
      console.error('保存情力值失败:', e);
    }
  },

  getPoints() {
    try {
      return uni.getStorageSync(POINTS_KEY) || 0;
    } catch (e) {
      console.error('获取情力值失败:', e);
      return 0;
    }
  },

  updatePoints(points) {
    this.setPoints(points);
    const user = this.getUser();
    if (user) {
      user.points = points;
      this.setUser(user);
    }
  },

  isLoggedIn() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  },

  clear() {
    try {
      this.removeToken();
      this.removeUser();
      uni.removeStorageSync(POINTS_KEY);
    } catch (e) {
      console.error('清空存储失败:', e);
    }
  },

  setItem(key, value) {
    try {
      const data = typeof value === 'object' ? JSON.stringify(value) : value;
      uni.setStorageSync(key, data);
    } catch (e) {
      console.error(`保存${key}失败:`, e);
    }
  },

  getItem(key) {
    try {
      const data = uni.getStorageSync(key);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (e) {
      console.error(`获取${key}失败:`, e);
      return null;
    }
  },

  removeItem(key) {
    try {
      uni.removeStorageSync(key);
    } catch (e) {
      console.error(`删除${key}失败:`, e);
    }
  }
};

export default storage;
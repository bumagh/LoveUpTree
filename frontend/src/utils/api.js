const BASE_URL = 'http://localhost:3000/api';

const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const { method = 'GET', data = {}, header = {} } = options;

    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          uni.showToast({
            title: res.data.message || '请求失败',
            icon: 'none',
            duration: 2000
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        uni.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
  });
};

const api = {
  register (username, password) {
    return request('/auth/register', {
      method: 'POST',
      data: { username, password }
    });
  },

  login (username, password) {
    return request('/auth/login', {
      method: 'POST',
      data: { username, password }
    });
  },

  getTasks (userId, status = '', category = '') {
    const params = { user_id: userId };
    if (status) params.status = status;
    if (category) params.category = category;

    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    return request(`/tasks?${queryString}`);
  },

  createTask (taskData) {
    return request('/tasks', {
      method: 'POST',
      data: taskData
    });
  },

  updateTask (taskId, updateData) {
    return request(`/tasks/${taskId}`, {
      method: 'PUT',
      data: updateData
    });
  },

  deleteTask (taskId, userId) {
    return request(`/tasks/${taskId}?user_id=${userId}`, {
      method: 'DELETE'
    });
  },

  getTaskStats (userId) {
    return request(`/tasks/stats?user_id=${userId}`);
  },

  getPoints (userId) {
    return request(`/points?user_id=${userId}`);
  },

  completeTask (userId, taskId) {
    return request('/points', {
      method: 'POST',
      data: { user_id: userId, task_id: taskId }
    });
  },

  getFruits (userId) {
    return request(`/fruits?user_id=${userId}`);
  },

  unlockFruit (fruitId, userId) {
    return request(`/fruits/${fruitId}/unlock`, {
      method: 'PUT',
      data: { user_id: userId }
    });
  },

  checkStatus () {
    return request('/status');
  }
};

export default api;
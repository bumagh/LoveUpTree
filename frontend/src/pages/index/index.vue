<template>
  <view class="index-container">
    <view class="header-section">
      <view class="welcome-box">
        <text class="welcome-text">💕 恋人古情树 💕</text>
        <text class="welcome-subtitle">愿你们的爱情之树茁壮成长</text>
      </view>
      <view class="user-info" @click="handleUserClick">
        <view class="avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="user-details">
          <text class="username">{{ userName }}</text>
          <view class="points-row">
            <text class="points-icon">💖</text>
            <text class="points-value">{{ userPoints }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="tree-preview-section" @click="goToTree">
      <view class="tree-bg">
        <image 
          class="tree-image" 
          src="https://hpi-hub.tos-cn-beijing.volces.com/static/biology/tree-8378346_1280.png" 
          mode="aspectFit"
        />
        <view class="tree-overlay">
          <text class="tree-title">🌳 查看古情树</text>
          <text class="tree-hint">点击查看您的果实收获</text>
        </view>
      </view>
    </view>

    <view class="stats-grid">
      <view class="stat-item">
        <text class="stat-icon">📋</text>
        <text class="stat-value">{{ taskStats.total }}</text>
        <text class="stat-label">总任务</text>
      </view>
      <view class="stat-item">
        <text class="stat-icon">✅</text>
        <text class="stat-value">{{ taskStats.completed }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-item">
        <text class="stat-icon">⏳</text>
        <text class="stat-value">{{ taskStats.pending }}</text>
        <text class="stat-label">待完成</text>
      </view>
      <view class="stat-item">
        <text class="stat-icon">🎁</text>
        <text class="stat-value">{{ unlockedFruits }}</text>
        <text class="stat-label">已解锁果实</text>
      </view>
    </view>

    <view class="quick-actions">
      <view class="section-title">
        <text class="title-icon">⚡</text>
        <text class="title-text">快捷入口</text>
      </view>
      <view class="actions-grid">
        <view class="action-card" @click="goToTask">
          <text class="action-icon">📝</text>
          <text class="action-name">任务列表</text>
        </view>
        <view class="action-card" @click="goToHousework">
          <text class="action-icon">🧹</text>
          <text class="action-name">家务安排</text>
        </view>
        <view class="action-card" @click="goToSchedule">
          <text class="action-icon">📅</text>
          <text class="action-name">时间安排</text>
        </view>
        <view class="action-card" @click="goToTree">
          <text class="action-icon">🌳</text>
          <text class="action-name">古情树</text>
        </view>
      </view>
    </view>

    <view class="recent-tasks">
      <view class="section-title">
        <text class="title-icon">📌</text>
        <text class="title-text">近期任务</text>
        <text class="more-link" @click="goToTask">查看全部 →</text>
      </view>

      <scroll-view class="tasks-scroll" scroll-y>
        <view v-if="recentTasks.length === 0" class="empty-tasks">
          <text class="empty-icon">📭</text>
          <text class="empty-text">暂无近期任务</text>
        </view>

        <view 
          class="task-item" 
          v-for="task in recentTasks" 
          :key="task.id"
          @click="viewTaskDetail(task)"
        >
          <view class="task-left">
            <text class="task-category-icon">{{ getCategoryIcon(task.category) }}</text>
            <view class="task-content">
              <text class="task-title">{{ task.title }}</text>
              <view class="task-meta-row">
                <view v-if="task.due_date" class="meta-item">
                  <text class="meta-icon">⏰</text>
                  <text class="meta-text">{{ formatDate(task.due_date) }}</text>
                </view>
                <view class="meta-item">
                  <text class="meta-icon">💖</text>
                  <text class="meta-text">+{{ task.points }}</text>
                </view>
              </view>
            </view>
          </view>
          <view 
            class="task-status"
            :class="task.status === 'completed' ? 'status-completed' : 'status-pending'"
          >
            {{ task.status === 'completed' ? '✓' : '○' }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="showLogoutConfirm" class="modal-overlay" @click="closeLogout">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">退出登录</text>
          <text class="modal-close" @click="closeLogout">✕</text>
        </view>
        <view class="modal-body">
          <text class="modal-text">确定要退出登录吗？</text>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeLogout">取消</button>
          <button class="btn-confirm" @click="confirmLogout">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js';
import storage from '@/utils/storage.js';

export default {
  data() {
    return {
      userName: '游客',
      userPoints: 0,
      taskStats: {
        total: 0,
        completed: 0,
        pending: 0
      },
      unlockedFruits: 0,
      recentTasks: [],
      showLogoutConfirm: false
    };
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    if (storage.isLoggedIn()) {
      this.loadUserData();
      this.loadTaskStats();
      this.loadRecentTasks();
      this.loadFruitsCount();
    }
  },

  methods: {
    checkLogin() {
      const user = storage.getUser();
      if (!user) {
        uni.showModal({
          title: '提示',
          content: '请先登录',
          showCancel: false,
          success: () => {
            uni.navigateTo({ url: '/pages/login/index' });
          }
        });
        return;
      }
      this.userName = user.username || '用户';
    },

    async loadUserData() {
      try {
        const user = storage.getUser();
        if (!user) return;

        this.userName = user.username || '用户';

        const res = await api.getPoints(user.user_id);
        if (res.success) {
          this.userPoints = res.data.points || 0;
          storage.updatePoints(this.userPoints);
        }
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    },

    async loadTaskStats() {
      try {
        const user = storage.getUser();
        if (!user) return;

        const res = await api.getTaskStats(user.user_id);
        if (res.success) {
          this.taskStats = res.data;
        }
      } catch (error) {
        console.error('加载任务统计失败:', error);
      }
    },

    async loadRecentTasks() {
      try {
        const user = storage.getUser();
        if (!user) return;

        const res = await api.getTasks(user.user_id);
        if (res.success) {
          this.recentTasks = (res.data || []).slice(0, 5);
        }
      } catch (error) {
        console.error('加载近期任务失败:', error);
      }
    },

    async loadFruitsCount() {
      try {
        const user = storage.getUser();
        if (!user) return;

        const res = await api.getFruits(user.user_id);
        if (res.success) {
          const fruits = res.data || [];
          this.unlockedFruits = fruits.filter(f => f.unlocked).length;
        }
      } catch (error) {
        console.error('加载果实数量失败:', error);
      }
    },

    getCategoryIcon(category) {
      const icons = {
        general: '📝',
        housework: '🧹',
        date: '💑',
        study: '📚',
        exercise: '🏃'
      };
      return icons[category] || '📝';
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      const diffDays = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '明天';
      if (diffDays === -1) return '昨天';
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}-${day}`;
    },

    viewTaskDetail(task) {
      uni.showModal({
        title: task.title,
        content: task.description || '暂无描述',
        confirmText: task.status === 'pending' ? '完成任务' : '确定',
        showCancel: task.status === 'pending',
        success: (res) => {
          if (res.confirm && task.status === 'pending') {
            this.completeTask(task);
          }
        }
      });
    },

    async completeTask(task) {
      try {
        const user = storage.getUser();
        if (!user) return;

        uni.showLoading({ title: '处理中...', mask: true });

        const res = await api.completeTask(user.user_id, task.id);
        
        if (res.success) {
          uni.showToast({
            title: `获得${task.points}点情力`,
            icon: 'success',
            duration: 2000
          });
          
          this.loadUserData();
          this.loadTaskStats();
          this.loadRecentTasks();
        }
      } catch (error) {
        console.error('完成任务失败:', error);
      } finally {
        uni.hideLoading();
      }
    },

    handleUserClick() {
      this.showLogoutConfirm = true;
    },

    closeLogout() {
      this.showLogoutConfirm = false;
    },

    confirmLogout() {
      storage.clear();
      uni.showToast({
        title: '已退出登录',
        icon: 'success',
        duration: 1500
      });
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/index' });
      }, 1500);
    },

    goToTask() {
      uni.switchTab({ url: '/pages/task/index' });
    },

    goToHousework() {
      uni.switchTab({ url: '/pages/housework/index' });
    },

    goToSchedule() {
      uni.switchTab({ url: '/pages/schedule/index' });
    },

    goToTree() {
      uni.switchTab({ url: '/pages/tree/index' });
    }
  }
};
</script>

<style scoped>
page {
  background: linear-gradient(135deg, #ffeef8 0%, #e8f5e9 100%);
  min-height: 100vh;
}

.index-container {
  padding: 32rpx;
  padding-bottom: 150rpx;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.welcome-box {
  display: flex;
  flex-direction: column;
}

.welcome-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff69b4;
  margin-bottom: 8rpx;
}

.welcome-subtitle {
  font-size: 24rpx;
  color: #999999;
}

.user-info {
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 16rpx 24rpx;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.avatar-icon {
  font-size: 36rpx;
  color: #ffffff;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.points-row {
  display: flex;
  align-items: center;
}

.points-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.points-value {
  font-size: 24rpx;
  color: #ff69b4;
  font-weight: bold;
}

.tree-preview-section {
  position: relative;
  width: 100%;
  height: 400rpx;
  margin-bottom: 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(255, 105, 180, 0.15);
}

.tree-bg {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
}

.tree-image {
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.tree-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(255, 105, 180, 0.9), transparent);
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tree-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.tree-hint {
  font-size: 24rpx;
  color: #ffffff;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.stat-item {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.stat-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff69b4;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #999999;
}

.quick-actions {
  margin-bottom: 32rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.title-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
}

.more-link {
  font-size: 24rpx;
  color: #ff69b4;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.action-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.action-card:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.action-name {
  font-size: 24rpx;
  color: #333333;
  text-align: center;
}

.recent-tasks {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.tasks-scroll {
  max-height: 600rpx;
}

.empty-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.task-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.task-category-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.task-title {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.task-meta-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  font-size: 20rpx;
  margin-right: 6rpx;
}

.meta-text {
  font-size: 20rpx;
  color: #999999;
}

.task-status {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
}

.status-pending {
  background: #fff3e0;
  color: #ff9800;
}

.status-completed {
  background: #e8f5e9;
  color: #4caf50;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 80%;
  max-width: 500rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.modal-close {
  font-size: 40rpx;
  color: #999999;
}

.modal-body {
  margin-bottom: 32rpx;
}

.modal-text {
  font-size: 28rpx;
  color: #666666;
  text-align: center;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.btn-cancel {
  background: #f8f8f8;
  color: #666666;
}

.btn-confirm {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: #ffffff;
}
</style>
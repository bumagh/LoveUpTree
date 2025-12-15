<template>
  <view class="housework-container">
    <view class="header-section">
      <view class="header-title">
        <text class="title-icon">🧹</text>
        <text class="title-text">家务安排</text>
      </view>
      <view class="points-badge">
        <text class="points-icon">💖</text>
        <text class="points-text">{{ userPoints }}</text>
      </view>
    </view>

    <view class="filter-section">
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'all' }"
          @click="setFilter('all')"
        >
          <text>全部({{ allCount }})</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'pending' }"
          @click="setFilter('pending')"
        >
          <text>待完成({{ pendingCount }})</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'completed' }"
          @click="setFilter('completed')"
        >
          <text>已完成({{ completedCount }})</text>
        </view>
      </view>
    </view>

    <scroll-view 
      class="housework-list" 
      scroll-y
      :style="{ height: listHeight }"
    >
      <view v-if="filteredTasks.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无家务任务</text>
        <text class="empty-hint">点击右下角按钮添加新任务</text>
      </view>

      <view 
        class="housework-card" 
        v-for="task in filteredTasks" 
        :key="task.id"
      >
        <view class="card-header">
          <view class="task-info">
            <text class="task-icon">{{ getTaskIcon(task.title) }}</text>
            <view class="task-details">
              <text class="task-title">{{ task.title }}</text>
              <text v-if="task.assigned_to" class="task-assigned">
                分配给：{{ task.assigned_to }}
              </text>
            </view>
          </view>
          <view 
            class="status-badge"
            :class="task.status === 'completed' ? 'status-completed' : 'status-pending'"
          >
            {{ task.status === 'completed' ? '已完成' : '待完成' }}
          </view>
        </view>

        <view v-if="task.description" class="task-description">
          <text>{{ task.description }}</text>
        </view>

        <view class="card-footer">
          <view class="task-meta">
            <text class="meta-icon">💖</text>
            <text class="meta-text">+{{ task.points }} 情力</text>
          </view>
          <view v-if="task.due_date" class="task-meta">
            <text class="meta-icon">⏰</text>
            <text class="meta-text">{{ formatDate(task.due_date) }}</text>
          </view>
        </view>

        <view class="card-actions">
          <button 
            v-if="task.status === 'pending'" 
            class="btn-complete" 
            @click="completeTask(task)"
          >
            完成任务
          </button>
          <button 
            class="btn-edit" 
            @click="editTask(task)"
          >
            编辑
          </button>
          <button 
            class="btn-delete" 
            @click="deleteTask(task)"
          >
            删除
          </button>
        </view>
      </view>
    </scroll-view>

    <view class="add-btn" @click="showAddModal">
      <text class="add-icon">+</text>
    </view>

    <view v-if="showModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEdit ? '编辑任务' : '新建家务任务' }}</text>
          <text class="modal-close" @click="closeModal">✕</text>
        </view>

        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">任务名称</text>
            <input 
              class="form-input" 
              v-model="formData.title" 
              placeholder="例如：洗碗、拖地、洗衣服"
              maxlength="30"
            />
          </view>

          <view class="form-group">
            <text class="form-label">任务描述</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.description" 
              placeholder="详细描述任务内容（可选）"
              maxlength="200"
            />
          </view>

          <view class="form-group">
            <text class="form-label">分配给</text>
            <input 
              class="form-input" 
              v-model="formData.assigned_to" 
              placeholder="输入伴侣名称（可选）"
              maxlength="20"
            />
          </view>

          <view class="form-group">
            <text class="form-label">截止日期</text>
            <picker 
              mode="date" 
              :value="formData.due_date"
              @change="onDateChange"
            >
              <view class="picker-view">
                <text>{{ formData.due_date || '选择日期' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>

          <view class="form-group">
            <text class="form-label">奖励情力</text>
            <input 
              class="form-input" 
              v-model="formData.points" 
              type="number"
              placeholder="默认10点"
            />
          </view>
        </view>

        <view class="modal-footer">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-confirm" @click="handleSubmit">
            {{ isEdit ? '保存' : '创建' }}
          </button>
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
      userPoints: 0,
      currentFilter: 'all',
      tasks: [],
      filteredTasks: [],
      showModal: false,
      isEdit: false,
      editingTaskId: null,
      listHeight: '600rpx',
      formData: {
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        points: 10
      },
      taskIcons: {
        '洗碗': '🍽️',
        '拖地': '🧹',
        '洗衣服': '👔',
        '做饭': '🍳',
        '打扫': '🧽',
        '整理': '📦',
        '倒垃圾': '🗑️',
        '浇花': '🌸'
      }
    };
  },

  computed: {
    allCount() {
      return this.tasks.length;
    },
    pendingCount() {
      return this.tasks.filter(t => t.status === 'pending').length;
    },
    completedCount() {
      return this.tasks.filter(t => t.status === 'completed').length;
    }
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    this.loadUserPoints();
    this.loadTasks();
  },

  methods: {
    initPage() {
      const user = storage.getUser();
      if (!user) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/login/index' });
        }, 2000);
        return;
      }

      this.calculateListHeight();
    },

    calculateListHeight() {
      const systemInfo = uni.getSystemInfoSync();
      const windowHeight = systemInfo.windowHeight;
      const headerHeight = 120;
      const filterHeight = 100;
      const bottomPadding = 100;
      
      const availableHeight = windowHeight - headerHeight - filterHeight - bottomPadding;
      this.listHeight = `${availableHeight}rpx`;
    },

    async loadUserPoints() {
      try {
        const user = storage.getUser();
        if (!user) return;

        const res = await api.getPoints(user.user_id);
        if (res.success) {
          this.userPoints = res.data.points || 0;
          storage.updatePoints(this.userPoints);
        }
      } catch (error) {
        console.error('加载情力值失败:', error);
      }
    },

    async loadTasks() {
      try {
        const user = storage.getUser();
        if (!user) return;

        uni.showLoading({ title: '加载中...', mask: true });

        const res = await api.getTasks(user.user_id, '', 'housework');
        
        if (res.success) {
          this.tasks = res.data || [];
          this.filterTasks();
        }
      } catch (error) {
        console.error('加载任务失败:', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none',
          duration: 2000
        });
      } finally {
        uni.hideLoading();
      }
    },

    setFilter(filter) {
      this.currentFilter = filter;
      this.filterTasks();
    },

    filterTasks() {
      if (this.currentFilter === 'all') {
        this.filteredTasks = this.tasks;
      } else {
        this.filteredTasks = this.tasks.filter(task => task.status === this.currentFilter);
      }
    },

    getTaskIcon(title) {
      for (const key in this.taskIcons) {
        if (title.includes(key)) {
          return this.taskIcons[key];
        }
      }
      return '🧹';
    },

    formatDate(dateStr) {
      if (!dateStr) return '未设置';
      const date = new Date(dateStr);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}月${day}日`;
    },

    async completeTask(task) {
      try {
        const user = storage.getUser();
        if (!user) return;

        uni.showModal({
          title: '确认完成',
          content: `完成【${task.title}】可获得${task.points}点情力`,
          success: async (res) => {
            if (res.confirm) {
              uni.showLoading({ title: '处理中...', mask: true });

              try {
                const response = await api.completeTask(user.user_id, task.id);
                
                if (response.success) {
                  uni.showToast({
                    title: `获得${task.points}点情力`,
                    icon: 'success',
                    duration: 2000
                  });
                  
                  this.loadUserPoints();
                  this.loadTasks();
                }
              } catch (error) {
                console.error('完成任务失败:', error);
              } finally {
                uni.hideLoading();
              }
            }
          }
        });
      } catch (error) {
        console.error('完成任务失败:', error);
      }
    },

    editTask(task) {
      this.isEdit = true;
      this.editingTaskId = task.id;
      this.formData = {
        title: task.title,
        description: task.description || '',
        assigned_to: task.assigned_to || '',
        due_date: task.due_date ? task.due_date.split(' ')[0] : '',
        points: task.points || 10
      };
      this.showModal = true;
    },

    deleteTask(task) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除【${task.title}】吗？`,
        confirmColor: '#ff4444',
        success: async (res) => {
          if (res.confirm) {
            try {
              const user = storage.getUser();
              if (!user) return;

              uni.showLoading({ title: '删除中...', mask: true });

              const response = await api.deleteTask(task.id, user.user_id);
              
              if (response.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000
                });
                
                this.loadTasks();
              }
            } catch (error) {
              console.error('删除任务失败:', error);
            } finally {
              uni.hideLoading();
            }
          }
        }
      });
    },

    showAddModal() {
      this.isEdit = false;
      this.editingTaskId = null;
      this.formData = {
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        points: 10
      };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    onDateChange(e) {
      this.formData.due_date = e.detail.value;
    },

    async handleSubmit() {
      if (!this.formData.title.trim()) {
        uni.showToast({
          title: '请输入任务名称',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      try {
        const user = storage.getUser();
        if (!user) return;

        uni.showLoading({ title: this.isEdit ? '保存中...' : '创建中...', mask: true });

        if (this.isEdit) {
          const updateData = {
            user_id: user.user_id,
            title: this.formData.title.trim(),
            description: this.formData.description.trim(),
            assigned_to: this.formData.assigned_to.trim(),
            due_date: this.formData.due_date ? `${this.formData.due_date} 23:59:59` : null
          };

          const res = await api.updateTask(this.editingTaskId, updateData);

          if (res.success) {
            uni.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            });
            
            this.closeModal();
            this.loadTasks();
          }
        } else {
          const taskData = {
            user_id: user.user_id,
            title: this.formData.title.trim(),
            description: this.formData.description.trim(),
            category: 'housework',
            assigned_to: this.formData.assigned_to.trim(),
            points: parseInt(this.formData.points) || 10,
            due_date: this.formData.due_date ? `${this.formData.due_date} 23:59:59` : null
          };

          const res = await api.createTask(taskData);

          if (res.success) {
            uni.showToast({
              title: '创建成功',
              icon: 'success',
              duration: 2000
            });
            
            this.closeModal();
            this.loadTasks();
          }
        }
      } catch (error) {
        console.error('操作失败:', error);
      } finally {
        uni.hideLoading();
      }
    }
  }
};
</script>

<style scoped>
page {
  background: linear-gradient(135deg, #ffeef8 0%, #e8f5e9 100%);
  min-height: 100vh;
}

.housework-container {
  padding: 32rpx;
  padding-bottom: 150rpx;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.header-title {
  display: flex;
  align-items: center;
}

.title-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.title-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
}

.points-badge {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 105, 180, 0.3);
}

.points-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.points-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
}

.filter-section {
  margin-bottom: 32rpx;
}

.filter-tabs {
  display: flex;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666666;
  transition: all 0.3s;
}

.filter-tab.active {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: #ffffff;
  font-weight: bold;
}

.housework-list {
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999999;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #cccccc;
}

.housework-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.task-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.task-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.task-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.task-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.task-assigned {
  font-size: 24rpx;
  color: #999999;
}

.status-badge {
  font-size: 20rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  white-space: nowrap;
}

.status-pending {
  background: #fff3e0;
  color: #ff9800;
}

.status-completed {
  background: #e8f5e9;
  color: #4caf50;
}

.task-description {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 24rpx;
}

.task-meta {
  display: flex;
  align-items: center;
}

.meta-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999999;
}

.card-actions {
  display: flex;
  gap: 16rpx;
}

.btn-complete,
.btn-edit,
.btn-delete {
  flex: 1;
  height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.btn-complete {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #ffffff;
}

.btn-edit {
  background: #f0f0f0;
  color: #666666;
}

.btn-delete {
  background: #ffebee;
  color: #f44336;
}

.add-btn {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 105, 180, 0.4);
  z-index: 100;
}

.add-icon {
  font-size: 56rpx;
  color: #ffffff;
  font-weight: bold;
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
  width: 90%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.modal-title {
  font-size: 36rpx;
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

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

.picker-view {
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #333333;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999999;
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

uni-input {
  height: auto !important;
  min-height: 0 !important;
  line-height: normal !important;
}
</style>
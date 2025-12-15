<template>
  <view class="schedule-container">
    <view class="header-section">
      <view class="header-title">
        <text class="title-icon">📅</text>
        <text class="title-text">时间安排</text>
      </view>
      <view class="points-badge">
        <text class="points-icon">💖</text>
        <text class="points-text">{{ userPoints }}</text>
      </view>
    </view>

    <view class="calendar-section">
      <view class="calendar-header">
        <text class="month-btn" @click="prevMonth">◀</text>
        <text class="current-month">{{ currentYear }}年{{ currentMonth }}月</text>
        <text class="month-btn" @click="nextMonth">▶</text>
      </view>

      <view class="weekdays">
        <text class="weekday" v-for="(day, index) in weekdays" :key="index">{{ day }}</text>
      </view>

      <view class="calendar-grid">
        <view 
          class="calendar-day" 
          v-for="(day, index) in calendarDays" 
          :key="index"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'selected': day.isSelected,
            'has-task': day.hasTask
          }"
          @click="selectDate(day)"
        >
          <text class="day-number">{{ day.day }}</text>
          <view v-if="day.hasTask" class="task-dot"></view>
        </view>
      </view>
    </view>

    <view class="tasks-section">
      <view class="section-header">
        <text class="section-title">📋 {{ selectedDateStr }} 的任务</text>
        <text class="task-count">({{ filteredTasks.length }})</text>
      </view>

      <scroll-view 
        class="tasks-list" 
        scroll-y
        :style="{ height: tasksListHeight }"
      >
        <view v-if="filteredTasks.length === 0" class="empty-state">
          <text class="empty-icon">📭</text>
          <text class="empty-text">该日期暂无任务</text>
        </view>

        <view 
          class="task-card" 
          v-for="task in filteredTasks" 
          :key="task.id"
          @click="viewTaskDetail(task)"
        >
          <view class="task-header">
            <view class="task-info">
              <text class="task-category-icon">{{ getCategoryIcon(task.category) }}</text>
              <text class="task-title">{{ task.title }}</text>
            </view>
            <view 
              class="task-status-badge"
              :class="task.status === 'completed' ? 'status-completed' : 'status-pending'"
            >
              {{ task.status === 'completed' ? '已完成' : '待完成' }}
            </view>
          </view>

          <view v-if="task.description" class="task-description">
            <text>{{ task.description }}</text>
          </view>

          <view class="task-footer">
            <view class="task-meta">
              <text class="meta-icon">⏰</text>
              <text class="meta-text">{{ formatTime(task.due_date) }}</text>
            </view>
            <view class="task-meta">
              <text class="meta-icon">💖</text>
              <text class="meta-text">+{{ task.points }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="add-btn" @click="showAddTask">
      <text class="add-icon">+</text>
    </view>

    <view v-if="showModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">新建任务</text>
          <text class="modal-close" @click="closeModal">✕</text>
        </view>

        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">任务标题</text>
            <input 
              class="form-input" 
              v-model="newTask.title" 
              placeholder="请输入任务标题"
              maxlength="50"
            />
          </view>

          <view class="form-group">
            <text class="form-label">任务描述</text>
            <textarea 
              class="form-textarea" 
              v-model="newTask.description" 
              placeholder="请输入任务描述（可选）"
              maxlength="200"
            />
          </view>

          <view class="form-group">
            <text class="form-label">任务类型</text>
            <picker 
              mode="selector" 
              :range="categories" 
              :range-key="'label'"
              @change="onCategoryChange"
            >
              <view class="picker-view">
                <text>{{ selectedCategory.label }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>

          <view class="form-group">
            <text class="form-label">截止时间</text>
            <picker 
              mode="time" 
              :value="newTask.time"
              @change="onTimeChange"
            >
              <view class="picker-view">
                <text>{{ newTask.time || '选择时间' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>

          <view class="form-group">
            <text class="form-label">奖励情力</text>
            <input 
              class="form-input" 
              v-model="newTask.points" 
              type="number"
              placeholder="默认10"
            />
          </view>
        </view>

        <view class="modal-footer">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-confirm" @click="handleCreateTask">确认</button>
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
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      selectedDate: new Date(),
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      calendarDays: [],
      tasks: [],
      filteredTasks: [],
      showModal: false,
      tasksListHeight: '500rpx',
      newTask: {
        title: '',
        description: '',
        category: 'general',
        time: '',
        points: 10
      },
      categories: [
        { value: 'general', label: '普通任务' },
        { value: 'housework', label: '家务' },
        { value: 'date', label: '约会' },
        { value: 'study', label: '学习' },
        { value: 'exercise', label: '运动' }
      ],
      selectedCategory: { value: 'general', label: '普通任务' }
    };
  },

  computed: {
    selectedDateStr() {
      const date = this.selectedDate;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

      this.calculateTasksListHeight();
      this.generateCalendar();
      this.loadUserPoints();
      this.loadTasks();
    },

    calculateTasksListHeight() {
      const systemInfo = uni.getSystemInfoSync();
      const windowHeight = systemInfo.windowHeight;
      const headerHeight = 120;
      const calendarHeight = 600;
      const sectionHeaderHeight = 80;
      const bottomPadding = 100;
      
      const availableHeight = windowHeight - headerHeight - calendarHeight - sectionHeaderHeight - bottomPadding;
      this.tasksListHeight = `${availableHeight}rpx`;
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

        const res = await api.getTasks(user.user_id);
        if (res.success) {
          this.tasks = res.data || [];
          this.filterTasksByDate();
          this.generateCalendar();
        }
      } catch (error) {
        console.error('加载任务失败:', error);
      }
    },

    generateCalendar() {
      const year = this.currentYear;
      const month = this.currentMonth;
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const daysInMonth = lastDay.getDate();
      const firstDayOfWeek = firstDay.getDay();

      const days = [];
      const prevMonthLastDay = new Date(year, month - 1, 0).getDate();

      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: prevMonthLastDay - i,
          isCurrentMonth: false,
          date: new Date(year, month - 2, prevMonthLastDay - i)
        });
      }

      const today = new Date();
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month - 1, i);
        const dateStr = this.formatDateStr(currentDate);
        const hasTask = this.tasks.some(task => {
          if (!task.due_date) return false;
          const taskDate = new Date(task.due_date);
          return this.formatDateStr(taskDate) === dateStr;
        });

        days.push({
          day: i,
          isCurrentMonth: true,
          isToday: this.isSameDay(currentDate, today),
          isSelected: this.isSameDay(currentDate, this.selectedDate),
          hasTask: hasTask,
          date: currentDate
        });
      }

      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          isCurrentMonth: false,
          date: new Date(year, month, i)
        });
      }

      this.calendarDays = days;
    },

    prevMonth() {
      if (this.currentMonth === 1) {
        this.currentYear--;
        this.currentMonth = 12;
      } else {
        this.currentMonth--;
      }
      this.generateCalendar();
    },

    nextMonth() {
      if (this.currentMonth === 12) {
        this.currentYear++;
        this.currentMonth = 1;
      } else {
        this.currentMonth++;
      }
      this.generateCalendar();
    },

    selectDate(day) {
      if (!day.isCurrentMonth) return;
      
      this.selectedDate = day.date;
      this.generateCalendar();
      this.filterTasksByDate();
    },

    filterTasksByDate() {
      const selectedDateStr = this.selectedDateStr;
      this.filteredTasks = this.tasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return this.formatDateStr(taskDate) === selectedDateStr;
      });
    },

    formatDateStr(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    isSameDay(date1, date2) {
      return this.formatDateStr(date1) === this.formatDateStr(date2);
    },

    formatTime(dateStr) {
      if (!dateStr) return '未设置';
      const date = new Date(dateStr);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
          
          this.loadUserPoints();
          this.loadTasks();
        }
      } catch (error) {
        console.error('完成任务失败:', error);
      } finally {
        uni.hideLoading();
      }
    },

    showAddTask() {
      this.showModal = true;
      this.newTask = {
        title: '',
        description: '',
        category: 'general',
        time: '',
        points: 10
      };
      this.selectedCategory = this.categories[0];
    },

    closeModal() {
      this.showModal = false;
    },

    onCategoryChange(e) {
      const index = e.detail.value;
      this.selectedCategory = this.categories[index];
      this.newTask.category = this.selectedCategory.value;
    },

    onTimeChange(e) {
      this.newTask.time = e.detail.value;
    },

    async handleCreateTask() {
      if (!this.newTask.title.trim()) {
        uni.showToast({
          title: '请输入任务标题',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      try {
        const user = storage.getUser();
        if (!user) return;

        uni.showLoading({ title: '创建中...', mask: true });

        const dueDate = this.newTask.time 
          ? `${this.selectedDateStr} ${this.newTask.time}:00`
          : `${this.selectedDateStr} 23:59:59`;

        const taskData = {
          user_id: user.user_id,
          title: this.newTask.title.trim(),
          description: this.newTask.description.trim(),
          category: this.newTask.category,
          points: parseInt(this.newTask.points) || 10,
          due_date: dueDate
        };

        const res = await api.createTask(taskData);

        if (res.success) {
          uni.showToast({
            title: '任务创建成功',
            icon: 'success',
            duration: 2000
          });

          this.closeModal();
          this.loadTasks();
        }
      } catch (error) {
        console.error('创建任务失败:', error);
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

.schedule-container {
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

.calendar-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.month-btn {
  font-size: 32rpx;
  color: #ff69b4;
  padding: 8rpx 16rpx;
}

.current-month {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.weekdays {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16rpx;
}

.weekday {
  width: 14.28%;
  text-align: center;
  font-size: 24rpx;
  color: #999999;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-day {
  width: 14.28%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: #fff0f5;
  border: 2rpx solid #ff69b4;
}

.calendar-day.selected {
  background: #ff69b4;
}

.calendar-day.selected .day-number {
  color: #ffffff;
}

.day-number {
  font-size: 28rpx;
  color: #333333;
}

.task-dot {
  width: 8rpx;
  height: 8rpx;
  background: #4caf50;
  border-radius: 50%;
  position: absolute;
  bottom: 8rpx;
}

.tasks-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.task-count {
  font-size: 24rpx;
  color: #999999;
  margin-left: 12rpx;
}

.tasks-list {
  overflow-y: auto;
}

.empty-state {
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

.task-card {
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.task-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.task-category-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.task-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  flex: 1;
}

.task-status-badge {
  font-size: 20rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
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
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 16rpx;
  line-height: 1.5;
}

.task-footer {
  display: flex;
  justify-content: flex-start;
  gap: 32rpx;
}

.task-meta {
  display: flex;
  align-items: center;
}

.meta-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999999;
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
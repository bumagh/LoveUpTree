<template>
  <view class="tree-container">
    <view class="header-section">
      <view class="header-title">
        <text class="title-icon">🌳</text>
        <text class="title-text">古情树</text>
      </view>
      <view class="points-badge">
        <text class="points-icon">💖</text>
        <text class="points-text">{{ userPoints }}</text>
      </view>
    </view>

    <view class="tree-scene">
      <image 
        class="tree-bg" 
        src="https://hpi-hub.tos-cn-beijing.volces.com/static/biology/tree-8378346_1280.png" 
        mode="aspectFit"
      />
      
      <view class="fruits-container">
        <view 
          class="fruit-item" 
          v-for="(fruit, index) in fruits" 
          :key="fruit.id"
          :class="getFruitPositionClass(index)"
          @click="handleFruitClick(fruit)"
        >
          <view class="fruit-wrapper">
            <image 
              class="fruit-icon" 
              :src="fruit.icon" 
              mode="aspectFit"
              :class="{ 'fruit-unlocked': fruit.unlocked, 'fruit-locked': !fruit.unlocked }"
            />
            <view v-if="!fruit.unlocked" class="lock-overlay">
              <text class="lock-icon">🔒</text>
            </view>
            <view v-if="fruit.unlocked" class="unlock-badge">
              <text class="unlock-text">✓</text>
            </view>
          </view>
          <text class="fruit-name">{{ fruit.name }}</text>
        </view>
      </view>
    </view>

    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-icon">🎯</text>
        <view class="stat-info">
          <text class="stat-label">已解锁</text>
          <text class="stat-value">{{ unlockedCount }}/{{ totalCount }}</text>
        </view>
      </view>
      <view class="stat-card">
        <text class="stat-icon">⭐</text>
        <view class="stat-info">
          <text class="stat-label">完成度</text>
          <text class="stat-value">{{ completionRate }}%</text>
        </view>
      </view>
    </view>

    <scroll-view 
      class="fruits-list" 
      scroll-y
      :style="{ height: listHeight }"
    >
      <view class="list-header">
        <text class="list-title">🍎 果实图鉴</text>
      </view>

      <view 
        class="fruit-card" 
        v-for="fruit in fruits" 
        :key="fruit.id"
        :class="{ 'card-unlocked': fruit.unlocked, 'card-locked': !fruit.unlocked }"
      >
        <view class="card-left">
          <image 
            class="card-icon" 
            :src="fruit.icon" 
            mode="aspectFit"
            :class="{ 'icon-gray': !fruit.unlocked }"
          />
        </view>
        <view class="card-center">
          <view class="card-name-row">
            <text class="card-name">{{ fruit.name }}</text>
            <view 
              class="card-status"
              :class="fruit.unlocked ? 'status-unlocked' : 'status-locked'"
            >
              {{ fruit.unlocked ? '已解锁' : '未解锁' }}
            </view>
          </view>
          <text class="card-desc">{{ fruit.description }}</text>
          <view class="card-points">
            <text class="points-label">解锁条件：</text>
            <text class="points-value">{{ fruit.unlock_points }}点情力</text>
          </view>
        </view>
        <view class="card-right">
          <button 
            v-if="fruit.can_unlock" 
            class="btn-unlock" 
            @click="unlockFruit(fruit)"
          >
            解锁
          </button>
          <view v-else-if="fruit.unlocked" class="unlocked-mark">
            <text class="unlocked-icon">✓</text>
          </view>
          <view v-else class="locked-hint">
            <text class="locked-text">还差{{ fruit.unlock_points - userPoints }}点</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedFruit.name }}</text>
          <text class="modal-close" @click="closeDetailModal">✕</text>
        </view>

        <view class="modal-body">
          <image 
            class="modal-icon" 
            :src="selectedFruit.icon" 
            mode="aspectFit"
          />
          <view class="modal-info">
            <view class="info-row">
              <text class="info-label">状态：</text>
              <text 
                class="info-value"
                :style="{ color: selectedFruit.unlocked ? '#4caf50' : '#ff9800' }"
              >
                {{ selectedFruit.unlocked ? '已解锁' : '未解锁' }}
              </text>
            </view>
            <view class="info-row">
              <text class="info-label">解锁条件：</text>
              <text class="info-value">{{ selectedFruit.unlock_points }}点情力</text>
            </view>
            <view class="info-row">
              <text class="info-label">当前情力：</text>
              <text class="info-value">{{ userPoints }}点</text>
            </view>
            <view class="info-desc">
              <text class="desc-label">描述：</text>
              <text class="desc-text">{{ selectedFruit.description }}</text>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <button 
            v-if="selectedFruit.can_unlock" 
            class="btn-modal-unlock" 
            @click="unlockFruitFromModal"
          >
            立即解锁
          </button>
          <button v-else class="btn-modal-close" @click="closeDetailModal">
            {{ selectedFruit.unlocked ? '已解锁' : '情力不足' }}
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
      fruits: [],
      showDetailModal: false,
      selectedFruit: {},
      listHeight: '400rpx',
      fruitPositions: [
        'pos-top-left',
        'pos-top-right',
        'pos-middle-left',
        'pos-middle-right',
        'pos-bottom-center'
      ]
    };
  },

  computed: {
    totalCount() {
      return this.fruits.length;
    },
    unlockedCount() {
      return this.fruits.filter(f => f.unlocked).length;
    },
    completionRate() {
      if (this.totalCount === 0) return 0;
      return Math.round((this.unlockedCount / this.totalCount) * 100);
    }
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    this.loadData();
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
      const treeHeight = 600;
      const statsHeight = 120;
      const listHeaderHeight = 80;
      const bottomPadding = 100;
      
      const availableHeight = windowHeight - headerHeight - treeHeight - statsHeight - listHeaderHeight - bottomPadding;
      this.listHeight = `${availableHeight}rpx`;
    },

    async loadData() {
      try {
        const user = storage.getUser();
        if (!user) return;

        uni.showLoading({ title: '加载中...', mask: true });

        const [pointsRes, fruitsRes] = await Promise.all([
          api.getPoints(user.user_id),
          api.getFruits(user.user_id)
        ]);

        if (pointsRes.success) {
          this.userPoints = pointsRes.data.points || 0;
          storage.updatePoints(this.userPoints);
        }

        if (fruitsRes.success) {
          this.fruits = fruitsRes.data || [];
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none',
          duration: 2000
        });
      } finally {
        uni.hideLoading();
      }
    },

    getFruitPositionClass(index) {
      return this.fruitPositions[index % this.fruitPositions.length] || 'pos-middle-center';
    },

    handleFruitClick(fruit) {
      this.selectedFruit = fruit;
      this.showDetailModal = true;
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedFruit = {};
    },

    async unlockFruit(fruit) {
      if (!fruit.can_unlock) {
        uni.showToast({
          title: `还需${fruit.unlock_points - this.userPoints}点情力`,
          icon: 'none',
          duration: 2000
        });
        return;
      }

      uni.showModal({
        title: '确认解锁',
        content: `确定要解锁【${fruit.name}】吗？需要${fruit.unlock_points}点情力`,
        success: async (res) => {
          if (res.confirm) {
            await this.performUnlock(fruit);
          }
        }
      });
    },

    async unlockFruitFromModal() {
      await this.performUnlock(this.selectedFruit);
      this.closeDetailModal();
    },

    async performUnlock(fruit) {
      try {
        const user = storage.getUser();
        if (!user) return;

        uni.showLoading({ title: '解锁中...', mask: true });

        const res = await api.unlockFruit(fruit.id, user.user_id);

        if (res.success) {
          uni.showToast({
            title: `成功解锁【${fruit.name}】`,
            icon: 'success',
            duration: 2000
          });

          this.loadData();
        }
      } catch (error) {
        console.error('解锁失败:', error);
        uni.showToast({
          title: error.message || '解锁失败',
          icon: 'none',
          duration: 2000
        });
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

.tree-container {
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

.tree-scene {
  position: relative;
  width: 100%;
  height: 600rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 24rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
}

.tree-bg {
  width: 100%;
  height: 100%;
  opacity: 0.9;
}

.fruits-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.fruit-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.pos-top-left {
  top: 80rpx;
  left: 60rpx;
}

.pos-top-right {
  top: 100rpx;
  right: 80rpx;
}

.pos-middle-left {
  top: 250rpx;
  left: 100rpx;
}

.pos-middle-right {
  top: 280rpx;
  right: 60rpx;
}

.pos-bottom-center {
  bottom: 120rpx;
  left: 50%;
  transform: translateX(-50%);
}

.fruit-wrapper {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 8rpx;
}

.fruit-icon {
  width: 100%;
  height: 100%;
  transition: all 0.3s;
}

.fruit-unlocked {
  filter: brightness(1.2);
  animation: pulse 2s ease-in-out infinite;
}

.fruit-locked {
  filter: grayscale(100%) brightness(0.8);
  opacity: 0.6;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12rpx;
}

.lock-icon {
  font-size: 40rpx;
}

.unlock-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 40rpx;
  height: 40rpx;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.4);
}

.unlock-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: bold;
}

.fruit-name {
  font-size: 24rpx;
  color: #333333;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.stats-section {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  flex: 1;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.stat-icon {
  font-size: 56rpx;
  margin-right: 16rpx;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 4rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.fruits-list {
  overflow-y: auto;
}

.list-header {
  margin-bottom: 24rpx;
}

.list-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.fruit-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.card-unlocked {
  border: 2rpx solid #4caf50;
}

.card-locked {
  opacity: 0.7;
}

.card-left {
  margin-right: 24rpx;
}

.card-icon {
  width: 96rpx;
  height: 96rpx;
}

.icon-gray {
  filter: grayscale(100%);
  opacity: 0.5;
}

.card-center {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.card-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 16rpx;
}

.card-status {
  font-size: 20rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.status-unlocked {
  background: #e8f5e9;
  color: #4caf50;
}

.status-locked {
  background: #fff3e0;
  color: #ff9800;
}

.card-desc {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 12rpx;
}

.card-points {
  display: flex;
  align-items: center;
}

.points-label {
  font-size: 24rpx;
  color: #999999;
}

.points-value {
  font-size: 24rpx;
  color: #ff69b4;
  font-weight: 500;
}

.card-right {
  margin-left: 24rpx;
}

.btn-unlock {
  width: 120rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: #ffffff;
  font-size: 24rpx;
  border-radius: 12rpx;
  border: none;
}

.unlocked-mark {
  width: 64rpx;
  height: 64rpx;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unlocked-icon {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
}

.locked-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.locked-text {
  font-size: 20rpx;
  color: #ff9800;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 40rpx;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}

.modal-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 32rpx;
}

.modal-info {
  width: 100%;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.info-label {
  font-size: 28rpx;
  color: #666666;
  margin-right: 12rpx;
}

.info-value {
  font-size: 28rpx;
  font-weight: 500;
}

.info-desc {
  margin-top: 24rpx;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
}

.desc-label {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.desc-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
}

.btn-modal-unlock,
.btn-modal-close {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  border: none;
}

.btn-modal-unlock {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: #ffffff;
}

.btn-modal-close {
  background: #f0f0f0;
  color: #666666;
}
</style>
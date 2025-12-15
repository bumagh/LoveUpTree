<script>
export default {
  onLaunch() {
    console.log('App Launch');
  },
  onShow() {
    console.log('App Show');
  },
  onHide() {
    console.log('App Hide');
  }
};
</script>

<style>
@import url('https://fonts.loli.net/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

page {
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #ffeef8 0%, #e8f5e9 100%);
  min-height: 100vh;
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

view, text, image, input, textarea, button {
  box-sizing: border-box;
}

button {
  outline: none;
}

button::after {
  border: none;
}

input, textarea {
  outline: none;
}

uni-input {
  height: auto !important;
  min-height: 0 !important;
  line-height: normal !important;
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

.flex {
  display: flex;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.shadow-sm {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.shadow-md {
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.shadow-lg {
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
}

.rounded-sm {
  border-radius: 8rpx;
}

.rounded-md {
  border-radius: 16rpx;
}

.rounded-lg {
  border-radius: 24rpx;
}

.rounded-full {
  border-radius: 50%;
}

.gradient-pink {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
}

.gradient-green {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.text-primary {
  color: #ff69b4;
}

.text-success {
  color: #4caf50;
}

.text-warning {
  color: #ff9800;
}

.text-danger {
  color: #f44336;
}

.text-gray {
  color: #999999;
}

.bg-white {
  background-color: #ffffff;
}

.bg-gray {
  background-color: #f8f8f8;
}

.safe-area-bottom {
  padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
}

.status-bar {
  height: var(--status-bar-height);
}

.animation-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animation-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animation-scale {
  animation: scale 0.3s ease-out;
}

@keyframes scale {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(255, 105, 180, 0.3);
  transition: all 0.3s;
}

.btn-primary:active {
  opacity: 0.8;
  transform: translateY(2rpx);
}

.btn-secondary {
  background: #f0f0f0;
  color: #666666;
  border: none;
  border-radius: 16rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-secondary:active {
  background: #e0e0e0;
  transform: translateY(2rpx);
}

.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 24rpx 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
}

.badge-primary {
  background: #ffe8f5;
  color: #ff69b4;
}

.badge-success {
  background: #e8f5e9;
  color: #4caf50;
}

.badge-warning {
  background: #fff3e0;
  color: #ff9800;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
  margin-top: 24rpx;
}
</style>
<template>
  <view class="login-container">
    <view class="login-card">
      <view class="logo-section">
        <image 
          class="logo-img" 
          src="https://hpi-hub.tos-cn-beijing.volces.com/static/biology/tree-8378346_1280.png" 
          mode="aspectFit"
        />
        <text class="app-title">恋人古情树</text>
        <text class="app-subtitle">完成任务 · 收获幸福</text>
      </view>

      <view class="form-section">
        <view class="input-group">
          <view class="input-label">
            <text class="label-icon">👤</text>
            <text class="label-text">账号</text>
          </view>
          <input 
            class="input-field" 
            v-model="username" 
            placeholder="请输入账号" 
            placeholder-class="placeholder-text"
            maxlength="20"
          />
        </view>

        <view class="input-group">
          <view class="input-label">
            <text class="label-icon">🔒</text>
            <text class="label-text">密码</text>
          </view>
          <input 
            class="input-field" 
            v-model="password" 
            type="password" 
            placeholder="请输入密码" 
            placeholder-class="placeholder-text"
            maxlength="20"
          />
        </view>

        <view class="button-group">
          <button class="btn-primary" @click="handleLogin">登录</button>
          <button class="btn-secondary" @click="handleRegister">注册账号</button>
        </view>

        <view class="tips-section">
          <text class="tips-text">💡 默认账号：user / 密码：123456</text>
        </view>
      </view>
    </view>

    <view class="footer-text">
      <text>By HAISNAP</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js';
import storage from '@/utils/storage.js';

export default {
  data() {
    return {
      username: '',
      password: '',
      isLoading: false
    };
  },

  methods: {
    async handleLogin() {
      if (!this.validateForm()) {
        return;
      }

      if (this.isLoading) {
        return;
      }

      this.isLoading = true;
      uni.showLoading({ title: '登录中...', mask: true });

      try {
        const res = await api.login(this.username.trim(), this.password);
        
        if (res.success) {
          storage.setToken('lovers_token_' + res.data.user_id);
          storage.setUser(res.data);
          storage.setPoints(res.data.points || 0);

          uni.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
          });

          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' });
          }, 1500);
        } else {
          uni.showToast({
            title: res.message || '登录失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('登录失败:', error);
        uni.showToast({
          title: error.message || '登录异常，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },

    async handleRegister() {
      if (!this.validateForm()) {
        return;
      }

      if (this.isLoading) {
        return;
      }

      this.isLoading = true;
      uni.showLoading({ title: '注册中...', mask: true });

      try {
        const res = await api.register(this.username.trim(), this.password);
        
        if (res.success) {
          uni.showToast({
            title: '注册成功，请登录',
            icon: 'success',
            duration: 2000
          });
          
          this.password = '';
        } else {
          uni.showToast({
            title: res.message || '注册失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('注册失败:', error);
        uni.showToast({
          title: error.message || '注册异常，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },

    validateForm() {
      const username = this.username.trim();
      const password = this.password;

      if (!username) {
        uni.showToast({
          title: '请输入账号',
          icon: 'none',
          duration: 2000
        });
        return false;
      }

      if (username.length < 3 || username.length > 20) {
        uni.showToast({
          title: '账号长度需在3-20个字符之间',
          icon: 'none',
          duration: 2000
        });
        return false;
      }

      if (!password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none',
          duration: 2000
        });
        return false;
      }

      if (password.length < 6) {
        uni.showToast({
          title: '密码长度不能少于6个字符',
          icon: 'none',
          duration: 2000
        });
        return false;
      }

      return true;
    }
  }
};
</script>

<style scoped>
page {
  background: linear-gradient(135deg, #ffeef8 0%, #e8f5e9 100%);
  min-height: 100vh;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40rpx;
  box-sizing: border-box;
}

.login-card {
  width: 100%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 105, 180, 0.15);
  padding: 60rpx 40rpx;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.logo-img {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
}

.app-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff69b4;
  margin-bottom: 12rpx;
}

.app-subtitle {
  font-size: 28rpx;
  color: #999999;
}

.form-section {
  width: 100%;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.label-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.label-text {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.input-field {
  width: 100%;
  height: 88rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.input-field:focus {
  background: #ffffff;
  border-color: #ff69b4;
}

.placeholder-text {
  color: #cccccc;
}

.button-group {
  margin-top: 48rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 16rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 105, 180, 0.3);
  transition: all 0.3s;
}

.btn-primary:active {
  opacity: 0.8;
  transform: translateY(2rpx);
}

.btn-secondary {
  width: 100%;
  height: 88rpx;
  background: #ffffff;
  color: #ff69b4;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 16rpx;
  border: 2rpx solid #ff69b4;
  transition: all 0.3s;
}

.btn-secondary:active {
  background: #fff5f9;
  transform: translateY(2rpx);
}

.tips-section {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #fff9e6;
  border-radius: 16rpx;
  border-left: 6rpx solid #ffc107;
}

.tips-text {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.6;
}

.footer-text {
  margin-top: 40rpx;
  text-align: center;
}

.footer-text text {
  font-size: 24rpx;
  color: #999999;
}

uni-input {
  height: auto !important;
  min-height: 0 !important;
  line-height: normal !important;
}
</style>
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const winston = require('winston');
const { initDatabase } = require('./db/database');

const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const pointsRoutes = require('./routes/points');
const fruitsRoutes = require('./routes/fruits');

const app = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console()
  ]
});

process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
});

app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

const publicDir = path.resolve(__dirname, '../frontend/public');
const distDir = path.resolve(__dirname, '../frontend/dist');
const publicPath = fs.existsSync(publicDir) ? publicDir : distDir;

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  logger.info(`静态资源目录: ${publicPath}`);
} else {
  logger.warn('静态资源目录不存在');
}

initDatabase().then(() => {
  logger.info('数据库初始化完成');
}).catch((err) => {
  logger.error('数据库初始化失败:', err);
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/fruits', fruitsRoutes);

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  if (!fs.existsSync(publicPath)) {
    return res.status(404).json({
      success: false,
      message: '前端资源未找到'
    });
  }

  const filePath = path.join(publicPath, req.path);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.sendFile(filePath);
  } else {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        success: false,
        message: '页面未找到'
      });
    }
  }
});

app.use((err, req, res, next) => {
  logger.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 31314;

app.listen(PORT, () => {
  logger.info(`===================================`);
  logger.info(`情侣任务古情树服务已启动`);
  logger.info(`端口: ${PORT}`);
  logger.info(`默认账号: user`);
  logger.info(`默认密码: 123456`);
  logger.info(`访问地址: http://localhost:${PORT}`);
  logger.info(`===================================`);
});

module.exports = app;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { query, run, get } = require('../db/database');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ success: false, message: '用户名长度需在3-20个字符之间' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密码长度不能少于6个字符' });
    }

    const existingUser = await get('SELECT id FROM users WHERE username = ?', [username]);

    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = await run(
      'INSERT INTO users (username, password, points) VALUES (?, ?, ?)',
      [username, hashedPassword, 0]
    );

    res.json({
      success: true,
      message: '注册成功',
      data: {
        user_id: result.lastID,
        username: username
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    const user = await get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user_id: user.id,
        username: user.username,
        points: user.points
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

module.exports = router;
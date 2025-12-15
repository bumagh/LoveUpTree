const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: '缺少用户ID' });
    }

    const fruits = await query('SELECT * FROM fruits ORDER BY unlock_points ASC');
    const userPoints = await get('SELECT points FROM users WHERE id = ?', [user_id]);
    const unlockedFruits = await query(
      'SELECT fruit_id FROM user_fruits WHERE user_id = ?',
      [user_id]
    );

    const unlockedIds = new Set(unlockedFruits.map(f => f.fruit_id));

    const result = fruits.map(fruit => ({
      ...fruit,
      unlocked: unlockedIds.has(fruit.id) || fruit.unlock_points <= (userPoints?.points || 0),
      can_unlock: fruit.unlock_points <= (userPoints?.points || 0) && !unlockedIds.has(fruit.id)
    }));

    res.json({
      success: true,
      data: result,
      user_points: userPoints?.points || 0
    });
  } catch (error) {
    console.error('获取果实列表失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

router.put('/:id/unlock', async (req, res) => {
  try {
    const fruitId = parseInt(req.params.id);
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: '缺少用户ID' });
    }

    const fruit = await get('SELECT * FROM fruits WHERE id = ?', [fruitId]);
    if (!fruit) {
      return res.status(404).json({ success: false, message: '果实不存在' });
    }

    const user = await get('SELECT points FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    if (user.points < fruit.unlock_points) {
      return res.status(400).json({ 
        success: false, 
        message: `情力不足，需要${fruit.unlock_points}点，当前${user.points}点` 
      });
    }

    const existing = await get(
      'SELECT id FROM user_fruits WHERE user_id = ? AND fruit_id = ?',
      [user_id, fruitId]
    );

    if (existing) {
      return res.status(400).json({ success: false, message: '果实已解锁' });
    }

    await run(
      'INSERT INTO user_fruits (user_id, fruit_id) VALUES (?, ?)',
      [user_id, fruitId]
    );

    res.json({
      success: true,
      message: `成功解锁【${fruit.name}】`,
      data: { fruit_id: fruitId, fruit_name: fruit.name }
    });
  } catch (error) {
    console.error('解锁果实失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

module.exports = router;
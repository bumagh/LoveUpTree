const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: '缺少用户ID' });
    }

    const user = await get('SELECT id, username, points FROM users WHERE id = ?', [user_id]);

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const completedTasks = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = ?',
      [user_id, 'completed']
    );

    res.json({
      success: true,
      data: {
        user_id: user.id,
        username: user.username,
        points: user.points,
        completed_tasks: completedTasks[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('获取情力值失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, task_id } = req.body;

    if (!user_id || !task_id) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    const task = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [task_id, user_id]);

    if (!task) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ success: false, message: '任务已完成，无法重复获得情力' });
    }

    const taskPoints = task.points || 10;

    await run('UPDATE users SET points = points + ? WHERE id = ?', [taskPoints, user_id]);

    await run(
      'UPDATE tasks SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['completed', task_id]
    );

    const updatedUser = await get('SELECT points FROM users WHERE id = ?', [user_id]);

    res.json({
      success: true,
      message: `完成任务，获得${taskPoints}点情力`,
      data: {
        added_points: taskPoints,
        total_points: updatedUser.points
      }
    });
  } catch (error) {
    console.error('更新情力值失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

module.exports = router;
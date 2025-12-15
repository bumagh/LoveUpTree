const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const { user_id, status, category } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: '缺少用户ID' });
    }

    let sql = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [user_id];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC';

    const tasks = await query(sql, params);

    res.json({
      success: true,
      data: tasks || []
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, title, description, category, assigned_to, points, due_date } = req.body;

    if (!user_id || !title) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    const taskCategory = category || 'general';
    const taskPoints = points || 10;

    const result = await run(
      `INSERT INTO tasks (user_id, title, description, category, assigned_to, points, due_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, title, description || '', taskCategory, assigned_to || '', taskPoints, due_date || null, 'pending']
    );

    res.json({
      success: true,
      message: '任务创建成功',
      data: { task_id: result.lastID }
    });
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status, title, description, assigned_to, due_date, user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: '缺少用户ID' });
    }

    const task = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, user_id]);

    if (!task) {
      return res.status(404).json({ success: false, message: '任务不存在或无权限' });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
      }
    }

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
    }

    if (due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(due_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '无有效更新字段' });
    }

    params.push(taskId);

    await run(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: '任务更新成功'
    });
  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: '缺少用户ID' });
    }

    const task = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, user_id]);

    if (!task) {
      return res.status(404).json({ success: false, message: '任务不存在或无权限' });
    }

    await run('DELETE FROM tasks WHERE id = ?', [taskId]);

    res.json({
      success: true,
      message: '任务删除成功'
    });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: '缺少用户ID' });
    }

    const stats = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM tasks WHERE user_id = ?`,
      [user_id]
    );

    res.json({
      success: true,
      data: stats[0] || { total: 0, completed: 0, pending: 0 }
    });
  } catch (error) {
    console.error('获取任务统计失败:', error);
    res.status(500).json({ success: false, message: '数据库异常' });
  }
});

module.exports = router;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, '../lovers_task_tree.db');
let db = null;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('数据库连接失败:', err.message);
          resolve();
          return;
        }
        console.log('SQLite数据库已连接');
        createTables().then(resolve).catch(resolve);
      });
    } catch (error) {
      console.error('数据库初始化异常:', error);
      resolve();
    }
  });
};

const createTables = () => {
  return new Promise((resolve) => {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'general',
        assigned_to TEXT,
        status TEXT DEFAULT 'pending',
        points INTEGER DEFAULT 10,
        due_date DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS fruits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT,
        unlock_points INTEGER NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS user_fruits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        fruit_id INTEGER NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (fruit_id) REFERENCES fruits(id)
      )`
    ];

    let completed = 0;
    queries.forEach((query) => {
      db.run(query, (err) => {
        if (err) {
          console.error('创建表失败:', err.message);
        }
        completed++;
        if (completed === queries.length) {
          insertInitialData().then(resolve).catch(resolve);
        }
      });
    });
  });
};

const insertInitialData = () => {
  return new Promise((resolve) => {
    const hashedPassword = bcrypt.hashSync('123456', 10);
    
    db.get('SELECT id FROM users WHERE username = ?', ['user'], (err, row) => {
      if (err || row) {
        insertFruitsData().then(resolve).catch(resolve);
        return;
      }
      
      db.run(
        'INSERT INTO users (username, password, points) VALUES (?, ?, ?)',
        ['user', hashedPassword, 0],
        (err) => {
          if (err) {
            console.error('插入默认用户失败:', err.message);
          }
          insertFruitsData().then(resolve).catch(resolve);
        }
      );
    });
  });
};

const insertFruitsData = () => {
  return new Promise((resolve) => {
    const fruits = [
      { name: '初心果', icon: 'https://hpi-hub.tos-cn-beijing.volces.com/static/key_2d/key_blue_1756179565599-5518.png', unlock_points: 0, description: '相识的开始' },
      { name: '甜蜜果', icon: 'https://hpi-hub.tos-cn-beijing.volces.com/static/gif/03-30-49-570_512.gif', unlock_points: 50, description: '温暖的陪伴' },
      { name: '幸福果', icon: 'https://hpi-hub.tos-cn-beijing.volces.com/static/key_2d/keyboard_bracket_open_outline_1756179554331-5452.png', unlock_points: 100, description: '快乐的时光' },
      { name: '浪漫果', icon: 'https://hpi-hub.tos-cn-beijing.volces.com/static/key_2d/keyboard_minus_1756179554332-3295.png', unlock_points: 200, description: '美好的回忆' },
      { name: '契约果', icon: 'https://hpi-hub.tos-cn-beijing.volces.com/static/key_2d/keyboard_period_1756179554339-3114.png', unlock_points: 500, description: '永恒的承诺' }
    ];

    db.get('SELECT COUNT(*) as count FROM fruits', [], (err, row) => {
      if (err || (row && row.count > 0)) {
        resolve();
        return;
      }

      let inserted = 0;
      fruits.forEach((fruit) => {
        db.run(
          'INSERT INTO fruits (name, icon, unlock_points, description) VALUES (?, ?, ?, ?)',
          [fruit.name, fruit.icon, fruit.unlock_points, fruit.description],
          (err) => {
            if (err) {
              console.error('插入果实数据失败:', err.message);
            }
            inserted++;
            if (inserted === fruits.length) {
              resolve();
            }
          }
        );
      });
    });
  });
};

const getDb = () => {
  if (!db) {
    throw new Error('数据库未初始化');
  }
  return db;
};

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        reject(new Error('数据库未初始化'));
        return;
      }
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('查询失败:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } catch (error) {
      console.error('查询异常:', error);
      reject(error);
    }
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        reject(new Error('数据库未初始化'));
        return;
      }
      db.run(sql, params, function(err) {
        if (err) {
          console.error('执行失败:', err.message);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    } catch (error) {
      console.error('执行异常:', error);
      reject(error);
    }
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        reject(new Error('数据库未初始化'));
        return;
      }
      db.get(sql, params, (err, row) => {
        if (err) {
          console.error('查询单条失败:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    } catch (error) {
      console.error('查询单条异常:', error);
      reject(error);
    }
  });
};

module.exports = {
  initDatabase,
  getDb,
  query,
  run,
  get
};
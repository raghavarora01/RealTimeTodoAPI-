const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Add Task
router.post('/add', (req, res) => {
  const { text } = req.body;
  const userId = req.session.userId;

  db.query('INSERT INTO tasks (text, completed, user_id) VALUES (?, ?, ?)', [text, false, userId], (err, result) => {
    if (err) return res.status(500).send('Error adding task');
    res.json({ id: result.insertId, text, completed: false });
  });
});

// Delete Task
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;

  db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId], (err) => {
    if (err) return res.status(500).send('Error deleting task');
    res.json({ success: true });
  });
});

// Toggle Task Completion
router.put('/complete/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const userId = req.session.userId;

  db.query('UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?', [completed, id, userId], (err) => {
    if (err) return res.status(500).send('Error updating task completion');
    res.json({ id, completed });
  });
});

module.exports = router;

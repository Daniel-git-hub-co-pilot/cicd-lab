
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const pool = require('./db')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Database connection check
pool.query('SELECT NOW()')
  .then((result) => {
    console.log('PostgreSQL connected successfully:', result.rows[0])
  })
  .catch((error) => {
    console.error('PostgreSQL connection failed:', error.message)
  })

// Health check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Task Manager API is running',
  })
})

// GET: Retrieve all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching tasks:', error.message)
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// POST: Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'Task title is required',
      })
    }

    const result = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title.trim()]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating task:', error.message)
    res.status(500).json({ error: 'Failed to create task' })
  }
})

// PATCH: Update task completion status
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { completed } = req.body

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid task ID' })
    }

    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        error: 'Completed must be true or false',
      })
    }

    const result = await pool.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating task:', error.message)
    res.status(500).json({ error: 'Failed to update task' })
  }
})

// DELETE: Remove a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid task ID' })
    }

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.status(200).json({
      message: 'Task deleted successfully',
      task: result.rows[0],
    })
  } catch (error) {
    console.error('Error deleting task:', error.message)
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

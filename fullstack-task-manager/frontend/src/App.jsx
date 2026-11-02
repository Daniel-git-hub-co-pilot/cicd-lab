
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [taskTitle, setTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load tasks from backend when the page opens
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks')

        if (!response.ok) {
          throw new Error('Failed to load tasks')
        }

        const data = await response.json()
        setTasks(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  // Create a new task
  const addTask = async (event) => {
    event.preventDefault()

    if (!taskTitle.trim()) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskTitle.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const newTask = await response.json()

      setTasks((currentTasks) => [...currentTasks, newTask])
      setTaskTitle('')
      setError('')
    } catch (error) {
      setError(error.message)
    }
  }

  // Update task completion status
  const toggleTask = async (id, completed) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const updatedTask = await response.json()

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      )

      setError('')
    } catch (error) {
      setError(error.message)
    }
  }

  // Delete a task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      )

      setError('')
    } catch (error) {
      setError(error.message)
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length

  return (
    <main className="app">
      <header className="header">
        <h1>Task Manager</h1>
        <p>Organize your work. Track your progress.</p>
      </header>

      <section className="task-container">
        <form onSubmit={addTask} className="task-form">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
          />
          <button type="submit">Add Task</button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="task-summary">
          <span>Total: {tasks.length}</span>
          <span>Completed: {completedCount}</span>
          <span>Pending: {tasks.length - completedCount}</span>
        </div>

        <div className="task-list">
          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="empty-message">
              No tasks yet. Add your first task!
            </p>
          ) : (
            tasks.map((task) => (
              <div className="task-item" key={task.id}>
                <label className={task.completed ? 'completed' : ''}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() =>
                      toggleTask(task.id, !task.completed)
                    }
                  />
                  {task.title}
                </label>

                <button
                  className="delete-button"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

export default App

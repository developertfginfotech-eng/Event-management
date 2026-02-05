import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTask, createTask, updateTask, getEvents, getUsers } from '../services/api'
import './EventForm.css'

function TaskForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: ''
  })

  useEffect(() => {
    loadEvents()
    loadUsers()
    if (id) {
      loadTask()
    }
  }, [id])

  const loadTask = async () => {
    try {
      setLoading(true)
      const response = await getTask(id)
      const task = response.data.data
      setFormData({
        title: task.title,
        description: task.description || '',
        event: task.event?._id || '',
        assignedTo: task.assignedTo?._id || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      })
    } catch (error) {
      alert('Error loading task')
      navigate('/tasks')
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async () => {
    try {
      const response = await getEvents()
      setEvents(response.data.data)
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await getUsers()
      setUsers(response.data.data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.assignedTo) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      if (id) {
        await updateTask(id, formData)
        alert('Task updated successfully')
      } else {
        await createTask(formData)
        alert('Task created successfully')
      }
      navigate('/tasks')
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving task')
    } finally {
      setLoading(false)
    }
  }

  if (loading && id) {
    return <div className="loading">Loading task...</div>
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <h1>{id ? 'Edit Task' : 'Create New Task'}</h1>
        <button onClick={() => navigate('/tasks')} className="btn-secondary">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-section">
          <h2>Task Information</h2>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter task description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event</label>
              <select
                name="event"
                value={formData.event}
                onChange={handleChange}
              >
                <option value="">Select Event</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>{event.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Assign To *</label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (id ? 'Update Task' : 'Create Task')}
          </button>
          <button type="button" onClick={() => navigate('/tasks')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default TaskForm

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTasks, getEvents, getUsers, deleteTask } from '../services/api'
import './Expenses.css'

function Tasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    event: '',
    status: '',
    priority: '',
    assignedTo: ''
  })

  useEffect(() => {
    loadTasks()
    loadEvents()
    loadUsers()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await getTasks(filters)
      setTasks(response.data.data)
    } catch (error) {
      console.error('Error loading tasks:', error)
      alert('Error loading tasks')
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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleApplyFilters = () => {
    loadTasks()
  }

  const handleClearFilters = () => {
    setFilters({
      event: '',
      status: '',
      priority: '',
      assignedTo: ''
    })
    setTimeout(() => loadTasks(), 0)
  }

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask(id)
      alert('Task deleted successfully')
      loadTasks()
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting task')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'badge-pending',
      'In Progress': 'badge-default',
      'Completed': 'badge-approved'
    }
    return statusColors[status] || 'badge-default'
  }

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'High': 'badge-rejected',
      'Medium': 'badge-pending',
      'Low': 'badge-approved'
    }
    return priorityColors[priority] || 'badge-default'
  }

  const pendingCount = tasks.filter(t => t.status === 'Pending').length
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length
  const completedCount = tasks.filter(t => t.status === 'Completed').length

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>Task Management</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/tasks/new')} className="btn-primary">
            + Create Task
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <select name="event" value={filters.event} onChange={handleFilterChange}>
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.name}</option>
            ))}
          </select>

          <select name="assignedTo" value={filters.assignedTo} onChange={handleFilterChange}>
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button onClick={handleApplyFilters} className="btn-primary">Apply</button>
          <button onClick={handleClearFilters} className="btn-secondary">Clear</button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card pending">
          <h3>{pendingCount}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{inProgressCount}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card approved">
          <h3>{completedCount}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{tasks.length}</h3>
          <p>Total Tasks</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <div className="table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Event</th>
                <th>Assigned To</th>
                <th>Assigned By</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No tasks found</td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{task.title}</div>
                      {task.description && (
                        <small style={{ color: '#718096', fontSize: '12px' }}>
                          {task.description.substring(0, 50)}{task.description.length > 50 ? '...' : ''}
                        </small>
                      )}
                    </td>
                    <td>{task.event?.name || '-'}</td>
                    <td>{task.assignedTo?.name || '-'}</td>
                    <td>{task.assignedBy?.name || '-'}</td>
                    <td>
                      <span className={`badge ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>{task.dueDate ? formatDate(task.dueDate) : '-'}</td>
                    <td className="actions">
                      <button
                        onClick={() => navigate(`/tasks/edit/${task._id}`)}
                        className="btn-icon"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="btn-icon btn-danger"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Tasks

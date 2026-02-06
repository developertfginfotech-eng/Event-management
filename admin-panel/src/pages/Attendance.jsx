import { useState, useEffect } from 'react'
import {
  getAttendance,
  getEvents,
  getUsers,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord
} from '../services/api'
import './Expenses.css'

const API_URL = import.meta.env.VITE_API_URL

function Attendance() {
  const [attendance, setAttendance] = useState([])
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [filters, setFilters] = useState({
    event: '',
    user: '',
    status: '',
    startDate: '',
    endDate: ''
  })
  const [formData, setFormData] = useState({
    user: '',
    event: '',
    date: '',
    checkInTime: '',
    checkOutTime: '',
    status: 'Present',
    notes: ''
  })

  useEffect(() => {
    loadAttendance()
    loadEvents()
    loadUsers()
  }, [])

  const loadAttendance = async () => {
    try {
      setLoading(true)
      const response = await getAttendance(filters)
      setAttendance(response.data.data)
    } catch (error) {
      console.error('Error loading attendance:', error)
      alert('Error loading attendance records')
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
    loadAttendance()
  }

  const handleClearFilters = () => {
    setFilters({
      event: '',
      user: '',
      status: '',
      startDate: '',
      endDate: ''
    })
    setTimeout(() => loadAttendance(), 0)
  }

  const handleAddNew = () => {
    // Get current logged-in user
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const currentUserId = currentUser._id || currentUser.id || ''
    const isAdmin = currentUser.role === 'Super Admin' || currentUser.role === 'Admin'

    setEditingRecord(null)
    setFormData({
      user: isAdmin ? '' : currentUserId, // Admins can select any user, others default to self
      event: '',
      date: new Date().toISOString().split('T')[0],
      checkInTime: '',
      checkOutTime: '',
      status: 'Present',
      notes: ''
    })
    setShowForm(true)
  }

  const handleEdit = (record) => {
    console.log('Editing record:', record); // Debug log
    setEditingRecord(record)
    setFormData({
      user: record.user?._id || record.user?.id || record.user || '',
      event: record.event?._id || record.event?.id || record.event || '',
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      checkInTime: record.checkIn?.time ? new Date(record.checkIn.time).toISOString().slice(0, 16) : '',
      checkOutTime: record.checkOut?.time ? new Date(record.checkOut.time).toISOString().slice(0, 16) : '',
      status: record.status || 'Present',
      notes: record.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return

    try {
      await deleteAttendanceRecord(id)
      alert('Attendance record deleted successfully')
      loadAttendance()
    } catch (error) {
      console.error('Error deleting attendance:', error)
      alert(error.response?.data?.message || 'Error deleting attendance record')
    }
  }

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = {
        user: formData.user,
        event: formData.event,
        date: new Date(formData.date).toISOString(),
        status: formData.status,
        notes: formData.notes
      }

      if (formData.checkInTime) {
        data.checkIn = {
          time: new Date(formData.checkInTime).toISOString()
        }
      }

      if (formData.checkOutTime) {
        data.checkOut = {
          time: new Date(formData.checkOutTime).toISOString()
        }
      }

      if (editingRecord) {
        await updateAttendanceRecord(editingRecord._id, data)
        alert('Attendance record updated successfully')
      } else {
        await createAttendanceRecord(data)
        alert('Attendance record created successfully')
      }

      setShowForm(false)
      loadAttendance()
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert(error.response?.data?.message || 'Error saving attendance record')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-'
    const diff = new Date(checkOut) - new Date(checkIn)
    const hours = Math.floor(diff / 1000 / 60 / 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    return `${hours}h ${minutes}m`
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'Present': 'badge-approved',
      'Absent': 'badge-rejected',
      'Half Day': 'badge-pending'
    }
    return statusColors[status] || 'badge-default'
  }

  const presentCount = attendance.filter(a => a.status === 'Present').length
  const absentCount = attendance.filter(a => a.status === 'Absent').length
  const halfDayCount = attendance.filter(a => a.status === 'Half Day').length

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <button onClick={handleAddNew} className="btn-primary">
          + Add Attendance
        </button>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <select name="event" value={filters.event} onChange={handleFilterChange}>
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.name}</option>
            ))}
          </select>

          <select name="user" value={filters.user} onChange={handleFilterChange}>
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Half Day">Half Day</option>
          </select>

          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            placeholder="Start Date"
          />

          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            placeholder="End Date"
          />

          <button onClick={handleApplyFilters} className="btn-primary">Apply</button>
          <button onClick={handleClearFilters} className="btn-secondary">Clear</button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card approved">
          <h3>{presentCount}</h3>
          <p>Present</p>
        </div>
        <div className="stat-card rejected">
          <h3>{absentCount}</h3>
          <p>Absent</p>
        </div>
        <div className="stat-card pending">
          <h3>{halfDayCount}</h3>
          <p>Half Day</p>
        </div>
        <div className="stat-card">
          <h3>{attendance.length}</h3>
          <p>Total Records</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading attendance records...</div>
      ) : (
        <div className="table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Event</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Selfie</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">No attendance records found</td>
                </tr>
              ) : (
                attendance.map(record => (
                  <tr key={record._id}>
                    <td>{formatDate(record.date || record.checkIn?.time)}</td>
                    <td>
                      {record.user?.name || '-'}
                      {record.notes && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#718096' }} title={record.notes}>
                            📝 Note: {record.notes.length > 30 ? record.notes.substring(0, 30) + '...' : record.notes}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>{record.event?.name || '-'}</td>
                    <td>
                      {record.checkIn?.time ? (
                        <div>
                          <div>{formatTime(record.checkIn.time)}</div>
                          <small style={{ color: '#718096', fontSize: '12px' }}>
                            {record.checkIn.location || '-'}
                          </small>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {record.checkOut?.time ? (
                        <div>
                          <div>{formatTime(record.checkOut.time)}</div>
                          <small style={{ color: '#718096', fontSize: '12px' }}>
                            {record.checkOut.location || '-'}
                          </small>
                        </div>
                      ) : '-'}
                    </td>
                    <td>{calculateWorkHours(record.checkIn?.time, record.checkOut?.time)}</td>
                    <td>
                      {record.checkIn?.selfie ? (
                        <a href={`${API_URL}${record.checkIn.selfie}`} target="_blank" rel="noopener noreferrer" className="receipt-link">
                          📷 View
                        </a>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(record.status)}`}>
                        {record.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(record)}
                          className="btn-icon"
                          title="Edit"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="btn-icon"
                          title="Delete"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="form-section" style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>{editingRecord ? 'Edit Attendance' : 'Add Attendance'}</h2>
            <button onClick={() => setShowForm(false)} className="close-btn" style={{ fontSize: '24px', background: 'transparent', border: 'none', cursor: 'pointer' }}>&times;</button>
          </div>

          <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-row">
                <div className="form-group">
                  <label>User *</label>
                  <select
                    name="user"
                    value={formData.user}
                    onChange={handleFormChange}
                    required
                    disabled={!editingRecord && JSON.parse(localStorage.getItem('user') || '{}').role !== 'Super Admin' && JSON.parse(localStorage.getItem('user') || '{}').role !== 'Admin'}
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user._id || user.id} value={user._id || user.id}>{user.name}</option>
                    ))}
                  </select>
                  {JSON.parse(localStorage.getItem('user') || '{}').role !== 'Super Admin' && JSON.parse(localStorage.getItem('user') || '{}').role !== 'Admin' && !editingRecord && (
                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      You can only add your own attendance
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Event *</label>
                  <select
                    name="event"
                    value={formData.event}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Event</option>
                    {events.map(event => (
                      <option key={event._id || event.id} value={event._id || event.id}>{event.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Leave">Leave</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Check In Time</label>
                  <input
                    type="datetime-local"
                    name="checkInTime"
                    value={formData.checkInTime}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Check Out Time</label>
                  <input
                    type="datetime-local"
                    name="checkOutTime"
                    value={formData.checkOutTime}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Add notes about this attendance record..."
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editingRecord ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
        </div>
      )}
    </div>
  )
}

export default Attendance

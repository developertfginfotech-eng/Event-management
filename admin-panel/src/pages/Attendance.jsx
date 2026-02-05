import { useState, useEffect } from 'react'
import { getAttendance, getEvents, getUsers } from '../services/api'
import './Expenses.css'

const API_URL = import.meta.env.VITE_API_URL

function Attendance() {
  const [attendance, setAttendance] = useState([])
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    event: '',
    user: '',
    status: '',
    startDate: '',
    endDate: ''
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
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No attendance records found</td>
                </tr>
              ) : (
                attendance.map(record => (
                  <tr key={record._id}>
                    <td>{formatDate(record.date || record.checkIn?.time)}</td>
                    <td>{record.user?.name || '-'}</td>
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

export default Attendance

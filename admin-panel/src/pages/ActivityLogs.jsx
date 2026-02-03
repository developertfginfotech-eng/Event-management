import { useState, useEffect } from 'react'
import { getActivityLogs } from '../services/api'
import './ActivityLogs.css'

function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadLogs()
  }, [filter, page])

  const loadLogs = async () => {
    try {
      const params = { page, limit: 50 }
      if (filter) params.action = filter

      const response = await getActivityLogs(params)
      setLogs(response.data.data)
      setTotalPages(response.data.pages)
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionBadgeClass = (action) => {
    if (action.includes('CREATE')) return 'badge-success'
    if (action.includes('UPDATE')) return 'badge-info'
    if (action.includes('DELETE')) return 'badge-danger'
    if (action.includes('LOGIN')) return 'badge-primary'
    return 'badge-default'
  }

  const getActionLabel = (action) => {
    return action.replace(/_/g, ' ')
  }

  if (loading) return <div className="loading">Loading activity logs...</div>

  return (
    <div className="activity-logs-page">
      <div className="page-header">
        <h1>Activity Logs</h1>
      </div>

      <div className="filters">
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
          <option value="">All Activities</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="CREATE_EVENT">Create Event</option>
          <option value="UPDATE_EVENT">Update Event</option>
          <option value="DELETE_EVENT">Delete Event</option>
          <option value="CREATE_USER">Create User</option>
          <option value="UPDATE_USER">Update User</option>
          <option value="DELETE_USER">Delete User</option>
          <option value="BULK_IMPORT_USERS">Bulk Import Users</option>
          <option value="ASSIGN_USERS_TO_EVENT">Assign Users</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <div className="no-data">
          <p>No activity logs found</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td>{formatDate(log.createdAt)}</td>
                    <td><strong>{log.userName}</strong></td>
                    <td>
                      <span className={`role-badge ${log.userRole.toLowerCase().replace(' ', '-')}`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="details-cell">{log.actionDetails || '-'}</td>
                    <td>
                      <span className={`status-badge ${log.status.toLowerCase()}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-pagination"
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-pagination"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ActivityLogs

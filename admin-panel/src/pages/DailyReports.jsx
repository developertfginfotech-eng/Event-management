import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDailyReports, reviewDailyReport, deleteDailyReport, getEvents, getUsers, getDailyReportSummary } from '../services/api'
import './Expenses.css'

function DailyReports() {
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const [reports, setReports] = useState([])
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    event: '',
    user: '',
    status: '',
    startDate: '',
    endDate: ''
  })
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reviewData, setReviewData] = useState({
    status: 'Approved',
    reviewComments: ''
  })

  useEffect(() => {
    loadReports()
    loadEvents()
    loadUsers()
    loadSummary()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await getDailyReports(filters)
      setReports(response.data.data)
    } catch (error) {
      console.error('Error loading reports:', error)
      alert('Error loading daily reports')
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

  const loadSummary = async () => {
    try {
      const response = await getDailyReportSummary()
      setSummary(response.data.data)
    } catch (error) {
      console.error('Error loading summary:', error)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleApplyFilters = () => {
    loadReports()
  }

  const handleClearFilters = () => {
    setFilters({
      event: '',
      user: '',
      status: '',
      startDate: '',
      endDate: ''
    })
    setTimeout(() => loadReports(), 0)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return

    try {
      await deleteDailyReport(id)
      alert('Report deleted successfully')
      loadReports()
      loadSummary()
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting report')
    }
  }

  const handleReview = async () => {
    if (!reviewData.status) {
      alert('Please select approval status')
      return
    }

    try {
      await reviewDailyReport(selectedReport._id, reviewData)
      alert('Report reviewed successfully')
      setShowReviewModal(false)
      setSelectedReport(null)
      setReviewData({ status: 'Approved', reviewComments: '' })
      loadReports()
      loadSummary()
    } catch (error) {
      alert(error.response?.data?.message || 'Error reviewing report')
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'Draft': 'badge-default',
      'Submitted': 'badge-pending',
      'Approved': 'badge-approved',
      'Rejected': 'badge-rejected'
    }
    return statusColors[status] || 'badge-default'
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

  const calculateWorkHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return '-'
    const diff = new Date(timeOut) - new Date(timeIn)
    const hours = Math.floor(diff / 1000 / 60 / 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>Daily Reports</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/daily-reports/new')} className="btn-primary">
            + Create Report
          </button>
        </div>
      </div>

      {summary && (
        <div className="stats-summary">
          <div className="stat-card">
            <h3>{summary.totalReports}</h3>
            <p>Total Reports</p>
          </div>
          <div className="stat-card approved">
            <h3>{summary.approved}</h3>
            <p>Approved</p>
          </div>
          <div className="stat-card pending">
            <h3>{summary.submitted}</h3>
            <p>Pending Review</p>
          </div>
          <div className="stat-card">
            <h3>{summary.totalBooths}</h3>
            <p>Total Booths Covered</p>
          </div>
          <div className="stat-card">
            <h3>{summary.totalInterviews}</h3>
            <p>Total Interviews</p>
          </div>
        </div>
      )}

      <div className="filters-section">
        <div className="filters-grid">
          <select name="event" value={filters.event} onChange={handleFilterChange}>
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.name}</option>
            ))}
          </select>

          {currentUser.permissions?.canViewReports && (
            <select name="user" value={filters.user} onChange={handleFilterChange}>
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          )}

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
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

      {loading ? (
        <div className="loading">Loading reports...</div>
      ) : (
        <div className="table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Event</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Work Hours</th>
                <th>Booths</th>
                <th>Interviews</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">No reports found</td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report._id}>
                    <td>{formatDate(report.date)}</td>
                    <td>{report.user?.name || '-'}</td>
                    <td>{report.event?.name || '-'}</td>
                    <td>{formatTime(report.timeIn)}</td>
                    <td>{report.timeOut ? formatTime(report.timeOut) : '-'}</td>
                    <td>{calculateWorkHours(report.timeIn, report.timeOut)}</td>
                    <td className="amount-cell">{report.coverageSummary.boothsCovered}</td>
                    <td className="amount-cell">{report.coverageSummary.interviewsConducted}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => navigate(`/daily-reports/${report._id}`)}
                        className="btn-icon"
                        title="View Details"
                      >
                        👁️
                      </button>
                      {report.status === 'Draft' && report.user._id === currentUser._id && (
                        <button
                          onClick={() => navigate(`/daily-reports/edit/${report._id}`)}
                          className="btn-icon"
                          title="Edit"
                        >
                          ✏️
                        </button>
                      )}
                      {currentUser.permissions?.canViewReports && report.status === 'Submitted' && (
                        <button
                          onClick={() => {
                            setSelectedReport(report)
                            setReviewData({
                              status: 'Approved',
                              reviewComments: ''
                            })
                            setShowReviewModal(true)
                          }}
                          className="btn-icon"
                          title="Review"
                        >
                          ✓
                        </button>
                      )}
                      {report.status === 'Draft' && report.user._id === currentUser._id && (
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="btn-icon btn-danger"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showReviewModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Review Daily Report</h2>

            <div className="expense-details">
              <p><strong>User:</strong> {selectedReport.user?.name}</p>
              <p><strong>Date:</strong> {formatDate(selectedReport.date)}</p>
              <p><strong>Event:</strong> {selectedReport.event?.name}</p>
              <p><strong>Booths Covered:</strong> {selectedReport.coverageSummary.boothsCovered}</p>
              <p><strong>Interviews:</strong> {selectedReport.coverageSummary.interviewsConducted}</p>
              <p><strong>Work Hours:</strong> {calculateWorkHours(selectedReport.timeIn, selectedReport.timeOut)}</p>
              {selectedReport.notes && <p><strong>Notes:</strong> {selectedReport.notes}</p>}
            </div>

            <div className="form-group">
              <label>Status:</label>
              <select
                value={reviewData.status}
                onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                className="form-control"
              >
                <option value="Approved">Approve</option>
                <option value="Rejected">Reject</option>
              </select>
            </div>

            <div className="form-group">
              <label>Review Comments:</label>
              <textarea
                value={reviewData.reviewComments}
                onChange={(e) => setReviewData({ ...reviewData, reviewComments: e.target.value })}
                className="form-control"
                rows="4"
                placeholder="Add review comments..."
              />
            </div>

            <div className="modal-actions">
              <button onClick={handleReview} className="btn-primary">Submit Review</button>
              <button onClick={() => setShowReviewModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DailyReports

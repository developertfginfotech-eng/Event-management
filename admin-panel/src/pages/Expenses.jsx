import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExpenses, getEvents, getUsers, reviewExpense, deleteExpense, exportExpensesToExcel } from '../services/api'
import './Expenses.css'

const API_URL = import.meta.env.VITE_API_URL

function Expenses() {
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const canApprove = currentUser.role === 'Super Admin' || currentUser.role === 'Admin' || currentUser.permissions?.canApproveExpenses

  const [expenses, setExpenses] = useState([])
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    event: '',
    user: '',
    status: '',
    category: '',
    search: ''
  })
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [reviewData, setReviewData] = useState({
    status: 'Approved',
    adminComments: ''
  })

  useEffect(() => {
    loadExpenses()
    loadEvents()
    loadUsers()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const response = await getExpenses(filters)
      setExpenses(response.data.data)
    } catch (error) {
      console.error('Error loading expenses:', error)
      alert('Error loading expenses')
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
    loadExpenses()
  }

  const handleClearFilters = () => {
    setFilters({
      event: '',
      user: '',
      status: '',
      category: '',
      search: ''
    })
    setTimeout(() => loadExpenses(), 0)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return

    try {
      await deleteExpense(id)
      alert('Expense deleted successfully')
      loadExpenses()
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting expense')
    }
  }

  const handleReview = async () => {
    if (!reviewData.status) {
      alert('Please select approval status')
      return
    }

    try {
      await reviewExpense(selectedExpense._id, reviewData)
      alert('Expense reviewed successfully')
      setShowReviewModal(false)
      setSelectedExpense(null)
      setReviewData({ status: 'Approved', adminComments: '' })
      loadExpenses()
    } catch (error) {
      alert(error.response?.data?.message || 'Error reviewing expense')
    }
  }

  const handleExportToExcel = async () => {
    try {
      const response = await exportExpensesToExcel(filters)
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `expenses_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Error exporting expenses to Excel')
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'badge-pending',
      'Approved': 'badge-approved',
      'Rejected': 'badge-rejected'
    }
    return statusColors[status] || 'badge-default'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Travel': '✈️',
      'Food': '🍽️',
      'Stay': '🏨',
      'Misc': '📦'
    }
    return icons[category] || '📄'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const pendingCount = expenses.filter(e => e.status === 'Pending').length
  const approvedCount = expenses.filter(e => e.status === 'Approved').length
  const rejectedCount = expenses.filter(e => e.status === 'Rejected').length

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>Expense Management</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/expenses/new')} className="btn-primary">
            + Add Expense
          </button>
          <button onClick={handleExportToExcel} className="btn-secondary">
            📥 Export to Excel
          </button>
          <button onClick={() => navigate('/expenses/reports')} className="btn-secondary">
            📊 View Reports
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <input
            type="text"
            name="search"
            placeholder="Search description..."
            value={filters.search}
            onChange={handleFilterChange}
          />

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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Stay">Stay</option>
            <option value="Misc">Misc</option>
          </select>

          <button onClick={handleApplyFilters} className="btn-primary">Apply</button>
          <button onClick={handleClearFilters} className="btn-secondary">Clear</button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h3>{formatCurrency(totalExpenses)}</h3>
          <p>Total Expenses</p>
        </div>
        <div className="stat-card pending">
          <h3>{pendingCount}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card approved">
          <h3>{approvedCount}</h3>
          <p>Approved</p>
        </div>
        <div className="stat-card rejected">
          <h3>{rejectedCount}</h3>
          <p>Rejected</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading expenses...</div>
      ) : (
        <div className="table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Event</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Receipt</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">No expenses found</td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense._id}>
                    <td>{formatDate(expense.date)}</td>
                    <td>{expense.user?.name || '-'}</td>
                    <td>{expense.event?.name || '-'}</td>
                    <td>
                      <span className="category-badge">
                        {getCategoryIcon(expense.category)} {expense.category}
                      </span>
                    </td>
                    <td className="description-cell">{expense.description}</td>
                    <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                    <td>
                      {expense.receipt ? (
                        <a href={`${API_URL}${expense.receipt}`} target="_blank" rel="noopener noreferrer" className="receipt-link">
                          📎 View
                        </a>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="actions">
                      {canApprove && (
                        <button
                          onClick={() => {
                            setSelectedExpense(expense)
                            setReviewData({
                              status: 'Approved',
                              adminComments: expense.adminComments || ''
                            })
                            setShowReviewModal(true)
                          }}
                          className="btn-icon"
                          title="Review"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(expense._id)}
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

      {showReviewModal && selectedExpense && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Review Expense</h2>

            <div className="expense-details">
              <p><strong>User:</strong> {selectedExpense.user?.name}</p>
              <p><strong>Amount:</strong> {formatCurrency(selectedExpense.amount)}</p>
              <p><strong>Category:</strong> {selectedExpense.category}</p>
              <p><strong>Description:</strong> {selectedExpense.description}</p>
              <p><strong>Date:</strong> {formatDate(selectedExpense.date)}</p>
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
              <label>Admin Comments:</label>
              <textarea
                value={reviewData.adminComments}
                onChange={(e) => setReviewData({ ...reviewData, adminComments: e.target.value })}
                className="form-control"
                rows="4"
                placeholder="Add comments..."
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

export default Expenses

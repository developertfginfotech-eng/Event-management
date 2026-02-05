import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEvents, getUsers, getExpensesByEvent, getExpensesByUser, getExpensesByCategory } from '../services/api'
import './Expenses.css'

function ExpenseReports() {
  const navigate = useNavigate()
  const [reportType, setReportType] = useState('event')
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadEvents()
    loadUsers()
  }, [])

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

  const generateReport = async () => {
    try {
      setLoading(true)
      let response

      if (reportType === 'event') {
        if (!selectedId) {
          alert('Please select an event')
          return
        }
        response = await getExpensesByEvent(selectedId)
      } else if (reportType === 'user') {
        if (!selectedId) {
          alert('Please select a user')
          return
        }
        response = await getExpensesByUser(selectedId)
      } else if (reportType === 'category') {
        if (!selectedCategory) {
          alert('Please select a category')
          return
        }
        response = await getExpensesByCategory(selectedCategory)
      }

      // API returns { success: true, data: { stats, expenses, event/user/category } }
      setReportData(response.data.data)
    } catch (error) {
      console.error('Error generating report:', error)
      alert(error.response?.data?.message || 'Error generating report')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'badge-pending',
      'Approved': 'badge-approved',
      'Rejected': 'badge-rejected'
    }
    return statusColors[status] || 'badge-default'
  }

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>Expense Reports</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/expenses')} className="btn-secondary">
            ← Back to Expenses
          </button>
        </div>
      </div>

      <div className="filters-section">
        <h3>Generate Report</h3>
        <div className="filters-grid">
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value)
              setSelectedId('')
              setSelectedCategory('')
              setReportData(null)
            }}
          >
            <option value="event">By Event</option>
            <option value="user">By User</option>
            <option value="category">By Category</option>
          </select>

          {reportType === 'event' && (
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">Select Event</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>{event.name}</option>
              ))}
            </select>
          )}

          {reportType === 'user' && (
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          )}

          {reportType === 'category' && (
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Select Category</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Stay">Stay</option>
              <option value="Misc">Misc</option>
            </select>
          )}

          <button onClick={generateReport} className="btn-primary">
            Generate Report
          </button>
        </div>
      </div>

      {loading && <div className="loading">Generating report...</div>}

      {reportData && (
        <>
          <div className="stats-summary">
            <div className="stat-card">
              <h3>{reportData.stats?.total || 0}</h3>
              <p>Total Expenses</p>
            </div>
            <div className="stat-card">
              <h3>{formatCurrency(reportData.stats?.totalAmount || 0)}</h3>
              <p>Total Amount</p>
            </div>
            <div className="stat-card approved">
              <h3>{formatCurrency(reportData.stats?.approvedAmount || 0)}</h3>
              <p>Approved</p>
            </div>
            <div className="stat-card pending">
              <h3>{formatCurrency(reportData.stats?.pendingAmount || 0)}</h3>
              <p>Pending</p>
            </div>
            {reportData.stats?.rejectedAmount !== undefined && (
              <div className="stat-card rejected">
                <h3>{formatCurrency(reportData.stats.rejectedAmount)}</h3>
                <p>Rejected</p>
              </div>
            )}
          </div>

          {reportData.stats?.byCategory && Object.keys(reportData.stats.byCategory).length > 0 && (
            <div className="stats-summary">
              <h3>Category Breakdown</h3>
              {Object.entries(reportData.stats.byCategory).map(([category, count]) => {
                const categoryTotal = reportData.expenses
                  .filter(exp => exp.category === category)
                  .reduce((sum, exp) => sum + exp.amount, 0)
                return (
                  <div key={category} className="stat-card">
                    <h3>{getCategoryIcon(category)} {formatCurrency(categoryTotal)}</h3>
                    <p>{category} ({count} expenses)</p>
                  </div>
                )
              })}
            </div>
          )}

          <div className="table-container">
            <h3>Expense Details</h3>
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
                </tr>
              </thead>
              <tbody>
                {reportData.expenses?.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">No expenses found</td>
                  </tr>
                ) : (
                  reportData.expenses?.map(expense => (
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
                          <a href={expense.receipt} target="_blank" rel="noopener noreferrer" className="receipt-link">
                            📎 View
                          </a>
                        ) : '-'}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(expense.status)}`}>
                          {expense.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default ExpenseReports

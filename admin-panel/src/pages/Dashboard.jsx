import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await getAdminDashboard()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (!stats) {
    return <div className="error">Failed to load dashboard data</div>
  }

  return (
    <div className="dashboard-clean">
      <div className="dashboard-header-clean">
        <h1>Dashboard</h1>
        <p>Overview of your event management system</p>
      </div>

      {/* Events Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Events</h2>
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-label">Total</div>
            <div className="stat-value">{stats.events.total}</div>
            <Link to="/events" className="stat-action">View All →</Link>
          </div>
          <div className="stat-box">
            <div className="stat-label">Upcoming</div>
            <div className="stat-value">{stats.events.upcoming}</div>
            <Link to="/events?status=Upcoming" className="stat-action">View →</Link>
          </div>
          <div className="stat-box">
            <div className="stat-label">Live</div>
            <div className="stat-value">{stats.events.live}</div>
            <Link to="/events?status=Live" className="stat-action">View →</Link>
          </div>
          <div className="stat-box">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{stats.events.completed}</div>
            <Link to="/events?status=Completed" className="stat-action">View →</Link>
          </div>
        </div>
      </div>

      {/* Leads Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Leads</h2>
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-label">Total Leads</div>
            <div className="stat-value">{stats.leads.total}</div>
            <Link to="/leads" className="stat-action">View All →</Link>
          </div>
          <div className="stat-box">
            <div className="stat-label">New</div>
            <div className="stat-value">{stats.leads.new}</div>
            <Link to="/leads?status=New" className="stat-action">View →</Link>
          </div>
          <div className="stat-box">
            <div className="stat-label">Converted</div>
            <div className="stat-value">{stats.leads.converted}</div>
            <div className="stat-action" style={{ color: '#6b7280' }}>
              {stats.leads.conversionRate}% rate
            </div>
          </div>
        </div>
      </div>

      {/* Expenses & Budget Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Budget & Expenses</h2>
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-label">Total Budget</div>
            <div className="stat-value">₹{(stats.expenses.budget / 1000).toFixed(0)}K</div>
            <div className="stat-action" style={{ color: '#6b7280' }}>Allocated</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Approved</div>
            <div className="stat-value">₹{(stats.expenses.approved / 1000).toFixed(0)}K</div>
            <Link to="/expenses?status=Approved" className="stat-action">View →</Link>
          </div>
          <div className="stat-box">
            <div className="stat-label">Pending</div>
            <div className="stat-value">₹{(stats.expenses.pending / 1000).toFixed(0)}K</div>
            <Link to="/expenses?status=Pending" className="stat-action">Review →</Link>
          </div>
          <div className="stat-box">
            <div className="stat-label">Utilization</div>
            <div className="stat-value">{stats.expenses.budgetUtilization}%</div>
            <div className="stat-action" style={{ color: '#6b7280' }}>
              ₹{(stats.expenses.remaining / 1000).toFixed(0)}K left
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Attendance</h2>
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-label">Today</div>
            <div className="stat-value">{stats.attendance.today}</div>
            <Link to="/attendance" className="stat-action">View All →</Link>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Records</div>
            <div className="stat-value">{stats.attendance.total}</div>
            <div className="stat-action" style={{ color: '#6b7280' }}>All time</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Present</div>
            <div className="stat-value">{stats.attendance.present}</div>
            <div className="stat-action" style={{ color: '#6b7280' }}>Count</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-clean">
          <Link to="/events/new" className="action-button">+ Create Event</Link>
          <Link to="/users/new" className="action-button">+ Add User</Link>
          <Link to="/leads" className="action-button">Manage Leads</Link>
          <Link to="/expenses" className="action-button">Review Expenses</Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

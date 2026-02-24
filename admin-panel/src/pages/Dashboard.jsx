import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../services/api'
import './Dashboard.css'

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
)
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)
const TrendingUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
)
const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
)
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
)
const ReceiptIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
)
const UserPlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
)

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    loadDashboardData()
    const tick = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(tick)
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const today = time.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="db-loading">
        <div className="db-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (!stats) {
    return <div className="db-error">Failed to load dashboard data</div>
  }

  const budgetUtil = parseFloat(stats.expenses.budgetUtilization) || 0
  const conversionRate = parseFloat(stats.leads.conversionRate) || 0

  return (
    <div className="db">

      {/* Header */}
      <div className="db-header">
        <div className="db-header-left">
          <p className="db-greeting">{getGreeting()}</p>
          <h1>Dashboard Overview</h1>
          <p className="db-date">{today} &nbsp;·&nbsp; {timeStr}</p>
        </div>
        <div className="db-header-actions">
          <Link to="/events/new" className="db-btn-primary">
            <PlusIcon /> New Event
          </Link>
          <Link to="/leads" className="db-btn-secondary">
            View Leads
          </Link>
        </div>
      </div>

      {/* Top KPI Row */}
      <div className="db-kpi-grid">
        <div className="db-kpi db-kpi-blue">
          <div className="db-kpi-icon"><CalendarIcon /></div>
          <div className="db-kpi-body">
            <p className="db-kpi-label">Total Events</p>
            <h2 className="db-kpi-value">{stats.events.total}</h2>
            <Link to="/events" className="db-kpi-link">View all →</Link>
          </div>
          <div className="db-kpi-bg-icon"><CalendarIcon /></div>
        </div>

        <div className="db-kpi db-kpi-purple">
          <div className="db-kpi-icon"><TrendingUpIcon /></div>
          <div className="db-kpi-body">
            <p className="db-kpi-label">Total Leads</p>
            <h2 className="db-kpi-value">{stats.leads.total}</h2>
            <Link to="/leads" className="db-kpi-link">View all →</Link>
          </div>
          <div className="db-kpi-bg-icon"><TrendingUpIcon /></div>
        </div>

        <div className="db-kpi db-kpi-green">
          <div className="db-kpi-icon"><DollarIcon /></div>
          <div className="db-kpi-body">
            <p className="db-kpi-label">Total Budget</p>
            <h2 className="db-kpi-value">₹{(stats.expenses.budget / 1000).toFixed(0)}K</h2>
            <span className="db-kpi-sub">{budgetUtil}% utilized</span>
          </div>
          <div className="db-kpi-bg-icon"><DollarIcon /></div>
        </div>

        <div className="db-kpi db-kpi-orange">
          <div className="db-kpi-icon"><UsersIcon /></div>
          <div className="db-kpi-body">
            <p className="db-kpi-label">Present Today</p>
            <h2 className="db-kpi-value">{stats.attendance.today}</h2>
            <Link to="/attendance" className="db-kpi-link">View all →</Link>
          </div>
          <div className="db-kpi-bg-icon"><UsersIcon /></div>
        </div>
      </div>

      {/* Middle Row — Events + Leads */}
      <div className="db-mid-grid">

        {/* Events Card */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-title-row">
              <div className="db-card-icon db-icon-blue"><CalendarIcon /></div>
              <h3>Events</h3>
            </div>
            <Link to="/events" className="db-card-link">View all →</Link>
          </div>
          <div className="db-card-stats">
            <div className="db-mini-stat">
              <span className="db-dot db-dot-blue"></span>
              <span className="db-mini-label">Upcoming</span>
              <span className="db-mini-value">{stats.events.upcoming}</span>
            </div>
            <div className="db-mini-stat">
              <span className="db-dot db-dot-green"></span>
              <span className="db-mini-label">Live</span>
              <span className="db-mini-value">{stats.events.live}</span>
            </div>
            <div className="db-mini-stat">
              <span className="db-dot db-dot-gray"></span>
              <span className="db-mini-label">Completed</span>
              <span className="db-mini-value">{stats.events.completed}</span>
            </div>
          </div>
          <div className="db-event-badges">
            <Link to="/events?status=Upcoming" className="db-badge db-badge-blue">Upcoming ({stats.events.upcoming})</Link>
            <Link to="/events?status=Live" className="db-badge db-badge-green">Live ({stats.events.live})</Link>
            <Link to="/events?status=Completed" className="db-badge db-badge-gray">Completed ({stats.events.completed})</Link>
          </div>
        </div>

        {/* Leads Card */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-title-row">
              <div className="db-card-icon db-icon-purple"><TrendingUpIcon /></div>
              <h3>Leads</h3>
            </div>
            <Link to="/leads" className="db-card-link">View all →</Link>
          </div>
          <div className="db-card-stats">
            <div className="db-mini-stat">
              <span className="db-dot db-dot-purple"></span>
              <span className="db-mini-label">New</span>
              <span className="db-mini-value">{stats.leads.new}</span>
            </div>
            <div className="db-mini-stat">
              <span className="db-dot db-dot-green"></span>
              <span className="db-mini-label">Converted</span>
              <span className="db-mini-value">{stats.leads.converted}</span>
            </div>
          </div>
          <div className="db-progress-block">
            <div className="db-progress-header">
              <span>Conversion Rate</span>
              <span className="db-progress-pct">{conversionRate}%</span>
            </div>
            <div className="db-progress-track">
              <div className="db-progress-fill db-fill-purple" style={{ width: `${Math.min(conversionRate, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row — Budget + Attendance */}
      <div className="db-mid-grid">

        {/* Budget Card */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-title-row">
              <div className="db-card-icon db-icon-green"><DollarIcon /></div>
              <h3>Budget & Expenses</h3>
            </div>
            <Link to="/expenses" className="db-card-link">View all →</Link>
          </div>
          <div className="db-card-stats">
            <div className="db-mini-stat">
              <span className="db-dot db-dot-green"></span>
              <span className="db-mini-label">Approved</span>
              <span className="db-mini-value">₹{(stats.expenses.approved / 1000).toFixed(0)}K</span>
            </div>
            <div className="db-mini-stat">
              <span className="db-dot db-dot-orange"></span>
              <span className="db-mini-label">Pending</span>
              <span className="db-mini-value">₹{(stats.expenses.pending / 1000).toFixed(0)}K</span>
            </div>
            <div className="db-mini-stat">
              <span className={`db-dot ${stats.expenses.remaining < 0 ? 'db-dot-red' : 'db-dot-gray'}`}></span>
              <span className="db-mini-label">{stats.expenses.remaining < 0 ? 'Over Budget' : 'Remaining'}</span>
              <span className={`db-mini-value ${stats.expenses.remaining < 0 ? 'db-value-red' : ''}`}>
                {stats.expenses.remaining < 0 ? '-' : ''}₹{(Math.abs(stats.expenses.remaining) / 1000).toFixed(0)}K
              </span>
            </div>
          </div>
          <div className="db-progress-block">
            <div className="db-progress-header">
              <span>Budget Utilization <small className="db-util-note">(approved + pending)</small></span>
              <span className="db-progress-pct">{budgetUtil}%</span>
            </div>
            <div className="db-progress-track">
              <div
                className={`db-progress-fill ${budgetUtil > 100 ? 'db-fill-red' : budgetUtil > 85 ? 'db-fill-red' : 'db-fill-green'}`}
                style={{ width: `${Math.min(budgetUtil, 100)}%` }}
              ></div>
            </div>
          </div>
          {stats.expenses.pending > 0 && (
            <Link to="/expenses?status=Pending" className="db-alert">
              ⚠️ {stats.expenses.pendingCount} expense{stats.expenses.pendingCount !== 1 ? 's' : ''} pending review
            </Link>
          )}
        </div>

        {/* Attendance Card */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-title-row">
              <div className="db-card-icon db-icon-orange"><ClockIcon /></div>
              <h3>Attendance</h3>
            </div>
            <Link to="/attendance" className="db-card-link">View all →</Link>
          </div>
          <div className="db-card-stats">
            <div className="db-mini-stat">
              <span className="db-dot db-dot-orange"></span>
              <span className="db-mini-label">Today</span>
              <span className="db-mini-value">{stats.attendance.today}</span>
            </div>
            <div className="db-mini-stat">
              <span className="db-dot db-dot-green"></span>
              <span className="db-mini-label">Present</span>
              <span className="db-mini-value">{stats.attendance.present}</span>
            </div>
            <div className="db-mini-stat">
              <span className="db-dot db-dot-gray"></span>
              <span className="db-mini-label">Total Records</span>
              <span className="db-mini-value">{stats.attendance.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="db-actions-section">
        <h3 className="db-actions-title">Quick Actions</h3>
        <div className="db-actions-grid">
          <Link to="/events/new" className="db-action-card">
            <div className="db-action-icon db-icon-blue"><PlusIcon /></div>
            <div>
              <p className="db-action-name">Create Event</p>
              <p className="db-action-desc">Add a new event to the system</p>
            </div>
          </Link>
          <Link to="/users/new" className="db-action-card">
            <div className="db-action-icon db-icon-purple"><UserPlusIcon /></div>
            <div>
              <p className="db-action-name">Add User</p>
              <p className="db-action-desc">Invite a new team member</p>
            </div>
          </Link>
          <Link to="/leads" className="db-action-card">
            <div className="db-action-icon db-icon-green"><TargetIcon /></div>
            <div>
              <p className="db-action-name">Manage Leads</p>
              <p className="db-action-desc">View and assign leads</p>
            </div>
          </Link>
          <Link to="/expenses" className="db-action-card">
            <div className="db-action-icon db-icon-orange"><ReceiptIcon /></div>
            <div>
              <p className="db-action-name">Review Expenses</p>
              <p className="db-action-desc">Approve pending expense requests</p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  )
}

export default Dashboard

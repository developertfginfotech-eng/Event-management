import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEvents, getUsers } from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    liveEvents: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [eventsRes, usersRes] = await Promise.all([
        getEvents(),
        getUsers()
      ])

      const events = eventsRes.data.data
      setStats({
        totalEvents: events.length,
        upcomingEvents: events.filter(e => e.status === 'Upcoming').length,
        liveEvents: events.filter(e => e.status === 'Live').length,
        totalUsers: usersRes.data.count
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Total Events</h3>
          <p className="stat-number">{stats.totalEvents}</p>
          <Link to="/events">View All</Link>
        </div>

        <div className="stat-card green">
          <h3>Upcoming Events</h3>
          <p className="stat-number">{stats.upcomingEvents}</p>
          <Link to="/events?status=Upcoming">View</Link>
        </div>

        <div className="stat-card orange">
          <h3>Live Events</h3>
          <p className="stat-number">{stats.liveEvents}</p>
          <Link to="/events?status=Live">View</Link>
        </div>

        <div className="stat-card purple">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
          <Link to="/users">View All</Link>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/events/new" className="action-button">
            <span className="action-icon">+</span>
            <span>Create Event</span>
          </Link>
          <Link to="/users/new" className="action-button">
            <span className="action-icon">+</span>
            <span>Add User</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

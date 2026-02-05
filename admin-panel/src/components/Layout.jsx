import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Layout.css'

function Layout({ children, setIsAuthenticated }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-content">
            <div className="brand-icon">EM</div>
            <div className="brand-text">
              <h2>Event Manager</h2>
              <p>Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-section">
            <div className="menu-section-title">Main Menu</div>
            <ul>
              <li>
                <Link to="/" className={isActive('/') ? 'active' : ''}>
                  <span className="menu-icon">📊</span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/events" className={isActive('/events') || location.pathname.startsWith('/events/') ? 'active' : ''}>
                  <span className="menu-icon">📅</span>
                  Events
                </Link>
              </li>
              <li>
                <Link to="/users" className={isActive('/users') || location.pathname.startsWith('/users/') ? 'active' : ''}>
                  <span className="menu-icon">👥</span>
                  Users
                </Link>
              </li>
              <li>
                <Link to="/leads" className={isActive('/leads') || location.pathname.startsWith('/leads/') ? 'active' : ''}>
                  <span className="menu-icon">📝</span>
                  Leads
                </Link>
              </li>
              <li>
                <Link to="/expenses" className={isActive('/expenses') || location.pathname.startsWith('/expenses/') ? 'active' : ''}>
                  <span className="menu-icon">💰</span>
                  Expenses
                </Link>
              </li>
              <li>
                <Link to="/attendance" className={isActive('/attendance') ? 'active' : ''}>
                  <span className="menu-icon">🕐</span>
                  Attendance
                </Link>
              </li>
              <li>
                <Link to="/tasks" className={isActive('/tasks') || location.pathname.startsWith('/tasks/') ? 'active' : ''}>
                  <span className="menu-icon">📋</span>
                  Tasks
                </Link>
              </li>
              <li>
                <Link to="/daily-reports" className={isActive('/daily-reports') || location.pathname.startsWith('/daily-reports/') ? 'active' : ''}>
                  <span className="menu-icon">📊</span>
                  Daily Reports
                </Link>
              </li>
              <li>
                <Link to="/activity-logs" className={isActive('/activity-logs') ? 'active' : ''}>
                  <span className="menu-icon">📜</span>
                  Activity Logs
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="layout-main">
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

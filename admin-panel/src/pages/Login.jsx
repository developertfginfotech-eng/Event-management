import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import './Login.css'

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login({ email, password })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setIsAuthenticated(true)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">EM</div>
          <h1>Event Management</h1>
          <h2>Admin Portal</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-info">
          <div className="login-info-title">Demo Credentials</div>
          <div className="login-credentials">
            <div className="login-credential-item">
              <span className="login-credential-label">Email:</span>
              <span className="login-credential-value">admin@gmail.com</span>
            </div>
            <div className="login-credential-item">
              <span className="login-credential-label">Password:</span>
              <span className="login-credential-value">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

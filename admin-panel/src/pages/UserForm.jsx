import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addUser, getUser, updateUser } from '../services/api'
import './UserForm.css'

function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Field User',
    designation: '',
    department: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isEdit) {
      loadUser()
    }
  }, [id])

  const loadUser = async () => {
    try {
      const response = await getUser(id)
      const user = response.data.data
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: '', // Don't populate password for security
        role: user.role,
        designation: user.designation || '',
        department: user.department || ''
      })
    } catch (error) {
      setError('Error loading user')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // For edit mode, if password is empty, don't send it
      const dataToSend = { ...formData }
      if (isEdit && !dataToSend.password) {
        delete dataToSend.password
      }

      if (isEdit) {
        await updateUser(id, dataToSend)
        alert('User updated successfully')
      } else {
        await addUser(dataToSend)
        alert('User added successfully')
      }
      navigate('/users')
    } catch (err) {
      setError(err.response?.data?.message || `Error ${isEdit ? 'updating' : 'adding'} user`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-form-page">
      <h1>{isEdit ? 'Edit User' : 'Add New User'}</h1>

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="9876543210"
              pattern="[0-9]{10}"
              title="Please enter 10 digit phone number"
            />
          </div>

          <div className="form-group">
            <label>Password {!isEdit && '*'}</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                placeholder={isEdit ? "Leave blank to keep current password" : "Min 6 characters"}
                minLength="6"
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
            {isEdit && <small style={{color: '#6b7280', fontSize: '12px'}}>Leave blank to keep current password</small>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Role *</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="Field User">Field User</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Sales Executive"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Sales"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? (isEdit ? 'Updating User...' : 'Adding User...') : (isEdit ? 'Update User' : 'Add User')}
          </button>
          <button type="button" onClick={() => navigate('/users')} className="secondary">
            Cancel
          </button>
        </div>
      </form>

      <div className="role-info card">
        <h3>Role Permissions</h3>
        <ul>
          <li><strong>Super Admin:</strong> Full access to everything</li>
          <li><strong>Admin:</strong> Manage events, users, approve expenses</li>
          <li><strong>Manager:</strong> View all leads, approve expenses, reports</li>
          <li><strong>Field User:</strong> Manage own leads, submit expenses</li>
        </ul>
      </div>
    </div>
  )
}

export default UserForm

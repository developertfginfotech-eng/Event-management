import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUsers, deleteUser } from '../services/api'
import './Users.css'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    try {
      const params = filter ? { role: filter } : {}
      const response = await getUsers(params)
      setUsers(response.data.data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      await deleteUser(id)
      setUsers(users.filter(u => u._id !== id))
      alert('User deleted successfully')
    } catch (error) {
      alert('Error deleting user: ' + error.response?.data?.message)
    }
  }

  if (loading) return <div className="loading">Loading users...</div>

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users Management</h1>
        <div className="header-actions">
          <Link to="/users/bulk-import" className="btn-secondary">
            Bulk Import
          </Link>
          <Link to="/users/new" className="btn-primary">Add User</Link>
        </div>
      </div>

      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Field User">Field User</option>
        </select>
      </div>

      {users.length === 0 ? (
        <div className="no-data">
          <p>No users found</p>
          <Link to="/users/new">Add your first user</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase().replace(' ', '-')}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.designation || '-'}</td>
                  <td>{user.department || '-'}</td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/users/edit/${user._id}`} className="btn-edit">Edit</Link>
                      <button onClick={() => handleDelete(user._id)} className="btn-delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Users

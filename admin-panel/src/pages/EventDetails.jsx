import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEvent, getUsers, assignUsersToEvent } from '../services/api'
import './EventDetails.css'

function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignLoading, setAssignLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [eventRes, usersRes] = await Promise.all([
        getEvent(id),
        getUsers()
      ])
      setEvent(eventRes.data.data)
      setAllUsers(usersRes.data.data)

      // Set already assigned users as selected
      if (eventRes.data.data.assignedUsers) {
        setSelectedUsers(eventRes.data.data.assignedUsers.map(u => u._id || u))
      }
    } catch (error) {
      setError('Error loading data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleAssignUsers = async () => {
    setAssignLoading(true)
    try {
      await assignUsersToEvent(id, selectedUsers)
      alert('Users assigned successfully')
      setShowAssignModal(false)
      loadData() // Reload to get updated data
    } catch (error) {
      alert('Error assigning users: ' + (error.response?.data?.message || error.message))
    } finally {
      setAssignLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) return <div className="loading">Loading event details...</div>
  if (error) return <div className="error">{error}</div>
  if (!event) return <div className="error">Event not found</div>

  const assignedUsersData = allUsers.filter(u => selectedUsers.includes(u._id))

  return (
    <div className="event-details-page">
      <div className="page-header">
        <div>
          <Link to="/events" className="back-link">← Back to Events</Link>
          <h1>{event.name}</h1>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowAssignModal(true)} className="btn-assign">
            Assign Users
          </button>
          <Link to={`/events/edit/${id}`} className="btn-edit">Edit Event</Link>
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <h3>Event Information</h3>
          <div className="detail-item">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{event.category}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className={`status-badge ${event.status.toLowerCase()}`}>
              {event.status}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Budget:</span>
            <span className="detail-value">₹{event.budget?.toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Start Date:</span>
            <span className="detail-value">{formatDate(event.startDate)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">End Date:</span>
            <span className="detail-value">{formatDate(event.endDate)}</span>
          </div>
        </div>

        <div className="detail-card">
          <h3>Location</h3>
          <div className="detail-item">
            <span className="detail-label">City:</span>
            <span className="detail-value">{event.location.city}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Venue:</span>
            <span className="detail-value">{event.location.venue}</span>
          </div>
          {event.location.address && (
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{event.location.address}</span>
            </div>
          )}
        </div>

        <div className="detail-card full-width">
          <h3>Description</h3>
          <p className="description-text">{event.description}</p>
        </div>

        {(event.websiteLink || event.socialLinks?.linkedin || event.socialLinks?.facebook || event.socialLinks?.instagram) && (
          <div className="detail-card full-width">
            <h3>Links</h3>
            <div className="links-grid">
              {event.websiteLink && (
                <a href={event.websiteLink} target="_blank" rel="noopener noreferrer" className="link-item">
                  🌐 Website
                </a>
              )}
              {event.socialLinks?.linkedin && (
                <a href={event.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="link-item">
                  💼 LinkedIn
                </a>
              )}
              {event.socialLinks?.facebook && (
                <a href={event.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="link-item">
                  📘 Facebook
                </a>
              )}
              {event.socialLinks?.instagram && (
                <a href={event.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="link-item">
                  📸 Instagram
                </a>
              )}
            </div>
          </div>
        )}

        <div className="detail-card full-width">
          <h3>Assigned Users ({assignedUsersData.length})</h3>
          {assignedUsersData.length === 0 ? (
            <p className="no-users">No users assigned to this event yet</p>
          ) : (
            <div className="assigned-users-grid">
              {assignedUsersData.map(user => (
                <div key={user._id} className="user-card">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-role">{user.role}</div>
                    <div className="user-contact">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Users to Event</h2>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="users-list">
                {allUsers.map(user => (
                  <label key={user._id} className="user-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserToggle(user._id)}
                    />
                    <div className="user-checkbox-info">
                      <div className="user-checkbox-name">{user.name}</div>
                      <div className="user-checkbox-meta">
                        <span className={`role-badge ${user.role.toLowerCase().replace(' ', '-')}`}>
                          {user.role}
                        </span>
                        <span className="user-checkbox-email">{user.email}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAssignModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleAssignUsers} className="btn-save" disabled={assignLoading}>
                {assignLoading ? 'Assigning...' : `Assign ${selectedUsers.length} Users`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetails

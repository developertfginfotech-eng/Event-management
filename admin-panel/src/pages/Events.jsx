import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEvents, deleteEvent } from '../services/api'
import './Events.css'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadEvents()
  }, [filter])

  const loadEvents = async () => {
    try {
      const params = filter ? { status: filter } : {}
      const response = await getEvents(params)
      setEvents(response.data.data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return

    try {
      await deleteEvent(id)
      setEvents(events.filter(e => e._id !== id))
      alert('Event deleted successfully')
    } catch (error) {
      alert('Error deleting event: ' + error.response?.data?.message)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) return <div className="loading">Loading events...</div>

  return (
    <div className="events-page">
      <div className="page-header">
        <h1>Events Management</h1>
        <Link to="/events/new" className="btn-primary">Create Event</Link>
      </div>

      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Events</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Live">Live</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {events.length === 0 ? (
        <div className="no-data">
          <p>No events found</p>
          <Link to="/events/new">Create your first event</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Category</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id}>
                  <td><strong>{event.name}</strong></td>
                  <td>{event.location.city}, {event.location.venue}</td>
                  <td>{formatDate(event.startDate)}</td>
                  <td>{formatDate(event.endDate)}</td>
                  <td>{event.category}</td>
                  <td>
                    <span className={`status-badge ${event.status.toLowerCase()}`}>
                      {event.status}
                    </span>
                  </td>
                  <td>₹{event.budget.toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/events/${event._id}`} className="btn-view">View</Link>
                      <Link to={`/events/edit/${event._id}`} className="btn-edit">Edit</Link>
                      <button onClick={() => handleDelete(event._id)} className="btn-delete">Delete</button>
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

export default Events

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllLeads, getEvents, deleteLead, assignLead, getUsers, exportLeadsToExcel, exportLeadsToCSV } from '../services/api'
import './Leads.css'

function Leads() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    source: '',
    status: '',
    priority: '',
    assignedTo: '',
    search: ''
  })
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [assignUserId, setAssignUserId] = useState('')

  useEffect(() => {
    loadLeads()
    loadEvents()
    loadUsers()
  }, [])

  const loadLeads = async () => {
    try {
      setLoading(true)
      const response = await getAllLeads(filters)
      setLeads(response.data.data)
    } catch (error) {
      console.error('Error loading leads:', error)
      alert('Error loading leads')
    } finally {
      setLoading(false)
    }
  }

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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleApplyFilters = () => {
    loadLeads()
  }

  const handleClearFilters = () => {
    setFilters({
      source: '',
      status: '',
      priority: '',
      assignedTo: '',
      search: ''
    })
    setTimeout(() => loadLeads(), 0)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return

    try {
      await deleteLead(id)
      alert('Lead deleted successfully')
      loadLeads()
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting lead')
    }
  }

  const handleAssign = async () => {
    if (!assignUserId) {
      alert('Please select a user')
      return
    }

    try {
      await assignLead(selectedLead._id, assignUserId)
      alert('Lead assigned successfully')
      setShowAssignModal(false)
      setSelectedLead(null)
      setAssignUserId('')
      loadLeads()
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning lead')
    }
  }

  const handleExportExcel = async () => {
    try {
      const response = await exportLeadsToExcel(filters)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `leads-${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Error exporting to Excel')
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await exportLeadsToCSV(filters)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `leads-${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Error exporting to CSV')
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'New': 'badge-new',
      'Contacted': 'badge-contacted',
      'Follow-up': 'badge-followup',
      'Qualified': 'badge-qualified',
      'Converted': 'badge-converted',
      'Lost': 'badge-lost'
    }
    return statusColors[status] || 'badge-default'
  }

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'High': 'badge-high',
      'Medium': 'badge-medium',
      'Low': 'badge-low'
    }
    return priorityColors[priority] || 'badge-default'
  }

  return (
    <div className="leads-page">
      <div className="page-header">
        <h1>Lead Management</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/leads/new')} className="btn-primary">
            + Add Lead
          </button>
          <button onClick={handleExportExcel} className="btn-secondary">
            📊 Export Excel
          </button>
          <button onClick={handleExportCSV} className="btn-secondary">
            📄 Export CSV
          </button>
          <button onClick={() => navigate('/leads/bulk-import')} className="btn-secondary">
            📥 Bulk Import
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <input
            type="text"
            name="search"
            placeholder="Search name, company, email..."
            value={filters.search}
            onChange={handleFilterChange}
          />

          <select name="source" value={filters.source} onChange={handleFilterChange}>
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.name}</option>
            ))}
          </select>

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>

          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select name="assignedTo" value={filters.assignedTo} onChange={handleFilterChange}>
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>

          <button onClick={handleApplyFilters} className="btn-primary">Apply</button>
          <button onClick={handleClearFilters} className="btn-secondary">Clear</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading leads...</div>
      ) : (
        <>
          <div className="stats-summary">
            <div className="stat-card">
              <h3>{leads.length}</h3>
              <p>Total Leads</p>
            </div>
            <div className="stat-card">
              <h3>{leads.filter(l => l.status === 'New').length}</h3>
              <p>New</p>
            </div>
            <div className="stat-card">
              <h3>{leads.filter(l => l.status === 'Converted').length}</h3>
              <p>Converted</p>
            </div>
            <div className="stat-card">
              <h3>{leads.filter(l => l.priority === 'High').length}</h3>
              <p>High Priority</p>
            </div>
          </div>

          <div className="table-container">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No leads found</td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead._id}>
                      <td className="lead-name">{lead.name}</td>
                      <td>{lead.company}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.email || '-'}</td>
                      <td>{lead.source?.name || '-'}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadge(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </td>
                      <td>{lead.assignedTo?.name || 'Unassigned'}</td>
                      <td className="actions">
                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="btn-icon"
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => navigate(`/leads/edit/${lead._id}`)}
                          className="btn-icon"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLead(lead)
                            setAssignUserId(lead.assignedTo?._id || '')
                            setShowAssignModal(true)
                          }}
                          className="btn-icon"
                          title="Assign"
                        >
                          👤
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="btn-icon btn-danger"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Assign Lead</h2>
            <p>Lead: <strong>{selectedLead?.name}</strong> - {selectedLead?.company}</p>

            <div className="form-group">
              <label>Assign To User:</label>
              <select
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                className="form-control"
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button onClick={handleAssign} className="btn-primary">Assign</button>
              <button onClick={() => setShowAssignModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leads

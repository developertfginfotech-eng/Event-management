import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLeadById, deleteLead } from '../services/api'
import './LeadDetails.css'

function LeadDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadLead()
  }, [id])

  const loadLead = async () => {
    try {
      setLoading(true)
      const response = await getLeadById(id)
      setLead(response.data.data)
    } catch (error) {
      console.error('Error loading lead:', error)
      setError(error.response?.data?.message || 'Error loading lead details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return

    try {
      await deleteLead(id)
      alert('Lead deleted successfully')
      navigate('/leads')
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting lead')
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

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="loading-page">Loading lead details...</div>
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/leads')} className="btn-primary">
          Back to Leads
        </button>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="error-page">
        <h2>Lead Not Found</h2>
        <button onClick={() => navigate('/leads')} className="btn-primary">
          Back to Leads
        </button>
      </div>
    )
  }

  return (
    <div className="lead-details-page">
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/leads')} className="back-btn">
            ← Back to Leads
          </button>
          <h1>{lead.name}</h1>
          <p className="lead-company">{lead.company}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleDelete} className="btn-danger">
            🗑️ Delete Lead
          </button>
        </div>
      </div>

      <div className="details-grid">
        {/* Basic Information */}
        <div className="details-card">
          <h2>📋 Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Name</label>
              <p>{lead.name}</p>
            </div>
            <div className="info-item">
              <label>Company</label>
              <p>{lead.company}</p>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <p>
                <a href={`tel:${lead.phone}`}>{lead.phone}</a>
              </p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>
                {lead.email ? (
                  <a href={`mailto:${lead.email}`}>{lead.email}</a>
                ) : '-'}
              </p>
            </div>
            <div className="info-item">
              <label>Designation</label>
              <p>{lead.designation || '-'}</p>
            </div>
            <div className="info-item">
              <label>Source Event</label>
              <p>{lead.source?.name || '-'}</p>
            </div>
          </div>
        </div>

        {/* Status & Priority */}
        <div className="details-card">
          <h2>🎯 Status & Priority</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Status</label>
              <span className={`badge ${getStatusBadge(lead.status)}`}>
                {lead.status}
              </span>
            </div>
            <div className="info-item">
              <label>Priority</label>
              <span className={`badge ${getPriorityBadge(lead.priority)}`}>
                {lead.priority}
              </span>
            </div>
            <div className="info-item">
              <label>Assigned To</label>
              <p>{lead.assignedTo?.name || 'Unassigned'}</p>
            </div>
            <div className="info-item">
              <label>Created By</label>
              <p>{lead.createdBy?.name || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details */}
      {lead.source && (
        <div className="details-card full-width">
          <h2>📅 Event Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Event Name</label>
              <p>{lead.source.name}</p>
            </div>
            <div className="info-item">
              <label>Start Date</label>
              <p>{formatDate(lead.source.startDate)}</p>
            </div>
            <div className="info-item">
              <label>End Date</label>
              <p>{formatDate(lead.source.endDate)}</p>
            </div>
            <div className="info-item">
              <label>Location</label>
              <p>
                {lead.source.location?.city && lead.source.location?.venue
                  ? `${lead.source.location.city} - ${lead.source.location.venue}`
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="details-card full-width">
        <h2>📝 Notes ({lead.notes?.length || 0})</h2>
        {lead.notes && lead.notes.length > 0 ? (
          <div className="timeline">
            {lead.notes.map((note, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-author">
                      {note.createdBy?.name || 'Unknown'}
                    </span>
                    <span className="timeline-date">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="timeline-text">{note.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No notes available</p>
        )}
      </div>

      {/* Follow-ups */}
      <div className="details-card full-width">
        <h2>📅 Follow-ups ({lead.followUps?.length || 0})</h2>
        {lead.followUps && lead.followUps.length > 0 ? (
          <div className="followups-list">
            {lead.followUps.map((followup, index) => (
              <div
                key={index}
                className={`followup-item ${followup.completed ? 'completed' : ''}`}
              >
                <div className="followup-status">
                  {followup.completed ? '✅' : '⏰'}
                </div>
                <div className="followup-content">
                  <p className="followup-description">{followup.description}</p>
                  <span className="followup-date">
                    {formatDate(followup.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No follow-ups scheduled</p>
        )}
      </div>

      {/* Communications */}
      <div className="details-card full-width">
        <h2>💬 Communications ({lead.communications?.length || 0})</h2>
        {lead.communications && lead.communications.length > 0 ? (
          <div className="timeline">
            {lead.communications.map((comm, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker comm-marker">
                  {comm.type === 'call' && '📞'}
                  {comm.type === 'email' && '📧'}
                  {comm.type === 'whatsapp' && '💬'}
                  {comm.type === 'meeting' && '🤝'}
                  {comm.type === 'other' && '💭'}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-type">{comm.type}</span>
                    <span className="timeline-date">
                      {formatDate(comm.date)}
                    </span>
                  </div>
                  <p className="timeline-text">{comm.notes}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No communications logged</p>
        )}
      </div>

      {/* Attachments */}
      {lead.attachments && lead.attachments.length > 0 && (
        <div className="details-card full-width">
          <h2>📎 Attachments ({lead.attachments.length})</h2>
          <div className="attachments-list">
            {lead.attachments.map((attachment, index) => (
              <div key={index} className="attachment-item">
                <span className="attachment-icon">📄</span>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-name"
                >
                  {attachment.name}
                </a>
                <span className="attachment-date">
                  {formatDate(attachment.uploadedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadDetails

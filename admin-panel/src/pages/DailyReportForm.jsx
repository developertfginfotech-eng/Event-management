import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createDailyReport, getDailyReport, updateDailyReport, submitDailyReport, getEvents } from '../services/api'
import './LeadForm.css'

function DailyReportForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    event: '',
    timeOut: '',
    coverageSummary: {
      boothsCovered: '',
      interviewsConducted: '',
    },
    notes: '',
    challenges: '',
    achievements: '',
  })

  useEffect(() => {
    loadEvents()
    if (isEditMode) {
      loadReport()
    }
  }, [id])

  const loadEvents = async () => {
    try {
      const response = await getEvents()
      setEvents(response.data.data)
    } catch (error) {
      console.error('Error loading events:', error)
      alert('Error loading events')
    }
  }

  const loadReport = async () => {
    try {
      setLoading(true)
      const response = await getDailyReport(id)
      const report = response.data.data
      setFormData({
        event: report.event._id,
        timeOut: report.timeOut ? new Date(report.timeOut).toISOString().slice(0, 16) : '',
        coverageSummary: {
          boothsCovered: report.coverageSummary.boothsCovered,
          interviewsConducted: report.coverageSummary.interviewsConducted,
        },
        notes: report.notes || '',
        challenges: report.challenges || '',
        achievements: report.achievements || '',
      })
    } catch (error) {
      console.error('Error loading report:', error)
      alert('Error loading report')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith('coverageSummary.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        coverageSummary: {
          ...formData.coverageSummary,
          [field]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSaveDraft = async (e) => {
    e.preventDefault()

    if (!formData.event || !formData.coverageSummary.boothsCovered || !formData.coverageSummary.interviewsConducted) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const payload = {
        ...formData,
        status: 'Draft',
      }

      if (isEditMode) {
        await updateDailyReport(id, payload)
        alert('Daily report draft saved successfully')
      } else {
        await createDailyReport(payload)
        alert('Daily report draft created successfully')
      }
      navigate('/daily-reports')
    } catch (error) {
      console.error('Error saving draft:', error)
      alert(error.response?.data?.message || 'Error saving draft')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.event || !formData.coverageSummary.boothsCovered || !formData.coverageSummary.interviewsConducted) {
      alert('Please fill in all required fields')
      return
    }

    if (!formData.timeOut) {
      alert('Please provide time out before submitting')
      return
    }

    try {
      setLoading(true)

      if (isEditMode) {
        // Update first, then submit
        await updateDailyReport(id, formData)
        await submitDailyReport(id, { timeOut: formData.timeOut })
        alert('Daily report submitted successfully')
      } else {
        // Create and submit
        const response = await createDailyReport(formData)
        const reportId = response.data.data._id
        await submitDailyReport(reportId, { timeOut: formData.timeOut })
        alert('Daily report submitted successfully')
      }

      navigate('/daily-reports')
    } catch (error) {
      console.error('Error submitting report:', error)
      alert(error.response?.data?.message || 'Error submitting report')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditMode) {
    return <div className="loading">Loading report...</div>
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Daily Report' : 'Create Daily Report'}</h1>
        <button onClick={() => navigate('/daily-reports')} className="btn-secondary">
          ← Back to Reports
        </button>
      </div>

      <form onSubmit={handleSubmit} className="lead-form">
        <div className="form-section">
          <h2>Coverage Summary</h2>

          <div className="form-group">
            <label htmlFor="event">
              Event <span className="required">*</span>
            </label>
            <select
              id="event"
              name="event"
              value={formData.event}
              onChange={handleChange}
              required
            >
              <option value="">Select Event</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="boothsCovered">
                Booths Covered <span className="required">*</span>
              </label>
              <input
                type="number"
                id="boothsCovered"
                name="coverageSummary.boothsCovered"
                value={formData.coverageSummary.boothsCovered}
                onChange={handleChange}
                placeholder="Enter number of booths covered"
                min="0"
                required
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Number of exhibition booths/stalls visited
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="interviewsConducted">
                Interviews Conducted <span className="required">*</span>
              </label>
              <input
                type="number"
                id="interviewsConducted"
                name="coverageSummary.interviewsConducted"
                value={formData.coverageSummary.interviewsConducted}
                onChange={handleChange}
                placeholder="Enter number of interviews"
                min="0"
                required
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Total interviews/conversations with prospects
              </small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="timeOut">
              Time Out <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="timeOut"
              name="timeOut"
              value={formData.timeOut}
              onChange={handleChange}
              required
            />
            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Time In is automatically taken from your attendance check-in
            </small>
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Details</h2>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes or observations"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="achievements">Achievements</label>
            <textarea
              id="achievements"
              name="achievements"
              value={formData.achievements}
              onChange={handleChange}
              placeholder="List your achievements for the day"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="challenges">Challenges Faced</label>
            <textarea
              id="challenges"
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              placeholder="Describe any challenges you encountered"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/daily-reports')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default DailyReportForm

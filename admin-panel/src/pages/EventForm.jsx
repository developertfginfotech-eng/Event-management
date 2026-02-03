import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createEvent, updateEvent, getEvent } from '../services/api'
import './EventForm.css'

function EventForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: {
      city: '',
      venue: '',
      address: '',
      coordinates: { latitude: '', longitude: '' }
    },
    category: 'Trade Show',
    websiteLink: '',
    socialLinks: { linkedin: '', facebook: '', instagram: '' },
    budget: '',
    status: 'Upcoming'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Major Indian cities for autocomplete
  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai',
    'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
    'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi',
    'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
    'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada',
    'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati',
    'Solapur', 'Hubli-Dharwad', 'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh',
    'Tiruppur', 'Moradabad', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Warangal',
    'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati',
    'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi',
    'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela',
    'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar',
    'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu',
    'Sangli-Miraj & Kupwad', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli',
    'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala'
  ]

  useEffect(() => {
    if (isEdit) {
      loadEvent()
    }
  }, [id])

  const loadEvent = async () => {
    try {
      const response = await getEvent(id)
      const event = response.data.data
      setFormData({
        ...event,
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate.split('T')[0]
      })
    } catch (error) {
      setError('Error loading event')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        budget: Number(formData.budget)
      }

      if (isEdit) {
        await updateEvent(id, data)
        alert('Event updated successfully')
      } else {
        await createEvent(data)
        alert('Event created successfully')
      }
      navigate('/events')
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="event-form-page">
      <h1>{isEdit ? 'Edit Event' : 'Create Event'}</h1>

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-row">
          <div className="form-group">
            <label>Event Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Tech Trade Show 2024"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="Trade Show">Trade Show</option>
              <option value="Conference">Conference</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Seminar">Seminar</option>
              <option value="Workshop">Workshop</option>
              <option value="Networking">Networking</option>
              <option value="Product Launch">Product Launch</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describe your event..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="location.city"
              value={formData.location.city}
              onChange={handleChange}
              required
              placeholder="Mumbai"
              list="city-suggestions"
              autoComplete="off"
            />
            <datalist id="city-suggestions">
              {indianCities.map(city => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label>Venue *</label>
            <input
              type="text"
              name="location.venue"
              value={formData.location.venue}
              onChange={handleChange}
              required
              placeholder="Exhibition Centre"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            placeholder="Full address"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Budget</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="500000"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Upcoming">Upcoming</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Website Link</label>
          <input
            type="url"
            name="websiteLink"
            value={formData.websiteLink}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <h3>Social Links</h3>

        <div className="form-row">
          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="url"
              name="socialLinks.linkedin"
              value={formData.socialLinks.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/company/..."
            />
          </div>

          <div className="form-group">
            <label>Facebook</label>
            <input
              type="url"
              name="socialLinks.facebook"
              value={formData.socialLinks.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
            />
          </div>
        </div>

        <div className="form-group">
          <label>Instagram</label>
          <input
            type="url"
            name="socialLinks.instagram"
            value={formData.socialLinks.instagram}
            onChange={handleChange}
            placeholder="https://instagram.com/..."
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Event' : 'Create Event')}
          </button>
          <button type="button" onClick={() => navigate('/events')} className="secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventForm

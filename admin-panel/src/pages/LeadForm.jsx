import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createLeadAdmin,
  updateLeadAdmin,
  getLeadById,
  getEvents,
  uploadFiles,
  addAttachmentsToLead
} from '../services/api'
import './LeadForm.css'

function LeadForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    phones: [{ number: '', type: 'Primary', isPrimary: true }],
    designation: '',
    linkedin: '',

    // Business Details
    company: '',
    location: { country: '', state: '', city: '' },
    website: '',
    socialLinks: {
      linkedin: '',
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      other: ''
    },
    industry: '',
    serviceInterestedIn: '',
    briefRequirement: '',

    // Interested In
    interestedIn: '',
    interestedInOther: '',

    // Meta
    source: '',
    status: 'New',
    priority: 'Medium'
  })

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState([])

  useEffect(() => {
    loadEvents()
    if (isEdit) {
      loadLead()
    }
  }, [id])

  const loadEvents = async () => {
    try {
      const response = await getEvents()
      setEvents(response.data.data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const loadLead = async () => {
    try {
      const response = await getLeadById(id)
      const lead = response.data.data
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phones: lead.phones && lead.phones.length > 0 ? lead.phones : [{ number: lead.phone || '', type: 'Primary', isPrimary: true }],
        designation: lead.designation || '',
        linkedin: lead.linkedin || '',
        company: lead.company || '',
        location: lead.location || { country: '', state: '', city: '' },
        website: lead.website || '',
        socialLinks: lead.socialLinks || {
          linkedin: '',
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: '',
          other: ''
        },
        industry: lead.industry || '',
        serviceInterestedIn: lead.serviceInterestedIn || '',
        briefRequirement: lead.briefRequirement || '',
        interestedIn: lead.interestedIn || '',
        interestedInOther: lead.interestedInOther || '',
        source: lead.source?._id || lead.source || '',
        status: lead.status || 'New',
        priority: lead.priority || 'Medium'
      })
    } catch (error) {
      setError('Error loading lead')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNestedChange = (e) => {
    const { name, value } = e.target
    const [parent, child] = name.split('.')
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: value }
    }))
  }

  const handlePhoneChange = (index, field, value) => {
    const newPhones = [...formData.phones]
    newPhones[index] = { ...newPhones[index], [field]: value }

    // If setting isPrimary, unset others
    if (field === 'isPrimary' && value) {
      newPhones.forEach((phone, i) => {
        if (i !== index) {
          phone.isPrimary = false
        }
      })
    }

    setFormData(prev => ({ ...prev, phones: newPhones }))
  }

  const addPhone = () => {
    setFormData(prev => ({
      ...prev,
      phones: [...prev.phones, { number: '', type: 'Secondary', isPrimary: false }]
    }))
  }

  const removePhone = (index) => {
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index)
      // Ensure at least one is primary
      if (!newPhones.some(p => p.isPrimary) && newPhones.length > 0) {
        newPhones[0].isPrimary = true
      }
      setFormData(prev => ({ ...prev, phones: newPhones }))
    }
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)

    // Validate file size (5MB max)
    const invalidFiles = selectedFiles.filter(file => file.size > 5242880)
    if (invalidFiles.length > 0) {
      setError('Some files exceed 5MB size limit')
      return
    }

    // Validate file type (images only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const invalidTypes = selectedFiles.filter(file => !validTypes.includes(file.type))
    if (invalidTypes.length > 0) {
      setError('Only image files (JPEG, PNG, GIF, WebP) are allowed')
      return
    }

    setFiles(prev => [...prev, ...selectedFiles])
    setError('')
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.company || !formData.source || !formData.phones[0].number) {
        setError('Please fill all required fields (Name, Company, Event Source, and at least one Phone)')
        setLoading(false)
        return
      }

      // Create or update lead
      let leadId
      if (isEdit) {
        const response = await updateLeadAdmin(id, formData)
        leadId = response.data.data._id
      } else {
        const response = await createLeadAdmin(formData)
        leadId = response.data.data._id
      }

      // Upload files if any
      if (files.length > 0) {
        const uploadResponse = await uploadFiles(files)
        const attachments = uploadResponse.data.data.map(file => ({
          name: file.filename,
          url: file.path
        }))
        await addAttachmentsToLead(leadId, attachments)
      }

      alert(isEdit ? 'Lead updated successfully' : 'Lead created successfully')
      navigate(`/leads`)
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lead-form-page">
      <h1>{isEdit ? 'Edit Lead' : 'Add New Lead'}</h1>

      <form onSubmit={handleSubmit} className="lead-form">

        {/* Event Source */}
        <div className="form-section">
          <h3>Event Source</h3>
          <div className="form-group">
            <label>Event *</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              required
            >
              <option value="">Select Event</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.name} - {new Date(event.startDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Personal Details */}
        <div className="form-section">
          <h3>Personal Details</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
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
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Phone Numbers */}
          {formData.phones.map((phone, index) => (
            <div key={index} className="phone-group">
              <div className="form-row">
                <div className="form-group">
                  <label>Phone / WhatsApp Number {index === 0 ? '*' : ''}</label>
                  <input
                    type="tel"
                    value={phone.number}
                    onChange={(e) => handlePhoneChange(index, 'number', e.target.value)}
                    required={index === 0}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={phone.type}
                    onChange={(e) => handlePhoneChange(index, 'type', e.target.value)}
                  >
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={phone.isPrimary}
                      onChange={(e) => handlePhoneChange(index, 'isPrimary', e.target.checked)}
                    />
                    Primary
                  </label>
                  {index > 0 && (
                    <button type="button" onClick={() => removePhone(index)} className="btn-remove">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addPhone} className="btn-add">
            + Add Another Phone
          </button>

          <div className="form-row">
            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Marketing Manager"
              />
            </div>

            <div className="form-group">
              <label>LinkedIn Profile</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="form-section">
          <h3>Business Details</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Company *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="ABC Corporation"
              />
            </div>

            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="Technology, Healthcare, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleNestedChange}
                placeholder="India"
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleNestedChange}
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="location.city"
              value={formData.location.city}
              onChange={handleNestedChange}
              placeholder="Mumbai"
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <h4>Social Media Links</h4>
          <div className="form-row">
            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                name="socialLinks.linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleNestedChange}
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            <div className="form-group">
              <label>Facebook</label>
              <input
                type="url"
                name="socialLinks.facebook"
                value={formData.socialLinks.facebook}
                onChange={handleNestedChange}
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Instagram</label>
              <input
                type="url"
                name="socialLinks.instagram"
                value={formData.socialLinks.instagram}
                onChange={handleNestedChange}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="form-group">
              <label>Twitter</label>
              <input
                type="url"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleNestedChange}
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>YouTube</label>
              <input
                type="url"
                name="socialLinks.youtube"
                value={formData.socialLinks.youtube}
                onChange={handleNestedChange}
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="form-group">
              <label>Other</label>
              <input
                type="url"
                name="socialLinks.other"
                value={formData.socialLinks.other}
                onChange={handleNestedChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Service Interested In</label>
            <input
              type="text"
              name="serviceInterestedIn"
              value={formData.serviceInterestedIn}
              onChange={handleChange}
              placeholder="Web Development, Marketing, etc."
            />
          </div>

          <div className="form-group">
            <label>Brief Requirement</label>
            <textarea
              name="briefRequirement"
              value={formData.briefRequirement}
              onChange={handleChange}
              rows="3"
              placeholder="Describe the requirement..."
            />
          </div>
        </div>

        {/* Interested In */}
        <div className="form-section">
          <h3>Interested In</h3>

          <div className="form-group">
            <label>Select Interest</label>
            <select
              name="interestedIn"
              value={formData.interestedIn}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="Print Ads">Print Ads</option>
              <option value="Documentary">Documentary</option>
              <option value="Interview">Interview</option>
              <option value="Website Ads">Website Ads</option>
              <option value="Social Media">Social Media</option>
              <option value="Event Coverage">Event Coverage</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.interestedIn === 'Other' && (
            <div className="form-group">
              <label>Please Specify</label>
              <input
                type="text"
                name="interestedInOther"
                value={formData.interestedInOther}
                onChange={handleChange}
                placeholder="Describe other interest..."
              />
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="form-section">
          <h3>Attachments</h3>

          <div className="form-group">
            <label>Upload Images (Max 5MB each)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div className="file-preview">
              <h4>Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                  <button type="button" onClick={() => removeFile(index)} className="btn-remove">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status & Priority */}
        <div className="form-section">
          <h3>Lead Status</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Lead' : 'Create Lead')}
          </button>
          <button type="button" onClick={() => navigate('/leads')} className="secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default LeadForm

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bulkImportUsers } from '../services/api'
import './BulkUserImport.css'

function BulkUserImport() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewData, setPreviewData] = useState([])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setError('')
        previewCSV(selectedFile)
      } else {
        setError('Please select a CSV file')
        setFile(null)
        setPreviewData([])
      }
    }
  }

  const previewCSV = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())

      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim())
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      setPreviewData(preview)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target.result
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

        const users = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const user = {}
          headers.forEach((header, index) => {
            user[header] = values[index] || ''
          })
          return user
        }).filter(user => user.email && user.name) // Filter out invalid rows

        if (users.length === 0) {
          setError('No valid users found in the CSV file')
          setLoading(false)
          return
        }

        // Send to API
        const response = await bulkImportUsers(users)
        setSuccess(`Successfully imported ${users.length} users!`)
        setFile(null)
        setPreviewData([])

        // Reset file input
        const fileInput = document.getElementById('csv-file')
        if (fileInput) fileInput.value = ''

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/users')
        }, 2000)
      }
      reader.readAsText(file)
    } catch (err) {
      setError(err.response?.data?.message || 'Error importing users')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'name,email,phone,password,role,designation,department\nJohn Doe,john@example.com,9876543210,password123,Field User,Sales Executive,Sales\nJane Smith,jane@example.com,9876543211,password123,Manager,Sales Manager,Sales'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bulk-import-page">
      <div className="page-header">
        <h1>Bulk User Import</h1>
        <button onClick={() => navigate('/users')} className="btn-back">
          Back to Users
        </button>
      </div>

      <div className="import-container">
        <div className="import-card">
          <div className="import-header">
            <h3>📤 Upload CSV File</h3>
            <p>Import multiple users at once using a CSV file</p>
          </div>

          <div className="instructions">
            <h4>Instructions:</h4>
            <ol>
              <li>Download the CSV template below</li>
              <li>Fill in user details (name, email, phone, password, role, designation, department)</li>
              <li>Required fields: name, email, phone, password, role</li>
              <li>Valid roles: Super Admin, Admin, Manager, Field User</li>
              <li>Upload the completed CSV file</li>
            </ol>
          </div>

          <button onClick={downloadTemplate} className="btn-template">
            📥 Download CSV Template
          </button>

          <div className="file-upload-section">
            <label htmlFor="csv-file" className="file-upload-label">
              <div className="file-upload-icon">📁</div>
              <div className="file-upload-text">
                {file ? file.name : 'Click to select CSV file or drag and drop'}
              </div>
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          {previewData.length > 0 && (
            <div className="preview-section">
              <h4>Preview (First 5 rows):</h4>
              <div className="preview-table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      {Object.keys(previewData[0]).map(header => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div className="import-actions">
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="btn-import"
            >
              {loading ? 'Importing...' : 'Import Users'}
            </button>
          </div>
        </div>

        <div className="info-card">
          <h3>💡 Tips</h3>
          <ul>
            <li>Make sure your CSV file uses commas (,) as separators</li>
            <li>Email addresses must be unique</li>
            <li>Phone numbers should be 10 digits</li>
            <li>Passwords should be at least 6 characters</li>
            <li>Use the exact role names: Super Admin, Admin, Manager, Field User</li>
            <li>Designation and Department are optional fields</li>
            <li>First row must contain column headers</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BulkUserImport

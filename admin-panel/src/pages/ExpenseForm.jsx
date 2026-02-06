import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createExpense, getExpense, updateExpense, getEvents, getUsers } from '../services/api'
import './LeadForm.css'

function ExpenseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  // Category to Subcategory mapping
  const categorySubcategories = {
    Travel: ['Cab', 'Train', 'Flight', 'Bus', 'Auto', 'Other'],
    Food: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Team Meal', 'Client Meal', 'Other'],
    Stay: ['Hotel', 'Guest House', 'Airbnb', 'Hostel', 'Other'],
    Misc: ['Printing', 'Stationery', 'Equipment', 'Software', 'Internet', 'Phone', 'Other'],
  }

  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Travel',
    subCategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    event: '',
    paymentMethod: 'Cash',
    billNumber: '',
  })

  useEffect(() => {
    loadEvents()
    loadUsers()
    if (isEditMode) {
      loadExpense()
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

  const loadUsers = async () => {
    try {
      const response = await getUsers()
      setUsers(response.data.data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadExpense = async () => {
    try {
      setLoading(true)
      const response = await getExpense(id)
      const expense = response.data.data
      setFormData({
        amount: expense.amount,
        category: expense.category,
        subCategory: expense.subCategory || '',
        description: expense.description,
        date: new Date(expense.date).toISOString().split('T')[0],
        event: expense.event._id,
        paymentMethod: expense.paymentMethod || 'Cash',
        billNumber: expense.billNumber || '',
      })
    } catch (error) {
      console.error('Error loading expense:', error)
      alert('Error loading expense')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // Reset subcategory when category changes
    if (name === 'category') {
      setFormData({
        ...formData,
        category: value,
        subCategory: '', // Reset subcategory
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.amount || !formData.category || !formData.description || !formData.event) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      if (isEditMode) {
        await updateExpense(id, formData)
        alert('Expense updated successfully')
      } else {
        await createExpense(formData)
        alert('Expense created successfully')
      }
      navigate('/expenses')
    } catch (error) {
      console.error('Error saving expense:', error)
      alert(error.response?.data?.message || 'Error saving expense')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditMode) {
    return <div className="loading">Loading expense...</div>
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h1>
        <button onClick={() => navigate('/expenses')} className="btn-secondary">
          ← Back to Expenses
        </button>
      </div>

      <form onSubmit={handleSubmit} className="lead-form">
        <div className="form-section">
          <h2>Expense Details</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">
                Amount (₹) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
                <option value="Stay">Stay</option>
                <option value="Misc">Miscellaneous</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subCategory">Sub-Category</label>
              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
              >
                <option value="">Select Sub-Category</option>
                {categorySubcategories[formData.category]?.map(subCat => (
                  <option key={subCat} value={subCat}>
                    {subCat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter expense description"
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="billNumber">Bill Number</label>
              <input
                type="text"
                id="billNumber"
                name="billNumber"
                value={formData.billNumber}
                onChange={handleChange}
                placeholder="Enter bill number"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Event Assignment</h2>

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
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Expense' : 'Create Expense'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ExpenseForm

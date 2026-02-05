import axios from 'axios'

const API_URL = `${import.meta.env.VITE_API_URL}/api`

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (credentials) => api.post('/auth/login', credentials)
export const getMe = () => api.get('/auth/me')

// Events
export const getEvents = (params) => api.get('/events', { params })
export const getEvent = (id) => api.get(`/events/${id}`)
export const createEvent = (data) => api.post('/events', data)
export const updateEvent = (id, data) => api.put(`/events/${id}`, data)
export const deleteEvent = (id) => api.delete(`/events/${id}`)
export const assignUsersToEvent = (id, userIds) => api.post(`/events/${id}/assign-users`, { userIds })
export const getEventStats = (id) => api.get(`/events/${id}/stats`)

// Users
export const getUsers = (params) => api.get('/users', { params })
export const getUser = (id) => api.get(`/users/${id}`)
export const addUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)
export const bulkImportUsers = (users) => api.post('/users/bulk-import', { users })

// Activity Logs
export const getActivityLogs = (params) => api.get('/activity-logs', { params })
export const getActivityStats = () => api.get('/activity-logs/stats')

// Admin Leads
export const getAllLeads = (params) => api.get('/admin/leads', { params })
export const getLeadById = (id) => api.get(`/admin/leads/${id}`)
export const assignLead = (id, userId) => api.post(`/admin/leads/${id}/assign`, { userId })
export const bulkImportLeads = (sourceId, leads) => api.post('/admin/leads/bulk-import', { sourceId, leads })
export const deleteLead = (id) => api.delete(`/admin/leads/${id}`)
export const getEventReport = (sourceId) => api.get(`/admin/leads/reports/source/${sourceId}`)
export const exportLeadsToExcel = (params) => api.get('/admin/leads/export/excel', { params, responseType: 'blob' })
export const exportLeadsToCSV = (params) => api.get('/admin/leads/export/csv', { params, responseType: 'blob' })

// Admin Expenses
export const getExpenses = (params) => api.get('/admin/expenses', { params })
export const getExpense = (id) => api.get(`/admin/expenses/${id}`)
export const deleteExpense = (id) => api.delete(`/admin/expenses/${id}`)
export const reviewExpense = (id, data) => api.put(`/admin/expenses/${id}/review`, data)
export const getExpensesByEvent = (eventId) => api.get(`/admin/expenses/reports/event/${eventId}`)
export const getExpensesByUser = (userId) => api.get(`/admin/expenses/reports/user/${userId}`)
export const getExpensesByCategory = (category) => api.get(`/admin/expenses/reports/category/${category}`)
export const exportExpensesToExcel = (params) => api.get('/admin/expenses/export/excel', { params, responseType: 'blob' })

// Attendance
export const getAttendance = (params) => api.get('/attendance', { params })
export const getAttendanceRecord = (id) => api.get(`/attendance/${id}`)
export const checkIn = (data) => api.post('/attendance/checkin', data)
export const checkOut = (id, data) => api.put(`/attendance/${id}/checkout`, data)
export const getAttendanceSummary = (userId) => api.get(`/attendance/summary/${userId || ''}`)

// Tasks
export const getTasks = (params) => api.get('/tasks', { params })
export const getTask = (id) => api.get(`/tasks/${id}`)
export const createTask = (data) => api.post('/tasks', data)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)

export default api

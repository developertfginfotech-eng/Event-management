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

export default api

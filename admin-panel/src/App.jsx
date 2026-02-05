import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import EventForm from './pages/EventForm'
import EventDetails from './pages/EventDetails'
import Users from './pages/Users'
import UserForm from './pages/UserForm'
import BulkUserImport from './pages/BulkUserImport'
import ActivityLogs from './pages/ActivityLogs'
import Leads from './pages/Leads'
import LeadDetails from './pages/LeadDetails'
import Expenses from './pages/Expenses'
import ExpenseReports from './pages/ExpenseReports'
import Layout from './components/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="loading">Loading...</div>
    return isAuthenticated ? children : <Navigate to="/login" />
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/events" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Events />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/events/new" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <EventForm />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/events/:id" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <EventDetails />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/events/edit/:id" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <EventForm />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Users />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/users/new" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <UserForm />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/users/edit/:id" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <UserForm />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/users/bulk-import" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <BulkUserImport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/activity-logs" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <ActivityLogs />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/leads" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Leads />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/leads/:id" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <LeadDetails />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/expenses" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Expenses />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/expenses/reports" element={
          <ProtectedRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <ExpenseReports />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Nav from './components/Nav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Inventory from './pages/Inventory'
import Documents from './pages/Documents'
import AIAssistant from './pages/AIAssistant'

function AuthedApp() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/marketing/assistant" element={<AIAssistant />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <p style={{ padding:24 }}>Loading...</p>
  return (
    <BrowserRouter>
      {user ? <AuthedApp /> : <Login />}
    </BrowserRouter>
  )
}

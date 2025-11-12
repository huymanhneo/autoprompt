import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import SettingsPage from './pages/SettingsPage'
import SetupWizard from './components/SetupWizard'
import { Loader2 } from 'lucide-react'

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  console.log('[App] State:', { isSetupComplete, isLoading })

  useEffect(() => {
    console.log('[App] useEffect triggered - checking setup status')
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      console.log('[App] Fetching settings...')
      const settings = await window.electronAPI.getSettings()
      console.log('[App] Settings received:', settings)
      // Check if LLM API key is configured
      const hasApiKey = settings?.llm?.apiKey && settings.llm.apiKey.length > 0
      console.log('[App] Has API key:', hasApiKey)
      setIsSetupComplete(hasApiKey)
    } catch (error) {
      console.error('[App] Error checking setup status:', error)
      setIsSetupComplete(false)
    } finally {
      console.log('[App] Setting isLoading to false')
      setIsLoading(false)
    }
  }

  const handleSetupComplete = () => {
    console.log('[App] Setup completed, setting isSetupComplete to true')
    setIsSetupComplete(true)
  }

  if (isLoading) {
    console.log('[App] Rendering: Loading screen')
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-slate-400">Đang khởi động...</p>
        </div>
      </div>
    )
  }

  if (!isSetupComplete) {
    console.log('[App] Rendering: Setup Wizard')
    return <SetupWizard onComplete={handleSetupComplete} />
  }

  console.log('[App] Rendering: Main App')
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="project/:projectId" element={<ProjectPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

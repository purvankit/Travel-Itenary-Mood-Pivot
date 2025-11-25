import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './pages/Home'
import CreateSessionPage from './pages/CreateSession'
import DashboardPage from './pages/Dashboard'
import MoodChartsPage from './pages/MoodCharts'
import NotFoundPage from './pages/NotFound'
import { AppLayout } from './layouts/AppLayout'

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/create" element={<CreateSessionPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mood-charts" element={<MoodChartsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App

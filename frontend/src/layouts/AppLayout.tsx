import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Navbar } from '../components/layout/Navbar'
import { MoodInput } from '../components/MoodInput'
import { getStoredSession, SESSION_EVENT } from '../utils/session'

export function AppLayout() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false)

  useEffect(() => {
    const stored = getStoredSession()
    setSessionId(stored?.sessionId)
  }, [])

  useEffect(() => {
    const syncSession = () => {
      const stored = getStoredSession()
      setSessionId(stored?.sessionId)
    }
    window.addEventListener('storage', syncSession)
    window.addEventListener(SESSION_EVENT, syncSession)
    return () => {
      window.removeEventListener('storage', syncSession)
      window.removeEventListener(SESSION_EVENT, syncSession)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#050916] text-white">
      <Navbar onOpenMoodModal={() => setIsMoodModalOpen(true)} />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Outlet />
      </main>
      <MoodInput
        sessionId={sessionId}
        isOpen={isMoodModalOpen}
        onOpenChange={setIsMoodModalOpen}
      />
    </div>
  )
}


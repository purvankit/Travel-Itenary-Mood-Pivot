import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Sparkles, Menu, X, Map } from 'lucide-react'

const navLinks = [
  { label: 'Home', to: '/', icon: Compass },
  { label: 'Create / Join', to: '/create', icon: Sparkles },
  { label: 'Dashboard', to: '/dashboard', icon: Map },
]

type NavbarProps = {
  onOpenMoodModal?: () => void
}

const activeClass =
  'text-white shadow-brand-glow bg-white/10 border border-white/20'

export function Navbar({ onOpenMoodModal }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-surface/80 border-b border-white/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-3 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand shadow-brand-glow">
            <Sparkles className="h-6 w-6" strokeWidth={1.6} />
          </div>
          <div>
            <p className="font-display text-xl tracking-tight">Mood Pivot</p>
            <p className="text-xs uppercase text-white/60">
              Adaptive itineraries
            </p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className="rounded-full">
              {({ isActive }) => (
                <motion.span
                  whileHover={{ y: -2 }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/80 transition ${
                    isActive || location.pathname.startsWith(to)
                      ? activeClass
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onOpenMoodModal}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Update mood
          </motion.button>
      </div>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-white md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-white/5 bg-surface-muted/80 backdrop-blur-lg md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
              {navLinks.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl border px-4 py-3 text-white ${
                      isActive
                        ? 'border-white/30 bg-white/10'
                        : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </NavLink>
              ))}

              <button
                onClick={() => {
                  setIsOpen(false)
                  onOpenMoodModal?.()
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:border-white/30"
              >
                Update mood
              </button>

              <NavLink
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl bg-brand px-4 py-3 text-center font-semibold text-white shadow-brand-glow"
              >
                Launch dashboard
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
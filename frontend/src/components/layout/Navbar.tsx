import { motion } from 'framer-motion';
import { LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 theme-bg-secondary border-b theme-border flex items-center justify-between px-6 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Syllabus-IQ
        </h1>
        <div className="text-sm theme-text-secondary">
          Welcome back, <span className="font-medium theme-text-heading">{user?.full_name ?? user?.email}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center theme-text-secondary hover:theme-accent transition-colors"
          style={{ backgroundColor: 'var(--accent-soft)' }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-green-600" />
            )}
          </motion.div>
        </motion.button>

        <div className="w-px h-6 theme-border-subtle" style={{ borderLeftWidth: '1px', borderColor: 'var(--border-color)' }} />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-sm theme-text-secondary hover:text-green-500 transition-colors"
          onClick={() => window.location.href = '/profile'}
        >
          <User size={18} />
          <span>Profile</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          onClick={logout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </motion.button>
      </div>
    </header>
  );
}

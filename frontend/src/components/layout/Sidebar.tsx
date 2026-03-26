import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Settings,
  History,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { theme } = useTheme();

  return (
    <aside className="w-64 theme-bg-secondary border-r theme-border h-full p-4 overflow-y-auto flex-shrink-0 transition-colors duration-300">
      <div className="mb-8 px-2">
        <img
          src={theme === 'dark' ? '/hiremee-logo-dark.svg' : '/hiremee-logo-light.svg'}
          alt="HireMee"
          className="h-7"
        />
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'text-green-500 ' + (theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50')
                  : (theme === 'dark' ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
              }`
            }
          >
            {({ isActive }) => (
              <motion.div
                className="flex items-center gap-3 w-full"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon size={20} className={isActive ? 'text-green-500' : ''} />
                <span>{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

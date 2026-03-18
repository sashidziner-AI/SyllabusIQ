import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export function SettingsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const inputClass = theme === 'dark'
    ? 'border-gray-700 bg-[#0a0f0a] text-gray-200 placeholder-gray-500'
    : 'border-gray-300 bg-white text-gray-700 placeholder-gray-400';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      setSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold theme-text-heading">Settings</h1>
          <p className="text-sm theme-text-muted">Manage your account and security</p>
        </div>

        {/* Account Information */}
        <GlassCard>
          <h3 className="font-semibold theme-text-heading mb-4">Account Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="theme-text-muted">Email:</span> <span className="theme-text-secondary">{user?.email}</span></p>
            <p><span className="theme-text-muted">Name:</span> <span className="theme-text-secondary">{user?.full_name || 'Not set'}</span></p>
            <p><span className="theme-text-muted">Role:</span> <span className="theme-text-secondary">{user?.role}</span></p>
          </div>
        </GlassCard>

        {/* Change Password */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Lock size={18} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold theme-text-heading">Change Password</h3>
              <p className="text-xs theme-text-muted">Update your password to keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className={`w-full px-4 py-2.5 pr-10 text-sm border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${inputClass}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text-secondary transition-colors"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength={6}
                  className={`w-full px-4 py-2.5 pr-10 text-sm border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${inputClass}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text-secondary transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  className={`w-full px-4 py-2.5 pr-10 text-sm border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${inputClass}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text-secondary transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5"
              >
                <CheckCircle size={16} />
                {success}
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </motion.button>
          </form>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}

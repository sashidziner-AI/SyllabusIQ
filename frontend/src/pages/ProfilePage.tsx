import { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GradientButton } from '../components/ui/GradientButton';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

export function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authService.updateProfile({ full_name: fullName });
      setMessage('Profile updated!');
    } catch {
      setMessage('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold theme-text-heading">Profile</h1>
        <GlassCard className="space-y-4">
          <AnimatedInput label="Email" value={user?.email || ''} disabled />
          <AnimatedInput
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {message && <p className="text-sm text-green-500">{message}</p>}
          <GradientButton onClick={handleSave} isLoading={isSaving}>
            Save Profile
          </GradientButton>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}

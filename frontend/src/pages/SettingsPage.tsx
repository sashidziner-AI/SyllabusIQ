import { PageWrapper } from '../components/layout/PageWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../hooks/useAuth';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold theme-text-heading">Settings</h1>

        <GlassCard>
          <h3 className="font-semibold theme-text-heading mb-4">Account Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="theme-text-muted">Email:</span> <span className="theme-text-secondary">{user?.email}</span></p>
            <p><span className="theme-text-muted">Name:</span> <span className="theme-text-secondary">{user?.full_name || 'Not set'}</span></p>
            <p><span className="theme-text-muted">Role:</span> <span className="theme-text-secondary">{user?.role}</span></p>
          </div>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}

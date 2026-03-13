import { PageWrapper } from '../components/layout/PageWrapper';
import { MeshBackground } from '../components/layout/MeshBackground';
import { GlassCard } from '../components/ui/GlassCard';

export function ForgotPasswordPage() {
  return (
    <PageWrapper>
      <MeshBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 theme-text-heading">Reset Password</h2>
          <p className="text-center theme-text-secondary">Forgot password form coming in Phase 2</p>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}

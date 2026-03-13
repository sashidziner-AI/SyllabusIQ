import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { MeshBackground } from '../components/layout/MeshBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <MeshBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md">
          <div className="flex justify-center mb-5">
            <img
              src={theme === 'dark' ? '/hiremee-logo-dark.svg' : '/hiremee-logo-light.svg'}
              alt="HireMee"
              className="h-10"
            />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2 theme-text-heading">Sign in to Syllabus-IQ</h2>
          <p className="text-center theme-text-secondary mb-6">Generate MCQs from your syllabus</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatedInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <AnimatedInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <GradientButton
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Sign In
            </GradientButton>
          </form>


        </GlassCard>
      </div>
    </PageWrapper>
  );
}

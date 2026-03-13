import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { MeshBackground } from '../components/layout/MeshBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    try {
      await register(email, password, fullName);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 409) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <MeshBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-2 theme-text-heading">Create Account</h2>
          <p className="text-center theme-text-secondary mb-6">Start generating MCQs today</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatedInput
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
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
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <AnimatedInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
              required
            />
            <GradientButton type="submit" isLoading={isLoading} className="w-full">
              Create Account
            </GradientButton>
          </form>

          <p className="text-center text-sm theme-text-secondary mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-500 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}

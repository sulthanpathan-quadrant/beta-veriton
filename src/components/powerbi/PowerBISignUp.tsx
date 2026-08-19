import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PowerBISignUpProps {
  onBack: () => void;
  onCreateAccount: () => void;
  onSignIn: () => void;
}

export function PowerBISignUp({ onBack, onCreateAccount, onSignIn }: PowerBISignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && password.trim()) {
      onCreateAccount();
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(0,0%,97%)] flex flex-col">
      <div className="p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[hsl(0,0%,30%)] hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white border border-[hsl(0,0%,90%)] rounded-2xl p-10 shadow-sm space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[hsl(270,80%,60%)] to-[hsl(210,100%,60%)] bg-clip-text text-transparent">
                Get Started
              </h2>
              <p className="text-[hsl(0,0%,45%)] text-sm">Create your account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[hsl(0,0%,30%)]">
                  Name <span className="text-[hsl(0,80%,55%)]">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-lg border-[hsl(0,0%,80%)] bg-white text-[hsl(0,0%,15%)] placeholder:text-[hsl(0,0%,60%)] focus:border-[hsl(195,90%,45%)]"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[hsl(0,0%,30%)]">
                  Email <span className="text-[hsl(0,80%,55%)]">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-lg border-[hsl(0,0%,80%)] bg-white text-[hsl(0,0%,15%)] placeholder:text-[hsl(0,0%,60%)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[hsl(0,0%,30%)]">
                  Password <span className="text-[hsl(0,80%,55%)]">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-lg border-[hsl(0,0%,80%)] bg-white text-[hsl(0,0%,15%)] placeholder:text-[hsl(0,0%,60%)]"
                />
                <p className="text-xs text-[hsl(0,0%,55%)]">Must be at least 6 characters long</p>
              </div>

              <Button
                type="submit"
                disabled={!name.trim() || !email.trim() || !password.trim()}
                className="w-full h-12 rounded-full bg-[hsl(270,60%,75%)] hover:bg-[hsl(270,60%,65%)] text-white text-base font-semibold shadow-md"
              >
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-[hsl(0,0%,45%)]">
              Already have an account?{' '}
              <span
                onClick={onSignIn}
                className="text-[hsl(270,70%,55%)] cursor-pointer hover:underline font-medium"
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

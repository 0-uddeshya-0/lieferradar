import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, LoginSchema } from '@lieferradar/shared';
import type { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type LoginForm = z.infer<typeof LoginSchema>;
type RegisterForm = z.infer<typeof RegisterSchema>;

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
  });

  const onLogin = async (data: LoginForm) => {
    await login(data);
    navigate('/dashboard');
  };

  const onRegister = async (data: RegisterForm) => {
    await register(data);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-900">LieferRadar</h1>
          <p className="text-gray-500 text-sm mt-1">
            Weniger Lieferanten hinterhertelefonieren
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <Input
              label="E-Mail"
              type="email"
              {...loginForm.register('email')}
              error={loginForm.formState.errors.email?.message}
            />
            <Input
              label="Passwort"
              type="password"
              {...loginForm.register('password')}
              error={loginForm.formState.errors.password?.message}
            />
            <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
              Anmelden
            </Button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <Input
              label="Unternehmensname"
              {...registerForm.register('orgName')}
              error={registerForm.formState.errors.orgName?.message}
            />
            <Input
              label="Ihr Name"
              {...registerForm.register('name')}
              error={registerForm.formState.errors.name?.message}
            />
            <Input
              label="E-Mail"
              type="email"
              {...registerForm.register('email')}
              error={registerForm.formState.errors.email?.message}
            />
            <Input
              label="Passwort"
              type="password"
              {...registerForm.register('password')}
              error={registerForm.formState.errors.password?.message}
            />
            <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
              Registrieren
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === 'login' ? (
            <>
              Noch kein Konto?{' '}
              <button type="button" onClick={() => setMode('register')} className="text-brand-600 hover:underline">
                Registrieren
              </button>
            </>
          ) : (
            <>
              Bereits registriert?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-brand-600 hover:underline">
                Anmelden
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, LoginSchema } from '@lieferradar/shared';
import type { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import { BrandMark } from '../components/BrandMark';

type LoginForm = z.infer<typeof LoginSchema>;
type RegisterForm = z.infer<typeof RegisterSchema>;

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { t } = useI18n();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
  });

  const onLogin = async (data: LoginForm) => {
    setServerError(null);
    try {
      await login(data);
      navigate('/dashboard');
    } catch {
      setServerError(t('login.failed'));
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setServerError(null);
    try {
      await register(data);
      navigate('/dashboard');
    } catch {
      setServerError(t('login.registerFailed'));
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    setServerError(null);
    setMode(next);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <div className="flex justify-end mb-2">
          <LanguageToggle />
        </div>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <BrandMark />
            <h1 className="text-2xl font-bold text-brand-900">LieferRadar</h1>
          </div>
          <p className="text-gray-500 text-sm mt-2">{t('login.slogan')}</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <Input
              label={t('login.email')}
              type="email"
              {...loginForm.register('email')}
              error={loginForm.formState.errors.email?.message}
            />
            <Input
              label={t('login.password')}
              type="password"
              {...loginForm.register('password')}
              error={loginForm.formState.errors.password?.message}
            />
            <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
              {t('login.submit')}
            </Button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <Input
              label={t('login.orgName')}
              {...registerForm.register('orgName')}
              error={registerForm.formState.errors.orgName?.message}
            />
            <Input
              label={t('login.yourName')}
              {...registerForm.register('name')}
              error={registerForm.formState.errors.name?.message}
            />
            <Input
              label={t('login.email')}
              type="email"
              {...registerForm.register('email')}
              error={registerForm.formState.errors.email?.message}
            />
            <Input
              label={t('login.password')}
              type="password"
              {...registerForm.register('password')}
              error={registerForm.formState.errors.password?.message}
            />
            <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
              {t('login.register.submit')}
            </Button>
          </form>
        )}

        {serverError && (
          <p className="text-sm text-risk-red text-center mt-4" role="alert">
            {serverError}
          </p>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === 'login' ? (
            <>
              {t('login.noAccount')}{' '}
              <button type="button" onClick={() => switchMode('register')} className="text-brand-600 hover:underline">
                {t('login.register.submit')}
              </button>
            </>
          ) : (
            <>
              {t('login.alreadyRegistered')}{' '}
              <button type="button" onClick={() => switchMode('login')} className="text-brand-600 hover:underline">
                {t('login.submit')}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BrandMark } from '../components/BrandMark';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const { data: invite, isLoading, error } = useQuery({
    queryKey: ['invite', token],
    queryFn: async () => {
      const { data } = await apiClient.get<{ email: string; orgName: string }>(`/invites/${token}`);
      return data;
    },
    enabled: !!token,
    retry: false,
  });

  const accept = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/invites/${token}/accept`, { name, password });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border rounded-xl p-8 max-w-md text-center">
          <p className="text-risk-red font-medium">{t('invite.invalid')}</p>
        </div>
      </div>
    );
  }

  if (accept.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border rounded-xl p-8 max-w-md text-center">
          <CheckCircle className="w-12 h-12 text-risk-green mx-auto mb-4" />
          <p className="text-gray-700">{t('invite.success')}</p>
          <Link to="/login" className="inline-block mt-4 text-brand-600 hover:underline text-sm">
            {t('invite.toLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <div className="flex justify-end mb-2">
          <LanguageToggle />
        </div>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <BrandMark />
            <h1 className="text-2xl font-bold text-brand-900">LieferRadar</h1>
          </div>
          <p className="text-gray-600 text-sm mt-3">
            {t('invite.joinOrg', { org: invite.orgName })}
          </p>
          <p className="text-gray-400 text-xs mt-1">{invite.email}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            accept.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label={t('invite.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label={t('invite.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <Button type="submit" className="w-full" disabled={accept.isPending}>
            {t('invite.accept')}
          </Button>
          {accept.isError && (
            <p className="text-sm text-risk-red text-center" role="alert">
              {t('invite.invalid')}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

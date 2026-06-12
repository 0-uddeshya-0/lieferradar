import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useTeam, useInviteMember, useRevokeInvite } from '../api/team';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useI18n } from '../i18n';
import { isDemoMode } from '../demo/config';

export function TeamPage() {
  const { data, isLoading } = useTeam();
  const invite = useInviteMember();
  const revoke = useRevokeInvite();
  const { t, formatDate } = useI18n();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await invite.mutateAsync(email.trim());
    setEmail('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  if (isLoading) return <p className="text-gray-500">{t('common.loading')}</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">{t('team.title')}</h1>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-1">{t('team.invite')}</h2>
        {isDemoMode && <p className="text-xs text-gray-500 mb-3">{t('team.demoNote')}</p>}
        <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3 mt-2">
          <div className="flex-1 min-w-[220px]">
            <Input
              label={t('team.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={invite.isPending}>
            <UserPlus className="w-4 h-4 mr-2" />
            {t('team.send')}
          </Button>
        </form>
        {sent && <p className="text-sm text-risk-green mt-2">{t('team.inviteSent')}</p>}
        {invite.isError && (
          <p className="text-sm text-risk-red mt-2" role="alert">
            {(invite.error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Fehler'}
          </p>
        )}
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <h2 className="font-semibold px-6 pt-5 pb-3">{t('team.members')}</h2>
        {data?.members.map((member) => (
          <div key={member.id} className="px-6 py-3 border-t flex items-center justify-between">
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
            <p className="text-xs text-gray-400">
              {t('team.joined')} {formatDate(member.createdAt)}
            </p>
          </div>
        ))}
      </div>

      {data && data.pendingInvites.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <h2 className="font-semibold px-6 pt-5 pb-3">{t('team.pending')}</h2>
          {data.pendingInvites.map((inv) => (
            <div key={inv.id} className="px-6 py-3 border-t flex items-center justify-between">
              <p className="text-sm">{inv.email}</p>
              <button
                type="button"
                onClick={() => revoke.mutate(inv.id)}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-risk-red"
              >
                <X className="w-3.5 h-3.5" />
                {t('team.revoke')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import { BrandMark } from '../components/BrandMark';
import { isDemoMode } from '../demo/config';
import { DEMO_SUPPLIER_STATUS } from '../demo/mockData';
import type { OrderStatus } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
});

type SupplierOrder = {
  orderNumber: string;
  partDescription: string;
  quantity?: number;
  unit?: string;
  dueDate: string;
  confirmedDate?: string | null;
  currentStatus: OrderStatus;
  supplierName: string;
  orgName: string;
};

type SupplierStatus = 'RECEIVED' | 'IN_PROGRESS' | 'SHIPPED' | 'DELAYED';

const STATUS_OPTIONS: SupplierStatus[] = ['RECEIVED', 'IN_PROGRESS', 'SHIPPED', 'DELAYED'];

export function SupplierStatusPage() {
  const { token } = useParams<{ token: string }>();
  const [selectedStatus, setSelectedStatus] = useState<SupplierStatus | null>(null);
  const [note, setNote] = useState('');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { t, statusLabel, formatDate } = useI18n();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['supplier-status', token],
    queryFn: async () => {
      if (isDemoMode && token === 'demo') return DEMO_SUPPLIER_STATUS;
      const { data } = await api.get<SupplierOrder>(`/s/${token}`);
      return data;
    },
    enabled: !!token,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (isDemoMode && token === 'demo') return;
      await api.post(`/s/${token}`, {
        status: selectedStatus,
        note: selectedStatus === 'DELAYED' ? note : undefined,
        confirmedDate: confirmedDate ? new Date(confirmedDate).toISOString() : undefined,
      });
    },
    onSuccess: () => setSubmitted(true),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !order) {
    const message =
      axios.isAxiosError(error) && error.response?.data?.error
        ? String(error.response.data.error)
        : t('status.invalid');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border rounded-xl p-8 max-w-md text-center">
          <p className="text-risk-red font-medium">{message}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border rounded-xl p-8 max-w-md text-center">
          <CheckCircle className="w-12 h-12 text-risk-green mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">{t('status.thanks')}</h1>
          <p className="text-gray-600">{t('status.received')}</p>
        </div>
      </div>
    );
  }

  const canSubmit =
    selectedStatus !== null &&
    (selectedStatus !== 'DELAYED' || note.trim().length > 0) &&
    !submitMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-2">
            <BrandMark />
            <span className="font-bold text-brand-900">LieferRadar</span>
          </span>
          <LanguageToggle />
        </div>

        <div className="bg-white border rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-500">{t('status.orderFrom')} {order.orgName}</p>
          <h1 className="text-xl font-bold mt-1 font-mono">{order.orderNumber}</h1>
          <p className="text-gray-700 mt-2">{order.partDescription}</p>
          <dl className="mt-4 space-y-2 text-sm">
            {order.quantity && (
              <div className="flex justify-between">
                <dt className="text-gray-500">{t('status.quantity')}</dt>
                <dd>{order.quantity} {order.unit}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">{t('status.dueDate')}</dt>
              <dd className="font-medium">{formatDate(order.dueDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{t('status.current')}</dt>
              <dd>{statusLabel(order.currentStatus)}</dd>
            </div>
          </dl>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {t('status.hello', { name: order.supplierName })}
        </p>

        <div className="space-y-3">
          {STATUS_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedStatus(value)}
              className={`w-full py-4 px-4 rounded-xl border-2 text-left font-medium transition-colors ${
                selectedStatus === value
                  ? 'border-brand-600 bg-brand-50 text-brand-900'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {statusLabel(value)}
            </button>
          ))}
        </div>

        {selectedStatus !== null && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmed-date">
              {t('status.confirmedDate')}
            </label>
            <input
              id="confirmed-date"
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              value={confirmedDate}
              onChange={(e) => setConfirmedDate(e.target.value)}
            />
          </div>
        )}

        {selectedStatus === 'DELAYED' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('status.delayReason')}
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('status.delayPlaceholder')}
            />
          </div>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => submitMutation.mutate()}
          className="w-full mt-6 py-3 rounded-xl bg-brand-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors"
        >
          {submitMutation.isPending ? t('status.sending') : t('status.send')}
        </button>

        {submitMutation.isError && (
          <p className="text-risk-red text-sm mt-3 text-center">
            {t('status.error')}
          </p>
        )}
      </div>
    </div>
  );
}

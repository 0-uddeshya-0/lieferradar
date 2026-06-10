import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOrder } from '../api/orders';
import { useSuppliers } from '../api/suppliers';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useI18n } from '../i18n';

// Client-side variant of CreateOrderSchema: the datetime-local input produces
// "YYYY-MM-DDTHH:mm" (not full ISO) and demo supplier ids are not CUIDs, so the
// strict server schema would reject valid form input before submission.
const FormSchema = z.object({
  supplierId: z.string().min(1),
  orderNumber: z.string().min(1).max(100),
  partDescription: z.string().min(1).max(500),
  quantity: z.preprocess(
    (v) => (typeof v === 'number' && Number.isNaN(v) ? undefined : v),
    z.number().int().positive().optional()
  ),
  unit: z.string().max(20).optional(),
  dueDate: z.string().min(1),
});

type FormData = z.infer<typeof FormSchema>;

export function NewOrderPage() {
  const navigate = useNavigate();
  const { data: suppliers } = useSuppliers();
  const createOrder = useCreateOrder();
  const { t } = useI18n();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: FormData) => {
    const dueDate = new Date(data.dueDate).toISOString();
    await createOrder.mutateAsync({ ...data, dueDate });
    navigate('/dashboard');
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-6">{t('newOrder.title')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('newOrder.supplier')}</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            {...register('supplierId')}
          >
            <option value="">{t('newOrder.choose')}</option>
            {suppliers?.map((s: { id: string; name: string }) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.supplierId && <p className="text-sm text-risk-red mt-1">{errors.supplierId.message}</p>}
        </div>

        <Input label={t('newOrder.number')} {...register('orderNumber')} error={errors.orderNumber?.message} />
        <Input label={t('newOrder.description')} {...register('partDescription')} error={errors.partDescription?.message} />
        <Input label={t('newOrder.quantity')} type="number" {...register('quantity', { valueAsNumber: true })} />
        <Input label={t('newOrder.unit')} placeholder={t('newOrder.unitPlaceholder')} {...register('unit')} />
        <Input label={t('newOrder.dueDate')} type="datetime-local" {...register('dueDate')} error={errors.dueDate?.message} />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>{t('newOrder.submit')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
            {t('newOrder.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOrderSchema } from '@lieferradar/shared';
import type { z } from 'zod';
import { useCreateOrder } from '../api/orders';
import { useSuppliers } from '../api/suppliers';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type FormData = z.infer<typeof CreateOrderSchema>;

export function NewOrderPage() {
  const navigate = useNavigate();
  const { data: suppliers } = useSuppliers();
  const createOrder = useCreateOrder();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(CreateOrderSchema),
  });

  const onSubmit = async (data: FormData) => {
    const dueDate = new Date(data.dueDate).toISOString();
    await createOrder.mutateAsync({ ...data, dueDate });
    navigate('/dashboard');
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-6">Neue Bestellung</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lieferant</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            {...register('supplierId')}
          >
            <option value="">Bitte wählen</option>
            {suppliers?.map((s: { id: string; name: string }) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.supplierId && <p className="text-sm text-risk-red mt-1">{errors.supplierId.message}</p>}
        </div>

        <Input label="Bestellnummer" {...register('orderNumber')} error={errors.orderNumber?.message} />
        <Input label="Beschreibung" {...register('partDescription')} error={errors.partDescription?.message} />
        <Input label="Menge" type="number" {...register('quantity', { valueAsNumber: true })} />
        <Input label="Einheit" placeholder="Stück, kg, m" {...register('unit')} />
        <Input label="Fälligkeitsdatum" type="datetime-local" {...register('dueDate')} error={errors.dueDate?.message} />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>Bestellung anlegen</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  );
}

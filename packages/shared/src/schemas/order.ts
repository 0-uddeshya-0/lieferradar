import { z } from 'zod';

export const OrderStatusEnum = z.enum([
  'PENDING', 'RECEIVED', 'IN_PROGRESS', 'SHIPPED', 'DELAYED', 'DELIVERED', 'CANCELLED'
]);

export const CreateOrderSchema = z.object({
  supplierId: z.string().cuid(),
  orderNumber: z.string().min(1).max(100),
  partDescription: z.string().min(1).max(500),
  quantity: z.number().int().positive().optional(),
  unit: z.string().max(20).optional(),
  valueCents: z.number().int().nonnegative().optional(),
  dueDate: z.string().datetime(),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
  note: z.string().max(1000).optional(),
});

export const SupplierStatusUpdateSchema = z.object({
  status: z.enum(['RECEIVED', 'IN_PROGRESS', 'SHIPPED', 'DELAYED']),
  note: z.string().max(1000).optional(),
  confirmedDate: z.string().datetime().optional(),
}).refine(
  (data) => data.status !== 'DELAYED' || (data.note && data.note.trim().length > 0),
  { message: 'Note is required when status is DELAYED', path: ['note'] }
);

export const BulkImportOrderSchema = z.array(CreateOrderSchema).min(1).max(500);

export const CsvImportRowSchema = z.object({
  orderNumber: z.string().min(1).max(100),
  supplierEmail: z.string().email(),
  partDescription: z.string().min(1).max(500),
  dueDate: z.string().min(1),
  quantity: z.coerce.number().int().positive().optional(),
  unit: z.string().max(20).optional(),
  value: z.coerce.number().nonnegative().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type OrderStatus = z.infer<typeof OrderStatusEnum>;
export type SupplierStatusUpdateInput = z.infer<typeof SupplierStatusUpdateSchema>;

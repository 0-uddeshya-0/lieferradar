import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OrderTable } from './OrderTable';

const orders = [
  {
    id: '1',
    orderNumber: 'PO-001',
    partDescription: 'Testteil',
    dueDate: '2026-07-15T00:00:00.000Z',
    status: 'PENDING' as const,
    delayRisk: 'gelb' as const,
    updatedAt: '2026-06-01T00:00:00.000Z',
    supplier: { id: 's1', name: 'Müller GmbH' },
  },
];

function renderTable(onRemind = vi.fn()) {
  return render(
    <BrowserRouter>
      <OrderTable orders={orders} onRemind={onRemind} />
    </BrowserRouter>
  );
}

describe('OrderTable', () => {
  it('renders order data', () => {
    renderTable();
    expect(screen.getByText('PO-001')).toBeInTheDocument();
    expect(screen.getByText('Müller GmbH')).toBeInTheDocument();
    expect(screen.getByText('Testteil')).toBeInTheDocument();
  });

  it('fires remind mutation on button click', () => {
    const onRemind = vi.fn();
    renderTable(onRemind);
    fireEvent.click(screen.getByText('Status anfragen'));
    expect(onRemind).toHaveBeenCalledWith('1');
  });
});

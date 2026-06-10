import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SupplierStatusPage } from './SupplierStatusPage';

const { mockGet, mockPost, mockIsAxiosError } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockIsAxiosError: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: mockGet,
      post: mockPost,
    }),
    isAxiosError: (...args: unknown[]) => mockIsAxiosError(...args),
  },
  isAxiosError: (...args: unknown[]) => mockIsAxiosError(...args),
}));

const mockOrder = {
  orderNumber: 'PO-001',
  partDescription: 'Hydraulikzylinder',
  quantity: 10,
  unit: 'Stück',
  dueDate: '2026-07-15T00:00:00.000Z',
  currentStatus: 'PENDING',
  supplierName: 'Müller GmbH',
  orgName: 'Muster GmbH',
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/s/test-token']}>
        <Routes>
          <Route path="/s/:token" element={<SupplierStatusPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('SupplierStatusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockOrder });
    mockPost.mockResolvedValue({ data: { success: true } });
    mockIsAxiosError.mockReturnValue(false);
  });

  it('renders status buttons', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Bestellung erhalten')).toBeInTheDocument();
    });
    expect(screen.getByText('In Bearbeitung')).toBeInTheDocument();
    expect(screen.getByText('Versendet')).toBeInTheDocument();
    expect(screen.getByText('Verzögert')).toBeInTheDocument();
  });

  it('shows error for invalid token', async () => {
    mockGet.mockRejectedValue({ response: { data: { error: 'Link ungültig oder abgelaufen' } } });
    mockIsAxiosError.mockReturnValue(true);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Link ungültig oder abgelaufen')).toBeInTheDocument();
    });
  });

  it('submits status update', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getByText('Bestellung erhalten'));
    await user.click(screen.getByText('Versendet'));
    await user.click(screen.getByText('Status senden'));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/s/test-token', { status: 'SHIPPED', note: undefined });
    });
  });
});

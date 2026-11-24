/**
 * Testes unitários — Admin App (Zustand Stores, Routes & ServerWarmupGate)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { ServerWarmupGate } from 'ui-shared/components/ServerWarmupGate';

import { APP_ROUTES, ADMIN_ROUTES } from '../utils/Path';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/useAuthStore';
import { useEmployeeStore } from '../stores/useEmployeeStore';
import { useCustomerStore } from '../stores/useCustomerStore';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../services/authService', () => ({
  loginService: vi.fn(),
  signUpService: vi.fn(),
  logoutService: vi.fn(),
  logoutApiService: vi.fn(),
  refreshTokenService: vi.fn(),
  getStoredUser: vi.fn().mockReturnValue(null),
  getStoredToken: vi.fn().mockReturnValue(null),
  getStoredRefreshToken: vi.fn().mockReturnValue(null),
}));

vi.mock('../services/employeeService', () => ({
  fetchEmployees: vi.fn().mockResolvedValue([]),
  deleteEmployee: vi.fn().mockResolvedValue(undefined),
  toggleEmployeeStatus: vi.fn(),
  updateEmployee: vi.fn(),
}));

vi.mock('../services/customerService', () => ({
  fetchCustomers: vi.fn().mockResolvedValue([]),
  deleteCustomer: vi.fn().mockResolvedValue(undefined),
  toggleCustomerStatus: vi.fn(),
  updateCustomer: vi.fn(),
}));

import * as authServiceModule from '../services/authService';
import * as employeeServiceModule from '../services/employeeService';
import * as customerServiceModule from '../services/customerService';

const mockLogin = authServiceModule.loginService as ReturnType<typeof vi.fn>;
const mockLogout = authServiceModule.logoutService as ReturnType<typeof vi.fn>;
const mockToggleEmployee = employeeServiceModule.toggleEmployeeStatus as ReturnType<typeof vi.fn>;
const mockToggleCustomer = customerServiceModule.toggleCustomerStatus as ReturnType<typeof vi.fn>;

// ── Fixtures ───────────────────────────────────────────────────────────────

const fakeWorker = {
  publicId: 'w-001',
  role: 'barista' as const,
  salary: 2000,
  isAdmin: false,
  isActive: true,
  email: 'worker@admin.com',
  fullName: 'Worker Test',
  phone: null,
  avatarUrl: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const fakeCustomer = {
  publicId: 'c-001',
  email: 'customer@test.com',
  fullName: 'Customer Test',
  phone: null,
  avatarUrl: null,
  isActive: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

function AuthConsumer({ onRender }: { onRender: (ctx: ReturnType<typeof useAuth>) => void }) {
  const ctx = useAuth();
  onRender(ctx);
  return <div data-testid="consumer">{ctx.isAuthenticated ? 'autenticado' : 'não autenticado'}</div>;
}

// ── Testes ─────────────────────────────────────────────────────────────────

describe('APP_ROUTES (Path.ts)', () => {
  it('deve ter as rotas principais do admin definidas', () => {
    expect(APP_ROUTES.DASHBOARD).toBe('/dashboard');
    expect(APP_ROUTES.MENU).toBe('/menu');
    expect(APP_ROUTES.LIVE_ORDERS).toBe('/live-orders');
    expect(APP_ROUTES.INVENTORY).toBe('/inventory');
    expect(APP_ROUTES.ANALYTICS).toBe('/analytics');
    expect(APP_ROUTES.STAFF).toBe('/staff');
    expect(APP_ROUTES.LOGIN).toBe('/login');
  });

  it('ADMIN_ROUTES deve ser subconjunto de APP_ROUTES', () => {
    const allValues = Object.values(APP_ROUTES);
    for (const route of ADMIN_ROUTES) {
      expect(allValues).toContain(route);
    }
  });
});

describe('useAuth + useAuthStore (Zustand)', () => {
  let capturedState: ReturnType<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });
    useEmployeeStore.getState().reset();
    useCustomerStore.getState().reset();
  });

  it('funciona diretamente sem Provider e inicia não autenticado sem token', () => {
    render(<AuthConsumer onRender={(ctx) => { capturedState = ctx; }} />);
    expect(screen.getByTestId('consumer').textContent).toBe('não autenticado');
    expect(capturedState.isAuthenticated).toBe(false);
  });

  it('clearError deve limpar o estado de error', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Login failed'));

    render(<AuthConsumer onRender={(ctx) => { capturedState = ctx; }} />);

    await act(async () => {
      await capturedState.login('x@x.com', 'wrong');
    });

    expect(useAuthStore.getState().error).toBe('Login failed');

    act(() => {
      useAuthStore.getState().clearError();
    });

    expect(useAuthStore.getState().error).toBeNull();
  });

  it('login com sucesso deve atualizar user e isAuthenticated', async () => {
    mockLogin.mockResolvedValueOnce({
      user: fakeWorker,
      token: 'access_token',
      refreshToken: 'refresh_token',
    });

    render(<AuthConsumer onRender={(ctx) => { capturedState = ctx; }} />);

    await act(async () => {
      await capturedState.login('worker@admin.com', 'Senha123');
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('worker@admin.com');
    expect(screen.getByTestId('consumer').textContent).toBe('autenticado');
  });

  it('login com falha deve setar error e retornar null', async () => {
    mockLogin.mockRejectedValueOnce(new Error('INVALID_CREDENTIALS'));

    render(<AuthConsumer onRender={(ctx) => { capturedState = ctx; }} />);

    let result: Awaited<ReturnType<typeof capturedState.login>> = null;
    await act(async () => {
      result = await capturedState.login('x@x.com', 'wrong');
    });

    expect(result).toBeNull();
    expect(useAuthStore.getState().error).toBe('INVALID_CREDENTIALS');
  });

  it('logout deve limpar user e token', async () => {
    mockLogin.mockResolvedValueOnce({
      user: fakeWorker,
      token: 'access_token',
      refreshToken: 'refresh_token',
    });
    mockLogout.mockImplementation(() => {});

    render(<AuthConsumer onRender={(ctx) => { capturedState = ctx; }} />);

    await act(async () => {
      await capturedState.login('worker@admin.com', 'Senha123');
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('stores de funcionário e cliente alternam isActive ao bloquear/desbloquear', async () => {
    useEmployeeStore.setState({ employees: [fakeWorker], isLoading: false });
    useCustomerStore.setState({ customers: [fakeCustomer], isLoading: false });

    mockToggleEmployee.mockResolvedValueOnce({ ...fakeWorker, isActive: false });
    mockToggleCustomer.mockResolvedValueOnce({ ...fakeCustomer, isActive: false });

    await useEmployeeStore.getState().toggleEmployeeStatus(fakeWorker.publicId);
    await useCustomerStore.getState().toggleCustomerStatus(fakeCustomer.publicId);

    expect(useEmployeeStore.getState().employees[0]?.isActive).toBe(false);
    expect(useCustomerStore.getState().customers[0]?.isActive).toBe(false);
  });
});

describe('ServerWarmupGate (/health check)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exibe tela de warmup enquanto /health aguarda e libera app quando retorna 200', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'ok' }), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    render(
      <ServerWarmupGate healthUrl="http://localhost:3001/v1/api/health" pollIntervalMs={60_000}>
        <div data-testid="app-ready">Sistema Carregado</div>
      </ServerWarmupGate>
    );

    await waitFor(() => {
      expect(screen.getByText(/Acordando o servidor na nuvem/i)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('app-ready')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente agora/i }));

    await waitFor(() => {
      expect(screen.getByTestId('app-ready')).toBeInTheDocument();
    });
  });
});

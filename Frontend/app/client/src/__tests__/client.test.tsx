/**
 * Testes unitários — Client App (Zustand Stores, Routes & ServerWarmupGate)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ServerWarmupGate } from 'ui-shared/components/ServerWarmupGate';

import { APP_ROUTES } from '../utils/Path';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/useAuthStore';
import { useCartStore } from '../stores/useCartStore';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../services/authService', () => ({
  loginService: vi.fn(),
  registerService: vi.fn(),
  logoutService: vi.fn(),
  logoutApiService: vi.fn(),
  getStoredUser: vi.fn().mockReturnValue(null),
  getStoredToken: vi.fn().mockReturnValue(null),
  getStoredRefreshToken: vi.fn().mockReturnValue(null),
}));

vi.mock('../services/cartService', () => ({
  fetchCart: vi.fn(),
  addCartItem: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  clearCart: vi.fn(),
}));

vi.mock('shared-utils/MockBD.js', () => ({
  MOCK_NOTIFICATIONS: [],
}));

import * as authServiceModule from '../services/authService';
import * as cartServiceModule from '../services/cartService';

const mockLogin = authServiceModule.loginService as ReturnType<typeof vi.fn>;
const mockLogout = authServiceModule.logoutService as ReturnType<typeof vi.fn>;
const mockAddCartItem = cartServiceModule.addCartItem as ReturnType<typeof vi.fn>;

// ── Fixtures ───────────────────────────────────────────────────────────────

const fakeUser = {
  publicId: 'pub-1',
  fullName: 'Test User',
  email: 'user@test.com',
  phone: null,
  avatarUrl: null,
  isActive: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const fakeProduct = {
  id: 10,
  publicId: 'prod-10',
  name: 'Amber Espresso',
  description: 'Espresso intenso',
  category: 'cafe' as const,
  price: 12.5,
  imgUrl: null,
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
  it('deve ter todas as rotas definidas', () => {
    expect(APP_ROUTES.HOME).toBe('/home');
    expect(APP_ROUTES.MENU).toBe('/menu');
    expect(APP_ROUTES.CART).toBe('/cart');
    expect(APP_ROUTES.ACCOUNT).toBe('/account');
    expect(APP_ROUTES.LOGIN).toBe('/login');
    expect(APP_ROUTES.SIGN_UP).toBe('/signup');
  });

  it('deve ter exatamente 6 rotas', () => {
    expect(Object.keys(APP_ROUTES)).toHaveLength(6);
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
    useCartStore.getState().reset();
  });

  it('funciona sem Provider e isAuthenticated é false sem token', () => {
    render(<AuthConsumer onRender={(ctx) => { capturedState = ctx; }} />);
    expect(screen.getByTestId('consumer').textContent).toBe('não autenticado');
    expect(capturedState.isAuthenticated).toBe(false);
  });

  it('clearError deve limpar o estado de error', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Falha no login'));

    render(<AuthConsumer onRender={(ctx) => { capturedState = ctx; }} />);

    await act(async () => {
      await capturedState.login('a@a.com', 'wrong');
    });

    expect(useAuthStore.getState().error).toBe('Falha no login');

    act(() => {
      useAuthStore.getState().clearError();
    });

    expect(useAuthStore.getState().error).toBeNull();
  });

  it('login com sucesso deve atualizar user e isAuthenticated', async () => {
    mockLogin.mockResolvedValueOnce({
      user: fakeUser,
      token: 'access_token',
      refreshToken: 'refresh_token',
    });

    render(<AuthConsumer onRender={(ctx) => { capturedState = ctx; }} />);

    await act(async () => {
      await capturedState.login('user@test.com', 'Senha123');
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('user@test.com');
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
      user: fakeUser,
      token: 'access_token',
      refreshToken: 'refresh_token',
    });
    mockLogout.mockImplementation(() => {});

    render(<AuthConsumer onRender={(ctx) => { capturedState = ctx; }} />);

    await act(async () => {
      await capturedState.login('user@test.com', 'Senha123');
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('useCartStore deve rastrear pendingProductIds durante addItem', async () => {
    let resolveAdd!: (value: unknown) => void;
    mockAddCartItem.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveAdd = resolve;
        })
    );

    const pendingPromise = useCartStore.getState().addItem(fakeProduct, 1);

    expect(useCartStore.getState().pendingProductIds[fakeProduct.id]).toBe(true);

    resolveAdd({
      id: 1,
      publicId: 'cart-1',
      items: [
        {
          id: 1,
          productId: fakeProduct.id,
          name: fakeProduct.name,
          price: fakeProduct.price,
          quantity: 1,
          imgUrl: null,
          subtotal: fakeProduct.price,
        },
      ],
      itemCount: 1,
      subtotal: fakeProduct.price,
    });

    await pendingPromise;

    expect(useCartStore.getState().pendingProductIds[fakeProduct.id]).toBeUndefined();
    expect(useCartStore.getState().count).toBe(1);
  });
});

describe('ServerWarmupGate (/health check)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exibe tela inicial e libera aplicação quando /health retorna 200', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
    );

    vi.stubGlobal('fetch', fetchMock);

    render(
      <ServerWarmupGate healthUrl="http://localhost:3001/v1/api/health">
        <div data-testid="client-ready">Cardápio Liberado</div>
      </ServerWarmupGate>
    );

    expect(screen.getByText(/Verificando conexão com o servidor/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('client-ready')).toBeInTheDocument();
    });
  });
});

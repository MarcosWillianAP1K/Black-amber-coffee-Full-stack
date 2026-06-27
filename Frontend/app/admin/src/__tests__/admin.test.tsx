/**
 * Testes unitários — Admin App (4.3 Testes)
 *
 *  1. APP_ROUTES — contém todas as rotas do admin
 *  2. ADMIN_ROUTES — é subconjunto de APP_ROUTES
 *  3. useAuth — lança erro fora do AuthProvider
 *  4. AuthProvider — isAuthenticated é false sem token
 *  5. AuthProvider — clearError limpa o estado de error
 *  6. AuthProvider — login com sucesso atualiza user e token
 *  7. AuthProvider — login com falha seta error e retorna null
 *  8. AuthProvider — logout limpa user e token
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';

import { APP_ROUTES, ADMIN_ROUTES } from '../utils/Path';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../context/AuthContext';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../services/authService.ts', () => ({
  loginService: vi.fn(),
  signUpService: vi.fn(),
  logoutService: vi.fn(),
  logoutApiService: vi.fn(),
  refreshTokenService: vi.fn(),
  getStoredUser: vi.fn().mockReturnValue(null),
  getStoredToken: vi.fn().mockReturnValue(null),
  getStoredRefreshToken: vi.fn().mockReturnValue(null),
}));

vi.mock('shared-utils/MockBD.js', () => ({
  MOCK_WORKERS: [],
  MOCK_NOTIFICATIONS: [],
}));

import * as authServiceModule from '../services/authService.ts';

const mockLogin = authServiceModule.loginService as ReturnType<typeof vi.fn>;
const mockLogout = authServiceModule.logoutService as ReturnType<typeof vi.fn>;

// ── Fixture ────────────────────────────────────────────────────────────────

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

// ── Helper ─────────────────────────────────────────────────────────────────

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

describe('useAuth hook', () => {
  it('deve lançar erro quando usado fora do AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthConsumer onRender={() => {}} />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    spy.mockRestore();
  });
});

describe('AuthProvider (admin)', () => {
  let capturedCtx: ReturnType<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderWithProvider() {
    render(
      <AuthProvider>
        <AuthConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </AuthProvider>
    );
  }

  it('isAuthenticated é false sem token armazenado', () => {
    renderWithProvider();
    expect(screen.getByTestId('consumer').textContent).toBe('não autenticado');
    expect(capturedCtx!.isAuthenticated).toBe(false);
  });

  it('clearError deve limpar o estado de error', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Login failed'));

    renderWithProvider();

    await act(async () => {
      await capturedCtx!.login('x@x.com', 'wrong');
    });

    expect(capturedCtx!.error).toBe('Login failed');

    act(() => {
      capturedCtx!.clearError();
    });

    expect(capturedCtx!.error).toBeNull();
  });

  it('login com sucesso deve atualizar user e isAuthenticated', async () => {
    mockLogin.mockResolvedValueOnce({
      user: fakeWorker,
      token: 'access_token',
      refreshToken: 'refresh_token',
    });

    renderWithProvider();

    await act(async () => {
      await capturedCtx!.login('worker@admin.com', 'Senha123');
    });

    expect(capturedCtx!.isAuthenticated).toBe(true);
    expect(capturedCtx!.user?.email).toBe('worker@admin.com');
  });

  it('login com falha deve setar error e retornar null', async () => {
    mockLogin.mockRejectedValueOnce(new Error('INVALID_CREDENTIALS'));

    renderWithProvider();

    let result: Awaited<ReturnType<typeof capturedCtx.login>>;
    await act(async () => {
      result = await capturedCtx!.login('x@x.com', 'wrong');
    });

    expect(result!).toBeNull();
    expect(capturedCtx!.error).toBe('INVALID_CREDENTIALS');
  });

  it('logout deve limpar user e token', async () => {
    mockLogin.mockResolvedValueOnce({
      user: fakeWorker,
      token: 'access_token',
      refreshToken: 'refresh_token',
    });
    mockLogout.mockImplementation(() => {});

    renderWithProvider();

    await act(async () => {
      await capturedCtx!.login('worker@admin.com', 'Senha123');
    });

    expect(capturedCtx!.isAuthenticated).toBe(true);

    await act(async () => {
      await capturedCtx!.logout();
    });

    expect(capturedCtx!.isAuthenticated).toBe(false);
    expect(capturedCtx!.user).toBeNull();
  });
});

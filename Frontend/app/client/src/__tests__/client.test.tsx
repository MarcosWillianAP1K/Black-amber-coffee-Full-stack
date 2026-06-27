/**
 * Testes unitários — utilitários e hooks do cliente (4.3 Testes)
 *
 * 1. Path.ts          — APP_ROUTES contém todas as rotas esperadas
 * 2. useAuth hook     — lança erro fora do AuthProvider
 * 3. useAuth hook     — retorna contexto dentro do AuthProvider
 * 4. AuthProvider     — isAuthenticated é false sem token
 * 5. AuthProvider     — clearError limpa o estado de erro
 * 6. AuthProvider     — login com sucesso atualiza user e token
 * 7. AuthProvider     — login com falha seta error e retorna null
 * 8. AuthProvider     — logout limpa user e token
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';

import { APP_ROUTES } from '../utils/Path';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../context/AuthContext';

// ── Mock das dependências externas ─────────────────────────────────────────

vi.mock('../services/authService.ts', () => ({
  loginService: vi.fn(),
  registerService: vi.fn(),
  logoutService: vi.fn(),
  logoutApiService: vi.fn(),
  getStoredUser: vi.fn().mockReturnValue(null),
  getStoredToken: vi.fn().mockReturnValue(null),
  getStoredRefreshToken: vi.fn().mockReturnValue(null),
}));

vi.mock('shared-utils/MockBD.js', () => ({
  MOCK_NOTIFICATIONS: [],
}));

import * as authServiceModule from '../services/authService.ts';

const mockLogin = authServiceModule.loginService as ReturnType<typeof vi.fn>;
const mockLogout = authServiceModule.logoutService as ReturnType<typeof vi.fn>;

// ── Fixtures ──────────────────────────────────────────────────────────────

const fakeUser = {
  id: 1,
  publicId: 'pub-1',
  name: 'Test User',
  email: 'user@test.com',
  phone: null,
  avatarUrl: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

// ── Helper: consumidor do hook ─────────────────────────────────────────────

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

describe('useAuth hook', () => {
  it('deve lançar erro quando usado fora do AuthProvider', () => {
    // Suppress the expected console.error from React
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthConsumer onRender={() => {}} />)).toThrow(
      'useAuth must be used within AuthProvider'
    );
    spy.mockRestore();
  });
});

describe('AuthProvider', () => {
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
    mockLogin.mockRejectedValueOnce(new Error('Falha no login'));

    renderWithProvider();

    await act(async () => {
      await capturedCtx!.login('a@a.com', 'wrong');
    });

    expect(capturedCtx!.error).toBe('Falha no login');

    act(() => {
      capturedCtx!.clearError();
    });

    expect(capturedCtx!.error).toBeNull();
  });

  it('login com sucesso deve atualizar user e isAuthenticated', async () => {
    mockLogin.mockResolvedValueOnce({
      user: fakeUser,
      token: 'access_token',
      refreshToken: 'refresh_token',
    });

    renderWithProvider();

    await act(async () => {
      await capturedCtx!.login('user@test.com', 'Senha123');
    });

    expect(capturedCtx!.isAuthenticated).toBe(true);
    expect(capturedCtx!.user?.email).toBe('user@test.com');
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
      user: fakeUser,
      token: 'access_token',
      refreshToken: 'refresh_token',
    });
    mockLogout.mockImplementation(() => {});

    renderWithProvider();

    await act(async () => {
      await capturedCtx!.login('user@test.com', 'Senha123');
    });

    expect(capturedCtx!.isAuthenticated).toBe(true);

    await act(async () => {
      await capturedCtx!.logout();
    });

    expect(capturedCtx!.isAuthenticated).toBe(false);
    expect(capturedCtx!.user).toBeNull();
  });
});

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee } from "lucide-react";
import { FormBoxText } from "ui-shared/components/ui/FormBoxText";
import { ButtonPrimary } from "ui-shared/components/ui/ButtonPrimary";
import { LinkTextLogin } from "ui-shared/components/ui/LinkTextLogin";
import { APP_ROUTES } from "../utils/Path";
import { useAuth } from "../hooks/useAuth";

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading, error, clearError } = useAuth();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();
        const data = await login(email, password);
        if (data?.token) {
            navigate(APP_ROUTES.DASHBOARD);
        }
    };

    return (
        <div className="min-h-dvh w-full flex flex-col bg-(--Page-background) px-4 py-8 overflow-y-auto">
            <div className="my-auto w-full max-w-md mx-auto flex flex-col p-6 sm:p-8 gap-6 items-center rounded-xl bg-(--Widget-background) border border-(--Border)/60 shadow-2xl">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-xl bg-(--Primary)/15 border border-(--Primary)/30 flex items-center justify-center text-(--Primary)">
                        <Coffee size={24} aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl text-(--Primary) font-primary font-extrabold tracking-wide uppercase">
                            Black Amber Coffee
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-(--Text-primary-off) font-secondary">
                            Painel Operacional &amp; Gestão da Cafeteria
                        </p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                    <FormBoxText
                        title="E-mail corporativo"
                        placeHolder="Digite seu e-mail"
                        type="email"
                        value={email}
                        required
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <FormBoxText
                        title="Senha"
                        placeHolder="Digite sua senha"
                        type="password"
                        value={password}
                        required
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <div
                            role="alert"
                            className="w-full rounded-md border border-(--Danger-border) bg-(--Danger-bg) px-3.5 py-2.5 text-xs font-secondary font-medium text-(--Danger-text)"
                        >
                            {error}
                        </div>
                    )}

                    <ButtonPrimary type="submit" isLoading={loading} loadingText="Entrando...">
                        Entrar no Painel
                    </ButtonPrimary>
                </form>

                <LinkTextLogin
                    text1="Novo colaborador?"
                    text2="Solicitar acesso ao gerente"
                    path={APP_ROUTES.SIGNUP}
                />
            </div>
        </div>
    );
}

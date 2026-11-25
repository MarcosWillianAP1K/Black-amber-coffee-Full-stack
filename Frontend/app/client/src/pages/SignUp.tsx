import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee } from "lucide-react";
import { FormBoxText } from "ui-shared/components/ui/FormBoxText";
import { ButtonPrimary } from "ui-shared/components/ui/ButtonPrimary";
import { LinkTextLogin } from "ui-shared/components/ui/LinkTextLogin";
import { APP_ROUTES } from "../utils/Path";
import { useAuth } from "../hooks/useAuth";

export function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);
    const { register, loading, error, clearError } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();
        setLocalError(null);

        if (password !== confirmPassword) {
            setLocalError("As senhas informadas não conferem.");
            return;
        }

        const data = await register(name, email, password, phone || undefined);
        if (data?.token) navigate(APP_ROUTES.HOME);
    };

    const displayError = localError ?? error;

    return (
        <div className="min-h-dvh w-full flex flex-col bg-(--Page-background) px-4 py-8 overflow-y-auto">
            <div className="my-auto w-full max-w-md mx-auto flex flex-col p-6 sm:p-8 gap-6 items-center rounded-xl bg-(--Widget-background) border border-(--Border)/60 shadow-2xl">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-xl bg-(--Primary)/15 border border-(--Primary)/30 flex items-center justify-center text-(--Primary)">
                        <Coffee size={24} aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl text-(--Primary) font-primary font-extrabold tracking-wide uppercase">
                            Criar Conta
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-(--Text-primary-off) font-secondary">
                            Cadastre-se na Black Amber Coffee
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                    <FormBoxText
                        title="Nome completo"
                        placeHolder="Seu nome"
                        type="text"
                        value={name}
                        required
                        autoComplete="name"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FormBoxText
                        title="E-mail"
                        placeHolder="seu@email.com"
                        type="email"
                        value={email}
                        required
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <FormBoxText
                        title="Telefone (opcional)"
                        placeHolder="(11) 99999-9999"
                        type="tel"
                        value={phone}
                        autoComplete="tel"
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <FormBoxText
                        title="Senha"
                        placeHolder="Mín. 6 caracteres, 1 maiúscula e 1 número"
                        type="password"
                        value={password}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormBoxText
                        title="Confirmar senha"
                        placeHolder="Repita a senha"
                        type="password"
                        value={confirmPassword}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {displayError && (
                        <div
                            role="alert"
                            className="w-full rounded-md border border-(--Danger-border) bg-(--Danger-bg) px-3.5 py-2.5 text-xs font-secondary font-medium text-(--Danger-text)"
                        >
                            {displayError}
                        </div>
                    )}

                    <ButtonPrimary type="submit" isLoading={loading} loadingText="Cadastrando...">
                        Criar Conta
                    </ButtonPrimary>
                </form>

                <LinkTextLogin
                    text1="Já possui cadastro?"
                    text2="Fazer login"
                    path={APP_ROUTES.LOGIN}
                />
            </div>
        </div>
    );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
            setLocalError("As senhas não conferem");
            return;
        }

        const data = await register(name, email, password, phone || undefined);
        if (data?.token) navigate(APP_ROUTES.HOME);
    };

    const displayError = localError ?? error;

    return (
        <div className="h-screen w-full flex flex-col bg-(--Page-background) justify-center items-center px-4 overflow-y-auto py-8">
            <div className="w-full max-w-md flex flex-col p-8 gap-6 items-center rounded-md bg-(--Widget-background) border border-(--Border)/40">
                <div className="flex flex-col items-center gap-2">
                    <p className="text-(--Primary-off) text-xs font-secondary uppercase tracking-widest">Join us</p>
                    <h1 className="text-2xl text-(--Primary) font-primary font-bold">CRIAR CONTA</h1>
                </div>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                    <FormBoxText
                        title="Nome completo"
                        placeHolder="Seu nome"
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FormBoxText
                        title="E-mail"
                        placeHolder="seu@email.com"
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <FormBoxText
                        title="Telefone (opcional)"
                        placeHolder="(00) 00000-0000"
                        type="tel"
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <FormBoxText
                        title="Senha"
                        placeHolder="Mín. 6 caracteres, 1 maiúscula e 1 número"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormBoxText
                        title="Confirmar senha"
                        placeHolder="Repita a senha"
                        type="password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {displayError && (
                        <p className="text-(--Negacion) text-[12px] font-secondary font-bold">{displayError}</p>
                    )}

                    <ButtonPrimary type="submit">
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </ButtonPrimary>
                </form>

                <LinkTextLogin
                    text1="Já tem conta?"
                    text2="Fazer login"
                    path={APP_ROUTES.LOGIN}
                />
            </div>
        </div>
    );
}

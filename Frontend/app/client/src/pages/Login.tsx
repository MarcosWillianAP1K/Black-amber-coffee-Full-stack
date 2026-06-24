import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        if (data?.token) navigate(APP_ROUTES.HOME);
    };

    return (
        <div className="h-screen w-full flex flex-col bg-(--Page-background) justify-center items-center px-4">
            <div className="w-full max-w-md flex flex-col p-8 gap-6 items-center rounded-md bg-(--Widget-background) border border-(--Border)/40">
                <div className="flex flex-col items-center gap-2">
                    <p className="text-(--Primary-off) text-xs font-secondary uppercase tracking-widest">Welcome</p>
                    <h1 className="text-2xl text-(--Primary) font-primary font-bold">BLACK AMBER COFFE</h1>
                </div>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
                    <FormBoxText
                        title="E-mail"
                        placeHolder="Digite seu e-mail"
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <FormBoxText
                        title="Senha"
                        placeHolder="Digite sua senha"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <p className="text-(--Negacion) text-[12px] font-secondary font-bold">{error}</p>
                    )}

                    <ButtonPrimary type="submit">
                        {loading ? "Entrando..." : "Entrar"}
                    </ButtonPrimary>
                </form>

                <LinkTextLogin
                    text1="Não tem conta?"
                    text2="Cadastre-se"
                    path={APP_ROUTES.SIGN_UP}
                />
            </div>
        </div>
    );
}

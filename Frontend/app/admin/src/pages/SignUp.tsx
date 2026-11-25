import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { ButtonPrimary } from "ui-shared/components/ui/ButtonPrimary";
import { LinkTextLogin } from "ui-shared/components/ui/LinkTextLogin";
import { APP_ROUTES } from "../utils/Path";

export function SignUp() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate(APP_ROUTES.LOGIN, { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="min-h-dvh w-full flex flex-col bg-(--Page-background) px-4 py-8 overflow-y-auto">
            <div className="my-auto w-full max-w-md mx-auto flex flex-col p-6 sm:p-8 gap-6 items-center rounded-xl bg-(--Widget-background) border border-(--Border)/60 shadow-2xl">
                <h1 className="text-xl sm:text-2xl text-(--Primary) font-primary font-extrabold uppercase tracking-wide text-center">
                    Black Amber Coffee
                </h1>

                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-(--Primary)/15 border border-(--Primary)/30 flex items-center justify-center text-(--Primary)">
                        <Lock size={28} aria-hidden="true" />
                    </div>

                    <h2 className="text-lg text-(--Text-primary) font-primary font-bold">
                        Acesso restrito a administradores
                    </h2>

                    <p className="text-sm text-(--Text-primary-off) font-secondary leading-relaxed">
                        Novos funcionários só podem ser cadastrados por um gerente ou administrador
                        através da aba de Gestão de Equipe.
                    </p>

                    <p className="text-xs text-(--Text-primary-off)/80 font-secondary">
                        Caso seja gerente, faça login para cadastrar novos membros.
                    </p>
                </div>

                <ButtonPrimary onClick={() => navigate(APP_ROUTES.LOGIN)}>
                    Voltar para o Login
                </ButtonPrimary>

                <p className="text-xs text-(--Text-primary-off)/70 font-secondary tabular-nums">
                    Redirecionando em {countdown} segundos...
                </p>

                <LinkTextLogin
                    text1="Já tem uma conta?"
                    text2="Fazer Login"
                    path={APP_ROUTES.LOGIN}
                />
            </div>
        </div>
    );
}

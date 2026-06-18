import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <div className="h-screen w-full flex flex-col bg-(--Page-background) justify-center items-center">
            <div className="w-fit max-w-md h-fit flex flex-col p-8 gap-6 justify-center items-center rounded-md bg-(--Widget-background)">

                <h1 className="text-2xl text-(--Primary) font-primary font-bold">Black Amber Coffe</h1>

                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-(--Primary)/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-(--Primary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h2 className="text-lg text-(--Text-primary) font-primary font-semibold">
                        Acesso restrito a administradores
                    </h2>

                    <p className="text-sm text-(--Text-primary-off) font-secondary leading-relaxed">
                        Novos funcionários só podem ser cadastrados por um administrador
                        através do painel de gestão de equipe.
                    </p>

                    <p className="text-xs text-(--Text-primary-off)/60 font-secondary">
                        Se você é administrador, faça login primeiro para criar novos workers.
                    </p>
                </div>

                <ButtonPrimary onClick={() => navigate(APP_ROUTES.LOGIN)}>
                    Voltar para o Login
                </ButtonPrimary>

                <p className="text-xs text-(--Text-primary-off)/40 font-secondary">
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
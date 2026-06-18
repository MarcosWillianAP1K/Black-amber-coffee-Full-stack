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
        if (data?.token) {
            navigate(APP_ROUTES.DASHBOARD);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col bg-(--Page-background) justify-center items-center">
            <div className="w-fit h-fit flex flex-col p-4 gap-6 justify-center items-center rounded-md bg-(--Widget-background)">

                <h1 className="text-2xl text-(--Primary) font-primary font-bold">Black Amber Coffe</h1>

                <form onSubmit={handleLogin} className="w-fit h-fit flex flex-col gap-6 justify-center items-center bg-(--Widget-background)">
                    <FormBoxText title="E-mail" placeHolder="Enter your email" type="email" onChange={(e) => setEmail(e.target.value)} />

                    <FormBoxText title="Password" placeHolder="Enter your password" type="password" onChange={(e) => setPassword(e.target.value)} />

                    {error && (
                        <p className="text-red-400 text-[12px] font-secondary font-bold">{error}</p>
                    )}

                    <ButtonPrimary type="submit">
                        {loading ? "Signing in..." : "Sign In"}
                    </ButtonPrimary>

                </form>

                <LinkTextLogin text1="New employee?" text2="Contact your admin" path={APP_ROUTES.SIGNUP} />
            </div>
        </div>
    )
}
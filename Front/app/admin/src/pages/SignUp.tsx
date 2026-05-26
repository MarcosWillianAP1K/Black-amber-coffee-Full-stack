import { useState } from "react";
import { FormBoxText } from "ui-shared/components/ui/FormBoxText";
import { ButtonPrimary } from "ui-shared/components/ui/ButtonPrimary";
import { LinkTextLogin } from "ui-shared/components/ui/LinkTextLogin";
import { APP_ROUTES } from "../utils/Path";
import { useAuth } from "../hooks/useAuth";


export function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { signUp, loading, error, clearError } = useAuth();

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();

        if (password !== confirmPassword) {
            // Show inline error without hitting the service
            return;
        }

        await signUp(name, email, password);
    };

    const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    return (
        <div className="h-screen w-full flex flex-col bg-(--Page-background) justify-center items-center">
            <div className="w-fit h-fit flex flex-col p-4 gap-6 justify-center items-center rounded-md bg-(--Widget-background)">

                <h1 className="text-2xl text-(--Primary) font-primary font-bold">Black Amber Coffe</h1>

                <form onSubmit={handleSignUp} className="w-fit h-fit flex flex-col gap-6 justify-center items-center bg-(--Widget-background)">
                    <FormBoxText title="Name" placeHolder="Enter your name" type="text" onChange={(e) => setName(e.target.value)} />

                    <FormBoxText title="E-mail" placeHolder="Enter your email" type="email" onChange={(e) => setEmail(e.target.value)} />

                    <FormBoxText title="Password" placeHolder="Enter your password" type="password" onChange={(e) => setPassword(e.target.value)} />

                    <FormBoxText title="Confirm your password" placeHolder="Confirm your password" type="password" onChange={(e) => setConfirmPassword(e.target.value)} />

                    {passwordMismatch && (
                        <p className="text-red-400 text-[12px] font-secondary font-bold">Passwords do not match</p>
                    )}

                    {error && (
                        <p className="text-red-400 text-[12px] font-secondary font-bold">{error}</p>
                    )}

                    <ButtonPrimary type="submit">
                        {loading ? "Creating account..." : "Sign Up"}
                    </ButtonPrimary>

                </form>

                <LinkTextLogin text1="Already have an account?" text2="Sign In" path={APP_ROUTES.LOGIN} />
            </div>
        </div>
    )
}
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../utils/Path";

export function Login() {
	const navigate = useNavigate();

	return (
		<div className="w-full h-full flex items-center justify-center">
			<button
				type="button"
				onClick={() => navigate(APP_ROUTES.HOME)}
				className="px-6 py-3 rounded-md bg-(--Primary) text-white font-primary font-medium"
			>
				Ir para Home
			</button>
		</div>
	);
}

import { RouterProvider } from "react-router-dom";
import { router } from "./Router"; // Ajuste o caminho se tiver colocado em outra pasta
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
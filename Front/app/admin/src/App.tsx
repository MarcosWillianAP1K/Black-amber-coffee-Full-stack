import { RouterProvider } from "react-router-dom";
import { router } from "./Router"; // Ajuste o caminho se tiver colocado em outra pasta

export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
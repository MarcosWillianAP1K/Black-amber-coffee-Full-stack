import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import { MenuProvider } from "./context/MenuContext";
import { EmployeeProvider } from "./context/EmployeeContext";

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <MenuProvider>
          <EmployeeProvider>
            <RouterProvider router={router} />
          </EmployeeProvider>
        </MenuProvider>
      </OrderProvider>
    </AuthProvider>
  );
}
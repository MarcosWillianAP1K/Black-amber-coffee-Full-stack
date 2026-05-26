import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { useNavigate } from "react-router-dom";
import { SectionCustomers } from "../../components/SectionCustomers";
import { SectionEmployee } from "../../components/SectionEmployee";
import { useCustomers } from "../../hooks/useCustomers";
import { useEmployee } from "../../hooks/useEmployee";
import { APP_ROUTES } from "../../utils/Path";

export function Staff() {
    const navigate = useNavigate();
    const { customers, deleteCustomer } = useCustomers();
    const { employees, deleteEmployee, toggleEmployeeStatus } = useEmployee();
    const activeEmployees = employees.filter((employee) => employee.isActive);

    const buildProfilePath = (kind: "customer" | "employee", id: string) =>
        APP_ROUTES.PERFIL_DETAIL.replace(":kind", kind).replace(":id", id);

    return (
        <div className="w-full h-fit gap-6 flex flex-col">
            <DestakTitle title="Staff" subtitle="Manage your team and staff members" />

            <SectionEmployee
                employees={activeEmployees}
                title="Working Now"
                onDeleteEmployee={deleteEmployee}
                onBlockEmployee={toggleEmployeeStatus}
                onViewEmployee={(publicId) => navigate(buildProfilePath("employee", publicId), { state: { from: "staff" } })}
            />

            <SectionEmployee
                employees={employees}
                title="Staff"
                onDeleteEmployee={deleteEmployee}
                onBlockEmployee={toggleEmployeeStatus}
                onViewEmployee={(publicId) => navigate(buildProfilePath("employee", publicId), { state: { from: "staff" } })}
            />


            <SectionCustomers
                customers={customers}
                title="Customers"
                onDeleteCustomer={deleteCustomer}
                onBlockCustomer={(publicId) => console.log("Block customer:", publicId)}
                onViewCustomer={(publicId) => navigate(buildProfilePath("customer", publicId), { state: { from: "staff" } })}
            />
        </div>
    );
}
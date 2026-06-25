import { useNavigate } from "react-router-dom";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";

interface SettingsItem {
    label: string;
    value: string;
    action: string;
    danger?: boolean;
}

interface SettingsSection {
    title: string;
    description: string;
    items: SettingsItem[];
}

const settingsSections: SettingsSection[] = [
    {
        title: "Conta",
        description: "Detalhes do perfil e preferências de identidade.",
        items: [
            { label: "Detalhes do perfil", value: "Nome, e-mail, cargo", action: "Editar" },
            { label: "Avatar", value: "Atualizar foto de perfil", action: "Enviar" },
            { label: "Idioma", value: "Português (BR)", action: "Alterar" },
        ],
    },
    {
        title: "Segurança",
        description: "Senha e controles de acesso.",
        items: [
            { label: "Senha", value: "Atualizada há 30 dias", action: "Atualizar" },
            { label: "Sessões", value: "2 dispositivos ativos", action: "Gerenciar" },
            { label: "Dois fatores", value: "Desativado", action: "Ativar" },
        ],
    },
    {
        title: "Notificações",
        description: "Escolha como receber alertas.",
        items: [
            { label: "Alertas de pedidos", value: "Ativado", action: "Alternar" },
            { label: "Alertas de estoque", value: "Ativado", action: "Alternar" },
            { label: "Resumo semanal", value: "Desativado", action: "Alternar" },
        ],
    },
    {
        title: "Sistema",
        description: "Preferências do aplicativo e controles de dados.",
        items: [
            { label: "Tema", value: "Escuro", action: "Alternar" },
            { label: "Exportar dados", value: "Baixar relatórios", action: "Exportar" },
            { label: "Redefinir configurações", value: "Restaurar padrões", action: "Redefinir", danger: true },
        ],
    },
];

export function Settings() {
    const navigate = useNavigate();

    return (
        <div className="w-full h-fit gap-6 flex flex-col bg-(--Page-background) p-4">
            <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                    <DestakTitle title="Configurações" subtitle="Gerencie suas preferências e segurança" />
                </div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-(--Border) text-(--Text-primary-off) text-xs font-secondary font-semibold uppercase tracking-wider hover:border-(--Primary) hover:text-(--Primary) transition-all duration-200"
                    aria-label="Back"
                >
                    Voltar
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {settingsSections.map((section) => (
                    <section key={section.title} className="border border-(--Border) rounded-sm bg-(--Widget-background)">
                        <div className="px-5 py-4 border-b border-(--Border)">
                            <h2 className="text-(--Primary) text-xs font-primary font-extrabold tracking-[0.3em] uppercase">
                                {section.title}
                            </h2>
                            <p className="text-(--Text-primary-off) text-sm font-secondary mt-2">
                                {section.description}
                            </p>
                        </div>

                        <div className="flex flex-col">
                            {section.items.map((item, index) => (
                                <div
                                    key={item.label}
                                    className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4
                                        ${index < section.items.length - 1 ? "border-b border-(--Border)" : ""}
                                    `}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-(--Text-gray) text-sm font-primary font-bold">
                                            {item.label}
                                        </span>
                                        <span className="text-(--Text-primary-off) text-xs font-secondary">
                                            {item.value}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-sm text-xs font-secondary font-semibold uppercase tracking-wider border transition-all duration-200
                                            ${item.danger
                                                ? "border-(--Negacion)/50 text-(--Negacion) hover:border-(--Negacion)"
                                                : "border-(--Border) text-(--Text-primary-off) hover:border-(--Primary) hover:text-(--Primary)"
                                            }
                                        `}
                                    >
                                        {item.action}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

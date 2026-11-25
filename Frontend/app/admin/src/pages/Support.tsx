import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { useToastStore } from "shared-utils/stores/useToastStore";

const issueOptions = [
    "Pedidos",
    "Pagamentos",
    "Estoque",
    "Equipe",
    "Relatórios",
    "Login / Acesso",
    "Outro",
];

const priorityOptions = ["Baixa", "Normal", "Alta", "Urgente"];

interface SupportTicket {
    protocol: string;
    category: string;
    priority: string;
    reference: string;
    subject: string;
    description: string;
    createdAt: string;
}

export function Support() {
    const navigate = useNavigate();
    const showToast = useToastStore((s) => s.showToast);

    const [category, setCategory] = useState(issueOptions[0]);
    const [priority, setPriority] = useState(priorityOptions[1]);
    const [reference, setReference] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [tickets, setTickets] = useState<SupportTicket[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) {
            showToast({
                variant: "error",
                title: "Preencha assunto e descrição",
            });
            return;
        }

        const protocol = `#SUP-${Math.floor(100000 + Math.random() * 900000)}`;
        const ticket: SupportTicket = {
            protocol,
            category,
            priority,
            reference: reference.trim(),
            subject: subject.trim(),
            description: description.trim(),
            createdAt: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setTickets((prev) => [ticket, ...prev]);
        setReference("");
        setSubject("");
        setDescription("");
        showToast({
            variant: "success",
            title: `Chamado ${protocol} registrado`,
            description: "Nossa equipe técnica recebeu sua solicitação.",
        });
    };

    return (
        <div className="w-full flex flex-col gap-6 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <DestakTitle
                    title="Suporte Técnico"
                    subtitle="Abra um chamado interno e acompanhe as orientações rápidas"
                />
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="min-h-10 px-4 py-2 rounded-lg border border-(--Border) text-(--Text-primary-off) text-xs font-secondary font-semibold uppercase tracking-wider hover:border-(--Primary) hover:text-(--Primary) transition-colors cursor-pointer"
                >
                    Voltar
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="border border-(--Border) rounded-xl bg-(--Widget-background) p-6 flex flex-col gap-5"
            >
                <h2 className="text-(--Primary) text-xs font-primary font-extrabold tracking-[0.25em] uppercase">
                    Detalhes do chamado
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-xs font-secondary text-(--Text-primary-off)">
                        Categoria do problema
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full min-h-10 rounded-md border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-primary) focus:outline-none focus:border-(--Primary)"
                        >
                            {issueOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-secondary text-(--Text-primary-off)">
                        Prioridade
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full min-h-10 rounded-md border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-primary) focus:outline-none focus:border-(--Primary)"
                        >
                            {priorityOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-secondary text-(--Text-primary-off)">
                        Referência (pedido, usuário ou código)
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Opcional"
                            className="w-full min-h-10 rounded-md border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-primary) focus:outline-none focus:border-(--Primary)"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-secondary text-(--Text-primary-off)">
                        Assunto
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Breve resumo do ocorrido"
                            className="w-full min-h-10 rounded-md border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-primary) focus:outline-none focus:border-(--Primary)"
                        />
                    </label>
                </div>

                <label className="flex flex-col gap-1.5 text-xs font-secondary text-(--Text-primary-off)">
                    Descrição
                    <textarea
                        rows={5}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva o que aconteceu, o comportamento esperado e os passos para reproduzir."
                        className="w-full rounded-md border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-primary) focus:outline-none focus:border-(--Primary) resize-none"
                    />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-(--Border)/50">
                    <p className="text-xs font-secondary text-(--Text-primary-off)">
                        Tempo médio de resposta: até 24h úteis
                    </p>
                    <button
                        type="submit"
                        className="min-h-10 px-5 py-2 rounded-lg bg-(--Primary) hover:bg-(--Primary-selected) text-(--Text-dark) text-xs font-primary font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        Enviar Chamado
                    </button>
                </div>
            </form>

            {tickets.length > 0 && (
                <section className="border border-(--Border) rounded-xl bg-(--Widget-background) p-6 flex flex-col gap-3">
                    <h2 className="text-(--Primary) text-xs font-primary font-extrabold tracking-[0.25em] uppercase">
                        Chamados Registrados Nesta Sessão
                    </h2>
                    {tickets.map((t) => (
                        <div
                            key={t.protocol}
                            className="rounded-lg border border-(--Border)/60 bg-(--Page-background) p-4 flex flex-wrap items-center justify-between gap-3"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={15} className="text-(--Success-text)" />
                                    <span className="text-sm font-primary font-bold text-(--Text-primary)">
                                        {t.protocol} — {t.subject}
                                    </span>
                                </div>
                                <p className="text-xs font-secondary text-(--Text-primary-off) mt-1">
                                    {t.category} • Prioridade {t.priority} • Registrado às {t.createdAt}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            <section className="border border-(--Border) rounded-xl bg-(--Widget-background) p-6">
                <h2 className="text-(--Primary) text-xs font-primary font-extrabold tracking-[0.25em] uppercase">
                    Ajuda rápida
                </h2>
                <div className="mt-4 grid gap-2.5 text-sm text-(--Text-primary-off) font-secondary">
                    <p>1. Verifique se a conexão com a API está ativa na tela inicial de monitoramento.</p>
                    <p>2. Confirme se o usuário autenticado possui o cargo compatível (Gerente para gestão de equipe/cardápio).</p>
                    <p>3. Para falhas em horário de pico, marque a prioridade como "Urgente" e informe o código do pedido.</p>
                </div>
            </section>
        </div>
    );
}

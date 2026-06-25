import { useNavigate } from "react-router-dom";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";

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

export function Support() {
	const navigate = useNavigate();

	return (
		<div className="w-full h-full gap-6 flex flex-col bg-(--Page-background) p-4">
			<div className="flex flex-wrap items-center gap-4">
				<div className="min-w-0 flex-1">
					<DestakTitle title="Suporte" subtitle="Abra um chamado e descreva o problema" />
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

			<section className="border border-(--Border) rounded-sm bg-(--Widget-background) p-6">
				<h2 className="text-(--Primary) text-xs font-primary font-extrabold tracking-[0.3em] uppercase">
					Detalhes do chamado
				</h2>

				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-2 text-xs font-secondary text-(--Text-primary-off)">
						Categoria do problema
						<select
							className="w-full rounded-sm border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-gray) focus:outline-none focus:border-(--Primary)"
							defaultValue={issueOptions[0]}
						>
							{issueOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>

					<label className="flex flex-col gap-2 text-xs font-secondary text-(--Text-primary-off)">
						Prioridade
						<select
							className="w-full rounded-sm border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-gray) focus:outline-none focus:border-(--Primary)"
							defaultValue={priorityOptions[1]}
						>
							{priorityOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>

					<label className="flex flex-col gap-2 text-xs font-secondary text-(--Text-primary-off)">
						Referência (pedido, usuário ou ID do item)
						<input
							type="text"
							placeholder="Opcional"
							className="w-full rounded-sm border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-gray) focus:outline-none focus:border-(--Primary)"
						/>
					</label>

					<label className="flex flex-col gap-2 text-xs font-secondary text-(--Text-primary-off)">
						Assunto
						<input
							type="text"
							placeholder="Breve resumo"
							className="w-full rounded-sm border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-gray) focus:outline-none focus:border-(--Primary)"
						/>
					</label>
				</div>

				<div className="mt-4 flex flex-col gap-2 text-xs font-secondary text-(--Text-primary-off)">
					Descrição
					<textarea
						rows={6}
						placeholder="Descreva o que aconteceu, o comportamento esperado e qualquer contexto adicional."
						className="w-full rounded-sm border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-gray) focus:outline-none focus:border-(--Primary)"
					/>
				</div>

				<div className="mt-5 flex flex-wrap items-center justify-between gap-4">
					<p className="text-xs font-secondary text-(--Text-primary-off)">
						Tempo médio de resposta: 24h
					</p>
					<button
						type="button"
						className="px-5 py-2 rounded-sm border border-(--Border) text-(--Text-primary-off) text-xs font-secondary font-semibold uppercase tracking-wider hover:border-(--Primary) hover:text-(--Primary) transition-all duration-200"
					>
						Enviar chamado
					</button>
				</div>
			</section>

			<section className="border border-(--Border) rounded-sm bg-(--Widget-background) p-6">
				<h2 className="text-(--Primary) text-xs font-primary font-extrabold tracking-[0.3em] uppercase">
					Ajuda rápida
				</h2>
				<div className="mt-4 grid gap-3 text-sm text-(--Text-primary-off) font-secondary">
					<p>Verifique se o problema persiste após recarregar a página.</p>
					<p>Confirme se a conta correta está autenticada.</p>
					<p>Para problemas urgentes, defina a prioridade como "Urgente" e inclua um ID de referência.</p>
				</div>
			</section>
		</div>
	);
}

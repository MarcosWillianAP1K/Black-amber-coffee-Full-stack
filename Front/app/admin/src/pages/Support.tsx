import { useNavigate } from "react-router-dom";
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";

const issueOptions = [
	"Orders",
	"Payments",
	"Inventory",
	"Staff",
	"Reports",
	"Login / Access",
	"Other",
];

const priorityOptions = ["Low", "Normal", "High", "Urgent"];

export function Support() {
	const navigate = useNavigate();

	return (
		<div className="w-full h-fit gap-6 flex flex-col bg-(--Page-background) p-4">
			<div className="flex flex-wrap items-center gap-4">
				<div className="min-w-0 flex-1">
					<DestakTitle title="Support" subtitle="Open a ticket and describe the issue" />
				</div>
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-(--Border) text-(--Text-primary-off) text-xs font-secondary font-semibold uppercase tracking-wider hover:border-(--Primary) hover:text-(--Primary) transition-all duration-200"
					aria-label="Back"
				>
					Back
				</button>
			</div>

			<section className="border border-(--Border) rounded-sm bg-(--Widget-background) p-6">
				<h2 className="text-(--Primary) text-xs font-primary font-extrabold tracking-[0.3em] uppercase">
					Ticket details
				</h2>

				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-2 text-xs font-secondary text-(--Text-primary-off)">
						Issue category
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
						Priority
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
						Reference (order, user, or item ID)
						<input
							type="text"
							placeholder="Optional"
							className="w-full rounded-sm border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-gray) focus:outline-none focus:border-(--Primary)"
						/>
					</label>

					<label className="flex flex-col gap-2 text-xs font-secondary text-(--Text-primary-off)">
						Subject
						<input
							type="text"
							placeholder="Short summary"
							className="w-full rounded-sm border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-gray) focus:outline-none focus:border-(--Primary)"
						/>
					</label>
				</div>

				<div className="mt-4 flex flex-col gap-2 text-xs font-secondary text-(--Text-primary-off)">
					Description
					<textarea
						rows={6}
						placeholder="Describe what happened, expected behavior, and any context."
						className="w-full rounded-sm border border-(--Border) bg-(--Page-background) px-3 py-2 text-sm text-(--Text-gray) focus:outline-none focus:border-(--Primary)"
					/>
				</div>

				<div className="mt-5 flex flex-wrap items-center justify-between gap-4">
					<p className="text-xs font-secondary text-(--Text-primary-off)">
						Typical response time: 24h
					</p>
					<button
						type="button"
						className="px-5 py-2 rounded-sm border border-(--Border) text-(--Text-primary-off) text-xs font-secondary font-semibold uppercase tracking-wider hover:border-(--Primary) hover:text-(--Primary) transition-all duration-200"
					>
						Submit ticket
					</button>
				</div>
			</section>

			<section className="border border-(--Border) rounded-sm bg-(--Widget-background) p-6">
				<h2 className="text-(--Primary) text-xs font-primary font-extrabold tracking-[0.3em] uppercase">
					Quick help
				</h2>
				<div className="mt-4 grid gap-3 text-sm text-(--Text-primary-off) font-secondary">
					<p>Check if the issue persists after refreshing the page.</p>
					<p>Confirm the correct account is logged in.</p>
					<p>For urgent issues, set priority to "Urgent" and include a reference ID.</p>
				</div>
			</section>
		</div>
	);
}

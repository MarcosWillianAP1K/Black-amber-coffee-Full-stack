import { useState, useCallback, useMemo } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
    STOCK_STATUSES,
    STOCK_STATUS_LABELS,
    UNIT_LABELS,
    type InventoryAddStockData,
    type InventoryEditData,
    type InventoryItem,
} from "shared-utils/types/inventory";
import { useToastStore } from "shared-utils/stores/useToastStore";
import { FilterButton, type FilterOption } from "ui-shared/components/FilterButton";
import { SearchBar } from "ui-shared/components/ui/SearchBar";
import { ConfirmDialog } from "ui-shared/components/ConfirmDialog";
import { TableInventoryHeader } from "./TableInventoryHeader";
import { TableInventoryRow } from "./TableInventoryRow";
import { InventoryItemFormPanel } from "./InventoryItemFormPanel";

export interface InventoryItemHandlers {
    onEdit: (id: string, data: InventoryEditData) => void | Promise<void>;
    onDelete: (id: string) => void | Promise<void>;
    onAddStock: (data: InventoryAddStockData) => void | Promise<void>;
}

interface TableInventoryProps {
    items: InventoryItem[];
    handlers: InventoryItemHandlers;
    title?: string;
    isLive?: boolean;
}

type PanelState =
    | { mode: "closed" }
    | { mode: "edit"; item: InventoryItem }
    | { mode: "add" };

export function TableInventory({
    items,
    handlers,
    title = "INSUMOS EM ESTOQUE",
    isLive = true,
}: TableInventoryProps) {
    const showToast = useToastStore((s) => s.showToast);
    const [panelState, setPanelState] = useState<PanelState>({ mode: "closed" });
    const [searchTerm, setSearchTerm] = useState("");
    const [sortType, setSortType] = useState<
        "default" | "name-asc" | "name-desc" | "amount-asc" | "amount-desc" | "status-critical"
    >("default");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

    const handleEditClick = useCallback((item: InventoryItem) => {
        setPanelState({ mode: "edit", item });
    }, []);

    const handleAddClick = useCallback(() => {
        setPanelState({ mode: "add" });
    }, []);

    const handleDeleteRequest = useCallback(
        (id: string) => {
            const found = items.find((i) => i.id === id) ?? null;
            setDeleteTarget(found);
        },
        [items],
    );

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        const target = deleteTarget;
        setDeleteTarget(null);
        try {
            await handlers.onDelete(target.id);
            setPanelState((prev) =>
                prev.mode === "edit" && prev.item.id === target.id
                    ? { mode: "closed" }
                    : prev,
            );
            showToast({ variant: "info", title: `Insumo "${target.name}" removido` });
        } catch (err) {
            showToast({
                variant: "error",
                title: "Erro ao remover insumo",
                description: err instanceof Error ? err.message : undefined,
            });
        }
    }, [deleteTarget, handlers, showToast]);

    const handlePanelCancel = useCallback(() => {
        setPanelState({ mode: "closed" });
    }, []);

    const handleSaveEdit = useCallback(
        async (data: InventoryEditData) => {
            if (panelState.mode === "edit") {
                await handlers.onEdit(panelState.item.id, data);
                showToast({ variant: "success", title: "Insumo atualizado" });
            }
            setPanelState({ mode: "closed" });
        },
        [panelState, handlers, showToast],
    );

    const handleSaveAdd = useCallback(
        async (data: InventoryAddStockData) => {
            await handlers.onAddStock(data);
            showToast({ variant: "success", title: "Estoque registrado" });
            setPanelState({ mode: "closed" });
        },
        [handlers, showToast],
    );

    const isPanelOpen = panelState.mode !== "closed";
    const editingItem = panelState.mode === "edit" ? panelState.item : null;

    const displayItems = useMemo(() => {
        let next = [...items];
        const query = searchTerm.trim().toLowerCase();

        if (query) {
            next = next.filter(
                (item) =>
                    item.name.toLowerCase().includes(query) ||
                    item.code.toLowerCase().includes(query),
            );
        }

        if (statusFilter) {
            next = next.filter((item) => item.status === statusFilter);
        }

        const nameCompare = (a: string, b: string) =>
            a.localeCompare(b, undefined, { sensitivity: "base" });

        switch (sortType) {
            case "name-asc":
                next.sort((a, b) => nameCompare(a.name, b.name));
                break;
            case "name-desc":
                next.sort((a, b) => nameCompare(b.name, a.name));
                break;
            case "amount-asc":
                next.sort((a, b) => a.amount - b.amount || nameCompare(a.name, b.name));
                break;
            case "amount-desc":
                next.sort((a, b) => b.amount - a.amount || nameCompare(a.name, b.name));
                break;
            case "status-critical": {
                const priority: Record<string, number> = {
                    "Out of Stock": 0,
                    "Low Stock": 1,
                    "In Stock": 2,
                };
                next.sort((a, b) => (priority[a.status] ?? 99) - (priority[b.status] ?? 99));
                break;
            }
            default:
                break;
        }

        return next;
    }, [items, searchTerm, sortType, statusFilter]);

    const filterOptions: FilterOption[] = [
        {
            label: "Ordem padrão",
            action: () => setSortType("default"),
            active: sortType === "default",
        },
        {
            label: "Nome (A-Z)",
            action: () => setSortType("name-asc"),
            active: sortType === "name-asc",
        },
        {
            label: "Nome (Z-A)",
            action: () => setSortType("name-desc"),
            active: sortType === "name-desc",
        },
        {
            label: "Menor quantidade",
            action: () => setSortType("amount-asc"),
            active: sortType === "amount-asc",
        },
        {
            label: "Maior quantidade",
            action: () => setSortType("amount-desc"),
            active: sortType === "amount-desc",
        },
        {
            label: "Críticos primeiro",
            action: () => setSortType("status-critical"),
            active: sortType === "status-critical",
        },
        {
            label: "Todos os status",
            action: () => setStatusFilter(null),
            active: statusFilter === null,
        },
        ...STOCK_STATUSES.map((status) => ({
            label: `Status: ${STOCK_STATUS_LABELS[status]}`,
            action: () => setStatusFilter(status),
            active: statusFilter === status,
        })),
    ];

    return (
        <div className="w-full rounded-lg border border-(--Border) bg-(--Widget-background) p-4 sm:p-5 flex flex-col gap-5">
            <div className="flex flex-col gap-3.5 border-b border-(--Border)/60 pb-4">
                <div className="w-full flex flex-wrap items-center justify-between gap-3">
                    <TableInventoryHeader title={title} isLive={isLive} />

                    <button
                        type="button"
                        onClick={handleAddClick}
                        className="min-h-10 px-4 py-2 bg-(--Primary) hover:bg-(--Primary-selected) rounded-md text-(--Text-dark) text-xs font-primary font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                        <Plus size={15} />
                        Adicionar Estoque
                    </button>
                </div>

                <div className="w-full flex items-center justify-between gap-3">
                    <SearchBar
                        placeholder="Buscar insumo ou código..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="flex-1 sm:flex-initial sm:w-80 md:w-96"
                    />
                    <FilterButton
                        title="Filtros de estoque"
                        buttonLabel="Filtrar"
                        options={filterOptions}
                        align="right"
                    />
                </div>
            </div>

            {/* Cards Mobile (< md) */}
            <div className="md:hidden flex flex-col gap-3">
                {displayItems.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-lg border border-(--Border)/60 bg-(--Page-background) p-3.5 flex flex-col gap-2.5"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="text-sm font-primary font-bold text-(--Text-primary) truncate">
                                    {item.name}
                                </h3>
                                <span className="text-xs font-secondary text-(--Text-primary-off)">
                                    #{item.code}
                                </span>
                            </div>
                            <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                    item.status === "Out of Stock"
                                        ? "bg-(--Danger-bg) text-(--Danger-text)"
                                        : item.status === "Low Stock"
                                          ? "bg-(--Warning)/20 text-(--Warning-text)"
                                          : "bg-(--Afirmation)/20 text-(--Success-text)"
                                }`}
                            >
                                {STOCK_STATUS_LABELS[item.status]}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-(--Border)/40">
                            <span className="text-sm font-primary font-bold text-(--Primary) tabular-nums">
                                {item.amount} {UNIT_LABELS[item.unit]}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleEditClick(item)}
                                    aria-label={`Editar ${item.name}`}
                                    className="p-2 rounded-md text-(--Text-primary-off) hover:text-(--Primary) cursor-pointer"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteRequest(item.id)}
                                    aria-label={`Excluir ${item.name}`}
                                    className="p-2 rounded-md text-(--Text-primary-off) hover:text-(--Danger-text) cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabela Desktop (>= md) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-(--Border)">
                            <th className="text-left py-3 pr-4 text-(--Text-primary-off) text-[11px] font-secondary font-bold tracking-wider uppercase">
                                Insumo
                            </th>
                            <th className="text-left py-3 px-4 text-(--Text-primary-off) text-[11px] font-secondary font-bold tracking-wider uppercase">
                                Quantidade
                            </th>
                            <th className="text-left py-3 px-4 text-(--Text-primary-off) text-[11px] font-secondary font-bold tracking-wider uppercase">
                                Status
                            </th>
                            <th className="text-left py-3 pl-4 text-(--Text-primary-off) text-[11px] font-secondary font-bold tracking-wider uppercase">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayItems.map((item) => (
                            <TableInventoryRow
                                key={item.id}
                                item={item}
                                isSelected={panelState.mode === "edit" && panelState.item.id === item.id}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteRequest}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {displayItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                    <p className="text-(--Text-primary) text-sm font-secondary font-medium">
                        Nenhum insumo encontrado
                    </p>
                    <p className="text-(--Text-primary-off) text-xs font-secondary">
                        Ajuste os filtros ou registre um novo insumo
                    </p>
                </div>
            )}

            {isPanelOpen && (
                <InventoryItemFormPanel
                    key={editingItem?.id ?? "__add__"}
                    editingItem={editingItem}
                    onSaveEdit={handleSaveEdit}
                    onSaveAdd={handleSaveAdd}
                    onCancel={handlePanelCancel}
                />
            )}

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                title="Excluir Insumo"
                description={`Tem certeza que deseja excluir "${deleteTarget?.name ?? ""}" do controle de estoque?`}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                danger
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => void handleConfirmDelete()}
            />
        </div>
    );
}

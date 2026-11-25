import { useState, useCallback, useMemo } from "react";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";
import {
    PRODUCT_CATEGORY_LABELS,
    type Product,
    type ProductCategory,
    type ProductInput,
} from "shared-utils/types/product";
import { formatPrice } from "shared-utils/helpers/currency";
import { useToastStore } from "shared-utils/stores/useToastStore";
import { FilterButton, type FilterOption } from "ui-shared/components/FilterButton";
import { SearchBar } from "ui-shared/components/ui/SearchBar";
import { ConfirmDialog } from "ui-shared/components/ConfirmDialog";
import { ProductThumb } from "ui-shared/components/ui/ProductThumb";
import { TableMenuHeader } from "./TableMenuHeader";
import { TableMenuRow } from "./TableMenuRow";
import { MenuItemFormPanel } from "./MenuItemFormPanel";

export interface MenuItemHandlers {
    onEdit: (id: number, data: ProductInput) => void | Promise<void>;
    onDelete: (id: number) => void | Promise<void>;
    onCreate: (data: ProductInput) => void | Promise<void>;
    onToggleActive?: (id: number) => void | Promise<void>;
}

interface TableMenuProps {
    items: Product[];
    handlers: MenuItemHandlers;
    title?: string;
    isLive?: boolean;
    categories?: readonly string[];
}

type PanelState =
    | { mode: "closed" }
    | { mode: "edit"; item: Product }
    | { mode: "create" };

export function TableMenu({
    items,
    handlers,
    title = "CARDÁPIO ATIVO",
    isLive = true,
    categories,
}: TableMenuProps) {
    const showToast = useToastStore((s) => s.showToast);
    const [panelState, setPanelState] = useState<PanelState>({ mode: "closed" });
    const [searchTerm, setSearchTerm] = useState("");
    const [sortType, setSortType] = useState<
        "default" | "name-asc" | "name-desc" | "price-asc" | "price-desc"
    >("default");
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const handleEditClick = useCallback((item: Product) => {
        setPanelState({ mode: "edit", item });
    }, []);

    const handleDeleteClick = useCallback((id: number) => {
        setDeleteTarget(id);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (deleteTarget === null) return;
        const targetId = deleteTarget;
        setDeleteTarget(null);
        try {
            await handlers.onDelete(targetId);
            setPanelState((prev) =>
                prev.mode === "edit" && prev.item.id === targetId
                    ? { mode: "closed" }
                    : prev,
            );
            showToast({ variant: "info", title: "Produto removido do cardápio" });
        } catch (err) {
            showToast({
                variant: "error",
                title: "Erro ao remover produto",
                description: err instanceof Error ? err.message : undefined,
            });
        }
    }, [deleteTarget, handlers, showToast]);

    const handleToggleActive = useCallback(
        async (id: number) => {
            if (!handlers.onToggleActive) return;
            try {
                await handlers.onToggleActive(id);
                showToast({ variant: "success", title: "Disponibilidade atualizada" });
            } catch (err) {
                showToast({
                    variant: "error",
                    title: "Falha ao alterar status",
                    description: err instanceof Error ? err.message : undefined,
                });
            }
        },
        [handlers, showToast],
    );

    const handleAddClick = useCallback(() => {
        setPanelState({ mode: "create" });
    }, []);

    const handlePanelCancel = useCallback(() => {
        setPanelState({ mode: "closed" });
    }, []);

    const handlePanelSave = useCallback(
        async (data: ProductInput) => {
            if (panelState.mode === "edit") {
                await handlers.onEdit(panelState.item.id, data);
                showToast({ variant: "success", title: "Produto atualizado" });
            } else if (panelState.mode === "create") {
                await handlers.onCreate(data);
                showToast({ variant: "success", title: "Produto adicionado ao cardápio" });
            }
            setPanelState({ mode: "closed" });
        },
        [panelState, handlers, showToast],
    );

    const isPanelOpen = panelState.mode !== "closed";
    const editingItem = panelState.mode === "edit" ? panelState.item : null;

    const availableCategories = useMemo(() => {
        const base =
            categories && categories.length > 0
                ? categories
                : items.map((item) => item.category);

        return Array.from(new Set(base.filter(Boolean))).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" }),
        );
    }, [categories, items]);

    const displayItems = useMemo(() => {
        let next = [...items];
        const query = searchTerm.trim().toLowerCase();

        if (query) {
            next = next.filter(
                (item) =>
                    item.name.toLowerCase().includes(query) ||
                    (item.description ?? "").toLowerCase().includes(query),
            );
        }

        if (categoryFilter) {
            next = next.filter((item) => item.category === categoryFilter);
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
            case "price-asc":
                next.sort((a, b) => a.price - b.price || nameCompare(a.name, b.name));
                break;
            case "price-desc":
                next.sort((a, b) => b.price - a.price || nameCompare(a.name, b.name));
                break;
            default:
                break;
        }

        return next;
    }, [items, searchTerm, categoryFilter, sortType]);

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
            label: "Preço (Menor para Maior)",
            action: () => setSortType("price-asc"),
            active: sortType === "price-asc",
        },
        {
            label: "Preço (Maior para Menor)",
            action: () => setSortType("price-desc"),
            active: sortType === "price-desc",
        },
        {
            label: "Todas as categorias",
            action: () => setCategoryFilter(null),
            active: categoryFilter === null,
        },
        ...availableCategories.map((category) => ({
            label: `Categoria: ${PRODUCT_CATEGORY_LABELS[category as ProductCategory] ?? category}`,
            action: () => setCategoryFilter(category),
            active: categoryFilter === category,
        })),
    ];

    return (
        <div className="w-full rounded-lg border border-(--Border) bg-(--Widget-background) p-4 sm:p-5 flex flex-col gap-5">
            {/* Cabeçalho responsivo com barras separadas em justify-between */}
            <div className="flex flex-col gap-3.5 border-b border-(--Border)/60 pb-4">
                <div className="w-full flex flex-wrap items-center justify-between gap-3">
                    <TableMenuHeader title={title} isLive={isLive} />

                    <button
                        type="button"
                        onClick={handleAddClick}
                        className="min-h-10 px-4 py-2 bg-(--Primary) hover:bg-(--Primary-selected) rounded-md text-(--Text-dark) text-xs font-primary font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                        <Plus size={15} />
                        Adicionar Produto
                    </button>
                </div>

                <div className="w-full flex items-center justify-between gap-3">
                    <SearchBar
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="flex-1 sm:flex-initial sm:w-80 md:w-96"
                    />
                    <FilterButton
                        title="Filtros do cardápio"
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
                        className="rounded-lg border border-(--Border)/60 bg-(--Page-background) p-3.5 flex flex-col gap-3"
                    >
                        <div className="flex items-start gap-3">
                            <ProductThumb
                                name={item.name}
                                category={item.category}
                                imageUrl={item.imgUrl}
                                iconSize={20}
                                className="w-14 h-14 rounded-lg shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-primary font-bold text-(--Text-primary) truncate">
                                        {item.name}
                                    </h3>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                            item.isActive
                                                ? "bg-(--Afirmation)/20 text-(--Success-text)"
                                                : "bg-(--Danger-bg) text-(--Danger-text)"
                                        }`}
                                    >
                                        {item.isActive ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                                <p className="text-xs font-secondary text-(--Text-primary-off) mt-0.5 line-clamp-2">
                                    {item.description || "Sem descrição"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-(--Border)/40">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-primary font-extrabold text-(--Primary) tabular-nums">
                                    {formatPrice(item.price)}
                                </span>
                                <span className="text-xs font-secondary text-(--Text-primary-off)">
                                    • {PRODUCT_CATEGORY_LABELS[item.category as ProductCategory] ?? item.category}
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                {handlers.onToggleActive && (
                                    <button
                                        type="button"
                                        onClick={() => void handleToggleActive(item.id)}
                                        aria-label={item.isActive ? `Desativar ${item.name}` : `Ativar ${item.name}`}
                                        className="p-2 rounded-md text-(--Text-primary-off) hover:text-(--Primary) cursor-pointer"
                                    >
                                        <Power size={16} />
                                    </button>
                                )}
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
                                    onClick={() => handleDeleteClick(item.id)}
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
                                Produto
                            </th>
                            <th className="text-left py-3 px-4 text-(--Text-primary-off) text-[11px] font-secondary font-bold tracking-wider uppercase">
                                Categoria
                            </th>
                            <th className="text-left py-3 px-4 text-(--Text-primary-off) text-[11px] font-secondary font-bold tracking-wider uppercase">
                                Preço
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
                            <TableMenuRow
                                key={item.id}
                                item={item}
                                isSelected={panelState.mode === "edit" && panelState.item.id === item.id}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                                onToggleActive={handlers.onToggleActive ? handleToggleActive : undefined}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {displayItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                    <p className="text-(--Text-primary) text-sm font-secondary font-medium">
                        Nenhum item encontrado no cardápio
                    </p>
                    <p className="text-(--Text-primary-off) text-xs font-secondary">
                        Ajuste os filtros ou clique em Adicionar Produto
                    </p>
                </div>
            )}

            {isPanelOpen && (
                <MenuItemFormPanel
                    key={editingItem?.id ?? "__new__"}
                    editingItem={editingItem}
                    onSave={handlePanelSave}
                    onCancel={handlePanelCancel}
                    categories={categories}
                />
            )}

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                title="Excluir Item do Cardápio"
                description="Tem certeza que deseja excluir este produto? Caso já exista em pedidos históricos, ele será desativado."
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                danger
                onConfirm={() => void handleConfirmDelete()}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

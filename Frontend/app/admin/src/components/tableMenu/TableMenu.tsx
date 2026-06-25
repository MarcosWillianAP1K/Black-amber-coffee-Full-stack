/**
 * TableMenu — Main orchestrator component for the menu management table.
 *
 * Renders a table of menu items with edit/delete actions and an "Add Product" button.
 * When editing or adding, a side panel (MenuItemFormPanel) slides in from the right.
 *
 * All data operations are delegated via callbacks, making this
 * component ready for API/database integration.
 */

import { useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import type { Product, ProductInput } from "shared-utils/types/product";
import { FilterButton, type FilterOption } from "ui-shared/components/FilterButton";
import { SearchBar } from "ui-shared/components/ui/SearchBar";
import { ConfirmDialog } from "ui-shared/components/ConfirmDialog";
import { TableMenuHeader } from "./TableMenuHeader";
import { TableMenuRow } from "./TableMenuRow";
import { MenuItemFormPanel } from "./MenuItemFormPanel";

/** Callbacks contract — ready for API integration */
export interface MenuItemHandlers {
    onEdit: (id: number, data: ProductInput) => void | Promise<void>;
    onDelete: (id: number) => void | Promise<void>;
    onCreate: (data: ProductInput) => void | Promise<void>;
}

interface TableMenuProps {
    /** List of menu items to display */
    items: Product[];
    /** Handlers for CRUD operations */
    handlers: MenuItemHandlers;
    /** Table title */
    title?: string;
    /** Whether to show the live indicator */
    isLive?: boolean;
    /** Optional category list override */
    categories?: readonly string[];
}

type PanelState =
    | { mode: "closed" }
    | { mode: "edit"; item: Product }
    | { mode: "create" };

export function TableMenu({ items, handlers, title = "ACTIVE MENU", isLive = true, categories, }: TableMenuProps) {
    const [panelState, setPanelState] = useState<PanelState>({ mode: "closed" });
    const [searchTerm, setSearchTerm] = useState("");
    const [sortType, setSortType] = useState<"default" | "name-asc" | "name-desc" | "price-asc" | "price-desc">("default");
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const handleEditClick = useCallback((item: Product) => {
        setPanelState({ mode: "edit", item });
    }, []);

    const handleDeleteClick = useCallback(
        (id: number) => {
            setDeleteTarget(id);
        },
        []
    );

    const handleConfirmDelete = useCallback(() => {
        if (deleteTarget === null) return;
        handlers.onDelete(deleteTarget);
        // Close panel if we're editing the deleted item
        setPanelState((prev) =>
            prev.mode === "edit" && prev.item.id === deleteTarget
                ? { mode: "closed" }
                : prev
        );
        setDeleteTarget(null);
    }, [deleteTarget, handlers]);

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
            } else if (panelState.mode === "create") {
                await handlers.onCreate(data);
            }
            setPanelState({ mode: "closed" });
        },
        [panelState, handlers]
    );

    const isPanelOpen = panelState.mode !== "closed";
    const editingItem = panelState.mode === "edit" ? panelState.item : null;

    const availableCategories = useMemo(() => {
        const base = categories && categories.length > 0
            ? categories
            : items.map((item) => item.category);

        return Array.from(new Set(base.filter(Boolean))).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" })
        );
    }, [categories, items]);

    const displayItems = useMemo(() => {
        let next = [...items];
        const query = searchTerm.trim().toLowerCase();

        if (query) {
            next = next.filter((item) => item.name.toLowerCase().includes(query));
        }

        if (categoryFilter) {
            next = next.filter((item) => item.category === categoryFilter);
        }

        const nameCompare = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });

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
            label: `Categoria: ${category}`,
            action: () => setCategoryFilter(category),
            active: categoryFilter === category,
        })),
    ];

    return (
        <div className="flex w-full h-fit gap-10">
            {/* Table Section */}
            <div className={`w-full h-170 p-4 rounded-md flex flex-col min-w-0 bg-(--Widget-background) transition-all duration-300 ${isPanelOpen ? "mr-0" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <TableMenuHeader title={title} isLive={isLive} />
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchBar placeholder="Buscar por nome" onChange={setSearchTerm} />
                        <FilterButton
                            title="Filtros do cardápio"
                            buttonLabel="Filtrar"
                            options={filterOptions}
                            align="right"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-(--Border)">
                                <th className="text-left py-3 pr-4 text-(--Text-primary-off) text-[10px] font-secondary font-bold tracking-wider uppercase">
                                    Item
                                </th>
                                <th className="text-left py-3 px-4 text-(--Text-primary-off) text-[10px] font-secondary font-bold tracking-wider uppercase">
                                    Categoria
                                </th>
                                <th className="text-left py-3 px-4 text-(--Text-primary-off) text-[10px] font-secondary font-bold tracking-wider uppercase">
                                    Preço
                                </th>
                                <th className="text-left py-3 pl-4 text-(--Text-primary-off) text-[10px] font-secondary font-bold tracking-wider uppercase">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayItems.map((item) => (
                                <TableMenuRow
                                    key={item.id}
                                    item={item}
                                    isSelected={
                                        panelState.mode === "edit" &&
                                        panelState.item.id === item.id
                                    }
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {displayItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <p className="text-(--Text-primary-off) text-sm font-secondary">
                                Nenhum item encontrado no cardápio
                            </p>
                            <p className="text-(--Text-primary-off)/50 text-xs font-secondary">
                                Ajuste os filtros ou adicione um novo produto
                            </p>
                        </div>
                    )}
                </div>

                {/* Add Product Button */}
                <div className="flex justify-center py-6">
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-5 py-2.5 bg-(--Widget-background) border border-(--Border) rounded-md text-(--Text-gray) text-sm font-secondary font-semibold hover:border-(--Primary) hover:text-(--Primary) transition-all duration-200 cursor-pointer"
                    >
                        <Plus size={16} />
                        Adicionar Produto
                    </button>
                </div>
            </div>

            {/* Side Panel */}
            {isPanelOpen && (
                <MenuItemFormPanel
                    key={editingItem?.id ?? "__new__"}
                    editingItem={editingItem}
                    onSave={handlePanelSave}
                    onCancel={handlePanelCancel}
                    categories={categories}
                />
            )}

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={deleteTarget !== null}
                title="Excluir Item do Cardápio"
                description={`Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                danger
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

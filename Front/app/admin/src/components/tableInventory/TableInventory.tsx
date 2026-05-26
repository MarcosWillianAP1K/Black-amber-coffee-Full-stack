/**
 * TableInventory — Main orchestrator component for the inventory management table.
 *
 * Renders a table of inventory items with edit/delete actions and an "Add Stock" button.
 * When editing or adding, a side panel (InventoryItemFormPanel) slides in from the right.
 *
 * All data operations are delegated via callbacks (API-ready).
 */

import { useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { STOCK_STATUSES } from "shared-utils/types/inventory";
import type { InventoryItem, InventoryAddStockData, InventoryEditData } from "shared-utils/types/inventory";
import { FilterButton, type FilterOption } from "ui-shared/components/FilterButton";
import { SearchBar } from "ui-shared/components/ui/SearchBar";
import { TableInventoryHeader } from "./TableInventoryHeader";
import { TableInventoryRow } from "./TableInventoryRow";
import { InventoryItemFormPanel } from "./InventoryItemFormPanel";

/** Callbacks contract — ready for API integration */
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

export function TableInventory({items,handlers,title = "INVENTORY",isLive = true,}: TableInventoryProps) {
    const [panelState, setPanelState] = useState<PanelState>({ mode: "closed" });
    const [searchTerm, setSearchTerm] = useState("");
    const [sortType, setSortType] = useState<"default" | "name-asc" | "name-desc" | "amount-asc" | "amount-desc" | "status-critical">("default");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const handleEditClick = useCallback((item: InventoryItem) => {
        setPanelState({ mode: "edit", item });
    }, []);

    const handleDeleteClick = useCallback(
        (id: string) => {
            handlers.onDelete(id);
            setPanelState((prev) =>
                prev.mode === "edit" && prev.item.id === id
                    ? { mode: "closed" }
                    : prev
            );
        },
        [handlers]
    );

    const handleAddClick = useCallback(() => {
        setPanelState({ mode: "add" });
    }, []);

    const handlePanelCancel = useCallback(() => {
        setPanelState({ mode: "closed" });
    }, []);

    const handleSaveEdit = useCallback(
        (data: InventoryEditData) => {
            if (panelState.mode === "edit") {
                handlers.onEdit(panelState.item.id, data);
            }
            setPanelState({ mode: "closed" });
        },
        [panelState, handlers]
    );

    const handleSaveAdd = useCallback(
        (data: InventoryAddStockData) => {
            handlers.onAddStock(data);
            setPanelState({ mode: "closed" });
        },
        [handlers]
    );

    const isPanelOpen = panelState.mode !== "closed";
    const editingItem = panelState.mode === "edit" ? panelState.item : null;

    const displayItems = useMemo(() => {
        let next = [...items];
        const query = searchTerm.trim().toLowerCase();

        if (query) {
            next = next.filter((item) => item.name.toLowerCase().includes(query));
        }

        if (statusFilter) {
            next = next.filter((item) => item.status === statusFilter);
        }

        const nameCompare = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });

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
            label: "Default order",
            action: () => setSortType("default"),
            active: sortType === "default",
        },
        {
            label: "Name (A-Z)",
            action: () => setSortType("name-asc"),
            active: sortType === "name-asc",
        },
        {
            label: "Name (Z-A)",
            action: () => setSortType("name-desc"),
            active: sortType === "name-desc",
        },
        {
            label: "Amount (Low to High)",
            action: () => setSortType("amount-asc"),
            active: sortType === "amount-asc",
        },
        {
            label: "Amount (High to Low)",
            action: () => setSortType("amount-desc"),
            active: sortType === "amount-desc",
        },
        {
            label: "Status (Critical first)",
            action: () => setSortType("status-critical"),
            active: sortType === "status-critical",
        },
        {
            label: "All statuses",
            action: () => setStatusFilter(null),
            active: statusFilter === null,
        },
        ...STOCK_STATUSES.map((status) => ({
            label: `Status: ${status}`,
            action: () => setStatusFilter(status),
            active: statusFilter === status,
        })),
    ];

    return (
        <div className="flex w-full h-fit gap-10">
            {/* Table Section */}
            <div className={`w-full h-170 p-4 rounded-md flex flex-col min-w-0 bg-(--Widget-background) transition-all duration-300`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <TableInventoryHeader title={title} isLive={isLive} />
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchBar placeholder="Search by name" onChange={setSearchTerm} />
                        <FilterButton
                            title="Inventory filters"
                            buttonLabel="Filter"
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
                                    Amount
                                </th>
                                <th className="text-left py-3 px-4 text-(--Text-primary-off) text-[10px] font-secondary font-bold tracking-wider uppercase">
                                    Status
                                </th>
                                <th className="text-left py-3 pl-4 text-(--Text-primary-off) text-[10px] font-secondary font-bold tracking-wider uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayItems.map((item) => (
                                <TableInventoryRow
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
                                No inventory items found
                            </p>
                            <p className="text-(--Text-primary-off)/50 text-xs font-secondary">
                                Adjust filters or add new stock
                            </p>
                        </div>
                    )}
                </div>

                {/* Add Stock Button */}
                <div className="flex justify-center py-6">
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-5 py-2.5 bg-(--Widget-background) border border-(--Border) rounded-md text-(--Text-gray) text-sm font-secondary font-semibold hover:border-(--Primary) hover:text-(--Primary) transition-all duration-200 cursor-pointer"
                    >
                        <Plus size={16} />
                        Add Stock
                    </button>
                </div>
            </div>

            {/* Side Panel */}
            {isPanelOpen && (
                <InventoryItemFormPanel
                    key={editingItem?.id ?? "__add__"}
                    editingItem={editingItem}
                    onSaveEdit={handleSaveEdit}
                    onSaveAdd={handleSaveAdd}
                    onCancel={handlePanelCancel}
                />
            )}
        </div>
    );
}

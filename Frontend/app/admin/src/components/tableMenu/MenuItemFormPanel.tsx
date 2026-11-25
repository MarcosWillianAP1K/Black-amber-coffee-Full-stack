import { useEffect, useMemo, useRef, useState } from "react";
import { Info, Upload, X } from "lucide-react";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import { useToastStore } from "shared-utils/stores/useToastStore";
import {
    PRODUCT_CATEGORIES,
    PRODUCT_CATEGORY_LABELS,
    type Product,
    type ProductCategory,
    type ProductInput,
} from "shared-utils/types/product";

interface MenuItemFormPanelProps {
    editingItem: Product | null;
    onSave: (data: ProductInput) => Promise<void> | void;
    onCancel: () => void;
    categories?: readonly string[];
}

const EMPTY_FORM: ProductInput = {
    name: "",
    description: "",
    category: PRODUCT_CATEGORIES[0],
    price: 0,
    imgUrl: "",
    imageFile: null,
};

export function MenuItemFormPanel({
    editingItem,
    onSave,
    onCancel,
    categories = PRODUCT_CATEGORIES,
}: MenuItemFormPanelProps) {
    const isEditing = editingItem !== null;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const showToast = useToastStore((s) => s.showToast);

    const initialFormData = useMemo<ProductInput>(() => {
        if (!editingItem) return EMPTY_FORM;
        return {
            name: editingItem.name,
            description: editingItem.description,
            category: editingItem.category,
            price: editingItem.price,
            imgUrl: editingItem.imgUrl ?? "",
            imageFile: null,
        };
    }, [editingItem]);

    const [formData, setFormData] = useState<ProductInput>(initialFormData);
    const [imagePreview, setImagePreview] = useState<string>(editingItem?.imgUrl ?? "");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isSaving) onCancel();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isSaving, onCancel]);

    const handleChange = (field: keyof ProductInput, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast({
                variant: "error",
                title: "Arquivo muito grande",
                description: "A imagem deve ter no máximo 5MB (PNG, JPG ou WebP).",
            });
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setFormData((prev) => ({ ...prev, imageFile: file, imgUrl: previewUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button
                type="button"
                aria-label="Fechar painel"
                onClick={() => {
                    if (!isSaving) onCancel();
                }}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="menu-panel-title"
                className="relative z-10 w-full max-w-md bg-(--Widget-background) border-l border-(--Border) flex flex-col h-full shadow-2xl animate-[slideIn_0.2s_ease-out]"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-(--Border)/60">
                    <h3 id="menu-panel-title" className="text-(--Text-primary) text-lg font-primary font-extrabold">
                        {isEditing ? "Editar Item do Cardápio" : "Adicionar Novo Item"}
                    </h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className={`p-1.5 rounded-md text-(--Text-primary-off) transition-colors cursor-pointer ${
                            isSaving
                                ? "opacity-30 cursor-not-allowed"
                                : "hover:text-(--Text-primary) hover:bg-(--Button-background)"
                        }`}
                        aria-label="Fechar painel"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 px-6 py-5 flex-1 overflow-y-auto"
                >
                    <div>
                        <span className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-2 block">
                            Imagem do Produto (Opcional)
                        </span>
                        <button
                            type="button"
                            onClick={handleImageClick}
                            className="w-full h-36 rounded-lg border border-dashed border-(--Border) bg-(--Page-background) flex flex-col items-center justify-center gap-2 overflow-hidden transition-all hover:border-(--Primary) cursor-pointer group"
                        >
                            {imagePreview ? (
                                <div className="relative w-full h-full">
                                    <img
                                        src={imagePreview}
                                        alt="Pré-visualização"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Upload size={24} className="text-(--Primary)" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload size={22} className="text-(--Text-primary-off) group-hover:text-(--Primary) transition-colors" />
                                    <span className="text-(--Text-primary-off) text-xs font-secondary">
                                        Clique para selecionar imagem
                                    </span>
                                    <span className="text-(--Text-primary-off)/60 text-[11px] font-secondary">
                                        PNG, JPG ou WebP até 5MB
                                    </span>
                                </>
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-secondary text-(--Text-primary-off)/80">
                            <Info size={12} className="text-(--Primary) shrink-0" />
                            Envio de fotos requer Bucket S3/R2 configurado; sem foto, o card exibe ícone da categoria.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="menu-item-name"
                            className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-1.5 block"
                        >
                            Nome do Item
                        </label>
                        <input
                            id="menu-item-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="Ex.: Café Expresso Duplo"
                            required
                            className="w-full min-h-10 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary placeholder:text-(--Text-primary-off)/45 focus:outline-none focus:border-(--Primary)"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="menu-item-desc"
                            className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-1.5 block"
                        >
                            Descrição
                        </label>
                        <textarea
                            id="menu-item-desc"
                            value={formData.description ?? ""}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Descreva ingredientes, tamanho ou notas de sabor"
                            rows={3}
                            className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary placeholder:text-(--Text-primary-off)/45 focus:outline-none focus:border-(--Primary) resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label
                                htmlFor="menu-item-cat"
                                className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-1.5 block"
                            >
                                Categoria
                            </label>
                            <select
                                id="menu-item-cat"
                                value={formData.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                className="w-full min-h-10 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary focus:outline-none focus:border-(--Primary) cursor-pointer"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {PRODUCT_CATEGORY_LABELS[cat as ProductCategory] ?? cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="menu-item-price"
                                className="text-(--Primary) text-xs font-secondary font-bold tracking-wider uppercase mb-1.5 block"
                            >
                                Preço (R$)
                            </label>
                            <input
                                id="menu-item-price"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formData.price || ""}
                                onChange={(e) =>
                                    handleChange("price", parseFloat(e.target.value) || 0)
                                }
                                placeholder="0.00"
                                required
                                className="w-full min-h-10 bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-primary) text-sm font-secondary tabular-nums placeholder:text-(--Text-primary-off)/45 focus:outline-none focus:border-(--Primary)"
                            />
                        </div>
                    </div>

                    <div className="flex-1" />

                    <div className="flex gap-3 pt-4 border-t border-(--Border)/50">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="flex-1 min-h-11 px-4 py-2.5 bg-(--Button-background) text-(--Text-primary) font-primary font-bold text-xs rounded-md hover:bg-(--Select-background) disabled:opacity-50 uppercase tracking-wider cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 min-h-11 px-4 py-2.5 bg-(--Primary) text-(--Text-dark) font-primary font-extrabold text-xs rounded-md hover:bg-(--Primary-selected) disabled:opacity-60 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSaving ? (
                                <LoadingSpinner
                                    size="xs"
                                    label={isEditing ? "Salvando..." : "Adicionando..."}
                                />
                            ) : isEditing ? (
                                "Salvar Alterações"
                            ) : (
                                "Adicionar Item"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

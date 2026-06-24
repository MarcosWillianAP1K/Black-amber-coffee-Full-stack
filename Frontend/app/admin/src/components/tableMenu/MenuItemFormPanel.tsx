/**
 * MenuItemFormPanel — Side panel widget for creating or editing a menu item.
 * Appears to the right of the table when the user clicks Edit (pencil) or Add Product.
 *
 * - In "edit" mode: pre-filled with existing item data.
 * - In "create" mode: empty fields for a new product.
 *
 * Ready for API integration — onSave receives the complete form data.
 */

import { useState, useMemo, useRef } from "react";
import { X, Upload } from "lucide-react";
import type { Product, ProductInput } from "shared-utils/types/product";
import { PRODUCT_CATEGORIES } from "shared-utils/types/product";

interface MenuItemFormPanelProps {
    /** The item to edit. If null, the panel operates in "create" mode. */
    editingItem: Product | null;
    /** Called when the user saves (create or edit). */
    onSave: (data: ProductInput) => Promise<void> | void;
    /** Called when the user cancels / closes the panel. */
    onCancel: () => void;
    /** Optional list of categories to override the defaults */
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

export function MenuItemFormPanel({ editingItem, onSave, onCancel, categories = PRODUCT_CATEGORIES, }: MenuItemFormPanelProps) {
    const isEditing = editingItem !== null;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derive initial form data from the editing item (no useEffect needed).
    // The parent component uses `key={editingItem?.id ?? "new"}` on this component
    // to force a remount whenever the edited item changes.
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

    const handleChange = (
        field: keyof ProductInput,
        value: string | number
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert("Image must be under 10MB");
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
        <div className="w-[320px] min-w-[320px] bg-(--Widget-background) border-l border-(--Border) flex flex-col h-full animate-[slideIn_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h3 className="text-(--Text-gray) text-lg font-primary font-bold">
                    {isEditing ? "Edit Selected Item" : "Add New Item"}
                </h3>
                <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className={`p-1 rounded-md text-(--Text-primary-off) transition-colors ${isSaving ? "opacity-30 cursor-not-allowed" : "hover:text-(--Text-gray) hover:bg-(--Button-background)"}`}
                    aria-label="Close panel"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 px-6 pb-6 flex-1 overflow-y-auto"
            >
                {/* Image Upload */}
                <div>
                    <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                        Menu Image
                    </label>
                    <button
                        type="button"
                        onClick={handleImageClick}
                        className="w-full h-36 rounded-lg border border-dashed border-(--Border) bg-(--Page-background) flex flex-col items-center justify-center gap-2 overflow-hidden transition-all hover:border-(--Primary) cursor-pointer group"
                    >
                        {imagePreview ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Upload size={24} className="text-(--Primary)" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload size={24} className="text-(--Text-primary-off) group-hover:text-(--Primary) transition-colors" />
                                <span className="text-(--Text-primary-off) text-xs font-secondary">
                                    Click to replace image
                                </span>
                                <span className="text-(--Text-primary-off)/50 text-[10px] font-secondary">
                                    PNG, JPG up to 10MB
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
                </div>

                {/* Item Name */}
                <div>
                    <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                        Item Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter item name"
                        required
                        className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary placeholder:text-(--Text-primary-off)/40 focus:outline-none focus:border-(--Primary) transition-colors"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                        Description
                    </label>
                    <textarea
                        value={formData.description ?? ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Enter item description"
                        rows={3}
                        className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary placeholder:text-(--Text-primary-off)/40 focus:outline-none focus:border-(--Primary) transition-colors resize-none"
                    />
                </div>

                {/* Category + Price (side by side) */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary focus:outline-none focus:border-(--Primary) transition-colors cursor-pointer appearance-none"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-24">
                        <label className="text-(--Primary) text-[10px] font-secondary font-bold tracking-wider uppercase mb-2 block">
                            Price ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price || ""}
                            onChange={(e) =>
                                handleChange("price", parseFloat(e.target.value) || 0)
                            }
                            placeholder="0.00"
                            required
                            className="w-full bg-(--Page-background) border border-(--Border) rounded-md px-3 py-2 text-(--Text-gray) text-sm font-secondary placeholder:text-(--Text-primary-off)/40 focus:outline-none focus:border-(--Primary) transition-colors"
                        />
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className={`flex-1 px-4 py-2.5 bg-(--Button-background) text-(--Text-gray) font-primary font-bold text-sm rounded-md transition-colors uppercase tracking-wide ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-(--Select-background) cursor-pointer"}`}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`flex-1 px-4 py-2.5 bg-(--Primary) text-(--Text-dark) font-primary font-bold text-sm rounded-md transition-colors uppercase tracking-wide ${isSaving ? "opacity-50 cursor-not-allowed animate-pulse" : "hover:bg-(--Primary-selected) cursor-pointer"}`}
                    >
                        {isEditing ? "Save Changes" : "Add Item"}
                    </button>
                </div>
            </form>
        </div>
    );
}

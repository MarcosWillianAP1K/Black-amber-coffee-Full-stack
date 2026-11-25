import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { CategoryCarousel } from "ui-shared/components/CategoryCarousel";
import { SearchBar } from "ui-shared/components/ui/SearchBar";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import { useToastStore } from "shared-utils/stores/useToastStore";
import { formatPrice } from "shared-utils/helpers/currency";
import { PRODUCT_CATEGORY_LABELS, type Product, type ProductCategory } from "shared-utils/types/product";
import { ProductCard } from "../../components/ProductCard";
import { DestakCard } from "../../components/DestakCard";
import { SummaryCart } from "../../components/SummaryCart";
import { ProductDetailModal } from "../../components/ProductDetailModal";
import { useMenu } from "../../hooks/useMenu";
import { useCart } from "../../hooks/useCart";
import { APP_ROUTES } from "../../utils/Path";

const ALL_CATEGORY = "all";

export function Menu() {
    const navigate = useNavigate();
    const { products, categories, isLoading, getCategoryLabel } = useMenu();
    const { count, subtotal, discount, addItem, pendingProductIds } = useCart();
    const showToast = useToastStore((s) => s.showToast);

    const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const categoryLabels = useMemo(
        () => ["Todos", ...categories.map((c) => getCategoryLabel(c))],
        [categories, getCategoryLabel],
    );

    const activeLabel =
        selectedCategory === ALL_CATEGORY ? "Todos" : getCategoryLabel(selectedCategory);

    const filtered = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return products.filter((p) => {
            const matchesCategory =
                selectedCategory === ALL_CATEGORY || p.category === selectedCategory;
            if (!matchesCategory) return false;
            if (!query) return true;
            return (
                p.name.toLowerCase().includes(query) ||
                (p.description ?? "").toLowerCase().includes(query)
            );
        });
    }, [products, selectedCategory, searchTerm]);

    const featured = filtered[0] ?? products[0];

    const handleAddProduct = async (product: Product, qty = 1, obs = "") => {
        try {
            await addItem(product, qty, obs);
            showToast({
                variant: "success",
                title: "Adicionado ao carrinho",
                description: `${qty}x ${product.name}`,
            });
        } catch (err) {
            showToast({
                variant: "error",
                title: "Erro ao adicionar item",
                description: err instanceof Error ? err.message : undefined,
            });
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-8">
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-primary font-extrabold text-(--Text-primary) uppercase">
                        Cardápio
                    </h1>
                    <p className="text-sm font-secondary text-(--Text-primary-off) mt-1">
                        Toque em um item para personalizar observações ou adicione direto ao carrinho
                    </p>
                </div>

                <SearchBar
                    placeholder="Buscar no cardápio..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    className="w-full md:w-80 shrink-0"
                />
            </div>

            <CategoryCarousel
                categories={categoryLabels}
                activeCategory={activeLabel}
                onSelectCategory={(label) => {
                    if (label === "Todos") {
                        setSelectedCategory(ALL_CATEGORY);
                        return;
                    }
                    const match = categories.find((c) => getCategoryLabel(c) === label);
                    if (match) setSelectedCategory(match);
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
                <div className="flex flex-col gap-6 min-w-0">
                    {featured && !searchTerm.trim() && (
                        <div className="rounded-xl border border-(--Border)/60 bg-(--Widget-background) p-4 sm:p-5 flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4 items-center">
                                <DestakCard
                                    badge="Escolha do Barista"
                                    title={featured.name}
                                    description={featured.description ?? "Seleção especial da casa"}
                                    category={featured.category}
                                    imageUrl={featured.imgUrl ?? undefined}
                                    onClick={() => setSelectedProduct(featured)}
                                />

                                <div className="flex flex-col justify-between gap-4">
                                    <div>
                                        <span className="text-xs font-secondary font-semibold uppercase tracking-wider text-(--Primary)">
                                            {PRODUCT_CATEGORY_LABELS[featured.category as ProductCategory] ??
                                                featured.category}
                                        </span>
                                        <h2 className="text-xl font-primary font-extrabold text-(--Text-primary) mt-1">
                                            {featured.name}
                                        </h2>
                                        <p className="text-sm font-secondary text-(--Text-primary-off) mt-1.5 leading-relaxed">
                                            {featured.description ||
                                                "Preparado com grãos frescos na hora do seu pedido."}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-2xl font-primary font-extrabold text-(--Primary) tabular-nums">
                                            {formatPrice(featured.price)}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={Boolean(pendingProductIds[featured.id])}
                                            onClick={() => void handleAddProduct(featured)}
                                            className="min-h-11 px-4 py-2.5 rounded-lg bg-(--Primary) hover:bg-(--Primary-selected) text-(--Text-dark) font-primary font-extrabold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {pendingProductIds[featured.id] ? (
                                                <LoadingSpinner size="xs" label="Adicionando..." />
                                            ) : (
                                                "Adicionar"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center gap-2 text-(--Text-primary-off) text-sm py-6">
                            <LoadingSpinner size="sm" className="text-(--Primary)" />
                            <span>Carregando cardápio...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="rounded-xl border border-(--Border)/40 bg-(--Widget-background) p-8 text-center flex flex-col items-center gap-3">
                            <p className="text-sm font-secondary text-(--Text-primary)">
                                Nenhum item encontrado para "{searchTerm || activeLabel}".
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory(ALL_CATEGORY);
                                }}
                                className="px-4 py-2 rounded-md border border-(--Border) text-xs font-primary font-bold text-(--Primary) hover:border-(--Primary) cursor-pointer"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map((product) => (
                                <ProductCard
                                    key={product.publicId}
                                    name={product.name}
                                    category={product.category}
                                    itens={product.description ?? getCategoryLabel(product.category)}
                                    price={product.price}
                                    imageUrl={product.imgUrl ?? undefined}
                                    onSelect={() => setSelectedProduct(product)}
                                    onClick={() => void handleAddProduct(product)}
                                    isLoading={Boolean(pendingProductIds[product.id])}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Resumo lateral fixo em Desktop */}
                <aside className="hidden lg:block sticky top-4">
                    <SummaryCart
                        itemsCount={count}
                        subTotal={subtotal}
                        discount={discount}
                        ctaLabel="Ir para o Carrinho"
                        disabled={count === 0}
                        onCompletePurchase={() => navigate(APP_ROUTES.CART)}
                    />
                </aside>
            </div>

            {/* Barra compacta no Mobile quando há itens */}
            {count > 0 && (
                <div className="lg:hidden sticky bottom-2 z-30">
                    <button
                        type="button"
                        onClick={() => navigate(APP_ROUTES.CART)}
                        className="w-full min-h-12 px-4 py-3 rounded-xl bg-(--Primary) text-(--Text-dark) font-primary font-extrabold text-sm shadow-xl flex items-center justify-between cursor-pointer tabular-nums"
                    >
                        <span className="inline-flex items-center gap-2">
                            <ShoppingCart size={18} />
                            Ver Carrinho ({count} {count === 1 ? "item" : "itens"})
                        </span>
                        <span>{formatPrice(subtotal - discount)}</span>
                    </button>
                </div>
            )}

            <ProductDetailModal
                key={selectedProduct?.id ?? "closed"}
                product={selectedProduct}
                isOpen={selectedProduct !== null}
                onClose={() => setSelectedProduct(null)}
                onAdd={handleAddProduct}
                isLoading={selectedProduct ? Boolean(pendingProductIds[selectedProduct.id]) : false}
            />
        </div>
    );
}

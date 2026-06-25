import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoryCarousel } from "ui-shared/components/CategoryCarousel";
import { ProductCard } from "../../components/ProductCard";
import { DestakCard } from "../../components/DestakCard";
import { SummaryCart } from "../../components/SummaryCart";
import { useMenu } from "../../hooks/useMenu";
import { useCart } from "../../hooks/useCart";
import { APP_ROUTES } from "../../utils/Path";
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "shared-utils/types/product";

export function Menu() {
    const navigate = useNavigate();
    const { products, categories, isLoading, getCategoryLabel } = useMenu();
    const { count, subtotal, discount, addItem } = useCart();
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const categoryLabels = useMemo(
        () => categories.map((c) => getCategoryLabel(c)),
        [categories, getCategoryLabel],
    );

    const activeCategory = selectedCategory || categories[0] || "cafe";

    const filtered = useMemo(
        () => products.filter((p) => p.category === activeCategory),
        [products, activeCategory],
    );

    const featured = filtered[0] ?? products[0];

    return (
        <div className="w-full max-w-lg mx-auto gap-6 flex flex-col pb-8">
            <div className="flex flex-col gap-1">
                <p className="text-(--Primary-off) text-[10px] font-secondary uppercase tracking-widest">
                    Nosso Cardápio
                </p>
                <h1 className="text-(--Text-gray) text-2xl font-primary font-bold uppercase">Cafés Especiais</h1>
            </div>

            <CategoryCarousel
                categories={categoryLabels.length > 0 ? categoryLabels : ["Café"]}
                activeCategory={getCategoryLabel(activeCategory)}
                onSelectCategory={(label) => {
                    const match = categories.find((c) => getCategoryLabel(c) === label);
                    if (match) setSelectedCategory(match);
                }}
            />

            {featured && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-(--Primary)" />
                        <span className="text-(--Primary) text-[10px] font-secondary uppercase tracking-widest">
                            Escolha do Barista
                        </span>
                    </div>

                    <DestakCard
                        title={featured.name}
                        description={featured.description ?? "Detalhes do produto"}
                        imageUrl={featured.imgUrl ?? undefined}
                        onClick={() => addItem(featured)}
                    />

                    <div className="flex justify-between items-center px-1">
                        <div>
                            <p className="text-(--Text-gray) font-primary font-bold">{featured.name}</p>
                            <p className="text-(--Primary-off) text-xs font-secondary">
                                {PRODUCT_CATEGORY_LABELS[featured.category as ProductCategory] ?? featured.category}
                            </p>
                        </div>
                        <p className="text-(--Primary) text-lg font-bold">${featured.price.toFixed(2)}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => addItem(featured)}
                        className="w-full py-3 bg-[linear-gradient(180deg,var(--Primary-off)_0%,var(--Primary)_100%)] text-(--Text-dark) rounded-sm font-secondary font-bold text-sm tracking-wider uppercase"
                    >
                        Adicionar ao Carrinho
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {isLoading ? (
                    <p className="col-span-2 text-(--Text-primary-off) text-sm">Carregando...</p>
                ) : (
                    filtered.map((product) => (
                        <ProductCard
                            key={product.publicId}
                            name={product.name}
                            itens={product.description ?? getCategoryLabel(product.category)}
                            price={product.price}
                            imageUrl={product.imgUrl ?? undefined}
                            onClick={() => addItem(product)}
                        />
                    ))
                )}
            </div>

            {count > 0 && (
                <SummaryCart
                    itemsCount={count}
                    subTotal={subtotal}
                    discount={discount}
                    onCompletePurchase={() => navigate(APP_ROUTES.CART)}
                />
            )}
        </div>
    );
}

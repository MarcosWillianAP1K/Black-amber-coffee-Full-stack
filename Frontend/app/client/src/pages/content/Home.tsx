import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, Coffee, Flame } from "lucide-react";
import { LoadingSpinner } from "ui-shared/components/ui/LoadingSpinner";
import { useToastStore } from "shared-utils/stores/useToastStore";
import { formatPrice } from "shared-utils/helpers/currency";
import { PRODUCT_CATEGORY_LABELS, type Product, type ProductCategory } from "shared-utils/types/product";
import { ProductCard } from "../../components/ProductCard";
import { DestakCard } from "../../components/DestakCard";
import { ProductDetailModal } from "../../components/ProductDetailModal";
import { useMenu } from "../../hooks/useMenu";
import { useCart } from "../../hooks/useCart";
import { useClientOrderStore } from "../../stores/useClientOrderStore";
import { APP_ROUTES } from "../../utils/Path";

const FEATURED_STORIES = [
    {
        badge: "Edição Sazonal",
        title: "Torra Especial Black Amber",
        description: "Notas de caramelo tostado, chocolate amargo e finalização aveludada.",
        category: "cafe",
    },
    {
        badge: "Combinação do Dia",
        title: "Pausa da Tarde Artesanal",
        description: "Croissant de manteiga recém-assado acompanhado de Cappuccino cremoso.",
        category: "lanche",
    },
];

const TRACKING_STEPS = [
    { key: "criado", label: "Recebido", icon: Clock },
    { key: "em_preparo", label: "Em Preparo", icon: Flame },
    { key: "pronto", label: "Pronto", icon: CheckCircle2 },
] as const;

export function Home() {
    const navigate = useNavigate();
    const { products, isLoading } = useMenu();
    const { addItem, pendingProductIds } = useCart();
    const orders = useClientOrderStore((s) => s.orders);
    const showToast = useToastStore((s) => s.showToast);

    const [storyIndex, setStoryIndex] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const activeOrder = useMemo(
        () => orders.find((o) => o.status === "criado" || o.status === "em_preparo" || o.status === "pronto") ?? null,
        [orders],
    );

    const promotions = useMemo(() => products.slice(0, 4), [products]);
    const featured = products[0];

    const handleQuickAdd = async (product: Product, qty = 1, obs = "") => {
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
                title: "Não foi possível adicionar",
                description: err instanceof Error ? err.message : undefined,
            });
        }
    };

    const currentStepIndex = activeOrder
        ? Math.max(0, TRACKING_STEPS.findIndex((s) => s.key === activeOrder.status))
        : 0;

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-8">
            {/* Banner ao vivo de pedido em andamento */}
            {activeOrder && (
                <section className="rounded-xl border border-(--Primary)/40 bg-(--Widget-background) p-5 flex flex-col gap-4 shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base sm:text-lg font-primary font-extrabold text-(--Text-primary)">
                                Acompanhe seu Pedido {activeOrder.code || `#${activeOrder.id}`}
                            </h2>
                            <p className="text-xs sm:text-sm font-secondary text-(--Text-primary-off)">
                                {activeOrder.status === "pronto"
                                    ? "Seu pedido está pronto para retirada no balcão."
                                    : activeOrder.status === "em_preparo"
                                      ? "Nossos baristas estão preparando seus itens."
                                      : "Recebemos seu pedido e ele já entrou na fila."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate(APP_ROUTES.ACCOUNT)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-(--Border) text-xs font-primary font-bold text-(--Primary) hover:border-(--Primary) cursor-pointer transition-colors"
                        >
                            Ver detalhes
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {TRACKING_STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            const isDone = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            return (
                                <div
                                    key={step.key}
                                    className={`rounded-lg border px-3 py-2.5 flex items-center gap-2 transition-colors ${
                                        isCurrent
                                            ? "border-(--Primary) bg-(--Primary)/10 text-(--Primary)"
                                            : isDone
                                              ? "border-(--Afirmation)/40 bg-(--Afirmation)/10 text-(--Success-text)"
                                              : "border-(--Border)/40 bg-(--Page-background) text-(--Text-primary-off)/60"
                                    }`}
                                >
                                    <Icon size={16} className="shrink-0" aria-hidden="true" />
                                    <span className="text-xs sm:text-sm font-primary font-bold truncate">
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Hero & Destaques em Grid Responsivo */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 rounded-xl border border-(--Border)/60 bg-(--Widget-background) p-6 sm:p-8 flex flex-col justify-between gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-xl bg-(--Primary)/15 border border-(--Primary)/30 flex items-center justify-center text-(--Primary)">
                            <Coffee size={24} aria-hidden="true" />
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-primary font-extrabold text-(--Text-primary) leading-tight tracking-tight">
                            BLACK AMBER COFFEE
                        </h1>
                        <p className="text-sm sm:text-base font-secondary text-(--Text-primary-off) leading-relaxed max-w-prose">
                            No coração da cidade, a Black Amber nasceu da paixão por cafés especiais e
                            experiências autênticas. Cada xícara é extraída na hora com grãos
                            selecionados para acompanhar o seu ritmo.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(APP_ROUTES.MENU)}
                            className="min-h-11 px-5 py-2.5 rounded-lg bg-(--Primary) hover:bg-(--Primary-selected) text-(--Text-dark) font-primary font-extrabold text-sm uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-colors"
                        >
                            Explorar Cardápio
                            <ArrowRight size={16} />
                        </button>

                        {featured && (
                            <button
                                type="button"
                                disabled={Boolean(pendingProductIds[featured.id])}
                                onClick={() => void handleQuickAdd(featured)}
                                className="min-h-11 px-4 py-2.5 rounded-lg border border-(--Border) hover:border-(--Primary) text-(--Text-primary) text-sm font-secondary font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60 transition-colors tabular-nums"
                            >
                                {pendingProductIds[featured.id] ? (
                                    <LoadingSpinner size="xs" label={`Adicionando ${featured.name}...`} />
                                ) : (
                                    `Pedir rápido: ${featured.name} (${formatPrice(featured.price)})`
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-3">
                    <DestakCard
                        badge={FEATURED_STORIES[storyIndex]?.badge}
                        title={FEATURED_STORIES[storyIndex]?.title ?? "Black Amber Coffee"}
                        description={FEATURED_STORIES[storyIndex]?.description ?? ""}
                        category={FEATURED_STORIES[storyIndex]?.category}
                        onClick={() => setStoryIndex((prev) => (prev + 1) % FEATURED_STORIES.length)}
                    />
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-secondary text-(--Text-primary-off)">
                            Toque no card para alternar destaque
                        </span>
                        <div className="flex gap-2">
                            {FEATURED_STORIES.map((story, idx) => (
                                <button
                                    key={story.title}
                                    type="button"
                                    onClick={() => setStoryIndex(idx)}
                                    className={`h-2 rounded-full transition-all cursor-pointer ${
                                        idx === storyIndex
                                            ? "w-6 bg-(--Primary)"
                                            : "w-2 bg-(--Button-background)"
                                    }`}
                                    aria-label={`Ver destaque ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Produtos em Destaque */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg sm:text-xl font-primary font-extrabold text-(--Text-primary)">
                        Sugestões do Dia
                    </h2>
                    <button
                        type="button"
                        onClick={() => navigate(APP_ROUTES.MENU)}
                        className="text-xs sm:text-sm font-secondary font-semibold text-(--Primary) hover:text-(--Primary-selected) inline-flex items-center gap-1 cursor-pointer"
                    >
                        Ver cardápio completo
                        <ArrowRight size={14} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center gap-2 text-(--Text-primary-off) text-sm font-secondary py-6">
                        <LoadingSpinner size="sm" className="text-(--Primary)" />
                        <span>Carregando sugestões...</span>
                    </div>
                ) : (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {promotions.map((product) => (
                            <ProductCard
                                key={product.publicId}
                                name={product.name}
                                category={product.category}
                                itens={
                                    product.description ??
                                    PRODUCT_CATEGORY_LABELS[product.category as ProductCategory] ??
                                    product.category
                                }
                                price={product.price}
                                imageUrl={product.imgUrl ?? undefined}
                                onSelect={() => setSelectedProduct(product)}
                                onClick={() => void handleQuickAdd(product)}
                                isLoading={Boolean(pendingProductIds[product.id])}
                            />
                        ))}
                    </div>
                )}
            </section>

            <ProductDetailModal
                key={selectedProduct?.id ?? "closed"}
                product={selectedProduct}
                isOpen={selectedProduct !== null}
                onClose={() => setSelectedProduct(null)}
                onAdd={(p, qty, obs) => handleQuickAdd(p, qty, obs)}
                isLoading={selectedProduct ? Boolean(pendingProductIds[selectedProduct.id]) : false}
            />
        </div>
    );
}

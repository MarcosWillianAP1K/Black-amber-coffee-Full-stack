import { useMemo, useState } from "react";
import { ProductCard } from "../../components/ProductCard";
import { DestakCard } from "../../components/DestakCard";
import { useMenu } from "../../hooks/useMenu";
import { useCart } from "../../hooks/useCart";
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "shared-utils/types/product";

const NEWS_ITEMS = [
    {
        title: "Title Notice",
        description: "Amber Espresso — nova edição limitada.",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-09f9f0b91ece?w=600&q=80",
    },
    {
        title: "Promoção de Verão",
        description: "Smoothies com 20% off esta semana.",
        imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
    },
];

export function Home() {
    const { products, isLoading } = useMenu();
    const { addItem } = useCart();
    const [newsIndex, setNewsIndex] = useState(0);

    const promotions = useMemo(() => products.slice(0, 4), [products]);
    const featured = products[0];

    return (
        <div className="w-full max-w-lg mx-auto gap-8 flex flex-col pb-8">
            {/* Hero */}
            <section className="flex flex-col items-center gap-3 pt-2">
                <p className="text-(--Primary) text-xs font-secondary uppercase tracking-widest">Bem-vindo</p>
                <div className="w-20 h-20 rounded-full bg-(--Widget-background) border border-(--Border) flex items-center justify-center text-4xl">
                    ☕
                </div>
                <h1 className="text-(--Primary) text-2xl font-primary font-bold tracking-wide text-center">
                    BLACK AMBER COFFE
                </h1>
            </section>

            {/* About */}
            <section className="flex flex-col gap-2">
                <h2 className="text-(--Primary) text-sm font-primary font-bold border-b border-(--Border) pb-1 w-fit">
                    Sobre Nós
                </h2>
                <p className="text-(--Text-gray) text-xs font-secondary leading-relaxed">
                    No coração da cidade, a Black Amber nasceu da paixão por cafés especiais e experiências
                    autênticas. Cada xícara é preparada com grãos selecionados e o cuidado de quem entende
                    que café é ritual, encontro e arte.
                </p>
            </section>

            {/* Last News */}
            <section className="flex flex-col gap-4">
                <p className="text-(--Primary) text-xs font-secondary uppercase tracking-widest">Novidades</p>
                <h2 className="text-(--Text-gray) text-xl font-primary font-bold uppercase">Últimas Notícias</h2>

                <DestakCard
                    title={NEWS_ITEMS[newsIndex]?.title ?? "News"}
                    description={NEWS_ITEMS[newsIndex]?.description ?? ""}
                    imageUrl={NEWS_ITEMS[newsIndex]?.imageUrl}
                    onClick={() => setNewsIndex((prev) => (prev + 1) % NEWS_ITEMS.length)}
                />

                <div className="flex justify-center gap-2">
                    {NEWS_ITEMS.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setNewsIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                idx === newsIndex ? "bg-(--Primary)" : "bg-(--Button-background)"
                            }`}
                            aria-label={`Notícia ${idx + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* Daily Promotions */}
            <section className="flex flex-col gap-4">
                <h2 className="text-(--Text-gray) text-lg font-primary font-bold">Promoções do Dia</h2>

                {isLoading ? (
                    <p className="text-(--Text-primary-off) text-sm font-secondary">Carregando...</p>
                ) : (
                    <div className="w-full grid grid-cols-2 gap-4">
                        {promotions.map((product) => (
                            <ProductCard
                                key={product.publicId}
                                name={product.name}
                                itens={product.description ?? PRODUCT_CATEGORY_LABELS[product.category as ProductCategory] ?? product.category}
                                price={product.price}
                                imageUrl={product.imgUrl ?? undefined}
                                onClick={() => addItem(product)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {featured && (
                <button
                    type="button"
                    onClick={() => addItem(featured)}
                    className="w-full py-3 bg-[linear-gradient(180deg,var(--Primary-off)_0%,var(--Primary)_100%)] text-(--Text-dark) rounded-sm font-secondary font-bold text-sm tracking-wider uppercase"
                >
                    Adicionar rápido — {featured.name}
                </button>
            )}
        </div>
    );
}

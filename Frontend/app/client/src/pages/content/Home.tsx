import { useState } from "react";
import { ProductCard } from "../../components/ProductCard";
import { DestakCard } from "../../components/DestakCard";
import { ProductCart } from "../../components/ProductCart";
import { CategoryCarousel } from "ui-shared/components/CategoryCarousel";
import { SummaryCart } from "../../components/SummaryCart";

export function Home() {

    const categories = ["Cafés", "Chás", "Doces", "Salgados", "Bebidas"];

    const [selectedCategory, setSelectedCategory] = useState("Cafés");

    return (
        <div className="w-full h-fit gap-4 flex flex-col items-center justify-center">

            <div className="w-full">

                <CategoryCarousel
                    categories={categories}
                    activeCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

            </div>

            <DestakCard
                title="Café Expresso"
                description="Item mais pedido."
                imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmJTIwZXhwcmVzc298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
                onClick={() => alert("Produto adicionado ao carrinho!")}
            />

            <div className="w-full h-fit gap-4 flex flex-wrap items-center justify-center">

                <ProductCard
                    name="Café Expresso"
                    itens="Grãos selecionados, torra média, sabor intenso e aroma marcante."
                    price={9.99}
                    promotionPrice={7.99}
                    imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmJTIwZXhwcmVzc298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
                    onClick={() => alert("Produto adicionado ao carrinho!")}
                />

                <ProductCard
                    name="Café Expresso"
                    itens="Grãos selecionados, torra média, sabor intenso e aroma marcante."
                    price={9.99}
                    promotionPrice={7.99}
                    imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmJTIwZXhwcmVzc298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
                    onClick={() => alert("Produto adicionado ao carrinho!")}
                />

                <ProductCard
                    name="Café Expresso"
                    itens="Grãos selecionados, torra média, sabor intenso e aroma marcante."
                    price={9.99}
                    promotionPrice={7.99}
                    imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmJTIwZXhwcmVzc298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
                    onClick={() => alert("Produto adicionado ao carrinho!")}
                />



            </div>

            <div className="w-full h-fit gap-4 flex flex-col items-center justify-center">

                <ProductCart
                    name="Café Expresso"
                    price={9.99}
                    imageUrl="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmJTIwZXhwcmVzc298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
                    quantity={2}
                    onAdd={() => alert("Produto adicionado ao carrinho!")}
                    onRemove={() => alert("Produto removido do carrinho!")}
                />

            </div>

            <SummaryCart
                itemsCount={2}
                subTotal={13.50}
                discount={5.00}
                onCompletePurchase={() => alert('Comprado!')}
            />


        </div >
    );

}
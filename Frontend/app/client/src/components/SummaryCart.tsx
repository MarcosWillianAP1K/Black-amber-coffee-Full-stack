
interface SummaryCartProps {
  itemsCount: number;
  subTotal: number;
  discount: number;
  onCompletePurchase: () => void;
}

export function SummaryCart({
  itemsCount,
  subTotal,
  discount,
  onCompletePurchase
}: SummaryCartProps) {
  const total = subTotal - discount;

  // Função auxiliar para formatar a moeda: símbolo em fonte secundária, números em fonte primária
  const formatCurrency = (value: number, isNegative = false) => {
    const formattedValue = Math.abs(value).toFixed(2);
    return (
      <span className="flex items-center">
        <span className="font-secondary">{isNegative ? '-$' : '$'}</span>
        <span className="font-primary ml-0.5">{formattedValue}</span>
      </span>
    );
  };

  return (
    <div className="w-full bg-(--Widget-background) rounded-md p-6 flex flex-col gap-6 border border-(--Border)/30 shadow-lg">
      
      {/* HEADER */}
      <div className="flex justify-between items-center uppercase text-xs font-bold tracking-widest mt-2">
        <span className="text-(--Text-primary-off) font-secondary">Your Order</span>
        <div className="text-(--Primary-off) flex items-center gap-1">
          <span className="font-primary text-sm">{itemsCount}</span>
          <span className="font-secondary">Items</span>
        </div>
      </div>

      {/* ITEMS */}
      <div className="flex flex-col gap-5 mt-2">
        {/* Sub Total */}
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-(--Text-gray) font-secondary">Sub Total</span>
          <span className="text-(--Primary-off) text-base">
            {formatCurrency(subTotal)}
          </span>
        </div>

        {/* Discount */}
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-(--Text-gray) font-secondary">Discount</span>
          <span className="text-(--Negacion) text-base">
            {formatCurrency(discount, discount > 0)}
          </span>
        </div>
      </div>

      {/* TOTAL */}
      <div className="flex justify-between items-center mt-2 mb-2">
        <span className="text-(--Text-gray) font-secondary text-xl font-bold">Total</span>
        <span className="text-(--Primary-off) text-2xl font-bold">
          {formatCurrency(total)}
        </span>
      </div>

      {/* BUTTON */}
      <button
        onClick={onCompletePurchase}
        className="w-full py-3.5 bg-[linear-gradient(180deg,var(--Primary-off)_0%,var(--Primary)_100%)] text-(--Text-dark) rounded-sm font-secondary font-bold text-sm tracking-wider uppercase cursor-pointer hover:brightness-110 transition-all shadow-md text-center flex items-center justify-center"
      >
        Complete Purchase
      </button>

    </div>
  );
}

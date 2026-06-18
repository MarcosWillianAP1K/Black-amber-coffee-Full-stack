import { useDragScroll } from '../../utils/hooks/useDragScroll';

interface CategoryCarouselProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryCarousel({ categories, activeCategory, onSelectCategory }: CategoryCarouselProps) {
  const { ref, isDragging, events } = useDragScroll<HTMLDivElement>();

  return (
    <div
      ref={ref}
      {...events}
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
      className={`
        carousel-container
        flex gap-3 overflow-x-auto px-4 py-2 
        [&::-webkit-scrollbar]:hidden
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
    >
      <style>{`
        .carousel-container::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>
      {categories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-
              semibold uppercase 
              transition-all duration-300 ease-in-out cursor-pointer
              ${isActive
                ? 'bg-(--Primary) text-(--Text-dark)' // Active state (Yellow)
                : 'bg-(--Button-background) text-(--Text-primary-off) hover:brightness-110' // Inactive state (Dark Gray)
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
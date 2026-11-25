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
        flex gap-2.5 overflow-x-auto py-1
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
            type="button"
            onClick={() => onSelectCategory(category)}
            className={`
              whitespace-nowrap min-h-9 px-4 py-2 rounded-lg text-xs font-secondary
              font-semibold uppercase tracking-wide
              transition-all duration-200 cursor-pointer shrink-0
              ${isActive
                ? 'bg-(--Primary) text-(--Text-dark) shadow-sm'
                : 'bg-(--Button-background) text-(--Text-primary-off) hover:text-(--Text-primary) hover:bg-(--Select-background)'
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
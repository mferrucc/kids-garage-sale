import React from 'react';
import { Category, Product } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  products: Product[];
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  products,
}) => {
  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return products.filter((p) => p.stock > 0).length;
    return products.filter((p) => p.category === catId && p.stock > 0).length;
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* 'Todos' Option */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-[#1c1917] text-white border-[#1c1917] shadow-clean'
              : 'bg-white text-[#57534e] border-[#e7e5e0] hover:text-[#1c1917] hover:border-[#d6d3cb]'
          }`}
        >
          <span>Todos</span>
          <span className="ml-1.5 opacity-65 text-xs tabular-nums">({getCategoryCount('all')})</span>
        </button>

        {/* Dynamic categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer border flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#1c1917] text-white border-[#1c1917] shadow-clean'
                  : 'bg-white text-[#57534e] border-[#e7e5e0] hover:text-[#1c1917] hover:border-[#d6d3cb]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span className="opacity-65 text-xs tabular-nums">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

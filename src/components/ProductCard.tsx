import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isSaved: boolean;
  onToggleSave: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickCheckout?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSaved,
  onToggleSave,
  onSelectProduct,
  onQuickCheckout,
}) => {
  const [imageError, setImageError] = useState(false);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-[#e7e5e0] hover:border-[#d6d3cb] shadow-clean hover:shadow-card transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Product Image Slot */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#f5f4f0]">
        {!imageError && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#f5f4f0] text-[#78716c]">
            <span className="text-3xl mb-1">🧸</span>
            <span className="text-xs font-medium">{product.title}</span>
          </div>
        )}

        {/* Favorite Button (top right) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(product.id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isSaved
              ? 'bg-[#1c1917] text-white shadow-clean'
              : 'bg-white/90 backdrop-blur-xs text-[#78716c] hover:text-[#1c1917] hover:bg-white shadow-clean'
          }`}
          title={isSaved ? 'Quitar de guardados' : 'Guardar juguete'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        {/* Sold / Reserved Scrim */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#1c1917]/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white text-[#1c1917] text-xs font-semibold px-3 py-1 rounded-lg shadow-clean">
              Reservado / Ya vendido
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Unboxed Metadata: Child owner & Condition */}
          <div className="flex items-center gap-1.5 text-xs text-[#78716c]">
            <span>De {product.seller.kidName}</span>
            <span aria-hidden="true">·</span>
            <span>Edad {product.ageRange}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#c26d24] font-medium">{product.condition}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-display font-semibold text-[#1c1917] text-base leading-snug line-clamp-2 group-hover:text-[#c26d24] transition-colors">
            {product.title}
          </h3>

          {/* Quiet pickup detail */}
          <p className="text-xs text-[#78716c] line-clamp-1">
            Recogida en garaje · {product.pickupSlots[0]?.split(':')[0] || 'Fin de semana'}
          </p>
        </div>

        {/* Price & Action Module */}
        <div className="pt-3 border-t border-[#f5f4f0] flex items-baseline justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-xl text-[#1c1917] tabular-nums">
                ${product.price}
              </span>
              <span className="text-xs text-[#78716c] line-through tabular-nums">
                ${product.originalPrice}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-[#c26d24] font-medium tabular-nums">
                  -{discountPercent}%
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#78716c] block">
              {product.stock > 0 ? 'Disponible para recoger' : 'Agotado'}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickCheckout && !isOutOfStock) {
                onQuickCheckout(product);
              } else {
                onSelectProduct(product);
              }
            }}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isOutOfStock
                ? 'bg-[#f5f4f0] text-[#78716c] cursor-not-allowed'
                : 'bg-[#fef7ee] hover:bg-[#c26d24] text-[#c26d24] hover:text-white border border-[#f3d4b6]'
            }`}
          >
            {isOutOfStock ? 'Reservado' : 'Reservar'}
          </button>
        </div>
      </div>
    </div>
  );
};

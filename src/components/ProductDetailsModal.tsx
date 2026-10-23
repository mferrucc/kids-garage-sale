import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Heart,
  Home,
  Info,
  MapPin,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (productId: string) => void;
  onProceedToCheckout: (product: Product, selectedSlot: string) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  isSaved,
  onToggleSave,
  onProceedToCheckout,
}) => {
  if (!product) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedPickupSlot, setSelectedPickupSlot] = useState(
    product.pickupSlots[0] || 'Sábado: 10:00 AM - 1:00 PM'
  );
  const [copiedAddress, setCopiedAddress] = useState(false);

  const discountAmount = product.originalPrice - product.price;
  const discountPercent = Math.round((discountAmount / product.originalPrice) * 100);
  const isOutOfStock = product.stock <= 0;

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(product.seller.pickupAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1c1917]/40 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-pop border border-[#e7e5e0] flex flex-col relative my-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#e7e5e0] flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-semibold text-[#57534e] hover:text-[#1c1917] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la venta de garaje</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(product.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isSaved
                  ? 'bg-[#1c1917] text-white border-[#1c1917]'
                  : 'bg-white text-[#57534e] border-[#e7e5e0] hover:text-[#1c1917]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
              <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f5f4f0] hover:bg-[#e7e5e0] flex items-center justify-center text-[#57534e] hover:text-[#1c1917] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Main Grid: Gallery & Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Gallery */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#f5f4f0] border border-[#e7e5e0]">
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-[#1c1917]/60 flex items-center justify-center">
                    <span className="bg-white text-[#1c1917] font-semibold text-xs px-3 py-1 rounded-md">
                      Reservado / Vendido
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIdx === i
                          ? 'border-[#c26d24]'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Family Garage Hygiene & Care Note */}
              <div className="p-3.5 bg-[#fcfbf9] rounded-xl border border-[#e7e5e0] text-xs text-[#57534e] space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-[#1c1917]">
                  <Home className="w-3.5 h-3.5 text-[#c26d24]" />
                  <span>Cuidado en casa familiar</span>
                </div>
                <p className="text-[#78716c]">
                  Hogar libre de humos y mascotas. Limpiado y revisado pieza por pieza antes de ponerlo en el garaje.
                </p>
              </div>
            </div>

            {/* Right: Info */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#78716c] mb-1.5">
                  <span>Pertenecía a {product.seller.kidName}</span>
                  <span aria-hidden="true">·</span>
                  <span>Edad recomendada: {product.ageRange}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#c26d24] font-medium">{product.condition}</span>
                </div>
                <h1 className="font-display text-2xl font-bold text-[#1c1917] leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Price Row */}
              <div className="p-4 bg-[#fcfbf9] rounded-2xl border border-[#e7e5e0] flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-bold text-3xl text-[#1c1917] tabular-nums">
                      ${product.price}
                    </span>
                    <span className="text-sm text-[#78716c] line-through tabular-nums">
                      ${product.originalPrice} nuevo
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-xs font-semibold text-[#c26d24] tabular-nums">
                        Ahorras ${discountAmount} (-{discountPercent}%)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#78716c] mt-1">
                    Precio especial de garaje para darle una segunda vida.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Recogida sin costo
                  </span>
                </div>
              </div>

              {/* Description & Story */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78716c] mb-2">
                  Cómo lo disfrutamos en casa
                </h3>
                <p className="text-sm text-[#57534e] leading-relaxed bg-[#fcfbf9] p-4 rounded-xl border border-[#e7e5e0]">
                  {product.description}
                </p>
              </div>

              {/* Pickup location */}
              <div className="p-4 bg-white rounded-xl border border-[#e7e5e0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1c1917] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#c26d24]" />
                    <span>Dirección de nuestro Garaje</span>
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="text-xs text-[#c26d24] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedAddress ? '¡Copiada!' : 'Copiar dirección'}</span>
                  </button>
                </div>
                <div className="text-xs text-[#57534e]">
                  <p className="font-medium text-[#1c1917]">{product.seller.pickupAddress}</p>
                  <p className="text-[#78716c] mt-0.5">"{product.seller.pickupNote}"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="border-t border-[#e7e5e0] pt-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78716c]">
              Detalles del juguete
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(product.specifications).map(([key, value]) => {
                const labelMap: Record<string, string> = {
                  brand: 'Marca',
                  material: 'Material',
                  dimensions: 'Medidas',
                  batteriesRequired: 'Pilas / Baterías',
                  cleanStatus: 'Limpieza',
                  piecesCount: 'Piezas incluidas',
                  safetyStandard: 'Certificación',
                };
                return (
                  <div key={key} className="p-3 bg-[#fcfbf9] rounded-xl border border-[#e7e5e0]">
                    <span className="text-[11px] text-[#78716c] block">
                      {labelMap[key] || key}
                    </span>
                    <span className="text-xs font-medium text-[#1c1917] mt-0.5 block">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pickup Window Selection */}
          <div className="border-t border-[#e7e5e0] pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                Elige cuándo pasas a buscarlo por nuestro garaje
              </h3>
              <span className="text-xs text-[#78716c]">Horarios de garaje abierto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.pickupSlots.map((slot) => {
                const isSelected = selectedPickupSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedPickupSlot(slot)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1917] text-white border-[#1c1917] shadow-clean'
                        : 'bg-white text-[#57534e] border-[#e7e5e0] hover:border-[#d6d3cb]'
                    }`}
                  >
                    <div className="text-xs font-semibold">
                      {slot.split(':')[0]}
                    </div>
                    <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#78716c]'}`}>
                      {slot.includes(':') ? slot.substring(slot.indexOf(':') + 1) : slot}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Sticky Action */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-4 sm:p-6 border-t border-[#e7e5e0] flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-[#78716c] block">Importe a pagar:</span>
            <span className="font-display font-bold text-2xl text-[#1c1917] tabular-nums">
              ${product.price}.00
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-[#78716c] hover:text-[#1c1917] cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onProceedToCheckout(product, selectedPickupSlot)}
              className={`px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-clean cursor-pointer ${
                isOutOfStock
                  ? 'bg-[#f5f4f0] text-[#78716c] cursor-not-allowed'
                  : 'bg-[#c26d24] hover:bg-[#a85817] text-white'
              }`}
            >
              {isOutOfStock ? 'Ya reservado' : 'Reservar para Recoger'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Bookmark,
  Calendar,
  Clock,
  Home,
  MapPin,
  Package,
  QrCode,
  Trash2,
} from 'lucide-react';
import { Order, Product, UserProfile } from '../types';
import { GARAGE_SALE_INFO } from '../data/mockData';
import { toggleSaveProduct } from '../services/storageService';

interface UserProfileSectionProps {
  userProfile: UserProfile;
  orders: Order[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onRefreshData: () => void;
}

export const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  userProfile,
  orders,
  products,
  onSelectProduct,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'pickups' | 'saved'>('pickups');

  const savedProducts = products.filter((p) =>
    userProfile.savedProductIds.includes(p.id)
  );

  const handleRemoveSaved = (productId: string) => {
    toggleSaveProduct(productId);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="p-6 bg-white rounded-3xl border border-[#e7e5e0] shadow-clean flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-[#1c1917]">
            Tus Reservas en la Venta de Garaje
          </h2>
          <p className="text-xs text-[#78716c] mt-0.5">
            Consulta los juguetes apartados y el pase digital para retirar en {GARAGE_SALE_INFO.garageAddress}.
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#f5f4f0] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('pickups')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pickups'
                ? 'bg-white text-[#1c1917] shadow-clean'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Mis Juguetes Reservados ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white text-[#1c1917] shadow-clean'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Guardados ({savedProducts.length})</span>
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'pickups' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-10 bg-white rounded-2xl border border-[#e7e5e0] text-center text-xs text-[#78716c] space-y-2">
              <span className="text-3xl block">📦</span>
              <p className="font-medium text-[#1c1917]">Aún no tienes ningún juguete reservado</p>
              <p>Revisa el catálogo para apartar juguetes cuidados antes de que se agoten.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-5 sm:p-6 bg-white rounded-2xl border border-[#e7e5e0] shadow-clean space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#f5f4f0] pb-3">
                  <div>
                    <span className="text-[11px] text-[#78716c] block">Pase de Recogida en Garaje</span>
                    <strong className="text-base text-[#1c1917]">Pase #{order.orderNumber}</strong>
                  </div>
                  <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {order.paymentStatus === 'paid' ? 'Pagado Online' : 'Pagar al Recoger'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-9 flex gap-4 items-center">
                    {order.productImage && (
                      <img
                        src={order.productImage}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover border border-[#e7e5e0] shrink-0"
                      />
                    )}
                    <div className="space-y-1 text-xs text-[#57534e]">
                      <h4 className="font-semibold text-sm text-[#1c1917]">{order.productTitle}</h4>
                      <p className="flex items-center gap-1.5 text-[#1c1917]">
                        <Home className="w-3.5 h-3.5 text-[#c26d24]" />
                        <span>{order.pickupAddress}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-[#78716c]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{order.pickupSlot}</span>
                      </p>
                      <p className="text-[#78716c]">
                        Juguete de {order.sellerKidName} · Anfitriona: {order.sellerGuardianName}
                      </p>
                    </div>
                  </div>

                  {/* QR code */}
                  <div className="md:col-span-3 bg-[#fcfbf9] p-3 rounded-xl border border-[#e7e5e0] flex flex-col items-center justify-center text-center">
                    <QrCode className="w-16 h-16 text-[#1c1917]" />
                    <span className="text-[9px] font-mono text-[#78716c] mt-1">
                      {order.orderNumber}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#fcfbf9] rounded-xl border border-[#e7e5e0] text-xs text-[#78716c]">
                  <span className="font-medium text-[#1c1917] block mb-0.5">Indicación para la recogida:</span>
                  <p>"{order.pickupNotes}"</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Saved Tab */}
      {activeTab === 'saved' && (
        <div>
          {savedProducts.length === 0 ? (
            <div className="p-10 bg-white rounded-2xl border border-[#e7e5e0] text-center text-xs text-[#78716c]">
              No tienes juguetes guardados en favoritos.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="p-4 bg-white rounded-2xl border border-[#e7e5e0] hover:border-[#d6d3cb] shadow-clean transition-all cursor-pointer flex gap-3 relative group"
                >
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover bg-[#f5f4f0] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-[#78716c] block">
                      De {p.seller.kidName}
                    </span>
                    <h4 className="font-medium text-xs sm:text-sm text-[#1c1917] truncate">
                      {p.title}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-sm text-[#1c1917] tabular-nums">${p.price}</span>
                      <span className="text-xs text-[#78716c] line-through tabular-nums">${p.originalPrice}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSaved(p.id);
                    }}
                    className="w-7 h-7 rounded-full bg-[#f5f4f0] hover:bg-red-50 text-[#78716c] hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Quitar de guardados"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

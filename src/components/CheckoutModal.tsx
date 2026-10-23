import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Heart,
  Home,
  Lock,
  MapPin,
  QrCode,
  X,
} from 'lucide-react';
import { Order, Product, UserProfile } from '../types';
import { createOrder } from '../services/storageService';

interface CheckoutModalProps {
  product: Product;
  selectedPickupSlot: string;
  userProfile: UserProfile;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onViewOrders: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  selectedPickupSlot,
  userProfile,
  onClose,
  onOrderSuccess,
  onViewOrders,
}) => {
  const [pickupSlot, setPickupSlot] = useState(selectedPickupSlot);
  const [buyerName, setBuyerName] = useState(userProfile.name || 'Vecino / Amigo');
  const [buyerPhone, setBuyerPhone] = useState(userProfile.phone || '(555) 431-9022');
  const [buyerEmail, setBuyerEmail] = useState(userProfile.email || 'vecino@gmail.com');
  const [specialNote, setSpecialNote] = useState('Paso el sábado por la mañana.');
  const [paymentMethod, setPaymentMethod] = useState<'porch_cash' | 'card'>('porch_cash');

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('982');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    await new Promise((res) => setTimeout(res, 800));

    const newOrder = createOrder({
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0] || '',
      price: product.price,
      quantity: 1,
      totalAmount: product.price,
      buyerName,
      buyerEmail,
      buyerPhone,
      pickupSlot,
      pickupAddress: product.seller.pickupAddress,
      sellerKidName: product.seller.kidName,
      sellerGuardianName: product.seller.guardianName,
      pickupNotes: product.seller.pickupNote,
      specialInstructions: specialNote,
      paymentMethod,
      paymentStatus: paymentMethod === 'porch_cash' ? 'pay_on_pickup' : 'paid',
      pickupStatus: 'scheduled',
    });

    setIsProcessing(false);
    setCompletedOrder(newOrder);
    onOrderSuccess(newOrder);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c26d24', '#1c1917', '#e7e5e0'],
      });
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1c1917]/40 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-pop border border-[#e7e5e0] flex flex-col relative my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e7e5e0] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <h2 className="font-display font-semibold text-lg text-[#1c1917]">
              {completedOrder ? '¡Reserva Confirmada!' : 'Reservar para Recoger en Garaje'}
            </h2>
            <p className="text-xs text-[#78716c]">
              {completedOrder
                ? 'Te esperamos en Calle Los Cerezos 742'
                : 'Apartamos el juguete para ti de inmediato'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5f4f0] hover:bg-[#e7e5e0] flex items-center justify-center text-[#57534e] hover:text-[#1c1917] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!completedOrder ? (
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {/* Product Preview */}
              <div className="p-4 bg-[#fcfbf9] rounded-2xl border border-[#e7e5e0] flex items-center gap-4">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-16 h-16 rounded-xl object-cover border border-[#e7e5e0] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-[#78716c]">
                    Juguete de {product.seller.kidName}
                  </div>
                  <h3 className="font-medium text-sm text-[#1c1917] truncate">
                    {product.title}
                  </h3>
                  <div className="text-sm font-semibold text-[#1c1917] mt-0.5 tabular-nums">
                    ${product.price}.00
                  </div>
                </div>
              </div>

              {/* Pickup Address & Window */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                  Punto de Encuentro
                </h4>

                <div className="p-3 bg-[#fcfbf9] rounded-xl border border-[#e7e5e0] text-xs space-y-1">
                  <div className="font-medium text-[#1c1917] flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#c26d24]" />
                    <span>{product.seller.pickupAddress}</span>
                  </div>
                  <p className="text-[#78716c]">Anfitriona: {product.seller.guardianName} · {product.seller.cityArea}</p>
                </div>

                <div>
                  <label className="block text-xs text-[#57534e] mb-1">
                    ¿Cuándo pasas a recogerlo?
                  </label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917] cursor-pointer"
                  >
                    {product.pickupSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buyer Contact */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                  Tus Datos de Contacto
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#78716c] mb-1">Tu nombre</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Ej. María o Carlos"
                      className="w-full text-xs bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#78716c] mb-1">Teléfono móvil</label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full text-xs bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#78716c] mb-1">Nota o mensaje (opcional)</label>
                  <input
                    type="text"
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    placeholder="Ej. Avisaré 10 minutos antes de llegar en auto"
                    className="w-full text-xs bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                  Forma de Pago
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('porch_cash')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'porch_cash'
                        ? 'border-[#1c1917] bg-[#fcfbf9] text-[#1c1917]'
                        : 'border-[#e7e5e0] bg-white text-[#57534e] hover:border-[#d6d3cb]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <DollarSign className="w-3.5 h-3.5 text-[#c26d24]" />
                      <span>Efectivo en mano</span>
                    </div>
                    <span className="text-[11px] text-[#78716c] block mt-0.5">Pagar al retirar en el garaje</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#1c1917] bg-[#fcfbf9] text-[#1c1917]'
                        : 'border-[#e7e5e0] bg-white text-[#57534e] hover:border-[#d6d3cb]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <CreditCard className="w-3.5 h-3.5 text-[#c26d24]" />
                      <span>Tarjeta online</span>
                    </div>
                    <span className="text-[11px] text-[#78716c] block mt-0.5">Dejarlo pagado ahora</span>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="p-3 bg-[#fcfbf9] rounded-xl border border-[#e7e5e0] space-y-2">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Número de tarjeta"
                      className="w-full text-xs font-mono bg-white border border-[#e7e5e0] rounded-lg px-3 py-1.5"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="text-xs font-mono bg-white border border-[#e7e5e0] rounded-lg px-3 py-1.5"
                      />
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        className="text-xs font-mono bg-white border border-[#e7e5e0] rounded-lg px-3 py-1.5"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Total Summary */}
              <div className="p-4 bg-[#fcfbf9] rounded-xl border border-[#e7e5e0] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#78716c] block">Importe total:</span>
                  <span className="font-display font-bold text-xl text-[#1c1917] tabular-nums">
                    ${product.price}.00
                  </span>
                </div>
                <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Sin gastos de envío
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-[#c26d24] hover:bg-[#a85817] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-clean flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Apartando juguete...</span>
                  </>
                ) : (
                  <span>
                    {paymentMethod === 'porch_cash'
                      ? `Confirmar Reserva (Pagar $${product.price} al recoger)`
                      : `Pagar $${product.price}.00 y Confirmar Reserva`}
                  </span>
                )}
              </button>
            </form>
          ) : (
            /* Digital Pass Result */
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-[#1c1917]">
                  ¡Juguete reservado para ti!
                </h3>
                <p className="text-xs text-[#78716c] mt-1">
                  Ya hemos apartado este juguete en nuestro garaje para que no lo compre nadie más.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="bg-[#fcfbf9] border border-[#e7e5e0] rounded-2xl p-5 text-left space-y-4">
                <div className="flex items-center justify-between border-b border-[#e7e5e0] pb-3">
                  <div>
                    <span className="text-[11px] text-[#78716c] block">Pase de Recogida en Garaje</span>
                    <span className="font-display font-bold text-base text-[#1c1917]">
                      #{completedOrder.orderNumber}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {completedOrder.paymentStatus === 'paid' ? 'Pagado' : 'Pago al Recoger'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1.5 text-xs text-[#57534e]">
                    <p className="font-semibold text-sm text-[#1c1917]">{completedOrder.productTitle}</p>
                    <p className="flex items-center gap-1.5 text-[#1c1917]">
                      <Home className="w-3.5 h-3.5 text-[#c26d24]" />
                      <span>{completedOrder.pickupAddress}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[#78716c]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{completedOrder.pickupSlot}</span>
                    </p>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-[#e7e5e0] shrink-0 text-center">
                    <QrCode className="w-16 h-16 text-[#1c1917]" />
                    <span className="text-[9px] font-mono text-[#78716c] block mt-0.5">
                      {completedOrder.orderNumber}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#e7e5e0] text-xs text-[#78716c]">
                  <span className="font-medium text-[#1c1917] block mb-0.5">Instrucciones del Garaje:</span>
                  <p>"{completedOrder.pickupNotes}"</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewOrders();
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Ver en Mis Reservas
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-[#f5f4f0] hover:bg-[#e7e5e0] text-[#1c1917] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Seguir Viendo Juguetes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Edit2,
  Home,
  Image as ImageIcon,
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { Category, Order, Product, ProductCondition } from '../types';
import { GARAGE_SALE_INFO } from '../data/mockData';
import {
  addProduct,
  deleteProduct,
  updateOrderStatus,
  updateProductStock,
  uploadToSupabaseStorage,
} from '../services/storageService';

interface AdminPortalProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  onRefreshData: () => void;
}

const TOY_PHOTO_PRESETS = [
  {
    name: 'Bicicleta de Madera',
    url: '/src/assets/images/wooden_balance_bike_1792762341630.jpg',
  },
  {
    name: 'Cocina Infantil',
    url: '/src/assets/images/wooden_play_kitchen_1792762342620.jpg',
  },
  {
    name: 'Peluche Osito',
    url: '/src/assets/images/teddy_plush_bear_1792762342524.jpg',
  },
  {
    name: 'Tren de Madera',
    url: '/src/assets/images/wooden_train_set_1792762342576.jpg',
  },
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  categories,
  orders,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'inventory' | 'pickups'>('add');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'madera-construccion');
  const [childOwner, setChildOwner] = useState('Lucas (7 años)');
  const [price, setPrice] = useState('20');
  const [originalPrice, setOriginalPrice] = useState('50');
  const [condition, setCondition] = useState<ProductCondition>('Como nuevo');
  const [ageRange, setAgeRange] = useState('3 a 6 Años');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');

  // Storage
  const [uploadedImageUrl, setUploadedImageUrl] = useState(TOY_PHOTO_PRESETS[0].url);
  const [isUploading, setIsUploading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Inventory Search
  const [inventorySearch, setInventorySearch] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadToSupabaseStorage(file, 'garaje-familiar');
      setUploadedImageUrl(result.publicUrl);
      setFeedbackMessage('Foto subida correctamente');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      title: title.trim(),
      category,
      price: Math.max(1, Number(price) || 10),
      originalPrice: Math.max(Number(price) || 10, Number(originalPrice) || 30),
      condition,
      ageRange,
      stock: 1,
      initialStock: 1,
      images: [uploadedImageUrl || TOY_PHOTO_PRESETS[0].url],
      description:
        description.trim() ||
        `Juguete de ${childOwner}, cuidado con mucho cariño en casa. Listo para que otro niño lo disfrute.`,
      specifications: {
        brand: brand.trim() || 'Juguete familiar',
        cleanStatus: 'Limpio y completo',
      },
      seller: {
        kidName: childOwner,
        kidAge: 7,
        guardianName: GARAGE_SALE_INFO.parentName,
        guardianPhone: GARAGE_SALE_INFO.phone,
        pickupAddress: GARAGE_SALE_INFO.garageAddress,
        cityArea: GARAGE_SALE_INFO.cityArea,
        rating: 5.0,
        salesCompleted: 8,
        pickupNote: GARAGE_SALE_INFO.pickupInstructions,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      },
      pickupSlots: [
        'Sábado: 10:00 AM - 1:00 PM',
        'Sábado: 4:00 PM - 7:00 PM',
        'Domingo: 10:00 AM - 2:00 PM',
        'Entre semana: coordinar por WhatsApp',
      ],
      createdAt: new Date().toISOString(),
      supabaseStoragePath: `garaje-familiar/productos/${Date.now()}.jpg`,
    };

    addProduct(newProduct);
    onRefreshData();
    setTitle('');
    setDescription('');
    setBrand('');
    setFeedbackMessage('¡Juguete añadido a tu catálogo de garaje!');
    setTimeout(() => setFeedbackMessage(''), 3000);
    setActiveTab('inventory');
  };

  const filteredInventory = products.filter((p) => {
    if (!inventorySearch.trim()) return true;
    const q = inventorySearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.seller.kidName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Segmented Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e5e0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-2xl text-[#1c1917]">
              Panel del Garaje (Solo tú)
            </h2>
            <span className="text-[11px] font-semibold text-[#c26d24] bg-[#fef7ee] px-2 py-0.5 rounded-md border border-[#f3d4b6]">
              Organizador
            </span>
          </div>
          <p className="text-xs text-[#78716c] mt-0.5">
            Agrega nuevos juguetes de tus hijos, ajusta los precios y mira quién viene a recogerlos.
          </p>
        </div>

        {/* Clean Segmented Nav */}
        <div className="flex items-center gap-1 p-1 bg-[#f5f4f0] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'add'
                ? 'bg-white text-[#1c1917] shadow-clean'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            + Agregar Juguete
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-[#1c1917] shadow-clean'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            Mis Juguetes ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('pickups')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pickups'
                ? 'bg-white text-[#1c1917] shadow-clean'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            Visitas y Recogidas ({orders.length})
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* TAB 1: ADD PRODUCT */}
      {activeTab === 'add' && (
        <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Photo & Upload (Left) */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-[#e7e5e0] shadow-clean space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716c] block">
                Foto del Juguete
              </span>

              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#f5f4f0] border border-[#e7e5e0]">
                {uploadedImageUrl ? (
                  <img
                    src={uploadedImageUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#78716c]">
                    <ImageIcon className="w-8 h-8 stroke-1 mb-1" />
                    <span className="text-xs">Sube o selecciona una foto</span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs font-medium text-[#1c1917]">
                    Subiendo foto...
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label className="flex items-center justify-center gap-2 w-full py-2 px-3 border border-dashed border-[#d6d3cb] hover:border-[#1c1917] rounded-xl text-xs font-medium text-[#57534e] hover:text-[#1c1917] cursor-pointer transition-colors">
                <UploadCloud className="w-4 h-4 text-[#c26d24]" />
                <span>Tomar foto o subir desde tu teléfono/computadora</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Presets */}
              <div className="pt-2">
                <span className="text-[11px] text-[#78716c] block mb-2">
                  O usa una foto de muestra rápida:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {TOY_PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setUploadedImageUrl(preset.url)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        uploadedImageUrl === preset.url
                          ? 'border-[#1c1917] bg-[#fcfbf9]'
                          : 'border-[#e7e5e0] hover:border-[#d6d3cb]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span className="text-[11px] font-medium text-[#1c1917] truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Garage Info Reminder */}
            <div className="p-4 bg-[#fcfbf9] rounded-2xl border border-[#e7e5e0] text-xs text-[#57534e] space-y-1">
              <span className="font-semibold text-[#1c1917] block">Lugar de recogida configurado:</span>
              <p>{GARAGE_SALE_INFO.garageAddress}</p>
              <p className="text-[#78716c]">Los vecinos recogerán aquí cuando confirmen su reserva.</p>
            </div>
          </div>

          {/* Form Fields (Right) */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-6 bg-white rounded-2xl border border-[#e7e5e0] shadow-clean space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Nombre del juguete *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Pista de autos de madera, Puzle de animales..."
                  className="w-full text-sm bg-white border border-[#e7e5e0] rounded-xl px-3.5 py-2.5 text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                    ¿De cuál de tus hijos era?
                  </label>
                  <select
                    value={childOwner}
                    onChange={(e) => setChildOwner(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917] cursor-pointer"
                  >
                    <option value="Lucas (7 años)">De Lucas (7 años)</option>
                    <option value="Sofía (4 años)">De Sofía (4 años)</option>
                    <option value="Lucas y Sofía">De ambos</option>
                    <option value="De cuando eran bebés">De cuando eran bebés</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                    Precio en Garaje ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-sm bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                    Precio Nuevo Original ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full text-sm bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                    Estado
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ProductCondition)}
                    className="w-full text-xs sm:text-sm bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917] cursor-pointer"
                  >
                    <option value="Como nuevo">Como nuevo</option>
                    <option value="Poco uso">Poco uso</option>
                    <option value="Buen estado">Buen estado</option>
                    <option value="Usado con cariño">Usado con cariño</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                    Edad recomendada
                  </label>
                  <input
                    type="text"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    placeholder="Ej. 2 a 5 Años"
                    className="w-full text-sm bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                    Marca (opcional)
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ej. Melissa & Doug, LEGO, etc."
                    className="w-full text-sm bg-white border border-[#e7e5e0] rounded-xl px-3 py-2 text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Notas sobre el juguete
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Cuenta cómo lo cuidaron en casa o qué incluye..."
                  className="w-full text-sm bg-white border border-[#e7e5e0] rounded-xl p-3 text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#c26d24] hover:bg-[#a85817] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-clean mt-2"
              >
                Publicar en mi Venta de Garaje
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Filtrar por juguete o dueño..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#e7e5e0] rounded-xl text-xs sm:text-sm text-[#1c1917] focus:outline-none focus:border-[#1c1917]"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e7e5e0] overflow-hidden shadow-clean">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fcfbf9] text-[#78716c] uppercase border-b border-[#e7e5e0] text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Juguete</th>
                    <th className="py-3 px-4">De quién era</th>
                    <th className="py-3 px-4">Precio Garaje</th>
                    <th className="py-3 px-4">Disponibilidad</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f4f0]">
                  {filteredInventory.map((p) => {
                    const isAvailable = p.stock > 0;
                    return (
                      <tr key={p.id} className="hover:bg-[#fcfbf9] transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-[#f5f4f0] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#1c1917] truncate max-w-xs">
                              {p.title}
                            </p>
                            <span className="text-[11px] text-[#78716c]">
                              {p.condition} · Edad {p.ageRange}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#57534e]">
                          {p.seller.kidName}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#1c1917] tabular-nums">
                          ${p.price}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              updateProductStock(p.id, isAvailable ? 0 : 1);
                              onRefreshData();
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors border ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-[#f5f4f0] text-[#78716c] border-[#e7e5e0] hover:bg-[#e7e5e0]'
                            }`}
                          >
                            {isAvailable ? '✓ Disponible' : 'Reservado / Vendido'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Eliminar "${p.title}" del catálogo?`)) {
                                deleteProduct(p.id);
                                onRefreshData();
                              }
                            }}
                            className="text-[#78716c] hover:text-red-600 transition-colors p-1 cursor-pointer"
                            title="Eliminar del garaje"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULED PICKUPS / VISITS */}
      {activeTab === 'pickups' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#fcfbf9] rounded-2xl border border-[#e7e5e0] text-xs text-[#57534e]">
            Aquí verás a los vecinos que han reservado un juguete y la hora estimada en que vendrán a tu garaje.
          </div>

          {orders.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-[#e7e5e0] text-center text-xs text-[#78716c]">
              No hay reservas programadas todavía.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 bg-white rounded-2xl border border-[#e7e5e0] shadow-clean space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#f5f4f0] pb-2">
                    <div>
                      <span className="text-[11px] text-[#78716c] block">Pase #{order.orderNumber}</span>
                      <strong className="text-sm text-[#1c1917]">{order.buyerName}</strong>
                    </div>
                    <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {order.paymentStatus === 'paid' ? 'Pagado Online' : 'Paga al Recoger'}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {order.productImage && (
                      <img
                        src={order.productImage}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-[#f5f4f0] shrink-0"
                      />
                    )}
                    <div className="text-xs text-[#57534e] space-y-0.5">
                      <p className="font-semibold text-[#1c1917]">{order.productTitle}</p>
                      <p className="text-[#78716c]">Total: ${order.totalAmount} · Tel: {order.buyerPhone}</p>
                      <p className="text-[#c26d24] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Viene el {order.pickupSlot}</span>
                      </p>
                      {order.specialInstructions && (
                        <p className="text-[#78716c] italic">"{order.specialInstructions}"</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#f5f4f0] flex items-center justify-between text-xs">
                    <span className="text-[#78716c]">
                      Estado: <strong className="text-[#1c1917]">{order.pickupStatus === 'completed' ? 'Entregado en mano' : 'Por entregar'}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const next = order.pickupStatus === 'completed' ? 'scheduled' : 'completed';
                        updateOrderStatus(order.id, next);
                        onRefreshData();
                      }}
                      className="text-xs font-medium text-[#c26d24] hover:underline cursor-pointer"
                    >
                      {order.pickupStatus === 'completed' ? 'Marcar pendiente' : 'Marcar como entregado ✓'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

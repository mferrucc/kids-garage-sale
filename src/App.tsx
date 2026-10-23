import React, { useEffect, useState } from 'react';
import {
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Info,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { Category, Order, Product, UserProfile } from './types';
import { GARAGE_SALE_INFO, INITIAL_CATEGORIES } from './data/mockData';
import {
  getOrders,
  getProducts,
  getUserProfile,
  resetDataToDefaults,
  subscribeToStockUpdates,
  toggleSaveProduct,
} from './services/storageService';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminPortal } from './components/AdminPortal';
import { UserProfileSection } from './components/UserProfileSection';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'admin' | 'profile' | 'how-it-works'>('catalog');

  // Core Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedKid, setSelectedKid] = useState<string>('all');
  const [priceCap, setPriceCap] = useState<number>(50);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high'>('recommended');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Modals
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [checkoutData, setCheckoutData] = useState<{ product: Product; slot: string } | null>(null);

  const refreshData = () => {
    setProducts(getProducts());
    setOrders(getOrders());
    setUserProfile(getUserProfile());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToStockUpdates((updatedProducts) => {
      setProducts(updatedProducts);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleSave = (productId: string) => {
    toggleSaveProduct(productId);
    setUserProfile(getUserProfile());
  };

  const handleOpenCheckout = (product: Product, slot?: string) => {
    setCheckoutData({
      product,
      slot: slot || product.pickupSlots[0] || 'Sábado: 10:00 AM - 1:00 PM',
    });
  };

  const handleSelectProduct = (product: Product) => {
    const current = products.find((p) => p.id === product.id) || product;
    setDetailProduct(current);
  };

  const handleOrderSuccess = () => {
    refreshData();
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (onlyInStock && p.stock <= 0) return false;
    if (p.price > priceCap) return false;

    // Filter by Kid
    if (selectedKid !== 'all') {
      if (selectedKid === 'lucas' && !p.seller.kidName.toLowerCase().includes('lucas')) return false;
      if (selectedKid === 'sofia' && !p.seller.kidName.toLowerCase().includes('sofía') && !p.seller.kidName.toLowerCase().includes('sofia')) return false;
    }

    // Filter by Age
    if (selectedAge !== 'all') {
      if (
        selectedAge === '0-2' &&
        !p.ageRange.includes('0') &&
        !p.ageRange.includes('1') &&
        !p.ageRange.includes('2')
      )
        return false;
      if (
        selectedAge === '3-5' &&
        !p.ageRange.includes('3') &&
        !p.ageRange.includes('4') &&
        !p.ageRange.includes('5')
      )
        return false;
      if (
        selectedAge === '6+' &&
        !p.ageRange.includes('6') &&
        !p.ageRange.includes('7') &&
        !p.ageRange.includes('8') &&
        !p.ageRange.includes('9') &&
        !p.ageRange.includes('10')
      )
        return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchKid = p.seller.kidName.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchKid && !matchCategory) return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const availableCount = products.filter((p) => p.stock > 0).length;

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedAge('all');
    setSelectedKid('all');
    setOnlyInStock(false);
    setPriceCap(50);
    setSortBy('recommended');
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#1c1917] flex flex-col font-sans selection:bg-[#fef7ee] selection:text-[#c26d24]">
      {/* 3-Zone Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={userProfile.savedProductIds.length}
        ordersCount={orders.length}
        userProfile={userProfile}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB: CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            {/* Garage Sale Hero Header */}
            <div className="border-b border-[#e7e5e0] pb-8 pt-2">
              <div className="max-w-3xl space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c26d24] block">
                  Venta de Garaje Familiar · Casa de los Ferruccio
                </span>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#1c1917] tracking-tight leading-tight">
                  Venta de Garaje: Juguetes de Nuestros Hijos
                </h1>
                <p className="text-sm sm:text-base text-[#57534e] leading-relaxed">
                  Hola vecinos 👋 Estamos haciendo espacio en casa y vendiendo los juguetes con los que crecieron <strong>Lucas (7 años)</strong> y <strong>Sofía (4 años)</strong>. Todos están cuidados con mucho cariño, limpios y con sus piezas completas. Reserva el que te guste y pasa a recogerlo por nuestro garaje.
                </p>
              </div>

              {/* Garage location & hours banner strip */}
              <div className="mt-5 p-4 bg-white rounded-2xl border border-[#e7e5e0] shadow-clean grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#fef7ee] text-[#c26d24] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1c1917] block">Lugar del Garaje:</span>
                    <span className="text-[#78716c]">{GARAGE_SALE_INFO.garageAddress}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#fef7ee] text-[#c26d24] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1c1917] block">Horarios de Garaje:</span>
                    <span className="text-[#78716c]">Sábados y Domingos (o a coordinar)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#fef7ee] text-[#c26d24] flex items-center justify-center shrink-0">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1c1917] block">Sin intermediarios:</span>
                    <span className="text-[#78716c]">Pagas en mano o reserva online directa</span>
                  </div>
                </div>
              </div>

              {/* Clean Integrated Search Bar */}
              <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#78716c] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar juguete de madera, bicicleta, puzle..."
                    className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#e7e5e0] rounded-xl text-xs sm:text-sm text-[#1c1917] placeholder:text-[#78716c] focus:outline-none focus:border-[#1c1917] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78716c] hover:text-[#1c1917] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Segmented Category Bar */}
            <CategoryBar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              products={products}
            />

            {/* Quick Filter Controls: By Kid, Age & Price */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-[#f5f4f0]">
              <div className="flex flex-wrap items-center gap-2">
                {/* Filter by child */}
                <span className="text-xs text-[#78716c] mr-1">De quién:</span>
                <button
                  onClick={() => setSelectedKid('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                    selectedKid === 'all'
                      ? 'bg-[#1c1917] text-white border-[#1c1917]'
                      : 'bg-white text-[#57534e] border-[#e7e5e0] hover:border-[#d6d3cb]'
                  }`}
                >
                  De ambos
                </button>
                <button
                  onClick={() => setSelectedKid('lucas')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                    selectedKid === 'lucas'
                      ? 'bg-[#1c1917] text-white border-[#1c1917]'
                      : 'bg-white text-[#57534e] border-[#e7e5e0] hover:border-[#d6d3cb]'
                  }`}
                >
                  De Lucas (7 años)
                </button>
                <button
                  onClick={() => setSelectedKid('sofia')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                    selectedKid === 'sofia'
                      ? 'bg-[#1c1917] text-white border-[#1c1917]'
                      : 'bg-white text-[#57534e] border-[#e7e5e0] hover:border-[#d6d3cb]'
                  }`}
                >
                  De Sofía (4 años)
                </button>

                <div className="h-4 w-px bg-[#e7e5e0] mx-1 hidden sm:block" />

                {/* Filter by age */}
                <span className="text-xs text-[#78716c] mr-1 hidden sm:inline">Edad:</span>
                {['all', '0-2', '3-5', '6+'].map((age) => (
                  <button
                    key={age}
                    onClick={() => setSelectedAge(age)}
                    className={`hidden sm:inline-block px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      selectedAge === age
                        ? 'bg-[#1c1917] text-white border-[#1c1917]'
                        : 'bg-white text-[#57534e] border-[#e7e5e0] hover:border-[#d6d3cb]'
                    }`}
                  >
                    {age === 'all' ? 'Todas' : `${age} años`}
                  </button>
                ))}

                <button
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                    onlyInStock
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-[#78716c] border-[#e7e5e0] hover:border-[#d6d3cb]'
                  }`}
                >
                  Solo disponibles ({availableCount})
                </button>
              </div>

              {/* Price Cap & Sort */}
              <div className="flex items-center gap-4 ml-auto text-xs text-[#78716c]">
                <div className="flex items-center gap-2">
                  <span>Hasta ${priceCap}</span>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={priceCap}
                    onChange={(e) => setPriceCap(Number(e.target.value))}
                    className="w-20 accent-[#c26d24] cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 border-l border-[#e7e5e0] pl-4">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#78716c]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent font-medium text-[#1c1917] focus:outline-none cursor-pointer"
                  >
                    <option value="recommended">Recomendados</option>
                    <option value="price_low">Precio: Menor a Mayor</option>
                    <option value="price_high">Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-base sm:text-lg text-[#1c1917]">
                  {selectedCategory === 'all'
                    ? 'Juguetes en venta'
                    : categories.find((c) => c.id === selectedCategory)?.name}{' '}
                  <span className="text-xs font-normal text-[#78716c] tabular-nums">
                    ({sortedProducts.length} disponibles en casa)
                  </span>
                </h3>

                {(selectedCategory !== 'all' ||
                  searchQuery !== '' ||
                  selectedAge !== 'all' ||
                  selectedKid !== 'all' ||
                  onlyInStock ||
                  priceCap < 50) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-medium text-[#c26d24] hover:underline cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                )}
              </div>

              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSaved={userProfile.savedProductIds.includes(product.id)}
                      onToggleSave={handleToggleSave}
                      onSelectProduct={handleSelectProduct}
                      onQuickCheckout={(p) => handleOpenCheckout(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-[#e7e5e0] text-center space-y-3">
                  <span className="text-3xl block">🧸</span>
                  <h4 className="font-semibold text-sm text-[#1c1917]">
                    No hay juguetes con estos filtros
                  </h4>
                  <p className="text-xs text-[#78716c] max-w-sm mx-auto">
                    Prueba cambiando el límite de precio o mostrando todos los juguetes.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#1c1917] hover:bg-[#292524] text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Ver todos los juguetes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: HOW IT WORKS / PICKUP SCHEDULE */}
        {activeTab === 'how-it-works' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-[#e7e5e0] pb-4">
              <h2 className="font-display font-bold text-2xl text-[#1c1917]">
                Cómo Funciona Nuestra Venta de Garaje
              </h2>
              <p className="text-xs text-[#78716c] mt-0.5">
                Una venta sencilla de vecinos, sin complicaciones.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-[#e7e5e0] shadow-clean space-y-2">
                <span className="w-7 h-7 rounded-lg bg-[#fef7ee] text-[#c26d24] flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="font-semibold text-sm text-[#1c1917]">Eliges el juguete</h3>
                <p className="text-xs text-[#78716c] leading-relaxed">
                  Mira las fotos reales y notas de cómo lo cuidaron Lucas y Sofía.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#e7e5e0] shadow-clean space-y-2">
                <span className="w-7 h-7 rounded-lg bg-[#fef7ee] text-[#c26d24] flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="font-semibold text-sm text-[#1c1917]">Lo reservas online</h3>
                <p className="text-xs text-[#78716c] leading-relaxed">
                  Eliges la hora en la que vas a pasar por nuestro garaje para que lo apartemos solo para ti.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#e7e5e0] shadow-clean space-y-2">
                <span className="w-7 h-7 rounded-lg bg-[#fef7ee] text-[#c26d24] flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h3 className="font-semibold text-sm text-[#1c1917]">Pasas a buscarlo</h3>
                <p className="text-xs text-[#78716c] leading-relaxed">
                  Vienes a Calle Los Cerezos 742, lo ves en persona y pagas en mano o lo dejas pagado online.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-[#e7e5e0] shadow-clean space-y-4">
              <h3 className="font-semibold text-base text-[#1c1917] flex items-center gap-2">
                <Home className="w-4 h-4 text-[#c26d24]" />
                <span>Dirección y Referencias del Garaje</span>
              </h3>
              <div className="text-xs text-[#57534e] space-y-2">
                <p>
                  <strong>Dirección:</strong> {GARAGE_SALE_INFO.garageAddress} ({GARAGE_SALE_INFO.cityArea}).
                </p>
                <p>
                  <strong>Referencia:</strong> Casa de un solo piso con garaje blanco al frente. Hay espacio para detener el auto 5 minutos sin problema.
                </p>
                <p>
                  <strong>Contacto / WhatsApp:</strong> {GARAGE_SALE_INFO.phone} ({GARAGE_SALE_INFO.parentName}).
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('catalog')}
              className="px-6 py-2.5 bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              ← Volver al Catálogo de Juguetes
            </button>
          </div>
        )}

        {/* TAB: ADMIN (ORGANIZER MODE FOR PARENT) */}
        {activeTab === 'admin' && (
          <div className="animate-in fade-in duration-150">
            <AdminPortal
              products={products}
              categories={categories}
              orders={orders}
              onRefreshData={refreshData}
            />
          </div>
        )}

        {/* TAB: PROFILE & RESERVATIONS */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in duration-150">
            <UserProfileSection
              userProfile={userProfile}
              orders={orders}
              products={products}
              onSelectProduct={handleSelectProduct}
              onRefreshData={refreshData}
            />
          </div>
        )}
      </main>

      {/* Product Details Modal */}
      {detailProduct && (
        <ProductDetailsModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          isSaved={userProfile.savedProductIds.includes(detailProduct.id)}
          onToggleSave={handleToggleSave}
          onProceedToCheckout={(product, selectedSlot) => {
            setDetailProduct(null);
            handleOpenCheckout(product, selectedSlot);
          }}
        />
      )}

      {/* Checkout Modal */}
      {checkoutData && (
        <CheckoutModal
          product={checkoutData.product}
          selectedPickupSlot={checkoutData.slot}
          userProfile={userProfile}
          onClose={() => setCheckoutData(null)}
          onOrderSuccess={handleOrderSuccess}
          onViewOrders={() => setActiveTab('profile')}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-[#e7e5e0] bg-white py-6 px-4 sm:px-6 lg:px-8 text-xs text-[#78716c]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1c1917]">Venta de Garaje</span>
            <span>· Juguetes de Lucas y Sofía · {GARAGE_SALE_INFO.garageAddress}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('¿Restablecer los juguetes y datos de la venta de garaje?')) {
                  resetDataToDefaults();
                  refreshData();
                }
              }}
              className="flex items-center gap-1.5 hover:text-[#1c1917] cursor-pointer transition-colors"
              title="Restablecer datos iniciales"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#c26d24]" />
              <span>Restablecer catálogo</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>Entrega directa en casa</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

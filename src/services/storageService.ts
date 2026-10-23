import { Order, Product, UserProfile } from '../types';
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_USER_PROFILE } from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'sunnyyard_products_v4',
  ORDERS: 'sunnyyard_orders_v4',
  USER_PROFILE: 'sunnyyard_profile_v4',
  SUPABASE_FILES: 'sunnyyard_supabase_storage_v4',
};

// Event emitter for real-time inventory updates across components
type StockUpdateListener = (products: Product[]) => void;
const listeners: StockUpdateListener[] = [];

export const subscribeToStockUpdates = (listener: StockUpdateListener) => {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

const notifyStockChange = (products: Product[]) => {
  listeners.forEach((fn) => fn(products));
};

export const getProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  notifyStockChange(products);
};

export const updateProductStock = (productId: string, newStock: number): Product[] => {
  const products = getProducts();
  const updated = products.map((p) => {
    if (p.id === productId) {
      return { ...p, stock: Math.max(0, newStock) };
    }
    return p;
  });
  saveProducts(updated);
  return updated;
};

export const addProduct = (product: Product): Product[] => {
  const products = getProducts();
  const updated = [product, ...products];
  saveProducts(updated);
  return updated;
};

export const updateProduct = (updatedProd: Product): Product[] => {
  const products = getProducts();
  const updated = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
  saveProducts(updated);
  return updated;
};

export const deleteProduct = (productId: string): Product[] => {
  const products = getProducts();
  const updated = products.filter((p) => p.id !== productId);
  saveProducts(updated);
  return updated;
};

export const getOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_ORDERS;
  }
};

export const createOrder = (
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'qrCodeData'>
): Order => {
  const orders = getOrders();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    orderNumber: `SY-${randomNum}`,
    createdAt: new Date().toISOString(),
    qrCodeData: `SUNNYYARD-PASE-SY-${randomNum}-${orderData.buyerName.replace(/\s+/g, '')}`,
  };

  const updatedOrders = [newOrder, ...orders];
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

  // Decrement product inventory in real-time
  const products = getProducts();
  const updatedProducts = products.map((p) => {
    if (p.id === orderData.productId) {
      return { ...p, stock: Math.max(0, p.stock - orderData.quantity) };
    }
    return p;
  });
  saveProducts(updatedProducts);

  // Update user stats
  const profile = getUserProfile();
  const savings = Math.max(
    0,
    (products.find((p) => p.id === orderData.productId)?.originalPrice || 0) - orderData.price
  );
  updateUserProfile({
    savingsTotal: profile.savingsTotal + savings,
    toysRehomedCount: profile.toysRehomedCount + orderData.quantity,
    ecoPoints: profile.ecoPoints + 50,
  });

  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: Order['pickupStatus']): Order[] => {
  const orders = getOrders();
  const updated = orders.map((o) => (o.id === orderId ? { ...o, pickupStatus: status } : o));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  return updated;
};

export const getUserProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
      return INITIAL_USER_PROFILE;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_USER_PROFILE;
  }
};

export const updateUserProfile = (patch: Partial<UserProfile>): UserProfile => {
  const current = getUserProfile();
  const updated = { ...current, ...patch };
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
  return updated;
};

export const toggleSaveProduct = (productId: string): string[] => {
  const profile = getUserProfile();
  const isSaved = profile.savedProductIds.includes(productId);
  const newSaved = isSaved
    ? profile.savedProductIds.filter((id) => id !== productId)
    : [...profile.savedProductIds, productId];

  updateUserProfile({ savedProductIds: newSaved });
  return newSaved;
};

// Supabase Storage Simulator
export interface SupabaseStorageUploadResult {
  publicUrl: string;
  storagePath: string;
  bucket: string;
  fileName: string;
  fileSizeKb: number;
}

export const uploadToSupabaseStorage = async (
  file: File | { name: string; url: string; size?: number },
  bucket = 'ventas-garaje'
): Promise<SupabaseStorageUploadResult> => {
  // Simulate network delay to Supabase Storage endpoint
  await new Promise((res) => setTimeout(res, 600));

  const cleanName = (file.name || 'foto-producto.jpg')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .toLowerCase();
  const uniqueKey = `${Date.now()}-${cleanName}`;
  const storagePath = `${bucket}/productos/${uniqueKey}`;

  let publicUrl = '';
  if ('url' in file && file.url) {
    publicUrl = file.url;
  } else if (file instanceof File) {
    publicUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPABASE_FILES) || '[]');
    existing.push({
      storagePath,
      bucket,
      fileName: cleanName,
      publicUrl,
      uploadedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.SUPABASE_FILES, JSON.stringify(existing));
  } catch (err) {
    console.error('Error al registrar en storage:', err);
  }

  return {
    publicUrl,
    storagePath,
    bucket,
    fileName: cleanName,
    fileSizeKb: Math.round(((file as File).size || 245000) / 1024),
  };
};

export const resetDataToDefaults = () => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
  notifyStockChange(INITIAL_PRODUCTS);
};

export type ProductCondition = 'Como nuevo' | 'Poco uso' | 'Buen estado' | 'Usado con cariño';

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  condition: ProductCondition;
  ageRange: string;
  stock: number;
  initialStock: number;
  images: string[];
  description: string;
  specifications: {
    brand?: string;
    material?: string;
    dimensions?: string;
    batteriesRequired?: string;
    cleanStatus?: string;
    piecesCount?: string;
    safetyStandard?: string;
  };
  seller: {
    kidName: string;
    kidAge: number;
    guardianName: string;
    guardianPhone: string;
    pickupAddress: string;
    cityArea: string;
    rating: number;
    salesCompleted: number;
    pickupNote: string;
    avatar: string;
  };
  pickupSlots: string[];
  isFeatured?: boolean;
  createdAt: string;
  supabaseStoragePath?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  quantity: number;
  totalAmount: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  pickupSlot: string;
  pickupAddress: string;
  sellerKidName: string;
  sellerGuardianName: string;
  pickupNotes: string;
  specialInstructions?: string;
  paymentMethod: 'card' | 'apple_pay' | 'porch_cash';
  paymentStatus: 'paid' | 'pay_on_pickup';
  pickupStatus: 'scheduled' | 'ready_for_pickup' | 'completed';
  createdAt: string;
  qrCodeData: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  bgLight: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  cityArea: string;
  avatar: string;
  savedProductIds: string[];
  ecoPoints: number;
  savingsTotal: number;
  toysRehomedCount: number;
}

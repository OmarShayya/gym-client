// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  membershipStartDate: string;
  membershipEndDate: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    memberId: string;
  };
}

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

// Member Types
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberId: string;
  qrCode: string;
  fingerprintId?: string;
  membershipStartDate: string;
  membershipEndDate: string;
  status: "active" | "inactive" | "suspended";
  role: "member" | "admin";
  createdAt: string;
  updatedAt: string;
}

// Day Pass Types
export interface DayPass {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passId: string;
  qrCode: string;
  validDate: string;
  paymentMethod: string;
  amount: number;
  status: "active" | "used" | "expired";
  usedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Check-in Types
export interface CheckIn {
  id: string;
  memberId: string;
  memberName: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number;
  checkInMethod: string;
  status: "active" | "completed";
  type: "member" | "day-pass";
  dayPassInfo?: {
    passId: string;
    validDate: string;
    amount: number;
  };
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sale Types
export interface Sale {
  id: string;
  saleNumber: string;
  memberId?: string;
  memberName?: string;
  customerName?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer";
  notes?: string;
  saleDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  totalDiscount: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  paymentMethodBreakdown: Record<
    string,
    {
      count: number;
      total: number;
    }
  >;
  dailyBreakdown: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

// Common Types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

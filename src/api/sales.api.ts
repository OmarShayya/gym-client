import { apiClient } from "./client";

export interface CreateSaleDto {
  memberId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: "cash" | "card" | "transfer";
  notes?: string;
}

export interface SaleDiscountDto {
  type: string;
  value: number;
  amount: number;
  description?: string;
}

export interface SaleResponseDto {
  id: string;
  saleNumber: string;
  memberId: string;
  memberName: string;
  items: Array<{
    productId: string;
    productName: string;
    productSku?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    subtotal: number;
    refundedQuantity?: number;
  }>;
  subtotal: number;
  discount?: SaleDiscountDto;
  tax: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer" | "online" | "store_credit";
  status: string;
  notes?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesReportDto {
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

export const salesApi = {
  // Create sale
  create: async (data: CreateSaleDto): Promise<SaleResponseDto> => {
    const response = await apiClient.post("/sales", data);
    return response.data;
  },

  // Get all sales
  findAll: async (
    startDate?: string,
    endDate?: string,
    memberId?: string
  ): Promise<SaleResponseDto[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (memberId) params.append("memberId", memberId);

    const queryString = params.toString();
    const url = queryString ? `/sales?${queryString}` : "/sales";

    const response = await apiClient.get(url);
    return response.data;
  },

  // Get today's sales
  getTodaysSales: async (): Promise<SaleResponseDto[]> => {
    const response = await apiClient.get("/sales/today");
    return response.data;
  },

  // Get sales report
  getSalesReport: async (
    startDate: string,
    endDate: string
  ): Promise<SalesReportDto> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await apiClient.get(`/sales/report?${params.toString()}`);
    return response.data;
  },

  // Get member purchase history
  getMemberPurchaseHistory: async (
    memberId: string
  ): Promise<SaleResponseDto[]> => {
    const response = await apiClient.get(`/sales/member/${memberId}`);
    return response.data;
  },

  // Get sale by ID
  findOne: async (id: string): Promise<SaleResponseDto> => {
    const response = await apiClient.get(`/sales/${id}`);
    return response.data;
  },

  // Get sale by sale number
  findBySaleNumber: async (saleNumber: string): Promise<SaleResponseDto> => {
    const response = await apiClient.get(`/sales/number/${saleNumber}`);
    return response.data;
  },
};

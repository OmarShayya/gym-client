import { apiClient } from "./client";

export interface CreateDayPassDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  validDate: string;
  amount: number;
  notes?: string;
}

export interface UpdateDayPassDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  validDate?: string;
  amount?: number;
  notes?: string;
}

export interface UseDayPassDto {
  passId: string;
}

export interface DayPassResponseDto {
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

export const dayPassesApi = {
  // Create day pass
  create: async (data: CreateDayPassDto): Promise<DayPassResponseDto> => {
    const response = await apiClient.post("/day-passes", data);
    return response.data;
  },

  // Get all day passes
  findAll: async (): Promise<DayPassResponseDto[]> => {
    const response = await apiClient.get("/day-passes");
    return response.data;
  },

  // Get today's passes
  getTodaysPasses: async (): Promise<DayPassResponseDto[]> => {
    const response = await apiClient.get("/day-passes/today");
    return response.data;
  },

  // Get expired passes
  getExpiredPasses: async (): Promise<DayPassResponseDto[]> => {
    const response = await apiClient.get("/day-passes/expired");
    return response.data;
  },

  // Get by ID
  findOne: async (id: string): Promise<DayPassResponseDto> => {
    const response = await apiClient.get(`/day-passes/${id}`);
    return response.data;
  },

  // Get by pass ID
  findByPassId: async (passId: string): Promise<DayPassResponseDto> => {
    const response = await apiClient.get(`/day-passes/by-pass-id/${passId}`);
    return response.data;
  },

  // Get by QR code
  findByQrCode: async (qrCode: string): Promise<DayPassResponseDto> => {
    const response = await apiClient.get(`/day-passes/by-qr/${qrCode}`);
    return response.data;
  },

  // Use day pass
  useDayPass: async (data: UseDayPassDto): Promise<DayPassResponseDto> => {
    const response = await apiClient.post("/day-passes/use", data);
    return response.data;
  },

  // Update day pass
  update: async (
    id: string,
    data: UpdateDayPassDto
  ): Promise<DayPassResponseDto> => {
    const response = await apiClient.patch(`/day-passes/${id}`, data);
    return response.data;
  },

  // Delete day pass
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/day-passes/${id}`);
  },
};

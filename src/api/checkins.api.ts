import { apiClient } from "./client";

export interface CheckInDto {
  memberId: string;
  method: "qr" | "manual" | "fingerprint";
}

export interface CheckOutDto {
  identifier: string;
}

export interface DayPassCheckInDto {
  passId: string;
  method: "qr" | "manual" | "fingerprint";
}

export interface CheckInResponseDto {
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

export const checkInsApi = {
  // Check in member
  checkIn: async (data: CheckInDto): Promise<CheckInResponseDto> => {
    const response = await apiClient.post("/check-ins/member", data);
    return response.data;
  },

  // Check in day pass
  checkInDayPass: async (
    data: DayPassCheckInDto
  ): Promise<CheckInResponseDto> => {
    const response = await apiClient.post("/check-ins/day-pass", data);
    return response.data;
  },

  // Check in by QR code
  checkInByQr: async (qrCode: string): Promise<CheckInResponseDto> => {
    const response = await apiClient.post(`/check-ins/qr/${qrCode}`);
    return response.data;
  },

  // Check out
  checkOut: async (data: CheckOutDto): Promise<CheckInResponseDto> => {
    const response = await apiClient.post("/check-ins/checkout", data);
    return response.data;
  },

  // Get member check-ins
  getMemberCheckIns: async (
    memberId: string,
    limit?: number
  ): Promise<CheckInResponseDto[]> => {
    const params = limit ? `?limit=${limit}` : "";
    const response = await apiClient.get(
      `/check-ins/member/${memberId}${params}`
    );
    return response.data;
  },

  // Get active check-ins
  getActiveCheckIns: async (): Promise<CheckInResponseDto[]> => {
    const response = await apiClient.get("/check-ins/active");
    return response.data;
  },

  // Get today's check-ins
  getTodaysCheckIns: async (): Promise<CheckInResponseDto[]> => {
    const response = await apiClient.get("/check-ins/today");
    return response.data;
  },

  // Get check-in by ID
  getCheckInById: async (id: string): Promise<CheckInResponseDto> => {
    const response = await apiClient.get(`/check-ins/${id}`);
    return response.data;
  },
};

import { apiClient } from "./client";

export interface CreateMemberDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  membershipStartDate: string;
  membershipEndDate: string;
}

export interface UpdateMemberDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  fingerprintId?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  status?: "active" | "inactive" | "suspended";
  role?: "member" | "admin";
}

export interface MemberResponseDto {
  id: string;
  _id?: string;
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

export interface SearchMembersParams {
  search?: string;
  status?: "active" | "inactive" | "suspended";
  limit?: number;
  offset?: number;
}

export const membersApi = {
  // Create member
  create: async (data: CreateMemberDto): Promise<MemberResponseDto> => {
    const response = await apiClient.post("/members", data);
    return response.data;
  },

  // Get all members
  findAll: async (): Promise<MemberResponseDto[]> => {
    const response = await apiClient.get("/members");
    return response.data;
  },

  // Get active members whose membership expires within `days` days
  getExpiring: async (days = 7): Promise<MemberResponseDto[]> => {
    const response = await apiClient.get(`/members/expiring?days=${days}`);
    return response.data;
  },

  // Search members with optional filters
  search: async (
    params: SearchMembersParams
  ): Promise<{
    members: MemberResponseDto[];
    total: number;
    hasMore: boolean;
  }> => {
    const searchParams = new URLSearchParams();

    if (params.search) searchParams.append("search", params.search);
    if (params.status) searchParams.append("status", params.status);
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());

    const queryString = searchParams.toString();
    const url = queryString
      ? `/members/search?${queryString}`
      : "/members/search";

    const response = await apiClient.get(url);
    return response.data;
  },

  // Get member by ID
  findOne: async (id: string): Promise<MemberResponseDto> => {
    const response = await apiClient.get(`/members/${id}`);
    return response.data;
  },

  // Get member by member ID
  findByMemberId: async (memberId: string): Promise<MemberResponseDto> => {
    const response = await apiClient.get(`/members/by-member-id/${memberId}`);
    return response.data;
  },

  // Get member by QR code
  findByQrCode: async (qrCode: string): Promise<MemberResponseDto> => {
    const response = await apiClient.get(`/members/by-qr/${qrCode}`);
    return response.data;
  },

  // Update member
  update: async (
    id: string,
    data: UpdateMemberDto
  ): Promise<MemberResponseDto> => {
    const response = await apiClient.patch(`/members/${id}`, data);
    return response.data;
  },

  // Update member status (convenience method)
  updateStatus: async (
    id: string,
    status: "active" | "inactive" | "suspended"
  ): Promise<MemberResponseDto> => {
    const response = await apiClient.patch(`/members/${id}/status`, { status });
    return response.data;
  },

  // Delete member
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/members/${id}`);
  },
};

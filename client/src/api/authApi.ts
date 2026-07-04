import { axiosClient } from "./axiosClient";

export interface UserResponse {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

export interface MessageResponse<T> {
  message: string;
  data?: T;
}

export const authApi = {
  async register(formData: FormData): Promise<MessageResponse<UserResponse>> {
    // Accepts FormData with: full_name, email, hashed_password, role, and optional image
    const response = await axiosClient.post<MessageResponse<UserResponse>>("/auth/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async login(params: URLSearchParams): Promise<MessageResponse<void>> {
    // Accepts URLSearchParams with: email, hashed_password
    const response = await axiosClient.post<MessageResponse<void>>("/auth/login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  async me(): Promise<UserResponse> {
    const response = await axiosClient.get<UserResponse>("/auth/me");
    return response.data;
  },

  async logout(): Promise<MessageResponse<void>> {
    const response = await axiosClient.post<MessageResponse<void>>("/auth/logout");
    return response.data;
  },
};

import { axiosClient } from "@/api/axiosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export const useSignIn = () => {
  return useMutation<UserResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await axiosClient.post('/auth/login',  formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      return response.data
    }
  })
}


export const useCheckAuth = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await axiosClient.get("/auth/me", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    retry: false,
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
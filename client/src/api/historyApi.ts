import { axiosClient } from "./axiosClient";

export interface HealthHistoryResponse {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface MessageResponse<T> {
  message: string;
  data?: T;
}

export const historyApi = {
  async getHealthHistory(): Promise<MessageResponse<HealthHistoryResponse[]>> {
    const response = await axiosClient.get<MessageResponse<HealthHistoryResponse[]>>("/history/");
    return response.data;
  },

  async deleteHistoryRecord(historyId: string): Promise<MessageResponse<void>> {
    const response = await axiosClient.delete<MessageResponse<void>>(`/history/${historyId}`);
    return response.data;
  },
};

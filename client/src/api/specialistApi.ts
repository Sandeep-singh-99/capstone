import { axiosClient } from "./axiosClient";

export interface SpecialistResponse {
  id: string;
  name: string;
  description: string;
  symptoms?: string[];
}

export interface RecommendSpecialistResponse {
  specialist?: SpecialistResponse;
  recommendation_text: string;
}

export interface MessageResponse<T> {
  message: string;
  data?: T;
}

export const specialistApi = {
  async recommendSpecialty(symptoms: string[]): Promise<MessageResponse<RecommendSpecialistResponse>> {
    const response = await axiosClient.post<MessageResponse<RecommendSpecialistResponse>>(
      "/specialists/recommend",
      { symptoms }
    );
    return response.data;
  },

  async listAllSpecialties(): Promise<MessageResponse<SpecialistResponse[]>> {
    const response = await axiosClient.get<MessageResponse<SpecialistResponse[]>>("/specialists/");
    return response.data;
  },
};

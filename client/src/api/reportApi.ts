import { axiosClient } from "./axiosClient";

export interface MedicalReportResponse {
  id: string;
  user_id: string;
  file_url?: string;
  file_public_id?: string;
  file_type?: "image" | "pdf";
  image_url?: string;
  image_public_id?: string;
  input_text?: string;
  extracted_text?: string;
  ai_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportUploadResponse {
  report: MedicalReportResponse;
  analysis: string;
  extracted_text: string;
  symptoms: string[];
  recommendations: string[];
}

export interface MessageResponse<T> {
  message: string;
  data?: T;
}

export const reportApi = {
  async uploadReport(
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<MessageResponse<ReportUploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<MessageResponse<ReportUploadResponse>>(
      "/reports/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
        // Extend timeout for heavy AI processing
        timeout: 90000, 
      }
    );
    return response.data;
  },

  async getReportDetails(reportId: string): Promise<MessageResponse<MedicalReportResponse>> {
    const response = await axiosClient.get<MessageResponse<MedicalReportResponse>>(`/reports/${reportId}`);
    return response.data;
  },

  async deleteReport(reportId: string): Promise<MessageResponse<void>> {
    const response = await axiosClient.delete<MessageResponse<void>>(`/reports/${reportId}`);
    return response.data;
  },
};

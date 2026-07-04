import { axiosClient } from "./axiosClient";

export interface ConversationResponse {
  id: string;
  user_id: string;
  report_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageResponse {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface ConversationHistoryResponse {
  conversation: ConversationResponse;
  messages: ChatMessageResponse[];
}

export interface ChatQueryResponse {
  response: string;
  symptoms: string[];
  recommendations: string[];
}

export interface MessageResponse<T> {
  message: string;
  data?: T;
}

export const chatApi = {
  async startChat(reportId?: string, title?: string): Promise<MessageResponse<ConversationResponse>> {
    const response = await axiosClient.post<MessageResponse<ConversationResponse>>("/chat/start", {
      report_id: reportId || null,
      title: title || null,
    });
    return response.data;
  },

  async sendMessage(conversationId: string, message: string): Promise<MessageResponse<ChatQueryResponse>> {
    const response = await axiosClient.post<MessageResponse<ChatQueryResponse>>(
      `/chat/${conversationId}/message`,
      { message },
      { timeout: 60000 } // Extended timeout for agent graph processing
    );
    return response.data;
  },

  async getSessionHistory(conversationId: string): Promise<MessageResponse<ConversationHistoryResponse>> {
    const response = await axiosClient.get<MessageResponse<ConversationHistoryResponse>>(
      `/chat/${conversationId}/history`
    );
    return response.data;
  },

  async getConversations(): Promise<MessageResponse<ConversationResponse[]>> {
    const response = await axiosClient.get<MessageResponse<ConversationResponse[]>>("/chat/");
    return response.data;
  },

  async deleteConversation(conversationId: string): Promise<MessageResponse<void>> {
    const response = await axiosClient.delete<MessageResponse<void>>(`/chat/${conversationId}`);
    return response.data;
  },
};

import { axiosClient } from "./axiosClient";

export interface ReminderResponse {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageResponse<T> {
  message: string;
  data?: T;
}

export const reminderApi = {
  async createReminder(
    title: string,
    description: string,
    reminderDate: string
  ): Promise<MessageResponse<ReminderResponse>> {
    const response = await axiosClient.post<MessageResponse<ReminderResponse>>("/reminders/", {
      title,
      description: description || null,
      reminder_date: reminderDate,
    });
    return response.data;
  },

  async listReminders(): Promise<MessageResponse<ReminderResponse[]>> {
    const response = await axiosClient.get<MessageResponse<ReminderResponse[]>>("/reminders/");
    return response.data;
  },

  async markReminderCompleted(reminderId: string, isCompleted: boolean = true): Promise<MessageResponse<ReminderResponse>> {
    const response = await axiosClient.patch<MessageResponse<ReminderResponse>>(
      `/reminders/${reminderId}/complete`,
      null,
      {
        params: {
          is_completed: isCompleted,
        },
      }
    );
    return response.data;
  },

  async deleteReminder(reminderId: string): Promise<MessageResponse<void>> {
    const response = await axiosClient.delete<MessageResponse<void>>(`/reminders/${reminderId}`);
    return response.data;
  },
};

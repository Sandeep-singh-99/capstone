import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  activeConversationId: string | null;
  isGenerating: boolean;
}

const initialState: ChatState = {
  activeConversationId: null,
  isGenerating: false,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversationId: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
  },
});

export const { setActiveConversationId, setIsGenerating } = chatSlice.actions;
export default chatSlice.reducer;

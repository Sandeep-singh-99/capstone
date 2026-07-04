import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/auth/authSlice";
import chatReducer from "../redux/chat/chatSlice";
import reportReducer from "../redux/report/reportSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    report: reportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

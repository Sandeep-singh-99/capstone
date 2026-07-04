import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { MedicalReportResponse } from "../../api/reportApi";

interface ReportState {
  selectedReport: MedicalReportResponse | null;
}

const initialState: ReportState = {
  selectedReport: null,
};

export const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setSelectedReport: (state, action: PayloadAction<MedicalReportResponse | null>) => {
      state.selectedReport = action.payload;
    },
    clearSelectedReport: (state) => {
      state.selectedReport = null;
    },
  },
});

export const { setSelectedReport, clearSelectedReport } = reportSlice.actions;
export default reportSlice.reducer;

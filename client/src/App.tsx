import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { AppRouter } from "./router";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        {/* Navbar: Hidden on portal views and auth flows */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/signup" element={null} />
          <Route path="/chat" element={null} />
          <Route path="/chat/*" element={null} />
          <Route path="/dashboard" element={null} />
          <Route path="/reports/*" element={null} />
          <Route path="/history" element={null} />
          <Route path="/specialists" element={null} />
          <Route path="/reminders" element={null} />
          <Route path="/admin" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>

        {/* Main Content Area */}
        <main className="flex-grow">
          <AppRouter />
        </main>

        {/* Footer: Hidden on portal views and auth flows */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/signup" element={null} />
          <Route path="/chat" element={null} />
          <Route path="/chat/*" element={null} />
          <Route path="/dashboard" element={null} />
          <Route path="/reports/*" element={null} />
          <Route path="/history" element={null} />
          <Route path="/specialists" element={null} />
          <Route path="/reminders" element={null} />
          <Route path="/admin" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

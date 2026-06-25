import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { AppRouter } from "./router";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        {/* Navbar: Hidden on login/signup/chat/admin */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/signup" element={null} />
          <Route path="/chat" element={null} />
          <Route path="/admin" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>

        {/* Main Content Area */}
        <main className="flex-grow">
          <AppRouter />
        </main>

        {/* Footer: Hidden on login/signup/chat/admin */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/signup" element={null} />
          <Route path="/chat" element={null} />
          <Route path="/admin" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

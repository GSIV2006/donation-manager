import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Campaigns from "./pages/Campaigns";
import Donors from "./pages/Donors";
import Donate from "./pages/Donate";
import DonationHistory from "./pages/DonationHistory";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/donors" element={<Donors />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/history" element={<DonationHistory />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <footer className="site-footer">
        <span>
          GiveFlow <i>Small acts. Lasting change.</i>
        </span>
        <span>Classroom demo · Fictional donor data</span>
      </footer>
    </BrowserRouter>
  );
}
export default App;

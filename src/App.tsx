import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import PortalLogin from './pages/portal/Login';
import PortalDashboard from './pages/portal/Dashboard';
import PortalDownload from './pages/portal/Download';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal/dashboard" element={<PortalDashboard />} />
        <Route path="/portal/download" element={<PortalDownload />} />
      </Routes>
    </Router>
  );
}

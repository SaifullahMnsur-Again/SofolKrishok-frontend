import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/FarmerLayout';
import StaffLayout from './components/StaffLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import DiseaseDetectPage from './pages/DiseaseDetectPage';
import SoilClassifyPage from './pages/SoilClassifyPage';
import LandsPage from './pages/LandsPage';
import FarmingWeatherPage from './pages/FarmingWeatherPage';
import MarketplacePage from './pages/MarketplacePage';
import MarketplaceProductDetailsPage from './pages/MarketplaceProductDetailsPage';
import MarketplaceConfirmPage from './pages/MarketplaceConfirmPage';
import FarmerOrdersPage from './pages/FarmerOrdersPage';
import FarmerConsultationPage from './pages/FarmerConsultationPage';
import FarmerTracksPage from './pages/FarmerTracksPage';
import TrackDetailPage from './pages/TrackDetailPage';
import MarketPredictionPage from './pages/MarketPredictionPage';
import FarmerProfitLossPage from './pages/FarmerProfitLossPage';
import FarmerBillingPage from './pages/FarmerBillingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ProfilePage from './pages/ProfilePage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import StaffMarketplacePage from './pages/StaffMarketplacePage';
import StaffSalesKanban from './pages/StaffSalesKanban';
import StaffConsultationPage from './pages/StaffConsultationPage';
import StaffFinancePage from './pages/StaffFinancePage';
import StaffServicePage from './pages/StaffServicePage';
import StaffModelHubPage from './pages/StaffModelHubPage';
import StaffUserManagementPage from './pages/StaffUserManagementPage';
import StaffAuditLogsPage from './pages/StaffAuditLogsPage';
import ConsultationRoomPage from './pages/ConsultationRoomPage';
import { LanguageProvider } from './context/LanguageContext';
/* Public pages */
import LandingPage from './pages/public/LandingPage';
import FeaturesPage from './pages/public/FeaturesPage';
import AboutPage from './pages/public/AboutPage';
import PricingPage from './pages/public/PricingPage';
import './index.css';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Farmer routes (Protected) */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage portal="farmer" />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/disease-detect" element={<DiseaseDetectPage />} />
              <Route path="/soil-classify" element={<SoilClassifyPage />} />
              <Route path="/lands" element={<LandsPage />} />
              <Route path="/weather" element={<FarmingWeatherPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/product/:productId" element={<MarketplaceProductDetailsPage />} />
              <Route path="/marketplace/confirm/:productId" element={<MarketplaceConfirmPage />} />
              <Route path="/orders" element={<FarmerOrdersPage />} />
              <Route path="/consultation" element={<FarmerConsultationPage />} />
              <Route path="/consultation/room/:id" element={<ConsultationRoomPage />} />
              <Route path="/tracks" element={<FarmerTracksPage />} />
              <Route path="/tracks/:id" element={<TrackDetailPage />} />
              <Route path="/market-trends" element={<MarketPredictionPage />} />
              <Route path="/profit-loss" element={<FarmerProfitLossPage />} />
              <Route path="/billing" element={<FarmerBillingPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
            </Route>

            {/* Staff routes (Protected) */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboardPage />} />
              <Route path="profile" element={<ProfilePage portal="staff" />} />
              <Route path="marketplace" element={<StaffMarketplacePage />} />
              <Route path="sales-kanban" element={<StaffSalesKanban />} />
              <Route path="consultation" element={<StaffConsultationPage />} />
              <Route path="consultation/room/:id" element={<ConsultationRoomPage />} />
              <Route path="finance" element={<StaffFinancePage />} />
              <Route path="service" element={<StaffServicePage />} />
              <Route path="model-hub" element={<StaffModelHubPage />} />
              <Route path="users" element={<StaffUserManagementPage />} />
              <Route path="audit-logs" element={<StaffAuditLogsPage />} />
            </Route>

            {/* Catch-all: redirect unknown paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </LanguageProvider>
  );
}

export default App;

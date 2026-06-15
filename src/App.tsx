import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { QuickDemoBanner } from './components/QuickDemoBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { Toaster } from 'sonner';

// Pages
import { Home } from './pages/Home';
import { SearchRooms } from './pages/SearchRooms';
import { RoomDetail } from './pages/RoomDetail';
import { RegisterRoom } from './pages/RegisterRoom';
import { MyListings } from './pages/MyListings';
import { MyRequests } from './pages/MyRequests';
import { Inbox } from './pages/Inbox';

export const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-300">
            
            {/* Architectural Switch & Demo Info Bar */}
            <QuickDemoBanner onOpenAuth={() => setIsAuthModalOpen(true)} />

            {/* Premium Immersive Navigation Bar */}
            <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

            {/* Custom Auth & OTP Simulation Modal */}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <Toaster richColors closeButton position="top-right" theme="system" />

            {/* Main App Page View Content */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchRooms onOpenAuth={() => setIsAuthModalOpen(true)} />} />
                <Route path="/room/:id" element={<RoomDetail onOpenAuth={() => setIsAuthModalOpen(true)} />} />
                <Route path="/register-room" element={<RegisterRoom onOpenAuth={() => setIsAuthModalOpen(true)} />} />
                <Route path="/my-listings" element={<MyListings onOpenAuth={() => setIsAuthModalOpen(true)} />} />
                <Route path="/my-requests" element={<MyRequests onOpenAuth={() => setIsAuthModalOpen(true)} />} />
                <Route path="/inbox" element={<Inbox onOpenAuth={() => setIsAuthModalOpen(true)} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Professional Footer */}
            <Footer />

          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
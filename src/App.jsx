import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import LandingPage        from './pages/landing/LandingPage';
import DiagnosticPage     from './pages/diagnostic/DiagnosticPage';
import LoginPage          from './pages/auth/LoginPage';
import SignUpPage         from './pages/auth/SignUpPage';
import ManualEntryPage    from './pages/manualEntry/ManualEntryPage';
import ResultsPage        from './pages/results/ResultsPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"             element={<LandingPage />}     />
          <Route path="/diagnostic"   element={<DiagnosticPage />}  />
          <Route path="/manual-entry" element={<ManualEntryPage />} />
          <Route path="/results"      element={<ResultsPage />}     />
          <Route path="/login"        element={<LoginPage />}       />
          <Route path="/sign-up"      element={<SignUpPage />}      />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

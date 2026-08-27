import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import SignIn from './pages/auth/SignIn';
import SelectType from './pages/auth/SelectType';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import FindMechanic from './pages/mechanic/FindMechanic';
import MechanicProfile from './pages/mechanic/MechanicProfile';
import Directions from './pages/mechanic/Directions';
import UsageRequired from './pages/mechanic/UsageRequired';
import Dashboard from './pages/mechanic/Dashboard';
import Payments from './pages/Payments';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/register" element={<SelectType />} />
              <Route path="/auth/signup" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/find" element={<FindMechanic />} />
              <Route path="/mechanics/:id" element={<MechanicProfile />} />
              <Route path="/directions/:id" element={
                <ProtectedRoute><Directions /></ProtectedRoute>
              } />
              <Route path="/usage" element={
                <ProtectedRoute><UsageRequired /></ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute><Payments /></ProtectedRoute>
              } />
              <Route path="/change-password" element={
                <ProtectedRoute><ChangePassword /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute roles={['mechanic']}><Dashboard /></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

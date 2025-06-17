import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Otp from '../pages/Otp';
import CompanySignup from '../pages/CompanySignup';
import EmailVerification from '../pages/EmailVerification';
import PasswordChangeOtp from '../pages/PasswordChangeOtp';
import CompanyProfile from '../pages/Company/CompanyProfile';
import FrontofficeProfile from '../pages/Frontoffice/FrontofficeProfile';
import ExecutiveProfile from '../pages/Executive/ExecutiveProfile';
import SalesManagerProfile from '../pages/SalesManager/SalesManagerProfile';
import PurchaseProfile from '../pages/Purchase/PurchaseProfile';
import BillingProfile from '../pages/Billing/BillingProfile';
import BookingProfile from '../pages/Booking/BookingProfile';
import CustomerCareProfile from '../pages/Customercare/CustomerCareProfile';
//import ProtectedRoute from '../components/ProtectedRoute';
import ProtectedRoute from '../components/protectedRoute';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/PasswordChangeOtp" element={<PasswordChangeOtp />} />
      <Route path="/EmailVerification" element={<EmailVerification />} />
      <Route path="/register-company" element={<CompanySignup />} />
      <Route
        path="/company-profile"
        element={
          <ProtectedRoute requiredRole="agency">
            <CompanyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/frontoffice-profile"
        element={
          <ProtectedRoute requiredRole="front office">
            <FrontofficeProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/executive-profile"
        element={
          <ProtectedRoute requiredRole="executive">
            <ExecutiveProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-profile"
        element={
          <ProtectedRoute requiredRole="sales">
            <SalesManagerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase-profile"
        element={
          <ProtectedRoute requiredRole="purchase">
            <PurchaseProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing-profile"
        element={
          <ProtectedRoute requiredRole="billing">
            <BillingProfile/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-profile"
        element={
          <ProtectedRoute requiredRole="booking">
            <BookingProfile/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customcare-profile"
        element={
          <ProtectedRoute requiredRole="customer care">
            <CustomerCareProfile/>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default Router;

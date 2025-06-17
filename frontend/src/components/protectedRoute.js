import React from 'react';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authContext } from '../context/authContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, token } = useContext(authContext);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      
      navigate('/login');
    } else if (requiredRole && role !== requiredRole) {
      toast.error('You are not authorized to access this page.');
      navigate('/login');
    }
  }, [token, role, requiredRole, navigate]);

  return token && (!requiredRole || role === requiredRole) ? children : null;
};

export default ProtectedRoute;
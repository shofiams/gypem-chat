import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await authService.logoutPeserta();
      navigate('/login');
    };

    performLogout();
  }, [navigate]);

  return null;
};

export default Logout;
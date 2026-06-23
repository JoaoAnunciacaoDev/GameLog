import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AuthForm from '../../components/AuthForm/AuthForm';
import Toast from '../../components/Toast/Toast';
import { useToast } from '../../hooks/useToast';

export default function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const handleLogin = async (username: string, password: string) => {
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await api.post('/login', params);
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ocorreu um erro no servidor.');
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    setError('');
    try {
      await api.post('/users/', { username, email, password });
      showToast('Conta criada com sucesso! Faça o login agora.', 'success');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ocorreu um erro no servidor.');
    }
  };

  return (
    <>
      <AuthForm
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={error}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
}
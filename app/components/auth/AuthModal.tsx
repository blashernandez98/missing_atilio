'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/modal';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'register';

function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setActiveTab('login');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'register' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        const result = await login(username, password);
        if (result.success) {
          onClose();
        } else {
          setError(result.error || 'Error al iniciar sesión');
        }
      } else {
        const result = await register(username, password);
        if (result.success) {
          // Migration is now handled internally by register()
          onClose();
        } else {
          setError(result.error || 'Error al crear cuenta');
        }
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col rounded-xl items-center relative p-6 sm:p-8 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white border-2 border-red-500 shadow-2xl min-w-[300px] sm:min-w-[350px]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors p-1"
          aria-label="Cerrar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6">
          {activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>

        {/* Tabs */}
        <div className="flex w-full mb-6 bg-white/10 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'login'
                ? 'bg-red-600 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'register'
                ? 'bg-red-600 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm text-white/80 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 15))}
              placeholder="Tu nombre de usuario"
              maxLength={15}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/50"
              disabled={isSubmitting}
              autoComplete="username"
            />
            <p className="text-xs text-white/50 mt-1">
              {username.length}/15 caracteres
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-white/80 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.slice(0, 15))}
              placeholder="Tu contraseña"
              maxLength={15}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/50"
              disabled={isSubmitting}
              autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
            />
            <p className="text-xs text-white/50 mt-1">
              {password.length}/15 caracteres (mínimo 6)
            </p>
          </div>

          {/* Confirm Password (register only) */}
          {activeTab === 'register' && (
            <div>
              <label className="block text-sm text-white/80 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value.slice(0, 15))}
                placeholder="Repetí tu contraseña"
                maxLength={15}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/50"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-red-300 text-sm text-center bg-red-900/30 rounded-lg py-2">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !username || !password || (activeTab === 'register' && !confirmPassword)}
            className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Cargando...'
              : activeTab === 'login'
              ? 'Ingresar'
              : 'Crear Cuenta'}
          </button>
        </form>

        {/* Info Text */}
        {activeTab === 'register' && (
          <p className="text-xs text-white/60 text-center mt-4">
            Al crear una cuenta, tus partidas completadas se guardarán y podrás ver tus rachas.
          </p>
        )}
      </div>
    </Modal>
  );
}

export default AuthModal;

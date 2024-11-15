import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const query = new URLSearchParams(hash);
        const accessToken = query.get('access_token');
        const refreshToken = query.get('refresh_token');
        const type = query.get('type');

        if (type === 'recovery' && accessToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) throw error;
        }
      } catch (err) {
        console.error('Error setting session:', err);
        setError('Invalid or expired reset link. Please try again.');
      }
    };

    handlePasswordReset();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage('Password successfully reset! Redirecting to login...');
      
      // Sign out after password reset
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-blue-200">
            Please enter your new password
          </p>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg bg-green-500/10 p-4 backdrop-blur-sm"
          >
            <div className="text-sm text-green-200">{message}</div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg bg-red-500/10 p-4 backdrop-blur-sm"
          >
            <div className="text-sm text-red-200">{error}</div>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="new-password" className="sr-only">New Password</label>
              <input
                id="new-password"
                type="password"
                required
                className="appearance-none rounded-t-xl relative block w-full px-4 py-3 border border-white/10 placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                required
                className="appearance-none rounded-b-xl relative block w-full px-4 py-3 border border-white/10 placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
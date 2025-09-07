import React, { useState, useEffect } from 'react';
import { Music, AlertCircle } from 'lucide-react';
import { login } from '../lib/api';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Supabase wird nicht mehr verwendet; keine DB-Connectivity-Prüfung nötig

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      await login(username.trim(), password);
      // Nach erfolgreichem Login Seite neu laden, damit Session im App-State erkannt wird
      window.location.reload();
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4ECBD9]/10 mb-4 shadow-glow-cyan">
            <Music className="h-8 w-8 text-[#4ECBD9]" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4ECBD9] to-[#F471B5] text-transparent bg-clip-text mb-2">
            SoundScheduler
          </h1>
          <p className="text-[#909296]">
            Verwalte und plane deine Soundwiedergabe
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-neutral-800/50 backdrop-blur-sm border-[0.1px] border-[#4ECBD9] rounded-xl p-6 space-y-4">
          {/* Supabase-Statusmeldung entfernt */}

          {error && (
            <div className="p-4 rounded-lg bg-[#F471B5]/10 border border-[#F471B5]/20 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-[#F471B5] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#F471B5]">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-[#C1C2C5]">
              Benutzername
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-700/50 border border-[#4ECBD9]/10 rounded-lg text-[#C1C2C5] placeholder-[#909296] focus:outline-none focus:ring-2 focus:ring-[#4ECBD9]/20 focus:border-transparent transition-colors"
              placeholder="Geben Sie Ihren Benutzernamen ein"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[#C1C2C5]">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-700/50 border border-[#4ECBD9]/10 rounded-lg text-[#C1C2C5] placeholder-[#909296] focus:outline-none focus:ring-2 focus:ring-[#4ECBD9]/20 focus:border-transparent transition-colors"
              placeholder="Geben Sie Ihr Passwort ein"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 text-sm font-medium rounded-xl text-[#C1C2C5] bg-[#4ECBD9]/10 border border-[#4ECBD9]/30 hover:bg-[#4ECBD9]/20 hover:border-[#4ECBD9]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#4ECBD9]/10 disabled:hover:border-[#4ECBD9]/30"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#4ECBD9]/30 border-t-[#4ECBD9] rounded-full animate-spin" />
            ) : (
              'Anmelden'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
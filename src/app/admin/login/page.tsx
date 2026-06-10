'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAdminAuth } from '@/store/AdminAuthContext';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const ok = await login(password);
    setLoading(false);
    if (ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Mot de passe incorrect. Réessayez.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#C9A84C10_0%,_transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 relative mb-4">
            <Image
              src="/images/logos/logo-simplified.png"
              alt="Malkia B Cosmetics"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-white font-serif text-2xl font-light tracking-wide">
            Malkia B Cosmetics
          </h1>
          <p className="text-[#C9A84C] text-sm mt-1 font-light tracking-wider">
            ESPACE ADMINISTRATEUR
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Connexion sécurisée</p>
              <p className="text-white/40 text-xs">Accès réservé à l&apos;administrateur</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 tracking-wider uppercase">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs text-center py-2 px-3 bg-red-400/10 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3.5 bg-[#C9A84C] hover:bg-[#b8973d] disabled:bg-[#C9A84C]/40 text-[#0D0D0D] font-semibold rounded-xl transition-all duration-200 text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin" />
                  Connexion…
                </>
              ) : (
                'Accéder au tableau de bord'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2025 Malkia B Cosmetics · Panneau d&apos;administration
        </p>
      </div>
    </div>
  );
}

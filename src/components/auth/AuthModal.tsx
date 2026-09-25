import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  KeyRound,
  Plane
} from 'lucide-react';
import { FcpLogo } from '../common/FcpLogo';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, teamMembers, showToast } = useWorkspace();

  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('••••••••••••');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = teamMembers.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      showToast(`Authenticated as ${matched.name} (${matched.role.toUpperCase()})`);
    } else {
      showToast(`Logged in successfully`);
    }
    onClose();
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      showToast(`Password recovery link dispatched to ${email}`);
    }, 500);
  };

  const handleQuickLogin = (role: UserRole) => {
    const member = teamMembers.find((m) => m.role === role) || teamMembers[0];
    setCurrentUser(member);
    setEmail(member.email);
    showToast(`Switched account to ${member.name} (${member.role.toUpperCase()})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2A43]/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Brand */}
        <div className="bg-[#0A2A43] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-3">
            <FcpLogo variant="icon" size="lg" theme="dark" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">FCP SUNRISE WORKSPACE</h2>
          <p className="text-xs text-[#1498CC] font-semibold mt-0.5 uppercase tracking-wider">
            Travel & Tours Inc. Private Vault
          </p>
          <p className="text-[11px] text-slate-300 italic mt-2">
            “Creating Memories, Breaking the Distance.”
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-[#1498CC]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setResetSent(false);
                    }}
                    className="text-[#1498CC] hover:underline text-[11px]"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-[#1498CC]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1498CC] hover:bg-[#0f82b0] active:scale-[0.98] text-white font-bold rounded-lg transition-all shadow-xs"
              >
                Sign In to FCP Workspace
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-3.5">
              <div className="text-center space-y-1">
                <KeyRound className="w-8 h-8 text-[#1498CC] mx-auto mb-1" />
                <h4 className="font-bold text-slate-900 text-sm">Reset Account Password</h4>
                <p className="text-slate-500 text-[11px]">
                  Enter your registered travel agency email to receive recovery instructions.
                </p>
              </div>

              {resetSent ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                  <p className="font-semibold">Reset Instructions Dispatched</p>
                  <p className="text-[11px]">Check your inbox for a secure one-time authentication link.</p>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-[#1498CC]"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Back to Sign In
                </button>
                {!resetSent && (
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#1498CC] hover:bg-[#0f82b0] text-white font-semibold rounded-lg"
                  >
                    Send Reset Link
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Quick Demo 1-Click Evaluation Accounts */}
          <div className="pt-3 border-t border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Quick Switch Role for Evaluation:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('manager')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
              >
                <div className="font-bold text-slate-800">Therese Coo</div>
                <div className="text-slate-400 text-[10px]">Tours Manager</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
              >
                <div className="font-bold text-slate-800">Aimie Hilario</div>
                <div className="text-slate-400 text-[10px]">Executive Admin</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
              >
                <div className="font-bold text-slate-800">Chelsea Maligalig</div>
                <div className="text-slate-400 text-[10px]">Marketing Staff</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('viewer')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
              >
                <div className="font-bold text-slate-800">Adrian Hidalgo</div>
                <div className="text-slate-400 text-[10px]">Logistics Viewer</div>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Encrypted Internal Session · FCP Sunrise Travel & Tours Inc.
        </div>
      </div>
    </div>
  );
};

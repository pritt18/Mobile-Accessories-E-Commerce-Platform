import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Phone, CheckCircle, AlertCircle, Key, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, sendOtp, forgotPassword, resetPassword, googleLogin } = useAuth();
  
  // Modal Views: 'login' | 'register_form' | 'register_otp' | 'forgot_request' | 'forgot_otp'
  const [view, setView] = useState('login');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('');

  // Forgot password fields
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI status
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const resetAll = () => {
    setError('');
    setSuccess('');
    setLoading(false);
    setOtp('');
    setForgotOtp('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(identifier, password, rememberMe);
    setLoading(false);

    if (res.success) {
      setSuccess('Logged in successfully!');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 700);
    } else {
      setError(res.message);
    }
  };

  // Step 1: Send Registration OTP
  const handleStartRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await sendOtp(email, 'REGISTRATION');
    setLoading(false);

    if (res.success) {
      const generated = res.data?.demoOtp || '123456';
      setDemoOtpCode(generated);
      setView('register_otp');
      setTimer(60);
      setTimerActive(true);
      setSuccess(`Verification code sent to ${email}`);
    } else {
      setError(res.message);
    }
  };

  // Step 2: Verify OTP & Complete Registration
  const handleCompleteRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await register({
      name,
      email,
      mobile,
      password: regPassword,
      otp: otp.trim(),
    });
    setLoading(false);

    if (res.success) {
      setSuccess('Account verified & created! Welcome to Mobixia.');
      setTimeout(() => {
        onClose();
        setSuccess('');
        setView('login');
      }, 1000);
    } else {
      setError(res.message);
    }
  };

  // Resend Registration OTP
  const handleResendOtp = async () => {
    if (timerActive) return;
    setError('');
    const res = await sendOtp(email, 'REGISTRATION');
    if (res.success) {
      const generated = res.data?.demoOtp || '123456';
      setDemoOtpCode(generated);
      setTimer(60);
      setTimerActive(true);
      setSuccess('A new verification code has been sent!');
    } else {
      setError(res.message);
    }
  };

  // Forgot Password: Request OTP
  const handleRequestForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await forgotPassword(forgotIdentifier);
    setLoading(false);

    if (res.success) {
      const generated = res.data?.demoOtp || '123456';
      setDemoOtpCode(generated);
      setView('forgot_otp');
      setTimer(60);
      setTimerActive(true);
      setSuccess('Password reset code sent!');
    } else {
      setError(res.message);
    }
  };

  // Forgot Password: Reset with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await resetPassword(forgotIdentifier, forgotOtp.trim(), newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess('Password reset successfully! Please sign in.');
      setTimeout(() => {
        setView('login');
        setSuccess('');
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  // Google Social Login (Phase 2 demo)
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const mockGoogle = {
      name: 'Google Customer',
      email: 'customer.google@mobixia.in',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };
    const res = await googleLogin(mockGoogle);
    setLoading(false);
    if (res.success) {
      setSuccess('Logged in via Google!');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 700);
    } else {
      setError(res.message);
    }
  };

  const fillDemo = (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        view === 'login'
          ? 'Sign in to Mobixia'
          : view.startsWith('register')
          ? 'Create Customer Account'
          : 'Reset Password'
      }
    >
      {/* Top Tabs (Only on Login & Register form) */}
      {(view === 'login' || view === 'register_form') && (
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => {
              setView('login');
              resetAll();
            }}
            className={`flex-1 pb-3 text-xs font-bold transition border-b-2 text-center ${
              view === 'login'
                ? 'text-brand-600 border-brand-600'
                : 'text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setView('register_form');
              resetAll();
            }}
            className={`flex-1 pb-3 text-xs font-bold transition border-b-2 text-center ${
              view === 'register_form'
                ? 'text-brand-600 border-brand-600'
                : 'text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            Register with OTP
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center space-x-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2">
          <CheckCircle size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* VIEW 1: LOGIN */}
      {view === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email or Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@mobixia.com or 9876543210"
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
              />
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => {
                  setView('forgot_request');
                  resetAll();
                }}
                className="text-[11px] text-brand-600 font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
              />
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20 active:scale-[0.99]"
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
          </button>

          {/* Google Social Login */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative px-3 bg-white text-[11px] text-slate-400">or continue with</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2 px-4 border border-gray-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center space-x-2 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Quick Demo Autofill Box */}
          <div className="mt-5 pt-4 border-t border-gray-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Key size={12} className="text-amber-500" />
              <span>One-Click Test Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillDemo('admin@mobixia.com', 'admin123password')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-lg text-cyan-700 transition"
              >
                <div className="font-bold">Admin Panel</div>
                <div className="text-[10px] text-slate-500">admin@mobixia.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('superadmin@mobixia.in', 'Admin@12345')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-lg text-amber-700 transition"
              >
                <div className="font-bold">Super Admin</div>
                <div className="text-[10px] text-slate-500">Full System Access</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('john@mobixia.com', 'password123')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-lg text-purple-700 transition"
              >
                <div className="font-bold">Customer</div>
                <div className="text-[10px] text-slate-500">john@mobixia.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('manager@mobixia.in', 'Manager@12345')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-lg text-emerald-700 transition"
              >
                <div className="font-bold">Staff Manager</div>
                <div className="text-[10px] text-slate-500">Inventory & Orders</div>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* VIEW 2: REGISTER FORM (STEP 1) */}
      {view === 'register_form' && (
        <form onSubmit={handleStartRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
              />
              <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address (OTP will be sent here)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@example.com"
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
              />
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number (For Delivery SMS / OTP)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
              />
              <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
              />
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20 active:scale-[0.99] mt-2 flex items-center justify-center space-x-2"
          >
            <ShieldCheck size={16} />
            <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
          </button>
        </form>
      )}

      {/* VIEW 3: REGISTER OTP VERIFICATION (STEP 2) */}
      {view === 'register_otp' && (
        <form onSubmit={handleCompleteRegister} className="space-y-4">
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl text-center space-y-2">
            <div className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Verify Your Account</h4>
            <p className="text-[11px] text-slate-600">
              We have sent a 6-digit OTP to <span className="font-semibold text-slate-900">{email}</span>
            </p>
            {demoOtpCode && (
              <div
                onClick={() => setOtp(demoOtpCode)}
                className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-mono font-bold text-amber-800 cursor-pointer hover:bg-amber-100 transition"
              >
                ✨ Demo OTP: <span className="underline">{demoOtpCode}</span> (Click to auto-fill)
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
              Enter 6-Digit OTP Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full h-12 text-center tracking-[0.4em] font-mono text-lg font-bold bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              {timerActive ? `Resend code in ${timer}s` : "Didn't receive code?"}
            </span>
            <button
              type="button"
              disabled={timerActive}
              onClick={handleResendOtp}
              className={`font-semibold ${
                timerActive ? 'text-slate-300 cursor-not-allowed' : 'text-brand-600 hover:underline'
              }`}
            >
              Resend OTP
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20 active:scale-[0.99]"
          >
            {loading ? 'Verifying...' : 'Verify & Complete Registration'}
          </button>

          <button
            type="button"
            onClick={() => setView('register_form')}
            className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1"
          >
            <ArrowLeft size={14} />
            <span>Edit details</span>
          </button>
        </form>
      )}

      {/* VIEW 4: FORGOT PASSWORD REQUEST */}
      {view === 'forgot_request' && (
        <form onSubmit={handleRequestForgot} className="space-y-4">
          <div className="text-center space-y-1">
            <h4 className="text-xs font-bold text-slate-900">Forgot Your Password?</h4>
            <p className="text-[11px] text-slate-500">
              Enter your registered email or mobile number to receive a 6-digit password reset code.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email or Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={forgotIdentifier}
                onChange={(e) => setForgotIdentifier(e.target.value)}
                placeholder="rohan@example.com or 9876543210"
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
              />
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20 active:scale-[0.99]"
          >
            {loading ? 'Sending Code...' : 'Send Reset Code'}
          </button>

          <button
            type="button"
            onClick={() => setView('login')}
            className="w-full py-1 text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1"
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </button>
        </form>
      )}

      {/* VIEW 5: FORGOT PASSWORD VERIFY & RESET */}
      {view === 'forgot_otp' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-center space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">Enter Reset Code</h4>
            <p className="text-[11px] text-slate-600">
              Sent to: <span className="font-semibold text-slate-900">{forgotIdentifier}</span>
            </p>
            {demoOtpCode && (
              <div
                onClick={() => setForgotOtp(demoOtpCode)}
                className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-mono font-bold text-amber-800 cursor-pointer hover:bg-amber-100 transition"
              >
                ✨ Demo OTP: <span className="underline">{demoOtpCode}</span> (Click to auto-fill)
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              6-Digit Reset Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={forgotOtp}
              onChange={(e) => setForgotOtp(e.target.value)}
              placeholder="123456"
              className="w-full h-10 text-center tracking-widest font-mono text-base font-bold bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Create New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
              />
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20 active:scale-[0.99]"
          >
            {loading ? 'Updating Password...' : 'Reset Password & Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setView('login')}
            className="w-full py-1 text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1"
          >
            <ArrowLeft size={14} />
            <span>Cancel</span>
          </button>
        </form>
      )}
    </Modal>
  );
};

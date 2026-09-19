'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { USERS } from '@/data/users';
import { api } from '@/lib/api';

export function LoginView() {
  const router = useRouter();
  const { currentUser, setCurrentUser, theme, toggleTheme, setIsAuthenticated } = useAppContext();

  // Authentication mode: 'password' | 'otp-request' | 'otp-verify' | 'otp-success'
  const [authMode, setAuthMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: otp + new pass, 3: success
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState(null);

  // OTP inputs refs
  const inputRefs = useRef([]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (authMode === 'otp-verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authMode, countdown]);

  // Handle remote termination banner
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const notice = sessionStorage.getItem('pulsepm_termination_notice');
      const params = new URLSearchParams(window.location.search);
      if (notice) {
        setErrorMsg(notice);
        sessionStorage.removeItem('pulsepm_termination_notice');
      } else if (params.get('reason') === 'terminated' || params.get('terminated') === 'true') {
        setErrorMsg('Your session was remotely terminated by an administrator. Please sign in again.');
      }
    }
  }, []);



  const handleDigitChange = (index, value) => {
    const val = value.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = val;
    setOtpDigits(updated);

    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pasted.length >= 6) {
      const digits = pasted.slice(0, 6).split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleLoginSuccess = (userToLogin, token, sessionId) => {
    const targetUser =
      userToLogin ||
      USERS.find(
        (u) =>
          u.email?.toLowerCase() === email.toLowerCase() ||
          u.email?.toLowerCase() === otpEmail.toLowerCase()
      ) ||
      USERS[0];

    setCurrentUser(targetUser);

    if (setIsAuthenticated) {
      setIsAuthenticated(true);
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pulsepm_current_user', JSON.stringify(targetUser));
        localStorage.setItem('pulsepm_is_authenticated', 'true');
        if (token) {
          localStorage.setItem('pulsepm_jwt_token', token);
        }
        if (sessionId) {
          localStorage.setItem('pulsepm_session_id', sessionId);
        }
      } catch (err) {}
    }

    setLoadingMessage(`Welcome back, ${targetUser.name || 'Member'}! Loading workspace...`);
    setIsLoading(true);

    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedbackMsg(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter both your work email and password.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Authenticating with Shoolin Innovations Limited security gateway...');

    try {
      const res = await api.auth.login({ email: cleanEmail, password: cleanPassword });
      if (res && res.user) {
        handleLoginSuccess(res.user, res.token, res.sessionId);
      } else {
        throw new Error('Authentication failed. No user returned.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Invalid email or password. Please verify your credentials.');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedbackMsg(null);

    const cleanEmail = otpEmail.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your work email address.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage(`Generating secure 6-digit OTP for ${cleanEmail}...`);

    try {
      await api.auth.sendOtp(cleanEmail);
      setIsLoading(false);
      setCountdown(30);
      setCanResend(false);
      setAuthMode('otp-verify');
      setFeedbackMsg(`Verification code dispatched to ${cleanEmail}`);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to dispatch security code.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedbackMsg(null);

    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Verifying one-time security code...');

    try {
      const res = await api.auth.verifyOtp(otpEmail.trim(), otpCode);
      setIsLoading(false);
      setAuthMode('otp-success');
      setTimeout(() => {
        handleLoginSuccess(res.user, res.token, res.sessionId);
      }, 800);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    }
  };

  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccessMsg(null);

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail) {
      setResetError('Please enter your registered work email address.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.auth.forgotPassword(cleanEmail);
      setResetStep(2);
      setResetSuccessMsg(res.message || `Password recovery code dispatched to ${cleanEmail}`);
    } catch (err) {
      setResetError(err.message || 'No registered account found for this email address.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccessMsg(null);

    const cleanOtp = resetOtp.trim();
    const cleanPass = newPassword.trim();

    if (!cleanOtp || !cleanPass) {
      setResetError('Please enter both the 6-digit OTP and your new password.');
      return;
    }

    if (cleanPass.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.auth.resetPassword({
        email: resetEmail.trim(),
        otp: cleanOtp,
        newPassword: cleanPass,
      });
      setResetStep(3);
      setResetSuccessMsg(res.message || 'Password successfully configured! You can now log in.');
    } catch (err) {
      setResetError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(30);
    setErrorMsg(null);
    try {
      await api.auth.sendOtp(otpEmail.trim());
      setFeedbackMsg(`New 6-digit code sent to ${otpEmail.trim()}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code');
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none transition-colors duration-200">

      {/* Background Decorative Glows (Mode-Adaptive) */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand/10 dark:bg-brand/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-amber-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* Floating Color Mode Toggle Switch (Top Right, inside Login Screen) */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 shadow-md hover:border-brand transition-all cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Main Login Screen Content (No Header, Branding Embedded Inside) */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 my-auto">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Hero & Enterprise Showcase (Desktop) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-4">

            {/* Shoolin Innovations Full Brand Banner */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Shoolin Innovations Limited"
                  className="w-14 h-14 object-contain drop-shadow-sm rounded-xl"
                />
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                    Shoolin Innovations Limited
                  </h1>
                  <span className="text-xs text-brand font-semibold tracking-wide">
                    Enterprise Project Management &amp; Operations OS
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/30 text-brand text-xs font-bold w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero-Trust RBAC &amp; Project Governance Platform</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Welcome to the centralized project operations workspace of <strong>Shoolin Innovations Limited</strong>.
              Manage milestones, hierarchical sprint execution, granular access controls, and cross-departmental delivery.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Tit-to-Bit Access Control</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">34-capability matrix &amp; user overrides.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
                <Layers className="w-4 h-4 text-brand mb-1.5" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Categorized Scope Masters</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Task, Project, and Global lifecycles.</p>
              </div>
            </div>

            {/* Compliance & Trust Badges */}
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Enterprise TLS
              </span>
              <span>•</span>
              <span>256-bit Encryption</span>
              <span>•</span>
              <span>99.99% Uptime</span>
            </div>
          </div>

          {/* Right Authentication Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6 relative overflow-hidden transition-colors duration-200">

              {/* Card Embedded Branding Header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="Shoolin Innovations Limited Logo"
                    className="w-10 h-10 object-contain rounded-lg"
                  />
                  <div className="text-left">
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                      Shoolin Innovations Limited
                    </h2>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Project Management System
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Sign in to Workspace
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Authenticate via Password or Secure Email OTP
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs (Password vs Email OTP) */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setFeedbackMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${authMode === 'password'
                    ? 'bg-brand text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'otp-verify' ? 'otp-verify' : 'otp-request');
                    setFeedbackMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${authMode.startsWith('otp')
                    ? 'bg-brand text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Email OTP</span>
                </button>
              </div>

              {/* Prominent Red Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-1 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="break-words">{errorMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMsg(null)}
                    className="text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 p-0.5 cursor-pointer shrink-0"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Success/Feedback Alert */}
              {feedbackMsg && !errorMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/80 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              {/* Loader Overlay if Submitting */}
              {isLoading && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/loader.gif"
                    alt="Authenticating..."
                    className="w-14 h-14 object-contain drop-shadow-md"
                  />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {loadingMessage || 'Processing authentication...'}
                  </p>
                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 1: PASSWORD LOGIN FORM */}
              {/* ================================================================= */}
              {!isLoading && authMode === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        placeholder="admin@shoolin.co.uk"
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none font-medium transition-all ${errorMsg
                          ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-300 dark:border-slate-800 focus:border-brand focus:ring-1 focus:ring-brand'
                          }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(email);
                          setForgotModalOpen(true);
                        }}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        placeholder="Enter your security password"
                        className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none font-medium transition-all ${errorMsg
                          ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-300 dark:border-slate-800 focus:border-brand focus:ring-1 focus:ring-brand'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-brand focus:ring-brand"
                      />
                      <span>Keep me signed in for 30 days</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In to Shoolin Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* ================================================================= */}
              {/* TAB 2: OTP STEP 1 - REQUEST EMAIL CODE ONLY */}
              {/* ================================================================= */}
              {!isLoading && authMode === 'otp-request' && (
                <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                      Step 1 of 2: Request Security Code
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enter Work Email</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      We will generate a 6-digit one-time passcode to your email.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => {
                          setOtpEmail(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        placeholder="admin@shoolin.co.uk"
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none font-medium transition-all ${errorMsg
                          ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-300 dark:border-slate-800 focus:border-brand focus:ring-1 focus:ring-brand'
                          }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send Email OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('password')}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      ← Return to password login
                    </button>
                  </div>
                </form>
              )}

              {/* ================================================================= */}
              {/* TAB 2: OTP STEP 2 - VERIFY EMAIL OTP CODE */}
              {/* ================================================================= */}
              {!isLoading && authMode === 'otp-verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                      Step 2 of 2: Security Verification
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enter 6-Digit Code</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Dispatched to <span className="font-semibold text-slate-800 dark:text-slate-200">{otpEmail}</span>
                    </p>
                  </div>

                  {/* 6 Digit Auto-Advancing Input Boxes */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-2" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-base sm:text-lg font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/30 text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      disabled={!canResend}
                      onClick={handleResendOtp}
                      className={`flex items-center gap-1 font-semibold ${canResend
                        ? 'text-brand hover:underline cursor-pointer'
                        : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend Email OTP {countdown > 0 && `(${countdown}s)`}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthMode('otp-request')}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Change Email
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify &amp; Enter Workspace</span>
                  </button>
                </form>
              )}

              {/* ================================================================= */}
              {/* TAB 2: OTP STEP 3 - SUCCESS STATE */}
              {/* ================================================================= */}
              {!isLoading && authMode === 'otp-success' && (
                <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Email Identity Verified!</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Token authenticated. Launching Shoolin Innovations Limited workspace...
                    </p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/loader.gif" alt="Loading..." className="w-10 h-10 object-contain mx-auto" />
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/80">
        <p>© 2026 Shoolin Innovations Limited. All rights reserved. Zero-Trust RBAC Governance.</p>
      </footer>

      {/* FORGOT PASSWORD / SET PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand" />
                <span>{resetStep === 1 ? 'Password Recovery' : resetStep === 2 ? 'Configure New Password' : 'Password Configured'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(false);
                  setResetStep(1);
                  setResetError(null);
                  setResetSuccessMsg(null);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Feedback */}
            {resetError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{resetError}</span>
              </div>
            )}

            {/* Info / Success Feedback */}
            {resetSuccessMsg && resetStep === 2 && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {/* STEP 1: REQUEST OTP */}
            {resetStep === 1 && (
              <form onSubmit={handleRequestResetOtp} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Enter your registered work email address. We will dispatch a 6-digit verification code to set your new security password.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (resetError) setResetError(null);
                      }}
                      placeholder="name@shoolin.co.uk"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending...' : 'Send Verification OTP'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: VERIFY OTP AND SET PASSWORD */}
            {resetStep === 2 && (
              <form onSubmit={handleSetNewPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => {
                      setResetOtp(e.target.value);
                      if (resetError) setResetError(null);
                    }}
                    placeholder="e.g. 123456"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New Security Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (resetError) setResetError(null);
                      }}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-3.5 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (resetError) setResetError(null);
                    }}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand font-medium"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? 'Updating...' : 'Set & Save Password'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS STATE */}
            {resetStep === 3 && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Password Configured!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {resetSuccessMsg || 'Your new security credentials are saved. You can now sign in.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(resetEmail);
                    setPassword('');
                    setForgotModalOpen(false);
                    setResetStep(1);
                  }}
                  className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Proceed to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

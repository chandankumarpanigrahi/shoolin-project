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
  Check
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { USERS } from '@/data/users';

export function LoginView() {
  const router = useRouter();
  const { currentUser, setCurrentUser, theme, toggleTheme, setIsAuthenticated } = useAppContext();

  // Authentication mode: 'password' | 'otp-request' | 'otp-verify' | 'otp-success'
  const [authMode, setAuthMode] = useState('password');
  const [email, setEmail] = useState('alex.rivera@shoolin.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState('alex.rivera@shoolin.com');
  const [rememberMe, setRememberMe] = useState(true);
  const [otpDigits, setOtpDigits] = useState(['4', '8', '2', '9', '1', '7']);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

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

  const handleLoginSuccess = (userToLogin) => {
    const targetUser = userToLogin || USERS.find((u) => u.email === email || u.email === otpEmail) || USERS[0];
    setCurrentUser(targetUser);

    if (setIsAuthenticated) {
      setIsAuthenticated(true);
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pulsepm_current_user', JSON.stringify(targetUser));
        localStorage.setItem('pulsepm_is_authenticated', 'true');
      } catch (err) { }
    }

    setLoadingMessage(`Welcome back, ${targetUser.name}! Loading workspace...`);
    setIsLoading(true);

    setTimeout(() => {
      router.push('/dashboard');
    }, 900);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage('Authenticating with Shoolin Innovations Limited security gateway...');
    setTimeout(() => {
      setIsLoading(false);
      handleLoginSuccess();
    }, 800);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage(`Generating secure 6-digit OTP for ${otpEmail}...`);
    setTimeout(() => {
      setIsLoading(false);
      setCountdown(30);
      setCanResend(false);
      setAuthMode('otp-verify');
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }, 600);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage('Verifying one-time security code...');
    setTimeout(() => {
      setIsLoading(false);
      setAuthMode('otp-success');
      setTimeout(() => {
        handleLoginSuccess(USERS[0]);
      }, 900);
    }, 700);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(30);
    setOtpDigits(['5', '1', '9', '3', '0', '7']);
    setFeedbackMsg(`New 6-digit code sent to ${otpEmail}`);
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

              {/* Feedback Alert if present */}
              {feedbackMsg && (
                <div className="p-3 bg-brand/10 border border-brand/30 rounded-xl text-xs text-brand font-medium flex items-center gap-2 animate-in fade-in">
                  <Sparkles className="w-4 h-4 shrink-0" />
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
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@shoolin.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-medium transition-all"
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
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your security password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-medium transition-all"
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
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="alex.rivera@shoolin.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-medium transition-all"
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

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand" />
              <span>Password Recovery</span>
            </h3>
            {resetSent ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">Reset instructions dispatched!</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Check <span className="font-semibold text-slate-900 dark:text-white">{resetEmail}</span> for security link.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setForgotModalOpen(false);
                  }}
                  className="mt-2 w-full py-2 bg-brand text-white text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setResetSent(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered work email to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@shoolin.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

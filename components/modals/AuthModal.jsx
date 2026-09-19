'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { USERS } from '@/data/users';
import { useAppContext } from '@/components/providers/AppProvider';
import { api } from '@/lib/api';

export function AuthModal({ isOpen, onClose, onLoginAsUser }) {
  const context = useAppContext();
  const dynamicUsers = context?.users && context.users.length > 0 ? context.users : USERS;

  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp-request' | 'otp-verify' | 'otp-success'
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.auth.sendOtp(contact);
      setAuthMode('otp-verify');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.auth.verifyOtp(contact, otpDigits.join(''));
      if (typeof window !== 'undefined' && res?.token) {
        localStorage.setItem('pulsepm_jwt_token', res.token);
      }
      setAuthMode('otp-success');
      setTimeout(() => {
        handleCompleteLogin(res?.user || dynamicUsers[0]);
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.auth.login({ email: contact, password });
      if (res && res.user) {
        if (typeof window !== 'undefined' && res.token) {
          localStorage.setItem('pulsepm_jwt_token', res.token);
        }
        handleCompleteLogin(res.user);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteLogin = (user) => {
    const targetUser = user || dynamicUsers[0];
    onLoginAsUser(targetUser);
    onClose();
    setAuthMode('password');
    setErrorMsg(null);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Top Header */}
        <div className="pt-7 pb-4 px-6 text-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="w-10 h-10 mx-auto rounded-sm bg-brand flex items-center justify-center text-white font-bold text-lg shadow-sm mb-3">
            P
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">PulsePM Workspace</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">High-Performance Enterprise Project Management</p>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-sm text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errorMsg}
            </div>
          )}

          {/* STANDARD PASSWORD LOGIN */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address or Phone Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="name@company.com or +1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm focus:outline-none focus:border-brand text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link simulated."); }} className="text-[11px] text-brand hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm focus:outline-none focus:border-brand text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-xs border-slate-300 dark:border-slate-700 text-brand focus:ring-brand"
                  />
                  <span>Remember this device for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-sm shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                Sign In to Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('otp-request')}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand font-medium inline-flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-brand" />
                  Login with One-Time Password (OTP) instead
                </button>
              </div>
            </form>
          )}

          {/* OTP STEP 1: REQUEST OTP */}
          {authMode === 'otp-request' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <span className="inline-block text-[11px] font-semibold text-brand uppercase tracking-wider mb-1">
                  Step 1 of 2: Request Security Code
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Enter Verified Email or Phone</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">We will generate a 6-digit authentication token.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Details</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+1 (555) 234-5678 or alex@pulsepm.io"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm focus:outline-none focus:border-brand text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-sm shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? "Sending Token..." : "Send Verification OTP"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('password')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Back to standard password login
                </button>
              </div>
            </form>
          )}

          {/* OTP STEP 2: VERIFY OTP DIGITS */}
          {authMode === 'otp-verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <span className="inline-block text-[11px] font-semibold text-brand uppercase tracking-wider mb-1">
                  Step 2 of 2: OTP Verification
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Enter 6-Digit Code</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Code sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{contact}</span>
                </p>
              </div>

              {/* 6 Digit Box Inputs */}
              <div className="flex items-center justify-between gap-2 py-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    className="w-11 h-12 text-center font-mono text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-slate-900 dark:text-slate-100"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => alert("New OTP dispatched to: " + contact)}
                  className="text-brand hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Resend OTP (30s)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('otp-request')}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Change Contact
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-sm shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? "Verifying..." : "Verify & Authorize Login"}
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* OTP SUCCESS STATE */}
          {authMode === 'otp-success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">OTP Authenticated Successfully!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Identity verified. You are logged into the PMV Global Group organization tenant.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCompleteLogin(USERS[0])}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-sm shadow-xs transition-colors"
              >
                Proceed to Dashboard
              </button>
            </div>
          )}

          {/* QUICK DEMO ROLE SWITCHER SHORTCUT */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Prototype Role Switcher
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {dynamicUsers.slice(0, 6).map((u) => (
                <button
                  key={u.id || u._id}
                  type="button"
                  onClick={() => handleCompleteLogin(u)}
                  className="text-left p-1.5 rounded-sm border border-slate-200 dark:border-slate-700 hover:border-brand hover:bg-brand-subtle transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-sm object-cover" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                    <p className="text-[10px] text-brand font-medium truncate">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

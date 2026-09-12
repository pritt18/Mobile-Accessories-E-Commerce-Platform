import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Eye, EyeOff, ShieldCheck, Check, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const PaymentSettingsAdmin = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [activeMode, setActiveMode] = useState('TEST');
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [codEnabled, setCodEnabled] = useState(true);

  // Step-up verification modal state
  const [isStepUpModalOpen, setIsStepUpModalOpen] = useState(false);
  const [stepUpPassword, setStepUpPassword] = useState('');
  const [stepUpAction, setStepUpAction] = useState('SAVE'); // 'SAVE' | 'REVEAL'
  const [revealedSecrets, setRevealedSecrets] = useState(null);
  const [stepUpError, setStepUpError] = useState('');
  const [stepUpLoading, setStepUpLoading] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payment-config');
      if (res.data?.success) {
        setConfig(res.data.data);
        setActiveMode(res.data.data.activeMode || 'TEST');
        setCodEnabled(res.data.data.codEnabled);
        const currentCred = res.data.data.credentials?.find((c) => c.mode === (res.data.data.activeMode || 'TEST'));
        if (currentCred) {
          setKeyId(currentCred.keyId || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleTriggerSave = (e) => {
    e.preventDefault();
    setStepUpAction('SAVE');
    setStepUpPassword('');
    setStepUpError('');
    setIsStepUpModalOpen(true);
  };

  const handleTriggerReveal = () => {
    setStepUpAction('REVEAL');
    setStepUpPassword('');
    setStepUpError('');
    setIsStepUpModalOpen(true);
  };

  const handleStepUpSubmit = async (e) => {
    e.preventDefault();
    if (!stepUpPassword) return;
    setStepUpLoading(true);
    setStepUpError('');

    try {
      if (stepUpAction === 'SAVE') {
        const res = await api.post('/admin/payment-config', {
          currentPassword: stepUpPassword,
          mode: activeMode,
          keyId,
          keySecret,
          webhookSecret,
          activeMode,
          codEnabled,
        });
        if (res.data?.success) {
          setIsStepUpModalOpen(false);
          setKeySecret('');
          setWebhookSecret('');
          loadConfig();
          alert('Payment credentials saved securely!');
        }
      } else if (stepUpAction === 'REVEAL') {
        const cred = config.credentials?.find((c) => c.mode === activeMode);
        const res = await api.post('/admin/payment-config/reveal', {
          password: stepUpPassword,
          credentialId: cred?.id,
        });
        if (res.data?.success) {
          setRevealedSecrets(res.data.data);
          setIsStepUpModalOpen(false);
        }
      }
    } catch (err) {
      setStepUpError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setStepUpLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading payment security vault...</div>;

  const currentCred = config?.credentials?.find((c) => c.mode === activeMode);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
          <Lock size={14} />
          <span>Super Admin Security Vault</span>
        </div>
        <h1 className="text-2xl font-black text-white">Payment Gateway Configuration</h1>
        <p className="text-xs text-gray-400 mt-1">
          Razorpay integration credentials with AES-256 encryption, key masking, and step-up authorization
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
        <div className="font-bold flex items-center space-x-1.5">
          <ShieldCheck size={16} />
          <span>Step-Up Authentication Enforced</span>
        </div>
        <p className="text-gray-400">
          Payment gateway API secrets are never returned in plain text. Any updates or reveals require re-entering your Super Admin password and are permanently logged in the audit trail.
        </p>
      </div>

      <form onSubmit={handleTriggerSave} className="space-y-6">
        {/* Mode Selector */}
        <div className="p-6 rounded-3xl bg-[#11141d] border border-gray-800 space-y-4">
          <h2 className="text-base font-bold text-white">Environment & Gateway Mode</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveMode('TEST');
                const c = config.credentials?.find((cr) => cr.mode === 'TEST');
                setKeyId(c?.keyId || '');
              }}
              className={`p-4 rounded-2xl border text-left transition ${
                activeMode === 'TEST'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-gray-800 bg-gray-900 text-gray-400'
              }`}
            >
              <div className="text-xs font-bold text-amber-400 uppercase">Test / Sandbox Mode</div>
              <div className="text-sm font-bold text-white mt-1">Razorpay Test Gateway</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Simulate transactions safely without real money</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('LIVE');
                const c = config.credentials?.find((cr) => cr.mode === 'LIVE');
                setKeyId(c?.keyId || '');
              }}
              className={`p-4 rounded-2xl border text-left transition ${
                activeMode === 'LIVE'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-800 bg-gray-900 text-gray-400'
              }`}
            >
              <div className="text-xs font-bold text-emerald-400 uppercase">Live Production Mode</div>
              <div className="text-sm font-bold text-white mt-1">Razorpay Live Gateway</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Real money processing with banking settlement</div>
            </button>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2.5 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-brand-600"
              />
              <span>Enable Cash on Delivery (COD) for customers</span>
            </label>
          </div>
        </div>

        {/* Razorpay Credentials Card */}
        <div className="p-6 rounded-3xl bg-[#11141d] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Razorpay API Keys ({activeMode})</h2>
            {currentCred && (
              <button
                type="button"
                onClick={handleTriggerReveal}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <Eye size={14} />
                <span>Reveal Current Secret</span>
              </button>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-400 mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="rzp_test_..."
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-400">Razorpay Key Secret</label>
                {currentCred && (
                  <span className="text-gray-500 font-mono text-[11px]">
                    Stored: {currentCred.keySecretMasked}
                  </span>
                )}
              </div>
              <input
                type="password"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                placeholder="Enter new Key Secret (leave blank to retain current)"
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-400">Webhook Secret</label>
                {currentCred && currentCred.webhookSecretMasked && (
                  <span className="text-gray-500 font-mono text-[11px]">
                    Stored: {currentCred.webhookSecretMasked}
                  </span>
                )}
              </div>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Enter new Webhook Secret (optional)"
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono"
              />
            </div>

            {revealedSecrets && (
              <div className="p-4 rounded-2xl bg-gray-950 border border-cyan-500/40 text-xs space-y-2">
                <div className="text-[11px] font-bold text-cyan-400 uppercase">
                  Verified Decrypted Secrets (Action Logged)
                </div>
                <div>Key Secret: <strong className="text-white font-mono">{revealedSecrets.keySecret}</strong></div>
                {revealedSecrets.webhookSecret && (
                  <div>Webhook: <strong className="text-white font-mono">{revealedSecrets.webhookSecret}</strong></div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg"
        >
          <Lock size={16} />
          <span>Save Payment Credentials (Requires Step-Up Verification)</span>
        </button>
      </form>

      {/* Step-Up Password Modal */}
      <Modal
        isOpen={isStepUpModalOpen}
        onClose={() => setIsStepUpModalOpen(false)}
        title="Super Admin Step-Up Verification"
      >
        <form onSubmit={handleStepUpSubmit} className="space-y-4 text-xs">
          <p className="text-gray-300">
            Please re-enter your current Super Admin password to authorize{' '}
            <strong className="text-white">{stepUpAction === 'SAVE' ? 'updating credentials' : 'revealing API secrets'}</strong>.
          </p>

          {stepUpError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
              {stepUpError}
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-300 mb-1">Super Admin Password</label>
            <input
              type="password"
              required
              value={stepUpPassword}
              onChange={(e) => setStepUpPassword(e.target.value)}
              placeholder="????????"
              className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>

          <button
            type="submit"
            disabled={stepUpLoading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition"
          >
            {stepUpLoading ? 'Verifying...' : 'Authorize Action'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

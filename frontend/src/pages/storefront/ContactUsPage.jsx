import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export const ContactUsPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/cms/contact', { name, email, phone, subject, message });
      if (res.data?.success) {
        setSubmitted(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Get in Touch</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have queries about product compatibility, bulk ordering, or order status? We are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Info Box */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900">Contact Information</h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start space-x-3">
              <MapPin size={18} className="text-brand-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Headquarters:</strong>
                <span className="text-slate-500">Tech Hub, Bandra West, Mumbai, Maharashtra 400050</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail size={18} className="text-brand-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Email Support:</strong>
                <span className="text-slate-500">support@mobixia.in</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone size={18} className="text-brand-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Phone Line:</strong>
                <span className="text-slate-500">+91 98765 43210 (9 AM - 7 PM IST)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <div className="text-xs font-bold text-slate-900">Instant WhatsApp Desk</div>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition shadow-xs"
            >
              <MessageCircle size={16} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle size={48} className="text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Enquiry Received!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for reaching out. Our customer support team will reply within 24 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Product inquiry, bulk order, etc."
                    className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-xs transition"
              >
                <Send size={15} />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

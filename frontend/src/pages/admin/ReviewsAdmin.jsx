import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { RatingStars } from '../../components/common/RatingStars';

export const ReviewsAdmin = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      if (res.data?.success) setReviews(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/reviews/${id}`, { status, adminReply: replyText[id] });
      loadReviews();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      loadReviews();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Review & Rating Moderation</h1>
        <p className="text-xs text-gray-400 mt-1">Approve, reject, or reply to customer product feedback</p>
      </div>

      <div className="bg-[#11141d] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] bg-gray-900/60">
                <th className="p-4">Product</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Review Content</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No reviews to moderate.</td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-850/50 transition">
                    <td className="p-4 font-bold text-white max-w-xs truncate">{r.product?.name}</td>
                    <td className="p-4 text-gray-300">{r.user?.name}</td>
                    <td className="p-4">
                      <RatingStars rating={r.rating} showValue={false} size={13} />
                    </td>
                    <td className="p-4 max-w-md">
                      {r.title && <div className="font-bold text-white">{r.title}</div>}
                      <p className="text-gray-400 line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {r.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                          className="px-3 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg font-bold"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                          className="px-3 py-1 bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white rounded-lg font-bold"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-gray-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  Truck,
  RotateCcw,
  Clock,
  Printer,
  ExternalLink,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDateTime, getStatusBadgeClass } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';

export const OrderTrackingPage = () => {
  const { idOrNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found a better price');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Return modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Item incompatible with my device');
  const [returnLoading, setReturnLoading] = useState(false);

  // Printable Invoice modal
  const [invoiceData, setInvoiceData] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${idOrNumber}`);
      if (res.data?.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to locate order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [idOrNumber]);

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    try {
      const res = await api.post(`/orders/${order.id}/cancel`, { reason: cancelReason });
      if (res.data?.success) {
        setIsCancelModalOpen(false);
        fetchOrder();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReturnOrder = async () => {
    setReturnLoading(true);
    try {
      const res = await api.post(`/orders/${order.id}/return`, { reason: returnReason });
      if (res.data?.success) {
        setIsReturnModalOpen(false);
        fetchOrder();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Return request failed');
    } finally {
      setReturnLoading(false);
    }
  };

  const handleOpenInvoice = async () => {
    try {
      const res = await api.get(`/orders/${order.id}/invoice`);
      if (res.data?.success) {
        setInvoiceData(res.data.data);
        setIsInvoiceOpen(true);
      }
    } catch (err) {
      alert('Unable to load invoice');
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">Loading tracking timeline...</div>;
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Please check your order number and try again.'}</p>
        <Link to="/account" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-white text-xs font-bold inline-block shadow-xs">
          Go to My Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isReturned = order.status === 'RETURNED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header info */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="text-xs text-slate-500">Tracking Order</div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
            #{order.order_no}
          </h1>
          <div className="text-xs text-slate-500 mt-1">Placed on {formatDateTime(order.placed_at)}</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${getStatusBadgeClass(order.status)}`}>
            {order.status.replace(/_/g, ' ')}
          </span>

          <button
            onClick={handleOpenInvoice}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-gray-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
          >
            <Printer size={15} />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      {!isCancelled && !isReturned && (
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Order Progress</h3>
          <div className="relative flex flex-col sm:flex-row justify-between gap-4">
            {steps.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.key} className="flex-1 flex sm:flex-col items-center sm:text-center space-x-3 sm:space-x-0 relative">
                  {/* Circle indicator */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition z-10 ${
                      isCompleted
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 ring-4 ring-brand-50'
                        : 'bg-slate-100 text-slate-400 border border-gray-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={18} /> : idx + 1}
                  </div>

                  <div className="sm:mt-2">
                    <div className={`text-xs font-bold ${isCurrent ? 'text-brand-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Courier & Dispatch details */}
      {order.tracking_id && (
        <div className="p-5 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <Truck className="text-cyan-600" size={24} />
            <div>
              <div className="text-xs text-slate-500">Shipped with {order.courier_name || 'Express Logistics'}</div>
              <div className="text-sm font-bold text-slate-900 font-mono">AWB: {order.tracking_id}</div>
            </div>
          </div>
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-xs"
            >
              <span>Track with Courier</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}

      {/* Order Status History Log */}
      <section className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Status History Log</h3>
        <div className="space-y-3">
          {order.status_history?.map((h) => (
            <div key={h.id} className="flex items-start space-x-3 text-xs border-l-2 border-brand-500 pl-3 py-1">
              <div>
                <div className="font-bold text-slate-900">{h.status}</div>
                <div className="text-slate-600">{h.notes}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(h.changed_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions: Cancel or Return */}
      <div className="flex justify-end space-x-3 pt-2">
        {['PLACED', 'CONFIRMED'].includes(order.status) && (
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition"
          >
            Cancel Order
          </button>
        )}

        {order.status === 'DELIVERED' && (
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <RotateCcw size={15} />
            <span>Request Return / Replacement</span>
          </button>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Order">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">Are you sure you want to cancel order #{order.order_no}? Any reserved stock will be returned to inventory.</p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Cancellation Reason:</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:bg-white"
            >
              <option value="Found a better price">Found a better price</option>
              <option value="Ordered wrong model/size by mistake">Ordered wrong model/size</option>
              <option value="Change of delivery address">Change of delivery address</option>
              <option value="Delivery timeline too long">Delivery timeline too long</option>
            </select>
          </div>
          <button
            onClick={handleCancelOrder}
            disabled={cancelLoading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-xs"
          >
            {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} title="Request Return / Replacement">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">Mobixia provides 7-Day Doorstep Replacement for damaged, defective, or incompatible accessories.</p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Return/Replacement:</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-slate-900 focus:bg-white"
            >
              <option value="Item incompatible with my device">Item incompatible with my device</option>
              <option value="Defective or not functioning as advertised">Defective or not functioning</option>
              <option value="Received incorrect variant/color">Received incorrect variant/color</option>
              <option value="Package was damaged in transit">Package damaged in transit</option>
            </select>
          </div>
          <button
            onClick={handleReturnOrder}
            disabled={returnLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-xs"
          >
            {returnLoading ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </div>
      </Modal>

      {/* Invoice View Modal */}
      {invoiceData && (
        <Modal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} title="Tax Invoice" maxWidth="max-w-2xl">
          <div className="p-4 bg-white text-gray-900 rounded-2xl text-xs space-y-4 select-text">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h2 className="text-base font-black text-gray-900">{invoiceData.company.name}</h2>
                <p className="text-gray-600">{invoiceData.company.address}</p>
                <p className="text-gray-600">GSTIN: <strong>{invoiceData.company.gstin}</strong></p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">{invoiceData.invoiceNumber}</div>
                <div className="text-gray-500">Date: {invoiceData.invoiceDate}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-3">
              <div>
                <div className="font-bold text-gray-700 uppercase">Bill To:</div>
                <div className="font-bold text-gray-900">{invoiceData.customer.name}</div>
                <div className="text-gray-600">{invoiceData.customer.shippingAddress?.line1}</div>
                <div className="text-gray-600">{invoiceData.customer.shippingAddress?.city}, {invoiceData.customer.shippingAddress?.pincode}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-700 uppercase">Order Details:</div>
                <div>Order: #{invoiceData.orderNumber}</div>
                <div>Payment: {invoiceData.summary.paymentMethod} ({invoiceData.summary.paymentStatus})</div>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-500 uppercase text-[10px]">
                  <th className="py-1.5">Item</th>
                  <th className="py-1.5">HSN</th>
                  <th className="py-1.5 text-center">Qty</th>
                  <th className="py-1.5 text-right">Unit Price</th>
                  <th className="py-1.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoiceData.items.map((it) => (
                  <tr key={it.srNo}>
                    <td className="py-2">
                      <div className="font-bold text-gray-800">{it.name}</div>
                      <div className="text-gray-500 text-[10px]">{it.variant}</div>
                    </td>
                    <td className="py-2">{it.hsnCode}</td>
                    <td className="py-2 text-center">{it.qty}</td>
                    <td className="py-2 text-right">?{it.unitPrice}</td>
                    <td className="py-2 text-right font-bold">?{it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t pt-3 flex justify-between">
              <div className="text-[10px] text-gray-500">
                GST breakdown: CGST 9% (?{invoiceData.summary.cgst}) + SGST 9% (?{invoiceData.summary.sgst})
              </div>
              <div className="space-y-1 text-right">
                <div>Subtotal: ?{invoiceData.summary.subtotal}</div>
                <div>Shipping: ?{invoiceData.summary.shippingFee}</div>
                <div className="text-sm font-black text-gray-900">Grand Total: ?{invoiceData.summary.grandTotal}</div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold mt-2"
            >
              Print Invoice
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

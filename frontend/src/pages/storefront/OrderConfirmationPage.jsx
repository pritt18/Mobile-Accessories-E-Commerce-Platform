import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  ArrowRight,
  FileText,
  Truck,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Download,
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const OrderConfirmationPage = () => {
  const { orderNo } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderNo}`);
        if (res.data?.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNo]);

  // Parse shipping info
  let shipping = {};
  if (order?.shipping_info) {
    try {
      shipping = typeof order.shipping_info === 'string'
        ? JSON.parse(order.shipping_info)
        : order.shipping_info;
    } catch {
      shipping = {};
    }
  }

  const recipientEmail = order?.guest_email || order?.user?.email || shipping?.email || 'pritamgangurde18@gmail.com';
  const recipientPhone = order?.guest_phone || order?.user?.mobile || shipping?.phone;
  const deliverySlot = shipping?.deliverySlot;

  const handleDownloadInvoice = () => {
    if (order?.id) {
      window.open(`http://localhost:5000/api/v1/orders/${order.id}/invoice`, '_blank');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
      {/* Celebration Header */}
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-md">
          <CheckCircle size={44} />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Thank you for shopping with Mobixia. Your order has been placed and is queued for express courier fulfillment.
          </p>
        </div>
      </div>

      {/* Real-time Email & SMS Confirmation Alert Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left space-y-2 shadow-xs">
        <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
          <Mail size={16} className="text-brand-600" />
          <span>Real-time Order Notifications Dispatched:</span>
        </div>
        <div className="text-xs text-slate-600 space-y-1 pl-6">
          <div>
            • <strong>Email Receipt:</strong> A branded itemized confirmation receipt was dispatched to{' '}
            <strong className="text-brand-700">{recipientEmail}</strong>.
          </div>
          {recipientPhone && (
            <div>
              • <strong>SMS Updates:</strong> Shipment tracking updates will be sent to{' '}
              <strong className="text-brand-700">{recipientPhone}</strong>.
            </div>
          )}
        </div>
      </div>

      {/* Order Info Card */}
      {order && (
        <div className="p-6 rounded-3xl bg-white border border-gray-200 text-left space-y-5 shadow-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="text-[11px] text-slate-500">Order Number:</div>
              <div className="text-sm font-black text-slate-900 font-mono">{order.order_no}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Order Date:</div>
              <div className="text-xs font-bold text-slate-800">{formatDate(order.placed_at)}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Total Amount:</div>
              <div className="text-sm font-black text-brand-600">{formatCurrency(order.total)}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Payment:</div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {order.payment_method} ({order.payment_status})
              </span>
            </div>
          </div>

          {/* Delivery Details & Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-gray-200">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Truck size={14} className="text-brand-600" />
                <span>Delivery Slot & Speed</span>
              </div>
              <div className="text-slate-700 font-semibold">
                {deliverySlot?.speed === 'EXPRESS' ? '⚡ Priority Next-Day Air' : 'Standard Surface Delivery'}
              </div>
              <div className="text-brand-600 font-bold text-[11px]">
                Estimated Arrival: {deliverySlot?.estimatedDate || '2-4 Business Days'}
              </div>
              <div className="text-slate-500 text-[11px]">
                Window: {deliverySlot?.slot || 'ANYTIME'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <MapPin size={14} className="text-brand-600" />
                <span>Shipping Destination</span>
              </div>
              <div className="text-slate-700 font-semibold">
                {shipping?.name || order.guest_name || order.user?.name || 'Customer'}
              </div>
              <div className="text-slate-500 text-[11px] leading-snug">
                {shipping?.line1 ? `${shipping.line1}, ` : ''}{shipping?.city ? `${shipping.city}, ` : ''}{shipping?.state} {shipping?.pincode ? `- ${shipping.pincode}` : ''}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-700">Items in this Package:</div>
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 text-xs p-2.5 rounded-xl bg-slate-50/70 border border-gray-100">
                <img
                  src={item.image_snapshot || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=100&auto=format&fit=crop&q=80'}
                  alt={item.product_name_snapshot}
                  className="w-12 h-12 rounded-xl object-cover bg-white border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 font-bold truncate">{item.product_name_snapshot?.replace(/NexGear/gi, 'Mobixia')}</div>
                  <div className="text-slate-500 text-[11px]">Qty: {item.qty} • {item.variant_snapshot || 'Standard'}</div>
                </div>
                <div className="font-black text-slate-900">{formatCurrency(item.price * item.qty)}</div>
              </div>
            ))}
          </div>

          {/* Pricing summary */}
          <div className="pt-3 border-t border-gray-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({order.coupon_code || 'Promo'}):</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charges:</span>
              <span className="font-semibold text-slate-900">{order.shipping_fee === 0 ? 'FREE' : formatCurrency(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-black text-slate-900">
              <span>Grand Total:</span>
              <span className="text-brand-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to={`/track/${orderNo}`}
          className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-black rounded-xl flex items-center space-x-2 shadow-md shadow-brand-500/20 transition"
        >
          <Package size={16} />
          <span>Live Order Tracking</span>
        </Link>
        <button
          onClick={handleDownloadInvoice}
          className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-gray-300 text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow-xs"
        >
          <Download size={15} />
          <span>Download Invoice (PDF)</span>
        </button>
        <Link
          to="/products"
          className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

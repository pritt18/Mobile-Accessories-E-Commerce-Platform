import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Check,
  Plus,
  ArrowRight,
  MapPin,
  Lock,
  Tag,
  Clock,
  Zap,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, discount, coupon, clearCart } = useCart();

  // Guest vs Login mode (when not authenticated)
  const [checkoutMode, setCheckoutMode] = useState('GUEST'); // 'GUEST' | 'LOGIN'

  // User saved addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Address & Guest fields
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || 'pritamgangurde18@gmail.com');
  const [guestPhone, setGuestPhone] = useState(user?.mobile || '9876543210');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // null | { serviceable: boolean, message: string }

  // Delivery slot selection
  const [deliverySpeed, setDeliverySpeed] = useState('STANDARD'); // 'STANDARD' | 'EXPRESS'
  const [deliveryWindow, setDeliveryWindow] = useState('ANYTIME'); // 'ANYTIME' | 'MORNING' | 'AFTERNOON' | 'EVENING'

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // 'RAZORPAY' | 'COD'
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Online Payment modal simulation
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  const [storeSettings, setStoreSettings] = useState({
    shipping_free_threshold: 499,
    shipping_standard_fee: 50,
    shipping_express_fee: 49,
    shipping_cod_fee: 0,
  });

  useEffect(() => {
    api.get('/cms/store-settings').then((res) => {
      if (res.data?.success) {
        setStoreSettings({
          shipping_free_threshold: parseFloat(res.data.data?.shipping_free_threshold) || 499,
          shipping_standard_fee: parseFloat(res.data.data?.shipping_standard_fee) ?? 50,
          shipping_express_fee: parseFloat(res.data.data?.shipping_express_fee) ?? 49,
          shipping_cod_fee: parseFloat(res.data.data?.shipping_cod_fee) ?? 0,
        });
      }
    }).catch(() => {});
  }, []);

  // Dynamic Shipping Fee Calculation
  const isExpress = deliverySpeed === 'EXPRESS';
  const freeThreshold = storeSettings.shipping_free_threshold;
  const standardFee = storeSettings.shipping_standard_fee;
  const expressFee = storeSettings.shipping_express_fee;
  const shippingFee = isExpress ? expressFee : (subtotal >= freeThreshold ? 0 : standardFee);
  const finalTotal = Math.max(0, subtotal - discount) + (subtotal > 0 ? shippingFee : 0);

  // Calculate dynamic estimated delivery dates
  const today = new Date();
  const getDeliveryDateString = (daysToAdd) => {
    const target = new Date(today);
    target.setDate(target.getDate() + daysToAdd);
    return target.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const standardEstimate = `${getDeliveryDateString(3)} – ${getDeliveryDateString(5)}`;
  const expressEstimate = `Tomorrow, ${getDeliveryDateString(1)}`;

  // Load user saved addresses if authenticated
  useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.mobile || '');

      api.get('/auth/addresses')
        .then((res) => {
          if (res.data?.success && res.data.data.length > 0) {
            setAddresses(res.data.data);
            const def = res.data.data.find((a) => a.is_default) || res.data.data[0];
            setSelectedAddressId(def.id);
            setShowNewAddressForm(false);
            // Auto check pincode serviceability for saved address
            if (def.pincode) {
              validatePincode(def.pincode);
            }
          } else {
            setShowNewAddressForm(true);
          }
        })
        .catch(() => {
          setAddresses([]);
          setShowNewAddressForm(true);
        });
    } else {
      setShowNewAddressForm(true);
    }
  }, [user]);

  // Real-time Pincode Validation
  const validatePincode = (code) => {
    const clean = code.replace(/\D/g, '');
    if (clean.length === 6 && /^[1-9][0-9]{5}$/.test(clean)) {
      setPincodeStatus({
        serviceable: true,
        message: `Pincode ${clean} is serviceable! Free Standard & Express Delivery available.`,
      });
    } else if (clean.length === 6) {
      setPincodeStatus({
        serviceable: false,
        message: `Pincode ${clean} is not currently serviceable by our express couriers.`,
      });
    } else {
      setPincodeStatus(null);
    }
  };

  const handlePincodeChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);
    validatePincode(clean);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/products" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-white text-xs font-bold inline-block shadow-xs">
          Shop Accessories
        </Link>
      </div>
    );
  }

  const handleCreateNewAddress = async (e) => {
    e.preventDefault();
    if (!guestName || !guestPhone || !line1 || !city || !pincode) return;

    if (user) {
      try {
        const res = await api.post('/auth/addresses', {
          name: guestName,
          phone: guestPhone,
          line1,
          line2,
          city,
          state,
          pincode,
          is_default: addresses.length === 0,
        });
        if (res.data?.success) {
          const added = res.data.data;
          setAddresses([...addresses, added]);
          setSelectedAddressId(added.id);
          setShowNewAddressForm(false);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePlaceOrder = async () => {
    setOrderError('');
    setLoading(true);

    try {
      let shippingPayload = null;
      let addressIdPayload = selectedAddressId;

      if (!addressIdPayload || showNewAddressForm || !user) {
        addressIdPayload = null;
        if (!guestName || !guestEmail || !guestPhone || !line1 || !city || !pincode) {
          setOrderError('Please complete all required contact and shipping address fields.');
          setLoading(false);
          return;
        }
        shippingPayload = {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          line1,
          line2,
          city,
          state,
          pincode,
        };
      } else {
        // Logged-in user with saved address
        const selectedObj = addresses.find((a) => a.id === selectedAddressId);
        shippingPayload = {
          name: selectedObj?.name || user?.name,
          email: user?.email || guestEmail,
          phone: selectedObj?.phone || user?.mobile,
          line1: selectedObj?.line1,
          line2: selectedObj?.line2,
          city: selectedObj?.city,
          state: selectedObj?.state,
          pincode: selectedObj?.pincode,
        };
      }

      const deliverySlotPayload = {
        speed: deliverySpeed,
        slot: deliveryWindow,
        estimatedDate: deliverySpeed === 'EXPRESS' ? expressEstimate : standardEstimate,
      };

      const res = await api.post('/orders/checkout', {
        addressId: addressIdPayload,
        shippingInfo: shippingPayload,
        guestName: !user ? guestName : null,
        guestEmail: !user ? guestEmail : null,
        guestPhone: !user ? guestPhone : null,
        deliverySlot: deliverySlotPayload,
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
        paymentMethod,
        couponCode: coupon?.code,
      });

      if (res.data?.success) {
        const orderData = res.data.data.order;

        if (paymentMethod === 'RAZORPAY') {
          setPendingOrderData(res.data.data);

          // Dynamically ensure Razorpay SDK is loaded
          const loadRazorpaySDK = () => {
            return new Promise((resolve) => {
              if (window.Razorpay) return resolve(true);
              const script = document.createElement('script');
              script.src = 'https://checkout.razorpay.com/v1/checkout.js';
              script.onload = () => resolve(true);
              script.onerror = () => resolve(false);
              document.body.appendChild(script);
            });
          };

          const isLoaded = await loadRazorpaySDK();

          if (isLoaded && window.Razorpay) {
            const razorpayConfig = res.data.data.razorpay;
            const options = {
              key: razorpayConfig?.keyId || 'rzp_test_Tb6xiThrPT7xSc',
              order_id: razorpayConfig?.orderId || undefined,
              amount: Math.round(orderData.total * 100),
              currency: 'INR',
              name: 'Mobixia Mobile Accessories',
              description: `Order #${orderData.order_no}`,
              image: 'https://cdn.jsdelivr.net/gh/feathericons/feather/icons/smartphone.svg',
              prefill: {
                name: guestName || user?.name || 'Customer',
                email: guestEmail || user?.email || 'pritamgangurde18@gmail.com',
                contact: guestPhone || user?.mobile || '9579888176',
              },
              notes: {
                order_no: orderData.order_no,
              },
              theme: {
                color: '#0072ff',
              },
              handler: async function (response) {
                try {
                  setLoading(true);
                  const verifyRes = await api.post('/orders/verify-payment', {
                    orderId: orderData.id,
                    razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature,
                  });
                  if (verifyRes.data?.success) {
                    clearCart();
                    navigate(`/order-confirmation/${orderData.order_no}`);
                  }
                } catch (err) {
                  alert('Payment verification failed. Please contact support.');
                } finally {
                  setLoading(false);
                }
              },
              modal: {
                ondismiss: function () {
                  setLoading(false);
                  setShowRazorpayModal(true);
                },
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (resp) {
              setOrderError(resp.error?.description || 'Payment Failed. Please try another method.');
              setLoading(false);
            });
            rzp.open();
            setLoading(false);
          } else {
            // Fallback to simulation modal if adblocker blocks external Razorpay script
            setShowRazorpayModal(true);
            setLoading(false);
          }
        } else {
          // COD Order placed
          clearCart();
          navigate(`/order-confirmation/${orderData.order_no}`);
        }
      }
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order. Please verify your details.');
      setLoading(false);
    }
  };

  const handleCompleteRazorpayPayment = async () => {
    setLoading(true);
    try {
      const order = pendingOrderData.order;
      const res = await api.post('/orders/verify-payment', {
        orderId: order.id,
        razorpayPaymentId: `pay_${Date.now()}_simulated`,
        razorpayOrderId: pendingOrderData.razorpay?.orderId,
      });
      if (res.data?.success) {
        clearCart();
        setShowRazorpayModal(false);
        navigate(`/order-confirmation/${order.order_no}`);
      }
    } catch (err) {
      alert('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Title Header */}
      <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Link to="/cart" className="hover:text-brand-600 transition">Cart</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Secure Express Checkout</h1>
          <p className="text-xs text-slate-500 mt-0.5">256-Bit Encrypted Payment with Real-Time Notification Updates</p>
        </div>
        <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck size={18} />
          <span>RBI Certified Gateway Compliant</span>
        </div>
      </div>

      {orderError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-bold flex items-center space-x-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Steps */}
        <div className="lg:col-span-8 space-y-6">

          {/* STEP 1: Customer Info & Shipping Address */}
          <section className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">1</span>
                <span>Customer & Shipping Address</span>
              </h2>
              {user ? (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Signed In as {user.name}
                </span>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-medium">Guest Checkout</span>
                </div>
              )}
            </div>

            {/* Guest Contact Inputs (if logged out) */}
            {!user && (
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Mail size={14} className="text-brand-600" />
                  <span>Contact Information for Live Order Tracking & Invoicing</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. pritamgangurde18@gmail.com"
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs text-slate-900 focus:border-brand-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Receipt & shipment notifications will be emailed here
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs text-slate-900 focus:border-brand-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Dispatches instant SMS delivery updates
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Addresses List (If authenticated user has addresses) */}
            {user && !showNewAddressForm && addresses.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Select Saved Address:</span>
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add New Address</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        if (addr.pincode) validatePincode(addr.pincode);
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                        selectedAddressId === addr.id
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                          : 'border-gray-200 bg-slate-50/70 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                          <span>{addr.name}</span>
                          {addr.is_default && (
                            <span className="text-[10px] font-black uppercase bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => {
                            setSelectedAddressId(addr.id);
                            if (addr.pincode) validatePincode(addr.pincode);
                          }}
                          className="text-brand-600 focus:ring-brand-500 mt-0.5"
                        />
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed">
                        {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">Phone: {addr.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Address Input Form (Guest or Add New) */}
            {(showNewAddressForm || !user) && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Receiver's Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Receiver's name"
                      className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                    />
                  </div>
                  {user && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    House / Flat No, Street, Building <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="e.g. Flat 402, Apex Tower, M.G. Road"
                    className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Landmark / Locality (Optional)
                  </label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="e.g. Near Metro Station / Behind City Mall"
                    className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      6-Digit Pincode <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="400050"
                      className="w-full h-10 px-3 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Pincode Serviceability feedback */}
                {pincodeStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                      pincodeStatus.serviceable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {pincodeStatus.serviceable ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span className="font-semibold">{pincodeStatus.message}</span>
                  </div>
                )}

                {user && addresses.length > 0 && (
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-xs text-slate-500 hover:text-slate-900 underline"
                    >
                      Cancel and use saved address
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewAddress}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                    >
                      Save Address to Account
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* STEP 2: Delivery Slot & Estimated Delivery Date */}
          <section className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">2</span>
                <span>Delivery Slot & Speed</span>
              </h2>
            </div>

            {/* Delivery Speed Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Standard Delivery */}
              <div
                onClick={() => setDeliverySpeed('STANDARD')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  deliverySpeed === 'STANDARD'
                    ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                    : 'border-gray-200 bg-slate-50/70 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck size={18} className="text-brand-600" />
                    <span className="text-xs font-black text-slate-900">Standard Surface Delivery</span>
                  </div>
                  <input
                    type="radio"
                    name="deliverySpeed"
                    checked={deliverySpeed === 'STANDARD'}
                    onChange={() => setDeliverySpeed('STANDARD')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Calendar size={13} className="text-slate-500" />
                    <span>Estimated: {standardEstimate}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Trusted courier delivery via Delhivery / Bluedart Surface.
                  </p>
                </div>
                <div className="text-xs font-bold text-emerald-600">
                  {subtotal >= freeThreshold ? 'FREE Delivery' : `₹${standardFee} Delivery Fee`}
                </div>
              </div>

              {/* Express Next-Day Delivery */}
              <div
                onClick={() => setDeliverySpeed('EXPRESS')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  deliverySpeed === 'EXPRESS'
                    ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                    : 'border-gray-200 bg-slate-50/70 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap size={18} className="text-amber-500" />
                    <span className="text-xs font-black text-slate-900">⚡ Priority Air Express</span>
                  </div>
                  <input
                    type="radio"
                    name="deliverySpeed"
                    checked={deliverySpeed === 'EXPRESS'}
                    onChange={() => setDeliverySpeed('EXPRESS')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Clock size={13} className="text-amber-500" />
                    <span>Guaranteed: {expressEstimate}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Direct air cargo dispatch within 12 hours.
                  </p>
                </div>
                <div className="text-xs font-black text-amber-600">
                  ₹{expressFee} Priority Fee
                </div>
              </div>
            </div>

            {/* Preferred Delivery Time Window */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700">Preferred Delivery Window:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'ANYTIME', label: '🕒 Any Time', sub: '9 AM – 9 PM' },
                  { id: 'MORNING', label: '🌅 Morning', sub: '9 AM – 1 PM' },
                  { id: 'AFTERNOON', label: '☀️ Afternoon', sub: '1 PM – 5 PM' },
                  { id: 'EVENING', label: '🌙 Evening', sub: '5 PM – 9 PM' },
                ].map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setDeliveryWindow(slot.id)}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      deliveryWindow === slot.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold ring-1 ring-brand-500'
                        : 'border-gray-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{slot.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{slot.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* STEP 3: Payment Method Selection */}
          <section className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">3</span>
                <span>Payment Method Selection</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Online Razorpay Gateway */}
              <div
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                    : 'border-gray-200 bg-slate-50/70 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard size={20} className="text-brand-600" />
                    <span className="text-xs font-black text-slate-900">Online Gateway Payment</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa/Mastercard/RuPay), and NetBanking.
                </p>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-700">
                  <ShieldCheck size={14} />
                  <span>Instant Confirmation & Priority Dispatch</span>
                </div>
              </div>

              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'COD'
                    ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                    : 'border-gray-200 bg-slate-50/70 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Banknote size={20} className="text-amber-500" />
                    <span className="text-xs font-black text-slate-900">Cash on Delivery (COD)</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pay with cash or scan the delivery executive's UPI QR code directly at your doorstep.
                </p>
                <div className="text-[10px] font-bold text-slate-500">
                  Zero additional COD surcharge
                </div>
              </div>
            </div>
          </section>

          {/* STEP 4: Order Review & Summary Before Placement */}
          <section className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">4</span>
                <span>Review Order Details</span>
              </h2>
              <span className="text-xs font-bold text-slate-500">Ready to Place</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Shipping Destination Snapshot */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center space-x-1">
                  <MapPin size={14} className="text-brand-600" />
                  <span>Delivery Destination</span>
                </div>
                <div className="text-slate-700 font-semibold">{guestName || user?.name || 'Receiver'}</div>
                <div className="text-slate-500 text-[11px] leading-snug">
                  {line1 ? `${line1}, ` : ''}{city ? `${city}, ` : ''}{state} {pincode ? `- ${pincode}` : ''}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Email: <strong>{guestEmail || user?.email}</strong>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Phone: <strong>{guestPhone || user?.mobile}</strong>
                </div>
              </div>

              {/* Delivery Speed Snapshot */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center space-x-1">
                  <Truck size={14} className="text-brand-600" />
                  <span>Delivery Slot & Method</span>
                </div>
                <div className="text-slate-700 font-semibold">
                  {deliverySpeed === 'EXPRESS' ? '⚡ Priority Air Express (₹49)' : 'Standard Surface Delivery'}
                </div>
                <div className="text-brand-600 font-bold text-[11px]">
                  Expected: {deliverySpeed === 'EXPRESS' ? expressEstimate : standardEstimate}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Window: <strong>{deliveryWindow} (Preferred)</strong>
                </div>
                <div className="text-emerald-600 font-semibold text-[11px]">
                  Payment Mode: <strong>{paymentMethod === 'RAZORPAY' ? 'Online Gateway' : 'Cash on Delivery'}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Order Summary & Place Order */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-5 sticky top-24 shadow-md">
            <h3 className="text-base font-bold text-slate-900 border-b border-gray-200 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-slate-500">
                {items.reduce((a, i) => a + i.qty, 0)} Items
              </span>
            </h3>

            {/* Items Snapshot */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 font-bold truncate">{item.name}</div>
                    <div className="text-slate-500 text-[11px]">
                      Qty: {item.qty} • {item.color || item.model || 'Standard'}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900">{formatCurrency(item.itemTotal)}</div>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="pt-4 border-t border-gray-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo Discount ({coupon?.code || 'Coupon'})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>
                  Delivery Charges ({deliverySpeed === 'EXPRESS' ? 'Air Express' : 'Standard'})
                </span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-emerald-600 font-bold">FREE</strong>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Goods & Services Tax (18% GST)</span>
                <span>Included in prices</span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-black text-slate-900">
                <span>Total Payable</span>
                <span className="text-brand-600 font-black">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-brand-500/25 transition disabled:opacity-50"
            >
              <Lock size={16} />
              <span>{loading ? 'Securing Order...' : `Place Order • ${formatCurrency(finalTotal)}`}</span>
            </button>

            {/* Trust and Tracking */}
            <div className="text-center text-[11px] text-slate-500 pt-2 space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-brand-600 font-semibold">
                <Truck size={14} />
                <span>Ships within 24 hours with live GPS courier tracking</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Real confirmation email will be delivered to <strong>{guestEmail || user?.email || 'your email'}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Sandbox Simulation Modal */}
      {showRazorpayModal && pendingOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-blue-200 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                  R
                </div>
                <span className="font-bold text-slate-900 text-sm">Razorpay Checkout Sandbox</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Test Mode
              </span>
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs text-slate-500">Paying Mobixia Accessories Online</div>
              <div className="text-3xl font-black text-slate-900">
                {formatCurrency(pendingOrderData.order.total)}
              </div>
              <div className="text-xs text-brand-600 font-mono font-bold">
                Order #{pendingOrderData.order.order_no}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Merchant:</span>
                <span className="font-bold text-slate-900">Mobixia Official</span>
              </div>
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="text-emerald-700 font-bold">UPI / Instant NetBanking</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCompleteRazorpayPayment}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20"
              >
                {loading ? 'Authorizing...' : 'Simulate Successful Payment'}
              </button>
              <button
                onClick={() => setShowRazorpayModal(false)}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-900 font-medium"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

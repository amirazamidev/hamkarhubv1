import React, { useState, useEffect } from 'react';
import {
  Coffee,
  CupSoda,
  Croissant,
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Sparkles,
  MapPin,
  FileText,
  X,
  Users,
  PhoneCall,
  Search,
} from 'lucide-react';
import { CafeMenuItem, CafeOrder, SpaceAmenity } from '../types';

interface CafeViewProps {
  currentUserName: string;
  currentUserDesk: string;
  amenities: SpaceAmenity[];
}

export const CafeView: React.FC<CafeViewProps> = ({
  currentUserName,
  currentUserDesk,
  amenities,
}) => {
  const [menu, setMenu] = useState<CafeMenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'coffee' | 'cold' | 'dessert' | 'snack'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Order submission state
  const [customerName, setCustomerName] = useState(currentUserName || '');
  const [customerDesk, setCustomerDesk] = useState(currentUserDesk || '');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<CafeOrder | null>(null);

  // My Orders
  const [myOrders, setMyOrders] = useState<CafeOrder[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'menu' | 'orders'>('menu');

  useEffect(() => {
    if (currentUserName && !customerName) {
      setCustomerName(currentUserName);
    }
    if (currentUserDesk && !customerDesk) {
      setCustomerDesk(currentUserDesk);
    }
  }, [currentUserName, currentUserDesk]);

  // Fetch menu
  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/cafe/menu');
      if (res.ok) {
        const data = await res.json();
        setMenu(data);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const url = customerName ? `/api/cafe/orders?customer=${encodeURIComponent(customerName)}` : '/api/cafe/orders';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMyOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, [customerName]);

  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const cartTotalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const cartTotalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  const filteredMenu = menu.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartTotalItems === 0) return;
    if (!customerName.trim()) {
      alert('لطفاً نام خود را وارد کنید');
      return;
    }

    const items = Object.entries(cart).map(([id, qty]) => {
      const it = menu.find((m) => m.id === id)!;
      return {
        menuItemId: it.id,
        name: it.name,
        price: it.price,
        quantity: qty,
      };
    });

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/cafe/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          desk: customerDesk.trim() || 'میز آزاد / سالن اصلی',
          items,
          note: orderNote.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(data.order);
        clearCart();
        setIsCartOpen(false);
        setActiveSubTab('orders');
        fetchOrders();
      } else {
        alert(data.error || 'خطا در ثبت سفارش');
      }
    } catch (err) {
      alert('خطا در برقراری ارتباط با سرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: CafeOrder['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            در انتظار تایید باریستا
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Coffee className="w-3.5 h-3.5 animate-spin" />
            در حال آماده‌سازی
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-3.5 h-3.5" />
            آماده تحویل در بار کافه!
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            تحویل داده شد
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            لغو شده
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* HERO BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              کافه تخصصی و اسنک‌بار همکار هاب
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              انرژی تازه برای کد زدن، طراحی و جلسات کاری
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              قهوه‌های تخصصی ۱۰۰٪ عربیکا، نوشیدنی‌های خنک، اسنک‌های تازه پخت و سرو مستقیم روی صندلی یا اتاق جلسه بدون قطع تمرکز شما.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSubTab('menu')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'menu'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>منوی سفارشات</span>
            </button>

            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer relative ${
                activeSubTab === 'orders'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>پیگیری سفارشات من</span>
              {myOrders.filter((o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AMENITIES QUICK BAR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-2">
          <span>فضاهای مشترک فضا:</span>
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800"
            >
              <span className={`w-2 h-2 rounded-full ${amenity.status === 'ready' || amenity.status === 'free' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-slate-200 font-medium">{amenity.name}</span>
              <span className="text-[10px] text-slate-400">({amenity.statusText})</span>
            </div>
          ))}
        </div>
      </div>

      {activeSubTab === 'orders' ? (
        /* MY ORDERS TAB */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>تاریخچه و وضعیت زنده سفارشات شما</span>
            </h3>
            <button
              onClick={fetchOrders}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              به‌روزرسانی لحظه‌ای
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center text-2xl">
                ☕
              </div>
              <h4 className="text-sm font-bold text-white">هنوز سفارشی ثبت نکرده‌اید</h4>
              <p className="text-xs text-slate-400">از منوی کافه، نوشیدنی یا میان‌وعده دلخواهتان را انتخاب کنید.</p>
              <button
                onClick={() => setActiveSubTab('menu')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                مشاهده منوی کافه
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-lg hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">
                        #{order.orderNumber}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{order.customerName}</h4>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{order.desk}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5 text-xs">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300">
                        <span>
                          {it.name} <span className="text-amber-400 font-mono">×{it.quantity}</span>
                        </span>
                        <span className="font-mono text-slate-400">{formatPrice(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {order.note && (
                    <div className="p-2.5 bg-slate-950 rounded-xl text-[11px] text-slate-400 flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>توضیح: {order.note}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-bold">
                    <span className="text-slate-400">مبلغ کل سفارش:</span>
                    <span className="text-amber-400 font-mono text-sm">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* CAFE MENU TAB */
        <div className="space-y-6">
          {/* CATEGORY & SEARCH BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                همه اقلام
              </button>
              <button
                onClick={() => setSelectedCategory('coffee')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'coffee'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>قهوه و اسپرسوبار</span>
              </button>
              <button
                onClick={() => setSelectedCategory('cold')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'cold'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <CupSoda className="w-3.5 h-3.5" />
                <span>نوشیدنی‌های خنک</span>
              </button>
              <button
                onClick={() => setSelectedCategory('dessert')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'dessert'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Croissant className="w-3.5 h-3.5" />
                <span>کیک و دسر</span>
              </button>
              <button
                onClick={() => setSelectedCategory('snack')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'snack'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>ساندویچ و اسنک</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="جستجو در منو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* MENU GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.map((item) => {
              const inCartCount = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition space-y-4 shadow-lg group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-lg">
                          {item.category === 'coffee' ? (
                            <Coffee className="w-5 h-5" />
                          ) : item.category === 'cold' ? (
                            <CupSoda className="w-5 h-5" />
                          ) : item.category === 'dessert' ? (
                            <Croissant className="w-5 h-5" />
                          ) : (
                            <UtensilsCrossed className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            آماده‌سازی: حدود {item.prepMinutes} دقیقه
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="font-mono text-sm font-bold text-amber-400">
                      {formatPrice(item.price)}
                    </div>

                    {inCartCount > 0 ? (
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl p-1">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs text-white px-1">
                          {inCartCount}
                        </span>
                        <button
                          onClick={() => addToCart(item.id)}
                          className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 font-bold" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item.id)}
                        disabled={!item.isAvailable}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          item.isAvailable
                            ? 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                            : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{item.isAvailable ? 'افزودن به سفارش' : 'تمام شد'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FLOATING CART BAR (WHEN ITEMS IN CART) */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 animate-slideUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md shadow-amber-500/30">
                {cartTotalItems}
              </div>
              <div>
                <div className="text-xs font-bold text-white">سفارش کافه شما</div>
                <div className="font-mono text-sm text-amber-400 font-black">
                  {formatPrice(cartTotalPrice)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>تکمیل و ارسال سفارش</span>
              </button>
              <button
                onClick={clearCart}
                title="پاک کردن سبد"
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART / CHECKOUT MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>تکمیل سفارش کافه</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* CART ITEMS SUMMARY */}
              <div className="space-y-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">اقلام انتخابی:</span>
                {Object.entries(cart).map(([id, qty]) => {
                  const it = menu.find((m) => m.id === id);
                  if (!it) return null;
                  return (
                    <div key={id} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                      <span className="text-white font-medium">
                        {it.name} <span className="text-amber-400 font-mono">×{qty}</span>
                      </span>
                      <span className="font-mono text-slate-300">{formatPrice(it.price * qty)}</span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                  <span className="text-slate-300">مجموع قابل پرداخت:</span>
                  <span className="text-amber-400 font-mono">{formatPrice(cartTotalPrice)}</span>
                </div>
              </div>

              {/* CUSTOMER DETAILS */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">نام سفارش‌دهنده</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: علی احمدی"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">محل استقرار / شماره صندلی جهت تحویل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: میز ۱۴ سالن باز، یا اتاق جلسه ۱"
                  value={customerDesk}
                  onChange={(e) => setCustomerDesk(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">توضیحات برای باریستا (اختیاری)</label>
                <textarea
                  placeholder="مثال: کم‌شیرین باشد، با شیر بادام، لیوان شیشه‌ای..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-slate-300 text-[11px] leading-relaxed">
                ☕ سفارش شما مستقیماً روی پنل باریستا ظاهر شده و پس از آماده‌سازی روی میز شما سرو یا در بار تحویل می‌گردد.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'در حال ثبت...' : 'ارسال قطعی سفارش به کافه'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

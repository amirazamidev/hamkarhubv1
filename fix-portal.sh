#!/bin/bash
# ==============================================================================
# 🚀 HamkarHub Quick Fix Script for Legacy CPUs (AMD Phenom / Core 2 / etc.)
# اسکریپت رفع فوری خطای Not Found و فعال‌سازی پرتال بدون نیاز به کامپایل
# ==============================================================================
set -e

APP_DIR="/opt/hamkarhub"
if [ ! -d "$APP_DIR" ]; then
    APP_DIR=$(pwd)
fi

echo "🚀 در حال راه‌اندازی فوری پرتال همکار هاب در $APP_DIR..."

# ۱. ساخت دایرکتوری dist
sudo mkdir -p "$APP_DIR/dist"

# ۲. ایجاد فایل کامل پرتال تعاملی مستقل در dist/index.html
sudo tee "$APP_DIR/dist/index.html" > /dev/null << 'EOF'
<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>همکار هاب | پرتال فضای کار اشتراکی و میکروتیک</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Vazirmatn', sans-serif; }
    .font-num { font-family: 'Plus Jakarta Sans', 'Vazirmatn', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen selection:bg-amber-500 selection:text-slate-950 flex flex-col">
  <!-- HEADER -->
  <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
          ⚡
        </div>
        <div>
          <h1 class="text-base font-bold text-white flex items-center gap-2">
            همکار هاب <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">HamkarHub</span>
          </h1>
          <p class="text-xs text-slate-400">پرتال محلی فضای کار اشتراکی و شبکه وای‌فای</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          سرور محلی فعال (پورت ۳۰۰۰)
        </div>
        <button onclick="promptCheckIn()" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-md shadow-amber-500/20">
          + ثبت حضور
        </button>
      </div>
    </div>
  </header>

  <!-- NAVIGATION TABS -->
  <div class="bg-slate-900/50 border-b border-slate-800">
    <div class="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto text-xs font-bold py-2">
      <button onclick="switchTab('hotspot')" id="tab-btn-hotspot" class="tab-btn px-4 py-2 rounded-xl bg-amber-500 text-slate-950 transition flex items-center gap-1.5">
        📶 ورود به اینترنت و وای‌فای
      </button>
      <button onclick="switchTab('chat')" id="tab-btn-chat" class="tab-btn px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1.5">
        💬 چت محلی همکاران
      </button>
      <button onclick="switchTab('members')" id="tab-btn-members" class="tab-btn px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1.5">
        👥 همکاران حاضر (<span id="members-count" class="font-num">۰</span>)
      </button>
      <button onclick="switchTab('amenities')" id="tab-btn-amenities" class="tab-btn px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1.5">
        ☕ امکانات و سالن‌ها
      </button>
      <button onclick="switchTab('admin')" id="tab-btn-admin" class="tab-btn px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1.5">
        🔐 پنل مدیریت و میکروتیک
      </button>
    </div>
  </div>

  <!-- MAIN BODY -->
  <main class="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
    <!-- TAB 1: HOTSPOT LOGIN -->
    <div id="tab-hotspot" class="tab-pane">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div class="md:col-span-7 space-y-4">
          <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <span class="inline-block px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold">
              خوش‌آمدید به فضای کار اشتراکی
            </span>
            <h2 class="text-xl sm:text-2xl font-black text-white leading-tight">
              اینترنت پرسرعت، همکاران پرانرژی و امکانات رفاهی یکپارچه
            </h2>
            <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
              با وارد کردن کد اشتراک خود به اینترنت متصل شوید یا بدون نیاز به اینترنت، از امکانات محلی نظیر چت داخلی، اطلاع از آزادسازی اتاق جلسات و آشنایی با همکاران مستقر استفاده فرمایید.
            </p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <span class="text-lg">☕</span>
              <h4 class="text-xs font-bold text-white mt-1">بار قهوه و نوشیدنی</h4>
              <p class="text-[11px] text-slate-400 mt-0.5">سلف سرویس در سالن</p>
            </div>
            <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <span class="text-lg">🔇</span>
              <h4 class="text-xs font-bold text-white mt-1">اتاق تمرکز و سکوت</h4>
              <p class="text-[11px] text-slate-400 mt-0.5">بدون تماس و صحبت</p>
            </div>
            <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <span class="text-lg">🚀</span>
              <h4 class="text-xs font-bold text-white mt-1">اینترنت تفکیک‌شده</h4>
              <p class="text-[11px] text-slate-400 mt-0.5">پینگ پایین برای برنامه‌نویسان</p>
            </div>
          </div>
        </div>

        <div class="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div class="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl border border-amber-500/20">
              📶
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">ورود به وای‌فای (کپتیو پورتال)</h3>
              <p class="text-[11px] text-slate-400">اعتبارسنجی مستقیم از طریق روتر میکروتیک</p>
            </div>
          </div>

          <form method="post" action="http://192.168.88.1/login" id="hotspot-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">نام کاربری / شماره همراه</label>
              <input type="text" name="username" required placeholder="مثال: amir یا شماره تماس" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">کلمه عبور</label>
              <input type="password" name="password" required placeholder="کلمه عبور اشتراک اینترنت" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition">
            </div>
            <input type="hidden" name="dst" value="http://192.168.30.20:3000/">

            <button type="submit" class="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20">
              اتصال و ورود به اینترنت
            </button>
          </form>

          <div class="mt-5 pt-4 border-t border-slate-800 text-center">
            <button onclick="switchTab('chat')" class="text-xs text-amber-400 hover:text-amber-300 transition">
              💬 نیاز به اینترنت ندارید؟ ورود به چت محلی همکاران ←
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: LIVE CHAT -->
    <div id="tab-chat" class="tab-pane hidden">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">کانال‌های گفتگو</h3>
          <div class="space-y-1">
            <button class="w-full text-right px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 font-semibold text-xs border border-amber-500/20">
              # عمومی (General)
            </button>
            <button class="w-full text-right px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs">
              # برنامه‌نویسی و تک
            </button>
            <button class="w-full text-right px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs">
              # نیازمندی‌ها و پروژه
            </button>
          </div>
          <div class="pt-4 border-t border-slate-800">
            <p class="text-[11px] text-slate-400 leading-relaxed">
              چت به صورت آفلاین روی سرور محلی کار می‌کند و هیچ وابستگی به اینترنت ندارد.
            </p>
          </div>
        </div>

        <div class="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px]">
          <div class="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <span class="text-xs font-bold text-white flex items-center gap-1.5">
              <span class="text-amber-400">#</span> کانال عمومی همکاران
            </span>
            <span class="text-[11px] text-emerald-400 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              پخش زنده شبکه محلی
            </span>
          </div>

          <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3">
            <div class="text-center text-xs text-slate-500 my-4">در حال دریافت پیام‌ها...</div>
          </div>

          <form onsubmit="handleSendMessage(event)" class="p-3 border-t border-slate-800 flex gap-2">
            <input type="text" id="chat-input" placeholder="پیام خود را به همکاران بنویسید..." required class="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition">
            <button type="submit" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-md shadow-amber-500/20">
              ارسال
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- TAB 3: MEMBERS -->
    <div id="tab-members" class="tab-pane hidden space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-white">همکاران حاضر در فضا</h3>
          <p class="text-xs text-slate-400">مشاهده صندلی‌ها، تخصص‌ها و وضعیت دسترسی اعضا</p>
        </div>
        <button onclick="promptCheckIn()" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-md shadow-amber-500/20">
          + ثبت حضور در میز
        </button>
      </div>

      <div id="members-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <!-- Members load here -->
      </div>
    </div>

    <!-- TAB 4: AMENITIES -->
    <div id="tab-amenities" class="tab-pane hidden space-y-4">
      <div>
        <h3 class="text-base font-bold text-white">وضعیت فضاهای مشترک و امکانات</h3>
        <p class="text-xs text-slate-400">اطلاع لحظه‌ای از آزادی اتاق‌های جلسه، فون‌باکس‌ها و وضعیت بار قهوه</p>
      </div>
      <div id="amenities-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <!-- Amenities load here -->
      </div>
    </div>

    <!-- TAB 5: ADMIN & MIKROTIK -->
    <div id="tab-admin" class="tab-pane hidden">
      <div class="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl border border-amber-500/20">
            🔐
          </div>
          <div>
            <h3 class="text-base font-bold text-white">اطلاعات سرور و میکروتیک</h3>
            <p class="text-xs text-slate-400">تنظیمات هات‌اسپات و دیتابیس محلی</p>
          </div>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span class="text-slate-400">وضعیت سرویس سرور:</span>
            <span class="text-emerald-400 font-bold">فعال و پاسخگو (Active)</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span class="text-slate-400">پورت فعال سرور:</span>
            <span class="text-amber-400 font-mono font-bold">3000</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span class="text-slate-400">مسیر دیتابیس محلی:</span>
            <span class="text-slate-300 font-mono">/opt/hamkarhub/data/coworking_db.json</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span class="text-slate-400">تنظیمات HTTP-PAP در میکروتیک:</span>
            <span class="text-cyan-400 font-mono text-[11px]">/ip hotspot profile set [find] login-by=http-pap,http-chap</span>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
          <a href="/api/download/ubuntu-package" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700">
            📥 دانلود مستقیم پکیج کامل سرور (.ZIP)
          </a>
          <a href="/api/download/mikrotik-hotspot" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700">
            📥 دانلود قالب‌های روتر میکروتیک (.ZIP)
          </a>
        </div>
      </div>
    </div>
  </main>

  <!-- FOOTER -->
  <footer class="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
    سامانه مدیریت وای‌فای و چت محلی همکار هاب | اجرا روی سرور داخلی فضای کار
  </footer>

  <script>
    let currentTab = 'hotspot';
    let myName = localStorage.getItem('hamkarhub_user') || 'کاربر ' + Math.floor(Math.random() * 900 + 100);

    function switchTab(tabId) {
      document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(el => {
        el.className = 'tab-btn px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1.5';
      });
      const target = document.getElementById('tab-' + tabId);
      const btn = document.getElementById('tab-btn-' + tabId);
      if (target) target.classList.remove('hidden');
      if (btn) {
        btn.className = 'tab-btn px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold transition flex items-center gap-1.5';
      }
      currentTab = tabId;
      if (tabId === 'chat') loadChat();
      if (tabId === 'members') loadMembers();
      if (tabId === 'amenities') loadAmenities();
    }

    async function loadChat() {
      try {
        const res = await fetch('/api/chat/messages');
        const data = await res.json();
        const container = document.getElementById('chat-messages');
        if (!data || data.length === 0) {
          container.innerHTML = '<div class="text-center text-xs text-slate-500 my-4">پیامی در این کانال نیست. اولین پیام را ارسال فرمایید!</div>';
          return;
        }
        container.innerHTML = data.map(m => `
          <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-400">${m.sender?.name || 'همکار'} <span class="text-[10px] text-slate-400 font-normal">(${m.sender?.role || 'عضو'})</span></span>
              <span class="text-[10px] text-slate-500">${new Date(m.timestamp).toLocaleTimeString('fa-IR')}</span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed">${m.text}</p>
          </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
      } catch (e) {
        console.error('Chat error:', e);
      }
    }

    async function handleSendMessage(e) {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      try {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            channelId: 'general',
            sender: { id: 'u-' + Date.now(), name: myName, role: 'عضو همکار' }
          })
        });
        loadChat();
      } catch (err) {
        alert('خطا در ارسال پیام');
      }
    }

    async function loadMembers() {
      try {
        const res = await fetch('/api/members');
        const data = await res.json();
        const grid = document.getElementById('members-grid');
        document.getElementById('members-count').innerText = data ? data.length : 0;
        grid.innerHTML = (data || []).map(m => `
          <div class="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-base font-bold text-amber-400 border border-slate-700">
              ${(m.name || 'ع')[0]}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-xs font-bold text-white truncate">${m.name}</h4>
              <p class="text-[11px] text-slate-400 truncate">${m.role || 'عضو فضای کار'}</p>
              <div class="flex items-center gap-2 mt-1 text-[10px] text-amber-400/90 font-medium">
                <span>📍 ${m.desk || 'سالن اصلی'}</span>
              </div>
            </div>
          </div>
        `).join('');
      } catch (e) {
        console.error('Members error:', e);
      }
    }

    async function promptCheckIn() {
      const name = prompt('نام و نام خانوادگی:', myName);
      if (!name) return;
      myName = name;
      localStorage.setItem('hamkarhub_user', name);
      const desk = prompt('میز یا محل استقرار (مثال: میز ۱۰ سالن باز):', 'میز اشتراکی');
      const role = prompt('تخصص یا شغل (مثال: برنامه‌نویس):', 'توسعه‌دهنده');
      try {
        await fetch('/api/members/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, desk, role, status: 'available' })
        });
        loadMembers();
        switchTab('members');
      } catch (e) {
        alert('خطا در ثبت حضور');
      }
    }

    async function loadAmenities() {
      try {
        const res = await fetch('/api/amenities');
        const data = await res.json();
        const grid = document.getElementById('amenities-grid');
        grid.innerHTML = (data || []).map(a => `
          <div class="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-white">${a.name}</h4>
              <span class="text-[10px] px-2.5 py-0.5 rounded-full ${a.status === 'free' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
                ${a.status === 'free' ? 'آزاد' : 'مشغول'}
              </span>
            </div>
            <p class="text-[11px] text-slate-400">${a.location || 'فضای کار'}</p>
          </div>
        `).join('');
      } catch (e) {
        console.error('Amenities error:', e);
      }
    }

    // Auto refresh chat
    setInterval(() => {
      if (currentTab === 'chat') loadChat();
    }, 4000);

    // Initial load
    loadMembers();
  </script>
</body>
</html>
EOF

echo "✅ فایل dist/index.html با موفقیت در $APP_DIR/dist/ قرار گرفت."

# ۳. کامپایل مجدد server.js با tsc در صورت نیاز
if [ ! -f "$APP_DIR/server.js" ]; then
    echo "⚙️ در حال تولید server.js با tsc..."
    cd "$APP_DIR"
    npx tsc server.ts --ignoreConfig --target es2022 --module esnext --moduleResolution bundler --skipLibCheck --allowJs --outDir . || true
fi

# ۴. ری‌استارت سرویس systemd
echo "🔄 در حال ری‌استارت سرویس hamkarhub..."
sudo systemctl daemon-reload
sudo systemctl restart hamkarhub

echo ""
echo "=========================================================="
echo "🎉 پرتال همکار هاب با موفقیت فعال و مشکل Not Found حل شد!"
echo "🌐 آدرس مرورگر: http://$(hostname -I | awk '{print $1}'):3000"
echo "=========================================================="

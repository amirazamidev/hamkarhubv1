#!/bin/bash
# ==============================================================
# اسکریپت نصب و راه‌اندازی خودکار همکار هاب روی سرور اوبونتو
# سازگار با: Ubuntu 20.04 / 22.04 / 24.04 LTS
# ==============================================================
set -e

echo "🚀 در حال آماده‌سازی و نصب سامانه همکار هاب روی سرور اوبونتو..."

# ۱. به‌روزرسانی مخازن اوبونتو
sudo apt-get update -y
sudo apt-get install -y curl ufw unzip git

# ۲. بررسی و نصب Node.js نسخه ۲۰ LTS
if ! command -v node &> /dev/null; then
    echo "📦 در حال نصب Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh
    if [ "$EUID" -ne 0 ]; then
        sudo bash /tmp/nodesource_setup.sh
        sudo apt-get install -y nodejs
    else
        bash /tmp/nodesource_setup.sh
        apt-get install -y nodejs
    fi
    rm -f /tmp/nodesource_setup.sh
fi

echo "✅ نسخه Node.js: $(node -v)"
echo "✅ نسخه NPM: $(npm -v)"

# ۳. نصب وابستگی‌های پروژه
echo "📦 در حال نصب پکیج‌های پروژه..."
npm install --legacy-peer-deps

# ۴. کامپایل یا استفاده از بیلد آماده فرانت‌اند
CPU_IS_LEGACY=0
CPU_MODEL=$(grep -m1 'model name' /proc/cpuinfo 2>/dev/null | cut -d: -f2 | xargs || echo "Generic CPU")

if ! grep -q -E "sse4_2|avx" /proc/cpuinfo 2>/dev/null; then
    CPU_IS_LEGACY=1
fi

if [ "$CPU_IS_LEGACY" -eq 1 ]; then
    echo "⚡ پردازنده سرور شناسایی شد: $CPU_MODEL"
    echo "ℹ️ این مدل پردازنده (مانند AMD Phenom) فاقد دستورالعمل‌های AVX/SSE4.2 است."
    if [ -f "./dist/index.html" ] && [ -f "./server.js" ]; then
        echo "✅ فایل‌های بیلد آماده و سازگار در دایرکتوری پروژه موجود است."
        echo "🚀 عبور خودکار از کامپایل محلی برای جلوگیری از خطای Illegal instruction."
    else
        echo "🔨 تلاش برای کامپایل پروژه..."
        npm run build || true
    fi
else
    echo "🔨 در حال کامپایل پروژه..."
    if ! npm run build; then
        echo "⚠️ استفاده از بیلد موجود..."
    fi
fi

# ۵. باز کردن پورت ۳۰۰۰ در فایروال اوبونتو (UFW)
sudo ufw allow 3000/tcp || true

# ۶. ثبت سرویس خودکار پس‌زمینه در systemd برای اجرای دائمی
CURRENT_DIR=$(pwd)
NODE_EXEC=$(which node)
SERVICE_USER="${SUDO_USER:-$(whoami)}"

echo "⚙️ در حال پیکربندی سرویس daemon در systemd با کاربر $SERVICE_USER..."

sudo chown -R "$SERVICE_USER:$SERVICE_USER" "$CURRENT_DIR" || true

if [ -f "$CURRENT_DIR/server.js" ]; then
    EXEC_START_CMD="$NODE_EXEC $CURRENT_DIR/server.js"
else
    EXEC_START_CMD="$NODE_EXEC $CURRENT_DIR/node_modules/tsx/dist/cli.mjs server.ts"
fi

sudo bash -c "cat <<EOF > /etc/systemd/system/hamkarhub.service
[Unit]
Description=HamkarHub Coworking Local Chat and MikroTik Hotspot Server
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=$EXEC_START_CMD
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl enable hamkarhub.service
sudo systemctl restart hamkarhub.service

SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "=========================================================="
echo "🎉 سامانه همکار هاب با موفقیت نصب و فعال شد!"
echo "🌐 آدرس دسترسی در شبکه وای‌فای: http://$SERVER_IP:3000"
echo "🔐 پنل مدیریت ادمین: http://$SERVER_IP:3000 (رمز عبور اولیه: admin123)"
echo "📌 وضعیت سرویس: sudo systemctl status hamkarhub"
echo "=========================================================="

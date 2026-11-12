import React, { useState, useEffect } from 'react';
import {
  Lock,
  Plus,
  Trash2,
  Edit2,
  Coffee,
  PhoneCall,
  Users,
  Tv,
  Printer,
  Gamepad2,
  Mic,
  Wifi,
  Hash,
  Download,
  Terminal,
  Check,
  AlertCircle,
  Settings,
  Megaphone,
  Radio,
  Server,
  Key,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  HardDrive,
  RefreshCw,
  LogOut,
  UserCheck,
  UserX,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  Copy,
  GitBranch,
  ExternalLink,
  RotateCcw,
  Eye,
  EyeOff,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Smartphone,
  Sliders,
} from 'lucide-react';
import {
  SpaceAmenity,
  Channel,
  NoticeItem,
  HotspotConfig,
  CafeteriaInfo,
  StaffMember,
  HotspotUserAccount,
  HotspotActiveUser,
  CafeMenuItem,
  CafeOrder,
  AppContentConfig,
} from '../types';
import { MikrotikIntegrationGuide } from './MikrotikIntegrationGuide';

interface AdminPanelProps {
  amenities: SpaceAmenity[];
  channels: Channel[];
  notices: NoticeItem[];
  cafeteria: CafeteriaInfo;
  staff: StaffMember[];
  config: HotspotConfig;
  appContent?: AppContentConfig;
  onRefreshData: () => Promise<void>;
  onUpdateConfig: (newConfig: Partial<HotspotConfig>) => Promise<void>;
  onUpdateAppContent?: (newContent: Partial<AppContentConfig>) => Promise<void>;
  clientIp?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  amenities,
  channels,
  notices,
  cafeteria,
  staff,
  config,
  appContent,
  onRefreshData,
  onUpdateConfig,
  onUpdateAppContent,
  clientIp = '192.168.88.50',
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('hamkar_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Sub-tab
  const [adminSubTab, setAdminSubTab] = useState<
    | 'mikrotik_api'
    | 'cafe_orders'
    | 'cafe_menu'
    | 'app_content'
    | 'cafeteria_staff'
    | 'amenities'
    | 'channels'
    | 'notices'
    | 'settings'
    | 'mikrotik_guide'
    | 'downloads'
  >('mikrotik_api');

  // --- MIKROTIK REST API STATE ---
  const [hotspotUsers, setHotspotUsers] = useState<HotspotUserAccount[]>([]);
  const [activeUsers, setActiveUsers] = useState<HotspotActiveUser[]>([]);
  const [isRouterConnected, setIsRouterConnected] = useState<boolean | null>(null);
  const [routerStatusMsg, setRouterStatusMsg] = useState<string>('');
  const [isLoadingMikrotik, setIsLoadingMikrotik] = useState(false);

  // Router API Config Form
  const [apiUsername, setApiUsername] = useState(config.apiUsername || 'admin');
  const [apiPassword, setApiPassword] = useState(config.apiPassword || '');
  const [apiPort, setApiPort] = useState(config.apiPort || 80);
  const [apiUseSsl, setApiUseSsl] = useState(config.apiUseSsl || false);

  // Add Hotspot User Form
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserQuotaGb, setNewUserQuotaGb] = useState('5');
  const [newUserComment, setNewUserComment] = useState('');
  const [newUserProfile, setNewUserProfile] = useState('default');
  const [newUserMaxDevices, setNewUserMaxDevices] = useState('2');

  // Full Edit Hotspot User Form
  const [editingUser, setEditingUser] = useState<HotspotUserAccount | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPass, setEditUserPass] = useState('');
  const [editUserProfile, setEditUserProfile] = useState('default');
  const [editUserQuotaGb, setEditUserQuotaGb] = useState('5');
  const [editUserMaxDevices, setEditUserMaxDevices] = useState(2);
  const [editUserComment, setEditUserComment] = useState('');
  const [editUserDisabled, setEditUserDisabled] = useState(false);
  const [editUserRateLimit, setEditUserRateLimit] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);

  // Adjust Quota Form
  const [adjustingUser, setAdjustingUser] = useState<HotspotUserAccount | null>(null);
  const [customQuotaGb, setCustomQuotaGb] = useState('10');

  // --- CAFE ORDERS STATE ---
  const [cafeOrders, setCafeOrders] = useState<CafeOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'delivered'>('all');

  // --- CAFE MENU STATE ---
  const [cafeMenu, setCafeMenu] = useState<CafeMenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<CafeMenuItem | null>(null);
  const [menuItemName, setMenuItemName] = useState('');
  const [menuItemCategory, setMenuItemCategory] = useState<'coffee' | 'cold' | 'dessert' | 'snack'>('coffee');
  const [menuItemPrice, setMenuItemPrice] = useState('45000');
  const [menuItemDesc, setMenuItemDesc] = useState('');
  const [menuItemPrepTime, setMenuItemPrepTime] = useState('5');
  const [menuItemAvailable, setMenuItemAvailable] = useState(true);

  // --- APP CONTENT STATE ---
  const [contentHubTitle, setContentHubTitle] = useState(appContent?.hubTitle || 'همکار هاب');
  const [contentHubSubtitle, setContentHubSubtitle] = useState(appContent?.hubSubtitle || 'شبکه محلی و کپتیو پورتال وای‌فای فضای کار اشتراکی');
  const [contentWelcome, setContentWelcome] = useState(appContent?.welcomeNotice || 'به شبکه پرسرعت و فضای کار خوش آمدید!');
  const [contentPortalDesc, setContentPortalDesc] = useState(appContent?.portalDescription || 'سامانه جامع اطلاع‌رسانی، چت داخلی، سفارش کافه و اتصال به اینترنت پرسرعت میکروتیک');
  const [contentWifiRules, setContentWifiRules] = useState(appContent?.wifiRules || '۱. استفاده منصفانه از حجم اینترنت ۲. رعایت سکوت در سالن متمرکز ۳. استفاده از هدفون هنگام تماس صوتی');
  const [contentContact, setContentContact] = useState(appContent?.phoneContact || 'میز پذیرش - داخلی ۱۰۱');
  const [contentAddress, setContentAddress] = useState(appContent?.locationAddress || 'سالن اصلی فضای کار اشتراکی');
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [contentSavedMsg, setContentSavedMsg] = useState(false);
  const [isClearingMock, setIsClearingMock] = useState(false);
  const [clearMockSuccess, setClearMockSuccess] = useState(false);

  // --- CAFETERIA BANNER STATE ---
  const [cafeTitle, setCafeTitle] = useState(cafeteria.title);
  const [cafeSubtitle, setCafeSubtitle] = useState(cafeteria.subtitle);
  const [cafeDesc, setCafeDesc] = useState(cafeteria.description);
  const [cafeImg, setCafeImg] = useState(cafeteria.imageUrl);
  const [cafeNote, setCafeNote] = useState(cafeteria.footerNote);
  const [isSavingCafe, setIsSavingCafe] = useState(false);
  const [cafeSavedMsg, setCafeSavedMsg] = useState(false);

  // --- STAFF FORM STATE ---
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffDesk, setStaffDesk] = useState('');
  const [staffQuote, setStaffQuote] = useState('');
  const [staffAvatar, setStaffAvatar] = useState('');
  const [staffStatus, setStaffStatus] = useState('حاضر در فضا');

  // --- AMENITY FORM STATE ---
  const [editingAmenity, setEditingAmenity] = useState<SpaceAmenity | null>(null);
  const [isAddingAmenity, setIsAddingAmenity] = useState(false);
  const [amenityName, setAmenityName] = useState('');
  const [amenityIcon, setAmenityIcon] = useState('Coffee');
  const [amenityStatus, setAmenityStatus] = useState<SpaceAmenity['status']>('ready');
  const [amenityStatusText, setAmenityStatusText] = useState('');

  // --- CHANNELS & NOTICES FORM STATE ---
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelDesc, setChannelDesc] = useState('');
  const [channelIcon, setChannelIcon] = useState('Hash');

  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState<'normal' | 'urgent'>('normal');

  // --- SETTINGS FORM STATE ---
  const [spaceName, setSpaceName] = useState(config.hotspotName);
  const [routerIp, setRouterIp] = useState(config.routerIp);
  const [serverLocalIp, setServerLocalIp] = useState(config.serverLocalIp);
  const [serverPort, setServerPort] = useState(config.serverPort);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [configSuccessMsg, setConfigSuccessMsg] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedWebInstaller, setCopiedWebInstaller] = useState(false);
  const [copiedGitInstaller, setCopiedGitInstaller] = useState(false);
  const [copiedGitClone, setCopiedGitClone] = useState(false);
  const [gitRepoUrl, setGitRepoUrl] = useState('https://github.com/amirazamidev/hamkarhub');

  // Sync appContent prop changes
  useEffect(() => {
    if (appContent) {
      setContentHubTitle(appContent.hubTitle);
      setContentHubSubtitle(appContent.hubSubtitle);
      setContentWelcome(appContent.welcomeNotice);
      setContentPortalDesc(appContent.portalDescription);
      setContentWifiRules(appContent.wifiRules);
      setContentContact(appContent.phoneContact);
      setContentAddress(appContent.locationAddress);
    }
  }, [appContent]);

  // Sync cafeteria prop changes
  useEffect(() => {
    setCafeTitle(cafeteria.title);
    setCafeSubtitle(cafeteria.subtitle);
    setCafeDesc(cafeteria.description);
    setCafeImg(cafeteria.imageUrl);
    setCafeNote(cafeteria.footerNote);
  }, [cafeteria]);

  // Load MikroTik API data
  const loadMikrotikData = async () => {
    setIsLoadingMikrotik(true);
    try {
      const [usersRes, activeRes, connRes] = await Promise.all([
        fetch('/api/mikrotik/users').then((r) => r.json()),
        fetch('/api/mikrotik/active').then((r) => r.json()),
        fetch('/api/mikrotik/test-connection').then((r) => r.json()),
      ]);

      if (usersRes.users) setHotspotUsers(usersRes.users);
      if (activeRes.activeUsers) setActiveUsers(activeRes.activeUsers);
      setIsRouterConnected(connRes.connected);
      setRouterStatusMsg(connRes.message || '');
    } catch {
      setIsRouterConnected(false);
      setRouterStatusMsg('خطا در برقراری ارتباط با سرویس محلی سرور');
    } finally {
      setIsLoadingMikrotik(false);
    }
  };

  // Load Cafe Orders
  const loadCafeOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/cafe/orders');
      const data = await res.json();
      if (Array.isArray(data)) setCafeOrders(data);
    } catch (err) {
      console.error('Failed to load cafe orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Load Cafe Menu
  const loadCafeMenu = async () => {
    setIsLoadingMenu(true);
    try {
      const res = await fetch('/api/cafe/menu');
      const data = await res.json();
      if (Array.isArray(data)) setCafeMenu(data);
    } catch (err) {
      console.error('Failed to load cafe menu:', err);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (adminSubTab === 'mikrotik_api') loadMikrotikData();
      if (adminSubTab === 'cafe_orders') loadCafeOrders();
      if (adminSubTab === 'cafe_menu') loadCafeMenu();
    }
  }, [isAuthenticated, adminSubTab]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('hamkar_admin_auth', 'true');
      } else {
        setAuthError(data.error || 'رمز عبور نادرست است');
      }
    } catch {
      setAuthError('خطا در بررسی رمز عبور');
    }
  };

  const handleLogoutAdmin = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hamkar_admin_auth');
  };

  // --- MIKROTIK ACTIONS ---

  const handleSaveRouterApiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateConfig({
      apiUsername,
      apiPassword,
      apiPort: Number(apiPort),
      apiUseSsl,
    });
    await loadMikrotikData();
  };

  const handleCreateHotspotUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const limitBytesTotal = Number(newUserQuotaGb) * 1024 * 1024 * 1024;
    await fetch('/api/mikrotik/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newUsername.trim(),
        password: newUserPass,
        profile: newUserProfile,
        limitBytesTotal,
        maxSharedUsers: Number(newUserMaxDevices) || 2,
        comment: newUserComment || 'عضو فضای کار',
      }),
    });

    setIsAddingUser(false);
    setNewUsername('');
    setNewUserPass('');
    setNewUserComment('');
    await loadMikrotikData();
  };

  // Open Full Edit User Modal
  const handleOpenEditUser = (u: HotspotUserAccount) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserPass(u.password || '');
    setEditUserProfile(u.profile || 'default');
    setEditUserQuotaGb(
      u.limitBytesTotal > 0 ? (u.limitBytesTotal / (1024 * 1024 * 1024)).toString() : '0'
    );
    setEditUserMaxDevices(u.maxSharedUsers || 2);
    setEditUserComment(u.comment || '');
    setEditUserDisabled(Boolean(u.disabled));
    setEditUserRateLimit(u.rateLimit || '');
    setShowEditPass(false);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const limitBytesTotal = Number(editUserQuotaGb) * 1024 * 1024 * 1024;
    await fetch(`/api/mikrotik/users/${encodeURIComponent(editingUser.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editUserName.trim(),
        password: editUserPass,
        profile: editUserProfile,
        limitBytesTotal,
        maxSharedUsers: Number(editUserMaxDevices),
        comment: editUserComment,
        disabled: editUserDisabled,
        rateLimit: editUserRateLimit,
      }),
    });

    setEditingUser(null);
    await loadMikrotikData();
  };

  const handleResetUserTraffic = async (userId: string, userName: string) => {
    if (!confirm(`آیا از صفر کردن ترافیک مصرفی کاربر ${userName} اطمینان دارید؟`)) return;
    await fetch(`/api/mikrotik/users/${encodeURIComponent(userId)}/reset-traffic`, {
      method: 'POST',
    });
    await loadMikrotikData();
  };

  const handleAdjustQuota = async (userId: string, deltaGb: number) => {
    const deltaBytes = deltaGb * 1024 * 1024 * 1024;
    await fetch(`/api/mikrotik/users/${encodeURIComponent(userId)}/adjust-quota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deltaBytes }),
    });
    await loadMikrotikData();
  };

  const handleSetExactQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;
    const setExactLimit = Number(customQuotaGb) * 1024 * 1024 * 1024;
    await fetch(`/api/mikrotik/users/${encodeURIComponent(adjustingUser.id)}/adjust-quota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setExactLimit }),
    });
    setAdjustingUser(null);
    await loadMikrotikData();
  };

  const handleDeleteHotspotUser = async (userId: string, userName: string) => {
    if (!confirm(`آیا از حذف اکانت ${userName} اطمینان دارید؟`)) return;
    await fetch(`/api/mikrotik/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    await loadMikrotikData();
  };

  const handleKickActiveUser = async (activeId: string, userName: string) => {
    if (!confirm(`آیا می‌خواهید اتصال اینترنت ${userName} قطع شود؟`)) return;
    await fetch(`/api/mikrotik/active/${encodeURIComponent(activeId)}`, {
      method: 'DELETE',
    });
    await loadMikrotikData();
  };

  // --- CAFE ORDERS ACTIONS ---
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  ) => {
    try {
      await fetch(`/api/admin/cafe/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      await loadCafeOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // --- CAFE MENU ACTIONS ---
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItemName.trim()) return;

    if (editingMenuItem) {
      await fetch(`/api/admin/cafe/menu/${editingMenuItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: menuItemName.trim(),
          category: menuItemCategory,
          price: Number(menuItemPrice),
          description: menuItemDesc,
          prepMinutes: Number(menuItemPrepTime),
          isAvailable: menuItemAvailable,
        }),
      });
    } else {
      await fetch('/api/admin/cafe/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: menuItemName.trim(),
          category: menuItemCategory,
          price: Number(menuItemPrice),
          description: menuItemDesc,
          prepMinutes: Number(menuItemPrepTime),
          isAvailable: menuItemAvailable,
        }),
      });
    }

    setIsAddingMenuItem(false);
    setEditingMenuItem(null);
    setMenuItemName('');
    setMenuItemDesc('');
    await loadCafeMenu();
  };

  const handleDeleteMenuItem = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف آیتم منو «${name}» مطمئن هستید؟`)) return;
    await fetch(`/api/admin/cafe/menu/${id}`, { method: 'DELETE' });
    await loadCafeMenu();
  };

  // --- APP CONTENT ACTIONS ---
  const handleSaveAppContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContent(true);
    setContentSavedMsg(false);
    try {
      const payload: AppContentConfig = {
        hubTitle: contentHubTitle,
        hubSubtitle: contentHubSubtitle,
        welcomeNotice: contentWelcome,
        portalDescription: contentPortalDesc,
        wifiRules: contentWifiRules,
        phoneContact: contentContact,
        locationAddress: contentAddress,
      };

      await fetch('/api/admin/app-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (onUpdateAppContent) {
        await onUpdateAppContent(payload);
      }
      setContentSavedMsg(true);
      setTimeout(() => setContentSavedMsg(false), 3000);
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleClearMockData = async () => {
    if (
      !confirm(
        'هشدار: آیا می‌خواهید تمام پیام‌های چت آزمایشی، اطلاعیه‌های ماک و اکانت‌های تستی پاک شوند؟ سیستم به حالت تمیز و آماده استفاده واقعی درمی‌آید.'
      )
    ) {
      return;
    }
    setIsClearingMock(true);
    setClearMockSuccess(false);
    try {
      await fetch('/api/admin/clear-mock-data', { method: 'POST' });
      setClearMockSuccess(true);
      await onRefreshData();
      await loadMikrotikData();
      setTimeout(() => setClearMockSuccess(false), 4000);
    } finally {
      setIsClearingMock(false);
    }
  };

  // --- CAFETERIA ACTIONS ---
  const handleSaveCafeteria = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCafe(true);
    setCafeSavedMsg(false);
    try {
      await fetch('/api/admin/cafeteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cafeTitle,
          subtitle: cafeSubtitle,
          description: cafeDesc,
          imageUrl: cafeImg,
          footerNote: cafeNote,
        }),
      });
      setCafeSavedMsg(true);
      await onRefreshData();
      setTimeout(() => setCafeSavedMsg(false), 3000);
    } finally {
      setIsSavingCafe(false);
    }
  };

  // --- STAFF ACTIONS ---
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    if (editingStaff) {
      await fetch(`/api/admin/staff/${editingStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffName,
          role: staffRole,
          desk: staffDesk,
          quote: staffQuote,
          avatar: staffAvatar,
          status: staffStatus,
        }),
      });
    } else {
      await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffName,
          role: staffRole || 'مدیر کامیونیتی',
          desk: staffDesk || 'میز پذیرش',
          quote: staffQuote,
          avatar: staffAvatar || '/src/assets/images/community_manager_avatar_1794330976206.jpg',
          status: staffStatus || 'حاضر در فضا',
        }),
      });
    }

    setIsAddingStaff(false);
    setEditingStaff(null);
    setStaffName('');
    setStaffRole('');
    setStaffDesk('');
    setStaffQuote('');
    setStaffAvatar('');
    await onRefreshData();
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('آیا از حذف این عضو کادر اطمینان دارید؟')) return;
    await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    await onRefreshData();
  };

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  // Login view if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">ورود به پنل مدیریت ادمین</h2>
          <p className="text-xs text-slate-400 mt-1">
            کنترل اکانت‌ها و مصرف کاربران میکروتیک، سفارشات کافه، ویرایش متون و امکانات
          </p>
        </div>

        {authError && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-medium text-slate-300">رمز عبور ادمین:</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="رمز عبور پیش‌فرض: admin123"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <span className="text-[11px] text-slate-500 block">رمز پیش‌فرض اولیه: admin123</span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10"
          >
            ورود به پنل مدیریت
          </button>
        </form>
      </div>
    );
  }

  // Filtered cafe orders
  const filteredOrders = cafeOrders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header bar */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>پنل مدیریت ادمین همکار هاب</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                مدیریت کل سیستم
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ویرایش کامل کاربران میکروتیک، سفارشات و منوی کافه، شخصی‌سازی متون و راهنمای شبکه
            </p>
          </div>
        </div>

        <button
          onClick={handleLogoutAdmin}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs rounded-xl transition-colors cursor-pointer"
        >
          خروج از ادمین
        </button>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <button
          onClick={() => setAdminSubTab('mikrotik_api')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'mikrotik_api' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>اکانت‌های هات‌اسپات ({hotspotUsers.length})</span>
        </button>

        <button
          onClick={() => setAdminSubTab('cafe_orders')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'cafe_orders' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>سفارشات کافه ({cafeOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length})</span>
        </button>

        <button
          onClick={() => setAdminSubTab('cafe_menu')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'cafe_menu' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>منوی کافه ({cafeMenu.length})</span>
        </button>

        <button
          onClick={() => setAdminSubTab('app_content')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'app_content' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ویرایش محتوای کل اپ و پاک‌سازی ماک</span>
        </button>

        <button
          onClick={() => setAdminSubTab('cafeteria_staff')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'cafeteria_staff' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>کارت مدیران ({staff.length})</span>
        </button>

        <button
          onClick={() => setAdminSubTab('amenities')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'amenities' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>امکانات و دستگاه‌ها ({amenities.length})</span>
        </button>

        <button
          onClick={() => setAdminSubTab('channels')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'channels' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>کانال‌های چت ({channels.length})</span>
        </button>

        <button
          onClick={() => setAdminSubTab('notices')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'notices' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>تابلو اعلانات ({notices.length})</span>
        </button>

        <button
          onClick={() => setAdminSubTab('mikrotik_guide')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'mikrotik_guide' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>راهنمای میکروتیک و فایل‌ها</span>
        </button>

        <button
          onClick={() => setAdminSubTab('settings')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'settings' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>تنظیمات شبکه</span>
        </button>

        <button
          onClick={() => setAdminSubTab('downloads')}
          className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            adminSubTab === 'downloads' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>دستورات نصب سرور</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: MIKROTIK HOTSPOT API & USER QUOTA MANAGEMENT */}
      {/* ============================================================== */}
      {adminSubTab === 'mikrotik_api' && (
        <div className="space-y-6">
          {/* Router API Connection Status Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isRouterConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>وضعیت اتصال API به روتر میکروتیک:</span>
                  <span className={isRouterConnected ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                    {isRouterConnected ? 'روتر آنلاین (RouterOS REST Active)' : 'حالت لوکال (سرویس محلی)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{routerStatusMsg || 'در حال آماده‌باش'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadMikrotikData}
                disabled={isLoadingMikrotik}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMikrotik ? 'animate-spin' : ''}`} />
                <span>به‌روزرسانی اطلاعات</span>
              </button>

              <button
                onClick={() => setIsAddingUser(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تعریف کاربر جدید</span>
              </button>
            </div>
          </div>

          {/* SECTION A: ACTIVE LIVE SESSIONS (/ip hotspot active) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>دستگاه‌های آنلاین در لحظه ({activeUsers.length} اتصال فعال)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  دستگاه‌هایی که در حال حاضر از طریق هات‌اسپات میکروتیک به اینترنت متصل هستند
                </p>
              </div>
            </div>

            {activeUsers.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                در حال حاضر هیچ نشست فعالی روی روتر یافت نشد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">نام کاربری</th>
                      <th className="py-2.5 px-3">آدرس آی‌پی</th>
                      <th className="py-2.5 px-3">مک آدرس (MAC)</th>
                      <th className="py-2.5 px-3">مدت اتصال</th>
                      <th className="py-2.5 px-3">دانلود / آپلود</th>
                      <th className="py-2.5 px-3 text-left">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {activeUsers.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span>{a.user}</span>
                        </td>
                        <td className="py-2.5 px-3 text-amber-300">{a.address}</td>
                        <td className="py-2.5 px-3 text-slate-400 uppercase text-[11px]">{a.macAddress}</td>
                        <td className="py-2.5 px-3 text-slate-300 tabular-nums">{a.uptime}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-sans text-xs">
                          <span className="text-emerald-400">{formatBytes(a.bytesOut)}</span> /{' '}
                          <span className="text-cyan-400">{formatBytes(a.bytesIn)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-left font-sans">
                          <button
                            onClick={() => handleKickActiveUser(a.id, a.user)}
                            className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-600/40 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            قطع اتصال (Kick)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION B: HOTSPOT USER ACCOUNTS WITH FULL EDIT */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>مدیریت کامل اکانت‌های کاربران، رمز عبور، دستگاه‌ها و حجم ({hotspotUsers.length} کاربر)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  امکان ویرایش مشخصات، رمز عبور، سقف دستگاه‌های همزمان، وضعیت فعال/مسدود و ریست ترافیک
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">نام کاربری</th>
                    <th className="py-2.5 px-3">رمز عبور</th>
                    <th className="py-2.5 px-3">دستگاه‌های فعال</th>
                    <th className="py-2.5 px-3">پروفایل</th>
                    <th className="py-2.5 px-3">حجم مصرفی</th>
                    <th className="py-2.5 px-3">سقف سهمیه</th>
                    <th className="py-2.5 px-3">وضعیت</th>
                    <th className="py-2.5 px-3">توضیحات</th>
                    <th className="py-2.5 px-3 text-left">عملیات ادیت و سهمیه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {hotspotUsers.map((u) => {
                    const totalLimitStr =
                      u.limitBytesTotal > 0 ? formatBytes(u.limitBytesTotal) : 'نامحدود';
                    const usedBytes = (u.bytesIn || 0) + (u.bytesOut || 0);
                    const percentUsed =
                      u.limitBytesTotal > 0 ? Math.min(100, Math.round((usedBytes / u.limitBytesTotal) * 100)) : 0;
                    const activeCount = u.activeDevicesCount || 0;
                    const maxDevices = u.maxSharedUsers || 2;

                    return (
                      <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-white">{u.name}</td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {u.password ? (
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {u.password}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                              activeCount > 0
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <Smartphone className="w-3 h-3" />
                            <span>
                              {activeCount} / {maxDevices} دستگاه
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{u.profile}</td>
                        <td className="py-3 px-3">
                          <div className="font-mono text-slate-200">{formatBytes(usedBytes)}</div>
                          {u.limitBytesTotal > 0 && (
                            <div className="w-20 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className={`h-full ${
                                  percentUsed > 90
                                    ? 'bg-rose-500'
                                    : percentUsed > 70
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-400'
                                }`}
                                style={{ width: `${percentUsed}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-amber-300 font-mono">{totalLimitStr}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              u.disabled
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {u.disabled ? 'مسدود' : 'فعال'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[120px]">
                          {u.comment || '-'}
                        </td>
                        <td className="py-3 px-3 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Full Edit User */}
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              title="ویرایش کامل اکانت و رمز"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>ادیت</span>
                            </button>

                            {/* Reset Traffic Counter */}
                            <button
                              onClick={() => handleResetUserTraffic(u.id, u.name)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs cursor-pointer transition-colors"
                              title="صفر کردن ترافیک مصرفی کاربر"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Increase 1GB */}
                            <button
                              onClick={() => handleAdjustQuota(u.id, 1)}
                              className="px-1.5 py-1 bg-emerald-950 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800 rounded-lg text-[10px] font-mono cursor-pointer"
                              title="+1 GB"
                            >
                              +1G
                            </button>

                            {/* Increase 5GB */}
                            <button
                              onClick={() => handleAdjustQuota(u.id, 5)}
                              className="px-1.5 py-1 bg-emerald-950 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800 rounded-lg text-[10px] font-mono cursor-pointer"
                              title="+5 GB"
                            >
                              +5G
                            </button>

                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteHotspotUser(u.id, u.name)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                              title="حذف اکانت"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Router API Settings Accordion */}
          <form
            onSubmit={handleSaveRouterApiConfig}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>پیکربندی اتصال REST API به روتر میکروتیک (اختیاری برای اتصال زنده)</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">نام کاربری ادمین میکروتیک:</label>
                <input
                  type="text"
                  value={apiUsername}
                  onChange={(e) => setApiUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">رمز عبور ادمین میکروتیک:</label>
                <input
                  type="password"
                  value={apiPassword}
                  onChange={(e) => setApiPassword(e.target.value)}
                  placeholder="رمز روتر"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">پورت وب/REST روتر:</label>
                <input
                  type="number"
                  value={apiPort}
                  onChange={(e) => setApiPort(Number(e.target.value))}
                  placeholder="80"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  ذخیره اطلاعات API روتر
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: CAFE ORDERS MANAGEMENT */}
      {/* ============================================================== */}
      {adminSubTab === 'cafe_orders' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>صف سفارشات زنده کافه و بار قهوه</span>
                  <span className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                    {cafeOrders.length} سفارش
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تغییر وضعیت سفارشات، اطلاع‌رسانی به همکاران و تحویل به میز
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadCafeOrders}
                disabled={isLoadingOrders}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                <span>به‌روزرسانی سفارشات</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
            <button
              onClick={() => setOrderFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                orderFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              همه ({cafeOrders.length})
            </button>
            <button
              onClick={() => setOrderFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                orderFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              در انتظار تأیید ({cafeOrders.filter((o) => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setOrderFilter('preparing')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                orderFilter === 'preparing' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              در حال آماده‌سازی ({cafeOrders.filter((o) => o.status === 'preparing').length})
            </button>
            <button
              onClick={() => setOrderFilter('ready')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                orderFilter === 'ready' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              آماده تحویل ({cafeOrders.filter((o) => o.status === 'ready').length})
            </button>
            <button
              onClick={() => setOrderFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                orderFilter === 'delivered' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              تحویل داده شده ({cafeOrders.filter((o) => o.status === 'delivered').length})
            </button>
          </div>

          {/* Orders Grid */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
              هیچ سفارشی در این وضعیت وجود ندارد.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((ord) => {
                const statusBadge =
                  ord.status === 'pending'
                    ? { bg: 'bg-amber-950/80 text-amber-300 border-amber-800', text: 'در انتظار تأیید' }
                    : ord.status === 'preparing'
                    ? { bg: 'bg-sky-950/80 text-sky-300 border-sky-800', text: 'در حال آماده‌سازی' }
                    : ord.status === 'ready'
                    ? { bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800', text: 'آماده تحویل' }
                    : ord.status === 'delivered'
                    ? { bg: 'bg-slate-800 text-slate-400 border-slate-700', text: 'تحویل داده شد' }
                    : { bg: 'bg-rose-950/80 text-rose-300 border-rose-800', text: 'لغو شده' };

                return (
                  <div
                    key={ord.id}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-base text-amber-400">
                            #{ord.orderNumber || ord.id.slice(-4)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(ord.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusBadge.bg}`}>
                          {statusBadge.text}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">سفارش‌دهنده:</span>
                          <span className="font-bold text-white">{ord.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">شماره صندلی / میز:</span>
                          <span className="font-bold text-amber-300">{ord.desk || 'سالن باز'}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 text-xs">
                        <span className="text-[11px] text-slate-400 font-semibold block">اقلام سفارش:</span>
                        <div className="space-y-1 bg-slate-950/50 p-2 rounded-xl">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-slate-200">
                                {it.name} <span className="text-amber-400 font-mono">× {it.quantity}</span>
                              </span>
                              <span className="text-slate-400 font-mono text-[11px]">
                                {(it.price * it.quantity).toLocaleString('fa-IR')} ت
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {ord.note && (
                        <div className="text-[11px] p-2 bg-amber-950/20 border border-amber-900/40 rounded-lg text-amber-300">
                          <span className="font-bold">یادداشت باریستا:</span> {ord.note}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold">
                        <span className="text-slate-400">جمع کل:</span>
                        <span className="text-emerald-400 font-mono text-sm">
                          {ord.totalAmount.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                      {ord.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')}
                          className="flex-1 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all"
                        >
                          شروع آماده‌سازی
                        </button>
                      )}
                      {ord.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'ready')}
                          className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all"
                        >
                          اعلام آماده تحویل
                        </button>
                      )}
                      {ord.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                          className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all"
                        >
                          تحویل به میز انجام شد
                        </button>
                      )}
                      {ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'cancelled')}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 text-rose-300 rounded-xl text-xs cursor-pointer transition-colors"
                          title="لغو سفارش"
                        >
                          لغو
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 3: CAFE MENU MANAGEMENT */}
      {/* ============================================================== */}
      {adminSubTab === 'cafe_menu' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>مدیریت منوی کافه و قیمت‌ها</span>
                  <span className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                    {cafeMenu.length} آیتم
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  افزودن نوشیدنی، تغییر قیمت‌ها، ناموجود کردن موقت اقلام و زمان آماده‌سازی
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingMenuItem(null);
                setMenuItemName('');
                setMenuItemCategory('coffee');
                setMenuItemPrice('45000');
                setMenuItemDesc('');
                setMenuItemPrepTime('5');
                setMenuItemAvailable(true);
                setIsAddingMenuItem(true);
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن آیتم جدید به منو</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cafeMenu.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  item.isAvailable ? 'bg-slate-900 border-slate-800' : 'bg-slate-900/50 border-slate-800/50 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        {!item.isAvailable && (
                          <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">
                            ناموجود
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-amber-400">
                        دسته:{' '}
                        {item.category === 'coffee'
                          ? 'قهوه و بار گرم'
                          : item.category === 'cold'
                          ? 'نوشیدنی خنک'
                          : item.category === 'dessert'
                          ? 'دسر و کوکی'
                          : 'میان‌وعده'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {item.price.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>

                  {item.description && <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>}

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>زمان آماده‌سازی: {item.prepMinutes} دقیقه</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/cafe/menu/${item.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isAvailable: !item.isAvailable }),
                      });
                      await loadCafeMenu();
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                      item.isAvailable
                        ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900'
                        : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
                    }`}
                  >
                    {item.isAvailable ? 'تغییر به ناموجود' : 'فعال کردن'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingMenuItem(item);
                        setMenuItemName(item.name);
                        setMenuItemCategory(item.category);
                        setMenuItemPrice(item.price.toString());
                        setMenuItemDesc(item.description);
                        setMenuItemPrepTime(item.prepMinutes.toString());
                        setMenuItemAvailable(item.isAvailable);
                        setIsAddingMenuItem(true);
                      }}
                      className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="ویرایش"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item.id, item.name)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 4: APP CONTENT & CLEAR MOCK DATA */}
      {/* ============================================================== */}
      {adminSubTab === 'app_content' && (
        <div className="space-y-6">
          {/* Main App Content Form */}
          <form
            onSubmit={handleSaveAppContent}
            className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  ویرایش محتوای کل اپلیکیشن (تیترها، پیام خوش‌آمد، قوانین و اطلاعات فضا)
                </h3>
              </div>
              {contentSavedMsg && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  محتوای برنامه با موفقیت ذخیره شد
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-medium text-slate-300">نام و عنوان برند فضا (Hub Title):</label>
                <input
                  type="text"
                  value={contentHubTitle}
                  onChange={(e) => setContentHubTitle(e.target.value)}
                  placeholder="مثال: فضای کار اشتراکی همکار هاب"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-medium text-slate-300">زیرعنوان و شعار برند (Hub Subtitle):</label>
                <input
                  type="text"
                  value={contentHubSubtitle}
                  onChange={(e) => setContentHubSubtitle(e.target.value)}
                  placeholder="مثال: شبکه پرسرعت و بستر تعامل همکاران"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5 text-right md:col-span-2">
                <label className="text-xs font-medium text-slate-300">پیام بنر خوش‌آمدگویی هدر پورتال:</label>
                <input
                  type="text"
                  value={contentWelcome}
                  onChange={(e) => setContentWelcome(e.target.value)}
                  placeholder="به اینترنت و شبکه اختصاصی فضای کار اشتراکی خوش آمدید!"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5 text-right md:col-span-2">
                <label className="text-xs font-medium text-slate-300">متن معرفی و توضیحات پورتال:</label>
                <textarea
                  value={contentPortalDesc}
                  onChange={(e) => setContentPortalDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 text-right md:col-span-2">
                <label className="text-xs font-medium text-slate-300">قوانین و مرام‌نامه وای‌فای و سکوت فضا:</label>
                <textarea
                  value={contentWifiRules}
                  onChange={(e) => setContentWifiRules(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-medium text-slate-300">اطلاعات تماس یا داخلی پذیرش:</label>
                <input
                  type="text"
                  value={contentContact}
                  onChange={(e) => setContentContact(e.target.value)}
                  placeholder="میز پذیرش - داخلی ۱۰۱"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-medium text-slate-300">محل یا زون استقرار:</label>
                <input
                  type="text"
                  value={contentAddress}
                  onChange={(e) => setContentAddress(e.target.value)}
                  placeholder="سالن اصلی و طبقه همکف"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingContent}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10"
              >
                {isSavingContent ? 'در حال ذخیره...' : 'ذخیره تنظیمات محتوا'}
              </button>
            </div>
          </form>

          {/* CLEAR MOCK DATA SECTION */}
          <div className="p-6 bg-rose-950/20 border-2 border-rose-800/40 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">پاک‌سازی محتواهای دیفالت و ماک (تست)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    پیام‌های چت تستی، اطلاعیه‌های نمونه و کاربران ماک را پاک کرده و سامانه را برای فضای کار واقعی آماده می‌کند
                  </p>
                </div>
              </div>

              <button
                onClick={handleClearMockData}
                disabled={isClearingMock}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isClearingMock ? 'در حال پاک‌سازی...' : 'حذف همه داده‌های ماک و آماده‌سازی سیستم'}
              </button>
            </div>

            {clearMockSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>داده‌های نمونه با موفقیت پاک شدند و سیستم آماده ورود کاربران واقعی گردید.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 5: CAFETERIA & STAFF MANAGEMENT */}
      {/* ============================================================== */}
      {adminSubTab === 'cafeteria_staff' && (
        <div className="space-y-6">
          {/* CAFETERIA CUSTOMIZER */}
          <form
            onSubmit={handleSaveCafeteria}
            className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">ویرایش بنر و توضیحات کافه‌تریا</h3>
              </div>
              {cafeSavedMsg && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  اطلاعات کافه‌تریا ذخیره شد
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-medium text-slate-300">عنوان اصلی کافه‌تریا:</label>
                <input
                  type="text"
                  value={cafeTitle}
                  onChange={(e) => setCafeTitle(e.target.value)}
                  placeholder="مثال: قهوه تازه، چای دمی و گپ دوستانه"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-medium text-slate-300">زیرعنوان / برچسب بالای تیتر:</label>
                <input
                  type="text"
                  value={cafeSubtitle}
                  onChange={(e) => setCafeSubtitle(e.target.value)}
                  placeholder="مثال: کافه‌تریا و استراحت"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5 text-right md:col-span-2">
                <label className="text-xs font-medium text-slate-300">آدرس عکس کافه (URL یا مسیر عکس):</label>
                <input
                  type="text"
                  value={cafeImg}
                  onChange={(e) => setCafeImg(e.target.value)}
                  placeholder="/src/assets/images/coworking_lounge_cafe_1794330975977.jpg"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5 text-right md:col-span-2">
                <label className="text-xs font-medium text-slate-300">توضیحات کامل کافه‌تریا:</label>
                <textarea
                  value={cafeDesc}
                  onChange={(e) => setCafeDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 text-right md:col-span-2">
                <label className="text-xs font-medium text-slate-300">یادداشت پایین کارت (Footer Note):</label>
                <input
                  type="text"
                  value={cafeNote}
                  onChange={(e) => setCafeNote(e.target.value)}
                  placeholder="مثال: چای و دمنوش رایگان در تمام طول روز مهیاست."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingCafe}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10"
              >
                {isSavingCafe ? 'در حال ذخیره...' : 'ذخیره تغییرات کافه‌تریا'}
              </button>
            </div>
          </form>

          {/* STAFF & COMMUNITY MANAGERS */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>مدیریت کارت مدیران و پرسنل فضا ({staff.length} نفر)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  می‌توانید اطلاعات مدیران را تغییر دهید یا مدیران دیگری اضافه و حذف کنید
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingStaff(null);
                  setStaffName('');
                  setStaffRole('مدیر کامیونیتی');
                  setStaffDesk('میز پذیرش');
                  setStaffQuote('');
                  setStaffAvatar('/src/assets/images/community_manager_avatar_1794330976206.jpg');
                  setStaffStatus('حاضر در فضا');
                  setIsAddingStaff(true);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن عضو جدید کادر / مدیر</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map((p) => (
                <div
                  key={p.id}
                  className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700/80 shrink-0">
                        <img
                          src={p.avatar || '/src/assets/images/community_manager_avatar_1794330976206.jpg'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        <p className="text-xs text-amber-400 mt-0.5">{p.role}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{p.desk}</p>
                      </div>
                    </div>

                    {p.quote && (
                      <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                        «{p.quote}»
                      </p>
                    )}

                    <div className="text-[11px] flex items-center justify-between text-slate-400 pt-1">
                      <span>وضعیت:</span>
                      <span className="text-emerald-400 font-semibold">{p.status}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingStaff(p);
                        setStaffName(p.name);
                        setStaffRole(p.role);
                        setStaffDesk(p.desk);
                        setStaffQuote(p.quote);
                        setStaffAvatar(p.avatar);
                        setStaffStatus(p.status);
                        setIsAddingStaff(true);
                      }}
                      className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="ویرایش مشخصات"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(p.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="حذف این عضو"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 6: AMENITIES MANAGEMENT */}
      {/* ============================================================== */}
      {adminSubTab === 'amenities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>فهرست امکانات فضا، دستگاه‌های کافه و اتاق‌ها</span>
            </h3>

            <button
              onClick={() => {
                setEditingAmenity(null);
                setAmenityName('');
                setAmenityStatus('ready');
                setAmenityStatusText('آماده استفاده');
                setIsAddingAmenity(true);
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن امکانات جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {amenities.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800">
                      {item.icon === 'Coffee' && <Coffee className="w-4 h-4 text-amber-400" />}
                      {item.icon === 'PhoneCall' && <PhoneCall className="w-4 h-4 text-rose-400" />}
                      {item.icon === 'Users' && <Users className="w-4 h-4 text-indigo-400" />}
                      {item.icon === 'Tv' && <Tv className="w-4 h-4 text-cyan-400" />}
                      {item.icon === 'Printer' && <Printer className="w-4 h-4 text-slate-300" />}
                      {item.icon === 'Gamepad2' && <Gamepad2 className="w-4 h-4 text-emerald-400" />}
                      {item.icon === 'Mic' && <Mic className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.statusText}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.status === 'ready' || item.status === 'free'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.status === 'busy'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {item.status === 'ready'
                      ? 'آماده'
                      : item.status === 'free'
                      ? 'آزاد'
                      : item.status === 'busy'
                      ? 'اشغال'
                      : 'نظافت/تعمیر'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => {
                      setEditingAmenity(item);
                      setAmenityName(item.name);
                      setAmenityIcon(item.icon);
                      setAmenityStatus(item.status);
                      setAmenityStatusText(item.statusText);
                      setIsAddingAmenity(true);
                    }}
                    className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="ویرایش"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('آیا از حذف این امکانات اطمینان دارید؟')) return;
                      await fetch(`/api/admin/amenities/${item.id}`, { method: 'DELETE' });
                      await onRefreshData();
                    }}
                    className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 7: CHANNELS MANAGEMENT */}
      {/* ============================================================== */}
      {adminSubTab === 'channels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-400" />
              <span>مدیریت کانال‌های چت و موضوعات گفتگو</span>
            </h3>

            <button
              onClick={() => {
                setChannelName('');
                setChannelDesc('');
                setIsAddingChannel(true);
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن کانال چت</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    <span>{ch.name}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">{ch.description}</p>
                </div>

                <button
                  onClick={async () => {
                    if (!confirm('آیا از حذف این کانال اطمینان دارید؟')) return;
                    await fetch(`/api/admin/channels/${ch.id}`, { method: 'DELETE' });
                    await onRefreshData();
                  }}
                  className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="حذف کانال"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 8: NOTICES MANAGEMENT */}
      {/* ============================================================== */}
      {adminSubTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>مدیریت تابلو اعلانات و رویدادهای فضا</span>
            </h3>

            <button
              onClick={() => {
                setNoticeTitle('');
                setNoticeContent('');
                setIsAddingNotice(true);
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن اطلاعیه</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border space-y-2 ${
                  n.priority === 'urgent' ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <button
                    onClick={async () => {
                      if (!confirm('آیا از حذف این اطلاعیه مطمئن هستید؟')) return;
                      await fetch(`/api/admin/notices/${n.id}`, { method: 'DELETE' });
                      await onRefreshData();
                    }}
                    className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-300">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 9: MIKROTIK STEP-BY-STEP INTEGRATION GUIDE (MOVED INSIDE ADMIN) */}
      {/* ============================================================== */}
      {adminSubTab === 'mikrotik_guide' && (
        <div className="space-y-4">
          <MikrotikIntegrationGuide
            config={config}
            onUpdateConfig={onUpdateConfig}
            clientIp={clientIp}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 10: SETTINGS & ADMIN PASSWORD */}
      {/* ============================================================== */}
      {adminSubTab === 'settings' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setConfigSuccessMsg(false);
            await onUpdateConfig({
              hotspotName: spaceName,
              routerIp,
              serverLocalIp,
              serverPort: Number(serverPort),
              ...(newAdminPassword.trim() ? { adminPassword: newAdminPassword.trim() } : {}),
            });
            setConfigSuccessMsg(true);
            setNewAdminPassword('');
            setTimeout(() => setConfigSuccessMsg(false), 3000);
          }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>تنظیمات سراسری سامانه و رمز عبور ادمین</span>
            </h3>
            {configSuccessMsg && (
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                تنظیمات با موفقیت ذخیره شد
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">نام فضای کار / نام هات‌اسپات وای‌فای:</label>
              <input
                type="text"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">آدرس آی‌پی روتر میکروتیک:</label>
              <input
                type="text"
                value={routerIp}
                onChange={(e) => setRouterIp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">آدرس آی‌پی سرور اوبونتو در شبکه وای‌فای:</label>
              <input
                type="text"
                value={serverLocalIp}
                onChange={(e) => setServerLocalIp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">تغییر رمز عبور ادمین (در صورت تمایل):</label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="برای تغییر، رمز عبور جدید بنویسید"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10"
            >
              ذخیره کلیه تنظیمات
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 11: UBUNTU DOWNLOAD & MIKROTIK PACKAGE */}
      {/* ============================================================== */}
      {adminSubTab === 'downloads' && (
        <div className="space-y-6">
          {/* AMD Phenom Optimization Banner */}
          <div className="p-5 bg-amber-950/20 border border-amber-500/50 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <CpuIcon className="w-5 h-5 shrink-0" />
              <span>پشتیبانی و بهینه‌سازی کامل پردازنده‌های قدیمی (مانند AMD Phenom 9550 Quad-Core):</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              پردازنده <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded font-mono">AMD Phenom 9550</code> فاقد دستورالعمل‌های AVX و SSE4.2 است که موجب خطای <code className="text-rose-400 bg-slate-950 px-1 py-0.5 rounded font-mono">Illegal instruction</code> در esbuild می‌شود. در نسخه جدید، سرور به صورت مستقیم با <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono">node server.js</code> و فایل‌های مستقل HTML اجرا می‌گردد و هیچ کامپایلی در زمان اجرا روی CPU انجام نمی‌شود.
            </p>
          </div>

          {/* GITHUB ONE-LINER INSTALLER */}
          <div className="p-6 bg-slate-900 border-2 border-sky-500/60 rounded-2xl space-y-4 shadow-xl shadow-sky-500/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sky-400 font-bold text-sm">
                <GitBranch className="w-5 h-5 shrink-0" />
                <span>نصب و اجرای خودکار از مخزن گیت‌هاب (روش اصلی و بهینه)</span>
              </div>
              <span className="text-[11px] font-bold text-sky-300 bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-800/50">
                همگام با گیت‌هاب و آپدیت با git pull
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              دستور زیر را در ترمینال اوبونتو کپی و پیست کنید. این دستور پروژه را کلون کرده، Node.js 20 را نصب نموده و سرویس دائمی را استارت می‌زند:
            </p>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">آدرس مخزن گیت‌هاب شما:</label>
              <div className="flex items-center gap-2" dir="ltr">
                <input
                  type="text"
                  value={gitRepoUrl}
                  onChange={(e) => setGitRepoUrl(e.target.value)}
                  placeholder="https://github.com/USERNAME/REPO"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 flex items-center justify-between gap-3 overflow-x-auto shadow-inner"
                dir="ltr"
              >
                <code className="select-all">
                  {`git clone ${gitRepoUrl.replace(/\.git$/, '')}.git hamkarhub && cd hamkarhub && sudo ./install-ubuntu.sh`}
                </code>
                <button
                  onClick={() => {
                    const cleanRepo = gitRepoUrl.replace(/\.git$/, '');
                    const cmd = `git clone ${cleanRepo}.git hamkarhub && cd hamkarhub && sudo ./install-ubuntu.sh`;
                    navigator.clipboard.writeText(cmd);
                    setCopiedGitClone(true);
                    setTimeout(() => setCopiedGitClone(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shrink-0 flex items-center gap-1.5 cursor-pointer transition-all shadow"
                >
                  {copiedGitClone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGitClone ? 'کپی شد!' : 'کپی دستور'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* MIKROTIK CHAP ERROR FIX */}
          <div className="p-5 bg-amber-950/20 border border-amber-500/40 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>دستور رفع ارور «challenge response, try again, enable javascript» میکروتیک:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              با اجرای دستور زیر در ترمینال میکروتیک، ورود HTTP-PAP فعال شده و میکروتیک پسوردهای ارسالی را بدون چالش جاوااسکریپت و بدون ارور می‌پذیرد:
            </p>

            <div
              className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between overflow-x-auto"
              dir="ltr"
            >
              <code>/ip hotspot profile set [find] login-by=http-pap,http-chap,trial,cookie</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('/ip hotspot profile set [find] login-by=http-pap,http-chap,trial,cookie');
                  setCopiedCli(true);
                  setTimeout(() => setCopiedCli(false), 2000);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[11px] rounded-lg shrink-0 mr-2 cursor-pointer"
              >
                {copiedCli ? 'کپی شد!' : 'کپی دستور'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: FULL EDIT USER ACCOUNT */}
      {/* ============================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveEditUser}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>ویرایش کامل مشخصات کاربر {editingUser.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">نام کاربری:</label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">رمز عبور کاربر:</label>
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="text-[11px] text-amber-400 cursor-pointer flex items-center gap-1"
                  >
                    {showEditPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showEditPass ? 'مخفی' : 'نمایش'}</span>
                  </button>
                </div>
                <input
                  type={showEditPass ? 'text' : 'password'}
                  value={editUserPass}
                  onChange={(e) => setEditUserPass(e.target.value)}
                  placeholder="رمز جدید"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">سقف حجم کل (گیگابایت):</label>
                <input
                  type="number"
                  step="0.5"
                  value={editUserQuotaGb}
                  onChange={(e) => setEditUserQuotaGb(e.target.value)}
                  placeholder="0 برای نامحدود"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500">برای حجم نامحدود، عدد 0 بگذارید</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">سقف دستگاه‌های همزمان (Shared Users):</label>
                <select
                  value={editUserMaxDevices}
                  onChange={(e) => setEditUserMaxDevices(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value={1}>۱ دستگاه (تک کاربره)</option>
                  <option value={2}>۲ دستگاه (موبایل + لپ‌تاپ - استاندارد)</option>
                  <option value={3}>۳ دستگاه</option>
                  <option value={5}>۵ دستگاه</option>
                  <option value={10}>۱۰ دستگاه (تیمی)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">پروفایل میکروتیک:</label>
                <input
                  type="text"
                  value={editUserProfile}
                  onChange={(e) => setEditUserProfile(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">محدودیت پهنای باند (اختیاری):</label>
                <input
                  type="text"
                  value={editUserRateLimit}
                  onChange={(e) => setEditUserRateLimit(e.target.value)}
                  placeholder="مثال: 10M/10M"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">یادداشت و شماره صندلی (Comment):</label>
                <input
                  type="text"
                  value={editUserComment}
                  onChange={(e) => setEditUserComment(e.target.value)}
                  placeholder="مثال: عضو ماهانه - میز شماره ۳"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={editUserDisabled}
                    onChange={(e) => setEditUserDisabled(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-rose-400 font-bold">مسدود کردن دسترسی کاربر به اینترنت (Disable Account)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md"
              >
                ذخیره تغییرات اکانت در میکروتیک
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD HOTSPOT USER */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateHotspotUser}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">تعریف کاربر جدید در هات‌اسپات میکروتیک</h3>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">نام کاربری یا شماره اشتراک:</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="مثال: pouya_rad یا 108"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">کلمه عبور:</label>
              <input
                type="password"
                value={newUserPass}
                onChange={(e) => setNewUserPass(e.target.value)}
                placeholder="رمز عبور کاربر"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">سقف سهمیه حجم (GB):</label>
                <select
                  value={newUserQuotaGb}
                  onChange={(e) => setNewUserQuotaGb(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="1">۱ گیگابایت</option>
                  <option value="3">۳ گیگابایت</option>
                  <option value="5">۵ گیگابایت</option>
                  <option value="10">۱۰ گیگابایت</option>
                  <option value="20">۲۰ گیگابایت</option>
                  <option value="50">۵۰ گیگابایت</option>
                  <option value="0">نامحدود</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">تعداد دستگاه‌های مجاز:</label>
                <select
                  value={newUserMaxDevices}
                  onChange={(e) => setNewUserMaxDevices(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="1">۱ دستگاه</option>
                  <option value="2">۲ دستگاه</option>
                  <option value="3">۳ دستگاه</option>
                  <option value="5">۵ دستگاه</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">توضیحات کاربر (Comment):</label>
              <input
                type="text"
                value={newUserComment}
                onChange={(e) => setNewUserComment(e.target.value)}
                placeholder="مثال: عضو ماهانه - میز شماره ۳"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                ایجاد اکانت در میکروتیک
              </button>
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="py-2 px-4 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT CAFE MENU ITEM */}
      {isAddingMenuItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveMenuItem}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">
              {editingMenuItem ? `ویرایش ${editingMenuItem.name}` : 'افزودن آیتم جدید به منوی کافه'}
            </h3>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">نام نوشیدنی یا خوراکی:</label>
              <input
                type="text"
                value={menuItemName}
                onChange={(e) => setMenuItemName(e.target.value)}
                placeholder="مثال: اسپرسو دبل شات ۱۰۰٪ عربیکا"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">دسته‌بندی:</label>
                <select
                  value={menuItemCategory}
                  onChange={(e) => setMenuItemCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="coffee">قهوه و بار گرم</option>
                  <option value="cold">نوشیدنی خنک</option>
                  <option value="dessert">دسر و شیرینی</option>
                  <option value="snack">میان‌وعده و تست</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">قیمت (تومان):</label>
                <input
                  type="number"
                  step="1000"
                  value={menuItemPrice}
                  onChange={(e) => setMenuItemPrice(e.target.value)}
                  placeholder="مثال: 45000"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">زمان تقریبی آماده‌سازی (دقیقه):</label>
                <input
                  type="number"
                  value={menuItemPrepTime}
                  onChange={(e) => setMenuItemPrepTime(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5 flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={menuItemAvailable}
                    onChange={(e) => setMenuItemAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>موجود برای سفارش</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">توضیحات کوتاه یا ترکیبات:</label>
              <textarea
                value={menuItemDesc}
                onChange={(e) => setMenuItemDesc(e.target.value)}
                rows={2}
                placeholder="مثال: تهیه شده از دانه‌های تازه کلمبیا"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                ذخیره در منو
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingMenuItem(false);
                  setEditingMenuItem(null);
                }}
                className="py-2 px-4 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: ADD / EDIT STAFF */}
      {isAddingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveStaff}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">
              {editingStaff ? `ویرایش کارت ${editingStaff.name}` : 'افزودن عضو جدید به کادر مدیریت'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-right">
                <label className="text-xs font-medium text-slate-300">نام و نام خانوادگی:</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="مثال: سارا رضایی"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1 text-right">
                <label className="text-xs font-medium text-slate-300">سمت / نقش:</label>
                <input
                  type="text"
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  placeholder="مثال: مدیر کامیونیتی"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-right">
                <label className="text-xs font-medium text-slate-300">محل استقرار / شماره میز:</label>
                <input
                  type="text"
                  value={staffDesk}
                  onChange={(e) => setStaffDesk(e.target.value)}
                  placeholder="مثال: میز پذیرش - ورودی اصلی"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1 text-right">
                <label className="text-xs font-medium text-slate-300">وضعیت حضور:</label>
                <input
                  type="text"
                  value={staffStatus}
                  onChange={(e) => setStaffStatus(e.target.value)}
                  placeholder="مثال: حاضر در فضا"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">آدرس عکس پرسنلی (URL):</label>
              <input
                type="text"
                value={staffAvatar}
                onChange={(e) => setStaffAvatar(e.target.value)}
                placeholder="/src/assets/images/community_manager_avatar_1794330976206.jpg"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">متن پیام یا خوش‌آمدگویی مدیر:</label>
              <textarea
                value={staffQuote}
                onChange={(e) => setStaffQuote(e.target.value)}
                rows={3}
                placeholder="هر زمان نیاز به رزرو اتاق جلسات داشتید در خدمت هستم..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                ذخیره مشخصات مدیر
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingStaff(false);
                  setEditingStaff(null);
                }}
                className="py-2 px-4 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 5: ADD / EDIT AMENITY */}
      {isAddingAmenity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!amenityName.trim()) return;

              if (editingAmenity) {
                await fetch(`/api/admin/amenities/${editingAmenity.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: amenityName,
                    icon: amenityIcon,
                    status: amenityStatus,
                    statusText: amenityStatusText,
                  }),
                });
              } else {
                await fetch('/api/admin/amenities', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: amenityName,
                    icon: amenityIcon,
                    status: amenityStatus,
                    statusText: amenityStatusText || 'آماده استفاده',
                  }),
                });
              }

              setIsAddingAmenity(false);
              setEditingAmenity(null);
              setAmenityName('');
              setAmenityStatusText('');
              await onRefreshData();
            }}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">
              {editingAmenity ? `ویرایش ${editingAmenity.name}` : 'افزودن امکانات جدید به فضا'}
            </h3>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">نام امکانات یا دستگاه:</label>
              <input
                type="text"
                value={amenityName}
                onChange={(e) => setAmenityName(e.target.value)}
                placeholder="مثال: دستگاه اسپرسوساز دلونگی"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">وضعیت فعلی:</label>
              <select
                value={amenityStatus}
                onChange={(e) => setAmenityStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ready">آماده و فعال</option>
                <option value="free">آزاد و بدون استفاده</option>
                <option value="busy">در حال استفاده / اشغال</option>
                <option value="maintenance">در حال نظافت / در دست تعمیر</option>
              </select>
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">متن وضعیت برای کاربران:</label>
              <input
                type="text"
                value={amenityStatusText}
                onChange={(e) => setAmenityStatusText(e.target.value)}
                placeholder="مثال: دان قهوه تازه پر شده است"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                ذخیره امکانات
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingAmenity(false);
                  setEditingAmenity(null);
                }}
                className="py-2 px-4 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 6: ADD CHANNEL */}
      {isAddingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!channelName.trim()) return;
              await fetch('/api/admin/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: channelName,
                  description: channelDesc,
                  icon: channelIcon,
                }),
              });
              setIsAddingChannel(false);
              setChannelName('');
              setChannelDesc('');
              await onRefreshData();
            }}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">افزودن کانال چت جدید</h3>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">نام کانال:</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="مثال: هوش مصنوعی و داده"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">توضیحات کانال:</label>
              <input
                type="text"
                value={channelDesc}
                onChange={(e) => setChannelDesc(e.target.value)}
                placeholder="مثال: تبادل نظر در خصوص مدل‌های AI"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                ایجاد کانال
              </button>
              <button
                type="button"
                onClick={() => setIsAddingChannel(false)}
                className="py-2 px-4 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 7: ADD NOTICE */}
      {isAddingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!noticeTitle.trim() || !noticeContent.trim()) return;
              await fetch('/api/notices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: noticeTitle,
                  content: noticeContent,
                  author: 'مدیریت فضا',
                  priority: noticePriority,
                }),
              });
              setIsAddingNotice(false);
              setNoticeTitle('');
              setNoticeContent('');
              await onRefreshData();
            }}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">افزودن اطلاعیه مدیریت به تابلو</h3>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">عنوان:</label>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="مثال: تغییر ساعت کاری در روز پنجشنبه"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-medium text-slate-300">متن:</label>
              <textarea
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                rows={3}
                required
                placeholder="توضیحات اطلاعیه..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="noticePriority"
                  checked={noticePriority === 'normal'}
                  onChange={() => setNoticePriority('normal')}
                />
                <span className="text-slate-300">عادی</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="noticePriority"
                  checked={noticePriority === 'urgent'}
                  onChange={() => setNoticePriority('urgent')}
                />
                <span className="text-amber-400 font-bold">فوری / مهم</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                ثبت اطلاعیه
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNotice(false)}
                className="py-2 px-4 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Simple Cpu Icon fallback
function CpuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  desk: string;
  status: 'available' | 'busy' | 'coffee' | 'meeting';
  statusText?: string;
  skills: string[];
  lastSeen: number;
  isOnline: boolean;
  ip?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  sender: {
    id: string;
    name: string;
    role: string;
    desk: string;
    avatar?: string;
  };
  content: string;
  timestamp: number;
  reactions?: Record<string, string[]>;
  isPinned?: boolean;
  type?: 'text' | 'announcement' | 'system' | 'poll';
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  icon: string;
  isDefault?: boolean;
}

export interface HotspotConfig {
  routerIp: string;
  hotspotName: string;
  loginMethod: string;
  serverLocalIp: string;
  serverPort: number;
  trialDurationMinutes: number;
  dailyVoucherPrefix: string;
  walledGardenDomain: string;
  welcomeNotice: string;
  adminPassword?: string;
  apiUsername?: string;
  apiPassword?: string;
  apiPort?: number;
  apiUseSsl?: boolean;
}

export interface SpaceAmenity {
  id: string;
  name: string;
  icon: string;
  status: 'free' | 'busy' | 'maintenance' | 'ready';
  statusText: string;
  updatedBy: string;
  updatedAt: number;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: number;
  priority: 'normal' | 'urgent';
}

export interface HotspotSession {
  isConnected: boolean;
  username: string;
  ip: string;
  uptime: string;
  timeLeft: string;
  bytesIn: string;
  bytesOut: string;
  loginTime?: number;
  bytesInNum?: number;
  bytesOutNum?: number;
  limitBytesTotal?: number;
  activeDevicesCount?: number;
  maxSharedUsers?: number;
  profile?: string;
  mac?: string;
}

export interface CafeteriaInfo {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  footerNote: string;
}

export interface CafeMenuItem {
  id: string;
  name: string;
  category: 'coffee' | 'cold' | 'dessert' | 'snack';
  price: number; // Toman
  description: string;
  icon: string;
  prepMinutes: number;
  isAvailable: boolean;
}

export interface CafeOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CafeOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  desk: string;
  items: CafeOrderItem[];
  totalAmount: number;
  note?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: number;
}

export interface AppContentConfig {
  hubTitle: string;
  hubSubtitle: string;
  welcomeNotice: string;
  portalDescription: string;
  wifiRules: string;
  phoneContact: string;
  locationAddress: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  desk: string;
  quote: string;
  avatar: string;
  status: string;
}

export interface HotspotUserAccount {
  id: string;
  name: string;
  password?: string;
  profile: string;
  bytesIn: number;
  bytesOut: number;
  limitBytesTotal: number; // 0 for unlimited, or bytes
  uptime: string;
  comment?: string;
  disabled?: boolean;
  maxSharedUsers?: number; // max devices allowed simultaneously (shared-users)
  activeDevicesCount?: number; // live devices connected right now
  rateLimit?: string; // e.g. "10M/10M"
  expirationDate?: string;
}

export interface HotspotActiveUser {
  id: string;
  user: string;
  address: string;
  macAddress: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
  timeLeft?: string;
}


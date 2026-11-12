import http from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import JSZip from "jszip";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3e3;
const isProd = process.env.NODE_ENV === "production";
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "coworking_db.json");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DEFAULT_CAFE_MENU = [
  {
    id: "cafe-1",
    name: "\u0627\u0633\u067E\u0631\u0633\u0648 \u062F\u0648\u0628\u0644 \u062A\u062E\u0635\u0635\u06CC",
    category: "coffee",
    price: 45e3,
    description: "\u062F\u0627\u0646 \u0642\u0647\u0648\u0647 \u06F1\u06F0\u06F0\u066A \u0639\u0631\u0628\u06CC\u06A9\u0627 \u062A\u062E\u0635\u0635\u06CC \u0628\u0627 \u06A9\u0631\u0645\u0627\u06CC \u063A\u0644\u06CC\u0638 \u0648 \u0645\u0627\u0646\u062F\u06AF\u0627\u0631",
    icon: "Coffee",
    prepMinutes: 4,
    isAvailable: true
  },
  {
    id: "cafe-2",
    name: "\u0622\u0645\u0631\u06CC\u06A9\u0627\u0646\u0648 \u06A9\u0644\u0627\u0633\u06CC\u06A9",
    category: "coffee",
    price: 5e4,
    description: "\u062A\u0631\u06A9\u06CC\u0628 \u062F\u0648 \u0634\u0627\u062A \u0627\u0633\u067E\u0631\u0633\u0648 \u0648 \u0622\u0628 \u062C\u0648\u0634 \u0641\u06CC\u0644\u062A\u0631 \u0634\u062F\u0647\u060C \u067E\u0631\u06A9\u0627\u0641\u0626\u06CC\u0646 \u0648 \u0645\u062A\u0639\u0627\u062F\u0644",
    icon: "Coffee",
    prepMinutes: 4,
    isAvailable: true
  },
  {
    id: "cafe-3",
    name: "\u06A9\u0627\u0641\u0647 \u0644\u0627\u062A\u0647 \u0628\u0627 \u0634\u06CC\u0631 \u06AF\u0631\u0645",
    category: "coffee",
    price: 65e3,
    description: "\u0627\u0633\u067E\u0631\u0633\u0648 \u0647\u0645\u0631\u0627\u0647 \u0628\u0627 \u0634\u06CC\u0631 \u062A\u0627\u0632\u0647 \u0628\u0627 \u0641\u0648\u0645 \u0627\u0628\u0631\u06CC\u0634\u0645\u06CC \u0648 \u0644\u0627\u062A\u0647 \u0622\u0631\u062A \u0632\u06CC\u0628\u0627",
    icon: "Coffee",
    prepMinutes: 6,
    isAvailable: true
  },
  {
    id: "cafe-4",
    name: "\u06A9\u0627\u067E\u0648\u0686\u06CC\u0646\u0648 \u0627\u06CC\u062A\u0627\u0644\u06CC\u0627\u06CC\u06CC",
    category: "coffee",
    price: 65e3,
    description: "\u0637\u0639\u0645 \u06A9\u0644\u0627\u0633\u06CC\u06A9 \u0628\u0627 \u0641\u0648\u0645 \u0634\u06CC\u0631 \u063A\u0644\u06CC\u0638 \u0648 \u067E\u0648\u062F\u0631 \u062F\u0627\u0631\u0686\u06CC\u0646/\u06A9\u0627\u06A9\u0627\u0626\u0648 \u0645\u0631\u063A\u0648\u0628",
    icon: "Coffee",
    prepMinutes: 6,
    isAvailable: true
  },
  {
    id: "cafe-5",
    name: "\u0642\u0647\u0648\u0647 \u062F\u0645\u06CC V60 \u062A\u06A9\u200C\u062E\u0627\u0633\u062A\u06AF\u0627\u0647",
    category: "coffee",
    price: 85e3,
    description: "\u0639\u0635\u0627\u0631\u0647\u200C\u06AF\u06CC\u0631\u06CC \u062F\u0633\u062A\u06CC \u0628\u0627 \u0641\u06CC\u0644\u062A\u0631 \u06A9\u0627\u063A\u0630\u06CC\u060C \u0637\u0639\u0645\u200C\u06CC\u0627\u062F\u0647\u0627\u06CC \u06AF\u0644\u06CC \u0648 \u0645\u06CC\u0648\u0647\u200C\u0627\u06CC",
    icon: "Coffee",
    prepMinutes: 8,
    isAvailable: true
  },
  {
    id: "cafe-6",
    name: "\u0642\u0647\u0648\u0647 \u0639\u0635\u0627\u0631\u0647 \u0633\u0631\u062F (Cold Brew)",
    category: "cold",
    price: 75e3,
    description: "\u0639\u0635\u0627\u0631\u0647\u200C\u06AF\u06CC\u0631\u06CC \u06F1\u06F6 \u0633\u0627\u0639\u062A\u0647 \u0628\u0627 \u0622\u0628 \u06CC\u062E\u060C \u0627\u0633\u06CC\u062F\u06CC\u062A\u0647 \u0628\u0633\u06CC\u0627\u0631 \u067E\u0627\u06CC\u06CC\u0646 \u0648 \u06A9\u0627\u0641\u0626\u06CC\u0646 \u0627\u0646\u0631\u0698\u06CC\u200C\u0628\u062E\u0634",
    icon: "CupSoda",
    prepMinutes: 2,
    isAvailable: true
  },
  {
    id: "cafe-7",
    name: "\u0622\u06CC\u0633 \u0644\u0627\u062A\u0647 \u0628\u0627 \u0633\u06CC\u0631\u0648\u067E \u0648\u0627\u0646\u06CC\u0644",
    category: "cold",
    price: 75e3,
    description: "\u0634\u06CC\u0631 \u0633\u0631\u062F\u060C \u06CC\u062E \u0628\u0644\u0648\u0631\u06CC\u060C \u0627\u0633\u067E\u0631\u0633\u0648 \u062A\u0627\u0632\u0647 \u0648 \u0633\u06CC\u0631\u0648\u067E \u0637\u0628\u06CC\u0639\u06CC \u0648\u0627\u0646\u06CC\u0644 \u0645\u0627\u062F\u0627\u06AF\u0627\u0633\u06A9\u0627\u0631",
    icon: "CupSoda",
    prepMinutes: 4,
    isAvailable: true
  },
  {
    id: "cafe-8",
    name: "\u0644\u06CC\u0645\u0648\u0646\u0627\u062F \u0646\u0639\u0646\u0627\u0639 \u0637\u0628\u06CC\u0639\u06CC (\u0645\u0648\u062E\u06CC\u062A\u0648)",
    category: "cold",
    price: 6e4,
    description: "\u0622\u0628 \u0644\u06CC\u0645\u0648\u06CC \u062A\u0627\u0632\u0647\u060C \u0628\u0631\u06AF\u200C\u0647\u0627\u06CC \u0646\u0639\u0646\u0627\u0639 \u06A9\u0648\u0628\u06CC\u062F\u0647 \u0634\u062F\u0647 \u0648 \u0633\u0648\u062F\u0627\u06CC \u06AF\u0627\u0632\u062F\u0627\u0631 \u062E\u0646\u06A9",
    icon: "CupSoda",
    prepMinutes: 5,
    isAvailable: true
  },
  {
    id: "cafe-9",
    name: "\u06A9\u0631\u0648\u0633\u0627\u0646 \u0641\u0631\u0627\u0646\u0633\u0648\u06CC \u062A\u0627\u0632\u0647 \u067E\u062E\u062A",
    category: "dessert",
    price: 55e3,
    description: "\u0644\u0627\u06CC\u0647\u200C\u0644\u0627\u06CC\u0647 \u06A9\u0631\u0647\u200C\u0627\u06CC\u060C \u0628\u0631\u0634\u062A\u0647 \u062F\u0631 \u0628\u06CC\u0631\u0648\u0646 \u0648 \u0646\u0631\u0645 \u062F\u0631 \u062F\u0627\u062E\u0644 (\u0633\u0631\u0648 \u06AF\u0631\u0645)",
    icon: "Croissant",
    prepMinutes: 3,
    isAvailable: true
  },
  {
    id: "cafe-10",
    name: "\u0686\u06CC\u0632\u06A9\u06CC\u06A9 \u0646\u06CC\u0648\u06CC\u0648\u0631\u06A9\u06CC \u062A\u0646\u0648\u0631\u06CC",
    category: "dessert",
    price: 95e3,
    description: "\u0628\u0627\u0641\u062A \u062E\u0627\u0645\u0647\u200C\u0627\u06CC \u063A\u0646\u06CC \u0628\u0627 \u06A9\u0631\u0627\u0633\u062A \u0628\u06CC\u0633\u06A9\u0648\u06CC\u062A\u06CC \u0648 \u0633\u0633 \u062A\u0645\u0634\u06A9 \u062A\u0631\u0634 \u0648 \u0634\u06CC\u0631\u06CC\u0646",
    icon: "Cake",
    prepMinutes: 1,
    isAvailable: true
  },
  {
    id: "cafe-11",
    name: "\u0633\u0627\u0646\u062F\u0648\u06CC\u0686 \u0645\u0631\u063A \u0648 \u0633\u0633 \u067E\u0633\u062A\u0648 (\u067E\u0627\u0646\u06CC\u0646\u06CC)",
    category: "snack",
    price: 145e3,
    description: "\u0641\u06CC\u0644\u0647 \u0645\u0631\u063A \u06AF\u0631\u06CC\u0644 \u0634\u062F\u0647\u060C \u0633\u0633 \u067E\u0633\u062A\u0648 \u0631\u06CC\u062D\u0627\u0646\u060C \u067E\u0646\u06CC\u0631 \u0645\u0648\u0632\u0627\u0631\u0644\u0627 \u06A9\u0634\u200C\u062F\u0627\u0631 \u062F\u0631 \u0646\u0627\u0646 \u0686\u0627\u0628\u0627\u062A\u0627",
    icon: "UtensilsCrossed",
    prepMinutes: 12,
    isAvailable: true
  },
  {
    id: "cafe-12",
    name: "\u06A9\u0644\u0627\u0628 \u0633\u0627\u0646\u062F\u0648\u06CC\u0686 \u0628\u06CC\u06A9\u0646 \u0628\u0648\u0642\u0644\u0645\u0648\u0646 \u0648 \u067E\u0646\u06CC\u0631",
    category: "snack",
    price: 135e3,
    description: "\u0633\u0647 \u0644\u0627\u06CC\u0647 \u0646\u0627\u0646 \u062A\u0633\u062A \u062A\u0633\u062A\u200C\u0634\u062F\u0647\u060C \u0628\u06CC\u06A9\u0646 \u0628\u0648\u0642\u0644\u0645\u0648\u0646 \u062F\u0648\u062F\u06CC\u060C \u067E\u0646\u06CC\u0631 \u06AF\u0648\u062F\u0627 \u0648 \u06A9\u0627\u0647\u0648 \u0641\u0631\u0627\u0646\u0633\u0648\u06CC",
    icon: "UtensilsCrossed",
    prepMinutes: 10,
    isAvailable: true
  }
];
const DEFAULT_APP_CONTENT = {
  hubTitle: "\u0647\u0645\u06A9\u0627\u0631 \u0647\u0627\u0628 | \u067E\u0631\u062A\u0627\u0644 \u0645\u062D\u0644\u06CC \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC",
  hubSubtitle: "\u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u067E\u0627\u06CC\u062F\u0627\u0631\u060C \u0634\u0628\u06A9\u0647 \u0627\u062C\u062A\u0645\u0627\u0639\u06CC \u0647\u0645\u06A9\u0627\u0631\u0627\u0646 \u0648 \u0633\u06CC\u0633\u062A\u0645 \u0631\u0641\u0627\u0647\u06CC \u06CC\u06A9\u067E\u0627\u0631\u0686\u0647",
  welcomeNotice: "\u0628\u0647 \u0634\u0628\u06A9\u0647 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u0648 \u067E\u0631\u062A\u0627\u0644 \u0627\u0631\u062A\u0628\u0627\u0637\u06CC \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC \u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F!",
  portalDescription: "\u0628\u0627 \u0627\u06A9\u0627\u0646\u062A \u0627\u0634\u062A\u0631\u0627\u06A9 \u062E\u0648\u062F \u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0645\u062A\u0635\u0644 \u0634\u0648\u06CC\u062F \u06CC\u0627 \u0628\u062F\u0648\u0646 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A\u060C \u0628\u0627 \u0647\u0645\u06A9\u0627\u0631\u0627\u0646 \u0645\u0633\u062A\u0642\u0631 \u062F\u0631 \u0641\u0636\u0627 \u06AF\u0641\u062A\u06AF\u0648 \u06A9\u0646\u06CC\u062F \u0648 \u0627\u0632 \u06A9\u0627\u0641\u0647 \u0633\u0641\u0627\u0631\u0634 \u062F\u0647\u06CC\u062F.",
  wifiRules: "\u06F1. \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062A\u0648\u0631\u0646\u062A \u0648 \u062F\u0627\u0646\u0644\u0648\u062F \u063A\u06CC\u0631\u0645\u0646\u0635\u0641\u0627\u0646\u0647 \u062F\u0631 \u0633\u0627\u0639\u0627\u062A \u0627\u0648\u062C \u0645\u0645\u0646\u0648\u0639 \u0627\u0633\u062A. \u06F2. \u0628\u0631\u0627\u06CC \u062C\u0644\u0633\u0627\u062A \u0635\u0648\u062A\u06CC \u0627\u0632 \u0641\u0648\u0646\u200C\u0628\u0627\u06A9\u0633 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0634\u0648\u062F. \u06F3. \u0631\u0639\u0627\u06CC\u062A \u062D\u0631\u06CC\u0645 \u062E\u0635\u0648\u0635\u06CC \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A.",
  phoneContact: "\u06F0\u06F2\u06F1-\u06F8\u06F8\u06F9\u06F9\u06F0\u06F0\u06F1\u06F1",
  locationAddress: "\u062E\u06CC\u0627\u0628\u0627\u0646 \u0648\u0644\u06CC\u0639\u0635\u0631\u060C \u062A\u0642\u0627\u0637\u0639 \u0641\u0627\u0637\u0645\u06CC\u060C \u067E\u0644\u0627\u06A9 \u06F1\u06F2\u060C \u0637\u0628\u0642\u0647 \u06F3"
};
const DEFAULT_DB = {
  config: {
    routerIp: "192.168.88.1",
    hotspotName: "Hamkar Hub Wi-Fi",
    loginMethod: "http-chap",
    serverLocalIp: "192.168.88.254",
    serverPort: 3e3,
    trialDurationMinutes: 60,
    dailyVoucherPrefix: "DAY-",
    walledGardenDomain: "hub.local",
    welcomeNotice: "\u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0648 \u0634\u0628\u06A9\u0647 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC \u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F!"
  },
  appContent: DEFAULT_APP_CONTENT,
  cafeMenu: DEFAULT_CAFE_MENU,
  cafeOrders: [],
  channels: [
    {
      id: "general",
      name: "\u0639\u0645\u0648\u0645\u06CC \u0648 \u0644\u0627\u0628\u06CC",
      description: "\u06AF\u0641\u062A\u06AF\u0648\u0647\u0627\u06CC \u0631\u0648\u0632\u0645\u0631\u0647\u060C \u0645\u0639\u0631\u0641\u06CC \u0627\u0639\u0636\u0627 \u0648 \u06AF\u067E \u062F\u0648\u0633\u062A\u0627\u0646\u0647 \u062D\u06CC\u0646 \u06A9\u0627\u0631",
      icon: "Coffee",
      isDefault: true
    },
    {
      id: "coworking",
      name: "\u0647\u0645\u06A9\u0627\u0631\u06CC \u0648 \u062A\u062E\u0635\u0635\u200C\u0647\u0627",
      description: "\u062A\u0628\u0627\u062F\u0644 \u0645\u0647\u0627\u0631\u062A\u060C \u0647\u0645\u200C\u0641\u06A9\u0631\u06CC \u067E\u0631\u0648\u0698\u0647\u200C\u0647\u0627\u060C \u0645\u0634\u0627\u0648\u0631\u0647 \u06A9\u062F \u0648 \u0637\u0631\u0627\u062D\u06CC",
      icon: "Users"
    },
    {
      id: "cafeteria",
      name: "\u06A9\u0627\u0641\u0647 \u0648 \u0633\u0641\u0627\u0631\u0634 \u0646\u0627\u0647\u0627\u0631",
      description: "\u0647\u0645\u0627\u0647\u0646\u06AF\u06CC \u0633\u0641\u0627\u0631\u0634 \u06AF\u0631\u0648\u0647\u06CC \u0646\u0627\u0647\u0627\u0631\u060C \u0648\u0636\u0639\u06CC\u062A \u0642\u0647\u0648\u0647 \u0648 \u0627\u0633\u062A\u0631\u0627\u062D\u062A",
      icon: "UtensilsCrossed"
    },
    {
      id: "meeting-rooms",
      name: "\u0627\u062A\u0627\u0642 \u062C\u0644\u0633\u0627\u062A \u0648 \u062A\u0645\u0627\u0633",
      description: "\u0647\u0645\u0627\u0647\u0646\u06AF\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u0641\u0648\u0646\u200C\u0628\u0627\u06A9\u0633\u200C\u0647\u0627 \u0648 \u0627\u062A\u0627\u0642 \u062C\u0644\u0633\u0627\u062A",
      icon: "PhoneCall"
    },
    {
      id: "announcements",
      name: "\u062A\u0627\u0628\u0644\u0648 \u0627\u0639\u0644\u0627\u0646\u0627\u062A \u0648 \u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627",
      description: "\u0627\u0637\u0644\u0627\u0639\u06CC\u0647\u200C\u0647\u0627\u06CC \u0645\u062F\u06CC\u0631 \u0641\u0636\u0627\u060C \u0633\u0627\u0639\u062A \u06A9\u0627\u0631\u06CC \u0648 \u06A9\u0627\u0631\u06AF\u0627\u0647\u200C\u0647\u0627\u06CC \u0647\u0641\u062A\u06AF\u06CC",
      icon: "Megaphone"
    }
  ],
  members: [
    {
      id: "admin-sara",
      name: "\u0633\u0627\u0631\u0627 \u0631\u0636\u0627\u06CC\u06CC",
      role: "\u0645\u062F\u06CC\u0631 \u06A9\u0627\u0645\u06CC\u0648\u0646\u06CC\u062A\u06CC (Community Manager)",
      desk: "\u0645\u06CC\u0632 \u067E\u0630\u06CC\u0631\u0634 - \u0648\u0631\u0648\u062F\u06CC \u0627\u0635\u0644\u06CC",
      status: "available",
      statusText: "\u067E\u0627\u0633\u062E\u06AF\u0648\u06CC \u0633\u0648\u0627\u0644\u0627\u062A \u0648 \u0631\u0632\u0631\u0648 \u0627\u062A\u0627\u0642 \u062C\u0644\u0633\u0627\u062A",
      skills: ["\u0645\u062F\u06CC\u0631\u06CC\u062A \u0641\u0636\u0627", "\u0634\u0628\u06A9\u0647\u200C\u0633\u0627\u0632\u06CC", "\u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627"],
      lastSeen: Date.now(),
      isOnline: true
    },
    {
      id: "member-ali",
      name: "\u0639\u0644\u06CC \u0627\u062D\u0645\u062F\u06CC",
      role: "\u062A\u0648\u0633\u0639\u0647\u200C\u062F\u0647\u0646\u062F\u0647 \u0641\u0648\u0644\u200C\u0627\u0633\u062A\u06A9",
      desk: "\u0645\u06CC\u0632 \u0634\u0645\u0627\u0631\u0647 \u06F1\u06F4 - \u0633\u0627\u0644\u0646 \u0628\u0627\u0632",
      status: "busy",
      statusText: "\u062F\u0631 \u062D\u0627\u0644 \u062A\u0645\u0631\u06A9\u0632 \u0639\u0645\u06CC\u0642 \u0631\u0648\u06CC \u062A\u0633\u06A9 \u0627\u0633\u067E\u0631\u06CC\u0646\u062A",
      skills: ["React", "Node.js", "PostgreSQL"],
      lastSeen: Date.now() - 1e3 * 60 * 3,
      isOnline: true
    },
    {
      id: "member-maryam",
      name: "\u0645\u0631\u06CC\u0645 \u06A9\u0631\u06CC\u0645\u06CC",
      role: "\u0637\u0631\u0627\u062D \u062A\u062C\u0631\u0628\u0647 \u06A9\u0627\u0631\u0628\u0631\u06CC (UI/UX)",
      desk: "\u0645\u06CC\u0632 \u0634\u0645\u0627\u0631\u0647 \u06F2\u06F1 - \u06A9\u0646\u0627\u0631 \u067E\u0646\u062C\u0631\u0647",
      status: "coffee",
      statusText: "\u0622\u0645\u0627\u062F\u0647 \u06AF\u067E \u06A9\u0627\u0631\u06CC \u062F\u0631 \u06A9\u0627\u0641\u0647\u200C\u062A\u0631\u06CC\u0627 \u2615",
      skills: ["Figma", "Design Systems", "User Research"],
      lastSeen: Date.now() - 1e3 * 60 * 12,
      isOnline: true
    },
    {
      id: "member-reza",
      name: "\u0631\u0636\u0627 \u0646\u0648\u0631\u06CC",
      role: "\u0645\u062A\u062E\u0635\u0635 \u0633\u0626\u0648 \u0648 \u0645\u0627\u0631\u06A9\u062A\u06CC\u0646\u06AF",
      desk: "\u0645\u06CC\u0632 \u0634\u0645\u0627\u0631\u0647 \u06F8 - \u0637\u0628\u0642\u0647 \u0647\u0645\u06A9\u0641",
      status: "meeting",
      statusText: "\u062C\u0644\u0633\u0647 \u0622\u0646\u0644\u0627\u06CC\u0646 \u062A\u0627 \u06F1\u06F1:\u06F3\u06F0",
      skills: ["SEO", "Growth", "Google Ads"],
      lastSeen: Date.now() - 1e3 * 60 * 20,
      isOnline: true
    }
  ],
  amenities: [
    {
      id: "espresso-bar",
      name: "\u062F\u0633\u062A\u06AF\u0627\u0647 \u0627\u0633\u067E\u0631\u0633\u0648 \u0628\u0627\u0631",
      icon: "Coffee",
      status: "ready",
      statusText: "\u062F\u0627\u0646 \u0642\u0647\u0648\u0647 \u062A\u0627\u0632\u0647 \u067E\u0631 \u0634\u062F\u0647 \u0648 \u0622\u0628 \u062F\u0627\u063A \u0622\u0645\u0627\u062F\u0647 \u0627\u0633\u062A",
      updatedBy: "\u0633\u0627\u0631\u0627 \u0631\u0636\u0627\u06CC\u06CC",
      updatedAt: Date.now() - 1e3 * 60 * 45
    },
    {
      id: "phone-booth-1",
      name: "\u0641\u0648\u0646 \u0628\u0627\u06A9\u0633 \u06F1 (\u0622\u06A9\u0648\u0633\u062A\u06CC\u06A9)",
      icon: "PhoneCall",
      status: "free",
      statusText: "\u0622\u0632\u0627\u062F \u0648 \u062A\u0645\u06CC\u0632 - \u0628\u062F\u0648\u0646 \u0631\u0632\u0631\u0648 \u0642\u0628\u0644\u06CC",
      updatedBy: "\u0639\u0644\u06CC \u0627\u062D\u0645\u062F\u06CC",
      updatedAt: Date.now() - 1e3 * 60 * 15
    },
    {
      id: "phone-booth-2",
      name: "\u0641\u0648\u0646 \u0628\u0627\u06A9\u0633 \u06F2 (\u0622\u06A9\u0648\u0633\u062A\u06CC\u06A9)",
      icon: "PhoneCall",
      status: "busy",
      statusText: "\u062F\u0631 \u062D\u0627\u0644 \u0645\u06A9\u0627\u0644\u0645\u0647 \u06A9\u0627\u0631\u06CC (\u062A\u0627 \u06F1\u06F5 \u062F\u0642\u06CC\u0642\u0647 \u062F\u06CC\u06AF\u0631)",
      updatedBy: "\u0631\u0636\u0627 \u0646\u0648\u0631\u06CC",
      updatedAt: Date.now() - 1e3 * 60 * 5
    },
    {
      id: "meeting-room-a",
      name: "\u0627\u062A\u0627\u0642 \u062C\u0644\u0633\u0627\u062A \u06F8 \u0646\u0641\u0631\u0647 (\u0645\u062C\u0647\u0632 \u0628\u0647 \u0646\u0645\u0627\u06CC\u0634\u06AF\u0631)",
      icon: "Users",
      status: "free",
      statusText: "\u0622\u0632\u0627\u062F \u062A\u0627 \u0633\u0627\u0639\u062A \u06F1\u06F4:\u06F0\u06F0",
      updatedBy: "\u0633\u0627\u0631\u0627 \u0631\u0636\u0627\u06CC\u06CC",
      updatedAt: Date.now() - 1e3 * 60 * 60
    }
  ],
  messages: [
    {
      id: "msg-1",
      channelId: "announcements",
      sender: {
        id: "admin-sara",
        name: "\u0633\u0627\u0631\u0627 \u0631\u0636\u0627\u06CC\u06CC",
        role: "\u0645\u062F\u06CC\u0631 \u06A9\u0627\u0645\u06CC\u0648\u0646\u06CC\u062A\u06CC",
        desk: "\u0645\u06CC\u0632 \u067E\u0630\u06CC\u0631\u0634"
      },
      content: "\u0633\u0644\u0627\u0645 \u0647\u0645\u06A9\u0627\u0631\u0627\u0646 \u06AF\u0631\u0627\u0645\u06CC! \u0635\u0628\u062D\u062A\u0648\u0646 \u0628\u062E\u06CC\u0631. \u0627\u0645\u0631\u0648\u0632 \u0628\u0639\u062F\u0627\u0632\u0638\u0647\u0631 \u0633\u0627\u0639\u062A \u06F1\u06F6 \u062F\u0648\u0631\u0647\u0645\u06CC \u06A9\u0648\u062A\u0627\u0647 \u06F2\u06F0 \u062F\u0642\u06CC\u0642\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u0645\u0639\u0631\u0641\u06CC \u0627\u0639\u0636\u0627\u06CC \u062C\u062F\u06CC\u062F \u062F\u0631 \u06A9\u0627\u0641\u0647 \u062F\u0627\u0631\u06CC\u0645. \u0647\u0645\u0647 \u062F\u0639\u0648\u062A \u0647\u0633\u062A\u06CC\u062F!",
      timestamp: Date.now() - 1e3 * 60 * 90,
      reactions: { "\u{1F44B}": ["member-ali", "member-maryam"], "\u2615": ["member-reza"] },
      type: "announcement"
    },
    {
      id: "msg-2",
      channelId: "general",
      sender: {
        id: "member-maryam",
        name: "\u0645\u0631\u06CC\u0645 \u06A9\u0631\u06CC\u0645\u06CC",
        role: "\u0637\u0631\u0627\u062D UI/UX",
        desk: "\u0645\u06CC\u0632 \u06F2\u06F1"
      },
      content: "\u0635\u0628\u062D \u0628\u062E\u06CC\u0631 \u0647\u0645\u06AF\u06CC! \u06A9\u0633\u06CC \u0647\u0633\u062A \u0645\u0627\u0646\u06CC\u062A\u0648\u0631 \u0627\u0636\u0627\u0641\u0647 \u06CC\u0627 \u06A9\u0627\u0628\u0644 HDMI Type-C \u0647\u0645\u0631\u0627\u0647\u0634 \u0628\u0627\u0634\u0647 \u0628\u0631\u0627\u06CC \u06F2 \u0633\u0627\u0639\u062A \u0627\u0645\u0627\u0646\u062A \u0628\u062F\u0647\u061F",
      timestamp: Date.now() - 1e3 * 60 * 35,
      reactions: { "\u{1F44D}": ["member-ali"] }
    },
    {
      id: "msg-3",
      channelId: "general",
      sender: {
        id: "member-ali",
        name: "\u0639\u0644\u06CC \u0627\u062D\u0645\u062F\u06CC",
        role: "\u062A\u0648\u0633\u0639\u0647\u200C\u062F\u0647\u0646\u062F\u0647 \u0641\u0648\u0644\u200C\u0627\u0633\u062A\u06A9",
        desk: "\u0645\u06CC\u0632 \u06F1\u06F4"
      },
      content: "\u0633\u0644\u0627\u0645 \u0645\u0631\u06CC\u0645 \u062C\u0627\u0646\u060C \u0645\u0646 \u06CC\u0647 \u06A9\u0627\u0628\u0644 HDMI \u0631\u0648\u06CC \u0645\u06CC\u0632 \u06F1\u06F4 \u062F\u0627\u0631\u0645\u060C \u0628\u06CC\u0627 \u0628\u0628\u0631 \u0645\u0634\u06A9\u0644\u06CC \u0646\u062F\u0627\u0631\u0647.",
      timestamp: Date.now() - 1e3 * 60 * 30,
      reactions: { "\u{1F64F}": ["member-maryam"] }
    },
    {
      id: "msg-4",
      channelId: "cafeteria",
      sender: {
        id: "member-reza",
        name: "\u0631\u0636\u0627 \u0646\u0648\u0631\u06CC",
        role: "\u0645\u062A\u062E\u0635\u0635 \u0633\u0626\u0648",
        desk: "\u0645\u06CC\u0632 \u06F8"
      },
      content: "\u062F\u0648\u0633\u062A\u0627\u0646 \u0628\u0631\u0627\u06CC \u0646\u0627\u0647\u0627\u0631 \u0627\u0645\u0631\u0648\u0632 \u0627\u0632 \u0631\u0633\u062A\u0648\u0631\u0627\u0646 \u0627\u0637\u0631\u0627\u0641 \u0633\u0641\u0627\u0631\u0634 \u062C\u0645\u0639\u06CC \u0645\u06CC\u200C\u0632\u0646\u06CC\u0645. \u062A\u0627 \u0633\u0627\u0639\u062A \u06F1\u06F2 \u0647\u0631 \u06A9\u0633\u06CC \u0645\u0627\u06CC\u0644 \u0647\u0633\u062A \u0628\u06AF\u0647 \u062A\u0627 \u0628\u0627 \u062A\u062E\u0641\u06CC\u0641 \u06AF\u0631\u0648\u0647\u06CC \u062B\u0628\u062A \u06A9\u0646\u06CC\u0645 \u{1F355}\u{1F957}",
      timestamp: Date.now() - 1e3 * 60 * 18,
      reactions: { "\u{1F64B}\u200D\u2642\uFE0F": ["member-ali", "member-maryam"] }
    }
  ],
  notices: [
    {
      id: "not-1",
      title: "\u0634\u0628\u06A9\u0647 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u06F5 \u06AF\u06CC\u06AF\u0627\u0647\u0631\u062A\u0632 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC",
      content: "\u0628\u0631\u0627\u06CC \u0633\u0631\u0639\u062A \u067E\u0627\u06CC\u062F\u0627\u0631\u062A\u0631 \u062F\u0631 \u062A\u0645\u0627\u0633\u200C\u0647\u0627\u06CC \u0648\u06CC\u062F\u06CC\u0648\u06CC\u06CC\u060C \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0645\u06CC\u200C\u0634\u0648\u062F \u0628\u0647 \u0628\u0627\u0646\u062F 5GHz \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0645\u062A\u0635\u0644 \u0634\u0648\u06CC\u062F.",
      author: "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0634\u0628\u06A9\u0647 \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9",
      timestamp: Date.now() - 1e3 * 60 * 60 * 24,
      priority: "normal"
    },
    {
      id: "not-2",
      title: "\u0631\u0639\u0627\u06CC\u062A \u0633\u06A9\u0648\u062A \u062F\u0631 \u0632\u0648\u0646 \u0645\u062A\u0645\u0631\u06A9\u0632 (Quiet Zone)",
      content: "\u0644\u0637\u0641\u0627\u064B \u0628\u0631\u0627\u06CC \u062A\u0645\u0627\u0633\u200C\u0647\u0627\u06CC \u062A\u0644\u0641\u0646\u06CC \u0648 \u062C\u0644\u0633\u0627\u062A \u0635\u0648\u062A\u06CC \u0627\u0632 \u0641\u0648\u0646\u200C\u0628\u0627\u06A9\u0633\u200C\u0647\u0627 \u06CC\u0627 \u0628\u0627\u0644\u06A9\u0646 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.",
      author: "\u0645\u062F\u06CC\u0631\u06CC\u062A \u0641\u0636\u0627",
      timestamp: Date.now() - 1e3 * 60 * 60 * 12,
      priority: "urgent"
    }
  ],
  cafeteria: {
    title: "\u0642\u0647\u0648\u0647 \u062A\u0627\u0632\u0647\u060C \u0686\u0627\u06CC \u062F\u0645\u06CC \u0648 \u06AF\u067E \u062F\u0648\u0633\u062A\u0627\u0646\u0647",
    subtitle: "\u06A9\u0627\u0641\u0647\u200C\u062A\u0631\u06CC\u0627 \u0648 \u0627\u0633\u062A\u0631\u0627\u062D\u062A",
    description: "\u0627\u0633\u067E\u0631\u0633\u0648\u0633\u0627\u0632 \u062D\u0631\u0641\u0647\u200C\u0627\u06CC \u062F\u0631 \u0622\u0634\u067E\u0632\u062E\u0627\u0646\u0647 \u0637\u0628\u0642\u0647 \u0647\u0645\u06A9\u0641 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0627\u0633\u062A. \u0628\u0631\u0627\u06CC \u062B\u0628\u062A \u0633\u0641\u0627\u0631\u0634 \u0646\u0627\u0647\u0627\u0631 \u062C\u0645\u0639\u06CC\u060C \u0647\u0631 \u0631\u0648\u0632 \u062A\u0627 \u0633\u0627\u0639\u062A \u06F1\u06F2 \u062F\u0631 \u06A9\u0627\u0646\u0627\u0644 #\u06A9\u0627\u0641\u0647-\u0648-\u0633\u0641\u0627\u0631\u0634-\u0646\u0627\u0647\u0627\u0631 \u067E\u06CC\u0627\u0645 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F \u062A\u0627 \u0627\u0632 \u062A\u062E\u0641\u06CC\u0641 \u0648\u06CC\u0698\u0647 \u0647\u0645\u06A9\u0627\u0631\u0627\u0646 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F.",
    imageUrl: "/src/assets/images/coworking_lounge_cafe_1794330975977.jpg",
    footerNote: "\u0686\u0627\u06CC \u0648 \u062F\u0645\u0646\u0648\u0634 \u0631\u0627\u06CC\u06AF\u0627\u0646 \u062F\u0631 \u062A\u0645\u0627\u0645 \u0637\u0648\u0644 \u0631\u0648\u0632 \u0645\u0647\u06CC\u0627\u0633\u062A."
  },
  staff: [
    {
      id: "staff-sara",
      name: "\u0633\u0627\u0631\u0627 \u0631\u0636\u0627\u06CC\u06CC",
      role: "\u0645\u062F\u06CC\u0631 \u06A9\u0627\u0645\u06CC\u0648\u0646\u06CC\u062A\u06CC \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631",
      desk: "\u0645\u06CC\u0632 \u067E\u0630\u06CC\u0631\u0634 - \u0648\u0631\u0648\u062F\u06CC \u0627\u0635\u0644\u06CC",
      quote: "\xAB\u0647\u0631 \u0632\u0645\u0627\u0646 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0631\u0632\u0631\u0648 \u0627\u062A\u0627\u0642 \u062C\u0644\u0633\u0627\u062A \u0627\u062E\u062A\u0635\u0627\u0635\u06CC\u060C \u06A9\u0627\u0631\u062A \u0648\u0631\u0648\u062F \u0631\u0648\u0632\u0627\u0646\u0647\u060C \u06CC\u0627 \u0633\u0648\u0627\u0644 \u062F\u0631 \u062E\u0635\u0648\u0635 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u0648 \u0627\u062A\u0635\u0627\u0644 \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9 \u062F\u0627\u0634\u062A\u06CC\u062F\u060C \u062F\u0631 \u062E\u062F\u0645\u062A\u062A\u0627\u0646 \u0647\u0633\u062A\u0645.\xBB",
      avatar: "/src/assets/images/community_manager_avatar_1794330976206.jpg",
      status: "\u062D\u0627\u0636\u0631 \u062F\u0631 \u0641\u0636\u0627"
    }
  ],
  hotspotUsers: [
    {
      id: "user-ali",
      name: "ali_ahmadi",
      profile: "coworker-10gb",
      bytesIn: 245e6,
      bytesOut: 185e7,
      limitBytesTotal: 10737418240,
      // 10 GB
      uptime: "14h 22m",
      comment: "\u0639\u0636\u0648 \u0645\u0627\u0647\u0627\u0646\u0647 - \u0645\u06CC\u0632 \u06F1\u06F4"
    },
    {
      id: "user-maryam",
      name: "maryam_karimi",
      profile: "coworker-15gb",
      bytesIn: 412e6,
      bytesOut: 322e7,
      limitBytesTotal: 16106127360,
      // 15 GB
      uptime: "22h 10m",
      comment: "\u0637\u0631\u0627\u062D \u0645\u062D\u0635\u0648\u0644 - \u0645\u06CC\u0632 \u06F2\u06F1"
    },
    {
      id: "user-reza",
      name: "reza_nouri",
      profile: "coworker-10gb",
      bytesIn: 12e7,
      bytesOut: 98e7,
      limitBytesTotal: 10737418240,
      // 10 GB
      uptime: "8h 45m",
      comment: "\u0633\u0626\u0648 \u0645\u0627\u0631\u06A9\u062A\u06CC\u0646\u06AF - \u0645\u06CC\u0632 \u06F8"
    },
    {
      id: "user-guest1",
      name: "DAY-7392",
      profile: "daily-pass-3gb",
      bytesIn: 45e6,
      bytesOut: 48e7,
      limitBytesTotal: 3221225472,
      // 3 GB
      uptime: "2h 15m",
      comment: "\u0648\u0648\u0686\u0631 \u0631\u0648\u0632\u0627\u0646\u0647 \u0645\u0647\u0645\u0627\u0646"
    }
  ],
  hotspotActive: [
    {
      id: "active-ali",
      user: "ali_ahmadi",
      address: "192.168.88.102",
      macAddress: "D4:61:9D:28:44:11",
      uptime: "02:45:12",
      bytesIn: 42e6,
      bytesOut: 48e7,
      timeLeft: "\u0646\u0627\u0645\u062D\u062F\u0648\u062F"
    },
    {
      id: "active-maryam",
      user: "maryam_karimi",
      address: "192.168.88.105",
      macAddress: "3C:22:FB:89:12:08",
      uptime: "01:12:30",
      bytesIn: 88e6,
      bytesOut: 92e7,
      timeLeft: "\u0646\u0627\u0645\u062D\u062F\u0648\u062F"
    }
  ]
};
function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (!parsed.appContent) parsed.appContent = DEFAULT_DB.appContent;
      if (!parsed.cafeMenu || !Array.isArray(parsed.cafeMenu)) parsed.cafeMenu = DEFAULT_CAFE_MENU;
      if (!parsed.cafeOrders || !Array.isArray(parsed.cafeOrders)) parsed.cafeOrders = [];
      if (!parsed.cafeteria) parsed.cafeteria = DEFAULT_DB.cafeteria;
      if (!parsed.staff || !Array.isArray(parsed.staff)) parsed.staff = DEFAULT_DB.staff;
      if (!parsed.hotspotUsers || !Array.isArray(parsed.hotspotUsers)) parsed.hotspotUsers = DEFAULT_DB.hotspotUsers;
      if (!parsed.hotspotActive || !Array.isArray(parsed.hotspotActive)) parsed.hotspotActive = DEFAULT_DB.hotspotActive;
      for (const u of parsed.hotspotUsers) {
        if (!u.maxSharedUsers) u.maxSharedUsers = 2;
        if (!u.password) u.password = "123456";
        u.activeDevicesCount = (parsed.hotspotActive || []).filter(
          (a) => a.user && a.user.toLowerCase() === u.name.toLowerCase()
        ).length;
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error reading DB file, using defaults:", err);
  }
  saveDb(DEFAULT_DB);
  return DEFAULT_DB;
}
function saveDb(data) {
  try {
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error("Error saving DB file:", err);
  }
}
const sseClients = /* @__PURE__ */ new Set();
function broadcast(event, payload) {
  const data = JSON.stringify(payload);
  for (const client of sseClients) {
    try {
      client.write(`event: ${event}
data: ${data}

`);
    } catch {
      sseClients.delete(client);
    }
  }
}
app.get("/api/chat/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });
  res.write(": connected\n\n");
  sseClients.add(res);
  req.on("close", () => {
    sseClients.delete(res);
  });
});
app.get("/api/status", (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "192.168.88.50";
  const db = readDb();
  res.json({
    ok: true,
    serverTime: Date.now(),
    clientIp: String(clientIp).replace("::ffff:", ""),
    activeClients: sseClients.size,
    onlineMembersCount: db.members.filter((m) => m.isOnline).length,
    routerIp: db.config.routerIp,
    hotspotName: db.config.hotspotName
  });
});
app.get("/api/hotspot/config", (req, res) => {
  const db = readDb();
  res.json(db.config);
});
app.post("/api/hotspot/config", (req, res) => {
  const db = readDb();
  db.config = { ...db.config, ...req.body };
  saveDb(db);
  broadcast("config_updated", db.config);
  res.json({ success: true, config: db.config });
});
app.get("/api/channels", (req, res) => {
  const db = readDb();
  res.json(db.channels);
});
app.get("/api/messages", (req, res) => {
  const channelId = req.query.channelId;
  const db = readDb();
  if (channelId) {
    res.json(db.messages.filter((m) => m.channelId === channelId));
  } else {
    res.json(db.messages);
  }
});
app.post("/api/messages", (req, res) => {
  const { channelId, sender, content, type } = req.body;
  if (!channelId || !content || !sender || !sender.name) {
    return res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u067E\u06CC\u0627\u0645 \u0646\u0627\u0642\u0635 \u0627\u0633\u062A" });
  }
  const db = readDb();
  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    channelId,
    sender: {
      id: sender.id || `guest-${Date.now()}`,
      name: sender.name,
      role: sender.role || "\u0639\u0636\u0648 \u0641\u0636\u0627",
      desk: sender.desk || "\u0645\u06CC\u0632 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC",
      avatar: sender.avatar
    },
    content: content.trim(),
    timestamp: Date.now(),
    reactions: {},
    type: type || "text"
  };
  db.messages.push(newMessage);
  const existingMember = db.members.find((m) => m.id === newMessage.sender.id);
  if (existingMember) {
    existingMember.lastSeen = Date.now();
    existingMember.isOnline = true;
  } else {
    db.members.push({
      id: newMessage.sender.id,
      name: newMessage.sender.name,
      role: newMessage.sender.role,
      desk: newMessage.sender.desk,
      status: "available",
      skills: [],
      lastSeen: Date.now(),
      isOnline: true,
      avatar: newMessage.sender.avatar
    });
  }
  saveDb(db);
  broadcast("new_message", newMessage);
  res.status(201).json(newMessage);
});
app.post("/api/messages/reaction", (req, res) => {
  const { messageId, emoji, memberId } = req.body;
  if (!messageId || !emoji || !memberId) {
    return res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0642\u0635 \u0627\u0633\u062A" });
  }
  const db = readDb();
  const msg = db.messages.find((m) => m.id === messageId);
  if (!msg) {
    return res.status(404).json({ error: "\u067E\u06CC\u0627\u0645 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  }
  if (!msg.reactions) {
    msg.reactions = {};
  }
  if (!msg.reactions[emoji]) {
    msg.reactions[emoji] = [];
  }
  const index = msg.reactions[emoji].indexOf(memberId);
  if (index > -1) {
    msg.reactions[emoji].splice(index, 1);
    if (msg.reactions[emoji].length === 0) {
      delete msg.reactions[emoji];
    }
  } else {
    msg.reactions[emoji].push(memberId);
  }
  saveDb(db);
  broadcast("reaction_updated", { messageId, reactions: msg.reactions });
  res.json({ success: true, reactions: msg.reactions });
});
app.get("/api/members", (req, res) => {
  const db = readDb();
  const threshold = Date.now() - 1e3 * 60 * 180;
  const list = db.members.map((m) => ({
    ...m,
    isOnline: m.lastSeen > threshold
  }));
  res.json(list);
});
app.post("/api/members/checkin", (req, res) => {
  const { id, name, role, desk, status, statusText, skills, avatar } = req.body;
  if (!name) {
    return res.status(400).json({ error: "\u0646\u0627\u0645 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
  }
  const db = readDb();
  const memberId = id || `member-${Date.now()}`;
  let member = db.members.find((m) => m.id === memberId);
  if (member) {
    member.name = name;
    if (role) member.role = role;
    if (desk) member.desk = desk;
    if (status) member.status = status;
    if (statusText !== void 0) member.statusText = statusText;
    if (skills) member.skills = skills;
    if (avatar) member.avatar = avatar;
    member.lastSeen = Date.now();
    member.isOnline = true;
  } else {
    member = {
      id: memberId,
      name,
      role: role || "\u0639\u0636\u0648 \u0641\u0636\u0627",
      desk: desk || "\u0633\u0627\u0644\u0646 \u0627\u0635\u0644\u06CC",
      status: status || "available",
      statusText: statusText || "\u0645\u0634\u063A\u0648\u0644 \u06A9\u0627\u0631",
      skills: skills || [],
      lastSeen: Date.now(),
      isOnline: true,
      avatar
    };
    db.members.push(member);
  }
  saveDb(db);
  broadcast("member_updated", member);
  res.json(member);
});
app.get("/api/amenities", (req, res) => {
  const db = readDb();
  res.json(db.amenities);
});
app.post("/api/amenities/update", (req, res) => {
  const { id, status, statusText, updatedBy } = req.body;
  const db = readDb();
  const amenity = db.amenities.find((a) => a.id === id);
  if (!amenity) {
    return res.status(404).json({ error: "\u0645\u0648\u0631\u062F \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  }
  if (status) amenity.status = status;
  if (statusText) amenity.statusText = statusText;
  if (updatedBy) amenity.updatedBy = updatedBy;
  amenity.updatedAt = Date.now();
  saveDb(db);
  broadcast("amenity_updated", amenity);
  res.json(amenity);
});
app.get("/api/notices", (req, res) => {
  const db = readDb();
  res.json(db.notices);
});
app.post("/api/notices", (req, res) => {
  const { title, content, author, priority } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "\u0639\u0646\u0648\u0627\u0646 \u0648 \u0645\u062A\u0646 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
  }
  const db = readDb();
  const newNotice = {
    id: `not-${Date.now()}`,
    title,
    content,
    author: author || "\u0645\u062F\u06CC\u0631\u06CC\u062A \u0641\u0636\u0627",
    timestamp: Date.now(),
    priority: priority || "normal"
  };
  db.notices.unshift(newNotice);
  saveDb(db);
  broadcast("new_notice", newNotice);
  res.status(201).json(newNotice);
});
app.post("/api/hotspot/login", (req, res) => {
  const { username, password, type } = req.body;
  if (type === "trial") {
    return res.json({
      success: true,
      message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0641\u0639\u0627\u0644 \u0634\u062F.",
      session: {
        username: "\u0645\u0647\u0645\u0627\u0646 \u0645\u0648\u0642\u062A (Trial)",
        uptime: "00:00:01",
        timeLeft: "01:00:00",
        bytesIn: "24 KB",
        bytesOut: "12 KB",
        ip: req.socket.remoteAddress || "192.168.88.102"
      }
    });
  }
  if (!username) {
    return res.status(400).json({ error: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627 \u06A9\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u0648\u0627\u0631\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" });
  }
  return res.json({
    success: true,
    message: "\u0627\u062A\u0635\u0627\u0644 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0642\u0631\u0627\u0631 \u0634\u062F.",
    session: {
      username,
      uptime: "00:00:05",
      timeLeft: "\u0646\u0627\u0645\u062D\u062F\u0648\u062F (\u0639\u0636\u0648 \u0641\u0639\u0627\u0644)",
      bytesIn: "1.2 MB",
      bytesOut: "420 KB",
      ip: req.socket.remoteAddress || "192.168.88.102"
    }
  });
});
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const db = readDb();
  const currentPass = db.config.adminPassword || "admin123";
  if (password === currentPass) {
    return res.json({ success: true, token: "admin-authorized-session" });
  }
  return res.status(401).json({ success: false, error: "\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u062F\u0645\u06CC\u0646 \u0646\u0627\u062F\u0631\u0633\u062A \u0627\u0633\u062A" });
});
app.post("/api/admin/amenities", (req, res) => {
  const { name, icon, status, statusText } = req.body;
  if (!name) return res.status(400).json({ error: "\u0646\u0627\u0645 \u0627\u0645\u06A9\u0627\u0646\u0627\u062A \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
  const db = readDb();
  const newAmenity = {
    id: `amenity-${Date.now()}`,
    name,
    icon: icon || "Coffee",
    status: status || "ready",
    statusText: statusText || "\u0622\u0645\u0627\u062F\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647",
    updatedBy: "\u0645\u062F\u06CC\u0631 \u0641\u0636\u0627",
    updatedAt: Date.now()
  };
  db.amenities.push(newAmenity);
  saveDb(db);
  broadcast("amenity_updated", newAmenity);
  res.status(201).json(newAmenity);
});
app.put("/api/admin/amenities/:id", (req, res) => {
  const { id } = req.params;
  const { name, icon, status, statusText } = req.body;
  const db = readDb();
  const amenity = db.amenities.find((a) => a.id === id);
  if (!amenity) return res.status(404).json({ error: "\u0645\u0648\u0631\u062F \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  if (name) amenity.name = name;
  if (icon) amenity.icon = icon;
  if (status) amenity.status = status;
  if (statusText !== void 0) amenity.statusText = statusText;
  amenity.updatedAt = Date.now();
  saveDb(db);
  broadcast("amenity_updated", amenity);
  res.json(amenity);
});
app.delete("/api/admin/amenities/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.amenities = db.amenities.filter((a) => a.id !== id);
  saveDb(db);
  broadcast("amenity_deleted", { id });
  res.json({ success: true });
});
app.post("/api/admin/channels", (req, res) => {
  const { name, description, icon } = req.body;
  if (!name) return res.status(400).json({ error: "\u0646\u0627\u0645 \u06A9\u0627\u0646\u0627\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
  const db = readDb();
  const newChannel = {
    id: `ch-${Date.now()}`,
    name,
    description: description || "",
    icon: icon || "Hash"
  };
  db.channels.push(newChannel);
  saveDb(db);
  broadcast("channel_created", newChannel);
  res.status(201).json(newChannel);
});
app.put("/api/admin/channels/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, icon } = req.body;
  const db = readDb();
  const channel = db.channels.find((c) => c.id === id);
  if (!channel) return res.status(404).json({ error: "\u06A9\u0627\u0646\u0627\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  if (name) channel.name = name;
  if (description !== void 0) channel.description = description;
  if (icon) channel.icon = icon;
  saveDb(db);
  broadcast("channel_updated", channel);
  res.json(channel);
});
app.delete("/api/admin/channels/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  if (db.channels.length <= 1) {
    return res.status(400).json({ error: "\u062D\u062F\u0627\u0642\u0644 \u06CC\u06A9 \u06A9\u0627\u0646\u0627\u0644 \u0628\u0627\u06CC\u062F \u062F\u0631 \u0633\u0627\u0645\u0627\u0646\u0647 \u0628\u0627\u0642\u06CC \u0628\u0645\u0627\u0646\u062F" });
  }
  db.channels = db.channels.filter((c) => c.id !== id);
  saveDb(db);
  broadcast("channel_deleted", { id });
  res.json({ success: true });
});
app.delete("/api/admin/notices/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.notices = db.notices.filter((n) => n.id !== id);
  saveDb(db);
  broadcast("notice_deleted", { id });
  res.json({ success: true });
});
app.post("/api/admin/settings", (req, res) => {
  const { adminPassword, ...otherConfig } = req.body;
  const db = readDb();
  if (adminPassword) {
    db.config.adminPassword = adminPassword;
  }
  db.config = { ...db.config, ...otherConfig };
  saveDb(db);
  broadcast("config_updated", db.config);
  res.json({ success: true, config: db.config });
});
app.get("/api/cafeteria", (req, res) => {
  const db = readDb();
  res.json(db.cafeteria);
});
app.post("/api/admin/cafeteria", (req, res) => {
  const db = readDb();
  const { title, subtitle, description, imageUrl, footerNote } = req.body;
  db.cafeteria = {
    title: title ?? db.cafeteria.title,
    subtitle: subtitle ?? db.cafeteria.subtitle,
    description: description ?? db.cafeteria.description,
    imageUrl: imageUrl ?? db.cafeteria.imageUrl,
    footerNote: footerNote ?? db.cafeteria.footerNote
  };
  saveDb(db);
  broadcast("cafeteria_updated", db.cafeteria);
  res.json({ success: true, cafeteria: db.cafeteria });
});
app.get("/api/staff", (req, res) => {
  const db = readDb();
  res.json(db.staff);
});
app.post("/api/admin/staff", (req, res) => {
  const { name, role, desk, quote, avatar, status } = req.body;
  if (!name) return res.status(400).json({ error: "\u0646\u0627\u0645 \u067E\u0631\u0633\u0646\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
  const db = readDb();
  const newStaff = {
    id: `staff-${Date.now()}`,
    name,
    role: role || "\u0645\u062F\u06CC\u0631 \u06A9\u0627\u0645\u06CC\u0648\u0646\u06CC\u062A\u06CC",
    desk: desk || "\u0645\u06CC\u0632 \u067E\u0630\u06CC\u0631\u0634",
    quote: quote || "",
    avatar: avatar || "/src/assets/images/community_manager_avatar_1794330976206.jpg",
    status: status || "\u062D\u0627\u0636\u0631 \u062F\u0631 \u0641\u0636\u0627"
  };
  db.staff.push(newStaff);
  saveDb(db);
  broadcast("staff_updated", db.staff);
  res.status(201).json(newStaff);
});
app.put("/api/admin/staff/:id", (req, res) => {
  const { id } = req.params;
  const { name, role, desk, quote, avatar, status } = req.body;
  const db = readDb();
  const staff = db.staff.find((s) => s.id === id);
  if (!staff) return res.status(404).json({ error: "\u0639\u0636\u0648 \u06A9\u0627\u062F\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  if (name) staff.name = name;
  if (role) staff.role = role;
  if (desk) staff.desk = desk;
  if (quote !== void 0) staff.quote = quote;
  if (avatar) staff.avatar = avatar;
  if (status) staff.status = status;
  saveDb(db);
  broadcast("staff_updated", db.staff);
  res.json(staff);
});
app.delete("/api/admin/staff/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.staff = db.staff.filter((s) => s.id !== id);
  saveDb(db);
  broadcast("staff_updated", db.staff);
  res.json({ success: true });
});
async function callMikrotikRest(config, pathStr, method = "GET", body) {
  if (!config.apiUsername) {
    throw new Error("\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC API \u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A");
  }
  const protocol = config.apiUseSsl ? "https" : "http";
  const port = config.apiPort || (config.apiUseSsl ? 443 : 80);
  const url = `${protocol}://${config.routerIp}:${port}/rest${pathStr}`;
  const auth = Buffer.from(`${config.apiUsername}:${config.apiPassword || ""}`).toString("base64");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : void 0,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`RouterOS response ${response.status}: ${txt}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
app.get("/api/mikrotik/test-connection", async (req, res) => {
  const db = readDb();
  try {
    const systemRes = await callMikrotikRest(db.config, "/system/resource");
    res.json({
      connected: true,
      message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 API \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0642\u0631\u0627\u0631 \u0627\u0633\u062A",
      data: systemRes
    });
  } catch (err) {
    res.json({
      connected: false,
      message: `\u0639\u062F\u0645 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0631\u0648\u062A\u0631 (${err.message}). \u062F\u0631 \u062D\u0627\u0644 \u06A9\u0627\u0631 \u0628\u0627 \u062D\u0627\u0641\u0638\u0647 \u0645\u062D\u0644\u06CC \u0633\u0631\u0648\u0631.`
    });
  }
});
app.get("/api/mikrotik/users", async (req, res) => {
  const db = readDb();
  try {
    const routerUsers = await callMikrotikRest(db.config, "/ip/hotspot/user");
    if (Array.isArray(routerUsers)) {
      const mapped = routerUsers.map((u) => ({
        id: u[".id"] || u.name,
        name: u.name,
        profile: u.profile || "default",
        bytesIn: Number(u["bytes-in"] || 0),
        bytesOut: Number(u["bytes-out"] || 0),
        limitBytesTotal: Number(u["limit-bytes-total"] || 0),
        uptime: u.uptime || "0s",
        comment: u.comment || "",
        disabled: u.disabled === "true" || u.disabled === true
      }));
      db.hotspotUsers = mapped;
      saveDb(db);
      return res.json({ connectedToRouter: true, users: mapped });
    }
  } catch {
  }
  return res.json({
    connectedToRouter: false,
    message: "\u0641\u0631\u0627\u062E\u0648\u0627\u0646\u06CC \u0627\u0632 \u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u062F\u0647 \u0644\u0648\u06A9\u0627\u0644 \u0633\u0631\u0648\u0631",
    users: db.hotspotUsers
  });
});
app.post("/api/mikrotik/users", async (req, res) => {
  const { name, password, profile, limitBytesTotal, comment } = req.body;
  if (!name) return res.status(400).json({ error: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
  const db = readDb();
  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    password: password || "",
    profile: profile || "default",
    bytesIn: 0,
    bytesOut: 0,
    limitBytesTotal: Number(limitBytesTotal) || 0,
    uptime: "0s",
    comment: comment || "\u0639\u0636\u0648 \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC"
  };
  let createdOnRouter = false;
  try {
    const routerBody = {
      name: newUser.name,
      password: newUser.password,
      profile: newUser.profile,
      comment: newUser.comment
    };
    if (newUser.limitBytesTotal > 0) {
      routerBody["limit-bytes-total"] = newUser.limitBytesTotal;
    }
    const result = await callMikrotikRest(db.config, "/ip/hotspot/user", "PUT", routerBody);
    if (result && result[".id"]) {
      newUser.id = result[".id"];
      createdOnRouter = true;
    }
  } catch {
  }
  db.hotspotUsers.push(newUser);
  saveDb(db);
  broadcast("hotspot_users_updated", db.hotspotUsers);
  res.status(201).json({ success: true, createdOnRouter, user: newUser });
});
app.post("/api/mikrotik/users/:id/adjust-quota", async (req, res) => {
  const { id } = req.params;
  const { deltaBytes, setExactLimit } = req.body;
  const db = readDb();
  const user = db.hotspotUsers.find((u) => u.id === id || u.name === id);
  if (!user) return res.status(404).json({ error: "\u06A9\u0627\u0631\u0628\u0631 \u0647\u0627\u062A\u200C\u0627\u0633\u067E\u0627\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  if (setExactLimit !== void 0) {
    user.limitBytesTotal = Number(setExactLimit);
  } else if (deltaBytes !== void 0) {
    user.limitBytesTotal = Math.max(0, user.limitBytesTotal + Number(deltaBytes));
  }
  let updatedOnRouter = false;
  try {
    const patchBody = {
      "limit-bytes-total": user.limitBytesTotal
    };
    await callMikrotikRest(db.config, `/ip/hotspot/user/${encodeURIComponent(user.id)}`, "PATCH", patchBody);
    updatedOnRouter = true;
  } catch {
  }
  saveDb(db);
  broadcast("hotspot_users_updated", db.hotspotUsers);
  res.json({ success: true, updatedOnRouter, user });
});
app.delete("/api/mikrotik/users/:id", async (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const user = db.hotspotUsers.find((u) => u.id === id || u.name === id);
  try {
    await callMikrotikRest(db.config, `/ip/hotspot/user/${encodeURIComponent(id)}`, "DELETE");
  } catch {
  }
  db.hotspotUsers = db.hotspotUsers.filter((u) => u.id !== id && u.name !== id);
  saveDb(db);
  broadcast("hotspot_users_updated", db.hotspotUsers);
  res.json({ success: true });
});
app.put("/api/mikrotik/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, password, profile, limitBytesTotal, maxSharedUsers, disabled, comment, rateLimit } = req.body;
  const db = readDb();
  const user = db.hotspotUsers.find((u) => u.id === id || u.name === id);
  if (!user) return res.status(404).json({ error: "\u06A9\u0627\u0631\u0628\u0631 \u0647\u0627\u062A\u200C\u0627\u0633\u067E\u0627\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  if (name) user.name = name.trim();
  if (password !== void 0) user.password = password;
  if (profile) user.profile = profile;
  if (limitBytesTotal !== void 0) user.limitBytesTotal = Number(limitBytesTotal);
  if (maxSharedUsers !== void 0) user.maxSharedUsers = Math.max(1, Number(maxSharedUsers));
  if (disabled !== void 0) user.disabled = Boolean(disabled);
  if (comment !== void 0) user.comment = comment;
  if (rateLimit !== void 0) user.rateLimit = rateLimit;
  let updatedOnRouter = false;
  try {
    const patchBody = {
      name: user.name,
      profile: user.profile,
      comment: user.comment,
      disabled: user.disabled ? "true" : "false"
    };
    if (user.password) patchBody.password = user.password;
    if (user.limitBytesTotal > 0) patchBody["limit-bytes-total"] = user.limitBytesTotal;
    await callMikrotikRest(db.config, `/ip/hotspot/user/${encodeURIComponent(user.id)}`, "PATCH", patchBody);
    updatedOnRouter = true;
  } catch {
  }
  saveDb(db);
  broadcast("hotspot_users_updated", db.hotspotUsers);
  res.json({ success: true, updatedOnRouter, user });
});
app.post("/api/mikrotik/users/:id/reset-traffic", async (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const user = db.hotspotUsers.find((u) => u.id === id || u.name === id);
  if (!user) return res.status(404).json({ error: "\u06A9\u0627\u0631\u0628\u0631 \u0647\u0627\u062A\u200C\u0627\u0633\u067E\u0627\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  user.bytesIn = 0;
  user.bytesOut = 0;
  user.uptime = "0s";
  try {
    await callMikrotikRest(db.config, `/ip/hotspot/user/reset-counters`, "POST", {
      numbers: user.name
    });
  } catch {
  }
  saveDb(db);
  broadcast("hotspot_users_updated", db.hotspotUsers);
  res.json({ success: true, message: "\u0634\u0645\u0627\u0631\u0646\u062F\u0647 \u062A\u0631\u0627\u0641\u06CC\u06A9 \u0645\u0635\u0631\u0641\u06CC \u06A9\u0627\u0631\u0628\u0631 \u0635\u0641\u0631 \u0634\u062F", user });
});
app.get("/api/user/account", (req, res) => {
  const username = String(req.query.username || "").trim();
  if (!username) return res.status(400).json({ error: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0645\u0634\u062E\u0635 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" });
  const db = readDb();
  const user = db.hotspotUsers.find(
    (u) => u.name.toLowerCase() === username.toLowerCase() || u.id === username
  );
  const activeSessions = db.hotspotActive.filter(
    (a) => a.user && a.user.toLowerCase() === username.toLowerCase()
  );
  const totalBytesIn = (user ? user.bytesIn : 0) + activeSessions.reduce((acc, s) => acc + s.bytesIn, 0);
  const totalBytesOut = (user ? user.bytesOut : 0) + activeSessions.reduce((acc, s) => acc + s.bytesOut, 0);
  const totalBytesUsed = totalBytesIn + totalBytesOut;
  const limitBytes = user ? user.limitBytesTotal : 0;
  const remainingBytes = limitBytes > 0 ? Math.max(0, limitBytes - totalBytesUsed) : null;
  const maxDevices = user?.maxSharedUsers || 2;
  res.json({
    username,
    profile: user?.profile || "standard-user",
    isConnected: activeSessions.length > 0,
    bytesIn: totalBytesIn,
    bytesOut: totalBytesOut,
    totalBytesUsed,
    limitBytesTotal: limitBytes,
    remainingBytes,
    activeDevicesCount: activeSessions.length,
    maxSharedUsers: maxDevices,
    activeDevices: activeSessions.map((s) => ({
      id: s.id,
      address: s.address,
      macAddress: s.macAddress,
      uptime: s.uptime
    })),
    uptime: activeSessions[0]?.uptime || user?.uptime || "0s",
    comment: user?.comment || "\u0639\u0636\u0648 \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631"
  });
});
app.post("/api/user/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ error: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0648 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062C\u062F\u06CC\u062F \u0627\u0644\u0632\u0627\u0645\u06CC \u0647\u0633\u062A\u0646\u062F" });
  }
  if (String(newPassword).length < 4) {
    return res.status(400).json({ error: "\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062C\u062F\u06CC\u062F \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 \u06F4 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0628\u0627\u0634\u062F" });
  }
  const db = readDb();
  let user = db.hotspotUsers.find(
    (u) => u.name.toLowerCase() === username.trim().toLowerCase()
  );
  if (!user) {
    const newUser = {
      id: `user-${Date.now()}`,
      name: username.trim(),
      password: newPassword,
      profile: "coworker-standard",
      bytesIn: 0,
      bytesOut: 0,
      limitBytesTotal: 10737418240,
      // 10 GB
      uptime: "0s",
      comment: "\u0639\u0636\u0648 \u062E\u0648\u062F\u062B\u0628\u062A\u200C\u0646\u0627\u0645\u06CC",
      maxSharedUsers: 2
    };
    db.hotspotUsers.push(newUser);
    user = newUser;
  } else {
    if (user.password && oldPassword && user.password !== oldPassword) {
      return res.status(403).json({ error: "\u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631 \u0642\u0628\u0644\u06CC \u0646\u0627\u062F\u0631\u0633\u062A \u0627\u0633\u062A" });
    }
    user.password = newPassword;
  }
  let updatedOnRouter = false;
  try {
    await callMikrotikRest(db.config, `/ip/hotspot/user/${encodeURIComponent(user.id)}`, "PATCH", {
      password: newPassword
    });
    updatedOnRouter = true;
  } catch {
  }
  saveDb(db);
  broadcast("hotspot_users_updated", db.hotspotUsers);
  res.json({
    success: true,
    message: "\u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631 \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F \u0648 \u062F\u0631 \u0631\u0648\u062A\u0631 \u062B\u0628\u062A \u0634\u062F.",
    updatedOnRouter
  });
});
app.get("/api/cafe/menu", (req, res) => {
  const db = readDb();
  res.json(db.cafeMenu || DEFAULT_CAFE_MENU);
});
app.post("/api/admin/cafe/menu", (req, res) => {
  const { name, category, price, description, icon, prepMinutes, isAvailable } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: "\u0646\u0627\u0645 \u0648 \u0642\u06CC\u0645\u062A \u0622\u06CC\u062A\u0645 \u0645\u0646\u0648 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
  }
  const db = readDb();
  const newItem = {
    id: `item-${Date.now()}`,
    name: name.trim(),
    category: category || "coffee",
    price: Number(price),
    description: description || "",
    icon: icon || "Coffee",
    prepMinutes: Number(prepMinutes) || 5,
    isAvailable: isAvailable !== void 0 ? Boolean(isAvailable) : true
  };
  db.cafeMenu.push(newItem);
  saveDb(db);
  broadcast("cafe_menu_updated", db.cafeMenu);
  res.status(201).json(newItem);
});
app.put("/api/admin/cafe/menu/:id", (req, res) => {
  const { id } = req.params;
  const { name, category, price, description, icon, prepMinutes, isAvailable } = req.body;
  const db = readDb();
  const item = db.cafeMenu.find((m) => m.id === id);
  if (!item) return res.status(404).json({ error: "\u0622\u06CC\u062A\u0645 \u0645\u0646\u0648 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  if (name) item.name = name.trim();
  if (category) item.category = category;
  if (price !== void 0) item.price = Number(price);
  if (description !== void 0) item.description = description;
  if (icon) item.icon = icon;
  if (prepMinutes !== void 0) item.prepMinutes = Number(prepMinutes);
  if (isAvailable !== void 0) item.isAvailable = Boolean(isAvailable);
  saveDb(db);
  broadcast("cafe_menu_updated", db.cafeMenu);
  res.json(item);
});
app.delete("/api/admin/cafe/menu/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.cafeMenu = db.cafeMenu.filter((m) => m.id !== id);
  saveDb(db);
  broadcast("cafe_menu_updated", db.cafeMenu);
  res.json({ success: true });
});
app.get("/api/cafe/orders", (req, res) => {
  const db = readDb();
  const customerName = req.query.customer ? String(req.query.customer).trim().toLowerCase() : null;
  let orders = [...db.cafeOrders || []];
  if (customerName) {
    orders = orders.filter((o) => o.customerName && o.customerName.toLowerCase() === customerName);
  }
  orders.sort((a, b) => b.createdAt - a.createdAt);
  res.json(orders);
});
app.post("/api/cafe/orders", (req, res) => {
  const { customerName, desk, items, note } = req.body;
  if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0633\u0641\u0627\u0631\u0634 \u0648 \u0627\u0642\u0644\u0627\u0645 \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647 \u0646\u0627\u0642\u0635 \u0627\u0633\u062A" });
  }
  const db = readDb();
  const nextNumber = db.cafeOrders && db.cafeOrders.length > 0 ? Math.max(...db.cafeOrders.map((o) => o.orderNumber || 100)) + 1 : 101;
  const totalAmount = items.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );
  const newOrder = {
    id: `order-${Date.now()}`,
    orderNumber: nextNumber,
    customerName: customerName.trim(),
    desk: desk ? desk.trim() : "\u0645\u06CC\u0632 \u0622\u0632\u0627\u062F / \u0633\u0627\u0644\u0646 \u0627\u0635\u0644\u06CC",
    items: items.map((it) => ({
      menuItemId: it.menuItemId || it.id,
      name: it.name,
      price: Number(it.price),
      quantity: Number(it.quantity) || 1
    })),
    totalAmount,
    note: note ? note.trim() : "",
    status: "pending",
    createdAt: Date.now()
  };
  db.cafeOrders.push(newOrder);
  saveDb(db);
  broadcast("cafe_order_created", newOrder);
  res.status(201).json({ success: true, order: newOrder });
});
app.patch("/api/admin/cafe/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDb();
  const order = db.cafeOrders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "\u0633\u0641\u0627\u0631\u0634 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  const validStatuses = ["pending", "preparing", "ready", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "\u0648\u0636\u0639\u06CC\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
  order.status = status;
  saveDb(db);
  broadcast("cafe_order_updated", order);
  res.json({ success: true, order });
});
app.get("/api/admin/app-content", (req, res) => {
  const db = readDb();
  res.json(db.appContent || DEFAULT_APP_CONTENT);
});
app.post("/api/admin/app-content", (req, res) => {
  const db = readDb();
  db.appContent = { ...db.appContent || DEFAULT_APP_CONTENT, ...req.body };
  saveDb(db);
  broadcast("app_content_updated", db.appContent);
  res.json({ success: true, appContent: db.appContent });
});
app.post("/api/admin/clear-mock-data", (req, res) => {
  const { clearType } = req.body;
  const db = readDb();
  if (clearType === "messages" || clearType === "all") {
    db.messages = [];
  }
  if (clearType === "members" || clearType === "all") {
    db.members = [];
  }
  if (clearType === "notices" || clearType === "all") {
    db.notices = [];
  }
  if (clearType === "orders" || clearType === "all") {
    db.cafeOrders = [];
  }
  saveDb(db);
  broadcast("db_cleared", { clearType });
  res.json({ success: true, message: "\u0645\u062D\u062A\u0648\u0627\u0647\u0627\u06CC \u0646\u0645\u0648\u0646\u0647 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u067E\u0627\u06A9 \u0634\u062F\u0646\u062F" });
});
app.get("/api/mikrotik/active", async (req, res) => {
  const db = readDb();
  try {
    const routerActive = await callMikrotikRest(db.config, "/ip/hotspot/active");
    if (Array.isArray(routerActive)) {
      const mapped = routerActive.map((a) => ({
        id: a[".id"] || a.user,
        user: a.user,
        address: a.address,
        macAddress: a["mac-address"],
        uptime: a.uptime,
        bytesIn: Number(a["bytes-in"] || 0),
        bytesOut: Number(a["bytes-out"] || 0),
        timeLeft: a["session-time-left"] || a["time-left"] || "\u0646\u0627\u0645\u062D\u062F\u0648\u062F"
      }));
      db.hotspotActive = mapped;
      saveDb(db);
      return res.json({ connectedToRouter: true, activeUsers: mapped });
    }
  } catch {
  }
  return res.json({
    connectedToRouter: false,
    message: "\u0641\u0631\u0627\u062E\u0648\u0627\u0646\u06CC \u0648\u0636\u0639\u06CC\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0622\u0646\u0644\u0627\u06CC\u0646 \u0627\u0632 \u062D\u0627\u0641\u0638\u0647 \u0633\u0631\u0648\u0631",
    activeUsers: db.hotspotActive
  });
});
app.delete("/api/mikrotik/active/:id", async (req, res) => {
  const { id } = req.params;
  const db = readDb();
  try {
    await callMikrotikRest(db.config, `/ip/hotspot/active/${encodeURIComponent(id)}`, "DELETE");
  } catch {
  }
  db.hotspotActive = db.hotspotActive.filter((a) => a.id !== id && a.user !== id);
  saveDb(db);
  broadcast("hotspot_active_updated", db.hotspotActive);
  res.json({ success: true, message: "\u06A9\u0627\u0631\u0628\u0631 \u0627\u0632 \u0647\u0627\u062A\u200C\u0627\u0633\u067E\u0627\u062A \u062F\u06CC\u0633\u06A9\u0627\u0646\u06A9\u062A \u0634\u062F" });
});
app.get("/api/download/ubuntu-package", async (req, res) => {
  try {
    let addDirToZip = function(dirPath, zipFolder) {
      if (!fs.existsSync(dirPath)) return;
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (item === "node_modules" || item === ".git") continue;
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          addDirToZip(fullPath, zipFolder.folder(item));
        } else {
          zipFolder.file(item, fs.readFileSync(fullPath));
        }
      }
    };
    const zip = new JSZip();
    const db = readDb();
    const installScript = `#!/bin/bash
# HamkarHub Auto-Installer for Ubuntu 20.04 / 22.04 / 24.04
set -e
echo "=========================================================="
echo "  \u0646\u0635\u0628 \u062E\u0648\u062F\u06A9\u0627\u0631 \u0633\u0627\u0645\u0627\u0646\u0647 \u0647\u0645\u06A9\u0627\u0631 \u0647\u0627\u0628 \u0631\u0648\u06CC \u0633\u0631\u0648\u0631 \u0627\u0648\u0628\u0648\u0646\u062A\u0648"
echo "=========================================================="

sudo apt-get update
sudo apt-get install -y curl ufw

if ! command -v node &> /dev/null; then
    echo "\u062F\u0631 \u062D\u0627\u0644 \u0646\u0635\u0628 Node.js 20..."
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

echo "\u0646\u0633\u062E\u0647 Node: $(node -v)"
echo "\u062F\u0631 \u062D\u0627\u0644 \u0646\u0635\u0628 \u067E\u06A9\u06CC\u062C\u200C\u0647\u0627..."
npm install --legacy-peer-deps

if ! grep -q -E "sse4_2|avx" /proc/cpuinfo 2>/dev/null; then
    echo "\u26A1 \u067E\u0631\u062F\u0627\u0632\u0646\u062F\u0647 \u0633\u0631\u0648\u0631 \u0634\u0646\u0627\u0633\u0627\u06CC\u06CC \u0634\u062F: \u0641\u0627\u0642\u062F AVX/SSE4.2 (\u0645\u0627\u0646\u0646\u062F AMD Phenom)\u061B \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u0633\u062A\u0642\u06CC\u0645 \u0627\u0632 \u0628\u06CC\u0644\u062F \u0622\u0645\u0627\u062F\u0647 \u0628\u062F\u0648\u0646 \u06A9\u0627\u0645\u067E\u0627\u06CC\u0644 \u0645\u062D\u0644\u06CC..."
else
    echo "\u062F\u0631 \u062D\u0627\u0644 \u06A9\u0627\u0645\u067E\u0627\u06CC\u0644 \u0648 \u0628\u06CC\u0644\u062F \u0641\u0631\u0627\u0646\u062A\u200C\u0627\u0646\u062F..."
    npm run build || true
fi

sudo ufw allow 3000/tcp || true

APP_DIR=$(pwd)
NODE_PATH=$(which node)

RUN_USER="\${SUDO_USER:-$(whoami)}"
sudo chown -R "$RUN_USER:$RUN_USER" "$APP_DIR" || true

if [ -f "$APP_DIR/server.js" ]; then
    START_EXEC="$NODE_PATH $APP_DIR/server.js"
else
    START_EXEC="$NODE_PATH $APP_DIR/node_modules/tsx/dist/cli.mjs server.ts"
fi

sudo bash -c "cat <<EOF > /etc/systemd/system/hamkarhub.service
[Unit]
Description=HamkarHub Coworking Local Chat and MikroTik Hotspot
After=network.target

[Service]
Type=simple
User=$RUN_USER
WorkingDirectory=$APP_DIR
ExecStart=$START_EXEC
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
echo "=========================================================="
echo "\u2705 \u0646\u0635\u0628 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F!"
echo "\u{1F310} \u0622\u062F\u0631\u0633 \u062F\u0633\u062A\u0631\u0633\u06CC \u062F\u0631 \u0634\u0628\u06A9\u0647 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC: http://$SERVER_IP:3000"
echo "=========================================================="
`;
    const serviceUnit = `[Unit]
Description=HamkarHub Coworking Local Chat
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/hamkarhub
ExecStart=/usr/bin/node /opt/hamkarhub/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
`;
    const readme = `# \u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0647\u0645\u06A9\u0627\u0631 \u0647\u0627\u0628 \u0631\u0648\u06CC \u0633\u0631\u0648\u0631 \u0627\u0648\u0628\u0648\u0646\u062A\u0648 (Ubuntu Server)

\u0627\u06CC\u0646 \u067E\u06A9\u06CC\u062C \u0634\u0627\u0645\u0644 \u062A\u0645\u0627\u0645 \u06A9\u062F\u0647\u0627\u06CC \u0641\u0631\u0627\u0646\u062A\u200C\u0627\u0646\u062F \u0648 \u0628\u06A9\u200C\u0627\u0646\u062F \u0633\u0627\u0645\u0627\u0646\u0647 \u0647\u0645\u06A9\u0627\u0631 \u0647\u0627\u0628 \u0628\u0631\u0627\u06CC \u0627\u062C\u0631\u0627\u06CC \u0645\u062D\u0644\u06CC \u0631\u0648\u06CC \u0633\u0631\u0648\u0631 \u0634\u0628\u06A9\u0647 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u0627\u0633\u062A.
\u0633\u0627\u0645\u0627\u0646\u0647 \u0634\u0627\u0645\u0644 \u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u0628\u06CC\u0644\u062F \u0622\u0645\u0627\u062F\u0647 \u0627\u0633\u062A \u0648 \u0628\u062F\u0648\u0646 \u0645\u0634\u06A9\u0644 \u0631\u0648\u06CC \u0647\u0645\u0647 \u067E\u0631\u062F\u0627\u0632\u0646\u062F\u0647\u200C\u0647\u0627 \u062D\u062A\u06CC \u0633\u06CC\u0633\u062A\u0645\u200C\u0647\u0627\u06CC \u0642\u062F\u06CC\u0645\u06CC \u0628\u0627 \u067E\u0631\u062F\u0627\u0632\u0646\u062F\u0647 AMD Phenom \u06CC\u0627 Core 2 \u0627\u062C\u0631\u0627 \u0645\u06CC\u200C\u0634\u0648\u062F.

## \u0646\u062D\u0648\u0647 \u0646\u0635\u0628 \u0633\u0631\u06CC\u0639 \u0628\u0627 \u06CC\u06A9 \u062F\u0633\u062A\u0648\u0631 \u062F\u0631 \u062A\u0631\u0645\u06CC\u0646\u0627\u0644 \u0627\u0648\u0628\u0648\u0646\u062A\u0648:
\`\`\`bash
chmod +x install-ubuntu.sh
./install-ubuntu.sh
\`\`\`

\u0633\u0627\u0645\u0627\u0646\u0647 \u0631\u0648\u06CC \u067E\u0648\u0631\u062A 3000 \u0648 \u0622\u062F\u0631\u0633 \u0622\u06CC\u200C\u067E\u06CC \u0645\u062D\u0644\u06CC \u0633\u0631\u0648\u0631 \u0634\u0645\u0627 \u0628\u0627\u0644\u0627 \u062E\u0648\u0627\u0647\u062F \u0622\u0645\u062F.
`;
    zip.file("install-ubuntu.sh", installScript);
    zip.file("hamkarhub.service", serviceUnit);
    zip.file("README-UBUNTU.md", readme);
    const rootFiles = ["package.json", "tsconfig.json", "vite.config.ts", "index.html", "server.ts", "server.js", ".env.example", "install.sh", "install-quick.sh"];
    for (const f of rootFiles) {
      const p = path.join(__dirname, f);
      if (fs.existsSync(p)) {
        zip.file(f, fs.readFileSync(p, "utf-8"));
      }
    }
    addDirToZip(path.join(__dirname, "src"), zip.folder("src"));
    if (fs.existsSync(path.join(__dirname, "dist"))) {
      addDirToZip(path.join(__dirname, "dist"), zip.folder("dist"));
    }
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="hamkarhub-ubuntu-package.zip"');
    return res.send(zipBuffer);
  } catch (err) {
    console.error("Error generating ubuntu zip:", err);
    res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0648\u0644\u06CC\u062F \u0641\u0627\u06CC\u0644 \u0641\u0634\u0631\u062F\u0647 \u0627\u0648\u0628\u0648\u0646\u062A\u0648" });
  }
});
app.get("/install.sh", (req, res) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;
  const script = `#!/usr/bin/env bash
# ==============================================================
# \u{1F680} HamkarHub One-Line Automated Installer for Ubuntu / Debian
# \u0633\u0627\u0645\u0627\u0646\u0647 \u0686\u062A \u0644\u0648\u06A9\u0627\u0644 \u0648 \u067E\u0648\u0631\u062A\u0627\u0644 \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC (\u06CC\u06A9\u067E\u0627\u0631\u0686\u0647 \u0628\u0627 \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9)
# ==============================================================
set -e

# \u0628\u0631\u0631\u0633\u06CC \u0645\u062C\u0648\u0632 \u0631\u0648\u062A \u06CC\u0627 sudo
if [ "\\$EUID" -ne 0 ]; then
    if ! command -v sudo &> /dev/null; then
        echo "\u274C \u0644\u0637\u0641\u0627\u064B \u0627\u06CC\u0646 \u0627\u0633\u06A9\u0631\u06CC\u067E\u062A \u0631\u0627 \u0628\u0627 \u062F\u0633\u062A\u0631\u0633\u06CC root \u06CC\u0627 sudo \u0627\u062C\u0631\u0627 \u0646\u0645\u0627\u06CC\u06CC\u062F."
        exit 1
    fi
    SUDO="sudo"
else
    SUDO=""
fi

echo ""
echo "=========================================================="
echo "  \u{1F680} \u0634\u0631\u0648\u0639 \u0646\u0635\u0628 \u062E\u0648\u062F\u06A9\u0627\u0631 \u0633\u0627\u0645\u0627\u0646\u0647 \u0647\u0645\u06A9\u0627\u0631 \u0647\u0627\u0628 (HamkarHub Server)"
echo "  \u{1F310} \u062F\u0631\u06CC\u0627\u0641\u062A \u0645\u0633\u062A\u0642\u06CC\u0645 \u0627\u0632 \u0633\u0648\u0631\u0633: ${baseUrl}"
echo "=========================================================="
echo ""

# \u06F1. \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0645\u062E\u0627\u0632\u0646 \u0648 \u0646\u0635\u0628 \u0628\u0633\u062A\u0647\u200C\u0647\u0627\u06CC \u067E\u0627\u06CC\u0647\u200C\u0627\u06CC
echo "\u{1F4E6} \u06F1/\u06F6 \u062F\u0631 \u062D\u0627\u0644 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0633\u06CC\u0633\u062A\u0645 \u0648 \u0646\u0635\u0628 \u0627\u0628\u0632\u0627\u0631\u0647\u0627 (curl, git, unzip, ufw)..."
\\$SUDO apt-get update -y
\\$SUDO apt-get install -y curl wget unzip git ufw build-essential

# \u06F2. \u0628\u0631\u0631\u0633\u06CC \u0648 \u0646\u0635\u0628 \u062E\u0648\u062F\u06A9\u0627\u0631 Node.js 20 LTS
echo "\u{1F4E6} \u06F2/\u06F6 \u0628\u0631\u0631\u0633\u06CC \u067E\u06CC\u0634\u200C\u0646\u06CC\u0627\u0632 Node.js 20..."
NEED_NODE=0
if ! command -v node &> /dev/null; then
    NEED_NODE=1
else
    NODE_MAJOR=\\$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "\\$NODE_MAJOR" -lt 18 ]; then
        echo "\u0646\u0633\u062E\u0647 Node.js \u0641\u0639\u0644\u06CC (\\$NODE_MAJOR) \u0642\u062F\u06CC\u0645\u06CC \u0627\u0633\u062A\u060C \u0627\u0631\u062A\u0642\u0627 \u0628\u0647 \u0646\u0633\u062E\u0647 20..."
        NEED_NODE=1
    fi
fi

if [ "\\$NEED_NODE" -eq 1 ]; then
    echo "\u26A1 \u062F\u0631 \u062D\u0627\u0644 \u0646\u0635\u0628 Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh
    if [ "\\$EUID" -ne 0 ]; then
        sudo bash /tmp/nodesource_setup.sh
        sudo apt-get install -y nodejs
    else
        bash /tmp/nodesource_setup.sh
        apt-get install -y nodejs
    fi
    rm -f /tmp/nodesource_setup.sh
fi

echo "\u2705 \u0646\u0633\u062E\u0647 Node.js: \\$(node -v)"
echo "\u2705 \u0646\u0633\u062E\u0647 NPM: \\$(npm -v)"

# \u06F3. \u0622\u0645\u0627\u062F\u0647\u200C\u0633\u0627\u0632\u06CC \u062F\u0627\u06CC\u0631\u06A9\u062A\u0648\u0631\u06CC \u062F\u0631 /opt/hamkarhub
INSTALL_DIR="/opt/hamkarhub"
echo "\u{1F4C1} \u06F3/\u06F6 \u062F\u0631 \u062D\u0627\u0644 \u0622\u0645\u0627\u062F\u0647\u200C\u0633\u0627\u0632\u06CC \u062F\u0627\u06CC\u0631\u06A9\u062A\u0648\u0631\u06CC \u062F\u0631 \\$INSTALL_DIR..."
\\$SUDO mkdir -p "\\$INSTALL_DIR"
cd "\\$INSTALL_DIR"

# \u06F4. \u062F\u0627\u0646\u0644\u0648\u062F \u0645\u0633\u062A\u0642\u06CC\u0645 \u0633\u0648\u0631\u0633 \u067E\u0631\u0648\u0698\u0647 \u0627\u0632 \u0633\u0631\u0648\u0631
echo "\u{1F4E5} \u06F4/\u06F6 \u062F\u0631 \u062D\u0627\u0644 \u062F\u0627\u0646\u0644\u0648\u062F \u0645\u0633\u062A\u0642\u06CC\u0645 \u0628\u0633\u062A\u0647 \u067E\u0631\u0648\u0698\u0647 \u0627\u0632 \u0648\u0628\u200C\u0633\u0631\u0648\u0631..."
TMP_ZIP="/tmp/hamkarhub-\\$(date +%s).zip"
curl -fsSL "${baseUrl}/api/download/ubuntu-package" -o "\\$TMP_ZIP"

echo "\u{1F4C2} \u062F\u0631 \u062D\u0627\u0644 \u0627\u06A9\u0633\u062A\u0631\u06A9\u062A \u0641\u0627\u06CC\u0644\u200C\u0647\u0627..."
\\$SUDO unzip -q -o "\\$TMP_ZIP" -d "\\$INSTALL_DIR"
\\$SUDO rm -f "\\$TMP_ZIP"

# \u06F5. \u0646\u0635\u0628 \u067E\u06A9\u06CC\u062C\u200C\u0647\u0627\u06CC \u067E\u0631\u0648\u0698\u0647 \u0648 \u06A9\u0627\u0645\u067E\u0627\u06CC\u0644 \u0628\u06CC\u0644\u062F
echo "\u{1F4E6} \u06F5/\u06F6 \u062F\u0631 \u062D\u0627\u0644 \u0646\u0635\u0628 \u0648\u0627\u0628\u0633\u062A\u06AF\u06CC\u200C\u0647\u0627\u06CC NPM \u0648 \u06A9\u0627\u0645\u067E\u0627\u06CC\u0644 \u0641\u0631\u0627\u0646\u062A\u200C\u0627\u0646\u062F..."
npm install --legacy-peer-deps

if ! grep -q -E "sse4_2|avx" /proc/cpuinfo 2>/dev/null; then
    echo "\u26A1 \u067E\u0631\u062F\u0627\u0632\u0646\u062F\u0647 \u0633\u0631\u0648\u0631 \u0642\u062F\u06CC\u0645\u06CC \u0627\u0633\u062A (\u0641\u0627\u0642\u062F AVX/SSE4.2 \u0645\u0627\u0646\u0646\u062F AMD Phenom)\u061B \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u0633\u062A\u0642\u06CC\u0645 \u0627\u0632 \u0628\u06CC\u0644\u062F \u0622\u0645\u0627\u062F\u0647..."
else
    npm run build || true
fi

# \u06F6. \u0641\u0627\u06CC\u0631\u0648\u0627\u0644 \u0648 \u0633\u0631\u0648\u06CC\u0633 daemon \u062F\u0627\u0626\u0645\u06CC systemd
echo "\u2699\uFE0F \u06F6/\u06F6 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0641\u0627\u06CC\u0631\u0648\u0627\u0644 \u0648 \u0633\u0631\u0648\u06CC\u0633 \u062F\u0627\u0626\u0645\u06CC \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 (systemd)..."
\\$SUDO ufw allow 3000/tcp || true

NODE_PATH=\\$(which node)
SERVICE_USER=\\$(logname 2>/dev/null || echo \\$SUDO_USER)
if [ -z "\\$SERVICE_USER" ]; then
    SERVICE_USER=\\$(whoami)
fi

if [ -f "\\$INSTALL_DIR/server.js" ]; then
    EXEC_START="\\$NODE_PATH \\$INSTALL_DIR/server.js"
else
    EXEC_START="\\$NODE_PATH \\$INSTALL_DIR/node_modules/tsx/dist/cli.mjs server.ts"
fi

\\$SUDO bash -c "cat <<EOF > /etc/systemd/system/hamkarhub.service
[Unit]
Description=HamkarHub Coworking Hotspot Chat Server
After=network.target

[Service]
Type=simple
User=\\$SERVICE_USER
WorkingDirectory=\\$INSTALL_DIR
ExecStart=\\$EXEC_START
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF"

\\$SUDO chown -R \\$SERVICE_USER:\\$SERVICE_USER "\\$INSTALL_DIR" || true

\\$SUDO systemctl daemon-reload
\\$SUDO systemctl enable hamkarhub.service
\\$SUDO systemctl restart hamkarhub.service

SERVER_IP=\\$(hostname -I | awk '{print \\$1}')

echo ""
echo "=========================================================="
echo "\u{1F389} \u0633\u0627\u0645\u0627\u0646\u0647 \u0647\u0645\u06A9\u0627\u0631 \u0647\u0627\u0628 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0627 \u06CC\u06A9 \u062F\u0633\u062A\u0648\u0631 \u0646\u0635\u0628 \u0648 \u0641\u0639\u0627\u0644 \u0634\u062F!"
echo "=========================================================="
echo "\u{1F310} \u0622\u062F\u0631\u0633 \u062F\u0633\u062A\u0631\u0633\u06CC \u062F\u0631 \u0634\u0628\u06A9\u0647 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC: http://\${SERVER_IP}:3000"
echo "\u{1F510} \u067E\u0646\u0644 \u0627\u062F\u0645\u06CC\u0646 \u0648 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9: http://\${SERVER_IP}:3000 (\u0631\u0645\u0632 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: admin123)"
echo "\u{1F4CC} \u062F\u0633\u062A\u0648\u0631\u0627\u062A \u0645\u0627\u0646\u06CC\u062A\u0648\u0631\u06CC\u0646\u06AF \u0633\u0631\u0648\u06CC\u0633 \u062F\u0631 \u0627\u0648\u0628\u0648\u0646\u062A\u0648:"
echo "   - \u0628\u0631\u0631\u0633\u06CC \u0648\u0636\u0639\u06CC\u062A: sudo systemctl status hamkarhub"
echo "   - \u0644\u0627\u06AF\u200C\u0647\u0627\u06CC \u0632\u0646\u062F\u0647: sudo journalctl -u hamkarhub -f"
echo "   - \u0631\u06CC\u200C\u0627\u0633\u062A\u0627\u0631\u062A:    sudo systemctl restart hamkarhub"
echo "=========================================================="
echo ""
`;
  res.setHeader("Content-Type", "text/x-shellscript; charset=utf-8");
  res.send(script);
});
app.get("/api/download/mikrotik-hotspot", async (req, res) => {
  try {
    const zip = new JSZip();
    const db = readDb();
    const serverUrl = `http://${db.config.serverLocalIp}:${db.config.serverPort}`;
    const loginHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${db.config.hotspotName} | \u0648\u0631\u0648\u062F\u06CC \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u0648 \u0686\u062A \u0644\u0648\u06A9\u0627\u0644</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; width: 100%; max-width: 440px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .badge { display: inline-block; background: #f59e0b; color: #000; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 6px; margin-bottom: 12px; }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
    .chat-banner { background: #0f172a; border: 1px dashed #475569; border-radius: 12px; padding: 14px; margin-bottom: 20px; text-align: center; }
    .chat-banner a { color: #38bdf8; text-decoration: none; font-weight: 600; font-size: 14px; display: block; margin-top: 6px; }
    .form-group { margin-bottom: 14px; text-align: right; }
    label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 6px; font-weight: 500; }
    input[type="text"], input[type="password"] { width: 100%; padding: 12px 14px; background: #0f172a; border: 1px solid #475569; border-radius: 8px; color: #fff; font-size: 14px; outline: none; }
    input:focus { border-color: #38bdf8; }
    .btn-submit { width: 100%; padding: 12px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px; }
    .btn-submit:hover { background: #1d4ed8; }
    .trial-box { margin-top: 16px; text-align: center; border-top: 1px solid #334155; padding-top: 16px; }
    .trial-link { color: #f59e0b; text-decoration: none; font-size: 13px; font-weight: 600; }
    .error-msg { background: #ef444422; border: 1px solid #ef4444; color: #fca5a5; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">\u0647\u0627\u0628 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC</span>
    <h1>${db.config.hotspotName}</h1>
    <p>${db.config.welcomeNotice}</p>

    <div class="chat-banner">
      <div style="font-size: 12px; color: #94a3b8;">\u0628\u062F\u0648\u0646 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u062F\u0631 \u0686\u062A \u0644\u0648\u06A9\u0627\u0644 \u062D\u0636\u0648\u0631 \u062F\u0627\u0631\u06CC\u062F:</div>
      <a href="${serverUrl}" target="_blank">\u0648\u0631\u0648\u062F \u0628\u0647 \u0686\u062A \u062F\u0627\u062E\u0644\u06CC \u0648 \u0634\u0628\u06A9\u0647 \u0647\u0645\u06A9\u0627\u0631\u0627\u0646 &larr;</a>
    </div>

    $(if error)
    <div class="error-msg">$(error)</div>
    $(endif)

    <form name="login" action="$(link-login-only)" method="post">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="hidden" name="popup" value="true" />

      <div class="form-group">
        <label>\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627 \u0634\u0646\u0627\u0633\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9:</label>
        <input type="text" name="username" value="$(username)" placeholder="\u0645\u062B\u0627\u0644: member104" required autofocus />
      </div>

      <div class="form-group">
        <label>\u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631:</label>
        <input type="password" name="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required />
      </div>

      <button type="submit" class="btn-submit">\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A</button>
    </form>

    $(if trial == 'yes')
    <div class="trial-box">
      <a class="trial-link" href="$(link-login-only)?dst=$(link-orig-esc)&amp;username=T-$(mac-esc)">\u0648\u0631\u0648\u062F \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0631\u0627\u06CC\u06AF\u0627\u0646 (Free Trial)</a>
    </div>
    $(endif)
  </div>
</body>
</html>`;
    const statusHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0648\u0636\u0639\u06CC\u062A \u0627\u062A\u0635\u0627\u0644 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; width: 100%; max-width: 440px; padding: 24px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 13px; }
    .btn { display: block; text-align: center; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: 600; margin-top: 14px; font-size: 14px; }
    .btn-chat { background: #f59e0b; color: #0f172a; }
    .btn-logout { background: #ef4444; color: #fff; border: none; width: 100%; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="font-size: 18px; margin-bottom: 16px; text-align: center;">\u0648\u0636\u0639\u06CC\u062A \u0627\u062A\u0635\u0627\u0644 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9</h2>
    <div class="row"><span>\u06A9\u0627\u0631\u0628\u0631:</span><span>$(username)</span></div>
    <div class="row"><span>\u0622\u062F\u0631\u0633 \u0622\u06CC\u200C\u067E\u06CC:</span><span>$(ip)</span></div>
    <div class="row"><span>\u0645\u06A9 \u0622\u062F\u0631\u0633:</span><span>$(mac)</span></div>
    <div class="row"><span>\u0645\u062F\u062A \u0627\u062A\u0635\u0627\u0644:</span><span>$(uptime)</span></div>
    <div class="row"><span>\u062D\u062C\u0645 \u0645\u0635\u0631\u0641\u06CC \u062F\u0627\u0646\u0644\u0648\u062F:</span><span>$(bytes-out-nice)</span></div>
    <div class="row"><span>\u062D\u062C\u0645 \u0645\u0635\u0631\u0641\u06CC \u0622\u067E\u0644\u0648\u062F:</span><span>$(bytes-in-nice)</span></div>

    <a href="${serverUrl}" class="btn btn-chat">\u0648\u0631\u0648\u062F \u0628\u0647 \u0686\u062A \u0644\u0648\u06A9\u0627\u0644 \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631</a>

    <form action="$(link-logout)" name="logout" method="post" style="margin-top: 10px;">
      <input type="hidden" name="erase-cookie" value="on">
      <button type="submit" class="btn btn-logout">\u0642\u0637\u0639 \u0627\u062A\u0635\u0627\u0644 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A</button>
    </form>
  </div>
</body>
</html>`;
    const mikrotikRsc = `# ==============================================================
# \u06F1. \u0631\u0641\u0639 \u062E\u0637\u0627\u06CC "challenge response, try again, enable javascript":
# \u0628\u0627 \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u0645\u062A\u062F http-pap\u060C \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9 \u067E\u0633\u0648\u0631\u062F \u0633\u0627\u062F\u0647 \u0631\u0627 \u0627\u0632 \u0635\u0641\u062D\u0647 \u0648\u0628 \u0645\u06CC\u200C\u067E\u0630\u06CC\u0631\u062F:
/ip hotspot profile set [find] login-by=http-pap,http-chap,trial,cookie

# \u06F2. \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0633\u0631\u0648\u0631 \u0686\u062A \u0644\u0648\u06A9\u0627\u0644 \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0642\u0628\u0644 \u0627\u0632 \u0644\u0627\u06AF\u06CC\u0646:
/ip hotspot walled-garden ip
add action=accept comment="HamkarHub Server" dst-address=${db.config.serverLocalIp} dst-port=${db.config.serverPort}

# \u06F3. \u062A\u0646\u0638\u06CC\u0645 \u062F\u06CC\u200C\u0627\u0646\u200C\u0627\u0633 \u062F\u0627\u062E\u0644\u06CC (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC):
/ip dns static
add address=${db.config.serverLocalIp} name="${db.config.walledGardenDomain}" comment="HamkarHub Local Hub"
`;
    zip.file("login.html", loginHtml);
    zip.file("status.html", statusHtml);
    zip.file("setup.rsc", mikrotikRsc);
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="mikrotik-hotspot-files.zip"');
    return res.send(zipBuffer);
  } catch (err) {
    console.error("Error generating mikrotik zip:", err);
    res.status(500).json({ error: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0648\u0644\u06CC\u062F \u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9" });
  }
});
app.get("/api/hotspot/mikrotik-files", (req, res) => {
  const db = readDb();
  const serverUrl = `http://${db.config.serverLocalIp}:${db.config.serverPort}`;
  const loginHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${db.config.hotspotName} | \u0648\u0631\u0648\u062F\u06CC \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u0648 \u0686\u062A \u0644\u0648\u06A9\u0627\u0644</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; width: 100%; max-width: 440px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .badge { display: inline-block; background: #f59e0b; color: #000; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 6px; margin-bottom: 12px; }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
    .chat-banner { background: #0f172a; border: 1px dashed #475569; border-radius: 12px; padding: 14px; margin-bottom: 20px; text-align: center; }
    .chat-banner a { color: #38bdf8; text-decoration: none; font-weight: 600; font-size: 14px; display: block; margin-top: 6px; }
    .form-group { margin-bottom: 14px; text-align: right; }
    label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 6px; font-weight: 500; }
    input[type="text"], input[type="password"] { width: 100%; padding: 12px 14px; background: #0f172a; border: 1px solid #475569; border-radius: 8px; color: #fff; font-size: 14px; outline: none; }
    input:focus { border-color: #38bdf8; }
    .btn-submit { width: 100%; padding: 12px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px; }
    .btn-submit:hover { background: #1d4ed8; }
    .trial-box { margin-top: 16px; text-align: center; border-top: 1px solid #334155; padding-top: 16px; }
    .trial-link { color: #f59e0b; text-decoration: none; font-size: 13px; font-weight: 600; }
    .error-msg { background: #ef444422; border: 1px solid #ef4444; color: #fca5a5; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">\u0647\u0627\u0628 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC</span>
    <h1>${db.config.hotspotName}</h1>
    <p>${db.config.welcomeNotice}</p>

    <div class="chat-banner">
      <div style="font-size: 12px; color: #94a3b8;">\u0628\u062F\u0648\u0646 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0647\u0645 \u0627\u06A9\u0646\u0648\u0646 \u062F\u0631 \u0686\u062A \u0645\u062D\u0644\u06CC \u062D\u0636\u0648\u0631 \u062F\u0627\u0631\u06CC\u062F:</div>
      <a href="${serverUrl}" target="_blank">\u0648\u0631\u0648\u062F \u0628\u0647 \u0686\u062A \u062F\u0627\u062E\u0644\u06CC \u0648 \u0634\u0628\u06A9\u0647 \u0647\u0645\u06A9\u0627\u0631\u0627\u0646 &larr;</a>
    </div>

    $(if error)
    <div class="error-msg">$(error)</div>
    $(endif)

    <form name="login" action="$(link-login-only)" method="post">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="hidden" name="popup" value="true" />

      <div class="form-group">
        <label>\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627 \u0634\u0645\u0627\u0631\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9:</label>
        <input type="text" name="username" value="$(username)" placeholder="\u0645\u062B\u0627\u0644: member104" required autofocus />
      </div>

      <div class="form-group">
        <label>\u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631:</label>
        <input type="password" name="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required />
      </div>

      <button type="submit" class="btn-submit">\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A</button>
    </form>

    $(if trial == 'yes')
    <div class="trial-box">
      <a class="trial-link" href="$(link-login-only)?dst=$(link-orig-esc)&amp;username=T-$(mac-esc)">\u0648\u0631\u0648\u062F \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u06F1 \u0633\u0627\u0639\u062A\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646 (Free Trial)</a>
    </div>
    $(endif)
  </div>
</body>
</html>`;
  const statusHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0648\u0636\u0639\u06CC\u062A \u0627\u062A\u0635\u0627\u0644 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; width: 100%; max-width: 440px; padding: 24px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 13px; }
    .btn { display: block; text-align: center; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: 600; margin-top: 14px; font-size: 14px; }
    .btn-chat { background: #f59e0b; color: #0f172a; }
    .btn-logout { background: #ef4444; color: #fff; border: none; width: 100%; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="font-size: 18px; margin-bottom: 16px; text-align: center;">\u0648\u0636\u0639\u06CC\u062A \u0627\u062A\u0635\u0627\u0644 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9</h2>
    <div class="row"><span>\u06A9\u0627\u0631\u0628\u0631:</span><span>$(username)</span></div>
    <div class="row"><span>\u0622\u062F\u0631\u0633 \u0622\u06CC\u200C\u067E\u06CC:</span><span>$(ip)</span></div>
    <div class="row"><span>\u0645\u06A9 \u0622\u062F\u0631\u0633:</span><span>$(mac)</span></div>
    <div class="row"><span>\u0645\u062F\u062A \u0627\u062A\u0635\u0627\u0644:</span><span>$(uptime)</span></div>
    <div class="row"><span>\u062D\u062C\u0645 \u0645\u0635\u0631\u0641\u06CC \u062F\u0627\u0646\u0644\u0648\u062F:</span><span>$(bytes-out-nice)</span></div>
    <div class="row"><span>\u062D\u062C\u0645 \u0645\u0635\u0631\u0641\u06CC \u0622\u067E\u0644\u0648\u062F:</span><span>$(bytes-in-nice)</span></div>

    <a href="${serverUrl}" class="btn btn-chat">\u0648\u0631\u0648\u062F \u0628\u0647 \u0686\u062A \u0644\u0648\u06A9\u0627\u0644 \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631</a>

    <form action="$(link-logout)" name="logout" method="post" style="margin-top: 10px;">
      <input type="hidden" name="erase-cookie" value="on">
      <button type="submit" class="btn btn-logout">\u0642\u0637\u0639 \u0627\u062A\u0635\u0627\u0644 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A</button>
    </form>
  </div>
</body>
</html>`;
  const mikrotikCli = `# ==============================================================
# \u062F\u0633\u062A\u0648\u0631\u0627\u062A \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC Walled Garden \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9 \u0628\u0631\u0627\u06CC \u0633\u0631\u0648\u0631 \u0686\u062A \u0644\u0648\u06A9\u0627\u0644
# \u062F\u0631 \u062A\u0631\u0645\u06CC\u0646\u0627\u0644 \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9 (Winbox -> New Terminal) \u06A9\u067E\u06CC \u0648 \u0627\u062C\u0631\u0627 \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F:
# ==============================================================

# \u06F1. \u062A\u0639\u0631\u06CC\u0641 \u0622\u06CC\u200C\u067E\u06CC \u0633\u0631\u0648\u0631 \u062F\u0631 \u0648\u0627\u0644\u200C\u06AF\u0627\u0631\u062F\u0646 (\u062A\u0627 \u0628\u062F\u0648\u0646 \u0644\u0627\u06AF\u06CC\u0646 \u0628\u0647 \u0686\u062A \u062F\u0633\u062A\u0631\u0633\u06CC \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u0646\u062F)
/ip hotspot walled-garden ip
add action=accept comment="HamkarHub Local Chat Server" dst-address=${db.config.serverLocalIp} dst-port=${db.config.serverPort}

# \u06F2. \u062A\u0639\u0631\u06CC\u0641 \u062F\u0627\u0645\u0646\u0647 \u0645\u062D\u0644\u06CC (\u062F\u0631 \u0635\u0648\u0631\u062A \u062F\u0627\u0634\u062A\u0646 \u0646\u0627\u0645 \u062F\u0627\u0645\u0646\u0647 \u062F\u0627\u062E\u0644\u06CC)
/ip hotspot walled-garden
add action=accept comment="HamkarHub Domain" dst-host="${db.config.walledGardenDomain}"

# \u06F3. \u062A\u0646\u0638\u06CC\u0645 DNS \u0627\u0633\u062A\u0627\u062A\u06CC\u06A9 \u0631\u0648\u06CC \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9 \u0628\u0631\u0627\u06CC \u062F\u0633\u062A\u0631\u0633\u06CC \u0631\u0627\u062D\u062A\u200C\u062A\u0631 \u0627\u0639\u0636\u0627:
/ip dns static
add address=${db.config.serverLocalIp} name="${db.config.walledGardenDomain}" comment="Coworking Local Hub"

# \u0628\u0627 \u0627\u06CC\u0646 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A\u060C \u062A\u0645\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0645\u062A\u0635\u0644 \u0628\u0647 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u062D\u062A\u06CC \u0642\u0628\u0644 \u0627\u0632 \u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u06CC\u0648\u0632\u0631\u0646\u06CC\u0645/\u067E\u0633\u0648\u0631\u062F
# \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u0648\u0627\u0631\u062F \u0622\u062F\u0631\u0633 http://${db.config.serverLocalIp}:${db.config.serverPort} \u06CC\u0627 http://${db.config.walledGardenDomain}:${db.config.serverPort} \u0634\u0648\u0646\u062F!
`;
  res.json({
    loginHtml,
    statusHtml,
    mikrotikCli,
    serverUrl
  });
});
function renderFallbackPortal() {
  const db = readDb();
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0647\u0645\u06A9\u0627\u0631 \u0647\u0627\u0628 | \u067E\u0631\u062A\u0627\u0644 \u0645\u062D\u0644\u06CC \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC \u0648 \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Vazirmatn', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
          \u26A1
        </div>
        <div>
          <h1 class="text-base font-bold text-white">${db.config.hotspotName || "\u0647\u0645\u06A9\u0627\u0631 \u0647\u0627\u0628"}</h1>
          <p class="text-xs text-slate-400">\u067E\u0631\u062A\u0627\u0644 \u0645\u062D\u0644\u06CC \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC \u0648 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          \u0633\u0631\u0648\u0631 \u0641\u0639\u0627\u0644 \u0631\u0648\u06CC \u067E\u0648\u0631\u062A \u06F3\u06F0\u06F0\u06F0
        </span>
      </div>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 py-6">
    <!-- TABS -->
    <div class="flex flex-wrap border-b border-slate-800 gap-2 mb-6 text-sm font-semibold">
      <button onclick="switchTab('hotspot')" id="tab-btn-hotspot" class="tab-btn px-4 py-2.5 border-b-2 border-amber-500 text-amber-400">
        \u{1F4F6} \u0648\u0631\u0648\u062F \u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0648 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC
      </button>
      <button onclick="switchTab('chat')" id="tab-btn-chat" class="tab-btn px-4 py-2.5 text-slate-400 hover:text-slate-200">
        \u{1F4AC} \u0686\u062A \u0645\u062D\u0644\u06CC \u0647\u0645\u06A9\u0627\u0631\u0627\u0646
      </button>
      <button onclick="switchTab('members')" id="tab-btn-members" class="tab-btn px-4 py-2.5 text-slate-400 hover:text-slate-200">
        \u{1F465} \u0627\u0639\u0636\u0627\u06CC \u062D\u0627\u0636\u0631 \u0648 \u0635\u0646\u062F\u0644\u06CC\u200C\u0647\u0627
      </button>
      <button onclick="switchTab('amenities')" id="tab-btn-amenities" class="tab-btn px-4 py-2.5 text-slate-400 hover:text-slate-200">
        \u2615 \u0627\u0645\u06A9\u0627\u0646\u0627\u062A \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631
      </button>
      <button onclick="switchTab('status')" id="tab-btn-status" class="tab-btn px-4 py-2.5 text-slate-400 hover:text-slate-200">
        \u2699\uFE0F \u0648\u0636\u0639\u06CC\u062A \u0633\u0631\u0648\u0631 \u0648 \u0627\u062F\u0645\u06CC\u0646
      </button>
    </div>

    <!-- TAB: HOTSPOT -->
    <div id="tab-hotspot" class="tab-pane">
      <div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div class="text-center mb-6">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-3xl mb-3 border border-amber-500/20">
            \u{1F4F6}
          </div>
          <h2 class="text-lg font-bold text-white">\u0648\u0631\u0648\u062F \u0628\u0647 \u0634\u0628\u06A9\u0647 \u0648\u0627\u06CC\u200C\u0641\u0627\u06CC \u0645\u06CC\u06A9\u0631\u0648\u062A\u06CC\u06A9</h2>
          <p class="text-xs text-slate-400 mt-1">\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0648 \u0631\u0645\u0632 \u0627\u0634\u062A\u0631\u0627\u06A9 \u062E\u0648\u062F \u0631\u0627 \u0628\u0631\u0627\u06CC \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F</p>
        </div>

        <form method="post" action="http://192.168.88.1/login" id="hotspot-form" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC (\u06A9\u062F \u0639\u0636\u0648\u06CC\u062A \u06CC\u0627 \u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646)</label>
            <input type="text" name="username" required placeholder="\u0645\u062B\u0627\u0644: amir \u06CC\u0627 \u0634\u0645\u0627\u0631\u0647 \u062A\u0645\u0627\u0633" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">\u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631</label>
            <input type="password" name="password" required placeholder="\u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500">
          </div>
          <input type="hidden" name="dst" value="http://${db.config.serverLocalIp || "192.168.30.20"}:3000/">
          
          <button type="submit" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20">
            \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-slate-800 text-center">
          <button onclick="switchTab('chat')" class="text-xs text-amber-400 hover:underline">
            \u2190 \u0648\u0631\u0648\u062F \u0645\u0633\u062A\u0642\u06CC\u0645 \u0628\u0647 \u0686\u062A \u0645\u062D\u0644\u06CC \u0647\u0645\u06A9\u0627\u0631\u0627\u0646 (\u0628\u062F\u0648\u0646 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A)
          </button>
        </div>
      </div>
    </div>

    <!-- TAB: CHAT -->
    <div id="tab-chat" class="tab-pane hidden">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u06CC \u06AF\u0641\u062A\u06AF\u0648</h3>
          <div class="space-y-1" id="chat-channels-list">
            <button class="w-full text-right px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 font-semibold text-xs border border-amber-500/20">
              # \u0639\u0645\u0648\u0645\u06CC (General)
            </button>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800">
            <p class="text-xs text-slate-400">\u062A\u0645\u0627\u0645 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u0628\u0647 \u0635\u0648\u0631\u062A \u0632\u0646\u062F\u0647 \u062F\u0631 \u0634\u0628\u06A9\u0647 \u0645\u062D\u0644\u06CC \u0630\u062E\u06CC\u0631\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.</p>
          </div>
        </div>

        <div class="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px]">
          <div class="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <span class="text-xs font-bold text-white flex items-center gap-2">
              <span class="text-amber-400">#</span> \u06A9\u0627\u0646\u0627\u0644 \u0639\u0645\u0648\u0645\u06CC \u0647\u0645\u06A9\u0627\u0631\u0627\u0646
            </span>
            <span class="text-xs text-emerald-400" id="chat-online-count">\u0627\u062A\u0635\u0627\u0644 \u0641\u0639\u0627\u0644</span>
          </div>

          <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3">
            <div class="text-center text-xs text-slate-500 my-4">\u062F\u0631 \u062D\u0627\u0644 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627...</div>
          </div>

          <form id="chat-form" onsubmit="handleSendMessage(event)" class="p-3 border-t border-slate-800 flex gap-2">
            <input type="text" id="chat-input" placeholder="\u067E\u06CC\u0627\u0645 \u062E\u0648\u062F \u0631\u0627 \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F..." required class="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500">
            <button type="submit" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition">
              \u0627\u0631\u0633\u0627\u0644
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- TAB: MEMBERS -->
    <div id="tab-members" class="tab-pane hidden">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-white">\u0627\u0639\u0636\u0627\u06CC \u062D\u0627\u0636\u0631 \u062F\u0631 \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC</h3>
        <button onclick="promptCheckIn()" class="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition">
          + \u062B\u0628\u062A \u062D\u0636\u0648\u0631 \u062F\u0631 \u0635\u0646\u062F\u0644\u06CC
        </button>
      </div>
      <div id="members-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <!-- Rendered via JS -->
      </div>
    </div>

    <!-- TAB: AMENITIES -->
    <div id="tab-amenities" class="tab-pane hidden">
      <h3 class="text-sm font-bold text-white mb-4">\u0648\u0636\u0639\u06CC\u062A \u0627\u0645\u06A9\u0627\u0646\u0627\u062A \u0648 \u0641\u0636\u0627\u0647\u0627\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC</h3>
      <div id="amenities-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <!-- Rendered via JS -->
      </div>
    </div>

    <!-- TAB: STATUS -->
    <div id="tab-status" class="tab-pane hidden">
      <div class="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 class="text-base font-bold text-white">\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0648\u0636\u0639\u06CC\u062A \u0648 \u0639\u06CC\u0628\u200C\u06CC\u0627\u0628\u06CC \u0633\u0631\u0648\u0631</h3>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between p-2.5 bg-slate-950 rounded-lg">
            <span class="text-slate-400">\u0648\u0636\u0639\u06CC\u062A \u0633\u0631\u0648\u06CC\u0633 Node.js:</span>
            <span class="text-emerald-400 font-bold">\u0641\u0639\u0627\u0644 (Active)</span>
          </div>
          <div class="flex justify-between p-2.5 bg-slate-950 rounded-lg">
            <span class="text-slate-400">\u067E\u0648\u0631\u062A \u0641\u0639\u0627\u0644:</span>
            <span class="text-white font-mono">3000</span>
          </div>
          <div class="flex justify-between p-2.5 bg-slate-950 rounded-lg">
            <span class="text-slate-400">\u062D\u0627\u0644\u062A \u0627\u062C\u0631\u0627:</span>
            <span class="text-amber-400 font-bold">\u067E\u0631\u062A\u0627\u0644 \u0645\u0633\u062A\u0642\u0644 \u0641\u0648\u0642\u200C\u0633\u0631\u06CC\u0639 (\u0633\u0627\u0632\u06AF\u0627\u0631 \u0628\u0627 \u0647\u0645\u0647 \u067E\u0631\u062F\u0627\u0632\u0646\u062F\u0647\u200C\u0647\u0627 \u062D\u062A\u06CC Phenom)</span>
          </div>
          <div class="flex justify-between p-2.5 bg-slate-950 rounded-lg">
            <span class="text-slate-400">\u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 \u0645\u062D\u0644\u06CC JSON:</span>
            <span class="text-white font-mono">/opt/hamkarhub/data/coworking_db.json</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-800">
          <a href="/api/download/ubuntu-package" class="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition">
            \u{1F4E5} \u062F\u0627\u0646\u0644\u0648\u062F \u0641\u0627\u06CC\u0644 \u0632\u06CC\u067E \u06A9\u0627\u0645\u0644 \u0633\u0648\u0631\u0633 \u0648 \u0641\u0631\u0627\u0646\u062A\u200C\u0627\u0646\u062F (hamkarhub-ubuntu-package.zip)
          </a>
        </div>
      </div>
    </div>
  </main>

  <script>
    let currentTab = 'hotspot';
    let myName = localStorage.getItem('hamkarhub_user') || '\u06A9\u0627\u0631\u0628\u0631 \u0645\u0647\u0645\u0627\u0646 ' + Math.floor(Math.random() * 900 + 100);

    function switchTab(tabId) {
      document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('border-b-2', 'border-amber-500', 'text-amber-400');
        el.classList.add('text-slate-400');
      });
      const target = document.getElementById('tab-' + tabId);
      const btn = document.getElementById('tab-btn-' + tabId);
      if (target) target.classList.remove('hidden');
      if (btn) {
        btn.classList.add('border-b-2', 'border-amber-500', 'text-amber-400');
        btn.classList.remove('text-slate-400');
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
          container.innerHTML = '<div class="text-center text-xs text-slate-500 my-4">\u0647\u0646\u0648\u0632 \u067E\u06CC\u0627\u0645\u06CC \u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u0627\u0648\u0644\u06CC\u0646 \u067E\u06CC\u0627\u0645 \u0631\u0627 \u0634\u0645\u0627 \u0628\u0641\u0631\u0633\u062A\u06CC\u062F!</div>';
          return;
        }
        container.innerHTML = data.map(m => \`
          <div class="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-400">\${m.sender?.name || '\u0647\u0645\u06A9\u0627\u0631'}</span>
              <span class="text-[10px] text-slate-500">\${new Date(m.timestamp).toLocaleTimeString('fa-IR')}</span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed">\${m.text}</p>
          </div>
        \`).join('');
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
            sender: { id: 'u-' + Date.now(), name: myName, role: '\u0639\u0636\u0648 \u0647\u0645\u06A9\u0627\u0631' }
          })
        });
        loadChat();
      } catch (err) {
        alert('\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645');
      }
    }

    async function loadMembers() {
      try {
        const res = await fetch('/api/members');
        const data = await res.json();
        const grid = document.getElementById('members-grid');
        grid.innerHTML = data.map(m => \`
          <div class="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-base font-bold text-amber-400">
              \${(m.name || '\u0639')[0]}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-xs font-bold text-white truncate">\${m.name}</h4>
              <p class="text-[11px] text-slate-400 truncate">\${m.role || '\u0639\u0636\u0648 \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631'}</p>
              <div class="flex items-center gap-2 mt-1 text-[10px] text-amber-400/80">
                <span>\u{1F4CD} \${m.desk || '\u0633\u0627\u0644\u0646 \u0627\u0635\u0644\u06CC'}</span>
              </div>
            </div>
          </div>
        \`).join('');
      } catch (e) {
        console.error('Members error:', e);
      }
    }

    async function promptCheckIn() {
      const name = prompt('\u0646\u0627\u0645 \u0648 \u0646\u0627\u0645 \u062E\u0627\u0646\u0648\u0627\u062F\u06AF\u06CC \u062E\u0648\u062F \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F:', myName);
      if (!name) return;
      myName = name;
      localStorage.setItem('hamkarhub_user', name);
      const desk = prompt('\u0645\u06CC\u0632 \u06CC\u0627 \u0645\u062D\u0644 \u0627\u0633\u062A\u0642\u0631\u0627\u0631 \u062E\u0648\u062F \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F (\u0645\u062B\u0627\u0644: \u0645\u06CC\u0632 \u06F1\u06F2 \u0633\u0627\u0644\u0646 \u0628\u0627\u0632):', '\u0645\u06CC\u0632 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC');
      const role = prompt('\u062A\u062E\u0635\u0635 \u06CC\u0627 \u0639\u0646\u0648\u0627\u0646 \u0634\u063A\u0644\u06CC (\u0645\u062B\u0627\u0644: \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0646\u0648\u06CC\u0633 React):', '\u062A\u0648\u0633\u0639\u0647\u200C\u062F\u0647\u0646\u062F\u0647');
      try {
        await fetch('/api/members/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, desk, role, status: 'available' })
        });
        loadMembers();
      } catch (e) {
        alert('\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u062D\u0636\u0648\u0631');
      }
    }

    async function loadAmenities() {
      try {
        const res = await fetch('/api/amenities');
        const data = await res.json();
        const grid = document.getElementById('amenities-grid');
        grid.innerHTML = data.map(a => \`
          <div class="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-white">\${a.name}</h4>
              <span class="text-[10px] px-2 py-0.5 rounded-full \${a.status === 'free' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                \${a.status === 'free' ? '\u0622\u0632\u0627\u062F' : '\u0645\u0634\u063A\u0648\u0644'}
              </span>
            </div>
            <p class="text-[11px] text-slate-400">\${a.location || '\u0641\u0636\u0627\u06CC \u06A9\u0627\u0631'}</p>
          </div>
        \`).join('');
      } catch (e) {
        console.error('Amenities error:', e);
      }
    }

    setInterval(() => {
      if (currentTab === 'chat') loadChat();
    }, 4000);
  </script>
</body>
</html>`;
}
async function startServer() {
  const server = http.createServer(app);
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server
        }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(indexPath);
      });
    } else {
      app.get("*", (req, res) => {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(renderFallbackPortal());
      });
    }
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`HamkarHub Coworking Chat & MikroTik Captive Portal running at http://0.0.0.0:${PORT}`);
  });
}
startServer();

import {
  ShoppingBag,
  Forklift,
  Mail,
  MessageSquare,
  Calendar,
  Fingerprint,
  SquareArrowUpRight,
  Plug,
  Rocket,
  Bell,
  BookOpenText,
  LayoutDashboard,
  ChartBar,
  Banknote,
  Gauge,
  GraduationCap,
  FilePlus2,
  Sparkles,
  List,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 0,
    label: "Create",
    items: [
      {
        title: "New Post",
        url: "/dashboard/create-post",
        icon: FilePlus2,
        comingSoon: false,
      },
      {
        title: "Studio Creator",
        url: "/dashboard/coming-soon",
        icon: Sparkles,
        comingSoon: true,
      },
    ],
  },
  {
    id: 1,
    label: "Posts",
    items: [
      {
        title: "All Posts",
        url: "/dashboard/default",
        icon: List,
      },
      {
        title: "Calendar",
        url: "/dashboard/coming-soon",
        icon: Calendar,
        comingSoon: true,
      },
      {
        title: "Trends Tracker",
        url: "/dashboard/coming-soon",
        icon: TrendingUp,
        comingSoon: true,
      },
      {
        title: "Analytics",
        url: "/dashboard/coming-soon",
        icon: Gauge,
        comingSoon: true,
      },
    ],
  },
  {
    id: 2,
    label: "Connect",
    items: [
      {
        title: "Email",
        url: "/dashboard/coming-soon",
        icon: Mail,
        comingSoon: true,
      },
      {
        title: "Chat",
        url: "/dashboard/coming-soon",
        icon: MessageSquare,
        comingSoon: true,
      },
      {
        title: "Connections",
        url: "/dashboard/connections",
        icon: Plug,
        comingSoon: false,
      },
    ],
  },
  {
    id: 3,
    label: "Support",
    items: [
      {
        title: "Share Feedback",
        url: "/dashboard/coming-soon",
        icon: MessageSquare,
        comingSoon: true,
      },
      {
        title: "Growth Guide",
        url: "/dashboard/coming-soon",
        icon: Rocket,
        comingSoon: true,
      },
      {
        title: "Stay Updated",
        url: "/dashboard/coming-soon",
        icon: Bell,
        comingSoon: true,
      },
      {
        title: "Documentation",
        url: "/dashboard/coming-soon",
        icon: BookOpenText,
        comingSoon: true,
      },
    ],
  },
];

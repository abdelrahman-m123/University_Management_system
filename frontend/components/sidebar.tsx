"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useRouter, usePathname } from "next/navigation";
import { getUnreadChats } from "@/app/chats/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  BookOpen,
  ClipboardList,
  Users,
  FileCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  CalendarDays,
  MessageCircle,
} from "lucide-react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const navLinks = {
  student: [
    { href: "/Courses/student", label: "Courses", icon: BookOpen },
    { href: "/registeration/student", label: "Course Registration", icon: ClipboardList },
  ],
  staff: [
    { href: "/Courses/Doctor", label: "Assigned Courses", icon: BookOpen },
  ],
  admin: [
    { href: "/admin", label: "User Management", icon: Users },
    { href: "/registeration/staff", label: "Course Applications", icon: FileCheck },
    { href: "/Courses/admin", label: "Course Management", icon: LayoutDashboard },
    { href: "/admin/calendar", label: "Academic Calendar", icon: CalendarDays },
  ],
};

const Sidebar: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  useIsomorphicLayoutEffect(() => {
    setRole(localStorage.getItem("role"));
    setUsername(localStorage.getItem("username"));
    const savedCollapsed = localStorage.getItem("sidebar_collapsed");
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncLayout = () => {
      setIsMobile(mediaQuery.matches);
      setCollapsed(mediaQuery.matches || savedCollapsed === "true");
    };

    syncLayout();
    setLayoutReady(true);
    mediaQuery.addEventListener("change", syncLayout);
    return () => mediaQuery.removeEventListener("change", syncLayout);
  }, []);

  // Apply the persisted layout before enabling transitions. This prevents a
  // remounted sidebar from animating from its default expanded width.
  useEffect(() => {
    if (!layoutReady) return;

    const frame = window.requestAnimationFrame(() => {
      setTransitionEnabled(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [layoutReady]);

  useEffect(() => {
    if (role !== "student" && role !== "Doctor") return;

    let cancelled = false;
    const loadUnreadChats = async () => {
      const result = await getUnreadChats();
      if (!cancelled && result.success) {
        setUnreadChatCount(result.totalUnreadCount);
      }
    };

    void loadUnreadChats();

    const token = localStorage.getItem("token");
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5219";
    const hubConnection = new HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/hubs/chat`, {
        accessTokenFactory: () => token ?? "",
      })
      .withAutomaticReconnect()
      .build();

    const updateUnreadCount = (change: { totalUnreadCount?: number }) => {
      setUnreadChatCount(Number(change.totalUnreadCount ?? 0));
    };

    hubConnection.on("UnreadCountChanged", updateUnreadCount);
    void hubConnection.start().catch(() => undefined);

    return () => {
      cancelled = true;
      hubConnection.off("UnreadCountChanged", updateUnreadCount);
      void hubConnection.stop();
    };
  }, [role]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar_collapsed", String(next));
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const chatLink = { href: "/chats", label: "Chats", icon: MessageCircle };

  const links =
    role === "student"
      ? [...navLinks.student, chatLink]
      : role === "Doctor"
      ? [...navLinks.staff, chatLink]
      : role === "TA"
      ? navLinks.staff
      : role === "admin"
      ? navLinks.admin
      : [];

  const activeHref = links
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((first, second) => second.href.length - first.href.length)[0]?.href;

  return (
    <div
      className={`sticky top-0 z-40 flex h-screen max-h-screen shrink-0 flex-col overflow-visible bg-[#0f172a] border-r border-[#1e2d4a] shadow-xl
        ${layoutReady ? "visible" : "invisible"}
        ${transitionEnabled ? "transition-all duration-300 ease-in-out" : "transition-none"}
        ${collapsed || isMobile ? "w-[72px]" : "w-64"}`}
    >
      {/* Header */}
      <div className={`relative flex items-center gap-3 border-b border-[#1e2d4a] px-4 py-5 ${collapsed || isMobile ? "justify-center" : ""}`}>
        {!collapsed && !isMobile && (
          <button
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            aria-expanded={true}
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-blue-800 bg-blue-900 text-white shadow-md transition-colors hover:bg-blue-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="group/logo relative h-8 w-8 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-white shadow-inner">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          {collapsed && !isMobile && (
            <button
              onClick={toggleCollapsed}
              aria-label="Expand sidebar"
              aria-expanded={false}
              className="absolute inset-0 flex items-center justify-center rounded-lg border border-blue-700 bg-blue-800 text-white opacity-0 shadow-md transition-opacity group-hover/logo:opacity-100"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {!collapsed && !isMobile && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-wider text-white uppercase">
              UMS
            </h1>
            <p className="text-[10px] text-blue-300 leading-tight">University Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {collapsed && (
          <div className="flex justify-center mb-2">
            <div className="h-px w-8 bg-blue-800/50" />
          </div>
        )}
        <TooltipProvider delayDuration={200}>
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = activeHref === href;
            const link = (
              <Link
                key={href}
                href={href}
                aria-label={collapsed || isMobile ? label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
                ${isActive
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-blue-200 hover:bg-[#1e2d4a] hover:text-white"
                }
                ${collapsed || isMobile ? "justify-center" : ""}
              `}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-blue-400 group-hover:text-white"}`}
                />
                {!collapsed && !isMobile && <span className="truncate">{label}</span>}
                {label === "Chats" && unreadChatCount > 0 && (
                  <span
                    className={
                      collapsed || isMobile
                        ? "absolute -right-1 top-0 text-[10px] font-medium text-blue-300"
                        : "ml-auto text-xs font-medium text-blue-300"
                    }
                  >
                    ({unreadChatCount > 99 ? "99+" : unreadChatCount})
                  </span>
                )}
              </Link>
            );

            if (!collapsed && !isMobile) return link;

            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Bottom user section */}
      <div className={`mt-auto border-t border-[#1e2d4a] p-3 space-y-2 ${collapsed ? "flex flex-col items-center" : ""}`}>
        {/* User info */}
        <div className={`flex items-center gap-3 rounded-lg px-2 py-2 ${collapsed || isMobile ? "justify-center" : ""}`}>
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold shadow-inner ring-2 ring-blue-300/30">
              {getInitials(username)}
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-blue-900 ring-2 ring-[#0f172a]" />
          </div>
          {!collapsed && !isMobile && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white leading-tight">
                {username ?? "User"}
              </p>
              <p className="truncate text-xs text-blue-300 capitalize leading-tight">
                {role ?? "guest"}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed || isMobile ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-blue-300 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150
            ${collapsed || isMobile ? "justify-center" : ""}
          `}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && !isMobile && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

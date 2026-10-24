"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityList, ActivityRow } from "@/components/dashboard/activity-list";

type NotificationRow = {
  id: string;
  message: string;
  detail: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell({
  fetchUrl,
  markReadUrl,
  markAllReadUrl,
}: {
  fetchUrl: string;
  markReadUrl: (id: string) => string;
  markAllReadUrl: string;
}) {
  const [notifications, setNotifications] = useState<NotificationRow[] | null>(null);
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  useEffect(() => {
    fetch(fetchUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }, [fetchUrl]);

  function markRead(id: string) {
    setNotifications((prev) => prev?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? null);
    fetch(markReadUrl(id), { method: "PATCH" }).catch(() => {});
  }

  function markAllRead() {
    setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })) ?? null);
    fetch(markAllReadUrl, { method: "POST" }).catch(() => {});
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="Notifications" />}>
        <span className="relative inline-flex">
          <Bell size={16} />
          {unreadCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 ? (
            <Button variant="ghost" size="xs" onClick={markAllRead}>
              Mark all read
            </Button>
          ) : null}
        </div>
        <div className="max-h-80 overflow-y-auto px-3.5">
          {notifications === null ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <ActivityList>
              {notifications.map((item) => (
                <ActivityRow
                  key={item.id}
                  title={item.message}
                  detail={item.detail ?? undefined}
                  href={item.href ?? undefined}
                  unread={!item.read}
                  onClick={item.read ? undefined : () => markRead(item.id)}
                />
              ))}
            </ActivityList>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

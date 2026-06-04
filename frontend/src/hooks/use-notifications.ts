'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  requestPermission as libRequestPermission,
  sendNotification as libSendNotification,
  isNotificationSupported,
  getPermissionStatus,
} from '@/lib/notifications';

interface UseNotificationsReturn {
  sendNotification: (title: string, body: string, icon?: string) => Notification | null;
  requestPermission: () => Promise<NotificationPermission | 'unsupported'>;
  permission: NotificationPermission | 'unsupported';
  isSupported: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = isNotificationSupported();
    setIsSupported(supported);
    setPermission(getPermissionStatus());
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await libRequestPermission();
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback(
    (title: string, body: string, icon?: string) => {
      return libSendNotification(title, body, icon);
    },
    []
  );

  return {
    sendNotification,
    requestPermission,
    permission,
    isSupported,
  };
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  const permission = await Notification.requestPermission();
  return permission;
}

export function sendNotification(
  title: string,
  body: string,
  icon?: string
): Notification | null {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  const notification = new Notification(title, {
    body,
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'setupalert',
  });

  return notification;
}

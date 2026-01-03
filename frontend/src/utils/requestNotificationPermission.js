// Request notification permission on component mount
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};

// Show browser notification
export const showNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
};


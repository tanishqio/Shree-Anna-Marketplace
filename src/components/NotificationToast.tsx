"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Bell,
  MessageSquare,
  Truck,
  IndianRupee
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'sms' | 'offer' | 'delivery' | 'payment';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp?: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  sms: MessageSquare,
  offer: Bell,
  delivery: Truck,
  payment: IndianRupee,
};

const colorMap = {
  success: 'bg-accent text-white',
  error: 'bg-destructive text-white',
  info: 'bg-sky-500 text-white',
  sms: 'bg-primary text-primary-foreground',
  offer: 'bg-primary text-primary-foreground',
  delivery: 'bg-secondary text-white',
  payment: 'bg-accent text-white',
};

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

export function NotificationToast({
  notifications,
  onDismiss,
  position = 'top-right',
}: NotificationToastProps) {
  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none`}>
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type];
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.9 }}
              className="bg-card rounded-xl shadow-lg border border-border overflow-hidden pointer-events-auto"
            >
              <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorMap[notification.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <button
                      onClick={() => onDismiss(notification.id)}
                      className="p-1 hover:bg-muted rounded transition-colors shrink-0"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  
                  {/* Timestamp and Action */}
                  <div className="flex items-center justify-between mt-2">
                    {notification.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                    {notification.action && (
                      <button
                        onClick={notification.action.onClick}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar for auto-dismiss */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
                onAnimationComplete={() => onDismiss(notification.id)}
                className={`h-1 origin-left ${colorMap[notification.type]}`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const addNotification = React.useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [
      ...prev,
      { ...notification, id, timestamp: new Date() }
    ]);
    return id;
  }, []);

  const dismissNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
  };
}

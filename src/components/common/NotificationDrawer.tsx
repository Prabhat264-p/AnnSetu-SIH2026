import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Smartphone,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNotification } from '../../types';
import { createSMSMessage } from '../../services/notification/notificationService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToToken?: () => void;
  onNavigate?: (path: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToToken,
}) => {
  const { notifications, markNotificationAsRead, clearAllNotifications, currentUser } = useApp();
  const [selectedSMS, setSelectedSMS] = useState<AppNotification | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#c1c8c2]/50 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#eeeeeb] flex items-center justify-between bg-[#f9faf6]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#c1ecd4] text-[#002114] flex items-center justify-center font-bold">
              <Bell className="w-4 h-4 text-[#012d1d]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#012d1d]">Notifications & Alerts</h3>
              <p className="text-[11px] text-[#717973]">
                {notifications.length} message{notifications.length !== 1 ? 's' : ''} received
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[11px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 p-1.5 rounded-lg transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#717973] hover:bg-[#eeeeeb] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-[#f3f4f1] text-[#717973] flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#012d1d]">No new notifications</p>
              <p className="text-xs text-[#717973] mt-1 max-w-[220px] mx-auto">
                You will receive live token confirmations, queue advancements, and arrival alerts here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-white border-[#eeeeeb] text-[#414844]'
                    : 'bg-[#f3f9f5] border-[#2c694e]/30 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#2c694e] shrink-0"></span>
                    )}
                    <h4 className="font-bold text-xs text-[#012d1d]">{notif.title}</h4>
                  </div>
                  <span className="text-[10px] text-[#717973] flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {notif.createdAt}
                  </span>
                </div>

                <p className="text-xs text-[#414844] mt-1 leading-relaxed">{notif.message}</p>

                {/* Notification Footer Action Bar */}
                <div className="mt-3 pt-2 border-t border-[#eeeeeb]/70 flex items-center justify-between text-[11px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSMS(notif);
                    }}
                    className="flex items-center gap-1 text-[#2c694e] font-semibold hover:underline"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>View SMS Format</span>
                  </button>

                  {notif.tokenId && onNavigateToToken && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onNavigateToToken();
                      }}
                      className="flex items-center gap-1 text-[#012d1d] font-bold hover:underline"
                    >
                      <Ticket className="w-3.5 h-3.5 text-[#2c694e]" />
                      <span>Track Token</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* SMS Simulation Dialog Modal */}
        {selectedSMS && (
          <div className="p-4 bg-[#f9faf6] border-t border-[#c1c8c2]/50 animate-in fade-in">
            <div className="bg-[#1a1c1a] text-white p-3.5 rounded-2xl shadow-xl font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-700 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  SMS to {currentUser.mobile}
                </span>
                <button
                  onClick={() => setSelectedSMS(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-2.5 whitespace-pre-line text-emerald-300 leading-relaxed">
                {createSMSMessage(selectedSMS, currentUser.mobile)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { motion } from 'framer-motion';

export function NotificationCenter({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  // Default to Admin if no email is provided, but typically passed via props
  const currentUserEmail = userEmail || 'admin@sned-link.edu';

  // Fetch the feed from the backend
  const fetchFeed = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/feed?email=${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      setNotifications([]);
      console.error('Error fetching notification feed:', error);
    }
  };

  // Polling: Check for new notifications every 30 seconds
  useEffect(() => {
    if (currentUserEmail) fetchFeed();
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, [currentUserEmail]);

  return (
    <Popover.Root onOpenChange={(open) => open && currentUserEmail && fetchFeed()}>
      {/* 
        The 'asChild' prop is critical here. It passes the Popover click events 
        directly to our button, fixing interactivity issues.
      */}
      <Popover.Trigger asChild>
        <motion.button 
          className={`relative p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 ${
            notifications.length > 0 
              ? 'bg-red-50 hover:bg-red-100 text-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          animate={notifications.length > 0 ? {
            boxShadow: [
              "0 0 0px rgba(220,38,38,0)",
              "0 0 20px rgba(220,38,38,0.4)",
              "0 0 0px rgba(220,38,38,0)"
            ]
          } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <motion.div
            animate={notifications.length > 0 ? {
              rotate: [0, -15, 15, -15, 15, 0],
            } : {}}
            transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 4 }}
          >
            <Bell size={24} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
            )}
          </motion.div>
        </motion.button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content 
          className="z-[9999] w-80 bg-white shadow-lg border p-4 rounded-md animate-in fade-in zoom-in duration-200"
          sideOffset={5}
        >
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            <h3 className="font-bold uppercase text-[10px] tracking-widest text-slate-500">
              {currentUserEmail === 'admin@sned-link.edu' ? 'Admin Hub' : 'Notifications'}
            </h3>
            <span className="text-[9px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-400">
              {currentUserEmail}
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No new notifications.</p>
            ) : (
              notifications.map((n, index) => (
                <div key={n.id || index} className="text-sm border-b py-2 last:border-0">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-xs text-gray-600">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">From: {n.from}</p>
                </div>
              ))
            )}
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

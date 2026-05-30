"use client";

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationCenter() {
    const [unreadCount] = useState(0);

    // Placeholder component for now
    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-muted"
            title="Notifications (Coming Soon)"
        >
            <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'fill-current text-primary' : 'text-muted-foreground'}`} />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background animate-pulse" />
            )}
        </Button>
    );
}

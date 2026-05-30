"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ordersApi } from "@/lib/api";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  User,
  RefreshCw,
  XCircle,
  CreditCard,
  FileCheck,
} from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface OrderEvent {
  id: string;
  event_type: string; // status_change, payment, shipment, delivery, dispute, note
  title: string;
  description: string | null;
  previous_status: string | null;
  new_status: string | null;
  actor_id: string | null;
  actor_name: string | null;
  actor_type: string | null; // buyer, seller, admin, system, logistics
  location: string | null;
  timestamp: string;
  estimated_next_at: string | null;
}

interface OrderHistoryResponse {
  order_id: string;
  current_status: string;
  total_events: number;
  timeline: OrderEvent[];
}

interface OrderTimelineProps {
  orderId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  onStatusChange?: (newStatus: string) => void;
}

// =============================================================================
// Constants
// =============================================================================

const STATUS_ORDER = [
  "created",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "completed",
];

const STATUS_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  created: {
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  confirmed: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  processing: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  shipped: {
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  delivered: {
    icon: MapPin,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  completed: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

const EVENT_TYPE_ICONS: Record<string, React.ElementType> = {
  status_change: CheckCircle,
  payment: CreditCard,
  shipment: Truck,
  delivery: MapPin,
  dispute: AlertCircle,
  note: FileCheck,
};

// =============================================================================
// Helper Functions
// =============================================================================

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatTimestamp(timestamp);
}

function getActorLabel(actorType: string | null): string {
  switch (actorType) {
    case "buyer":
      return "Buyer";
    case "seller":
      return "Seller";
    case "admin":
      return "Admin";
    case "system":
      return "System";
    case "logistics":
      return "Logistics";
    default:
      return "";
  }
}

// =============================================================================
// Status Progress Bar
// =============================================================================

function StatusProgressBar({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center py-4">
        <Badge variant="destructive" className="text-sm px-4 py-2">
          <XCircle className="h-4 w-4 mr-2" />
          Order Cancelled
        </Badge>
      </div>
    );
  }

  return (
    <div className="relative py-4">
      {/* Progress line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded -translate-y-1/2" />
      <div
        className="absolute top-1/2 left-0 h-1 bg-green-500 rounded -translate-y-1/2 transition-all duration-500"
        style={{
          width: `${(currentIndex / (STATUS_ORDER.length - 1)) * 100}%`,
        }}
      />

      {/* Status dots */}
      <div className="relative flex justify-between">
        {STATUS_ORDER.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const config = STATUS_CONFIG[status];
          const Icon = config?.icon || CheckCircle;

          return (
            <div key={status} className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center z-10
                  transition-all duration-300
                  ${isCompleted ? config?.bgColor || "bg-green-100" : "bg-gray-100"}
                  ${isCurrent ? "ring-2 ring-offset-2 ring-green-500" : ""}
                `}
              >
                <Icon
                  className={`h-4 w-4 ${isCompleted ? config?.color || "text-green-600" : "text-gray-400"}`}
                />
              </div>
              <span
                className={`
                mt-2 text-xs font-medium capitalize
                ${isCurrent ? "text-green-600" : isCompleted ? "text-gray-700" : "text-gray-400"}
              `}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Timeline Event Item
// =============================================================================

function TimelineEventItem({
  event,
  isLast,
}: {
  event: OrderEvent;
  isLast: boolean;
}) {
  const config =
    STATUS_CONFIG[event.new_status || "created"] || STATUS_CONFIG.created;
  const EventIcon =
    EVENT_TYPE_ICONS[event.event_type] || EVENT_TYPE_ICONS.status_change;

  return (
    <div className="relative flex gap-4">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Icon */}
      <div
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor}`}
      >
        <EventIcon className={`h-4 w-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{event.title}</h4>
            {event.description && (
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            )}
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
            {formatTimeAgo(event.timestamp)}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mt-2">
          {event.actor_type && (
            <Badge variant="outline" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              {getActorLabel(event.actor_type)}
              {event.actor_name && `: ${event.actor_name}`}
            </Badge>
          )}
          {event.location && (
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {event.location}
            </Badge>
          )}
          {event.new_status && event.previous_status && (
            <Badge variant="secondary" className="text-xs">
              {event.previous_status} → {event.new_status}
            </Badge>
          )}
        </div>

        {/* Estimated next time */}
        {event.estimated_next_at && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Estimated next: {formatTimestamp(event.estimated_next_at)}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function OrderTimeline({
  orderId,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds default
  onStatusChange,
}: OrderTimelineProps) {
  const [history, setHistory] = useState<OrderHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await ordersApi.getHistory(orderId);
      setHistory(data);
      setError(null);

      // Check for status change
      if (lastStatus && data.current_status !== lastStatus) {
        onStatusChange?.(data.current_status);
      }
      setLastStatus(data.current_status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [orderId, lastStatus, onStatusChange]);

  // Initial fetch
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchHistory, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchHistory]);

  const handleManualRefresh = () => {
    setLoading(true);
    fetchHistory();
  };

  if (loading && !history) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error && !history) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleManualRefresh} className="mt-4" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!history) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                history.current_status === "completed" ? "default" : "secondary"
              }
              className="capitalize"
            >
              {history.current_status}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleManualRefresh}
              disabled={loading}
              className="h-8 w-8"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <StatusProgressBar currentStatus={history.current_status} />

        {/* Timeline */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Activity ({history.total_events} events)
          </h4>
          <div className="space-y-0">
            {history.timeline
              .slice()
              .reverse()
              .map((event, index) => (
                <TimelineEventItem
                  key={event.id}
                  event={event}
                  isLast={index === history.timeline.length - 1}
                />
              ))}
          </div>
        </div>

        {/* Auto-refresh indicator */}
        {autoRefresh && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            Auto-refreshing every {refreshInterval / 1000}s
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OrderTimeline;

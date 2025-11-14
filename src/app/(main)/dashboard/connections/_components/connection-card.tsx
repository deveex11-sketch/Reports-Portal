"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { SocialPlatform } from "./connections-list";

interface ConnectionCardProps {
  platform: SocialPlatform;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

export function ConnectionCard({
  platform,
  isConnected,
  onConnect,
  onDisconnect,
  onRefresh,
}: ConnectionCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // This will redirect to OAuth flow
      await onConnect();
    } catch (error) {
      toast.error(`Failed to connect ${platform.name}`);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect();
      toast.success(`${platform.name} disconnected successfully`);
    } catch (error) {
      toast.error(`Failed to disconnect ${platform.name}`);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success(`${platform.name} connection refreshed`);
    } catch (error) {
      toast.error(`Failed to refresh ${platform.name} connection`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get platform icon - using simple-icons or lucide-react
  const PlatformIcon = ({ className }: { className?: string }) => {
    // In a real implementation, you'd use simple-icons or custom icons
    // For now, using a generic icon
    return (
      <div 
        className={className}
        style={{ backgroundColor: platform.color }}
      >
        <span className="text-white font-bold text-xs">
          {platform.name.charAt(0)}
        </span>
      </div>
    );
  };

  return (
    <Card className="shadow-xs hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${platform.color}15` }}
            >
              <PlatformIcon className="size-6 rounded" />
            </div>
            <div>
              <CardTitle className="text-lg">{platform.name}</CardTitle>
              {isConnected && (
                <Badge variant="outline" className="mt-1 gap-1 text-xs">
                  <CheckCircle2 className="size-3 text-green-600" />
                  Connected
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardDescription className="mt-2">
          {platform.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && platform.connectedAccount ? (
          <>
            {/* Connected Account Info */}
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
              <Avatar className="size-8">
                <AvatarImage 
                  src={platform.connectedAccount.profileImage} 
                  alt={platform.connectedAccount.username}
                />
                <AvatarFallback>
                  {platform.connectedAccount.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {platform.connectedAccount.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  Connected {new Date(platform.connectedAccount.connectedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Refresh
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect {platform.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to disconnect your {platform.name} account? 
                      You'll need to reconnect it to schedule posts to this platform.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDisconnect}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        ) : (
          <>
            {/* Not Connected State */}
            <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-center">
              <AlertCircle className="mx-auto mb-2 size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Not connected
              </p>
            </div>

            {/* Connect Button */}
            <Button
              className="w-full gap-2"
              onClick={handleConnect}
              disabled={isConnecting}
              style={{ backgroundColor: isConnecting ? undefined : platform.color }}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="size-4" />
                  Connect {platform.name}
                </>
              )}
            </Button>
          </>
        )}

        {/* API Info Link */}
        <div className="pt-2 border-t">
          <a
            href={platform.developerPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="size-3" />
            <span>{platform.apiName} Documentation</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}


"use client";

import { useState } from "react";
import { ConnectionCard } from "./connection-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react or simple-icons
  color: string;
  description: string;
  isConnected: boolean;
  connectedAccount?: {
    username: string;
    profileImage?: string;
    connectedAt: string;
  };
  apiName: string; // For API reference
  developerPortal: string;
}

// Mock data - Replace with real data from your backend
const platforms: SocialPlatform[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: "Facebook",
    color: "#1877F2",
    description: "Connect your Facebook page to schedule posts and access insights",
    isConnected: false,
    apiName: "Facebook Graph API",
    developerPortal: "https://developers.facebook.com",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "Instagram",
    color: "#E4405F",
    description: "Schedule posts, stories, and reels to your Instagram account",
    isConnected: false,
    apiName: "Instagram Graph API",
    developerPortal: "https://developers.facebook.com/docs/instagram-api",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: "Twitter",
    color: "#000000",
    description: "Post tweets, threads, and manage your X account",
    isConnected: false,
    apiName: "Twitter API v2",
    developerPortal: "https://developer.twitter.com",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "Linkedin",
    color: "#0A66C2",
    description: "Share professional content and connect with your network",
    isConnected: false,
    apiName: "LinkedIn API",
    developerPortal: "https://www.linkedin.com/developers",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "Tiktok",
    color: "#000000",
    description: "Schedule and manage your TikTok content",
    isConnected: false,
    apiName: "TikTok Marketing API",
    developerPortal: "https://developers.tiktok.com",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "Youtube",
    color: "#FF0000",
    description: "Schedule video uploads and manage your YouTube channel",
    isConnected: false,
    apiName: "YouTube Data API v3",
    developerPortal: "https://developers.google.com/youtube",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "Pinterest",
    color: "#BD081C",
    description: "Schedule pins and manage your Pinterest boards",
    isConnected: false,
    apiName: "Pinterest API",
    developerPortal: "https://developers.pinterest.com",
  },
  {
    id: "threads",
    name: "Threads",
    icon: "Threads",
    color: "#000000",
    description: "Connect your Threads account to schedule posts",
    isConnected: false,
    apiName: "Threads API (via Instagram Graph API)",
    developerPortal: "https://developers.facebook.com/docs/threads",
  },
];

export function ConnectionsList() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(new Set());

  const handleConnect = async (platformId: string) => {
    // This will trigger OAuth flow
    // For now, just update local state
    window.location.href = `/api/auth/${platformId}`;
  };

  const handleDisconnect = async (platformId: string) => {
    // Call API to disconnect
    setConnectedPlatforms((prev) => {
      const next = new Set(prev);
      next.delete(platformId);
      return next;
    });
  };

  const handleRefresh = async (platformId: string) => {
    // Refresh the connection/token
    // Call API to refresh
  };

  const connectedCount = connectedPlatforms.size;
  const totalCount = platforms.length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Manage your social media account connections
              </CardDescription>
            </div>
            {connectedCount > 0 && (
              <Badge variant="outline" className="gap-2">
                <CheckCircle2 className="size-3" />
                {connectedCount} of {totalCount} connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {connectedCount === 0 ? (
              <p>No accounts connected yet. Connect your first account to get started.</p>
            ) : (
              <p>
                You have {connectedCount} {connectedCount === 1 ? "account" : "accounts"} connected. 
                Connect more platforms to expand your reach.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => (
          <ConnectionCard
            key={platform.id}
            platform={platform}
            isConnected={connectedPlatforms.has(platform.id)}
            onConnect={() => handleConnect(platform.id)}
            onDisconnect={() => handleDisconnect(platform.id)}
            onRefresh={() => handleRefresh(platform.id)}
          />
        ))}
      </div>

      {/* Help Section */}
      <Card className="shadow-xs border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
          <CardDescription>
            Having trouble connecting an account? Check our documentation or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm">
            <a href="#" className="text-primary hover:underline">
              View Connection Guide →
            </a>
            <a href="#" className="text-primary hover:underline">
              Troubleshooting Tips →
            </a>
            <a href="#" className="text-primary hover:underline">
              Contact Support →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


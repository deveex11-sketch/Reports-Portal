"use client";

import { ConnectionsList } from "./_components/connections-list";

export default function ConnectionsPage() {
  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Connections</h1>
        <p className="text-muted-foreground">
          Connect your social media accounts to schedule posts, track analytics, and manage your content across all platforms.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <ConnectionsList />
      </div>
    </div>
  );
}


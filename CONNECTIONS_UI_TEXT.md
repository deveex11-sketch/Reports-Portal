# Connections Feature - UI Text & Prompts Reference

This document contains all user-facing text for the Connections feature in Post Dominator.

---

## Main Page

### Page Title
**Text**: `Connections`

### Page Subtitle/Description
**Text**: `Connect your social media accounts to schedule posts, track analytics, and manage your content across all platforms.`

---

## Summary Card

### Card Title
**Text**: `Connected Accounts`

### Card Description
**Text**: `Manage your social media account connections`

### Connection Status Badge (when accounts are connected)
**Text**: `{count} of {total} connected`
**Example**: `3 of 8 connected`

### Empty State Message
**Text**: `No accounts connected yet. Connect your first account to get started.`

### Connected State Message
**Text**: `You have {count} {account/accounts} connected. Connect more platforms to expand your reach.`
**Example**: `You have 3 accounts connected. Connect more platforms to expand your reach.`

---

## Platform Connection Cards

### Facebook Card

**Platform Name**: `Facebook`

**Description**: `Connect your Facebook page to schedule posts and access insights`

**Connect Button**: `Connect Facebook`

**Connected Badge**: `Connected` (with checkmark icon)

**Not Connected State**: 
- Icon: Alert circle
- Text: `Not connected`

**Connected Account Display**:
- Shows profile image/avatar
- Username: `{username}`
- Connection date: `Connected {date}`
- Example: `Connected 12/15/2024`

**Action Buttons**:
- Refresh: `Refresh` (with refresh icon)
- Disconnect: Trash icon button

**Disconnect Dialog**:
- Title: `Disconnect Facebook?`
- Description: `Are you sure you want to disconnect your Facebook account? You'll need to reconnect it to schedule posts to this platform.`
- Cancel Button: `Cancel`
- Confirm Button: `Disconnect`

**API Documentation Link**: `Facebook Graph API Documentation`

---

### Instagram Card

**Platform Name**: `Instagram`

**Description**: `Schedule posts, stories, and reels to your Instagram account`

**Connect Button**: `Connect Instagram`

**All other text follows the same pattern as Facebook**

**API Documentation Link**: `Instagram Graph API Documentation`

---

### X (Twitter) Card

**Platform Name**: `X (Twitter)`

**Description**: `Post tweets, threads, and manage your X account`

**Connect Button**: `Connect X (Twitter)`

**All other text follows the same pattern as Facebook**

**API Documentation Link**: `Twitter API v2 Documentation`

---

### LinkedIn Card

**Platform Name**: `LinkedIn`

**Description**: `Share professional content and connect with your network`

**Connect Button**: `Connect LinkedIn`

**All other text follows the same pattern as Facebook**

**API Documentation Link**: `LinkedIn API Documentation`

---

### TikTok Card

**Platform Name**: `TikTok`

**Description**: `Schedule and manage your TikTok content`

**Connect Button**: `Connect TikTok`

**All other text follows the same pattern as Facebook**

**API Documentation Link**: `TikTok Marketing API Documentation`

---

### YouTube Card

**Platform Name**: `YouTube`

**Description**: `Schedule video uploads and manage your YouTube channel`

**Connect Button**: `Connect YouTube`

**All other text follows the same pattern as Facebook**

**API Documentation Link**: `YouTube Data API v3 Documentation`

---

### Pinterest Card

**Platform Name**: `Pinterest`

**Description**: `Schedule pins and manage your Pinterest boards`

**Connect Button**: `Connect Pinterest`

**All other text follows the same pattern as Facebook**

**API Documentation Link**: `Pinterest API Documentation`

---

### Threads Card

**Platform Name**: `Threads`

**Description**: `Connect your Threads account to schedule posts`

**Connect Button**: `Connect Threads`

**All other text follows the same pattern as Facebook**

**API Documentation Link**: `Threads API (via Instagram Graph API) Documentation`

---

## Connection States

### Connecting State
**Button Text**: `Connecting...` (with loading spinner)
**Button State**: Disabled

### Connected State
- Badge: `Connected` (green checkmark)
- Account info displayed
- Refresh and Disconnect buttons visible

### Not Connected State
- Alert icon displayed
- Text: `Not connected`
- Connect button visible

---

## Help Section

### Help Card Title
**Text**: `Need Help?`

### Help Card Description
**Text**: `Having trouble connecting an account? Check our documentation or contact support.`

### Help Links
1. **Text**: `View Connection Guide →`
2. **Text**: `Troubleshooting Tips →`
3. **Text**: `Contact Support →`

---

## Toast Notifications

### Success Messages
- **Connection Success**: `{Platform} connected successfully`
  - Example: `Facebook connected successfully`
  
- **Disconnect Success**: `{Platform} disconnected successfully`
  - Example: `Facebook disconnected successfully`
  
- **Refresh Success**: `{Platform} connection refreshed`
  - Example: `Facebook connection refreshed`

### Error Messages
- **Connection Failed**: `Failed to connect {Platform}`
  - Example: `Failed to connect Facebook`
  
- **Disconnect Failed**: `Failed to disconnect {Platform}`
  - Example: `Failed to disconnect Facebook`
  
- **Refresh Failed**: `Failed to refresh {Platform} connection`
  - Example: `Failed to refresh Facebook connection`

### Validation Errors
- **Missing Accounts**: `Please select at least one account`
- **Missing Content**: `Please add content or media before posting`
- **Invalid Date**: `Please select a future date and time`

---

## URL Query Parameters

### Success Parameter
**URL**: `/dashboard/connections?success=true`
**Display**: Show success toast notification

### Error Parameters
**URL**: `/dashboard/connections?error={error_code}`

**Error Codes**:
- `missing_parameters` - Missing OAuth parameters
- `invalid_state` - CSRF state mismatch
- `connection_failed` - General connection failure
- `{platform}_error` - Platform-specific error (from OAuth provider)

---

## Loading States

### Button Loading
- **Text**: `Connecting...` or `Refreshing...`
- **Icon**: Spinning loader icon
- **State**: Button disabled

### Page Loading
- Show skeleton loaders for connection cards
- Show loading spinner in center if needed

---

## Accessibility

### ARIA Labels
- Connect buttons: `Connect {Platform} account`
- Disconnect buttons: `Disconnect {Platform} account`
- Refresh buttons: `Refresh {Platform} connection`
- Connection status: `{Platform} account status: {connected/not connected}`

### Screen Reader Text
- Connection count: `{count} of {total} social media accounts connected`
- Platform status: `{Platform} is {connected/not connected}`

---

## Empty States

### No Connections
**Icon**: Alert circle or plug icon
**Title**: `No accounts connected`
**Description**: `Connect your first social media account to start scheduling posts.`
**Action**: Show connect buttons for all platforms

### Connection Error
**Icon**: Alert triangle
**Title**: `Connection Failed`
**Description**: `We couldn't connect your {Platform} account. Please try again.`
**Action**: `Retry Connection` button

---

## Notes for Implementation

1. **Date Formatting**: Use locale-aware date formatting
   - Example: `Connected December 15, 2024` or `Connected 12/15/2024`

2. **Platform Names**: Use official platform names
   - "X (Twitter)" for Twitter/X
   - Full names for clarity

3. **Button States**: Always show loading state during async operations

4. **Error Handling**: Provide specific, actionable error messages

5. **Success Feedback**: Use toast notifications for all success actions

6. **Confirmation Dialogs**: Always confirm destructive actions (disconnect)

---

## Localization Considerations

If you plan to support multiple languages, all these strings should be:
- Extracted to a translation file
- Use proper pluralization rules
- Consider RTL languages for layout

---

**Last Updated**: December 2024


# Chat Notification Fix

**Date:** October 20, 2025  
**Component:** TeamChat  
**Issue:** Chat notification badge not disappearing after reading messages

## Problem Description

The chat notification badge showing the count of unread messages (e.g., "2 new messages") on channels did not disappear after the user clicked on the channel and read the messages. This caused confusion as users couldn't tell if there were actually unread messages remaining.

### Steps to Reproduce

1. Receive new messages in a chat channel until the notification badge appears (e.g., showing "2")
2. Click on the channel to open and read all messages
3. Observe that the notification badge remains visible

### Expected Behavior

The notification badge should immediately disappear when the user clicks on the channel, indicating that all messages have been read.

## Root Cause

In the `TeamChat.tsx` component, when a user clicked on a channel (lines 591-594 in the original code), the component:

- Set the selected channel
- Set the selected conversation to null

However, it did NOT reset the `unreadCount` property to 0, which is what drives the visibility of the notification badge.

Interestingly, the same functionality for direct message conversations (lines 633-640 in the original code) DID properly reset the `unreadCount` when clicked.

## Solution

The fix adds the same logic used for conversations to the channel click handler. When a channel is clicked, we now:

1. Set the selected channel
2. Set the selected conversation to null
3. **NEW:** Update the channels state to set `unreadCount` to 0 for the clicked channel

### Code Changes

**File:** `src/components/TeamChat.tsx`

```typescript
onClick={() => {
  setSelectedChannel(channel);
  setSelectedConversation(null);
  // Mark channel messages as read
  setChannels((prev) =>
    prev.map((ch) =>
      ch.id === channel.id ? { ...ch, unreadCount: 0 } : ch
    )
  );
}}
```

This pattern matches the existing implementation for conversations:

```typescript
onClick={() => {
  setSelectedConversation(conversation);
  setSelectedChannel(null);
  // Mark as read
  setConversations((prev) =>
    prev.map((conv) =>
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    )
  );
}}
```

## Impact

- **User Experience:** Users can now accurately see which channels have unread messages
- **Consistency:** Channel behavior now matches conversation behavior
- **Code Quality:** The fix is minimal (5 lines) and follows existing patterns
- **No Breaking Changes:** All existing functionality remains intact

## Testing

### Manual Testing Steps

1. **Setup:** Navigate to the Chat section in the application
2. **Initial State:** Verify that a channel shows an unread count badge (mock data initializes channel #2 "księgowość" with `unreadCount: 2`)
3. **Test:** Click on the channel with unread messages
4. **Verify:** The notification badge should immediately disappear
5. **Regression Test:** Test direct messages to ensure they still work correctly

### Expected Results

- ✅ Channel notification badge disappears when channel is clicked
- ✅ Conversation notification badge still disappears when conversation is clicked
- ✅ Badge reappears if new messages arrive while viewing a different channel

## Technical Notes

- The component uses React state management (`useState`, `setChannels`)
- The `unreadCount` property is optional (`unreadCount?: number`) on the `ChatChannel` interface
- The badge is conditionally rendered: `{channel.unreadCount && channel.unreadCount > 0 && ...}`
- No backend changes required; this is purely a frontend state management issue

## Related Files

- `/src/components/TeamChat.tsx` - Main component with the fix
- `/src/types/client.ts` - Type definitions for `ChatChannel` and `Conversation`
- `/src/components/AdvancedChat.tsx` - Alternative chat component (does not display channel unread counts)

## Future Improvements

While this fix addresses the immediate issue, potential enhancements could include:

1. **Backend Persistence:** Store read/unread state on the server
2. **Real-time Updates:** Use WebSockets to update unread counts in real-time
3. **Mark as Unread:** Allow users to manually mark channels/conversations as unread
4. **Read Receipts:** Show which users have read which messages

## References

- GitHub Issue: [Link to issue]
- Pull Request: [Link to PR]
- Related Components: TeamChat, AdvancedChat, Chat

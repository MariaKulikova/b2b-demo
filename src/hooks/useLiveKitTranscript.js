import { useChat, useRoomContext, useTranscriptions } from '@livekit/components-react';
import { transcriptionToChatMessage } from '../utils/livekit';

const useLiveKitTranscript = () => {
  const room = useRoomContext();
  const chat = useChat();
  const transcriptions = useTranscriptions();

  if (!room) {
    return [];
  }

  const transcriptEntries = [
    ...transcriptions.map((item) => transcriptionToChatMessage(item, room)),
    ...chat.chatMessages,
  ];

  const deduped = new Map();
  for (const entry of transcriptEntries) {
    if (entry?.id) {
      deduped.set(entry.id, entry);
    }
  }

  return Array.from(deduped.values())
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    .map((entry) => {
      const isLocal = entry?.from?.identity === room.localParticipant?.identity;
      const timestamp =
        typeof entry?.timestamp === 'number' ? new Date(entry.timestamp) : new Date();

      return {
        id: entry?.id ?? `${timestamp.getTime()}-${Math.random()}`,
        role: isLocal ? 'user' : 'ai',
        text: entry?.message ?? '',
        timestamp,
      };
    });
};

export default useLiveKitTranscript;

export const transcriptionToChatMessage = (textStream, room) => {
  if (!textStream || !room) {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      timestamp: Date.now(),
      message: '',
      from: null,
    };
  }

  const streamId = textStream.streamInfo?.id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`);
  const timestamp = textStream.streamInfo?.timestamp || Date.now();

  const participantIdentity = textStream.participantInfo?.identity;
  const localIdentity = room.localParticipant?.identity;

  let fromParticipant = null;
  if (participantIdentity && localIdentity && participantIdentity === localIdentity) {
    fromParticipant = room.localParticipant;
  } else if (participantIdentity) {
    fromParticipant = Array.from(room.remoteParticipants.values()).find(
      (participant) => participant.identity === participantIdentity
    );
  }

  return {
    id: streamId,
    timestamp,
    message: textStream.text || '',
    from: fromParticipant,
  };
};

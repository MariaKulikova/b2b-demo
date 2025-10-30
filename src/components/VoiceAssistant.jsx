import ElevenLabsAssistant from './ElevenLabsAssistant';
import LiveKitAssistant from './LiveKitAssistant';

const resolveProvider = () => {
  const provider = (import.meta.env.VITE_VOICE_ASSISTANT_PROVIDER || 'livekit').trim().toLowerCase();
  console.warn(`[VoiceAssistant] got provider: "${provider}"`);
  if (provider === 'livekit') {
    return 'livekit';
  }
  if (provider === 'elevenlabs') {
    return 'elevenlabs';
  }

  console.warn(`[VoiceAssistant] Unsupported provider "${provider}", falling back to ElevenLabs`);
  return 'elevenlabs';
};

const VoiceAssistant = () => {
  const provider = resolveProvider();
  if (provider === 'livekit') {
    return <LiveKitAssistant />;
  }
  return <ElevenLabsAssistant />;
};

export default VoiceAssistant;

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, X, Phone, MessageSquare } from 'lucide-react';
import { Track } from 'livekit-client';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  useRoomContext,
  useTrackToggle,
  useVoiceAssistant as useLiveKitVoiceAssistant,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Button } from './ui/button';
import { Orb } from './ui/orb';
import TranscriptModal from './TranscriptModal';
import { useVoiceAssistant as useVoiceAssistantContext } from '../context/VoiceAssistantContext';
import useLiveKitConnection from '../hooks/useLiveKitConnection';
import useLiveKitTranscript from '../hooks/useLiveKitTranscript';
import { getOrCreateSessionId, refreshSession } from '../services/sessionManager';

const LiveKitAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionState, setSessionState] = useState({
    status: 'disconnected',
    isSpeaking: false,
    isMuted: false,
    micPending: false,
  });
  const [controls, setControls] = useState({
    toggleMute: async () => {},
    endCall: async () => {},
  });
  const [connectionError, setConnectionError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const { setOpenHandler } = useVoiceAssistantContext();
  const {
    connectionDetails,
    ensureConnectionDetails,
    refreshConnectionDetails,
    isLoading: isFetchingDetails,
  } = useLiveKitConnection();

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    setConnectionError(null);
    setIsInitializing(true);

    try {
      const id = getOrCreateSessionId();
      setSessionId(id);
      refreshSession();
      await ensureConnectionDetails();
      setShouldConnect(true);
    } catch (error) {
      console.error('[LiveKitAssistant] Unable to load LiveKit connection details:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
      setShouldConnect(false);
    } finally {
      setIsInitializing(false);
    }
  }, [ensureConnectionDetails]);

  const resetState = useCallback(() => {
    setShouldConnect(false);
    setSessionState({
      status: 'disconnected',
      isSpeaking: false,
      isMuted: false,
      micPending: false,
    });
    setMessages([]);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    setIsOpen(false);
  }, [resetState]);

  useEffect(() => {
    setOpenHandler(handleOpen);
  }, [handleOpen, setOpenHandler]);

  const handleMuteToggle = useCallback(async () => {
    try {
      await controls.toggleMute();
    } catch (error) {
      console.error('[LiveKitAssistant] Failed to toggle microphone:', error);
    }
  }, [controls]);

  const handleEnd = useCallback(async () => {
    try {
      await controls.endCall();
    } catch (error) {
      console.error('[LiveKitAssistant] Error ending LiveKit session:', error);
    } finally {
      handleClose();
    }
  }, [controls, handleClose]);

  const getStatusText = useCallback(() => {
    if (connectionError) {
      return 'Unable to connect to AI Voice Assistant';
    }

    if (!isOpen) {
      return 'Click to talk with our AI assistant';
    }

    if (sessionState.status === 'connected') {
      if (sessionState.isMuted) {
        return 'Microphone muted';
      }
      return sessionState.isSpeaking ? 'AI is speaking...' : 'Listening...';
    }

    if (
      sessionState.status === 'connecting' ||
      shouldConnect ||
      isInitializing ||
      isFetchingDetails
    ) {
      return 'Connecting to LiveKit agent...';
    }

    return 'Ready';
  }, [
    connectionError,
    isFetchingDetails,
    isInitializing,
    isOpen,
    sessionState.isMuted,
    sessionState.isSpeaking,
    sessionState.status,
    shouldConnect,
  ]);

  const getOrbColor = () => {
    if (connectionError) return '#ef4444';
    if (sessionState.isMuted) return '#ef4444';
    if (sessionState.isSpeaking) return '#3b82f6';
    if (sessionState.status === 'connected') return '#2563eb';
    return '#64748b';
  };

  const handleRoomConnected = useCallback(async (room) => {
    try {
      await room.localParticipant.setMicrophoneEnabled(true);
      if (sessionId) {
        await room.localParticipant.setMetadata(JSON.stringify({ sessionId }));
        refreshSession();
      }
    } catch (error) {
      console.error('[LiveKitAssistant] Failed to enable microphone:', error);
    }
  }, [sessionId]);

  const handleRoomDisconnected = useCallback(() => {
    resetState();
    setIsOpen(false);

    refreshConnectionDetails().catch((error) => {
      console.warn('[LiveKitAssistant] Failed to refresh LiveKit connection details:', error);
    });
  }, [refreshConnectionDetails, resetState]);

  const isConnected = sessionState.status === 'connected';

  const recentMessages = useMemo(() => messages.slice(-3), [messages]);

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 left-6 z-50 group">
          <Button
            onClick={handleOpen}
            className="rounded-full w-14 h-14 p-0 shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Open voice assistant"
          >
            <Mic className="h-6 w-6" />
          </Button>
          <span className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-sm rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Talk to our AI assistant
          </span>
        </div>
      )}

      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-7xl bg-white z-50 transition-transform duration-300 ease-in-out rounded-t-3xl ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)' }}
      >
        <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-gray-200 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <Orb
                  isActive={sessionState.status === 'connected'}
                  isSpeaking={sessionState.isSpeaking}
                  color={getOrbColor()}
                  size={40}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                  AI Voice Assistant
                </h3>
                <p className="text-xs text-gray-600 truncate">{getStatusText()}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      sessionState.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-xs text-gray-600">Connected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      sessionState.isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-xs text-gray-600">Speaking</span>
                </div>
              </div>

              {isConnected && (
                <Button
                  onClick={handleMuteToggle}
                  size="sm"
                  variant="outline"
                  disabled={sessionState.micPending}
                  className={`px-2 sm:px-2.5 ${
                    sessionState.isMuted ? 'bg-red-50 hover:bg-red-100 border-red-300' : ''
                  }`}
                  aria-label={sessionState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  title={sessionState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {sessionState.isMuted ? (
                    <MicOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                  ) : (
                    <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                </Button>
              )}

              {isConnected && messages.length > 0 && (
                <>
                  <Button
                    onClick={() => setShowFullTranscript(true)}
                    size="sm"
                    variant="outline"
                    className="gap-1 hidden sm:flex"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Transcript</span> ({messages.length})
                  </Button>
                  <Button
                    onClick={() => setShowFullTranscript(true)}
                    size="sm"
                    variant="outline"
                    className="sm:hidden px-2"
                    aria-label="Transcript"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}

              {sessionState.status !== 'disconnected' && (
                <Button
                  onClick={handleEnd}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Phone className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">End Call</span>
                </Button>
              )}

              <Button
                onClick={handleEnd}
                variant="outline"
                size="sm"
                className="px-2 sm:px-2.5"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {connectionError && (
            <div className="px-3 sm:px-6 py-2.5 bg-red-50 border-t border-red-100 text-xs text-red-700">
              {connectionError}
            </div>
          )}

          {isConnected && messages.length > 0 && (
            <div className="py-3 sm:py-4 bg-gray-50 border-t border-gray-200 max-h-28 sm:max-h-32 overflow-y-auto">
              <div className="space-y-2 sm:space-y-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-lg shadow-sm"
                  >
                    <span
                      className={`text-xs font-semibold flex-shrink-0 ${
                        msg.role === 'user' ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      {msg.role === 'user' ? 'You:' : 'AI:'}
                    </span>
                    <span className="text-xs text-gray-700 line-clamp-2">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sessionState.status === 'disconnected' && isOpen && !connectionError && (
            <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-blue-50 border-t border-blue-100">
              <p className="text-xs text-blue-800">
                {isInitializing || shouldConnect || isFetchingDetails
                  ? 'Preparing LiveKit connection...'
                  : 'Microphone access is required for voice conversations.'}
              </p>
            </div>
          )}
        </div>

        {isOpen && connectionDetails && (
          <LiveKitRoom
            serverUrl={connectionDetails.serverUrl}
            token={connectionDetails.participantToken}
            connect={shouldConnect}
            audio
            video={false}
            onConnected={handleRoomConnected}
            onDisconnected={handleRoomDisconnected}
          >
            <RoomAudioRenderer />
            <StartAudio label="Start Audio" />
            <LiveKitSession
              onSessionState={setSessionState}
              onMessagesChange={setMessages}
              onControlsReady={setControls}
              onEnd={handleClose}
              sessionId={sessionId}
            />
          </LiveKitRoom>
        )}
      </div>

      <TranscriptModal
        isOpen={showFullTranscript}
        onClose={() => setShowFullTranscript(false)}
        messages={messages}
      />
    </>
  );
};

const LiveKitSession = ({ onSessionState, onMessagesChange, onControlsReady, onEnd, sessionId }) => {
  const room = useRoomContext();
  const { state: agentState } = useLiveKitVoiceAssistant();
  const {
    enabled: micEnabled,
    pending: micPending,
    toggle: toggleMicrophone,
  } = useTrackToggle({ source: Track.Source.Microphone });
  const messages = useLiveKitTranscript();
  const previousSessionStateRef = useRef(null);
  const previousMessagesRef = useRef([]);
  const lastAppliedMetadataRef = useRef(null);

  useEffect(() => {
    onControlsReady({
      toggleMute: async (enabled) => {
        await toggleMicrophone(enabled);
      },
      endCall: async () => {
        if (room.state !== 'disconnected') {
          await room.disconnect();
        }
        onEnd();
      },
    });
  }, [toggleMicrophone, onControlsReady, room, onEnd]);

  useEffect(() => {
    const roomState = room.state;

    let status = 'disconnected';
    if (roomState === 'connected') {
      const agentActive = agentState === 'speaking' || agentState === 'listening' || agentState === 'thinking';
      status = agentActive ? 'connected' : 'connecting';
    } else if (roomState === 'connecting' || roomState === 'reconnecting') {
      status = 'connecting';
    }

    const nextState = {
      status,
      isSpeaking: agentState === 'speaking',
      isMuted: !micEnabled,
      micPending: micPending,
    };

    const prev = previousSessionStateRef.current;
    const shouldUpdate =
      !prev ||
      prev.status !== nextState.status ||
      prev.isSpeaking !== nextState.isSpeaking ||
      prev.isMuted !== nextState.isMuted ||
      prev.micPending !== nextState.micPending;

    if (shouldUpdate) {
      previousSessionStateRef.current = nextState;
      onSessionState(nextState);
    }
  }, [
    room.state,
    agentState,
    micEnabled,
    micPending,
    onSessionState,
  ]);

  useEffect(() => {
    const prev = previousMessagesRef.current;
    const sameLength = prev.length === messages.length;
    const allEqual =
      sameLength &&
      prev.every((msg, index) => {
        const next = messages[index];
        return (
          msg.id === next.id &&
          msg.role === next.role &&
          msg.text === next.text &&
          msg.timestamp?.getTime?.() === next.timestamp?.getTime?.()
        );
      });

    if (!allEqual) {
      previousMessagesRef.current = messages;
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  useEffect(() => {
    if (!sessionId || room.state !== 'connected') {
      return;
    }

    if (lastAppliedMetadataRef.current === sessionId) {
      return;
    }

    const applyMetadata = async () => {
      try {
        await room.localParticipant.setMetadata(JSON.stringify({ sessionId }));
        lastAppliedMetadataRef.current = sessionId;
      } catch (error) {
        console.error('[LiveKitAssistant] Failed to set LiveKit metadata:', error);
      }
    };

    applyMetadata();
  }, [room, room.state, sessionId]);

  return null;
};

export default LiveKitAssistant;

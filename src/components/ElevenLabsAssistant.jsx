import { useState, useCallback, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useSearchParams } from 'react-router-dom';
import { Mic, MicOff, X, Phone, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Orb } from './ui/orb';
import { browserControlWS } from '../services/browserControlWebSocket';
import { getOrCreateSessionId, refreshSession } from '../services/sessionManager';
import { useCars } from '../context/CarsContext';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';
import TranscriptModal from './TranscriptModal';

const WS_URL = import.meta.env.VITE_BROWSER_CONTROL_WS_URL || 'wss://car-frontend-api.test.meteora.pro/browser-control';
const DEFAULT_AGENT_ID = 'agent_3701k17y6168fzg8zag3efhsmz7y';
const WEBRTC_FALLBACK_KEY = 'elevenlabs_webrtc_fallback';

const convertCarsToCSV = (cars) => {
  if (!cars || cars.length === 0) {
    return 'id,make,model,year,price,mileage,fuelType,transmission,color\n';
  }

  const header = 'id,make,model,year,price,mileage,fuelType,transmission,color';

  const rows = cars.map(car => {
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    return [
      escapeCSV(car.id),
      escapeCSV(car.make),
      escapeCSV(car.model),
      escapeCSV(car.year),
      escapeCSV(car.price),
      escapeCSV(car.mileage),
      escapeCSV(car.fuelType),
      escapeCSV(car.transmission),
      escapeCSV(car.color)
    ].join(',');
  });

  return [header, ...rows].join('\n');
};

const ElevenLabsAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const sessionIdRef = useRef(null);

  const [searchParams] = useSearchParams();

  const experimentalAgentId = searchParams.get('experimental_agent_id');
  const envAgentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
  const agentId = experimentalAgentId || envAgentId || DEFAULT_AGENT_ID;

  const { cars } = useCars();
  const { setOpenHandler } = useVoiceAssistant();

  useEffect(() => {
    const source = experimentalAgentId
      ? 'URL parameter (experimental_agent_id)'
      : envAgentId
        ? 'Environment variable (VITE_ELEVENLABS_AGENT_ID)'
        : 'Default value';

    console.log('[VoiceAssistant] Agent ID source:', source);
    console.log('[VoiceAssistant] Using agent ID:', agentId);
  }, [agentId, experimentalAgentId, envAgentId]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
    },
    onMessage: (message) => {
      console.log('Message from agent:', message);
      if (message && message.message) {
        setMessages(prev => [...prev, {
          role: message.source || 'ai',
          text: message.message,
          timestamp: new Date()
        }]);
      }
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
    }
  });

  const { status, isSpeaking, setInputMuted } = conversation;

  const startConversation = useCallback(async () => {
    try {
      setMessages([]);
      refreshSession();
      const sessionId = getOrCreateSessionId();
      sessionIdRef.current = sessionId;

      try {
        await browserControlWS.connect(WS_URL, sessionId);
        console.log('[VoiceAssistant] Connected to browser control WebSocket');
      } catch (wsError) {
        console.error('[VoiceAssistant] Failed to connect to browser control WebSocket:', wsError);
      }

      const availableCars = convertCarsToCSV(cars);
      console.log('[VoiceAssistant] Available cars CSV:', availableCars.split('\n').length - 1, 'cars');

      const shouldUseWebSocket = localStorage.getItem(WEBRTC_FALLBACK_KEY) === 'true';
      let connectionType = shouldUseWebSocket ? 'websocket' : 'webrtc';

      if (shouldUseWebSocket) {
        console.log('[VoiceAssistant] Using WebSocket (WebRTC failed previously), agent_id:', agentId);

        await navigator.mediaDevices.getUserMedia({ audio: true });

        await conversation.startSession({
          agentId: agentId,
          connectionType: 'websocket',
          dynamicVariables: {
            sessionId: sessionId,
            browserControlEnabled: true,
            availableCars: availableCars
          }
        });

        console.log('[VoiceAssistant] WebSocket connection established, agent_id:', agentId);
      } else {
        try {
          console.log('[VoiceAssistant] Attempting WebRTC connection, agent_id:', agentId);

          await conversation.startSession({
            agentId: agentId,
            connectionType: 'webrtc',
            dynamicVariables: {
              sessionId: sessionId,
              browserControlEnabled: true,
              availableCars: availableCars
            }
          });

          console.log('[VoiceAssistant] WebRTC connection established successfully, agent_id:', agentId);
          localStorage.removeItem(WEBRTC_FALLBACK_KEY);
        } catch (webrtcError) {
          console.warn('[VoiceAssistant] WebRTC failed, falling back to WebSocket:', webrtcError.message);

          localStorage.setItem(WEBRTC_FALLBACK_KEY, 'true');
          await navigator.mediaDevices.getUserMedia({ audio: true });

          await conversation.startSession({
            agentId: agentId,
            connectionType: 'websocket',
            dynamicVariables: {
              sessionId: sessionId,
              browserControlEnabled: true,
              availableCars: availableCars
            }
          });

          connectionType = 'websocket';
          console.log('[VoiceAssistant] WebSocket connection established as fallback, agent_id:', agentId);
        }
      }

      console.log('[VoiceAssistant] Conversation started with session ID:', sessionId, 'agent_id:', agentId);
    } catch (error) {
      console.error('[VoiceAssistant] Failed to start conversation:', error);

      if (browserControlWS.isConnected()) {
        browserControlWS.disconnect();
      }

      alert('Unable to access microphone. Please grant microphone permissions and try again.');
    }
  }, [conversation, agentId, cars]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      if (browserControlWS.isConnected()) {
        console.log('[VoiceAssistant] Keeping WebSocket connected for future sessions');
      }
      setIsOpen(false);
    } catch (error) {
      console.error('[VoiceAssistant] Failed to end conversation:', error);
    }
  }, [conversation]);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    await startConversation();
  }, [startConversation]);

  useEffect(() => {
    setOpenHandler(handleOpen);
  }, [handleOpen, setOpenHandler]);

  const toggleMute = useCallback(() => {
    if (setInputMuted) {
      const newMutedState = !isMuted;
      setInputMuted(newMutedState);
      setIsMuted(newMutedState);
      console.log(`[VoiceAssistant] Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
    }
  }, [isMuted, setInputMuted]);

  const getStatusText = () => {
    switch (status) {
      case 'disconnected':
        return 'Click to talk with our AI assistant';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        if (isMuted) return 'Microphone muted';
        return isSpeaking ? 'AI is speaking...' : 'Listening...';
      default:
        return 'Ready';
    }
  };

  const getOrbColor = () => {
    if (isMuted) return '#ef4444';
    if (isSpeaking) return '#3b82f6';
    if (status === 'connected') return '#2563eb';
    return '#64748b';
  };

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

      <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-7xl bg-white z-50 transition-transform duration-300 ease-in-out rounded-t-3xl ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`} style={{ boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)' }}>
        <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-gray-200 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <Orb
                  isActive={status === 'connected'}
                  isSpeaking={isSpeaking}
                  color={getOrbColor()}
                  size={40}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">AI Voice Assistant</h3>
                <p className="text-xs text-gray-600 truncate">{getStatusText()}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`} />
                  <span className="text-xs text-gray-600">Connected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                  }`} />
                  <span className="text-xs text-gray-600">Speaking</span>
                </div>
              </div>

              {sessionIdRef.current && status === 'connected' && (
                <div className="hidden md:block px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-mono">
                  {sessionIdRef.current.substring(0, 8)}
                </div>
              )}

              {status === 'connected' && (
                <Button
                  onClick={toggleMute}
                  size="sm"
                  variant="outline"
                  className={`px-2 sm:px-2.5 ${isMuted ? 'bg-red-50 hover:bg-red-100 border-red-300' : ''}`}
                  aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? (
                    <MicOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                  ) : (
                    <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                </Button>
              )}

              {status === 'connected' && messages.length > 0 && (
                <Button
                  onClick={() => setShowFullTranscript(true)}
                  size="sm"
                  variant="outline"
                  className="gap-1 hidden sm:flex"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Transcript</span> ({messages.length})
                </Button>
              )}

              {status === 'connected' && messages.length > 0 && (
                <Button
                  onClick={() => setShowFullTranscript(true)}
                  size="sm"
                  variant="outline"
                  className="sm:hidden px-2"
                  aria-label="Transcript"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
              )}

              {status === 'connected' && (
                <Button
                  onClick={endConversation}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Phone className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">End Call</span>
                </Button>
              )}

              <Button
                onClick={endConversation}
                variant="outline"
                size="sm"
                className="px-2 sm:px-2.5"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {status === 'connected' && messages.length > 0 && (
            <div className="py-3 sm:py-4 bg-gray-50 border-t border-gray-200 max-h-28 sm:max-h-32 overflow-y-auto">
              <div className="space-y-2 sm:space-y-3">
                {messages.slice(-3).map((msg, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-lg shadow-sm">
                    <span className={`text-xs font-semibold flex-shrink-0 ${
                      msg.role === 'user' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {msg.role === 'user' ? 'You:' : 'AI:'}
                    </span>
                    <span className="text-xs text-gray-700 line-clamp-2">
                      {msg.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === 'disconnected' && (
            <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-blue-50 border-t border-blue-100">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Microphone access is required for voice conversations.
              </p>
            </div>
          )}
        </div>
      </div>

      <TranscriptModal
        isOpen={showFullTranscript}
        onClose={() => setShowFullTranscript(false)}
        messages={messages}
      />
    </>
  );
};

export default ElevenLabsAssistant;

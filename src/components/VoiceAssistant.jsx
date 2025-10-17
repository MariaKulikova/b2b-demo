import { useState, useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Mic, X, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Orb } from './ui/orb';
import { browserControlWS } from '../services/browserControlWebSocket';
import { getOrCreateSessionId, refreshSession } from '../services/sessionManager';

// Agent ID и WebSocket URL из переменных окружения
const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_3701k17y6168fzg8zag3efhsmz7y';
const WS_URL = import.meta.env.VITE_BROWSER_CONTROL_WS_URL || 'wss://car-frontend-api.test.meteora.pro/browser-control';

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sessionIdRef = useRef(null);

  // Инициализация useConversation хука
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
    },
    onMessage: (message) => {
      console.log('Message from agent:', message);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
    }
  });

  const { status, isSpeaking } = conversation;


  // Функция для начала разговора
  const startConversation = useCallback(async () => {
    try {
      // Получаем или создаём sessionId с TTL 24 часа (управляется sessionManager)
      // SessionId будет одинаковым при перезагрузке страницы в течение 24 часов
      const sessionId = getOrCreateSessionId();
      sessionIdRef.current = sessionId;

      console.log('[VoiceAssistant] Using session ID:', sessionId);

      // Обновляем timestamp сессии для продления жизни
      refreshSession();

      // Подключаемся к WebSocket серверу для управления браузером
      try {
        await browserControlWS.connect(WS_URL, sessionId);
        console.log('[VoiceAssistant] Browser control WebSocket connected');
      } catch (wsError) {
        console.warn('[VoiceAssistant] Failed to connect to browser control WebSocket:', wsError);
        // Продолжаем работу даже если WebSocket не подключился
      }

      // Запрашиваем доступ к микрофону
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Начинаем сессию с агентом, передаем session ID через dynamic variables
      await conversation.startSession({
        agentId: AGENT_ID,
        dynamicVariables: {
          sessionId: sessionId,
          browserControlEnabled: true
        }
      });

      console.log('[VoiceAssistant] Conversation started with session ID:', sessionId);
    } catch (error) {
      console.error('[VoiceAssistant] Failed to start conversation:', error);

      // Отключаем WebSocket в случае ошибки
      if (browserControlWS.isConnected()) {
        browserControlWS.disconnect();
      }

      alert('Unable to access microphone. Please grant microphone permissions and try again.');
    }
  }, [conversation]);

  // Функция для завершения разговора
  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();

      // Отключаемся от WebSocket сервера
      // ВАЖНО: НЕ вызываем disconnect(), чтобы сохранить WebSocket соединение
      // для последующих сессий (соединение переподключится автоматически при необходимости)
      if (browserControlWS.isConnected()) {
        console.log('[VoiceAssistant] Keeping WebSocket connected for future sessions');
      }

      // ВАЖНО: НЕ очищаем sessionId, он управляется sessionManager с TTL 24 часа
      // Это позволяет сохранить контекст при повторном открытии ассистента
      setIsOpen(false);
    } catch (error) {
      console.error('[VoiceAssistant] Failed to end conversation:', error);
    }
  }, [conversation]);

  // Открытие модального окна и начало разговора
  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    await startConversation();
  }, [startConversation]);

  // Получение текста статуса
  const getStatusText = () => {
    switch (status) {
      case 'disconnected':
        return 'Click to talk with our AI assistant';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return isSpeaking ? 'AI is speaking...' : 'Listening...';
      default:
        return 'Ready';
    }
  };

  // Получение цвета орба в зависимости от статуса
  const getOrbColor = () => {
    if (isSpeaking) return '#3b82f6'; // Ярко-синий когда говорит
    if (status === 'connected') return '#2563eb'; // Синий когда подключен
    return '#64748b'; // Серый когда отключен
  };

  return (
    <>
      {/* Плавающая кнопка */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50 group"
          aria-label="Open voice assistant"
        >
          <Mic className="h-6 w-6" />
          <span className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-sm rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Talk to our AI assistant
          </span>
        </button>
      )}

      {/* Компактный Bottom Sheet */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out rounded-t-2xl ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-4xl mx-auto">
          {/* Header с кнопкой закрытия */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Компактный Orb */}
              <div className="flex-shrink-0">
                <Orb
                  isActive={status === 'connected'}
                  isSpeaking={isSpeaking}
                  color={getOrbColor()}
                  size={48}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">AI Voice Assistant</h3>
                <p className="text-xs text-gray-600">{getStatusText()}</p>
              </div>
            </div>

            {/* Индикаторы и кнопки */}
            <div className="flex items-center gap-4">
              {/* Индикаторы состояния */}
              <div className="flex items-center gap-3">
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

              {/* Session ID (компактный) */}
              {sessionIdRef.current && status === 'connected' && (
                <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-mono">
                  {sessionIdRef.current.substring(0, 8)}
                </div>
              )}

              {/* Кнопка завершения */}
              {status === 'connected' && (
                <Button
                  onClick={endConversation}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Phone className="mr-1 h-3 w-3" />
                  End
                </Button>
              )}

              {/* Кнопка закрытия */}
              <button
                onClick={endConversation}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Информация о микрофоне (если отключен) */}
          {status === 'disconnected' && (
            <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Microphone access is required for voice conversations.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VoiceAssistant;

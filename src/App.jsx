import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaPaperclip, FaPaperPlane, FaCopy, FaThumbsUp, FaThumbsDown, FaVolumeUp, FaVolumeDown } from 'react-icons/fa';
import axios from 'axios';
import Topbar from './components/Topbar';
import ReactMarkdown from 'react-markdown';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    const userMessage = { content: inputMessage, role: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://sciphi-4f8af0ab-4d3b-400f-8a44-23cb05aa79e3-qwpin2swwa-ue.a.run.app/v1/rag',
        { query: inputMessage },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const botResponse = response.data.results.completion.choices[0].message;
      setMessages(prevMessages => [...prevMessages, botResponse]);
      await generateSpeech(botResponse.content);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setMessages(prevMessages => [...prevMessages, { content: 'Lo siento, ha ocurrido un error.', role: 'assistant' }]);
    } finally {
      setIsLoading(false);
    }
  }

  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.lang = "es-ES";
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        for (const result of event.results) {
          console.log(result[0].transcript);
          setInputMessage(result[0].transcript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        if (event.error === 'network') {
          console.error('Error de red. Por favor, verifica tu conexión a internet.');
        }
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.log('El reconocimiento de voz no está soportado en este navegador.');
      setVoiceSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!voiceSupported) {
      console.error('Lo siento, el reconocimiento de voz no está soportado en este navegador.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());
  const generateSpeech = async (text) => {
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
        {
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.0,
            similarity_boost: 1.0
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': "sk_d7252f6c47bbdcaae879982e6bd2ad9839ab270d1364dfc7",
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error al generar voz:', error);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    audioRef.current.onended = () => setIsPlaying(false);
  }, []);

  return (
    <div className="flex h-screen bg-[#212121]">
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar />
        {/* Topbar */}

        {/* Mensajes del chat */}
        <div className="flex-1 overflow-y-auto p-4 px-2 space-y-4 md:px-[30rem] lg:px-[22rem]">
          {messages.map((message, index) => (
            <div key={index} className={`flex w-full`}>
              <div className={`rounded-lg p-3 w-auto ${message.role === 'assistant' ? 'bg-[#333333] text-white' : 'bg-gray-900 text-white'}`}>
                <p><ReactMarkdown>{message.content}</ReactMarkdown></p>
                <div className="flex justify-end mt-2 space-x-2">
                  {message.role === 'assistant' && (
                    <button
                      onClick={toggleAudio}
                      className="text-base text-gray-400 hover:text-white"
                    >
                      {isPlaying ? <FaVolumeUp /> : <FaVolumeDown />}
                    </button>
                  )}
                  <button className="text-sm text-gray-400 hover:text-white"><FaCopy /></button>
                  <button className="text-sm text-gray-400 hover:text-white"><FaThumbsUp /></button>
                  <button className="text-sm text-gray-400 hover:text-white"><FaThumbsDown /></button>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg p-3">
                <p>Escribiendo...</p>
              </div>
            </div>
          )}
        </div>
        {/* Mensajes del chat */}

        {/* Area de entrada de mensajes */}
        <div className='flex justify-center items-center bg-transparent'>
          <div className="bg-slate-700 p-4 md:w-[50%] rounded-t-2xl shadow-md">
            <form onSubmit={sendMessage} className="flex items-center bg-slate-700 border-none rounded-lg ">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-white"
                disabled={isLoading || isListening}
              />
              <button type="button" className="p-2 text-gray-400 hover:text-gray-50">
                <FaPaperclip />
              </button>
              <button
                onClick={toggleListening}
                type="button"
                className={`p-2 ${!voiceSupported ? 'text-green-400 cursor-not-allowed' : isListening ? 'text-red-500' : 'text-gray-400 hover:text-gray-50'}`}
              >
                <FaMicrophone />
              </button>
              <button
                type="submit"
                className={`p-2 rounded-full ${inputMessage.trim() && !isLoading ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-gray-50 cursor-not-allowed bg-slate-600'}`}
                disabled={!inputMessage.trim() || isLoading || isListening}
              >
                <FaPaperPlane />
              </button>
            </form>

          </div>
        </div>
        {/* Area de entrada de mensajes */}

      </div>
    </div>
  );
};

export default ChatInterface;
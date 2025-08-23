
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { initializeTutorChat, getTutorResponseStream } from '../services/geminiService';
import { useStudyData } from '../context/StudyDataContext';

const AITutor: React.FC = () => {
  const { sourceText } = useStudyData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sourceText) {
      initializeTutorChat(sourceText);
      setMessages([
        { role: 'model', text: 'Hello! I am your AI tutor. Ask me anything about your study material.' }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    const modelResponse: ChatMessage = { role: 'model', text: '' };
    setMessages(prev => [...prev, modelResponse]);

    try {
      const stream = getTutorResponseStream(userInput);
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = 'Sorry, I encountered an error. Please try again.';
        return newMessages;
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-card-bg rounded-lg shadow-lg p-4 flex flex-col h-[500px]">
      <h3 className="text-xl font-bold mb-4 text-text-primary">AI Tutor</h3>
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-text-primary'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center bg-gray-100 rounded-lg border-2 border-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-grow bg-transparent px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none"
          disabled={isLoading}
        />
        <button type="submit" className="flex-shrink-0 bg-primary text-white px-4 py-3 rounded-r-lg hover:bg-primary-hover disabled:bg-gray-400 transition-colors" disabled={isLoading}>
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default AITutor;

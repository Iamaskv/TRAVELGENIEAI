import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import type { ITripPlan, IChatMessage } from '../../types';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
} from 'lucide-react';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ITripPlan;
  onPlanUpdate?: (updatedPlan: ITripPlan) => void;
  onSwitchTab?: (tabName: string) => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  plan,
  onPlanUpdate,
  onSwitchTab,
}) => {
  const [messages, setMessages] = useState<IChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `Hello! I'm your AI Travel Agent for your upcoming trip to **${plan.destination || 'your destination'}**. 
I have your complete transport timings, accommodation details, and budget allocations in mind. 

How can I help optimize your trip today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'Can you make this trip cheaper?',
    'Replace the flight with a train',
    'Find a more affordable hotel or hostel',
    'What should I pack for this trip?',
    'Can I visit these sights in a different order?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const sendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: IChatMessage = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const response = await api.chatWithAI(text, plan);
      setMessages((prev) => [...prev, response]);

      // Handle auto-action payload if returned by AI
      if (response && response.actionPayload) {
        if (response.actionPayload.type === 'SWAP_TRANSPORT') {
          const cheaperTrain = plan.outboundOptions?.find(
            (o: any) => o.mode === 'train' && (o.badge === 'Cheapest' || o.badge === 'Best Overall Value')
          );
          if (cheaperTrain && onPlanUpdate && cheaperTrain.id !== plan.selectedOutbound?.id) {
            const updated = {
              ...plan,
              selectedOutbound: cheaperTrain,
            };
            onPlanUpdate(updated);
          }
          if (onSwitchTab) onSwitchTab('outbound');
        } else if (response.actionPayload.type === 'SWAP_ACCOMMODATION') {
          const hostel = plan.accommodationOptions?.find((a: any) => a.propertyType === 'hostel');
          if (hostel && onPlanUpdate && hostel.id !== plan.selectedAccommodation?.id) {
            const updated = {
              ...plan,
              selectedAccommodation: hostel,
            };
            onPlanUpdate(updated);
          }
          if (onSwitchTab) onSwitchTab('accommodation');
        } else if (response.actionPayload.type === 'SHOW_PACKING') {
          if (onSwitchTab) onSwitchTab('checklist');
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'assistant',
          text: "I'm having trouble connecting right now. Please try again or explore the dedicated transport and accommodation tabs above.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight flex items-center gap-2">
                <span>TravelGenie Assistant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-slate-400">Contextual planner for {plan.destination || 'your destination'}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-emerald-400'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[9px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>TravelGenie is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="px-2.5 py-1 text-[11px] whitespace-nowrap rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about this trip or request changes..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-1 text-center">
            AI updates your plan estimates in real-time. Final bookings take place on provider portals.
          </p>
        </div>
      </div>
    </div>
  );
};

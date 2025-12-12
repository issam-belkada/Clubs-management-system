"use client"

import { useEffect, useState } from "react"
import { X, Send, MessageCircle } from "lucide-react"
import axios from "axios"


interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}
interface ChatMessage {
  input: string;
  stl: boolean;
}
export default function Chatbot() {
            
        
        
  const [isOpen, setIsOpen] = useState(false)
  const apiKey=process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your CyberGuard assistant. How can I help you with cybersecurity today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your question! Our cybersecurity experts are here to help. For detailed assistance, please contact our team.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleText = () => {
    if (!text.trim()) return;
    setLoading(true);

    // Add user message
    setChat((prev) => [...prev, { input: text, stl: true }]);
    
    axios
  .post(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      model: "gemini-2.5-flash", // or whichever Gemini model you want
      messages: [
        { role: "system", content:  `
You are an expert assistant for recommending scientific clubs. 
Your task is to suggest the most suitable scientific clubs for a user based on their interests. 
Consider categories such as Technology, Robotics, AI & Machine Learning, Mathematics, Physics, Chemistry, Biology, Astronomy, Art & Culture related to science, and others. 

For each recommendation, provide:
1. The club name.
2. The main field or focus.
3. Why it fits the user's interests (brief explanation).
4. Number of events or activities they organize if relevant.

Be friendly, concise, and persuasive so the user will want to join the recommended clubs.
` },
        { role: "user", content: text },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`, // your Gemini API key
        "Content-Type": "application/json",
      },
    }
  )
      .then((res) => {
        const reply = res.data.choices[0].message.content;
        setChat((prev) => [...prev, { input: reply, stl: false }]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        console.log("API key:", apiKey);

        setLoading(false);
      });

    setText('');
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#1B5E20] to-[#0D3B15] hover:bg-gradient-to-br hover:from-[#154718] hover:to-[#07200b] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-[#1B5E20] text-white px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">chatbot</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-[#0D3B15] p-1 rounded transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat.map((message, index) => (
              <div key={index} className={`flex ${message.stl ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg ${
                    message.stl
                      ? "bg-[#1B5E20] text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.input}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 space-y-2">
            <p className="text-xs text-gray-500 text-center">ask me </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleText()}
                placeholder="Type your question..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B5E20]"
              />
              <button
                onClick={handleText}
                disabled={loading || !text.trim()}
                className="bg-[#1B5E20] text-white p-2 rounded-lg hover:bg-[#0D3B15] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
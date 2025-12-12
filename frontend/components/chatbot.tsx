"use client"

import { useEffect, useState } from "react"
import { X, Send, MessageCircle } from "lucide-react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

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
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 bg-primary hover:bg-primary/90"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] shadow-2xl flex flex-col overflow-hidden z-50 border-border animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
                 <MessageCircle className="h-5 w-5" />
                 <CardTitle className="text-base font-medium">Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          {/* Messages Container */}
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
             <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {chat.map((message, index) => (
                    <div key={index} className={`flex ${message.stl ? "justify-end" : "justify-start"}`}>
                        <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                            message.stl
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none"
                        }`}
                        >
                        {message.input}
                        </div>
                    </div>
                    ))}
                    {loading && (
                    <div className="flex justify-start">
                        <div className="bg-muted px-4 py-2 rounded-lg rounded-bl-none">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-150"></div>
                        </div>
                        </div>
                    </div>
                    )}
                </div>
             </ScrollArea>
             
             {/* Input Area */}
             <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleText()}
                    placeholder="Type your question..."
                    className="flex-1"
                />
                <Button
                    onClick={handleText}
                    disabled={loading || !text.trim()}
                    size="icon"
                    className="shrink-0"
                >
                    <Send className="h-4 w-4" />
                </Button>
                </div>
             </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

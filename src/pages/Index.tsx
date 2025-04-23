import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProductivitySection } from "@/components/ProductivitySection";
import { SearchBar } from "@/components/SearchBar";
import { SearchResponse } from "@/components/SearchResponse";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";

interface Question {
  question: string;
  questionId: string;
  type: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  currentQuestion: Question | null;
  finalAssessment: string | null;
}

const Index = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeChat = chats.find(chat => chat.id === activeChatId);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      currentQuestion: null,
      finalAssessment: null
    };
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChat.id);
  };

  const fetchFromAgent = async (input: string, chatId: string) => {
    try {
      const response = await fetch("https://pranav8267.app.n8n.cloud/webhook/pregnancy-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatInput: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from n8n");
      }

      const data = await response.text();
      const parsedArray = JSON.parse(data);
      const rawOutput = parsedArray[0]?.output || "{}";
      const cleaned = rawOutput.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      console.log("parsed response is", parsed);

      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id !== chatId) return chat;

          if (parsed.finalDiagnosis) {
            return {
              ...chat,
              messages: [...chat.messages, { role: 'assistant', content: parsed.finalDiagnosis }],
              currentQuestion: null,
              finalAssessment: parsed.finalDiagnosis
            };
          } else {
            return {
              ...chat,
              currentQuestion: {
                question: parsed.question,
                questionId: parsed.questionId,
                type: parsed.type,
                options: parsed.options,
                min: parsed.min,
                max: parsed.max,
                step: parsed.step
              }
            };
          }
        });
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching from agent:", error);
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!activeChatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: query,
        messages: [{ role: 'user', content: query }],
        currentQuestion: null,
        finalAssessment: null
      };
      setChats(prev => [...prev, newChat]);
      setActiveChatId(newChat.id);
      setIsLoading(true);
      await fetchFromAgent(query, newChat.id);
    } else {
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id !== activeChatId) return chat;
          return {
            ...chat,
            title: query,
            messages: [...chat.messages, { role: 'user', content: query }]
          };
        });
      });
      setIsLoading(true);
      await fetchFromAgent(query, activeChatId);
    }
  };

  const handleAnswer = async (questionId: string, answer: any) => {
    if (!activeChatId) return;

    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id !== activeChatId) return chat;
        return {
          ...chat,
          messages: [...chat.messages, { 
            role: 'user', 
            content: `${chat.currentQuestion?.question} - ${answer}`
          }]
        };
      });
    });

    setIsLoading(true);
    const chat = chats.find(c => c.id === activeChatId);
    const nextInput = `${chat?.title} - ${questionId}: ${answer}`;
    await fetchFromAgent(nextInput, activeChatId);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar with Chat History */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4">
          <Button 
            className="w-full flex items-center gap-2" 
            variant="outline"
            onClick={createNewChat}
          >
            <Plus size={16} />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <button
              key={chat.id}
              className={`w-full text-left p-4 flex items-center gap-2 hover:bg-zinc-800 ${
                chat.id === activeChatId ? 'bg-zinc-800' : ''
              }`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <MessageCircle size={16} />
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4">
            <div className="pt-8 pb-32"> {/* Added padding bottom for search bar */}
              {!activeChat ? (
                <ProductivitySection />
              ) : (
                <SearchResponse 
                  query={activeChat.title}
                  visible={true}
                  loading={isLoading}
                  currentQuestion={activeChat.currentQuestion}
                  finalAssessment={activeChat.finalAssessment}
                  onAnswer={handleAnswer}
                  chatHistory={activeChat.messages}
                />
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-64 right-0 p-4 bg-zinc-950 border-t border-zinc-800">
            <SearchBar onSearch={handleSearch} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

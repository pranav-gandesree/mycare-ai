import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProductivitySection } from "@/components/ProductivitySection";
import { SearchBar } from "@/components/SearchBar";
import { SearchResponse } from "@/components/SearchResponse";
import { useState } from "react";
import { generateHealthQuestions } from "@/services/gemini";
import { HealthResponse } from "@/types/health";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [healthResponse, setHealthResponse] = useState<HealthResponse | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsLoading(true);
      setShowResponse(true);
      setHealthResponse(null);

      try {
        // Get response from Gemini
        const response = await generateHealthQuestions(query);
        setHealthResponse(response);
      } catch (error) {
        console.error("Search error:", error);
        setHealthResponse({
          questions: [],
          finalDiagnosis: "Sorry, there was an error processing your request. Please try again.",
          recommendations: ["Please try again later"]
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 px-4 flex flex-col justify-between pt-8">
          <div className="flex-1">
            {!showResponse ? (
              <ProductivitySection />
            ) : (
              <SearchResponse 
                query={searchQuery}
                visible={showResponse}
                loading={isLoading}
                response={healthResponse?.finalDiagnosis || ""}
              />
            )}
          </div>
          
          <div className="sticky bottom-0 pb-4 bg-zinc-950">
            <SearchBar onSearch={handleSearch} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;


import { SearchIcon, Paintbrush, Atom, PlusCircle } from "lucide-react";
import { CategoryTabs } from "./CategoryTabs";
import { FeatureCard } from "./FeatureCard";

export const ProductivitySection = () => {
  return (
    <div className="max-w-3xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Enhance your <span className="gradient-text">productivity</span> with AI
      </h1>
      
      <CategoryTabs />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <FeatureCard 
          icon={<SearchIcon className="text-blue-800" size={20} />}
          title="Research"
          description="Deep research with industry-leading accuracy"
          iconBg="bg-blue-100"
        />
        
        <FeatureCard 
          icon={<Paintbrush className="text-purple-800" size={20} />}
          title="Create"
          description="Transform ideas into polished images and visuals"
          iconBg="bg-purple-100"
        />
        
        <FeatureCard 
          icon={<Atom className="text-blue-800" size={20} />}
          title="Compute"
          description="Solve complex data and engineering challenges"
          iconBg="bg-blue-100"
        />
        
        <FeatureCard 
          icon={<PlusCircle className="text-white" size={20} />}
          title="Build your own"
          description="Create your own custom agent"
          iconBg="bg-zinc-700"
        />
      </div>
    </div>
  );
};

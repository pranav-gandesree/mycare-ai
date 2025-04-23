
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const categories = [
  { id: "general", name: "general" },
  { id: "dental", name: "dental" },
  { id: "pregnancy", name: "pregnancy" },
  { id: "skin", name: "skin" },
];

export const CategoryTabs = () => {
  const [activeCategory, setActiveCategory] = useState("featured");

  return (
    <ScrollArea className="w-full my-3">
      <div className="flex flex-nowrap gap-2 pb-2 justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-pill whitespace-nowrap ${
              activeCategory === category.id ? "category-pill-active" : "category-pill-inactive"
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

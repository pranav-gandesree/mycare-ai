
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex-1" />
      <div className="flex-1" />
      <div>
        <Button className="bg-youcom-button-primary hover:bg-blue-700 text-white font-medium rounded-full">
          Get Pro <span className="ml-1">+</span>
        </Button>
      </div>
    </div>
  );
};

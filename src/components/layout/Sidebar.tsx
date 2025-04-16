
import { PlusCircle, MessageCircle, Users, BriefcaseBusiness, Download, Settings, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Sidebar = () => {
  return (
    <div className="w-[270px] min-h-screen bg-youcom-sidebar flex flex-col border-r border-zinc-800">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <div className="h-4 w-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-lg font-semibold text-white">you.com</span>
        </div>

        <Button variant="ghost" className="w-full justify-start gap-2 text-sm mb-4 nav-item">
          <div className="flex items-center justify-center w-6 h-6">
            <PlusCircle size={18} />
          </div>
          New Chat
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-2 text-sm mb-4 nav-item nav-item-active">
          <div className="flex items-center justify-center w-6 h-6">
            <Users size={18} />
          </div>
          Agents
        </Button>
      </div>

      <div className="mt-auto">
        <div className="px-4 py-3">
          <div className="bg-zinc-800/50 rounded-lg p-5">
            <p className="text-sm text-zinc-400 mb-4">Sign in for free to save your chat history</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">Sign in</Button>
          </div>
        </div>

        <div className="border-t border-zinc-800 px-4 pt-2 pb-4">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm nav-item mb-1">
            <div className="flex items-center justify-center w-6 h-6">
              <BriefcaseBusiness size={18} />
            </div>
            Business
          </Button>
          
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm nav-item mb-1">
            <div className="flex items-center justify-center w-6 h-6">
              <Download size={18} />
            </div>
            Download
          </Button>
          
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm nav-item mb-1">
            <div className="flex items-center justify-center w-6 h-6">
              <Settings size={18} />
            </div>
            Settings
          </Button>
          
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm nav-item">
            <div className="flex items-center justify-center w-6 h-6">
              <MoreHorizontal size={18} />
            </div>
            More
          </Button>
        </div>
      </div>
    </div>
  );
};

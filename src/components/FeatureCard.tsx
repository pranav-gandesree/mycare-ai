
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBg?: string;
}

export const FeatureCard = ({ icon, title, description, iconBg = "bg-blue-100" }: FeatureCardProps) => {
  return (
    <div className="you-card flex flex-col gap-2 h-full py-4">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
        <p className="text-xs text-zinc-400">{description}</p>
      </div>
    </div>
  );
};

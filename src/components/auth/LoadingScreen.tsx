
import { Leaf } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2FCE2]">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-plant-mint/30 flex items-center justify-center">
            <Leaf className="h-12 w-12 text-plant-dark-green animate-pulse" />
          </div>
          <div className="absolute -bottom-2 left-0 right-0">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-plant-dark-green animate-[garden-grow_1.5s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
        <p className="text-lg font-serif text-plant-dark-green">Getting your garden ready...</p>
        <p className="text-sm text-plant-dark/70">Loading your personalized plant experience</p>
      </div>
    </div>
  );
}

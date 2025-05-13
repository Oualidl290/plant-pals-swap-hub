
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf } from "lucide-react";

export function AuthSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F2FCE2]">
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo and App Name */}
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-plant-mint/30 flex items-center justify-center mb-2">
                <Leaf className="h-8 w-8 text-plant-dark-green" />
              </div>
              <span className="font-serif font-bold text-2xl text-plant-dark-green">PlantPals</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-6 space-x-2">
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-4 animate-pulse">
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full mt-6" />
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Skeleton className="h-px w-full" />
                </div>
                <div className="relative flex justify-center">
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

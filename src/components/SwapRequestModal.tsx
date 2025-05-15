
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useSwapRequests } from "@/hooks/useSwapRequests";
import { usePlants } from "@/hooks/usePlants";
import { PlantWithDetails } from "@/types/supabase";

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantId: string;
  plantName: string;
  ownerId: string;
}

export function SwapRequestModal({ isOpen, onClose, plantId, plantName, ownerId }: SwapRequestModalProps) {
  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const { userPlants, isLoadingUserPlants } = usePlants();
  const { createSwapRequest, isCreating } = useSwapRequests();
  
  // Filter out plants that aren't available for swap
  const availablePlants = userPlants?.filter(plant => plant.available_for_swap) || [];
  
  const handleSubmit = () => {
    if (!selectedPlantId) return;
    
    createSwapRequest({ 
      plantId,
      message: `I'd like to swap my ${availablePlants.find(p => p.id === selectedPlantId)?.name} for your ${plantName}. ${message}`
    });
    
    // Reset form and close modal
    setSelectedPlantId("");
    setMessage("");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Request a Plant Swap</DialogTitle>
          <DialogDescription className="text-center">
            Send a request to swap with {plantName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select your plant to offer</label>
            {isLoadingUserPlants ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-plant-dark-green" />
              </div>
            ) : availablePlants.length > 0 ? (
              <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plant to swap" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlants.map(plant => (
                    <SelectItem key={plant.id} value={plant.id}>
                      {plant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                You don't have any plants available for swap. Add a plant first.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Message (optional)</label>
            <Textarea
              placeholder="Include any details about your swap request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-plant-dark-green hover:bg-plant-dark-green/90"
            onClick={handleSubmit}
            disabled={!selectedPlantId || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

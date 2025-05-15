
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlantFormData } from "@/hooks/usePlants";
import { Loader2, Upload, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PlantFormProps {
  initialData?: Partial<PlantFormData>;
  onSubmit: (data: PlantFormData) => void;
  isSubmitting: boolean;
}

export function PlantForm({ initialData, onSubmit, isSubmitting }: PlantFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const MAX_IMAGES = 4;
  
  const [formData, setFormData] = useState<PlantFormData>({
    name: initialData?.name || "",
    species: initialData?.species || "",
    description: initialData?.description || "",
    image_url: initialData?.image_url || null,
    image_urls: initialData?.image_urls || [],
    difficulty: initialData?.difficulty || "moderate",
    sunlight: initialData?.sunlight || "indirect",
    watering_frequency: initialData?.watering_frequency || "weekly",
    size: initialData?.size || "medium",
    care_instructions: initialData?.care_instructions || "",
    swap_preferences: initialData?.swap_preferences || "",
    location: initialData?.location || "",
    available_for_swap: initialData?.available_for_swap !== undefined ? initialData.available_for_swap : true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle form field changes
  const handleChange = (field: keyof PlantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `plants/${user.id}/${fileName}`;
      
      // Upload to Supabase Storage with progress tracking
      const { error: uploadError } = await supabase.storage
        .from("plants")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // Simulate progress for better UX since Supabase JS v2 doesn't support progress events
      const updateProgress = () => {
        setUploadProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.floor(Math.random() * 20);
        });
      };
      
      const progressInterval = setInterval(updateProgress, 200);
      
      // Get the public URL
      const { data: publicUrl } = supabase.storage
        .from("plants")
        .getPublicUrl(filePath);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update form data with the new image URL
      const currentImages = [...(formData.image_urls || [])];
      if (currentImages.length < MAX_IMAGES) {
        const newImageUrls = [...currentImages, publicUrl.publicUrl];
        
        // Set the first image as main image_url for backwards compatibility
        setFormData(prev => ({
          ...prev,
          image_urls: newImageUrls,
          image_url: prev.image_url || publicUrl.publicUrl // Only set if not already set
        }));
      }
      
      toast({
        title: "Image uploaded",
        description: "Your plant image has been uploaded successfully."
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Remove an image from the collection
  const handleRemoveImage = (indexToRemove: number) => {
    const currentImages = [...(formData.image_urls || [])];
    const newImageUrls = currentImages.filter((_, index) => index !== indexToRemove);
    
    setFormData(prev => ({
      ...prev,
      image_urls: newImageUrls,
      // If removing the main image, set the new main image to the first remaining one, or null if none
      image_url: indexToRemove === 0 ? (newImageUrls[0] || null) : prev.image_url
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Get current images to display
  const displayImages = formData.image_urls?.length ? formData.image_urls : 
                       (formData.image_url ? [formData.image_url] : []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Basic info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plant Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="E.g., Monstera Deliciosa"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="species">Species</Label>
            <Input
              id="species"
              value={formData.species || ""}
              onChange={(e) => handleChange("species", e.target.value)}
              placeholder="E.g., Monstera"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Tell others about your plant..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Plant Images (up to 4)</Label>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Display existing images with remove button */}
              {displayImages.map((imageUrl, index) => (
                <div key={index} className="relative border border-plant-mint/50 rounded-lg overflow-hidden">
                  <AspectRatio ratio={1/1}>
                    <img
                      src={imageUrl}
                      alt={`Plant image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-plant-dark-green/70 text-white text-xs py-1 text-center">
                      Main Image
                    </div>
                  )}
                </div>
              ))}
              
              {/* Upload button */}
              {displayImages.length < MAX_IMAGES && (
                <div className="border border-dashed border-plant-mint/50 rounded-lg p-4">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  
                  <label 
                    htmlFor="image" 
                    className="flex flex-col items-center justify-center h-full cursor-pointer"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-plant-dark-green mb-2" />
                        <span className="text-xs text-plant-gray">{uploadProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="h-8 w-8 text-plant-gray mb-1" />
                        <span className="text-xs text-center text-plant-gray">
                          Add Image ({displayImages.length}/{MAX_IMAGES})
                        </span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Care details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Care Difficulty</Label>
              <Select
                value={formData.difficulty || "moderate"}
                onValueChange={(value) => handleChange("difficulty", value)}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="difficult">Difficult</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sunlight">Sunlight Needs</Label>
              <Select
                value={formData.sunlight || "indirect"}
                onValueChange={(value) => handleChange("sunlight", value)}
              >
                <SelectTrigger id="sunlight">
                  <SelectValue placeholder="Select sunlight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low light</SelectItem>
                  <SelectItem value="indirect">Indirect light</SelectItem>
                  <SelectItem value="bright">Bright light</SelectItem>
                  <SelectItem value="direct">Direct sunlight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="watering">Watering Frequency</Label>
              <Select
                value={formData.watering_frequency || "weekly"}
                onValueChange={(value) => handleChange("watering_frequency", value)}
              >
                <SelectTrigger id="watering">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice-weekly">Twice weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Every two weeks</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">Plant Size</Label>
              <Select
                value={formData.size || "medium"}
                onValueChange={(value) => handleChange("size", value)}
              >
                <SelectTrigger id="size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="care">Care Instructions</Label>
            <Textarea
              id="care"
              value={formData.care_instructions || ""}
              onChange={(e) => handleChange("care_instructions", e.target.value)}
              placeholder="Special care requirements..."
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preferences">Swap Preferences</Label>
            <Textarea
              id="preferences"
              value={formData.swap_preferences || ""}
              onChange={(e) => handleChange("swap_preferences", e.target.value)}
              placeholder="What plants are you interested in swapping for?"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="E.g., San Francisco, CA"
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="available"
              checked={formData.available_for_swap}
              onCheckedChange={(checked) => handleChange("available_for_swap", checked)}
            />
            <Label htmlFor="available">Available for swap</Label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-plant-dark-green hover:bg-plant-dark-green/90"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.name ? 'Save Changes' : 'Add Plant'}
        </Button>
      </div>
    </form>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play } from "lucide-react";
import type { InsertStream } from "@shared/schema";

export function StreamForm() {
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [name, setName] = useState("");
  const [quality, setQuality] = useState("720p");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createStreamMutation = useMutation({
    mutationFn: async (streamData: InsertStream) => {
      const response = await apiRequest("POST", "/api/streams", streamData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/streams/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Stream started successfully",
        description: "Your RTMP stream is now being converted to HLS/DASH",
      });
      
      // Clear form
      setRtmpUrl("");
      setName("");
      setQuality("720p");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start stream",
        description: error.message || "Please check your RTMP URL and try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rtmpUrl) {
      toast({
        title: "RTMP URL required",
        description: "Please enter a valid RTMP stream URL",
        variant: "destructive",
      });
      return;
    }

    createStreamMutation.mutate({
      name: name || "Untitled Stream",
      rtmpUrl,
      quality,
    });
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <i className="fas fa-broadcast-tower text-primary text-lg mr-3"></i>
          <h2 className="text-xl font-semibold text-gray-900">New RTMP Stream</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="rtmp-url" className="text-sm font-medium text-gray-700 mb-2">
              RTMP Stream URL
            </Label>
            <div className="flex space-x-3">
              <Input
                id="rtmp-url"
                type="url"
                placeholder="rtmp://your-server.com/live/stream-key"
                value={rtmpUrl}
                onChange={(e) => setRtmpUrl(e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="submit"
                disabled={createStreamMutation.isPending}
                className="bg-primary hover:bg-blue-700 text-white px-6"
              >
                <Play className="h-4 w-4 mr-2" />
                {createStreamMutation.isPending ? "Starting..." : "Start Stream"}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Stream Name (Optional)
              </Label>
              <Input
                placeholder="My Live Stream"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Output Quality
              </Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1080p">1080p HD</SelectItem>
                  <SelectItem value="720p">720p (Recommended)</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

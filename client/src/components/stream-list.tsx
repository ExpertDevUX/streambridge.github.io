import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StopCircle, Eye, Trash2, Copy } from "lucide-react";
import type { Stream } from "@shared/schema";

interface StreamListProps {
  onSelectStream: (stream: Stream) => void;
  selectedStream: Stream | null;
}

export function StreamList({ onSelectStream, selectedStream }: StreamListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeStreams = [], isLoading: activeLoading } = useQuery<Stream[]>({
    queryKey: ["/api/streams/active"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: recentStreams = [], isLoading: recentLoading } = useQuery<Stream[]>({
    queryKey: ["/api/streams/recent"],
  });

  const stopStreamMutation = useMutation({
    mutationFn: async (streamId: string) => {
      const response = await apiRequest("POST", `/api/streams/${streamId}/stop`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/streams/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Stream stopped",
        description: "The stream has been stopped successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to stop stream",
        variant: "destructive",
      });
    },
  });

  const deleteStreamMutation = useMutation({
    mutationFn: async (streamId: string) => {
      const response = await apiRequest("DELETE", `/api/streams/${streamId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/streams/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Stream deleted",
        description: "The stream and its files have been deleted",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete stream",
        variant: "destructive",
      });
    },
  });

  const copyEmbedCode = (stream: Stream) => {
    const embedCode = `<iframe src="${window.location.origin}/embed/${stream.id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied",
      description: "The embed code has been copied to your clipboard",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDaysUntilExpiration = (createdAt: string | Date | null) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const expiration = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.ceil((expiration.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Active Streams */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <i className="fas fa-video text-primary text-sm mr-2"></i>
              Active Streams
            </h3>
            <Badge variant="secondary" className="bg-accent text-white">
              {activeStreams.length} Live
            </Badge>
          </div>
          
          {activeLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : activeStreams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-video-slash text-2xl mb-2 opacity-50"></i>
              <p>No active streams</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeStreams.map((stream: Stream) => (
                <div
                  key={stream.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedStream?.id === stream.id
                      ? 'bg-blue-50 border border-primary'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => onSelectStream(stream)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-gray-900">{stream.name}</p>
                      <p className="text-sm text-gray-600">
                        Live for {formatDuration(stream.duration || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {stream.quality}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyEmbedCode(stream);
                      }}
                      className="text-gray-400 hover:text-blue-500 p-1 h-auto"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        stopStreamMutation.mutate(stream.id);
                      }}
                      disabled={stopStreamMutation.isPending}
                      className="text-gray-400 hover:text-red-500 p-1 h-auto"
                    >
                      <StopCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Streams Table */}
      <Card className="border border-gray-200 shadow-sm lg:col-span-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <i className="fas fa-history text-primary text-sm mr-2"></i>
              Recent Streams
            </h3>
            <span className="text-sm text-gray-600">Auto-cleanup in 7 days</span>
          </div>
          
          {recentLoading ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-100 rounded-lg"></div>
            </div>
          ) : recentStreams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <i className="fas fa-history text-3xl mb-3 opacity-50"></i>
              <p className="text-lg">No streams yet</p>
              <p className="text-sm">Start your first RTMP stream to see it here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">
                      Stream
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">
                      Duration
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">
                      Quality
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">
                      Size
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">
                      Expires
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentStreams.map((stream: Stream) => (
                    <tr key={stream.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mr-3">
                            <i className="fas fa-video text-gray-500 text-xs"></i>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{stream.name}</p>
                            <p className="text-xs text-gray-500">
                              {stream.createdAt ? new Date(stream.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDuration(stream.duration || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {stream.quality}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatFileSize(stream.fileSize || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getDaysUntilExpiration(stream.createdAt)} days
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectStream(stream)}
                            className="text-primary hover:text-blue-700 p-1 h-auto"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyEmbedCode(stream)}
                            className="text-gray-400 hover:text-blue-500 p-1 h-auto"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStreamMutation.mutate(stream.id)}
                            disabled={deleteStreamMutation.isPending}
                            className="text-gray-400 hover:text-red-500 p-1 h-auto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

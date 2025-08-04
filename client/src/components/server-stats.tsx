import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

interface ServerStatsData {
  totalStreams: number;
  activeStreams: number;
  storageUsed: number;
  bandwidth: number;
}

export function ServerStats() {
  const { data: stats, isLoading, error } = useQuery<ServerStatsData>({
    queryKey: ["/api/stats"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-gray-100 rounded-lg">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load server statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <i className="fas fa-chart-line text-primary text-sm mr-2"></i>
          Server Statistics
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {stats?.totalStreams || 0}
            </p>
            <p className="text-sm text-gray-600">Total Streams</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-accent">
              {stats?.activeStreams || 0}
            </p>
            <p className="text-sm text-gray-600">Active Now</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-700">
              {formatStorage(stats?.storageUsed || 0)}
            </p>
            <p className="text-sm text-gray-600">Storage Used</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-700">
              {stats?.bandwidth || 0} Mbps
            </p>
            <p className="text-sm text-gray-600">Bandwidth</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-600 h-4 w-4 mr-2" />
            <p className="text-sm text-yellow-800">
              Videos auto-delete after 7 days for storage management
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

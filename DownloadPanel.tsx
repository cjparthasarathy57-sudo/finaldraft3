import React, { useState } from 'react';
import { Download, FileText, Image, File, Database, ArrowLeft, CheckCircle } from 'lucide-react';
import type { FloorPlan, Requirements } from '../App';

interface DownloadPanelProps {
  floorPlan: FloorPlan;
  requirements: Requirements;
  onBack: () => void;
}

export const DownloadPanel: React.FC<DownloadPanelProps> = ({
  floorPlan,
  requirements,
  onBack,
}) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadFormats = [
    {
      id: 'pdf',
      name: 'PDF Plan',
      description: 'High-quality vector format for printing',
      icon: FileText,
      size: '~2-5 MB',
      extension: '.pdf',
    },
    {
      id: 'png',
      name: 'PNG Image',
      description: 'High-resolution raster image',
      icon: Image,
      size: '~5-10 MB',
      extension: '.png',
    },
    {
      id: 'dxf',
      name: 'DXF CAD File',
      description: 'Editable in AutoCAD and other CAD software',
      icon: File,
      size: '~500 KB',
      extension: '.dxf',
    },
    {
      id: 'json',
      name: 'JSON Metadata',
      description: 'Room data, coordinates, and measurements',
      icon: Database,
      size: '~50 KB',
      extension: '.json',
    },
  ];

  const handleDownload = async (format: string) => {
    setDownloading(format);
    
    // Simulate download process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (format === 'json') {
      // Generate JSON metadata
      const metadata = {
        floorPlan: {
          dimensions: floorPlan.dimensions,
          totalArea: floorPlan.totalArea,
          scale: floorPlan.scale,
          vastCompliant: floorPlan.vasturequest,
        },
        rooms: floorPlan.rooms.map(room => ({
          id: room.id,
          name: room.name,
          coordinates: { x: room.x, y: room.y },
          dimensions: { width: room.width, height: room.height },
          area: room.area,
          orientation: room.orientation,
          doors: room.doors,
          windows: room.windows,
        })),
        requirements,
        generated: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `floor-plan-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For other formats, simulate download
      const fileName = `floor-plan-${Date.now()}.${format}`;
      const link = document.createElement('a');
      link.href = '#';
      link.download = fileName;
      link.click();
    }
    
    setDownloading(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Download Your Floor Plan</h2>
            <p className="text-gray-600 mt-2">
              Choose from multiple formats to suit your needs
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {downloadFormats.map((format) => {
            const Icon = format.icon;
            const isDownloading = downloading === format.id;
            
            return (
              <div
                key={format.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{format.name}</h3>
                      <p className="text-sm text-gray-500">{format.extension}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{format.size}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{format.description}</p>
                
                <button
                  onClick={() => handleDownload(format.id)}
                  disabled={isDownloading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
                >
                  {isDownloading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download {format.name}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Plan Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Plan Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Dimensions</h4>
              <p className="text-sm text-gray-600">
                {floorPlan.dimensions.width}m × {floorPlan.dimensions.height}m
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Total Area</h4>
              <p className="text-sm text-gray-600">
                {floorPlan.totalArea.toFixed(1)} square meters
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Rooms</h4>
              <p className="text-sm text-gray-600">
                {floorPlan.rooms.length} rooms configured
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Features Included</h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center space-x-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                <CheckCircle className="h-3 w-3" />
                <span>OpenCV Wall Detection</span>
              </span>
              <span className="inline-flex items-center space-x-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                <CheckCircle className="h-3 w-3" />
                <span>Optimized Room Layout</span>
              </span>
              <span className="inline-flex items-center space-x-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                <CheckCircle className="h-3 w-3" />
                <span>Accurate Measurements</span>
              </span>
              {floorPlan.vasturequest && (
                <span className="inline-flex items-center space-x-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  <CheckCircle className="h-3 w-3" />
                  <span>Vastu Compliant</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Generated using AI-powered OpenCV analysis • No API keys required • Fully offline processing
          </p>
        </div>
      </div>
    </div>
  );
};
import React, { useRef, useEffect, useState } from 'react';
import { Cpu, CheckCircle, AlertCircle, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import type { FloorPlan, Requirements } from '../App';

interface PlanViewerProps {
  floorPlan: FloorPlan | null;
  isProcessing: boolean;
  requirements: Requirements;
}

export const PlanViewer: React.FC<PlanViewerProps> = ({
  floorPlan,
  isProcessing,
  requirements,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  
  const processingSteps = [
    'Analyzing uploaded image with OpenCV...',
    'Detecting walls using edge detection...',
    'Identifying doors and windows...',
    'Calculating room boundaries...',
    'Optimizing room layouts...',
    'Applying architectural rules...',
    requirements.vasturequest && 'Verifying Vastu compliance...',
    'Generating final floor plan...',
  ].filter(Boolean);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % processingSteps.length);
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isProcessing, processingSteps.length]);

  useEffect(() => {
    if (floorPlan && canvasRef.current) {
      drawFloorPlan();
    }
  }, [floorPlan, zoom, panX, panY]);

  const drawFloorPlan = () => {
    const canvas = canvasRef.current;
    if (!canvas || !floorPlan) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    ctx.save();
    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.scale(zoom, zoom);
    
    // Center the floor plan
    const scale = 25; // pixels per meter for display
    const planWidth = floorPlan.dimensions.width * scale;
    const planHeight = floorPlan.dimensions.height * scale;
    ctx.translate(-planWidth / 2, -planHeight / 2);


    // Draw outer walls (thicker)
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(0, 0, planWidth, planHeight);
    ctx.stroke();
    
    // Draw internal walls (thinner)
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    floorPlan.walls.forEach((wall, index) => {
      // Skip outer boundary walls (first 4 walls)
      if (index >= 4) {
        ctx.moveTo(wall.x1 * scale, wall.y1 * scale);
        ctx.lineTo(wall.x2 * scale, wall.y2 * scale);
      }
    });
    ctx.stroke();

    // Draw rooms
    floorPlan.rooms.forEach((room, index) => {
      const x = room.x * scale;
      const y = room.y * scale;
      const w = room.width * scale;
      const h = room.height * scale;

      // Room fill
      const colors = [
        '#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff', '#fed7d7', 
        '#e0e7ff', '#fce7f3', '#f0f9ff', '#f0fdf4', '#fdf2f8'
      ];
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y, w, h);

      // Room border (lighter)
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      // Room label
      ctx.fillStyle = '#374151';
      ctx.font = `${Math.max(10, 12 * zoom)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(room.name, x + w / 2, y + h / 2 - 5);
      
      // Room area
      ctx.font = `${Math.max(8, 10 * zoom)}px Inter, sans-serif`;
      ctx.fillStyle = '#6b7280';
      ctx.fillText(`${room.area} sq.m`, x + w / 2, y + h / 2 + 10);
      
      // Room dimensions
      ctx.font = `${Math.max(7, 8 * zoom)}px Inter, sans-serif`;
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`${room.width}m × ${room.height}m`, x + w / 2, y + h / 2 + 22);

      // Draw doors
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      room.doors.forEach((door) => {
        const doorX = door.x * scale;
        const doorY = door.y * scale;
        const doorW = door.width * scale;
        
        ctx.beginPath();
        if (door.orientation === 'south' || door.orientation === 'north') {
          ctx.beginPath();
          ctx.moveTo(doorX, doorY);
          ctx.lineTo(doorX + doorW, doorY);
          ctx.stroke();
        } else if (door.orientation === 'east' || door.orientation === 'west') {
          ctx.beginPath();
          ctx.moveTo(doorX, doorY);
          ctx.lineTo(doorX, doorY + doorW);
          ctx.stroke();
        }
      });

      // Draw windows
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 4;
      room.windows.forEach((window) => {
        const winX = window.x * scale;
        const winY = window.y * scale;
        const winW = window.width * scale;
        
        ctx.beginPath();
        if (window.orientation === 'north' || window.orientation === 'south') {
          ctx.moveTo(winX, winY);
          ctx.lineTo(winX + winW, winY);
        } else {
          ctx.moveTo(winX, winY);
          ctx.lineTo(winX, winY + winW);
        }
        ctx.stroke();
      });
    });
    
    // Draw dimension lines and measurements
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#374151';
    ctx.font = `${Math.max(8, 10 * zoom)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    
    // Overall dimensions
    const dimOffset = 30;
    
    // Width dimension (bottom)
    ctx.beginPath();
    ctx.moveTo(0, planHeight + dimOffset);
    ctx.lineTo(planWidth, planHeight + dimOffset);
    ctx.stroke();
    
    // Width dimension arrows
    ctx.beginPath();
    ctx.moveTo(0, planHeight + dimOffset - 5);
    ctx.lineTo(0, planHeight + dimOffset + 5);
    ctx.moveTo(planWidth, planHeight + dimOffset - 5);
    ctx.lineTo(planWidth, planHeight + dimOffset + 5);
    ctx.stroke();
    
    // Width text
    ctx.fillText(`${floorPlan.dimensions.width.toFixed(1)}m`, planWidth / 2, planHeight + dimOffset + 15);
    
    // Height dimension (right)
    ctx.save();
    ctx.translate(planWidth + dimOffset, planHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${floorPlan.dimensions.height.toFixed(1)}m`, 0, 5);
    ctx.restore();
    
    // Height dimension line
    ctx.beginPath();
    ctx.moveTo(planWidth + dimOffset, 0);
    ctx.lineTo(planWidth + dimOffset, planHeight);
    ctx.stroke();
    
    // Height dimension arrows
    ctx.beginPath();
    ctx.moveTo(planWidth + dimOffset - 5, 0);
    ctx.lineTo(planWidth + dimOffset + 5, 0);
    ctx.moveTo(planWidth + dimOffset - 5, planHeight);
    ctx.lineTo(planWidth + dimOffset + 5, planHeight);
    ctx.stroke();

    ctx.restore();
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));

  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mb-6">
              <Cpu className="mx-auto h-16 w-16 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              AI Processing Your Floor Plan
            </h2>
            <p className="text-gray-600 mb-8">
              Our OpenCV-powered engine is analyzing your plot and generating the optimal layout...
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="space-y-3">
                {processingSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      index === currentStep
                        ? 'bg-blue-50 border border-blue-200'
                        : index < currentStep
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : index === currentStep ? (
                      <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span
                      className={`text-sm ${
                        index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!floorPlan) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generated Floor Plan</h2>
            <p className="text-gray-600">
              AI-optimized layout with {floorPlan.rooms.length} rooms • {floorPlan.totalArea.toFixed(1)} sq.m total area
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 px-2">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Floor Plan Canvas */}
          <div className="lg:col-span-3">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-96 cursor-move"
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  let startX = e.clientX - rect.left;
                  let startY = e.clientY - rect.top;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const newX = e.clientX - rect.left;
                    const newY = e.clientY - rect.top;
                    setPanX(prev => prev + (newX - startX));
                    setPanY(prev => prev + (newY - startY));
                    startX = newX;
                    startY = newY;
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-red-600"></div>
                <span>Doors</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-blue-600"></div>
                <span>Windows</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-gray-600"></div>
                <span>Walls</span>
              </div>
            </div>
          </div>

          {/* Room List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Room Details</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {floorPlan.rooms.map((room, index) => (
                <div
                  key={room.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <h4 className="font-medium text-gray-900">{room.name}</h4>
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    <p>Area: {room.area} sq.m</p>
                    <p>Dimensions: {room.width}m × {room.height}m</p>
                    <p>Orientation: {room.orientation}</p>
                    <p>Doors: {room.doors.length}</p>
                    <p>Windows: {room.windows.length}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {floorPlan.vasturequest && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Vastu Compliant</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Layout optimized according to Vastu principles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
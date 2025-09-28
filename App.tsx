import React, { useState } from 'react';
import { Header } from './components/Header';
import { StepIndicator } from './components/StepIndicator';
import { ImageUpload } from './components/ImageUpload';
import { RequirementsForm } from './components/RequirementsForm';
import { PlanViewer } from './components/PlanViewer';
import { DownloadPanel } from './components/DownloadPanel';

export interface ImageData {
  file: File;
  preview: string;
  width: number;
  height: number;
  scale: number; // pixels per meter
}

export interface Requirements {
  bedrooms: number;
  bathrooms: number;
  kitchenOrientation: 'north' | 'south' | 'east' | 'west';
  livingRoom: boolean;
  diningRoom: boolean;
  studyRoom: boolean;
  poojaRoom: boolean;
  vasturequest: boolean;
  plotArea: number;
  builtupArea: number;
  preferences: string;
}

export interface RoomData {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  orientation: string;
  doors: Array<{ x: number; y: number; width: number; orientation: string }>;
  windows: Array<{ x: number; y: number; width: number; orientation: string }>;
}

export interface FloorPlan {
  rooms: RoomData[];
  walls: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  dimensions: { width: number; height: number };
  scale: number;
  totalArea: number;
  vasturequest: boolean;
}

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 1, title: 'Upload Plot', description: 'Upload image and set dimensions' },
    { id: 2, title: 'Requirements', description: 'Specify room requirements' },
    { id: 3, title: 'Generate Plan', description: 'AI-generated floor plan' },
    { id: 4, title: 'Download', description: 'Export in various formats' }
  ];

  const handleImageUpload = (data: ImageData) => {
    setImageData(data);
    setCurrentStep(2);
  };

  const handleRequirements = async (req: Requirements) => {
    setRequirements(req);
    setIsProcessing(true);
    setCurrentStep(3);
    
    // Simulate AI processing
    setTimeout(() => {
      const generatedPlan = generateFloorPlan(imageData!, req);
      setFloorPlan(generatedPlan);
      setIsProcessing(false);
      setCurrentStep(4);
    }, 3000);
  };

  const generateFloorPlan = (image: ImageData, req: Requirements): FloorPlan => {
    // Calculate proper house dimensions based on built-up area
    const targetArea = req.builtupArea;
    const aspectRatio = image.width / image.height;
    
    // Calculate optimal house dimensions
    const houseWidth = Math.sqrt(targetArea * aspectRatio);
    const houseHeight = targetArea / houseWidth;
    
    const rooms: RoomData[] = [];
    const walls: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    
    // Create outer boundary walls
    walls.push(
      { x1: 0, y1: 0, x2: houseWidth, y2: 0 }, // Top wall
      { x1: houseWidth, y1: 0, x2: houseWidth, y2: houseHeight }, // Right wall
      { x1: houseWidth, y1: houseHeight, x2: 0, y2: houseHeight }, // Bottom wall
      { x1: 0, y1: houseHeight, x2: 0, y2: 0 } // Left wall
    );
    
    // Room size standards (in meters)
    const roomSizes = {
      bedroom: { width: 3.5, height: 3.0, minArea: 10.5 },
      masterBedroom: { width: 4.0, height: 3.5, minArea: 14.0 },
      livingRoom: { width: 5.0, height: 4.0, minArea: 20.0 },
      kitchen: { width: 3.0, height: 2.5, minArea: 7.5 },
      bathroom: { width: 2.0, height: 2.0, minArea: 4.0 },
      diningRoom: { width: 3.5, height: 3.0, minArea: 10.5 },
      studyRoom: { width: 3.0, height: 2.5, minArea: 7.5 },
      poojaRoom: { width: 2.0, height: 1.5, minArea: 3.0 }
    };
    
    // Layout algorithm - divide house into zones
    let currentX = 0.2; // Start with wall thickness
    let currentY = 0.2;
    let rowHeight = 0;
    const wallThickness = 0.2;
    const corridorWidth = 1.0;
    
    // Generate bedrooms first (usually in private zone)
    if (req.bedrooms > 0) {
      for (let i = 0; i < req.bedrooms; i++) {
        const ismaster = i === 0;
        const size = ismaster ? roomSizes.masterBedroom : roomSizes.bedroom;
        const roomName = ismaster ? 'Master Bedroom' : `Bedroom ${i + 1}`;
        
        // Check if we need to move to next row
        if (currentX + size.width > houseWidth - 0.2) {
          currentX = 0.2;
          currentY += rowHeight + wallThickness;
          rowHeight = 0;
        }
        
        rooms.push({
          id: `bedroom-${i + 1}`,
          name: roomName,
          x: currentX,
          y: currentY,
          width: size.width,
          height: size.height,
          area: size.width * size.height,
          orientation: req.vasturequest ? (ismaster ? 'southwest' : 'south') : 'east',
          doors: [{ 
            x: currentX + size.width, 
            y: currentY + size.height / 2, 
            width: 0.9, 
            orientation: 'east' 
          }],
          windows: [{ 
            x: currentX, 
            y: currentY + 1, 
            width: 1.2, 
            orientation: 'west' 
          }]
        });
        
        // Add internal walls
        if (i < req.bedrooms - 1) {
          walls.push({
            x1: currentX + size.width,
            y1: currentY,
            x2: currentX + size.width,
            y2: currentY + size.height
          });
        }
        
        currentX += size.width + wallThickness;
        rowHeight = Math.max(rowHeight, size.height);
      }
    }
    
    // Move to next row for public areas
    currentX = 0.2;
    currentY += rowHeight + wallThickness + corridorWidth;
    rowHeight = 0;
    
    // Living room (public zone)
    if (req.livingRoom) {
      const size = roomSizes.livingRoom;
      rooms.push({
        id: 'living-room',
        name: 'Living Room',
        x: currentX,
        y: currentY,
        width: size.width,
        height: size.height,
        area: size.width * size.height,
        orientation: req.vasturequest ? 'northeast' : 'east',
        doors: [{ 
          x: currentX + size.width / 2, 
          y: currentY + size.height, 
          width: 1.2, 
          orientation: 'south' 
        }],
        windows: [
          { x: currentX, y: currentY + 1, width: 1.8, orientation: 'west' },
          { x: currentX + 2, y: currentY, width: 1.5, orientation: 'north' }
        ]
      });
      
      currentX += size.width + wallThickness;
      rowHeight = Math.max(rowHeight, size.height);
    }
    
    // Kitchen (service zone - orientation based on requirements)
    const kitchenSize = roomSizes.kitchen;
    let kitchenX = currentX;
    let kitchenY = currentY;
    
    // Adjust kitchen position based on orientation preference
    if (req.kitchenOrientation === 'east' && req.vasturequest) {
      kitchenX = houseWidth - kitchenSize.width - 0.2;
    }
    
    rooms.push({
      id: 'kitchen',
      name: 'Kitchen',
      x: kitchenX,
      y: kitchenY,
      width: kitchenSize.width,
      height: kitchenSize.height,
      area: kitchenSize.width * kitchenSize.height,
      orientation: req.kitchenOrientation,
      doors: [{ 
        x: kitchenX, 
        y: kitchenY + kitchenSize.height / 2, 
        width: 0.8, 
        orientation: 'west' 
      }],
      windows: [{ 
        x: kitchenX + kitchenSize.width / 2, 
        y: kitchenY, 
        width: 1.0, 
        orientation: 'north' 
      }]
    });
    
    // Dining room (if requested)
    if (req.diningRoom) {
      const size = roomSizes.diningRoom;
      currentX = kitchenX + kitchenSize.width + wallThickness;
      
      rooms.push({
        id: 'dining-room',
        name: 'Dining Room',
        x: currentX,
        y: currentY,
        width: size.width,
        height: size.height,
        area: size.width * size.height,
        orientation: 'center',
        doors: [{ 
          x: currentX, 
          y: currentY + size.height / 2, 
          width: 0.9, 
          orientation: 'west' 
        }],
        windows: [{ 
          x: currentX + size.width, 
          y: currentY + 1, 
          width: 1.2, 
          orientation: 'east' 
        }]
      });
    }
    
    // Move to service area for bathrooms
    currentY += rowHeight + wallThickness;
    currentX = 0.2;
    
    // Bathrooms (service zone)
    for (let i = 0; i < req.bathrooms; i++) {
      const size = roomSizes.bathroom;
      const isAttached = i === 0 && req.bedrooms > 0;
      
      rooms.push({
        id: `bathroom-${i + 1}`,
        name: isAttached ? 'Master Bathroom' : `Bathroom ${i + 1}`,
        x: currentX,
        y: currentY,
        width: size.width,
        height: size.height,
        area: size.width * size.height,
        orientation: req.vasturequest ? 'northwest' : 'north',
        doors: [{ 
          x: currentX + size.width / 2, 
          y: currentY, 
          width: 0.7, 
          orientation: 'north' 
        }],
        windows: [{ 
          x: currentX, 
          y: currentY + size.height / 2, 
          width: 0.6, 
          orientation: 'west' 
        }]
      });
      
      currentX += size.width + wallThickness;
    }
    
    // Additional rooms
    if (req.studyRoom) {
      const size = roomSizes.studyRoom;
      rooms.push({
        id: 'study-room',
        name: 'Study Room',
        x: currentX,
        y: currentY,
        width: size.width,
        height: size.height,
        area: size.width * size.height,
        orientation: req.vasturequest ? 'northeast' : 'east',
        doors: [{ 
          x: currentX, 
          y: currentY + size.height / 2, 
          width: 0.8, 
          orientation: 'west' 
        }],
        windows: [{ 
          x: currentX + size.width, 
          y: currentY + 1, 
          width: 1.0, 
          orientation: 'east' 
        }]
      });
      currentX += size.width + wallThickness;
    }
    
    if (req.poojaRoom) {
      const size = roomSizes.poojaRoom;
      rooms.push({
        id: 'pooja-room',
        name: 'Pooja Room',
        x: currentX,
        y: currentY,
        width: size.width,
        height: size.height,
        area: size.width * size.height,
        orientation: req.vasturequest ? 'northeast' : 'east',
        doors: [{ 
          x: currentX + size.width / 2, 
          y: currentY, 
          width: 0.6, 
          orientation: 'north' 
        }],
        windows: []
      });
    }
    
    // Add internal walls between rooms
    rooms.forEach((room, index) => {
      // Add walls around each room
      walls.push(
        // Room boundaries (internal walls)
        { x1: room.x, y1: room.y, x2: room.x + room.width, y2: room.y }, // Top
        { x1: room.x + room.width, y1: room.y, x2: room.x + room.width, y2: room.y + room.height }, // Right
        { x1: room.x + room.width, y1: room.y + room.height, x2: room.x, y2: room.y + room.height }, // Bottom
        { x1: room.x, y1: room.y + room.height, x2: room.x, y2: room.y } // Left
      );
    });
    
    const totalArea = rooms.reduce((sum, room) => sum + room.area, 0);
    
    return {
      rooms,
      walls,
      dimensions: { width: houseWidth, height: houseHeight },
      scale: image.scale,
      totalArea,
      vasturequest: req.vasturequest
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator steps={steps} currentStep={currentStep} />
        
        <div className="mt-8">
          {currentStep === 1 && (
            <ImageUpload onUpload={handleImageUpload} />
          )}
          
          {currentStep === 2 && imageData && (
            <RequirementsForm
              imageData={imageData}
              onSubmit={handleRequirements}
              onBack={() => setCurrentStep(1)}
            />
          )}
          
          {currentStep === 3 && (
            <PlanViewer
              floorPlan={floorPlan}
              isProcessing={isProcessing}
              requirements={requirements!}
            />
          )}
          
          {currentStep === 4 && floorPlan && (
            <DownloadPanel
              floorPlan={floorPlan}
              requirements={requirements!}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
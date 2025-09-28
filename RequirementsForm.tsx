import React, { useState } from 'react';
import { ArrowLeft, Home, Bath, ChefHat, Book, Heart, Compass } from 'lucide-react';
import type { ImageData, Requirements } from '../App';

interface RequirementsFormProps {
  imageData: ImageData;
  onSubmit: (requirements: Requirements) => void;
  onBack: () => void;
}

export const RequirementsForm: React.FC<RequirementsFormProps> = ({
  imageData,
  onSubmit,
  onBack,
}) => {
  const [requirements, setRequirements] = useState<Requirements>({
    bedrooms: 2,
    bathrooms: 2,
    kitchenOrientation: 'east',
    livingRoom: true,
    diningRoom: true,
    studyRoom: false,
    poojaRoom: false,
    vasturequest: false,
    plotArea: imageData.width * imageData.height,
    builtupArea: (imageData.width * imageData.height) * 0.6,
    preferences: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(requirements);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Room Requirements</h2>
            <p className="text-gray-600 mt-2">
              Specify your requirements and preferences for the floor plan generation
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Upload</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Room Count */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Room Configuration
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={requirements.bedrooms}
                    onChange={(e) =>
                      setRequirements({ ...requirements, bedrooms: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <select
                    value={requirements.bathrooms}
                    onChange={(e) =>
                      setRequirements({ ...requirements, bathrooms: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ChefHat className="h-4 w-4 mr-1" />
                  Kitchen Orientation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['north', 'south', 'east', 'west'] as const).map((direction) => (
                    <label key={direction} className="flex items-center">
                      <input
                        type="radio"
                        name="kitchenOrientation"
                        value={direction}
                        checked={requirements.kitchenOrientation === direction}
                        onChange={(e) =>
                          setRequirements({
                            ...requirements,
                            kitchenOrientation: e.target.value as any,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="capitalize">{direction}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Rooms</h4>
                <div className="space-y-2">
                  {[
                    { key: 'livingRoom', label: 'Living Room', icon: Home },
                    { key: 'diningRoom', label: 'Dining Room', icon: ChefHat },
                    { key: 'studyRoom', label: 'Study Room', icon: Book },
                    { key: 'poojaRoom', label: 'Pooja Room', icon: Heart },
                  ].map(({ key, label, icon: Icon }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={requirements[key as keyof Requirements] as boolean}
                        onChange={(e) =>
                          setRequirements({
                            ...requirements,
                            [key]: e.target.checked,
                          })
                        }
                        className="mr-3 rounded"
                      />
                      <Icon className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Area & Preferences */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Compass className="h-5 w-5 mr-2" />
                Area & Preferences
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plot Area (sq.m) - Auto calculated
                  </label>
                  <input
                    type="number"
                    value={requirements.plotArea}
                    onChange={(e) =>
                      setRequirements({ ...requirements, plotArea: parseFloat(e.target.value) })
                    }
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Built-up Area (sq.m)
                  </label>
                  <input
                    type="number"
                    value={requirements.builtupArea}
                    onChange={(e) =>
                      setRequirements({ ...requirements, builtupArea: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="50"
                    max={requirements.plotArea * 0.8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: {Math.round(requirements.plotArea * 0.6)} - {Math.round(requirements.plotArea * 0.8)} sq.m
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={requirements.vasturequest}
                    onChange={(e) =>
                      setRequirements({ ...requirements, vasturequest: e.target.checked })
                    }
                    className="mr-3 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Apply Vastu Shastra principles
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Optimize room placement according to traditional Indian architecture
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements
                </label>
                <textarea
                  value={requirements.preferences}
                  onChange={(e) =>
                    setRequirements({ ...requirements, preferences: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any specific requirements, preferences, or constraints..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">AI Processing Will Include:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Room size optimization based on usage patterns</li>
                  <li>• Traffic flow analysis and corridor planning</li>
                  <li>• Natural light and ventilation optimization</li>
                  <li>• Privacy and functionality balance</li>
                  {requirements.vasturequest && <li>• Vastu compliance verification</li>}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-8 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Generate Floor Plan with AI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
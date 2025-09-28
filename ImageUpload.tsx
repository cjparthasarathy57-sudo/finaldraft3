import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Ruler, Info } from 'lucide-react';
import type { ImageData } from '../App';

interface ImageUploadProps {
  onUpload: (data: ImageData) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState({ width: '', height: '' });
  const [scale, setScale] = useState('100'); // pixels per meter

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (file && preview && dimensions.width && dimensions.height && scale) {
      const imageData: ImageData = {
        file,
        preview,
        width: parseFloat(dimensions.width),
        height: parseFloat(dimensions.height),
        scale: parseFloat(scale)
      };
      onUpload(imageData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Plot Image</h2>
        <p className="text-gray-600 mb-8">
          Upload your plot sketch or architectural drawing. Our AI will analyze walls, doors, and windows using OpenCV.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Upload Section */}
          <div>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : preview
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {preview ? (
                <div>
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg shadow-md"
                  />
                  <p className="mt-4 text-sm text-green-600 font-medium">
                    Image uploaded successfully
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your plot image here
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex items-start space-x-2 text-sm text-blue-600">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Our AI will detect walls, doors, windows, and room boundaries using advanced
                computer vision algorithms (OpenCV + edge detection).
              </p>
            </div>
          </div>

          {/* Dimensions Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Ruler className="h-5 w-5 mr-2" />
              Plot Dimensions & Scale
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width (meters)
                  </label>
                  <input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (meters)
                  </label>
                  <input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scale (pixels per meter)
                </label>
                <select
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="50">50 px/m (Low detail)</option>
                  <option value="100">100 px/m (Medium detail)</option>
                  <option value="150">150 px/m (High detail)</option>
                  <option value="200">200 px/m (Very high detail)</option>
                </select>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Processing Preview:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Edge detection for wall identification</li>
                  <li>• Contour analysis for room boundaries</li>
                  <li>• Template matching for doors/windows</li>
                  <li>• Hough transform for straight line detection</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!file || !dimensions.width || !dimensions.height || !scale}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {file && dimensions.width && dimensions.height && scale
                ? 'Proceed to Requirements'
                : 'Complete all fields to continue'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
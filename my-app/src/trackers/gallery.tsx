import React, { useState, useEffect, useRef } from 'react';
import { FolderOpenDotIcon, AlertCircle, ZoomIn, ZoomOut, Download, X, Move } from 'lucide-react';

// Define types for our gallery data
interface ImageData {
  id?: string;
  src: string;
  alt?: string;
}

interface GalleryData {
  id: string;
  name: string; // date as string in format "YYYY / MM / DD"
  images: ImageData[];
}

// Modal Component for Image Viewing
interface ImageModalProps {
  image: ImageData | null;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!image) return;
    
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `image-${image.id || Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't initiate drag if we're clicking on a button or a control
    if (e.target !== imageRef.current) return;
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setIsDragging(false);
    }
  };

  const resetView = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleControlClick = (e: React.MouseEvent) => {
    // Prevent the click from propagating to the modal background
    e.stopPropagation();
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // We'll modify how we handle modal closing to prevent issues with controls
  useEffect(() => {
    // Instead of using a click outside handler that might interfere with our controls,
    // we'll only add a background click handler and handle controls explicitly
    const modalBackground = document.querySelector('.modal-background');
    
    const handleBackgroundClick = (e: MouseEvent) => {
      // Only close if clicking directly on the background element
      if (e.target === modalBackground) {
        onClose();
      }
    };
    
    if (isOpen && modalBackground) {
      modalBackground.addEventListener('click', handleBackgroundClick);
    }
    
    return () => {
      if (modalBackground) {
        modalBackground.removeEventListener('click', handleBackgroundClick);
      }
    };
  }, [isOpen, onClose]);

  // Reset view when opening new image
  useEffect(() => {
    resetView();
  }, [image]);

  // Add event listeners to the window to handle mouse moves and ups that occur outside the modal
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };
    
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center backdrop-blur-sm modal-background">
      <div 
        className="absolute top-4 right-4 flex space-x-2 z-20"
        onClick={handleControlClick}
      >
        <button 
          onClick={handleZoomIn}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button 
          onClick={handleDownload}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
          title="Download Image"
        >
          <Download size={20} />
        </button>
        <button 
          onClick={resetView}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
          title="Reset View"
        >
          <Move size={20} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>
      
      <div 
        ref={modalRef}
        className="relative overflow-hidden w-full h-full flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          ref={imageRef}
          src={image.src} 
          alt={image.alt || 'Image preview'} 
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          draggable="false"
          onError={(e) => {
            e.currentTarget.src = '/api/placeholder/800/600';
            e.currentTarget.alt = 'Image failed to load';
          }}
        />
      </div>
      
      <div 
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-70 px-4 py-2 rounded-lg text-white z-20"
        onClick={handleControlClick}
      >
        <p className="text-sm">{image.alt || 'Image preview'}</p>
        <p className="text-xs text-gray-300 mt-1">Zoom: {Math.round(scale * 100)}% • Drag to move</p>
      </div>
    </div>
  );
};

// Loading Component
const LoadingState = () => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl h-full flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading image gallery...</p>
    </div>
  );
};

// Error Component
const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl h-full flex flex-col items-center justify-center">
      <div className="bg-red-100 p-4 rounded-xl mb-4 w-full max-w-md">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-red-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading gallery</h3>
            <p className="mt-1 text-sm text-red-700">{error.message || "An unexpected error occurred"}</p>
          </div>
        </div>
      </div>
      <div 
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
      >
        Retry
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-12">
      <div className="flex flex-col items-center justify-center">
        <FolderOpenDotIcon className="h-10 w-10 text-gray-400" />
        <p className="text-gray-500 text-sm font-[600] mt-2">No images available</p>
      </div>
    </div>
  );
};

const ImageGallery = () => {
  const [galleries, setGalleries] = useState<GalleryData[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<GalleryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [modalImage, setModalImage] = useState<ImageData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to process API data into gallery format
  const processImagesData = (imagesData: { date: string, image: string | null }[]) => {
    // Group images by date
    const groupedByDate: Record<string, ImageData[]> = {};
    
    imagesData.forEach((item, index) => {
      const { date, image } = item;
      
      // Skip items with null images if needed
      if (image === null) return;
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      
      groupedByDate[date].push({
        id: `img-${date}-${index}`,
        src: image,
        alt: `Image from ${date}`
      });
    });
    
    // Convert to gallery format
    const galleryData: GalleryData[] = Object.keys(groupedByDate).map(date => ({
      id: date,
      name: date,
      images: groupedByDate[date]
    }));
    
    // Sort by date (newest first)
    galleryData.sort((a, b) => b.name.localeCompare(a.name));
    
    return galleryData;
  };

  // Fetch gallery data
  const fetchGalleryData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/images');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.images) {
        throw new Error('Invalid data format from API');
      }
      
      const processedGalleries = processImagesData(data.images);
      setGalleries(processedGalleries);
      
      // Set the first gallery as selected if available
      if (processedGalleries.length > 0) {
        setSelectedGallery(processedGalleries[0]);
      } else {
        setSelectedGallery(null);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching gallery data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load gallery'));
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchGalleryData();
  }, []);

  // Handle retry on error
  const handleRetry = () => {
    fetchGalleryData();
  };

  // Open modal with image
  const openImageModal = (image: ImageData) => {
    setModalImage(image);
    setIsModalOpen(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
  };

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Empty state
  if (galleries.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll h-full">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll h-full">
      
      {/* Gallery Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              onClick={() => setSelectedGallery(gallery)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                selectedGallery?.id === gallery.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {gallery.name}
            </div>
          ))}
        </div>
      </div>
      
      {/* Selected Gallery Display */}
      {selectedGallery && selectedGallery.images.length > 0 ? (
        <div>          
          {/* Image Gallery Container */}
          <div className="rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedGallery.images.map((image) => (
                <div 
                  key={image.id} 
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative group">
                    <img 
                      src={image.src} 
                      alt={image.alt}
                      className="w-full h-64 object-cover cursor-pointer"
                      onClick={() => openImageModal(image)}
                      onError={(e) => {
                        // Fallback image if the URL doesn't load
                        e.currentTarget.src = '/api/placeholder/800/600';
                        e.currentTarget.alt = 'Image failed to load';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => openImageModal(image)}
                        className="px-4 py-2 bg-white text-gray-800 rounded-lg shadow hover:bg-gray-100 transition-colors font-medium"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <p className="text-gray-700">{image.alt}</p>
                    <button
                      onClick={() => openImageModal(image)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition-colors text-sm"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-xl shadow">
          <p className="text-gray-600">No images available for this date</p>
        </div>
      )}
      
      {/* Image Modal */}
      <ImageModal 
        image={modalImage} 
        isOpen={isModalOpen} 
        onClose={closeImageModal} 
      />
    </div>
  );
};

export default ImageGallery;
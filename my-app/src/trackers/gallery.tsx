import React, { useState } from 'react';

// Define types for our gallery data
const sampleGalleries = [
  {
    id: '1',
    name: '2025 / 03 / 01',
    images: [
      { id: 'nature-1', src: '/api/placeholder/800/600', alt: 'Front' },
      { id: 'nature-2', src: '/api/placeholder/800/600', alt: 'Back' },
      { id: 'nature-3', src: '/api/placeholder/800/600', alt: 'Ocean sunset' },
      { id: 'nature-4', src: '/api/placeholder/800/600', alt: 'Desert view' },
    ],
  },
  {
    id: '2',
    name: '2025 / 03 / 02',
    images: [
      { id: 'nature-1', src: '/api/placeholder/800/600', alt: 'Front2' },
      { id: 'nature-2', src: '/api/placeholder/800/600', alt: 'Back' },
      { id: 'nature-3', src: '/api/placeholder/800/600', alt: 'Ocean sunset' },
      { id: 'nature-4', src: '/api/placeholder/800/600', alt: 'Desert view' },
    ],
  },
  {
    id: '3',
    name: '2025 / 03 / 03',
    images: [
      { id: 'nature-1', src: '/api/placeholder/800/600', alt: 'Fron3t' },
      { id: 'nature-2', src: '/api/placeholder/800/600', alt: 'Back' },
      { id: 'nature-3', src: '/api/placeholder/800/600', alt: 'Ocean sunset' },
      { id: 'nature-4', src: '/api/placeholder/800/600', alt: 'Desert view' },
    ],
  },
];

const ImageGallery = () => {
  const [selectedGallery, setSelectedGallery] = useState(
    sampleGalleries.length > 0 ? sampleGalleries[0] : null
  );

  return (
    <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll h-full">
      
      {/* Gallery Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-md overflow-x-scroll">
          {sampleGalleries.map((gallery) => (
            <div
              key={gallery.id}
              onClick={() => setSelectedGallery(gallery)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
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
      {selectedGallery ? (
        <div>          
          {/* Image Gallery Container with scrolling */}
          <div className="bg-gray-50 p-6 rounded-xl overflow-y-scroll">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedGallery.images.map((image) => (
                <div key={image.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-gray-700">{image.alt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-xl">
          <p className="text-gray-600">No gallery selected or available</p>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
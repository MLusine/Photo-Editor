

import React from 'react';
import './AllPhotos.css';


interface PhotoData {
  url: string;
  width: number;
  height: number;
}

interface AllPhotosProps {
  photos: PhotoData[];
  onRemovePhoto: (index: number) => void;
}

const AllPhotos: React.FC<AllPhotosProps> = ({ photos, onRemovePhoto }) => {
  return (
    <div className="all-photos">
      <div className="all-photos__grid">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            className="all-photos__item"
          >

            <img
              style={{ '--photo-width': photo.width ? `${photo.width}px` : undefined, '--photo-height': photo.height ? `${photo.height}px` : undefined } as React.CSSProperties}
              src={photo.url || ''}
              alt={`Photo ${idx + 1}`}
              className="all-photos__img"
            />
            <button
              onClick={() => onRemovePhoto(idx)}
              className="all-photos__delete-btn"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AllPhotos;

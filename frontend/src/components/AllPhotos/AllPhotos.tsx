
import React from 'react';
import { useState, useEffect } from 'react';

interface AllPhotosProps {
  photos: string[];
  onRemovePhoto: (index: number) => void;
}

const AllPhotos: React.FC<AllPhotosProps> = ({ photos, onRemovePhoto }) => {
  return (
    <div style={{display: 'flex',flexDirection:'column', padding: '10px',}}>
      <h2>My Photos</h2>
     
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {photos.map((photo, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '140px',
                height: '180px',
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'flex-start',   
              }}
            >
              <img
                src={photo}
                alt={`Photo ${idx + 1}`}
                style={{ width: 140, height: 140, borderRadius: 4, objectFit: 'cover' }}
              />
              <button
                onClick={() => onRemovePhoto(idx)}
                style={{
                  marginTop: 8,
                  background: '#000',    
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 12px',
                  cursor: 'pointer'
                }}
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

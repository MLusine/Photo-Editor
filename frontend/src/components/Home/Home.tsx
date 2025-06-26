import React from 'react';
import { PhotoEditor } from '../PhotoEditor';
import { AllPhotos } from '../AllPhotos';

function Home({ handleAddPhoto, handleRemovePhoto, photos }: { handleAddPhoto: (photoDataUrl: string) => void, handleRemovePhoto: (index: number) => void, photos: string[] }) {
    return (
        <div>
            <PhotoEditor onAddPhoto={handleAddPhoto} />
            <AllPhotos photos={photos} onRemovePhoto={handleRemovePhoto} />
        </div>
    );
}

export default Home;
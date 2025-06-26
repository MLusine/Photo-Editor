import React, { useState } from 'react';
import { PhotoUpload } from '../PhotoUpload';
import { AllPhotos } from '../AllPhotos';
import Header from '../Header/Header';


function Home({ handleAddPhoto, handleRemovePhoto, photos }: { handleAddPhoto: (photoDataUrl: string) => void, handleRemovePhoto: (index: number) => void, photos: string[] }) {



    return (
        <div>
            <Header />
            <PhotoUpload onAddPhoto={handleAddPhoto} />
            <AllPhotos
                photos={photos.map((photo, index) => ({
                    url: photo,
                    id: index,
                    width: 0,
                    height: 0,
                }))}
                onRemovePhoto={handleRemovePhoto}
            />
        </div>
    );
}

export default Home;
// Crop

// Resize

import React, { useRef, useState } from 'react';

interface PhotoEditorProps {
  onAddPhoto: (photoDataUrl: string) => void;
}

type EditMode = 'none' | 'crop' | 'resize' | 'pixelate' | 'bw' | 'removebg';

// Helper function to get image width and height from a data URL
const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};

const PhotoEditor: React.FC<PhotoEditorProps> = ({ onAddPhoto }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [resize, setResize] = useState({ width: 200, height: 200 });
  const [pixelSize, setPixelSize] = useState(10);
  const [isBW, setIsBW] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setEditMode('none');
    setIsBW(false);
    setIsRemovingBg(false);
  };

  // --- Editing Handlers ---

  // Crop
  const handleCrop = () => {
    if (!previewUrl) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Ensure crop dimensions are within image bounds
      const cropX = Math.max(0, Math.min(crop.x, img.width - 1));
      const cropY = Math.max(0, Math.min(crop.y, img.height - 1));
      const cropWidth = Math.max(1, Math.min(crop.width, img.width - cropX));
      const cropHeight = Math.max(1, Math.min(crop.height, img.height - cropY));
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );
      setPreviewUrl(canvas.toDataURL());
      setEditMode('none');
    };
    img.src = previewUrl;
  };
  
  // Resize
  const handleResize = () => {
    if (!previewUrl) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Prevent zero or negative dimensions
      const newWidth = Math.max(1, resize.width);
      const newHeight = Math.max(1, resize.height);
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        0, 0, img.width, img.height,
        0, 0, newWidth, newHeight
      );
      setPreviewUrl(canvas.toDataURL());
      setEditMode('none');
    };
    img.src = previewUrl;
  };
  

  // Pixelate
  const handlePixelate = () => {
    if (!previewUrl) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = img.width;
      const h = img.height;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Draw small
      ctx.drawImage(img, 0, 0, w / pixelSize, h / pixelSize);
      // Stretch to fill
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, w / pixelSize, h / pixelSize, 0, 0, w, h);
      setPreviewUrl(canvas.toDataURL());
      setEditMode('none');
    };
    img.src = previewUrl;
  };

  // Black & White
  const handleBW = () => {
    if (!previewUrl) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        imageData.data[i] = avg;
        imageData.data[i + 1] = avg;
        imageData.data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setEditMode('none');
    };
    img.src = previewUrl;
  };

  // Remove Background (simple: make white transparent)
  const handleRemoveBg = () => {
    if (!previewUrl) return;
    setIsRemovingBg(true);
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        // If pixel is close to white, make transparent
        if (
          imageData.data[i] > 240 &&
          imageData.data[i + 1] > 240 &&
          imageData.data[i + 2] > 240
        ) {
          imageData.data[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setEditMode('none');
      setIsRemovingBg(false);
    };
    img.src = previewUrl;
  };

  // Save to album
  const handleSave = () => {
    if (previewUrl) {
      onAddPhoto(previewUrl);
      handleRemoveImage();
    }
  };

  // UI for editing controls
  return (
    <div>
      <button onClick={handleUploadClick} style={{ background: '#c209c1', border: '1px solid #c209c1', padding: '10px', borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Upload Photo</button>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {previewUrl && (
        <div style={{ marginTop: 16 }}>
          <div>
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: 140, height: 140, display: 'block', marginBottom: 8 }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <button onClick={handleRemoveImage}>Delete</button>
            <button onClick={() => setEditMode('crop')}>Crop</button>
            <button onClick={() => setEditMode('resize')}>Resize</button>
            <button onClick={() => setEditMode('pixelate')}>Pixelate</button>
            <button onClick={() => setEditMode('bw')}>Black & White</button>
            <button onClick={() => setEditMode('removebg')}>Remove Background</button>
          </div>
          {/* Editing UIs */}
          {editMode === 'crop' && (
            <div style={{ marginBottom: 8 }}>
              <label>
                x: <input type="number" value={crop.x} onChange={e => setCrop({ ...crop, x: Number(e.target.value) })} style={{ width: 50 }} />
              </label>
              <label>
                y: <input type="number" value={crop.y} onChange={e => setCrop({ ...crop, y: Number(e.target.value) })} style={{ width: 50 }} />
              </label>
              <label>
                width: <input type="number" value={crop.width} onChange={e => setCrop({ ...crop, width: Number(e.target.value) })} style={{ width: 50 }} />
              </label>
              <label>
                height: <input type="number" value={crop.height} onChange={e => setCrop({ ...crop, height: Number(e.target.value) })} style={{ width: 50 }} />
              </label>
              <button onClick={handleCrop}>Apply Crop</button>
              <button onClick={() => setEditMode('none')}>Cancel</button>
            </div>
          )}
          {editMode === 'resize' && (
            <div style={{ marginBottom: 8 }}>
              <label>
                width: <input type="number" value={resize.width} onChange={e => setResize({ ...resize, width: Number(e.target.value) })} style={{ width: 60 }} />
              </label>
              <label>
                height: <input type="number" value={resize.height} onChange={e => setResize({ ...resize, height: Number(e.target.value) })} style={{ width: 60 }} />
              </label>
              <button onClick={handleResize}>Apply Resize</button>
              <button onClick={() => setEditMode('none')}>Cancel</button>
            </div>
          )}
          {editMode === 'pixelate' && (
            <div style={{ marginBottom: 8 }}>
              <label>
                Pixel Size: <input type="number" min={2} max={100} value={pixelSize} onChange={e => setPixelSize(Number(e.target.value))} style={{ width: 60 }} />
              </label>
              <button onClick={handlePixelate}>Apply Pixelate</button>
              <button onClick={() => setEditMode('none')}>Cancel</button>
            </div>
          )}
          {editMode === 'bw' && (
            <div style={{ marginBottom: 8 }}>
              <button onClick={handleBW}>Apply Black & White</button>
              <button onClick={() => setEditMode('none')}>Cancel</button>
            </div>
          )}
          {editMode === 'removebg' && (
            <div style={{ marginBottom: 8 }}>
              <button onClick={handleRemoveBg} disabled={isRemovingBg}>
                {isRemovingBg ? 'Processing...' : 'Apply Remove Background'}
              </button>
              <button onClick={() => setEditMode('none')}>Cancel</button>
            </div>
          )}
          <button onClick={handleSave} style={{ marginTop: 8 }}>Save to Album</button>
        </div>
      )}
    </div>
  );
};

export default PhotoEditor;



// // Helper function to get image width and height from a data URL
// const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
//   return new Promise((resolve, reject) => {
//     const img = new window.Image();
//     img.onload = () => {
//       resolve({ width: img.width, height: img.height });
//     };
//     img.onerror = reject;
//     img.src = dataUrl;
//   });
// };


// import React, { useRef, useState } from 'react';

// interface PhotoEditorProps {
//   onAddPhoto: (photoDataUrl: string) => void;
// }

// type EditMode = 'none' | 'crop' | 'resize' | 'pixelate' | 'bw' | 'removebg';

// const PhotoEditor: React.FC<PhotoEditorProps> = ({ onAddPhoto }) => {
//   const [selectedImage, setSelectedImage] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [editMode, setEditMode] = useState<EditMode>('none');
//   const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
//   const [resize, setResize] = useState({ width: 200, height: 200 });
//   const [pixelSize, setPixelSize] = useState(10);
//   const [isBW, setIsBW] = useState(false);
//   const [isRemovingBg, setIsRemovingBg] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files && event.target.files[0];
//     if (file) {
//       setSelectedImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const result = reader.result as string;
//         setPreviewUrl(result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleUploadClick = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   const handleRemoveImage = () => {
//     setSelectedImage(null);
//     setPreviewUrl(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//     setEditMode('none');
//     setIsBW(false);
//     setIsRemovingBg(false);
//   };

//   // --- Editing Handlers ---

//   // Crop
//   const handleCrop = () => {
//     if (!previewUrl) return;
//     const img = new window.Image();
//     img.onload = () => {
//       const canvas = canvasRef.current;
//       if (!canvas) return;
//       canvas.width = crop.width;
//       canvas.height = crop.height;
//       const ctx = canvas.getContext('2d');
//       if (!ctx) return;
//       ctx.drawImage(
//         img,
//         crop.x, crop.y, crop.width, crop.height,
//         0, 0, crop.width, crop.height
//       );
//       setPreviewUrl(canvas.toDataURL());
//       setEditMode('none');
//     };
//     img.src = previewUrl;
//   };

//   // Resize
//   const handleResize = () => {
//     if (!previewUrl) return;
//     const img = new window.Image();
//     img.onload = () => {
//       const canvas = canvasRef.current;
//       if (!canvas) return;
//       canvas.width = resize.width;
//       canvas.height = resize.height;
//       const ctx = canvas.getContext('2d');
//       if (!ctx) return;
//       ctx.drawImage(img, 0, 0, resize.width, resize.height);
//       setPreviewUrl(canvas.toDataURL());
//       setEditMode('none');
//     };
//     img.src = previewUrl;
//   };
//   // Pixelate
//   const handlePixelate = () => {
//     if (!previewUrl) return;
//     const img = new window.Image();
//     img.onload = () => {
//       const canvas = canvasRef.current;
//       if (!canvas) return;
//       const w = img.width;
//       const h = img.height;
//       canvas.width = w;
//       canvas.height = h;
//       const ctx = canvas.getContext('2d');
//       if (!ctx) return;
//       // Draw small
//       ctx.drawImage(img, 0, 0, w / pixelSize, h / pixelSize);
//       // Stretch to fill
//       ctx.imageSmoothingEnabled = false;
//       ctx.drawImage(canvas, 0, 0, w / pixelSize, h / pixelSize, 0, 0, w, h);
//       setPreviewUrl(canvas.toDataURL());
//       setEditMode('none');
//     };
//     img.src = previewUrl;
//   };

//   // Black & White
//   const handleBW = () => {
//     if (!previewUrl) return;
//     const img = new window.Image();
//     img.onload = () => {
//       const canvas = canvasRef.current;
//       if (!canvas) return;
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext('2d');
//       if (!ctx) return;
//       ctx.drawImage(img, 0, 0);
//       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//       for (let i = 0; i < imageData.data.length; i += 4) {
//         const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
//         imageData.data[i] = avg;
//         imageData.data[i + 1] = avg;
//         imageData.data[i + 2] = avg;
//       }
//       ctx.putImageData(imageData, 0, 0);
//       setPreviewUrl(canvas.toDataURL());
//       setEditMode('none');
//     };
//     img.src = previewUrl;
//   };

//   // Remove Background (simple: make white transparent)
//   const handleRemoveBg = () => {
//     if (!previewUrl) return;
//     setIsRemovingBg(true);
//     const img = new window.Image();
//     img.crossOrigin = 'Anonymous';
//     img.onload = () => {
//       const canvas = canvasRef.current;
//       if (!canvas) return;
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext('2d');
//       if (!ctx) return;
//       ctx.drawImage(img, 0, 0);
//       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//       for (let i = 0; i < imageData.data.length; i += 4) {
//         // If pixel is close to white, make transparent
//         if (
//           imageData.data[i] > 240 &&
//           imageData.data[i + 1] > 240 &&
//           imageData.data[i + 2] > 240
//         ) {
//           imageData.data[i + 3] = 0;
//         }
//       }
//       ctx.putImageData(imageData, 0, 0);
//       setPreviewUrl(canvas.toDataURL());
//       setEditMode('none');
//       setIsRemovingBg(false);
//     };
//     img.src = previewUrl;
//   };

//   // Save to album
//   const handleSave = () => {
//     if (previewUrl) {
//       onAddPhoto(previewUrl);
//       handleRemoveImage();
//     }
//   };

//   // UI for editing controls
//   return (
//     <div>
//       <button onClick={handleUploadClick} style={{ background: '#c209c1', border: '1px solid #c209c1', padding: '10px', borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Upload Photo</button>
//       <input
//         type="file"
//         accept="image/*"
//         style={{ display: 'none' }}
//         ref={fileInputRef}
//         onChange={handleFileChange}
//       />
//       {previewUrl && (
//         <div style={{ marginTop: 16 }}>
//           <div>
//             <img
//               src={previewUrl}
//               alt="Preview"
//               style={{ width: 140, height: 140, display: 'block', marginBottom: 8 }}
//             />
//             <canvas ref={canvasRef} style={{ display: 'none' }} />
//           </div>
//           <div style={{ marginBottom: 8 }}>
//             <button onClick={handleRemoveImage}>Delete</button>
//             <button onClick={() => setEditMode('crop')}>Crop</button>
//             <button onClick={() => setEditMode('resize')}>Resize</button>
//             <button onClick={() => setEditMode('pixelate')}>Pixelate</button>
//             <button onClick={() => setEditMode('bw')}>Black & White</button>
//             <button onClick={() => setEditMode('removebg')}>Remove Background</button>
//           </div>
//           {/* Editing UIs */}
//           {editMode === 'crop' && (
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 x: <input type="number" value={crop.x} onChange={e => setCrop({ ...crop, x: Number(e.target.value) })} style={{ width: 50 }} />
//               </label>
//               <label>
//                 y: <input type="number" value={crop.y} onChange={e => setCrop({ ...crop, y: Number(e.target.value) })} style={{ width: 50 }} />
//               </label>
//               <label>
//                 width: <input type="number" value={crop.width} onChange={e => setCrop({ ...crop, width: Number(e.target.value) })} style={{ width: 50 }} />
//               </label>
//               <label>
//                 height: <input type="number" value={crop.height} onChange={e => setCrop({ ...crop, height: Number(e.target.value) })} style={{ width: 50 }} />
//               </label>
//               <button onClick={handleCrop}>Apply Crop</button>
//               <button onClick={() => setEditMode('none')}>Cancel</button>
//             </div>
//           )}
//           {editMode === 'resize' && (
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 width: <input type="number" value={resize.width} onChange={e => setResize({ ...resize, width: Number(e.target.value) })} style={{ width: 60 }} />
//               </label>
//               <label>
//                 height: <input type="number" value={resize.height} onChange={e => setResize({ ...resize, height: Number(e.target.value) })} style={{ width: 60 }} />
//               </label>
//               <button onClick={handleResize}>Apply Resize</button>
//               <button onClick={() => setEditMode('none')}>Cancel</button>
//             </div>
//           )}
//           {editMode === 'pixelate' && (
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Pixel Size: <input type="number" min={2} max={100} value={pixelSize} onChange={e => setPixelSize(Number(e.target.value))} style={{ width: 60 }} />
//               </label>
//               <button onClick={handlePixelate}>Apply Pixelate</button>
//               <button onClick={() => setEditMode('none')}>Cancel</button>
//             </div>
//           )}
//           {editMode === 'bw' && (
//             <div style={{ marginBottom: 8 }}>
//               <button onClick={handleBW}>Apply Black & White</button>
//               <button onClick={() => setEditMode('none')}>Cancel</button>
//             </div>
//           )}
//           {editMode === 'removebg' && (
//             <div style={{ marginBottom: 8 }}>
//               <button onClick={handleRemoveBg} disabled={isRemovingBg}>
//                 {isRemovingBg ? 'Processing...' : 'Apply Remove Background'}
//               </button>
//               <button onClick={() => setEditMode('none')}>Cancel</button>
//             </div>
//           )}
//           <button onClick={handleSave} style={{ marginTop: 8 }}>Save to Album</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PhotoEditor;


import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup/Signup';
import Login from './components/Login/Login';
import Home from './components/Home/Home';




function App() {
  const [photos, setPhotos] = useState<string[]>([]);

  const handleAddPhoto = (photoDataUrl: string) => {
    setPhotos(prev => [...prev, photoDataUrl]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home handleAddPhoto={handleAddPhoto} handleRemovePhoto={handleRemovePhoto} photos={photos} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

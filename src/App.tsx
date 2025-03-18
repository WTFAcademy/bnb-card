import React, { useState } from 'react';
import ImageEditor from './components/ImageEditor';

function App() {
  const [templateImage] = useState('/mubarak-hero.png');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <ImageEditor templateSrc={templateImage} />
      </div>
    </div>
  );
}

export default App;
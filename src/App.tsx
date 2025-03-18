import { useState } from "react";
import ImageEditor from "./components/ImageEditor";

function App() {
  const [templateImage] = useState("/mubarak-hero.png");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <ImageEditor templateSrc={templateImage} />
      </div>

      {/* Bottom tagline */}
      <div className="max-w-4xl mx-auto w-full mt-6 text-center">
        <p className="text-xs text-black/50 font-light">
          Built by{" "}
          <a
            href="https://x.com/WTFAcademy_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400"
          >
            WTF Academy
          </a>{" "}
          Team
        </p>
      </div>
    </div>
  );
}

export default App;

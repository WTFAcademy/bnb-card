import React, { CSSProperties, useState } from 'react';
import { RotateCw, Upload, Download, Info, Check, ChevronDown, Camera, Zap, FlipHorizontal, Type, Briefcase, Plus, Minus } from 'lucide-react';
import useImageEditor from '../hooks/useImageEditor';

interface ImageEditorProps {
  templateSrc: string;
  onExport?: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ templateSrc, onExport }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  const {
    canvasRef,
    containerRef,
    uploadedImage,
    professionTexts,
    nameText,
    handleDragStart,
    handleRotateStart,
    handleProfessionDragStart,
    handleProfessionRotateStart,
    handleNameDragStart,
    handleNameRotateStart,
    handleResizeStart,
    handleMouseMove,
    handleTouchMove,
    handleImageUpload,
    handleProfessionChange,
    handleNameChange,
    handleProfessionFontSizeIncrease,
    handleProfessionFontSizeDecrease,
    handleNameFontSizeIncrease,
    handleNameFontSizeDecrease,
    addProfessionText,
    removeProfessionText,
    exportImage,
    getControlPoints,
    getProfessionControlPoints,
    getNameControlPoints,
    handleFlip,
  } = useImageEditor(templateSrc);

  const handleExport = () => {
    exportImage();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
    if (onExport) {
      onExport();
    }
  };

  return (
    <div className="image-editor bg-gradient-to-b from-blue-50 to-yellow-50 p-6 rounded-2xl">
      {/* Main title */}
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-bold mb-2 text-yellow-700 drop-shadow-sm">Create Your BNB ID Card</h2>
        <p className="text-sm text-black/70">
          Upload your photo, adjust size and position to create a personalized ID card
        </p>
      </div>
      
      {/* Main content - horizontal layout with improved styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Image editing area */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-blue-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          
          {/* Main canvas container */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="relative w-full max-w-[500px] mx-auto object-contain rounded-xl shadow-xl border-4 border-white"
            />
            
            {/* Image editing controls */}
            {uploadedImage && (
              <div 
                ref={containerRef}
                className="absolute inset-0 touch-none"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
              >
                {/* Image control frame */}
                <div 
                  className="absolute origin-center pointer-events-none"
                  style={getControlPoints() as CSSProperties}
                >
                  {/* Center drag area */}
                  <div 
                    className="absolute inset-0 cursor-move pointer-events-auto"
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                  />
                  
                  {/* Corner resize controls */}
                  <div 
                    className="absolute -top-2 -left-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white cursor-nwse-resize shadow-md pointer-events-auto z-20"
                    onMouseDown={handleResizeStart}
                    onTouchStart={handleResizeStart}
                  />
                  <div 
                    className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white cursor-nesw-resize shadow-md pointer-events-auto z-20"
                    onMouseDown={handleResizeStart}
                    onTouchStart={handleResizeStart}
                  />
                  <div 
                    className="absolute -bottom-2 -left-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white cursor-nesw-resize shadow-md pointer-events-auto z-20"
                    onMouseDown={handleResizeStart}
                    onTouchStart={handleResizeStart}
                  />
                  <div 
                    className="absolute -bottom-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white cursor-nwse-resize shadow-md pointer-events-auto z-20"
                    onMouseDown={handleResizeStart}
                    onTouchStart={handleResizeStart}
                  />
                  
                  {/* Rotation control */}
                  <div 
                    className="absolute -top-9 left-1/2 transform -translate-x-1/2 flex gap-2"
                  >
                    <div 
                      className="w-7 h-7 bg-black rounded-full border-2 border-white flex items-center justify-center cursor-grab shadow-lg pointer-events-auto z-20"
                      onMouseDown={handleRotateStart}
                      onTouchStart={handleRotateStart}
                    >
                      <RotateCw className="w-4 h-4 text-white" />
                    </div>
                    <div 
                      className="w-7 h-7 bg-black rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-lg pointer-events-auto z-20"
                      onClick={handleFlip}
                    >
                      <FlipHorizontal className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Control frame border */}
                  <div className="absolute inset-0 border-2 border-dashed border-white rounded-md"></div>
                </div>

                {/* Profession text control frames - 遍历所有职业文本 */}
                {professionTexts.map((professionText, index) => (
                  professionText.text && (
                    <div 
                      key={`profession-${index}`}
                      className="absolute origin-center pointer-events-none"
                      style={getProfessionControlPoints(index) as CSSProperties}
                    >
                      <div className="relative px-8 py-2 flex items-center justify-center">
                        {/* Profession text placeholder - draggable */}
                        <div 
                          className="text-transparent pointer-events-auto cursor-move" 
                          style={{fontFamily: '楷体, KaiTi, 宋体, SimSun', fontSize: `${professionText.fontSize}px`}}
                          onMouseDown={(e) => handleProfessionDragStart(e, index)}
                          onTouchStart={(e) => handleProfessionDragStart(e, index)}
                        >
                          {professionText.text}
                        </div>
                        
                        {/* Profession rotation control */}
                        <div 
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex gap-2"
                        >
                          <div 
                            className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center cursor-grab shadow-md pointer-events-auto z-20"
                            onMouseDown={(e) => handleProfessionRotateStart(e, index)}
                            onTouchStart={(e) => handleProfessionRotateStart(e, index)}
                          >
                            <RotateCw className="w-3 h-3 text-white" />
                          </div>
                          
                          {/* Profession text size controls */}
                          <div 
                            className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md pointer-events-auto z-20"
                            onClick={() => handleProfessionFontSizeIncrease(index)}
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </div>
                          <div 
                            className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md pointer-events-auto z-20"
                            onClick={() => handleProfessionFontSizeDecrease(index)}
                          >
                            <Minus className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        {/* Control frame border */}
                        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-md"></div>
                      </div>
                    </div>
                  )
                ))}

                {/* Name text control frame */}
                {nameText.text && (
                  <div 
                    className="absolute origin-center pointer-events-none"
                    style={getNameControlPoints() as CSSProperties}
                  >
                    <div className="relative px-8 py-2 flex items-center justify-center">
                      {/* Name text placeholder - draggable */}
                      <div 
                        className="text-transparent pointer-events-auto cursor-move" 
                        style={{fontFamily: '楷体, KaiTi, 宋体, SimSun', fontSize: `${nameText.fontSize}px`}}
                        onMouseDown={handleNameDragStart}
                        onTouchStart={handleNameDragStart}
                      >
                        {nameText.text}
                      </div>
                      
                      {/* Name rotation control */}
                      <div 
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex gap-2"
                      >
                        <div 
                          className="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center cursor-grab shadow-md pointer-events-auto z-20"
                          onMouseDown={handleNameRotateStart}
                          onTouchStart={handleNameRotateStart}
                        >
                          <RotateCw className="w-3 h-3 text-white" />
                        </div>
                        
                        {/* Name text size controls */}
                        <div 
                          className="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md pointer-events-auto z-20"
                          onClick={handleNameFontSizeIncrease}
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </div>
                        <div 
                          className="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md pointer-events-auto z-20"
                          onClick={handleNameFontSizeDecrease}
                        >
                          <Minus className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      {/* Control frame border */}
                      <div className="absolute inset-0 border-2 border-dashed border-red-400 rounded-md"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Placeholder when no image is uploaded */}
            {!uploadedImage && (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-black/20 rounded-xl">
                <p className="text-white font-bold text-xl">Upload Your Photo</p>
                <p className="text-white/80 text-sm max-w-[70%] text-center">Merge your photo with BNB card template</p>
                <label className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-3 rounded-xl cursor-pointer hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 font-bold shadow-lg transform hover:-translate-y-1">
                  <Upload className="w-5 h-5" />
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls and tutorial with improved styling */}
        <div className="flex flex-col gap-4">
          {/* Action cards in a sleeker design */}
          <div className="bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-yellow-100">
            <div className="flex flex-col gap-5">
              {/* Title */}
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-xl shadow-sm">
                  <Camera className="w-4 h-4 text-black" />
                </div>
                <h3 className="font-medium text-yellow-700">ID Card Editor</h3>
              </div>
              
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-200 to-transparent"></div>
              
              {/* Upload control */}
              <div>
                <p className="text-xs text-black/60 mb-2 font-medium">Upload photo to start</p>
                <label className="flex items-center justify-center gap-2 w-full bg-white text-black px-4 py-3 rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors border border-yellow-200 shadow-sm group">
                  <Upload className="w-4 h-4 group-hover:text-yellow-600 transition-colors" />
                  <span className="group-hover:text-yellow-600 transition-colors">Select Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {/* Text inputs */}
              <div>
                <p className="text-xs text-black/60 mb-2 font-medium">Add profession and name</p>
                <div className="flex flex-col gap-3">
                  {/* 职业文本区域 - 使用数组渲染多个输入框 */}
                  <div className="flex flex-col gap-3">
                    {professionTexts.map((professionText, index) => (
                      <div key={`profession-input-${index}`} className="flex items-center gap-2">
                        <div className="bg-blue-100 p-1.5 rounded-lg shadow-sm">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <input
                          type="text"
                          value={professionText.text}
                          onChange={(e) => handleProfessionChange(e.target.value, index)}
                          placeholder={`Enter profession ${index + 1}`}
                          className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm font-kaiti focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                          style={{fontFamily: '楷体, KaiTi, 宋体, SimSun'}}
                        />
                        {/* 删除按钮 */}
                        {professionTexts.length > 1 && (
                          <button 
                            onClick={() => removeProfessionText(index)}
                            className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {/* 添加职业按钮 */}
                    <button 
                      onClick={addProfessionText}
                      className="flex items-center justify-center gap-2 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Profession</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-1.5 rounded-lg shadow-sm">
                      <Type className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <input
                      type="text"
                      value={nameText.text}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1 border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent shadow-sm"
                      style={{fontFamily: '楷体, KaiTi, 宋体, SimSun'}}
                    />
                  </div>
                </div>
              </div>
              
              {/* Export control */}
              <div>
                <p className="text-xs text-black/60 mb-2 font-medium">Save your creation when finished</p>
                <button 
                  onClick={handleExport}
                  className={`flex items-center justify-center gap-2 w-full ${
                    exportSuccess 
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black'
                  } px-4 py-3 rounded-xl shadow-md transition-all duration-300 ${
                    !uploadedImage 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-lg hover:translate-y-[-2px]'
                  }`}
                  disabled={!uploadedImage}
                >
                  {exportSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Export successful!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Export ID Card</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Tips card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border border-yellow-100">
            <button 
              onClick={() => setShowTutorial(!showTutorial)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium hover:bg-yellow-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="bg-yellow-100 p-1.5 rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-yellow-600" />
                </div>
                <span>Usage Tips</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-yellow-500 transition-transform duration-300 ${showTutorial ? 'rotate-180' : ''}`} />
            </button>
            
            {showTutorial && (
              <div className="px-5 pt-0 pb-4 text-sm text-black/70">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Upload your favorite photo (square or near-square images work best)</li>
                  <li>Drag to adjust position for perfect template integration</li>
                  <li>Use corner controls to resize photo</li>
                  <li>Use top rotation control to adjust angle</li>
                  <li>Enter your profession and name</li>
                  <li>Add multiple profession entries if needed</li>
                  <li>Click and drag text to adjust position</li>
                  <li>Use text controls to adjust rotation angle and size</li>
                  <li>Profession text appears in the center by default</li>
                  <li>Name text appears on the right side by default</li>
                  <li>Click "Export ID Card" to save your creation when finished</li>
                </ol>
              </div>
            )}
          </div>
          
          {/* Image info */}
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-black/60 shadow-sm border border-blue-100">
            <p className="flex items-center justify-center gap-2">
              <Info className="w-3 h-3 text-blue-500" />
              <span>Your image is processed locally - not uploaded to our servers</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageEditor; 
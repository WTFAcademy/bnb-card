import { useState, useRef, useEffect } from 'react';

export interface ImageTransform {
  scale: number;
  positionX: number;
  positionY: number;
  rotation: number;
  flipX: boolean;
}

export interface TextTransform {
  text: string;
  rotation: number;
  positionX: number;
  positionY: number;
  fontSize: number;
}

// Extend startPoint interface to include position information
interface StartPoint {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  positionX?: number;
  positionY?: number;
  textIndex?: number;  // 新增，用于跟踪当前操作的文本索引
}

export interface ImageEditorHook {
  imageRef: React.RefObject<HTMLImageElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  uploadedImage: string | null;
  transform: ImageTransform;
  professionTexts: TextTransform[];  // 改为数组
  nameText: TextTransform;
  isDragging: boolean;
  isRotating: boolean;
  isResizing: boolean;
  isProfessionRotating: boolean;
  isProfessionDragging: boolean;
  isProfessionRotatingIndex: number;  // 新增，追踪当前旋转的文本索引
  isProfessionDraggingIndex: number;  // 新增，追踪当前拖动的文本索引
  isNameRotating: boolean;
  isNameDragging: boolean;
  startPoint: StartPoint;
  handleDragStart: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  handleRotateStart: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  handleProfessionDragStart: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, index: number) => void;
  handleProfessionRotateStart: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, index: number) => void;
  handleNameDragStart: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  handleNameRotateStart: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  handleResizeStart: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleProfessionChange: (text: string, index: number) => void;
  handleNameChange: (text: string) => void;
  handleProfessionFontSizeIncrease: (index: number) => void;
  handleProfessionFontSizeDecrease: (index: number) => void;
  handleNameFontSizeIncrease: () => void;
  handleNameFontSizeDecrease: () => void;
  addProfessionText: () => void;  // 新增添加职业文本的方法
  removeProfessionText: (index: number) => void;  // 新增删除职业文本的方法
  exportImage: () => void;
  getControlPoints: () => {width?: string, height?: string, transform?: string};
  getProfessionControlPoints: (index: number) => {transform?: string};
  getNameControlPoints: () => {transform?: string};
  drawImageOnCanvas: () => void;
  handleFlip: () => void;
}

export default function useImageEditor(templateSrc: string): ImageEditorHook {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const templateImageRef = useRef<HTMLImageElement | null>(null);
  
  const [transform, setTransform] = useState<ImageTransform>({ scale: 1, positionX: 0, positionY: 0, rotation: 0, flipX: false });
  const [professionTexts, setProfessionTexts] = useState<TextTransform[]>([{ 
    text: '', 
    rotation: -18,
    positionX: 0, 
    positionY: 0,
    fontSize: 26
  }]);  // 修改为数组，初始包含一个空的职业文本
  const [nameText, setNameText] = useState<TextTransform>({ 
    text: '', 
    rotation: -18,
    positionX: 0, 
    positionY: 0,
    fontSize: 22
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isProfessionRotating, setIsProfessionRotating] = useState(false);
  const [isProfessionDragging, setIsProfessionDragging] = useState(false);
  const [isProfessionRotatingIndex, setIsProfessionRotatingIndex] = useState(-1); // 当前旋转的文本索引
  const [isProfessionDraggingIndex, setIsProfessionDraggingIndex] = useState(-1); // 当前拖动的文本索引
  const [isNameRotating, setIsNameRotating] = useState(false);
  const [isNameDragging, setIsNameDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<StartPoint>({ x: 0, y: 0, scale: 1, rotation: 0 });

  // Handle image dragging
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    
    if ('clientX' in e) {
      setStartPoint({ ...startPoint, x: e.clientX, y: e.clientY });
    } else if (e.touches.length === 1) {
      setStartPoint({ ...startPoint, x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  // Handle image rotation
  const handleRotateStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsRotating(true);
    
    // Record initial rotation angle
    setStartPoint({ ...startPoint, rotation: transform.rotation });
    
    if ('clientX' in e) {
      setStartPoint(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    } else if (e.touches.length === 1) {
      setStartPoint(prev => ({ ...prev, x: e.touches[0].clientX, y: e.touches[0].clientY }));
    }
  };

  // Handle profession text dragging
  const handleProfessionDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setIsProfessionDragging(true);
    setIsProfessionDraggingIndex(index);
    
    let clientX, clientY;
    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches.length === 1) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      return;
    }
    
    // Record starting point and original text position
    setStartPoint({
      x: clientX,
      y: clientY,
      scale: 1,
      rotation: 0,
      positionX: professionTexts[index].positionX,
      positionY: professionTexts[index].positionY,
      textIndex: index
    });
  };

  // Handle profession text rotation
  const handleProfessionRotateStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setIsProfessionRotating(true);
    setIsProfessionRotatingIndex(index);
    
    // Record initial rotation angle
    setStartPoint({ ...startPoint, rotation: professionTexts[index].rotation, textIndex: index });
    
    if ('clientX' in e) {
      setStartPoint(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    } else if (e.touches.length === 1) {
      setStartPoint(prev => ({ ...prev, x: e.touches[0].clientX, y: e.touches[0].clientY }));
    }
  };
  
  // Handle name text dragging
  const handleNameDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsNameDragging(true);
    
    let clientX, clientY;
    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches.length === 1) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      return;
    }
    
    // Record starting point and original text position
    setStartPoint({
      x: clientX,
      y: clientY,
      scale: 1,
      rotation: 0,
      positionX: nameText.positionX,
      positionY: nameText.positionY
    });
  };

  // Handle name text rotation
  const handleNameRotateStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsNameRotating(true);
    
    // Record initial rotation angle
    setStartPoint({ ...startPoint, rotation: nameText.rotation });
    
    if ('clientX' in e) {
      setStartPoint(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    } else if (e.touches.length === 1) {
      setStartPoint(prev => ({ ...prev, x: e.touches[0].clientX, y: e.touches[0].clientY }));
    }
  };

  // Handle image scaling
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizing(true);
    
    setStartPoint({ ...startPoint, scale: transform.scale });
    
    if ('clientX' in e) {
      setStartPoint(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    } else if (e.touches.length === 1) {
      setStartPoint(prev => ({ ...prev, x: e.touches[0].clientX, y: e.touches[0].clientY }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (isDragging) {
      // Handle dragging
      const deltaX = clientX - startPoint.x;
      const deltaY = clientY - startPoint.y;
      
      setTransform(prev => ({
        ...prev,
        positionX: prev.positionX + deltaX,
        positionY: prev.positionY + deltaY
      }));
      
      setStartPoint(prev => ({ ...prev, x: clientX, y: clientY }));
    } 
    else if (isRotating) {
      // Handle rotation
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate angle
      const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
      const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
      const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
      
      setTransform(prev => ({
        ...prev,
        rotation: (startPoint.rotation + angleDiff) % 360
      }));
    } 
    else if (isProfessionDragging) {
      // Handle profession text dragging
      const canvas = canvasRef.current;
      if (!canvas || isProfessionDraggingIndex === -1) return;
      
      const rect = canvas.getBoundingClientRect();
      const scale = canvas.width / rect.width;
      
      // Calculate mouse/touch movement distance
      const deltaX = (clientX - startPoint.x) * scale;
      const deltaY = (clientY - startPoint.y) * scale;
      
      // Update text position, based on initial position plus movement distance
      setProfessionTexts(prev => {
        const newTexts = [...prev];
        const index = isProfessionDraggingIndex;
        newTexts[index] = {
          ...newTexts[index],
          positionX: (startPoint.positionX || 0) + deltaX,
          positionY: (startPoint.positionY || 0) + deltaY
        };
        return newTexts;
      });
    }
    else if (isProfessionRotating) {
      // Handle profession rotation
      const canvas = canvasRef.current;
      if (!canvas || isProfessionRotatingIndex === -1) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate angle
      const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
      const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
      const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
      
      setProfessionTexts(prev => {
        const newTexts = [...prev];
        const index = isProfessionRotatingIndex;
        newTexts[index] = {
          ...newTexts[index],
          rotation: (startPoint.rotation + angleDiff) % 360
        };
        return newTexts;
      });
    }
    else if (isNameDragging) {
      // Handle name text dragging
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const scale = canvas.width / rect.width;
      
      // Calculate mouse/touch movement distance
      const deltaX = (clientX - startPoint.x) * scale;
      const deltaY = (clientY - startPoint.y) * scale;
      
      // Update text position, based on initial position plus movement distance
      setNameText(prev => ({
        ...prev,
        positionX: (startPoint.positionX || 0) + deltaX,
        positionY: (startPoint.positionY || 0) + deltaY
      }));
    }
    else if (isNameRotating) {
      // Handle name rotation
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate angle
      const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
      const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
      const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
      
      setNameText(prev => ({
        ...prev,
        rotation: (startPoint.rotation + angleDiff) % 360
      }));
    }
    else if (isResizing) {
      // Handle scaling
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 + transform.positionX;
      const centerY = rect.top + rect.height / 2 + transform.positionY;
      
      // Calculate initial distance and current distance
      const initialDistance = Math.sqrt(
        Math.pow(startPoint.x - centerX, 2) + Math.pow(startPoint.y - centerY, 2)
      );
      
      const currentDistance = Math.sqrt(
        Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
      );
      
      // Calculate scale factor based on distance change
      const scaleFactor = currentDistance / initialDistance;
      const newScale = Math.max(0.1, startPoint.scale * scaleFactor);
      
      setTransform(prev => ({
        ...prev,
        scale: newScale
      }));
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsRotating(false);
    setIsResizing(false);
    setIsProfessionRotating(false);
    setIsProfessionDragging(false);
    setIsProfessionRotatingIndex(-1);
    setIsProfessionDraggingIndex(-1);
    setIsNameRotating(false);
    setIsNameDragging(false);
  };

  const handleProfessionChange = (text: string, index: number) => {
    setProfessionTexts(prev => {
      const newTexts = [...prev];
      newTexts[index] = { ...newTexts[index], text };
      return newTexts;
    });
  };

  const handleNameChange = (text: string) => {
    setNameText(prev => ({ ...prev, text }));
  };

  // 添加新的职业文本
  const addProfessionText = () => {
    // 创建新的职业文本，位置略有偏移以避免完全重叠
    const offsetY = professionTexts.length * 20;
    setProfessionTexts(prev => [
      ...prev,
      {
        text: '',
        rotation: -18,
        positionX: 0,
        positionY: offsetY,
        fontSize: 26
      }
    ]);
  };

  // 删除职业文本
  const removeProfessionText = (index: number) => {
    setProfessionTexts(prev => prev.filter((_, i) => i !== index));
  };

  // Increase profession text size
  const handleProfessionFontSizeIncrease = (index: number) => {
    setProfessionTexts(prev => {
      const newTexts = [...prev];
      newTexts[index] = {
        ...newTexts[index],
        fontSize: Math.min(newTexts[index].fontSize + 2, 48)
      };
      return newTexts;
    });
  };

  // Decrease profession text size
  const handleProfessionFontSizeDecrease = (index: number) => {
    setProfessionTexts(prev => {
      const newTexts = [...prev];
      newTexts[index] = {
        ...newTexts[index],
        fontSize: Math.max(newTexts[index].fontSize - 2, 12)
      };
      return newTexts;
    });
  };

  // Increase name text size
  const handleNameFontSizeIncrease = () => {
    setNameText(prev => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 2, 48)
    }));
  };

  // Decrease name text size
  const handleNameFontSizeDecrease = () => {
    setNameText(prev => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 2, 12)
    }));
  };
  
  // 获取特定职业文本的控制点
  const getProfessionControlPoints = (index: number) => {
    if (!canvasRef.current || index >= professionTexts.length) return {transform: ''};
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate position ratio - convert canvas drawing coordinates to DOM coordinates
    const scaleRatio = rect.width / canvas.width;
    
    // Center position (using the same calculation as in drawing)
    const centerX = (canvas.width * 0.5 * scaleRatio);
    const centerY = (canvas.height * 0.5 * scaleRatio);
    
    // Add profession text offset
    const offsetX = professionTexts[index].positionX * scaleRatio;
    const offsetY = professionTexts[index].positionY * scaleRatio;
    
    // Return control points related styles and properties
    return {
      transform: `translate(calc(${centerX}px + ${offsetX}px - 50%), calc(${centerY}px + ${offsetY}px - 50%)) rotate(${professionTexts[index].rotation}deg)`,
    };
  };

  // Calculate control points position (edit mode UI overlay)
  const getControlPoints = () => {
    if (!canvasRef.current || !uploadedImage || !imageRef.current) return {width: '', height: '', transform: ''};
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const img = imageRef.current;
    
    // Calculate image display size on canvas
    const targetWidth = canvas.width * 0.3;
    const targetHeight = canvas.height * 0.6;
    const scale = Math.min(
      targetWidth / img.width,
      targetHeight / img.height
    );
    
    const width = img.width * scale * transform.scale;
    const height = img.height * scale * transform.scale;
    
    // Fix position calculation - ensure it matches with drawImageOnCanvas function
    // Calculate position ratio - convert canvas drawing coordinates to DOM coordinates
    const scaleRatio = rect.width / canvas.width;
    
    // Center position (using the same calculation as in drawing)
    const centerX = (canvas.width * 0.5 * scaleRatio);
    const centerY = (canvas.height * 0.5 * scaleRatio);
    
    // Adjusted transformation
    const transformX = transform.positionX * scaleRatio;
    const transformY = transform.positionY * scaleRatio;
    
    // Return control points related styles and properties
    return {
      width: `${width * scaleRatio}px`,
      height: `${height * scaleRatio}px`,
      transform: `translate(calc(${centerX}px + ${transformX}px - 50%), calc(${centerY}px + ${transformY}px - 50%)) rotate(${transform.rotation}deg)`,
    };
  };

  // Calculate name text control points position
  const getNameControlPoints = () => {
    if (!canvasRef.current) return {transform: ''};
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate position ratio - convert canvas drawing coordinates to DOM coordinates
    const scaleRatio = rect.width / canvas.width;
    
    // Name position (using the same calculation as in drawing)
    const centerX = (canvas.width * 0.6 * scaleRatio);
    const centerY = (canvas.height * 0.6 * scaleRatio);
    
    // Add name text offset
    const offsetX = nameText.positionX * scaleRatio;
    const offsetY = nameText.positionY * scaleRatio;
    
    // Return control points related styles and properties
    return {
      transform: `translate(calc(${centerX}px + ${offsetX}px - 50%), calc(${centerY}px + ${offsetY}px - 50%)) rotate(${nameText.rotation}deg)`,
    };
  };

  // Add flip handler function
  const handleFlip = () => {
    setTransform(prev => ({
      ...prev,
      flipX: !prev.flipX
    }));
  };

  const drawImageOnCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable font smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // First draw the user uploaded image
    if (uploadedImage && imageRef.current) {
      const img = imageRef.current;
      const targetWidth = canvas.width * 0.3;
      const targetHeight = canvas.height * 0.6;

      // Calculate scale ratio to maintain aspect ratio
      const scale = Math.min(
        targetWidth / img.width,
        targetHeight / img.height
      );
      
      const width = img.width * scale * transform.scale;
      const height = img.height * scale * transform.scale;

      // Calculate center position
      const centerX = canvas.width * 0.5;
      const centerY = canvas.height * 0.5;

      // Apply transformation
      ctx.save();
      ctx.translate(centerX + transform.positionX, centerY + transform.positionY);
      ctx.rotate(transform.rotation * Math.PI / 180);
      if (transform.flipX) {
        ctx.scale(-1, 1);
      }
      ctx.drawImage(img, -width/2, -height/2, width, height);
      ctx.restore();
    }

    // Ensure template image is loaded before drawing
    if (templateImageRef.current && templateImageRef.current.complete) {
      ctx.save();
      ctx.globalAlpha = 0.9; // Set transparency
      ctx.drawImage(templateImageRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      
      // 绘制所有职业文本
      professionTexts.forEach(professionText => {
        if (professionText.text) {
          ctx.save();
          
          // Set font and style
          ctx.font = `bold ${professionText.fontSize}px 楷体, KaiTi, 宋体, SimSun, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Calculate text position - default in center plus user drag offset
          const x = canvas.width * 0.5 + professionText.positionX;
          const y = canvas.height * 0.5 + professionText.positionY;
          
          // Translate to text center and rotate
          ctx.translate(x, y);
          ctx.rotate(professionText.rotation * Math.PI / 180);
          
          // Draw text shadow and stroke, reduced stroke width
          ctx.lineWidth = 4; // Reduced stroke width
          ctx.strokeStyle = 'white'; // White stroke
          ctx.shadowColor = 'white';
          ctx.shadowBlur = 2;
          ctx.strokeText(professionText.text, 0, 0);
          
          // Draw text body
          ctx.fillStyle = 'black';
          ctx.shadowBlur = 0;
          ctx.fillText(professionText.text, 0, 0);
          
          ctx.restore();
        }
      });
      
      // Draw name text
      if (nameText.text) {
        ctx.save();
        
        // Set font and style
        ctx.font = `bold ${nameText.fontSize}px 楷体, KaiTi, 宋体, SimSun, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate text position - default on right side plus user drag offset
        const x = canvas.width * 0.6 + nameText.positionX;
        const y = canvas.height * 0.6 + nameText.positionY;
        
        // Translate to text center and rotate
        ctx.translate(x, y);
        ctx.rotate(nameText.rotation * Math.PI / 180);
        
        // Draw text shadow and stroke, reduced stroke width
        ctx.lineWidth = 5; // Reduced stroke width
        ctx.strokeStyle = 'white'; // White stroke
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 3; 
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeText(nameText.text, 0, 0);
        
        // Draw text body
        ctx.fillStyle = 'black';
        ctx.shadowBlur = 0;
        ctx.fillText(nameText.text, 0, 0);
        
        ctx.restore();
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Reset transform state
        setTransform({ scale: 1, positionX: 0, positionY: 0, rotation: 0, flipX: false });
        
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setUploadedImage(e.target?.result as string);
          drawImageOnCanvas();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Temporarily create a canvas for export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    
    if (!exportCtx) return;
    
    // Enable font smoothing
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = 'high';

    // Clear canvas
    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw user image (if any)
    if (uploadedImage && imageRef.current) {
      const img = imageRef.current;
      const targetWidth = canvas.width * 0.3;
      const targetHeight = canvas.height * 0.6;

      // Calculate scale ratio to maintain aspect ratio
      const scale = Math.min(
        targetWidth / img.width,
        targetHeight / img.height
      );
      
      const width = img.width * scale * transform.scale;
      const height = img.height * scale * transform.scale;

      // Calculate center position
      const centerX = canvas.width * 0.5;
      const centerY = canvas.height * 0.5;

      // Apply transformation
      exportCtx.save();
      exportCtx.translate(centerX + transform.positionX, centerY + transform.positionY);
      exportCtx.rotate(transform.rotation * Math.PI / 180);
      if (transform.flipX) {
        exportCtx.scale(-1, 1);
      }
      exportCtx.drawImage(img, -width/2, -height/2, width, height);
      exportCtx.restore();
    }

    // Draw template (fully opaque)
    exportCtx.drawImage(templateImageRef.current as HTMLImageElement, 0, 0, exportCanvas.width, exportCanvas.height);
    
    // 绘制所有职业文本
    professionTexts.forEach(professionText => {
      if (professionText.text) {
        exportCtx.save();
        
        // Set font and style
        exportCtx.font = `bold ${professionText.fontSize}px 楷体, KaiTi, 宋体, SimSun, sans-serif`;
        exportCtx.textAlign = 'center';
        exportCtx.textBaseline = 'middle';
        
        // Calculate text position
        const x = exportCanvas.width * 0.5 + professionText.positionX;
        const y = exportCanvas.height * 0.5 + professionText.positionY;
        
        // Translate to text center and rotate
        exportCtx.translate(x, y);
        exportCtx.rotate(professionText.rotation * Math.PI / 180);
        
        // Draw text shadow and stroke, reduced stroke width
        exportCtx.lineWidth = 4; // Reduced stroke width
        exportCtx.strokeStyle = 'white'; // White stroke
        exportCtx.shadowColor = 'white';
        exportCtx.shadowBlur = 2;
        exportCtx.strokeText(professionText.text, 0, 0);
        
        // Draw text body
        exportCtx.fillStyle = 'black';
        exportCtx.shadowBlur = 0;
        exportCtx.fillText(professionText.text, 0, 0);
        
        exportCtx.restore();
      }
    });
    
    // Draw name text
    if (nameText.text) {
      exportCtx.save();
      
      // Set font and style
      exportCtx.font = `bold ${nameText.fontSize}px 楷体, KaiTi, 宋体, SimSun, sans-serif`;
      exportCtx.textAlign = 'center';
      exportCtx.textBaseline = 'middle';
      
      // Calculate text position
      const x = exportCanvas.width * 0.6 + nameText.positionX;
      const y = exportCanvas.height * 0.6 + nameText.positionY;
      
      // Translate to text center and rotate
      exportCtx.translate(x, y);
      exportCtx.rotate(nameText.rotation * Math.PI / 180);
      
      // Draw text shadow and stroke, reduced stroke width
      exportCtx.lineWidth = 5; // Reduced stroke width
      exportCtx.strokeStyle = 'white'; // White stroke
      exportCtx.shadowColor = 'white';
      exportCtx.shadowBlur = 3;
      exportCtx.shadowOffsetX = 0;
      exportCtx.shadowOffsetY = 0;
      exportCtx.strokeText(nameText.text, 0, 0);
      
      // Draw text body
      exportCtx.fillStyle = 'black';
      exportCtx.shadowBlur = 0;
      exportCtx.fillText(nameText.text, 0, 0);
      
      exportCtx.restore();
    }

    try {
      const dataUrl = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'bnb-card.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
    }
  };

  useEffect(() => {
    // Create and load template image
    const templateImage = new Image();
    templateImage.crossOrigin = "anonymous";
    templateImage.src = templateSrc;
    
    templateImage.onload = () => {
      templateImageRef.current = templateImage;
      drawImageOnCanvas();
    };

    // Add global pointer event listeners
    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchend', handlePointerUp);
    
    return () => {
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchend', handlePointerUp);
    };
  }, [templateSrc]); // Only reload template image when templateSrc changes

  useEffect(() => {
    drawImageOnCanvas();
  }, [uploadedImage, transform, professionTexts, nameText]);

  return {
    imageRef,
    canvasRef,
    containerRef,
    uploadedImage,
    transform,
    professionTexts,  // 改为数组
    nameText,
    isDragging,
    isRotating,
    isResizing,
    isProfessionRotating,
    isProfessionDragging,
    isProfessionRotatingIndex,  // 新增
    isProfessionDraggingIndex,  // 新增
    isNameRotating,
    isNameDragging,
    startPoint,
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
    addProfessionText,  // 新增
    removeProfessionText,  // 新增
    exportImage,
    getControlPoints,
    getProfessionControlPoints,
    getNameControlPoints,
    drawImageOnCanvas,
    handleFlip,
  };
} 
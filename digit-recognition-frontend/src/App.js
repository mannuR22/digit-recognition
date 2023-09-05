import React, { useState, useRef, useEffect } from 'react';

function App() {
  const canvasRef = useRef(null);
  const [predictedNumber, setPredictedNumber] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnImageSrc, setDrawnImageSrc] = useState(null);
  const [drawnImage28x28Src, setDrawnImage28x28Src] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineWidth = 1;
    context.lineCap = 'round';
  }, []);

  const convertTo28x28 = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    // context.clearRect(0, 0, 28, 28);
    context.drawImage(canvas, 0, 0);
  
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const pixelArray = [];
  
    // Loop through the pixel data and normalize the values
    for (let i = 0; i < imageData.data.length; i += 4) {
      
      const value = imageData.data[i + 3];
      // console.log("red: ", redValue, "green: ", greenValue, "blue: ", blueValue, "alpha: ", alphaValue)
    
      // Store the average value in the pixelArray
      pixelArray.push(value);
    }
    
  
    // Create a 2D array
    const image2DArray = [];
    for (let i = 0; i < 28; i++) {
      const row = pixelArray.slice(i * 28, (i + 1) * 28);
      image2DArray.push(row);
    }

    console.log(image2DArray)
  
    // Send the 2D array to the backend
    recognizeNumber28x28(image2DArray);
  };
  
  

  const recognizeNumber28x28 = async (imageData28x28) => {
    try {
      const response = await fetch('http://localhost:5000/recognize_number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_data: imageData28x28 }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictedNumber(data.predicted_number);
      } else {
        console.error('Recognition failed.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
  };

  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.closePath();
    setIsDrawing(false);
    setDrawnImageSrc(canvas.toDataURL('image/png'));
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={28}
        height={28}
        style={{
          border: '1px solid black',
          aspectRatio: '1/1',
          height: 'auto',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <br />
      <button onClick={convertTo28x28}>Convert to 28x28</button>
      {drawnImageSrc && (
        <div>
          <p>Drawn Image:</p>
          <img src={drawnImageSrc} alt="Drawn Image" />
        </div>
      )}
      {predictedNumber !== null && (
        <div>Predicted Number: {predictedNumber}</div>
      )}
    </div>
  );
}

export default App;

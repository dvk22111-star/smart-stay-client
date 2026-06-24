


import { useRef } from "react";

export default function Brizza() {
  const canvasRef = useRef(null);

  const handleImageLoad = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = e.target.src;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // זיהוי רקע לבן
        if (r > 240 && g > 240 && b > 240) {
          data[i] = 173;
          data[i + 1] = 216;
          data[i + 2] = 230;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
  };

  return (
    <div>
      <img
        src="/assets/image-4.png"
        onLoad={handleImageLoad}
        style={{ display: "none" }}
        alt=""
      />

      <canvas ref={canvasRef} />
    </div>
  );
} 


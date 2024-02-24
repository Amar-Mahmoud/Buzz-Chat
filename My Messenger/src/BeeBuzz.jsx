import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import beeImage from './BuzzTalkLogo.png'; 

const Bee = () => {
  const beeRef = useRef(null);

  useEffect(() => {
    const startPosition = { top: 5, left: 5 }; 

    gsap.set(beeRef.current, {
      top: startPosition.top,
      left: startPosition.left,
      position: 'absolute' 
    });

    const moveBee = () => {
      const maxHeight = document.body.scrollHeight - 50;
      const maxWidth = document.body.scrollWidth - 50;

      const top = Math.random() * maxHeight;
      const left = Math.random() * maxWidth;
      const rotation = Math.random() * 720 - 360;

      gsap.to(beeRef.current, {
        duration: 5,
        ease: "power1.inOut",
        top: top,
        left: left,
        rotation:rotation,
      });
    };

    
    const interval = setInterval(moveBee, 4000);

    
    return () => clearInterval(interval);
  }, []);

  return (
    <img
      ref={beeRef}
      src={beeImage}
      alt="Bee"
      style={{
        position: 'absolute', 
        width: '150px', 
      }}
    />
  );
};

export default Bee;

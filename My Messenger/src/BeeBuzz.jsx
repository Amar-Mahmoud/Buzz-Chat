import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import beeImage from './BuzzTalkLogo.png'; // Make sure this path is correct

const Bee = () => {
  const beeRef = useRef(null);

  useEffect(() => {
    // Assuming the logo dimensions and adjusting the start position accordingly
    const startPosition = { top: 5, left: 5 }; // Adjust based on your logo's size and position

    // Set the bee's initial position next to the logo
    gsap.set(beeRef.current, {
      top: startPosition.top,
      left: startPosition.left,
      position: 'absolute' // Use 'absolute' for positioning within the entire webpage
    });

    const moveBee = () => {
      // Use the document's dimensions to allow movement throughout the entire page
      const maxHeight = document.body.scrollHeight - 50; // Subtracting bee's height
      const maxWidth = document.body.scrollWidth - 50; // Subtracting bee's width

      // Random new position within the document's bounds
      const top = Math.random() * maxHeight;
      const left = Math.random() * maxWidth;
      const rotation = Math.random() * 720 - 360;

      // Animate the bee to the new position
      gsap.to(beeRef.current, {
        duration: 5, // Longer duration for potentially larger distances
        ease: "power1.inOut",
        top: top,
        left: left,
        rotation:rotation,
      });
    };

    // Move the bee to a new position every 5 seconds
    const interval = setInterval(moveBee, 4000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <img
      ref={beeRef}
      src={beeImage}
      alt="Bee"
      style={{
        position: 'absolute', // Important for allowing movement across the entire page
        width: '150px', // Adjust as necessary
      }}
    />
  );
};

export default Bee;

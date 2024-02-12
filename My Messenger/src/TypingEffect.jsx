import React, { useState, useEffect } from 'react';

const TypingEffect = () => {
  const fullText = "The best way \n to chat.";
  const [text, setText] = useState('');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count < fullText.length) {
      setTimeout(() => {
        setText(text + fullText.charAt(count));
        setCount(count + 1);
      }, 90); // Adjust the speed of typing here
    }
  }, [text, count, fullText]);

  return (
    <div className="m-322 font-semibold text-6xl text-black">
      {text}
      <span className="animate-ping absolute h-3 w-2 rounded-full bg-yellow-400 opacity-100">|</span>
    </div>
  );
};

export default TypingEffect;

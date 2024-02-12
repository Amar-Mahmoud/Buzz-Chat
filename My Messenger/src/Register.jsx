import axios from "axios";
import { useContext, useState, useRef } from "react";
import { UserContext } from "./UserContext";
import backgroundImage from './background.png';
import TypingEffect from "./TypingEffect";
import BeeBuzz from "./BeeBuzz"
import beeImage from './BuzzTalkLogo.png';

export default function RegisterLoginPage(){
    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const[isLoginOrRegister, setIsLoginOrRegister] = useState('register');
    const {setUsername:setLoggedInUsername, setID} = useContext(UserContext);
    const [errorMessage, setErrorMessage] = useState('');


    const [start, setStart] = useState(false);

    const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  

    const handleStart = () => {
      setStart(true);
    };

    async function HandleSubmit(ev){
        ev.preventDefault();
        const url = isLoginOrRegister === 'register' ? 'register' : 'login';
        const {data} = await axios.post(url, {username, password});
        setLoggedInUsername(username);
        setID(data._id);
    }

    async function HandleSubmit(ev) {
        ev.preventDefault();
        setErrorMessage(''); // Clear any previous error messages
        try {
            const url = isLoginOrRegister === 'register' ? 'register' : 'login'; // Adjust with your actual backend URL
            const response = await axios.post(url, { username, password }, { withCredentials: true });
            if (response.data) {
                setLoggedInUsername(username);
                setID(response.data._id);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        }
    }

    return (
        <div className="h-screen w-screen" style={{ backgroundSize: 'cover'
        }}>
                
    <div className="absolute  m-6">
        <div className="text-black text-3xl font-bold flex gap-2 items-center">
            <img style={{width: 150}} src={beeImage}></img>
        </div>    
    </div>

    <div className="flex flex-col justify-between h-screen">

    <div className="flex items-center justify-start h-screen m-auto">
        <TypingEffect/>
        
    </div>
    <div className="text-center p-5">
        <button
          onClick={scrollToBottom}
          className="w-48 h-16 text-2xl bg-white hover:bg-yellow-700 hover:text-white text-black font-bold py-2 px-4 border-black border-2 active:translate-y-1 transform transition-all duration-300"
        >
          Get Started
        </button>
      </div>



      <div ref={bottomRef} className="h-1"></div>
    </div>

    <div className="flex justify-center items-center h-full border-t-gray-200 border-4">
        
        <form className="w-96 mb-12" onSubmit={HandleSubmit}>
            <input value={username} 
                onChange={ev=>setUsername(ev.target.value)} 
                type="text" placeholder="Username" 
                className="block w-full p-2 mb-2 border border-gray-300" />
            <input value={password}
                onChange={ev=>setPassword(ev.target.value)} 
                type="password" placeholder="Password" 
                className="block w-full p-2 mb-2 border border-gray-300" />
            <button className="hover:bg-yellow-700 w-full text-xl border-2 border-black text-black font-bold py-2 px-4 active:translate-y-1 transform transition-all duration-300">
                {isLoginOrRegister === 'register' ? 'Sign up' : 'Log in'}
            </button>

            <div className="text-center mt-2 space-y-4">
            {isLoginOrRegister === 'register' && (
                <div>
                <div className="text-black font-medium">Already a user?</div>
                <button 
                    className="text-black underline hover:text-yellow-700 font-semibold transition-colors duration-200 ease-in-out" 
                    onClick={() => setIsLoginOrRegister('login')}
                >
                    Click here to login
                </button>
                </div>
            )}
            {isLoginOrRegister === 'login' && (
                <div>
                <div className="text-black font-medium">Don't have an account?</div>
                <button 
                    className="text-black underline hover:text-yellow-700 font-semibold transition-colors duration-200 ease-in-out" 
                    
                    onClick={() => setIsLoginOrRegister('register')}
                >
                    Sign up
                </button>
                </div> 
            )}
            {errorMessage && <div className="text-red-500 text-sm mb-2">{errorMessage}</div>}
            </div>

        </form>
    </div>
</div>

    );
}



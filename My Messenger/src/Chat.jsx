import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import { IoIosCloseCircleOutline, IoMdPersonAdd, IoIosSearch} from "react-icons/io";
import { PiSignOut } from "react-icons/pi";
import axios from "axios";
import Avatar from "./Avatar";
import Person from "./Person";
import UseAnimations from "react-useanimations";
import activity from 'react-useanimations/lib/activity';
import { motion , AnimatePresence } from "framer-motion"


export default function Chat() {
    const [ws, setWs] = useState(null);

    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedContact, setSelectedContact] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [offlinePeople, setOfflinePeople] = useState({});
    const [query, setQuery] = useState('');
    const messagesBoxReference = useRef();
    const {username, id, setID, setUsername} = useContext(UserContext);
    const [friendRequests, setFriendRequests] = useState([]);
    
    const onlineExclUser = {...onlinePeople};
    delete onlineExclUser[id];

    const [selectedId, setSelectedId] = useState(null)

    const messagesExclDupes = uniqBy(messages, '_id');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [friendStatus, setFriendStatus] = useState({});
    const [isSearchEmpty, setIsSearchEmpty] = useState(false);
    const searchViewRef = useRef(null);




  const toggleSearch = () => setShowSearch(!showSearch);

    useEffect(()=>{
        connectToWs();
        checkFriendReq();
        fetchFriends();
        
    }, []);

    function connectToWs(){
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);
        ws.addEventListener('message', handleMessage )
        ws.addEventListener('close', ()=> {
            setTimeout(()=>{
                connectToWs();
            }, 1000);
        });
    }

    function logout(){
        axios.post('/logout').then(()=>{
            setID(null);
            setUsername(null);
        });

    }

    function showOnlinePeople(peopleArr){
        const people = {};
        peopleArr.forEach(({userID,username}) => {
            people[userID] = username;
        });
        setOnlinePeople(people);
        
    }

    function handleMessage(e) {
        const messageData = JSON.parse(e.data);
      
        if ('online' in messageData) {
          showOnlinePeople(messageData.online);
        } else if ('text' in messageData) {
          setMessages((prev) => [...prev, { ...messageData }]);
        }
      }

      function getUsernameByUserId(userId) {
        // Check if user is online first
        if (onlinePeople.hasOwnProperty(userId)) {
            return onlinePeople[userId];
        }
        // If not online, check if the user is offline
        if (offlinePeople.hasOwnProperty(userId)) {
            return offlinePeople[userId];
        }
        // If user is not found in both online and offline, return a default value or null
        return null;
    }

    function sendMessage(e){
        e.preventDefault();
        console.log('sending message')
        ws.send(JSON.stringify({
                recipient: selectedContact,
                text: newMessage,
        }));
        setNewMessage('');
        setMessages(prev => ([...prev, {
            text: newMessage, 
            sender: id,
            recipient: selectedContact,
            _id: Date.now(),
        }]));
    }

    useEffect(() => {
        axios.get('/people').then(res => {
            const allPeople = res.data
                .filter(p => p._id !== id); // Exclude the current user
    
            const offlinePeopleUpdated = allPeople.reduce((acc, person) => {
                if (!Object.keys(onlinePeople).includes(person._id)) {
                    acc[person._id] = person.username; // Ensure you're setting a username or the full person object based on your needs
                }
                return acc;
            }, {});
    
            setOfflinePeople(offlinePeopleUpdated);
        });
    }, [10000]); 
    

    useEffect(()=>{
        const div = messagesBoxReference.current;
        if(div){
            div.scrollIntoView({behavior: 'smooth', block: 'end'});
        }
    }, [messages]);

    useEffect(() => {
        if(selectedContact) {
            console.log(selectedContact);
            axios.get(`/messages/${selectedContact}`)
                .then(res => setMessages(res.data))
                .catch(err => console.error("Failed to fetch messages:", err));
        }
    }, [selectedContact]);

    
  //message search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

// Function to fetch friends
const fetchFriends = async () => {
    try {
        const response = await axios.get('/friends', { withCredentials: true });
        // Assuming the response contains an array of friend objects
        setFriendStatus(response.data.reduce((acc, friend) => {
            acc[friend._id] = true; // Or any other logic to mark the user as a friend
            return acc;
        }, {}));
    } catch (error) {
        console.error('Error fetching friends:', error);
    }
};


const unifiedFriendsList = Object.entries({...onlinePeople, ...offlinePeople})
    .filter(([userId, _]) => friendStatus[userId]) // Filter to include only friends
    .map(([userId, username]) => {
        const isOnline = !!onlinePeople[userId];
        return {
            userId,
            username,
            isOnline
        };
    });

const clearInput = () => {
setQuery('');
};

function sendFriendRequest(toUserId) {
axios.post('/send-friend-request', { fromUserId: id, toUserId })
.then(() => {
    console.log('Friend request sent');
    // Optionally, update UI to reflect the sent request
})
.catch(error => console.error('Could not send friend request', error));
}

function acceptFriendRequest(fromUserId) {
    axios.post('/accept-friend-request', { fromUserId, toUserId: id })
    .then(() => {
        console.log('Friend request accepted');
        checkFriendReq();
        fetchFriends();

    })
    .catch(error => console.error('Could not accept friend request', error));
}


function checkFriendReq(){
    axios.get('/friend-requests', { withCredentials: true }) // Ensure withCredentials is true if cookies are used
    .then(response => {
        setFriendRequests(response.data);
    })
    .catch(error => console.error("Failed to fetch friend requests:", error));
}


useEffect(() => {
    // Function to detect click outside
    function handleClickOutside(event) {
      if (searchViewRef.current && !searchViewRef.current.contains(event.target)) {
        setShowSearch(false); // Assuming setShowSearch controls the visibility of the search view
      }
    }
  
    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup the event listener on component unmount
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Empty dependency array means this effect runs once on mount
  



const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchQuery) return;
    setShowResults(true);
    console.log(`Searching for: ${searchQuery}`); // Debug log
    try {
        const response = await axios.get(`http://localhost:4000/search-users?username=${searchQuery}`, { withCredentials: true });
        console.log('Search results:', response.data); // Debug log

        const filteredResults = response.data.filter(user => !friendStatus[user._id]);
        setSearchResults(filteredResults);
        setIsSearchEmpty(filteredResults.length === 0);
    } catch (error) {
        console.error('Failed to search users:', error);
    }
};


    

    return(
        <div className="flex h-screen">
            <div className="bg-customGray w-1/3 flex flex-col border-r-2 border-customGraySearch">
            <form onSubmit={{}} className="flex justify-center mt-2 w-full max-w-md">
                <div className=" mx-3 flex items-center border p-1 rounded-lg text-gray-500 bg-customGraySearch w-full">
                    <IoIosSearch className="mx-1" />
                    <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="bg-transparent flex-1 outline-none"
                    />
                    {query && (
                        <IoIosCloseCircleOutline onClick={clearInput} />
                        )}
                </div>
            </form>
            <div className="flex-grow">
            {unifiedFriendsList.map(({ userId, username, isOnline }) => (
                    <Person
                        key={userId}
                        id={userId}
                        online={isOnline}
                        username={username}
                        onClick={() => setSelectedContact(userId)}
                        selected={userId === selectedContact}
                    />
                )
            )
        }
        </div>
                
                        
                <div className="p-2">
                {
                    friendRequests && friendRequests.length > 0 && (
                        <div className="shadow-lg bg-white p-1  m-2 w-auto">
                            <div className="ml-3 text-lg font-normal w-auto m-3">Requests: </div>
                            {friendRequests.map(request => (
                                <div key={request.fromUserId} className=" flex justify-between m-2 items-center">
                                    <span><Person id={request.fromUserId} username={request.fromUserUsername}></Person>{}</span>
                                    <div className="flex justify-end mx-2 ">
                                    <button onClick={() => acceptFriendRequest(request.fromUserId)} className="text-black font-semibold py-1 px-4 mx-2 rounded-full">
                                        Reject
                                    </button>
                                    <button onClick={() => acceptFriendRequest(request.fromUserId)} className="border-black border text-black font-semibold py-1 px-4 rounded-full">
                                        Accept
                                    </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }
                
                <div className="flex justify-between items-center gap-2 p-5 " > 
                    <div className="flex items-center gap-2">
                        <Avatar online={true} username={username} userID={id} />
                        {username}
                    </div>
                    <div className="flex gap-4 text-2xl">
                    
                    <button className=" active:translate-y-1 transform transition-all duration-300"
                            onClick={logout}>
                        <PiSignOut />
                    </button>

                    <button type="button" onClick={toggleSearch} className="text-xl m-2">
                            <IoMdPersonAdd/>
                        </button>
                    </div>
                    </div>

                    
                </div>

            </div>
            
            <div className="flex flex-col w-2/3 h-full" ref={searchViewRef}>
            <div className="bg-customGray h-16 w-full border-b-customGraySearch border-2 "  >
                
                <div className="ml-4 text-xl font-semibold mt-4">{getUsernameByUserId(selectedContact)}</div>
        </div>
            {showSearch && (
            <div >
            <div className="bg-customGray h-16 w-full border-b-customGraySearch border-2 "  >
                
            <div className="mt-3 ml-10 mb-2">
                
            <form className="flex gap-2 " onSubmit={handleSearch}>
                
                    <input 
                        value={searchQuery} 
                        onChange={(ev) => setSearchQuery(ev.target.value)} 
                        type="text" 
                        placeholder="Search for friends" 
                        className="text-sm bg-transparent flex-grow mx-3 items-center border p-2 text-gray-500 bg-customGraySearch w-full" 
                    />
                
                </form>
                
            </div>
            
            </div>
            <div className="flex flex-col bg-white w-full p-2 flex-grow">
            {!!showResults &&
                <div>
                {searchResults.map((user, index) => (
                    <div key={user._id} onClick={() => sendFriendRequest(user._id)} className="cursor-pointer flex justify-between p-4 mt-2 items-center rounded-xl shadow-md">
                        <span className="">{user.username}</span>
                        
                    </div>
                ))}
            </div>}
            </div>
            
            
            </div>)}

            


            

            

            
            <div className="flex flex-col bg-white w-full p-2 flex-grow">   
                
            <div className="flex-grow">

                
                    {!selectedContact && (
                        <div className="flex items-center justify-center h-full">
                            <UseAnimations animation={activity} size={56} />
                            <div className="m-4 text-xl">Select or add a contact to get started</div>
                        </div>
                    )}
                    {!!selectedContact && (
                        <div className="relative h-full">
                        <div  className="overflow-y-scroll absolute inset-0">
                            {messagesExclDupes.map(message => (
                                <div key = {message._id} className={""+(message.sender === id ? 'text-right': 'text-left')}>
                                <div>
                                    <div className={" mr-3 max-w-72 text-left inline-block p-2 my-1 rounded-3xl text-sm "+ (message.sender === id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black')}>
                                        {message.text}
                                    </div>
                                </div>
                                </div>
                            ))}
                            <div ref={messagesBoxReference}></div>
                            </div>
                            
                        </div>
                    )}
                    

                </div>
                {!!selectedContact &&(
                    <div className=" mt-3 ml-10 mb-2" >
                    <form className="flex gap-2" onSubmit={sendMessage}>
                    <input 
                    value={newMessage} 
                    onChange={ev => setNewMessage(ev.target.value)} 
                    type="text" 
                    placeholder="Type a message.." 
                    className="text-sm bg-white border p-2 flex-grow rounded-full " />
                    {newMessage && (
                        <button type="submit" className="bg-customBlue p-2 text-white rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                    )}
                    

                </form>
                </div>
                )}
            </div>
        </div>
       
        </div>
        
    );
}
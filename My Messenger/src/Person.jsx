import React from 'react';
import Avatar from "./Avatar";

export default function Person({ id, username, onClick, selected, online, isFriend, lastMessage }) {
    // Conditional class or style based on friend status
    const friendStatusClass = isFriend ? 'friend-status-class' : 'non-friend-status-class'; // Example classes for styling

    return (
        <div key={id} onClick={() => onClick(id)} 
        className={`p-2 flex flex-col gap-1 cursor-pointer rounded-sm m-3 ${selected ? 'bg-white text-black rounded-lg shadow-lg' : ''} ${friendStatusClass}`}>
            <div className="flex items-center gap-2">
                <Avatar online={online} username={username} userID={id} />
                <span className="font-semibold"> {username} </span>
                {/* Optionally display friend status */}
            </div>
            {/* Conditionally display the last message if it exists */}
            {lastMessage && (
                <div className="text-sm text-gray-500">
                    {lastMessage}
                </div>
            )}
        </div>
    );
}

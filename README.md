# Buzz Chat

Buzz Chat is a full-stack real-time messaging application built with the MERN stack: MongoDB, Express, React, and Node.js. It provides a secure and dynamic platform for users to create accounts, connect with friends, and engage in real-time conversations.

## Features

- **User Account Creation**: Users can sign up and authenticate securely.
- **Friend System**: Users can send friend requests, accept requests, and manage their friend lists.
- **Real-Time Messaging**: Enables users to chat instantly with their friends.
- **Security**: Implements encryption to safeguard user credentials.
- **Responsive Design**: Ensures a smooth user experience across different devices and screen sizes.

## Technologies

- **Frontend**: React.js (My Messenger)
- **Backend**: Node.js with Express.js (backend)
- **Database**: MongoDB
- **Real-Time Communication**: Utilizes WebSocket server for seamless chat functionality.
- **Security**: Uses bcrypt.js for robust encryption.

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- Node.js
- Yarn package manager
- MongoDB

### Installation

Clone the repository:
```bash
git clone https://github.com/Amar-Mahmoud/Buzz-Chat.git
cd Buzz-Chat
```

Install backend dependencies:
```bash
cd backend
yarn install
```

Install frontend dependencies:
```bash
cd ../My Messenger
yarn install
```

Configuration
Create a .env file in the backend directory to store your MongoDB URI and JWT secret:
```bash
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
```

Running the Application
To start the front end:
```bash
cd Buzz-Chat
yarn dev
```


To start the backend server using nodemon:
```bash
nodemon index.js
```

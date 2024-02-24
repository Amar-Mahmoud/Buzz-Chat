const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
app.use(cookieParser())
const jsonwebtoken = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const websocket = require('ws');
const bcryptSalt = bcrypt.genSaltSync(10);

dotenv.config();

app.use(cors({
    credentials: true,
    origin: process.env.HOST_NAME,
}));

//connecting to mongodb
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

//test
app.get('/main', (req, res) => {
    res.json('main ok');
});

//notify online people
function NotifyOnlinePeople(){
    [...websocketserver.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...websocketserver.clients]
            .map(c=>({userID: c.userID, username: c.username}))}
            
        ));
    });
}

async function getUserDataFromReq(req){
    return new Promise((resolve, reject)=>{
        const token = req.cookies?.token;
        if (token){
            jsonwebtoken.verify(token, process.env.JWT_SECRET, {}, (err, userdata) => {
            if (err) throw err;
            resolve(userdata);
    }); 
    }else {
        reject(new Error('no token'));
    } 
    })
    
}

//checks if password is strong
function isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

//gets messages with given user id
app.get('/messages/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        // Validate userID from the URL
        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({ message: "Invalid user ID in URL." });
        }

        const userdata = await getUserDataFromReq(req);
        const ourUserID = userdata.userID;
        // Validate ourUserID from the token
        if (!mongoose.Types.ObjectId.isValid(ourUserID)) {
            return res.status(400).json({ message: "Invalid user ID from token." });
        }

        // Query to fetch messages between the two users
        const messages = await Message.find({
            $or: [
                { sender: userID, recipient: ourUserID },
                { sender: ourUserID, recipient: userID }
            ],
        }).sort();

        res.json(messages);
    } catch (error) {
        console.log(error); // Log the error for debugging
        res.status(500).json({ message: "An error occurred while fetching messages." });
    }
});

//retrieves user profile
app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token){
    jsonwebtoken.verify(token, process.env.JWT_SECRET, {}, (err, userdata) => {
        if (err) throw err;
        res.json(userdata);
    }); 
}
    else{
        res.status(401).json('no token');
    }  
});

//sends friend request to user id
app.post('/send-friend-request', async (req, res) => {
    const { fromUserId, toUserId } = req.body;
  
    try {
      // Check if already friends
      const fromUser = await User.findById(fromUserId);
      if (fromUser.friends.includes(toUserId)) {
        return res.status(400).send('You are already friends.');
      }
  
      // Proceed with sending a friend request if not friends
      await User.findByIdAndUpdate(toUserId, {
        $addToSet: { friendRequests: fromUserId } // Prevents duplicates
      });
      res.send('Friend request sent.');
    } catch (error) {
      console.error("Failed to send friend request:", error);
      res.status(500).send('Internal server error');
    }
  });
      
    // Endpoint to accept a friend request
    app.post('/accept-friend-request', async (req, res) => {
    const { fromUserId, toUserId } = req.body;
    // Remove from friendRequests
    await User.findByIdAndUpdate(toUserId, {
        $pull: { friendRequests: fromUserId }
    });
    // Add to friends list for both users
    await User.findByIdAndUpdate(toUserId, {
        $addToSet: { friends: fromUserId }
    });
    await User.findByIdAndUpdate(fromUserId, {
        $addToSet: { friends: toUserId }
    });
    res.send('Friend request accepted.');
    });

//gets list of users
app.get('/people', async (req,res) =>{
   const users = await User.find({}, {'_id':1, username:1});
   res.json(users);
});

//gets list of friends
app.get('/friends', async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided." });
        }

        const userData = await new Promise((resolve, reject) => {
            jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
        const currentUserId = userData.userID; // Make sure this matches how you access the current user's ID

        // Find the current user and populate their friends list
        const user = await User.findById(currentUserId)
            .populate('friends', 'username') // Populate the 'friends' array. Adjust to include fields you need, e.g., 'username'
            .exec();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Respond with the populated friends array
        res.json(user.friends);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ message: "An error occurred while fetching friends" });
    }
});


//checks if user is friends with a user id
app.post('/is-friends', async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided." });
        }

        const userData = await new Promise((resolve, reject) => {
            jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });

        const userIds = req.body.userIds; // Expecting an array of userIds
        const user = await User.findById(userData.userID).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const statuses = userIds.reduce((acc, userId) => {
            acc[userId] = user.friends.some(friendId => friendId.toString() === userId);
            return acc;
        }, {});

        res.json(statuses);
    } catch (error) {
        console.error('Error checking friendship statuses:', error);
        res.status(500).json({ message: "An error occurred." });
    }
});


//gets active friend requests
app.get('/friend-requests', async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided." });
        }

        const userData = await new Promise((resolve, reject) => {
            jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });

        const user = await User.findById(userData.userID)
            .populate('friendRequests', '_id username')
            .exec();

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Adjusting the response to match what the frontend expects
        res.json(user.friendRequests.map(friendRequest => ({
            fromUserId: friendRequest._id,
            fromUserUsername: friendRequest.username
        })));
    } catch (error) {
        console.error('Failed to fetch friend requests:', error);
        res.status(500).json({ message: "An error occurred while fetching friend requests." });
    }
});



//searches for users
app.get('/search-users', async (req, res) => {
    const searchTerm = req.query.username;
    if (!searchTerm) {
        return res.json([]);
    }
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided." });
        }

        const userData = await new Promise((resolve, reject) => {
            jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
        const currentUserId = userData.userID;

        const users = await User.find({
            _id: { $ne: currentUserId },
            username: { $regex: searchTerm, $options: 'i' }
        }, '_id username').limit(10);

        res.json(users);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json('Internal server error');
    }
});


//login
app.post('/login',async (req,res) =>{
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
    if(foundUser) {
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if (passOk){
            jsonwebtoken.sign({userID:foundUser._id, username}, process.env.JWT_SECRET, {}, (err, token) => {
                res.cookie('token', token, {sameSite: 'none', secure: true}).json({
                    _id: foundUser._id, 
                })
            })
        }
    }
});

//logout
app.post('/logout', (req,res) =>{
    res.cookie('token', '', {sameSite: 'none', secure: true}).json('Logged out');
});

//singup
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    if (!isStrongPassword(password)) {
        return res.status(400).json({ message: 'Password does not meet strength requirements.' });
    }
    try {
        const hashedPass = bcrypt.hashSync(password, bcryptSalt )
        const createdUser = await User.create({username: username, password: hashedPass });
        jsonwebtoken.sign({userID:createdUser._id, username}, process.env.JWT_SECRET, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {sameSite:'none', secure: true}).status(201).json({ message: 'Registration successful',
             _id: createdUser._id, 
             });
        });
    } catch (err) {
        if (err) throw err;
        res.status(500).json('error');
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(4000);

const websocketserver = new websocket.WebSocketServer({server});
websocketserver.on('connection', (connection, req) => {

    connection.isAlive = true;
    //ping connection every 5 seconds
    connection.timer = setInterval(()=> {
        connection.ping();
        connection.deathTimer = setTimeout(()=>{
            connection.isAlive = false;
            connection.terminate();
            NotifyOnlinePeople();
        }, 1000);
    },5000);

    connection.on('pong', ()=>{
        clearTimeout(connection.deathTimer);
    });

    const cookies = req.headers.cookie;
    if (cookies) {
        const tokencookiestring = cookies.split(';').find(str => str.startsWith('token='));
        if(tokencookiestring) {
            const token = tokencookiestring.split('=')[1];
            if(token) {
                jsonwebtoken.verify(token, process.env.JWT_SECRET, {}, (err, data) => {
                    if (err) throw err;
                    const {userID, username} = data;
                    connection.userID = userID;
                    connection.username = username;

                });
            }
        }

    }  

   

    connection.on('message', async (message) =>{
        const messageText = JSON.parse(message.toString());
        const {recipient, text} = messageText;
        
        try {
        if (recipient && text){
           const messageDoc = await Message.create({
                sender: connection.userID, 
                recipient,
                text,
            });
            [...websocketserver.clients]
            .filter(c=>c.userID === recipient)
            .forEach(c=>c.send(JSON.stringify({
                text, 
                sender: connection.userID,
                recipient,
                _id:messageDoc._id,
                })));
        }
    }catch (error){
        console.error("Error creating message")
    }

    });

NotifyOnlinePeople()
    
});

websocketserver.on('close', data =>{

});
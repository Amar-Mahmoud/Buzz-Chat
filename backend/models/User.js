const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {type:String, unique:true},
    password: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],


}, {timestamps: true});

const UserModel = mongoose.model('User', UserSchema);
module.exports =  UserModel;
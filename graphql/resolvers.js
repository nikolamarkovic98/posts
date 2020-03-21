const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// my id: 5e4bf5aed2e65b246ca782b6

const getUser = async _id => {
    try{
        const user = await User.findById(_id);
        return{
            ...user._doc,
            password: null,
            posts: getPosts.bind(this, user.posts)
        }
    } catch(err){
        throw err;
    }
}

const getPosts = async postIds => {
    try{
        let posts = await Post.find({_id: {$in: postIds}});
        return posts.map(post => {
            return {
                ...post._doc,
                _id: post.id,
                creator: getUser.bind(this, post.creator),
                createdAt: new Date(post.createdAt).toISOString(),
                updatedAt: new Date(post.updatedAt).toISOString()
            }
        })
    } catch(err){
        throw err;
    }
}

module.exports = {
    posts: async args => {
        try{
            const posts = await Post.find();
            if(posts.length == 0)
                return [];
            return posts.map(post => {
                return {
                    ...post._doc,
                    _id: post.id,
                    creator: getUser.bind(this, post.creator),
                    createdAt: new Date(post.createdAt).toISOString(),
                    updatedAt: new Date(post.updatedAt).toISOString()
                }
            });
        } catch(err){
            throw err;
        }
    },
    createPost: async (args, req) => {
        if(!req.isAuth)
            throw new Error('Unauthenticated');
        const post = new Post({
            // id will be created automatically
            title: args.postInput.title,
            body: args.postInput.body,
            creator: req.userId
        });
        try{
            const newPost = await post.save();
            const user = await User.findById(newPost.creator);
            user.posts.push(newPost.id)
            await user.save();
            return {
                ...newPost._doc,
                _id: newPost.id,
                creator: getUser.bind(this, newPost.creator)
            }
        } catch (err){
            throw err;
        }
    },
    removePost: async (args, req, res) => {
        if(!req.isAuth)
            throw new Error('Unauthenticated');
        try{
            const post = await Post.findById(args._id);
            if(post.creator != req.userId){
                return {
                    error: 'Unauthorized'
                }
            }
            await post.remove();
            const user = await User.findById(post.creator);
            for(let i = 0; i < user.posts.length; i++){
                if(user.posts[i].toString() == args._id){
                    user.posts.splice(i, 1);
                }
            }
            await user.save();
            return {
                ...post._doc,
                _id: args._id,
                error: ''
            }
        } catch(err){
            throw err;
        }
    },
    createUser: async args => {
        try{
            let user = await User.findOne({username: args.userInput.username});
            if(user){
                throw new Error('Username already exists');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            user = new User({
                username: args.userInput.username,
                password: hashedPassword,
                posts: []
            });
            const newUser = await user.save();
            return {
                ...newUser._doc,
                password: null,
                _id: newUser.id
            }
        } catch(err){
            throw err;
        }
    },
    user: async ({_id}) => {
        try{
            return await getUser(_id);
        } catch (err){
            console.log(err);
        }
    },
    login: async ({ username, password }) => {
        try{
            const user = await User.findOne({username: username});
            if(!user)
                throw new Error('Invalid username!');
            const isEqual = await bcrypt.compare(password, user.password);
            if(!isEqual)
                throw new Error('Invalid password!');
            const token = await jwt.sign({userId:user.id,username:user.username}, 'mysecretkey', {expiresIn:'1h'});
            return{
                userId: user.id,
                username: user.username,
                token: token,
                expiresIn: 1
            }
        } catch(err){
            throw err;
        }
    }
}
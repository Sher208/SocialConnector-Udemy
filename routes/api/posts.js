const express = require('express');
const router = express.Router();
const {check , validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const mongoose = require('mongoose');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  POST  api/posts
// @desc   Create a new Post
// @access Private
router.post('/', [auth, [
    check('text', 'Text is empty').not().isEmpty()
]], async function(req, res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        console.log(err.message);
        res.status(400).send('Server error');
    }

});

// @route  GET  api/posts
// @desc   GET all posts
// @access Private
router.get('/', auth, async function(req, res){
    try {
        const posts = await Post.find().sort({ date: -1});
        res.json(posts);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route  GET  api/posts/:id
// @desc   GET a Perticular post
// @access Private
router.get('/:id', auth, async function(req, res){
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.json(post);
    } catch (err) {
        if(mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(404).json({ msg: 'Post not found'});
        }
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route  DELETE  api/posts/:id
// @desc   DELETE a Perticular post
// @access Private
router.delete('/:id', auth, async function(req, res){
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({ msg: 'Post not found'});
        }
        
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg: 'User is not Authorized to do that'});
        }

        await post.remove();

        res.json(post);
    } catch (err) {
        if(mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(404).json({ msg: 'Post not found'});
        }
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route  PUT  api/posts/like/:id
// @desc   Like a post
// @access Private

router.put('/like/:id',auth, async function(req, res){
    try {
        const post = await Post.findById(req.params.id);

        if(post.likes.filter(like => like.user.toString()==req.user.id).length > 0){
            return res.status(400).json({ msg: 'Post already liked'});
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route  PUT  api/posts/unlike/:id
// @desc   unlike a post
// @access Private
router.put('/unlike/:id',auth, async function(req, res){
    try {
        const post = await Post.findById(req.params.id);

        if(post.likes.filter(like => like.user.toString()==req.user.id).length === 0){
            return res.status(400).json({ msg: 'Post has not been liked'});
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

// @route  PUT  api/posts/comment/:id
// @desc   Comment on a post
// @access Private
router.post('/comment/:id', [auth, [
    check('text', 'Text is empty').not().isEmpty()
]], async function(req, res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };
        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.log(err.message);
        res.status(400).send('Server error');
    }

});

// @route  PUT  api/posts/comment/:id/:comment_id
// @desc   Comment on a post
// @access Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        //Make sure the comments exists
        if(!comment){
            return res.status(404).json({ msg: 'Comment does not exists'});
        }

        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg: 'User not authorized'});
        }

        const removeIndex = post.comments.map(comment => comment._id.toString()).indexOf(req.params.comment_id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.log(err.message);
        res.status(400).send('Server error');
    }
});



module.exports = router;
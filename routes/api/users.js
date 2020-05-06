const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');


// @route  GET  api/users
// @desc   Register user
// @access Public
router.post('/',[
    check('name', 'Name is requires').not().isEmpty(),
    check('email', 'Please inlcude a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more cahrascters').isLength({min: 6})
] ,async function(req, res){
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        //BAD REQUEST 400
        return res.status(400).json({errors: errors.array()});
    }
    
    const {name, email, password} = req.body;
    
    try{
        //See if user exists
        let user = await User.findOne({ email });

        if(user){
            return res.status(400).json({ errors: [{ msg: 'User already exists'}]});
        }

        const avatar = gravatar.url(email, {
            s:'200', //size
            r:'pg',
            d:'mm'
        });

        user = new User({
            name,
            email,
            avatar,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user._id
            }
        };

        jwt.sign(
            payload,
            config.get('jwtToken'),
            { expiresIn: 360000 },
            (err, token) =>{
                if(err){
                    throw err;
                }else{
                    res.json({ token });
                }
            }
        );
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server error')
    }
});

module.exports = router;
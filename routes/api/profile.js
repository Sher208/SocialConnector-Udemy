const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const mongoose = require('mongoose');
const request = require('request');
const config = require('config');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator');
var ObjectId = require('mongoose').Types.ObjectId;

// @route  GET  api/profile/
// @desc   GET  all profile
// @access Public
router.get('/', async function (req, res) {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  GET  api/profile/me
// @desc   Get current users profile
// @access Private
router.get('/me', auth, async function (req, res) {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET  api/profile/
// @desc   Post current users profile
// @access Public
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Please enter your status').not().isEmpty(),
      check('skills', 'Skills are required').not().isEmpty(),
    ],
  ],
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    const profileFeilds = {};
    profileFeilds.user = req.user.id;
    if (company) profileFeilds.company = company;
    if (website) profileFeilds.website = website;
    if (location) profileFeilds.location = location;
    if (bio) profileFeilds.bio = bio;
    if (status) profileFeilds.status = status;
    if (githubusername) profileFeilds.githubusername = githubusername;
    if (skills) {
      profileFeilds.skills = skills.split(',').map((skill) => skill.trim());
    }

    profileFeilds.social = {};
    if (facebook) profileFeilds.social.facebook = facebook;
    if (youtube) profileFeilds.social.youtube = youtube;
    if (twitter) profileFeilds.social.twitter = twitter;
    if (instagram) profileFeilds.social.instagram = instagram;
    if (linkedin) profileFeilds.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFeilds },
          { useFindAndModify: false, new: true }
        );
        return res.json(profile);
      }
      profile = new Profile(profileFeilds);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  GET  api/profile/users/:user_id
// @desc   GET  public users profile
// @access Public
router.get('/users/:user_id', async function (req, res) {
  try {
    const profiles = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profiles) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.json(profiles);
  } catch (err) {
    // TODO - MAKE it recognize wrong object id
    // if(err.name == 'ObjectId'){
    //     return res.status(400).json({msg : 'Profile not found'});
    // }
    res.status(500).send('Server error');
  }
});

// @route  DELETE  api/profile
// @desc   DELETE  User profile and post
// @access Private
router.delete('/', auth, async function (req, res) {
  try {
    await Post.deleteMany({ user: req.user.id });
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'Delete Successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT  api/profile/experince
// @desc   PUT  User experince update
// @access Private
router.put(
  '/experince',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company name is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async function (req, res) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperince = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      profiles = await Profile.findOne({ user: req.user.id });
      profiles.experince.unshift(newExperince);
      await profiles.save();
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  DELETE  api/profile/experince/:exp_id
// @desc   DELETE  User Experince
// @access Private
router.delete('/experince/:exp_id', auth, async function (req, res) {
  try {
    const profiles = await Profile.findOne({ user: req.user.id });
    const removeIndex = profiles.experince
      .map((item) => item._id)
      .indexOf(req.params.exp_id);
    profiles.experince.splice(removeIndex, 1);
    await profiles.save();
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT  api/profile/education
// @desc   PUT  User education
// @access Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'degree name is required').not().isEmpty(),
      check('fieldofstudy', 'degree name is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async function (req, res) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      profiles = await Profile.findOne({ user: req.user.id });
      profiles.education.unshift(newEducation);
      await profiles.save();
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  DELETE  api/profile/education/:edu_id
// @desc   DELETE  User Education
// @access Private
router.delete('/education/:edu_id', auth, async function (req, res) {
  try {
    const profiles = await Profile.findOne({ user: req.user.id });
    const removeIndex = profiles.education
      .map((item) => item._id)
      .indexOf(req.params.edu_id);
    profiles.education.splice(removeIndex, 1);
    await profiles.save();
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET  api/profile/github/:git_username
// @desc   GET  github user repos
// @access Private
router.get('/github/:git_username', async function (req, res) {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.git_username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&github_secret=${config.get('githubSecretKey')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };
    request(options, (err, response, body) => {
      if (err) console.error(err);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No github found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {}
});

module.exports = router;

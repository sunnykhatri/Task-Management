const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');

const router = new express.Router();

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user  = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        console.log(e);
        res.status(400).send({ error: 'Unable to login. Please check your credentials and try again.' });
    }
});

router.post('/users/logout', auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
});

router.post('/users/logoutall', auth, async (req,res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
});

router.patch('/users/me', auth, async (req, res) => {
    console.log('Request Method:', req.method);
    const updates = Object.keys(req.body);
    const allowUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]);

        await req.user.save();
        res.send(req.user);
    } catch (error) {
        console.log(error);
        res.status(500).send
    }
});

router.delete('/users/me', auth, async(req, res) => {
    try{
        await req.user.deleteOne();
        res.send(req.user);
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be an image'));
        }
        cb(undefined, true); //cb = a callback fn
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        console.log('File:', req.file); // Log the file information
        if (!req.file) {
            return res.status(400).send({ error: 'Please upload an image file' });
        }

        req.user.avatar = req.file.buffer;
        console.log('User before save:', req.user); // Log the user object before saving

        await req.user.save();
        console.log('User after save:', req.user); // Log the user object after saving

        res.send();
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    }
});

router.get('/users/:id/avatar', async(req,res) => {
    try {
        const user = await User.findById(req.params.id);
        console.log(user);
        res.send(user.avatar);
    } catch (error) {
        console.log(error);
        res.status(500).send({error: error.message});
    }
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

module.exports = router;
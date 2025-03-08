const express = require('express');
const Task  = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/tasks', auth, async(req, res) => {

    console.log(req.user._id);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    task.save().then(() => {
        res.status(201).send(task);
    }).catch(e => {
        res.status(400).send(e);
    });
});

module.exports = router;
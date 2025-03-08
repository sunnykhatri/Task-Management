require('dotenv').config();
const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// Link to static page like index.html
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server is listening to port ${PORT}`);
});
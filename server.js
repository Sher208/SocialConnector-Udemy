const express = require('express');
const app = express();
const connectDB = require('./config/db');
connectDB();

//Init Middleware (express requiremnet for the body parser)
app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('API running'));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));

app.listen(5000,function(){
    console.log('Server Started');
});
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

const app = express();
dotenv.config();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.URI,{ useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.render('home');
})

app.listen(3000, () => {
    console.log('listening on 3000');
});
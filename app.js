const dotenv= require('dotenv');
dotenv.config({path:'.env'});
const express= require('express');
const mongoose= require('mongoose');
const path = require('path');
const catchError= require('./utilities/catchError');
const expressError= require('./utilities/expressErrors');
const Food= require('./model/food');
const Review= require('./model/review');
const User= require('./model/user');

const Joi= require('joi');
const session= require('express-session');
const flash= require('connect-flash');
const {foodSchema, reviewSchema}= require('./joiSchema.js');
const foodRoutes= require('./routes/food');
const reviewRoutes= require('./routes/review');
const userRoutes= require('./routes/user');
const passport= require('passport');
const LocalStrategy= require('passport-local');

// const session = require('express-session');
const MongoStore = require('connect-mongo');

//express
const app= express();
app.use(express.urlencoded({extended:true}));
//mongoose

//connecting mongoose

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
useUnifiedTopology:true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("DataBase Connected");
});

//ejs
const ejsMate= require('ejs-mate')
app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
const methodOverride= require('method-override')
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));


const secret="thisshouldbeabettersecret";


const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
const sessionconfig= {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now()+ 1000 * 60* 60*24*7,
        maxAge:1000 * 60* 60*24*7
    }
}
app.use(session(sessionconfig));
app.use(flash());
// this must be written after sessionconfig
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//how to store user to session
passport.deserializeUser(User.deserializeUser());//how to remove user from session

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.get('/fakeuser',async(req,res)=>{
//     const user= new User({
//         username: 'kk',
//         email: 'kk@gmail.com'
//     })
//     const newuser= await User.register(user,'chicken');
//     res.send(newuser);
// })
const validateFood= (req, res, next) =>{

    const {error}= foodSchema.validate(req.body);
    if(error){
        const msg= error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400);
    }
    else{
        next();
    }

}
const validateReview= (req,res,next)=>{
    const {error}= reviewSchema.validate(req.body);
      if(error){
        const msg= error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400);
    }
    else{
        next();
    }
}
app.get('/', (req,res)=>{
    res.render('home');
})
app.use('/foods', foodRoutes);
app.use('/foods/:id/review', reviewRoutes);
app.use('/', userRoutes);


app.all('*',(req,res,next)=>{
 next(new expressError("page not found", 404))
})
app.use((err,req,res,next)=>{
    const {statusCode= 500}= err;
    if(!err.message){
       err.message= "something is wrong";
    }
    res.status(statusCode).render('error', {err});
})

const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`hii, listening on port ${PORT}`);
})
const express = require("express");
const app = express();
const ejsmate = require("ejs-mate");
const path = require("path");
const passport = require("passport");
const localStrategy = require("passport-local");
const mongoose = require("mongoose");
const User = require("./models/user.js");
const session = require("express-session");
const flash = require("connect-flash");

mongoose.connect('mongodb://localhost:27017/Users')
.then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.log('MongoDB connection error:', err);
});

app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key', // Replace with your secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));
app.use(flash());

app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/signup", (req, res)=>{
    res.render("listings/signup.ejs");
})

app.post("/signup", async (req, res)=>{
    try{
        const {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.flash("success", "You are registerd!");
        res.redirect("/login");
    }
    catch (e) {
        if (e.name === 'UserExistsError') {
            req.flash("error", "A user with that username already exists.");
        } else {
            req.flash("error", e.message);
        }
        res.redirect("/signup");
    }
    
})

app.get("/login", (req, res)=>{
    res.render("listings/login.ejs");
})

app.post("/login",  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    req.flash("success", "You are logged in!");
    res.redirect("/login");

})

app.listen(3000, () =>{
    console.log("server is listening");
});
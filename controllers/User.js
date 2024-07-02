const User=require("../models/User");
const bcrypt =require("bcrypt");
const jwt=require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require('crypto');
 // Assuming you have a User model

exports.getsignup = (req, res) => {
    let errorMessage = req.flash("error")[0] || null;
    res.render("signup", { errorMessage });
};

exports.signup = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are validation errors, render the signup page with error messages
            return res.status(422).render("signup", { errorMessage: errors.array()[0].msg    });
        }

        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(422).send({ message: "User with this email already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ email, password: hashPassword, username });
        const savedUser = await newUser.save();
        req.flash("success", "User signup successfully");
       // res.status(201).send({ message: "User signup successful", user: savedUser });
        res.redirect("/tasks");
    } catch (error) {
        req.flash("error" , "Internal server error");
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getlogin=(req,res)=> {
    let errorMessage = req.flash("error")[0] || null;
    res.render("login", { errorMessage });
}


exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.render('login', { errorMessage: errors.array()[0].msg });
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            req.flash('error', 'Username does not exist');
            return res.redirect('/login');
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log('Password does not match');
            req.flash('error', 'Password does not match');
            return res.redirect('/login');
        }

        // Generate the JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('Token generated:', token);

        // Store the token in a cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Initialize session
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(() => {
            console.log("Session saved");
            res.redirect("/tasks");
        });

    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getReset = async (req, res) => {
    const errorMessage = req.flash("error")[0] || null;
    res.render("reset", { errorMessage });
};

exports.postReset = async (req, res) => {
    try {
        if (!req.session.isLoggedIn ) {
            req.flash('error', 'User information is missing in the session.');
            return res.redirect('/login');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const user = await User.findOne({ email: req.session.user.email });

        if (!user) {
            req.flash('error', 'No user found.');
            return res.redirect('/tasks');
        }

        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save();

        req.flash('success', 'Password reset link sent to your email.');
        res.redirect(`/new-password?resetToken=${resetToken}`);

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

  
exports.getchangepassword = async (req, res) => {
    try {
        // Extract resetToken from query parameters
        const { resetToken } = req.query;

        // Validate if resetToken exists
        if (!resetToken) {
            req.flash('error', 'Reset token is required.');
            return res.redirect('/tasks'); // Redirect to forgot password page
        }

        // Render the change password page with the resetToken
        res.render('new-password', { resetToken, errorMessage: req.flash('error') });
    } catch (error) {
        console.error('Error in getChangePassword:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect('/tasks');
    }
};

exports.changepassword = async (req, res) => {
    try {
        const { resetToken, password } = req.body;

        // Validate if resetToken and password exist
        if (!resetToken || !password) {
            req.flash('error', 'Reset token and new password are required.');
            return res.redirect('/new-password');
        }

        // Find user by resetToken and ensure it's not expired
        const user = await User.findOne({ resetToken, resetTokenExpiration: { $gt: Date.now() } });

        // Validate if user exists and resetToken is valid
        if (!user) {
            req.flash('error', 'Invalid or expired reset token.');
            return res.redirect('/tasks');
        }

        // Update user's password and remove resetToken
        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        req.flash('success', 'Password changed successfully.');
        res.redirect('/tasks');
    } catch (error) {
        console.error('Error in postChangePassword:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect('/new-password');
    }
};


  exports.getlogout=(req,res)=> {
    const errorMessage=req.flash("error")[0]|| null;
if(!req.session.isLoggedIn){
    req.flash("error" , "user must logged in before logging out");
    return res .redirect("/login");
}
res.render("logout" , {errorMessage});
  };

  

exports.logout = (req, res) => {
   
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            req.flash('error', 'Error logging out. Please try again.');
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
       // req.flash('success', 'Logged out successfully.');
        res.redirect('/login');
    });
};


  
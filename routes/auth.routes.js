const express = require('express');
const router = express.Router();
const User = require ('../models/User.model');
const bcrypt = require("bcryptjs")

router.get("/signup", (req, res, next) => {
    res.render("auth/signup.hbs")
})

router.post("/signup", async (req, res, next) => {
    const {username, password} = req.body


    if (username === "" || password === ""){
        res.render("auth/signup.hbs", {
            errorMessage: "Please fill out all the fields"
        })
        return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    if(passwordRegex.test(password) === false) {
        res.render("auth/signup.hbs", {
            errorMessage: "Your password does not match our requirements (1 uppercase letter, minimun of 8 characters, 1 number) "
        })
        return;
    }

    try{
        const foundUser = await User.findOne({username: username})
        if (foundUser !== null){
            res.render("auth/signup.hbs", {
                errorMessage: "The user already exists"
            })
            return;
        }

        const salt = await bcrypt.genSalt(12)
        const hashPassword = await bcrypt.hash(password, salt)
   
        const newUser = {
            username: username,
            password: hashPassword
        }

        await User.create(newUser)

        res.redirect("/auth/login")

    }catch (error){
        next(error)
    }

})

router.get("/login", (req, res, next)=> {
    res.render("auth/login.hbs")
})

router.post("/login", async (req, res, next)=>{

    const {username, password} = req.body

    if(username === "" || password === ""){
        res.render("auth/login.hbs", {
            errorMessage: "Please fill out all the fields"
        })
        return;
    }

    try{
        const foundUser = await User.findOne({username:username})
        if(foundUser === null) {
            res.render("auth/login.hbs", {
                errorMessage: "Username does not exist"
            })
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, foundUser.password)

        if(isPasswordValid === false){
            res.render("auth/login.hbs", {
                errorMessage: "Username does not exist"
            })
            return;
        }

        req.session.activeUser = foundUser;

        req.session.save(()=>{
            res.redirect("/profile")
        })
    }catch (error){
        next(error)
    }
    })



module.exports = router;
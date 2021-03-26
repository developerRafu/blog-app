const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', (req, res) => {
    var erros = []
    if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Email inválido" })
    }
    if (!req.body.password || typeof req.body.password == undefined || req.body.password == null) {
        erros.push({ texto: "Senha inválida" })
    }
    if (req.body.password.length < 4) {
        erros.push({ texto: "Senha muito curta" })
    }
    if (req.body.password != req.body.password2) {
        erros.push({ texto: "Senha diferentes, tente novamente" })
    }
    if (erros.length > 0) {
        res.render('users/register', { erros: erros })
    } else {
        User.findOne({ email: req.body.email }).then((user) => {
            if (user) {
                req.flash("error_msg", "Email já cadastrado")
                res.redirect('/users/register')
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUser.password, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro interno")
                            res.redirect('/')
                        } else {
                            newUser.password = hash
                            newUser.save().then(() => {
                                req.flash("success_msg", "Usuário criado")
                                res.redirect("/")
                            }).catch((err) => {
                                req.flash("error_msg", "Erro ao criar o usuário")
                                res.redirect('/users/register')
                            })
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro interno")
            res.redirect('/')
        })
    }
})

router.get('/login',(req,res)=>{
    res.render('users/login')
})

router.post('/login',(req,res,next)=>{
passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
})(req,res,next)
})

module.exports = router
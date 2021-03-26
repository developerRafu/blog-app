const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Posts")
const Post = mongoose.model("posts")
require('./models/Category')
const Category = mongoose.model('categories')
const users = require('./routes/user')
const passport = require('passport')
require("./config/auth")(passport)

//configs
//Session
app.use(session({
    secret: "something",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash("error_msg")
    next()
})
//Body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
//handlebars
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}))
app.set('view engine', 'handlebars')
//mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/blogapp', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('mongo on')
}).catch((err) => {
    console.log('error:', err)
})
//Public
app.use(express.static(path.join(__dirname, 'public')))

//rotas
app.get('/',(req,res)=>{
    Post.find().populate("categories").sort({date: "desc"}).then((posts)=>{
        res.render("index", {posts: posts})
    }).catch((err)=>{
        req.flash("error_msg","Erro interno")
        res.redirect("/404")
    })
})

app.get('/post/:slug',(req,res)=>{
    Post.findOne({slug: req.params.slug}).then((post)=>{
        if(post){
            res.render("post/index",{post: post})
        }else{
            req.flash("error_msg","Esta postagem não existe")
            res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg","Erro interno")
        res.redirect('/')
    })
})

app.get("/categories", (req, res)=>{
    Category.find().then((categories)=>{
        res.render('categories/index',{categories: categories})
    }).catch((err)=>{
        req.flash("error_msg","Erro interno, tente novamente")
        res.redirect('/')
    })
})

app.get('/categories/:slug',(req,res)=>{
    Category.findOne({slug: req.params.slug}).then((category)=>{
        if(category){
            Post.find({category: category._id}).then((posts)=>{
                res.render('categories/posts', {posts: posts, category: category})
            }).catch((err)=>{
                req.flash("error_msg","Erro ao listar postagens")
                res.redirect('/')
            })
        }else{
            req.flash("error_msg","Esta categoria não existe")
            res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg","Erro interno, tente novamente")
        res.redirect('/')
    })
})

app.get("/404", (req,res)=>{
    res.send('Erro 404!')
})
app.use('/admin', admin)
app.use('/users', users)
//outros
const PORT = 8081
app.listen(PORT, () => {
    console.log('Server on')
})
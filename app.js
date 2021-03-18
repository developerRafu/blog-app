const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
//configs
//Session
app.use(session({
    secret: "something",
    resave: true,
    saveUninitialized: true
}))
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
app.use('/admin', admin)
//outros
const PORT = 8089
app.listen(PORT, () => {
    console.log('Server on')
})
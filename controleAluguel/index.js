const express = require('express')
const app =  express()
const port = 3080;
const path = require('path');
var cookieParser = require('cookie-parser')

const routes = require(path.resolve(__dirname, 'routes'))
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'src', 'views'))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static('public'))
app.use(routes)

app.listen(port, ()=> {
    console.log(`Servidor online em http://localhost:${port}`)
})
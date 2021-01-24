const fetch = require("node-fetch") 
const express = require("express")
const path = require("path")

require("dotenv").config()

const { sockServer } = require("./internals")

const app = express()

sockServer.reqs = []

const server = app.listen(process.env.SERVER_PORT || 6666)

app.use(express.static(__dirname))

console.log(process.cwd())

app.get(["/map/:code", "/map/:code/preview"], (req, res) => {
    let code = req.params.code?.match(/@?(\d+)/)[1]
    sockServer.connections[0].write(JSON.stringify({ id: 2, body: code, _ref: sockServer.reqs.length }))
    sockServer.reqs.push({ req, res })
})

sockServer.s.listen(process.env.SOCK_PORT || 4242)

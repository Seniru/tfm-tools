const express = require("express")
const morgan = require("morgan")

require("dotenv").config()

const { sockServer } = require("./internals")

const app = express()

sockServer.reqs = []

const server = app.listen(process.env.PORT || 6666)

app.use(express.static(__dirname))
app.use(morgan("[INFO][SERVER|MAIN] :method :url <:status> (User-Agent: :user-agent)"))

app.get(["/map/:code", "/map/:code/preview"], (req, res) => {
    let code = req.params.code?.match(/@?(\d+)/)[1]
    if (sockServer.cache.maps[code]) {
        return res.end(Buffer.from(sockServer.cache.maps[code]["buffer"]))
    }
    sockServer.connections[0].write(JSON.stringify({ id: 2, body: code, _ref: sockServer.reqs.length }) + "\x00")
    sockServer.reqs.push({ req, res })
})

app.get("/pewpew/leaderboard", (req, res) => {
    sockServer.connections[0].write(JSON.stringify({ id: 3, _ref: sockServer.reqs.length }) + "\x00")
    sockServer.reqs.push({ req, res })
})

sockServer.s.listen(process.env.SOCK_PORT || 4242)

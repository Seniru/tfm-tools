const express = require("express")

require("dotenv").config()

const { sockServer, connections } = require("./internals")

const app = express()

app.get("/map/:code", (req, res) => {
    let code = req.params.code?.match(/@?(\d+)/)[1]
    console.log(connections[0].write(JSON.stringify({ id: 1, body: code })))
    res.end(code)
})

sockServer.listen(process.env.SOCK_PORT || 4242)
app.listen(process.env.SERVER_PORT || 6666)

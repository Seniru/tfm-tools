const net = require("net")

const handler = require("./handler")

require("dotenv").config()

let connections = []


const sockServer = {}

sockServer.connections = []

sockServer.s = net.createServer(socket => {

    console.log("[INFO][SERVER|SOCKET] Received connection")
    sockServer.connections.push(socket)
    socket.connectionValidated = false
    setTimeout(() => {
        if (!socket.connectionValidated) { socket.end() }
    }, 5000)

    socket.on("data", buffer => {
        try {
            let msg = buffer.toString()
            let struct = JSON.parse(msg)
            let reqs = struct._ref !== null ? sockServer.reqs[struct._ref] : null

            handler[struct.id](reqs?.req, reqs?.res, msg, struct, socket)
        } catch (e) {
            console.log(`[FATAL] Error at socket@data\n${e}` )
        }

    })

})

module.exports = { sockServer }
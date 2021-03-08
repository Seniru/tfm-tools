const net = require("net")

const handler = require("./handler")

require("dotenv").config()

let connections = []


const sockServer = {}

sockServer.connections = []

sockServer.cache = {
    maps: {}
}

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
            let res = handler[struct.id](reqs?.req, reqs?.res, msg, struct, socket)

            if (res) {
                if (typeof res?.then === "function") { // it's a promise!
                    res.then(cache => {
                        if (cache?.type == "MAP_CACHE") {
                            sockServer.cache.maps[cache.data["map"]] = cache.data["buffer"]
                        }
                    })
                }
            }

        } catch (e) {
            console.log(`[FATAL] Error at socket@data\n${e}` )
        }

    })

})

module.exports = { sockServer }
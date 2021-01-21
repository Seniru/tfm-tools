const net = require("net")

require("dotenv").config()

let connections = []

const sockServer = net.createServer(socket => {
    
    console.log("[INFO][SERVER|SOCKET] Received connection")
    connections.push(socket)
    socket.connectionValidated = false
    socket.write("hello")
    setInterval(() => {
        socket.write("ping")
        //if (!socket.connectionValidated) {console.log("not validated"); socket.end() }
    }, 5000)

    socket.on("data", buffer => {console.log("data"); socket.write("send")})

    
})

module.exports = { sockServer, connections }
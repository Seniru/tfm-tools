const net = require("net")
const fetch = require("node-fetch")

require("dotenv").config()

let connections = []


const sockServer = {}

sockServer.connections = []

sockServer.s = net.createServer(socket => {

    console.log("[INFO][SERVER|SOCKET] Received connection")
    sockServer.connections.push(socket)
    socket.connectionValidated = false
    setInterval(() => {
        //if (!socket.connectionValidated) {console.log("not validated"); socket.end() }
    }, 5000)

    socket.on("data", buffer => {
        try {
            let msg = buffer.toString()
            let struct = JSON.parse(msg)
            console.log(Object.keys(struct))
            console.log(struct["id"], struct.id == 2)
            if (struct.id == 2) {  // map info
                let { req, res } = sockServer.reqs[struct._ref]
                console.log(req.path)
                console.log("hello")
                if (req.path.includes("preview")) {
                    //res.end("preview here")
                    console.log("preview")
                    fetch("https://miceditor-map-preview.herokuapp.com/", { 
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            xml: struct.xml,
                            raw: true
                        })
                    }).then(r => r.buffer()).then(r => {
                        console.log(r)
                        res.end(r)
                    })
                } else {
                    res.end(msg)
                }
            }

        } catch (e) {console.log(e)}

    })

})

module.exports = { sockServer }
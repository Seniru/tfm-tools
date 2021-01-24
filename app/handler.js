const fetch = require("node-fetch")
const path = require("path")

const handler = {}

handler[1] = (req, res, msg, struct, connection) => { // connection validation
    if (struct.secret == process.env.CONNECTION_SECRET) {
        connection.connectionValidated = true
        console.log("[INFO] Connection to the bots has been validated!")
        connection.write(JSON.stringify({ id: 1, validated: true }))
    } else {
        connection.end() // close the connection if the keys doesn't match
    }
}

handler[2] = (req, res, msg, struct) => { // map service
    if (req.path.includes("preview")) {
                    
        if (struct.status == -1) {
            return res.sendFile("map-error.png", { root: path.join(__dirname, "public", "images") })
        }

        fetch("https://miceditor-map-preview.herokuapp.com/", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                xml: struct.xml,
                raw: true
            })
        }).then(r => r.buffer()).then(r => {
            res.end(r)
        })
    } else {
        if (struct.status == -1) return res.status(400).send(struct.reason)
        res.end(msg)
    }
}

module.exports = handler

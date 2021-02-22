const fetch = require("node-fetch")
const path = require("path")
const Canvas = require("canvas")
const parser = require("fast-xml-parser")

const utils = require("./utils")

Canvas.registerFont("./app/public/fonts/soopafresh.ttf", { family: "soopafresh" })

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

handler[2] = async (req, res, msg, struct) => { // map service
    if (req.path.includes("preview")) {

        if (struct.status == -1) {
            return res.sendFile("map-error.png", { root: path.join(__dirname, "public", "images") })
        }
        
        let parsed = parser.parse(struct.xml, { ignoreAttributes: false })
        let height = Number(parsed?.C?.P?.["@_H"]) || 400
        let length = Number(parsed?.C?.P?.["@_L"]) || 800

        let mapImage = await fetch("https://miceditor-map-preview.herokuapp.com/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                xml: struct.xml,
                raw: true
            })
        })
    
        let mapImageBuffer = await mapImage.buffer()

        let canvas = Canvas.createCanvas(length, height)
        let ctx = canvas.getContext("2d")
        let map = new Canvas.Image()

        map.src = mapImageBuffer

        ctx.drawImage(map, 0, 0)
        if (req.query.infobar) await utils.setMapInfoBar(ctx, map, struct.author, struct.perm)
        
        let imageBuffer = canvas.toBuffer()
        res.end(imageBuffer)
        let cache =  { type: "MAP_CACHE", data: { map: struct.code, buffer: imageBuffer } }
        return cache
        
    } else {
        if (struct.status == -1) return res.status(400).send(struct.reason)
        res.end(msg)
    }
}

module.exports = handler

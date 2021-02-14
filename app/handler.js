const fetch = require("node-fetch")
const path = require("path")
const Canvas = require("canvas")

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
        
        let mapImage = await fetch("https://miceditor-map-preview.herokuapp.com/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                xml: struct.xml,
                raw: true
            })
        })
        let mapImageBuffer = await mapImage.buffer()

        let canvas = Canvas.createCanvas(800, 400)
        let ctx = canvas.getContext("2d")
        let map = new Canvas.Image()

        map.src = mapImageBuffer
        
        let { name, tag } = utils.extractNicknameData(struct.author)
        ctx.drawImage(map, 0, 0)
        ctx.font = "20px soopafresh"
        ctx.fillStyle = "rgba(47,127,204,1.0)"
        let nameText = ctx.measureText(name)
        ctx.fillText(name, 40, 30)
        ctx.font = "20px soopafresh"
        ctx.strokeText(name, 40, 30)
        if (tag) {
            ctx.font = "14px soopafresh"
            ctx.fillStyle = "rgba(108,119,193,1.0)"
            ctx.fillText(tag, 42 + nameText.width, 30)
            ctx.font = "14px soopafresh"
            ctx.strokeText(tag, 42 + nameText.width, 30)
        }
        let permIcon = await Canvas.loadImage(`./app/public/images/P${struct.perm || 41}.png`)
        ctx.drawImage(permIcon, 10, 10, 20, 20)
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

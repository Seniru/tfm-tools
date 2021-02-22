const Canvas = require("canvas")

const utils = {}

utils.extractNicknameData = (name) => {
    if (name.includes("#")) {
        let match = name.match(/(.+)(#\d+)/)
        return { name: match[1], tag: match[2] }
    } else {
        return { name: name, tag: null }
    }
}

utils.setMapInfoBar = async (ctx, map, author, perm) => {
    let { name, tag } = utils.extractNicknameData(author)
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
    let permIcon = await Canvas.loadImage(`./app/public/images/P${perm || 41}.png`)
    ctx.drawImage(permIcon, 10, 10, 20, 20)
}

module.exports = utils

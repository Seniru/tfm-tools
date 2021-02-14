module.exports = {
    extractNicknameData: (name) => {
        if (name.includes("#")) {
            let match = name.match(/(.+)(#\d+)/)
            return { name: match[1], tag: match[2] }
        } else {
            return { name: name, tag: null }
        }
    }
}

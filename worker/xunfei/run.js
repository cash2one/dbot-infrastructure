const monitor = require("../worker_factory")
const config = require('./config.json')

let xunfei = new monitor("xunfei", config)
xunfei.run();
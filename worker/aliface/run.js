const monitor = require("../worker_factory")
const config = require('../config.json').aliface

let aliface = new monitor("aliface", config)
aliface.run();
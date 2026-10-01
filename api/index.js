const server = require('../server.js');

module.exports = (req, res) => {
    server.emit('request', req, res);
};


var http = require('http');

var server = http.createServer(function (req, res) {
    res.writeHead(200, { "Content-type": "text/plain" });
    res.end("Hello from Turing-Technologies\n");
});

server.listen(3000, function () {
    console.log('Server is running at 3000')
});
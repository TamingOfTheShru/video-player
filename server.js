var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');
var multer = require("multer");
var upload = multer({ dest: "./uploads" });
var mongoose = require('mongoose');
var grid = require('gridfs-stream');
var util = require('util');
var path = require("path");
var app = express();

app.set('port', process.env.PORT || 1336);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('./'));

var conn = mongoose.createConnection('mongodb://localhost/test');

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/videoplayer.html'));
});

app.get('/upload', function (request, response) {
    response.send(
        '<form method="post" action="/fileupload" enctype="multipart/form-data">'
        + '<input type="file" name="video">'
        + '<input type="submit" value="submit">'
        + '</form>'
    );
});

app.post("/fileupload", upload.single("video"), function (req, res, next) {
    //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
    var gfs = grid(conn.db, mongoose.mongo);
    var writestream = gfs.createWriteStream({
        filename: req.file.originalname
    });
    
    console.log(req.file.filename);
    //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
    fs.createReadStream("./uploads/" + req.file.filename)
        .on("end", function () { fs.unlink("./uploads/" + req.file.filename, function (err) { res.send("success") }) })
        .on("err", function () { res.send("Error uploading image") })
        .pipe(writestream);
});

app.get("/video/:filename", function (req, res) {
    var gfs = grid(conn.db, mongoose.mongo);
    var readstream = gfs.createReadStream({ filename: req.params.filename });
    readstream.on("error", function (err) {
        res.send("No image found with that title");
    });
    readstream.pipe(res);
});
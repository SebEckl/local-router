var express = require("express");
var app = express();

const fetch = require("node-fetch");
var version = 'v5';
var osrmTextInstructions = require('osrm-text-instructions')(version);

var port = process.env.PORT || 3000
app.listen(port, function () {
    console.log("To view the app, open this link in your browser: http://localhost:" + port);
});
app.use(express.static(__dirname + '/client'));

//response with instructions and formated distance, duration
app.get('/getRoute1', function (req, res) {
    var instructions = [];
    var length;
    var duration;
    //with local OSRM Server installed and started, url can be changed to: "http://localhost:5000/route/v1/driving/"+...
    var path = "http://router.project-osrm.org/route/v1/driving/"+req.query.startlg+","+req.query.startbg+";"+req.query.ziellg+","+req.query.zielbg+"?steps=true&geometries=geojson";
    fetch(path)
        .then(response => response.json())
        .then(function (data) {
            data.routes[0].legs.forEach(function(leg) {
                leg.steps.forEach(function(step) {
                    instructions.push({name: osrmTextInstructions.compile('de', step), lgbg: step.maneuver.location})
                });
            });
            length = Math.round(data.routes[0].distance)/1000
            duration = secondsToHms(Math.round(data.routes[0].duration));
            res.send({ instructions: instructions, length: length, duration: duration })
        });
})

//function to format duration
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " stunden, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minuten, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " sekunden") : "";
    return hDisplay + mDisplay + sDisplay; 
}
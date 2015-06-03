
/*
 * GET home page.
 */

exports.index = function(req, res){
    var name = req.params.name;
    var url = createURL(req);
    console.log("url: ", url);
    res.render('index', {name: name, url: url});
};

exports.meeting = function(req, res){
    var name = req.params.name;
    var rooms = req.app.get('rooms');
    var meetingName = "";
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].leaderName == name) {
            meetingName = rooms[i].meetingName;
            break;
        }
    }
    
    res.render('meeting', {name: name, meetingName: meetingName});
};

function createURL(req) {
    var fullUrl = req.protocol + '://' + req.get('host');
    var random = (Math.floor(Math.random() * 8) + 1);
    var meetingName = "meeting" + random;
    var leaderName = req.params.name;
    var rooms = req.app.get('rooms');
    
    var found = false;
    for (var i = 0; i < rooms.length; i++) {
        
        if (rooms[i].leaderName == leaderName) {
            rooms[i].votes = [];
            meetingName: 'unnamed',
            found = true;
            break;
        }
    }
    if (!found) {
        rooms.push({
            leaderName: leaderName,
            meetingName: 'unnamed',
            votes: []
        })
    }
    console.log(rooms);
    req.app.set(rooms);
    return fullUrl + "/" + req.params.name + "/" + meetingName;
}
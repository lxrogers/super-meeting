var canvas; 
var context;
var LABEL_COLOR = '#FFF'
var CIRCLE_COLOR_1 = 'rgba(232, 183, 26, .7)';
var CIRCLE_COLOR_2 = 'rgba(31, 218, 154, .7)';
var myvote_minutes;
var goal_minutes = 0;
var minutes = 0;

function ChatController($scope) {
    var socket = io.connect();
    var name = $('#name-param').html();
    console.log('im in room named: ' + name);
    console.log('meeting is called: ' + $('#meeting-name-param').html());
    
    $scope.hours = 0;
    $scope.minutes = 0;
    $scope.meetingName = 'Team Meeting...'

    socket.on('connect', function () {
      console.log("connect");
    });

    socket.on('vote', function (msg) {
      $scope.$apply();
    });
    
    socket.on('create', function(msg) {
        $scope.$apply();
    })
    
    socket.on('end', function(name_, difference) {
        if (name_ == name) {
            console.log('diff:' + difference);
            $('.go').hide();
            $('.end').hide();
            $('#feedback').html(difference);
            $('.report').show();
            
        }
    });
    
    socket.on('start', function(name_) {
        if (name_ == name) {
            $('.data').hide();
            $('.go').show();
        }
    });
    
    socket.on('vote-data', function(name_, votes) {
        if (name_ != name) {
            return;
        }
        console.log("client recieved vote from " + name + "'s room", votes);
        if (votes.length > 1) {
            $('.waiting').hide();
            showResults(votes);
            $('.start').show();
            
        }
    });
    
    $scope.end = function end() {
        var difference = goal_minutes - minutes;
        console.log('goal: ' + goal_minutes + " : minutes: " + minutes);
        socket.emit('end', name, difference);
    }
    
    $scope.start = function start() {
        $('.start').hide();
        $('.leader').hide();
        $('.end').show();
        socket.emit('start', name);
        setInterval(function() {
            console.log("HEY");
            minutes += 1;
        }, 600);
    }
    
    $scope.create = function create() {
        console.log('create');
        $('.create').hide();
        $('.leader').show();
        socket.emit('create', name, $scope.meetingName);
        $('.main').show();
    }

    $scope.vote = function vote() {
      myvote_minutes = toMinutes($scope.hours, $scope.minutes);
      socket.emit('vote', name, $scope.hours, $scope.minutes);
      $('.main').hide();
      $('.waiting').show();
    };
    
}

function toMinutes(hours, minutes) {
    console.log('tominutes',hours, minutes);
    return parseInt(hours) * 60 + parseInt(minutes);
}

function createLabels(minMinutes, maxMinutes) {
    var labels = [];
    var numLabels = (maxMinutes - minMinutes) / 15;
    for (var x = 0; x <= numLabels; x++) {
        var currentMinutes = minMinutes + (x * 15);
        
        labels.push(createLabel(currentMinutes));
    }
    return labels;
}

function createLabel(minutes) {
    var hour = Math.floor(minutes / 60);
    var minute = minutes % 60;
    if (minutes % 60 == 0) {
        minute = '00';
    }
    else if (minutes % 60 == 5) {
        minute = '05';
    }
    
    return "" + hour + ":" + minute;
}

function showResults(votes) {
    $('.data').show();
    var vote_labels = createLabels(Math.min.apply(Math, votes), Math.max.apply(Math, votes));
    
    initCanvas();
    drawLabels(vote_labels);
    drawCircles(votes);
    
    $('#time').html(secondLowestTime(votes));
    
}

function initCanvas() {
    $('#canvas').show();
    canvas = document.getElementById('projector');
    if (canvas && canvas.getContext) {
    	context = canvas.getContext('2d');
    }
    resizeCanvas();
    //clearCanvas();
    var textSize = canvas.height / 5;
    console.log(canvas.width);
    context.font = textSize + "pt Raleway";
    context.fillStyle = '#000';
}

function resizeCanvas(e) {
	canvas.style.width = '100%';
	canvas.style.height='100%'
	
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#F7EAC8'; // set can
    context.fillRect(0, 0, canvas.width, canvas.height); // now fill the canvas
}
	
function drawCircles(votes, num_labels) {
    var min = Math.min.apply(Math, votes);
    var max = Math.max.apply(Math, votes);
    var range = Math.max(max - min, 1);
    
    for (var i = 0; i < votes.length; i++) {
        if (votes[i] == myvote_minutes) {
            
            drawCircle((votes[i] - min) / range, CIRCLE_COLOR_2);
        }
        else {
            drawCircle((votes[i] - min) / range, CIRCLE_COLOR_1);    
        }
        
    }
}

function drawCircle(xpct, color) {
	context.fillStyle = color;
	context.beginPath();
	var xpos = squeeze(xpct * canvas.width, .8);
	context.arc(xpos, canvas.height * 1 / 3, canvas.height / 5, 0, Math.PI * 2, true);
	context.closePath();
	context.fill();
}

function drawLabels(labels) {
    
    context.fillStyle = LABEL_COLOR;
    context.textAlign="center"; 
    drawLabel(0, labels[0]);
    drawLabel(canvas.width, labels[labels.length - 1]);
}

function drawLabel(x, label) {
    context.fillText(label, squeeze(x, .7) , canvas.height - 10);
}

function squeeze(x, rate) {
    return x * rate + (canvas.width * ((1 - rate) / 2));
}

function secondLowestTime(votes) {
    var second_min = secondMin(votes);
    goal_minutes = second_min;
    var hour = Math.floor(second_min / 60);
    var minute = (second_min % 60 == 0) ? '00' : second_min % 60;
    return "" + hour + " HOURS AND " + minute + " MINUTES";
    
}

function secondMin(values) {
    var min = Math.min.apply(Math, values);
    var newSet = [];
    var skipped = false;
    for (var x = 0; x < values.length; x++) {
        if (values[x] !== min || skipped) {
            newSet.push(values[x]);
        }
        else {
            skipped = true;
        }
    }
    return Math.min.apply(Math, newSet);
}
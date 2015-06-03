var canvas; 
var context;
var LABEL_COLOR = '#FFF'
var CIRCLE_COLOR_1 = 'rgba(232, 183, 26, .7)';
var CIRCLE_COLOR_2 = 'rgba(31, 218, 154, .7)';
var myvote_minutes;

function ChatController($scope) {
    var socket = io.connect();
    
    $scope.hours = 0;
    $scope.minutes = 0;

    socket.on('connect', function () {
      console.log("connect");
    });

    socket.on('vote', function (msg) {
      $scope.$apply();
    });
    
    socket.on('vote-data', function(votes) {
        hideWaiting();
        showResults(votes); 
    });

    $scope.vote = function vote() {
      myvote_minutes = toMinutes($scope.hours, $scope.minutes);
      socket.emit('vote', $scope.hours, $scope.minutes);
      
      hideForms();
      
      showWaiting();
    };
    
}

function toMinutes(hours, minutes) {
    console.log('tominutes',hours, minutes);
  return parseInt(hours) * 60 + parseInt(minutes);
}

function hideForms() {
    $('.main').hide();
}

function showWaiting() {
    $('.waiting').show();
}

function hideWaiting() {
    $('.waiting').hide();
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
    var minute = (minutes % 60 == 0) ? '00' : minutes % 60;
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
    var range = max - min;
    
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
    var hour = Math.floor(second_min / 60);
    var minute = (second_min % 60 == 0) ? '00' : second_min % 60;
    return "" + hour + " HOURS AND " + minute + " MINUTES";
    
}

function secondMin(values) {
    var min = Math.min.apply(Math, values);
    var newSet = [];
    for (var x = 0; x < values.length; x++) {
        if (values[x] !== min) {
            newSet.push(values[x]);
        }
    }
    return Math.min.apply(Math, newSet);
}
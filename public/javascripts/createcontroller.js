function CreateController($scope) {
    var socket = io.connect();
    
    $scope.hours = 0;
    $scope.minutes = 0;

    socket.on('connect', function () {
      console.log("connect");
    });

    socket.on('create', function (msg) {
      $scope.$apply();
      console.log("CREATE");
    });
    
    socket.on('vote-data', function(votes) {
    });

    $scope.vote = function vote() {
        
    };
    
}
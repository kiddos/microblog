// init socket.io client
var socket = io('http://' + location.host);
socket.on('connect', function(socket){
  console.log('connected');
});

socket.on('refresh', function(data){

});

socket.on('disconnect', function(){
  console.log('disconnected');
});


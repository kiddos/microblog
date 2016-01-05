// elements
var type = document.getElementById('type');
var user = document.getElementById('current-user');
var sendButton = document.getElementById('send');

// init socket.io client
var socket = io('http://' + location.host);

socket.on('connect', function(socket){
  console.log('connected');
});

socket.on('message', function(data){
  if (data.user !== user.innerHTML) {
    $('#chat').val($('#chat').val() + data.user + ": " + data.content);
  }
});

socket.on('disconnect', function(){
  console.log('disconnected');
});

if (type !== null) {
  type.oninput = function() {
    var content = type.value;
    var userName = user.innerHTML;

    if (content[content.length-1] === '\n') {
      socket.emit('say', {content: content, user: userName});
      // clear input window
      type.value = '';
      // append message to chat window
      $('#chat').val($('#chat').val() + 'You: ' + content);

      //console.log(user.innerHTML);
      //console.log('sending data');
    }
  };
}

if (sendButton !== null) {
  sendButton.onclick = function() {
    var content = type.value;
    var userName = user.innerHTML;

    if (content.length !== 0) {
      socket.emit('say', {content: content, user: userName});
      // clear input window
      type.value = '';
      // append message to chat window
      $('#chat').val($('#chat').val() + 'You: ' + content + '\n');

      console.log(user.innerHTML);
      console.log('sending data');
    }
  };
}


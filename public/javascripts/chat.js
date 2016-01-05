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
    // add chat count
    $('.list-group-item').each(function(index) {
      var user = $(this).text().split('\n')[2].trim();
      if (user === data.user) {
        var chatCount = parseInt($(this).children().text());
        chatCount += 1;
        $(this).children().text(chatCount + '');
      }
    });
    // scroll bot
    $('#chat').scrollTop($('#chat')[0].scrollHeight - $('#chat').height());
  }
});

socket.on('disconnect', function(){
  console.log('disconnected');
});

if (type !== null) {
  type.oninput = function() {
    var content = type.value;
    var userName = user.innerHTML;
    var chatWindow = $('#chat');

    if (content[content.length-1] === '\n') {
      socket.emit('say', {content: content, user: userName});
      // clear input window
      type.value = '';
      // append message to chat window
      chatWindow.val(chatWindow.val() + 'You: ' + content);
      // add chat count
      $('.list-group-item').each(function(index) {
        var user = $(this).text().split('\n')[2].trim();
        if (user === userName) {
          var chatCount = parseInt($(this).children().text());
          chatCount += 1;
          $(this).children().text(chatCount + '');
        }
      });
      // scroll bot
      chatWindow.scrollTop(chatWindow[0].scrollHeight - chatWindow.height());
      //console.log(user.innerHTML);
      //console.log('sending data');
    }
  };
}

if (sendButton !== null) {
  sendButton.onclick = function() {
    var content = type.value;
    var userName = user.innerHTML;
    var chatWindow = $('#chat');

    if (content.length !== 0) {
      socket.emit('say', {content: content, user: userName});
      // clear input window
      type.value = '';
      // append message to chat window
      chatWindow.val(chatWindow.val() + 'You: ' + content + '\n');
      // add chat count
      $('.list-group-item').each(function(index) {
        var user = $(this).text().split('\n')[2].trim();
        if (user === userName) {
          var chatCount = parseInt($(this).children().text());
          chatCount += 1;
          $(this).children().text(chatCount + '');
        }
      });
      // scroll bot
      chatWindow.scrollTop(chatWindow[0].scrollHeight - chatWindow.height());
      //console.log(user.innerHTML);
      //console.log('sending data');
    }
  };
}


// init socket.io client
var socket = io('http://' + location.host);

socket.on('connect', function(socket){
  console.log('post.js connected');
});

$('.like').each(function(index) {
  $(this).on('click', function() {
    var imagePath = $(this).siblings('#image').attr('src');
    var path = null;
    var image = null;
    if (imagePath !== null && imagePath !== undefined) {
      path = imagePath.split('/');
      image = path[path.length-1];
    }
    var data = {
      username: $(this).siblings('#user').text().split(' ')[0],
      post: $(this).siblings('#post').text(),
      image: image,
      time: $(this).siblings('#time').text(),
      like: parseInt($(this).siblings('#count').text().split(' ')[0]) + 1,
    };
    $(this).siblings('#count').text(data.like + ' people like this.');
    console.log(data);
    console.log(data.image);
    socket.emit('addlike', data);
  });
});

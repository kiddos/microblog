var mongodb = require('./db');
var settings = require('../settings');

function Post(username, post, time) {
  this.user = username;
  this.post = post;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
  if (post.image) {
    this.image = post.image;
  }
}
module.exports = Post;

Post.prototype.save = function save(newImage,callback) {
  // 存入 Mongodb 的文檔
  var post = {
    user: this.user,
    post: this.post,
    time: this.time,
    image: this.image,
  };
  if(newImage === null)
    post.image = null;
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 posts 集合
    db.collection(settings.postsCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 爲 user 屬性添加索引
      collection.ensureIndex('user');
      // 寫入 post 文檔
      collection.insert(post, {safe: true}, function(err, post) {
        mongodb.close();
        callback(err, post);
      });
    });
  });
  if(newImage === null){
    // save the image data
    var imagePath = __dirname + "/../public/img/posts/" + this.user + this.time + '.jpg';
    fs.writeFile(imagePath, newImage, 'binary', function(err) {
      if (err) {
        console.log(err);
        return callback(err);
      }
      console.log('new image saved for ' + this.user + this.time);
      return callback(err, user);
    });
  }
};

Post.get = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 posts 集合
    db.collection(settings.postsCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 查找 user 屬性爲 username 的文檔，如果 username 是 null 則匹配全部
      var query = {};
      if (username) {
        query.user = username;
      }
      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }
        // 封裝 posts 爲 Post 對象
        var posts = [];
        docs.forEach(function(doc, index) {
          var post = new Post(doc.user, doc.post, doc.time, doc.image);
          posts.push(post);
        });
        callback(null, posts);
      });
    });
  });
};

Post.prototype.saveImage = function(newImage, callback) {
  var post = {
    user: this.user,
    post: this.post,
    time: this.time,
    image: '/img/posts/' + this.user + this.time + '.jpg',
  };
  // open mongodb and update the user
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection(settings.postsCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.update({name: post.user,post: post.post}, post, function(err, results) {
        mongodb.close();
      });
    });
  });
  // save the image data
  var imagePath = __dirname + "/../public/img/posts/" + this.user + this.time + '.jpg';
  fs.writeFile(imagePath, newImage, 'binary', function(err) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    console.log('new image saved for ' + this.user + this.time);
    return callback(err, user);
  });
};

var mongodb = require('./db');
var settings = require('../settings');
var fs = require('fs');

function Post(username, post, image, time) {
  this.user = username;
  this.post = post;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
  if (image) {
    this.image = image;
  } else {
    this.image = null;
  }
}
module.exports = Post;

Post.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var post = {
    user: this.user,
    post: this.post,
    time: this.time,
  };
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
        callback(err);
      });
    });
  });
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
          var post = new Post(doc.user, doc.post, doc.image, doc.time);
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
    image: null,
  };

  // open mongodb to save post and image path
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection(settings.postsCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      // save the temp image to post directory
      var date = new Date(post.time);
      var imageName = post.user + date.valueOf().toString() + '.jpg';
      console.log(date);
      var imagePath = __dirname + "/../public/img/posts/" + imageName;
      post.image = imageName;
      fs.readFile(newImage, function(err, imageData) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        fs.writeFile(imagePath, imageData, 'binary', function(err) {
          if (err) {
            mongodb.close();
            return callback(err);
          }
          console.log('new image saved for Post: ' + imageName);

          collection.insert(post, function(err, results) {
            mongodb.close();

            return callback(err);
          });
        });
      });

    });
  });
};

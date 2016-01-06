var mongodb = require('./db');
var settings = require('../settings');
var fs = require('fs');

function Post(username, post, image, time, like) {
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
  // some old post doesnt have like attribute
  if (like !== undefined && like !== null) {
    this.like = like;
  } else {
    this.like = 0;
  }
}
module.exports = Post;

// initial save function
Post.prototype.save = function save(callback) {
  var post = {
    user: this.user,
    post: this.post,
    time: this.time,
    image: null,
    like: 0,
  };

  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection(settings.postsCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.ensureIndex('user');
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
          var post = new Post(doc.user, doc.post, doc.image, doc.time, doc.like);
          posts.push(post);
        });
        callback(null, posts);
      });
    });
  });
};

// function to save post with image
Post.prototype.saveImage = function(newImage, callback) {
  var post = {
    user: this.user,
    post: this.post,
    time: this.time,
    image: null,
    like: this.like,
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

Post.prototype.updateLikeCount = function(callback) {
  var newPost = {
    user: this.user,
    post: this.post,
    time: this.time,
    image: this.image,
    like: this.like,
  };
  console.log(newPost.user);
  console.log(newPost.post);
  console.log(newPost.like);

  // open mongodb
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // use post collection
    db.collection(settings.postsCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // update the post
      collection.update({
        user: newPost.user,
        post: newPost.post
      }, newPost, function(err, results) {
        mongodb.close();
        return callback(err);
      });
    });
  });
};


var mongodb = require('./db');
var settings = require('../settings');
var fs = require('fs');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  if (user.image === null || user.image === undefined) {
    this.image = settings.defaultImage;
  } else {
    this.image = user.image;
  }
  if (user.profile === null || user.profile === undefined) {
    this.profile = '';
  } else {
    this.profile = user.profile;
  }
}
module.exports = User;

User.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var user = {
    name: this.name,
    password: this.password,
    image: this.image,
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection(settings.usersCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 爲 name 屬性添加索引
      collection.ensureIndex('name', {unique: true});
      // 寫入 user 文檔
      collection.insert(user, {safe: true}, function(err, user) {
        mongodb.close();
        callback(err, user);
      });
    });
  });
};

User.get = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection(settings.usersCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 查找 name 屬性爲 username 的文檔
      collection.findOne({name: username}, function(err, doc) {
        mongodb.close();
        if (doc) {
          // 封裝文檔爲 User 對象
          var user = new User(doc);
          callback(err, user);
        } else {
          callback(err, null);
        }
      });
    });
  });
};

User.getAll = function getAll(callback, users) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection(settings.usersCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      var users = [];
      var cursor = collection.find();
      cursor.each(function(err, doc) {
        if (err) {
          mongodb.close();
          return callback(err);
        } else {
          if (doc === null) {
            mongodb.close();
            return callback(err, users);
          }
          var user = new User(doc);
          users.push(user);
        }
      });
    });
  });
};

User.prototype.saveProfile = function(newProfile, callback) {
  // new user with profile
  var user = {
    name: this.name,
    password: this.password,
    image: this.image,
    profile: newProfile
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection(settings.usersCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.update({name: user.name}, user, function(err, results) {
        mongodb.close();
        return callback(err, user);
      });
    });
  });
};

User.prototype.saveImage = function(newImage, callback) {
  var user = {
    name: this.name,
    password: this.password,
    image: '/img/users/' + this.name + '.jpg',
    profile: this.profile,
  };
  // open mongodb and update the user
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection(settings.usersCollection, function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.update({name: user.name}, user, function(err, results) {
        mongodb.close();
      });
    });
  });
  // save the image data
  var imagePath = __dirname + "/../public/img/users/" + this.name + '.jpg';
  fs.writeFile(imagePath, newImage, 'binary', function(err) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    console.log('new image saved for ' + this.name);
    return callback(err, user);
  });
};

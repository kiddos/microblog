var mongodb = require('./db');
var settings = require('../settings');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  if (user.image === null || user.image === undefined) {
    this.image = settings.defaultImage;
  } else {
    this.image = user.image;
  }
  console.log(this.image);
}
module.exports = User;

User.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var user = {
    name: this.name,
    password: this.password,
    image: user.image,
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
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
    db.collection('users', function(err, collection) {
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

    db.collection('users', function(err, collection) {
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

const redis = require('redis');

class TdCache {

    constructor(config) {
        this.redis_host = config.host;
        this.redis_port = config.port;
        this.redis_password = config.password;
        this.client = null;
    }

    async connect(callback) {
        // client = redis.createClient();
        return new Promise( async (resolve, reject) => {
            this.client = redis.createClient(
                {
                    host: this.redis_host,
                    port: this.redis_port,
                    password: this.redis_password
                });
            this.client.on('error', err => {
                reject(err);
                if (callback) {
                    callback(err);
                }
            });
            // this.client.on('connect', function() {
            //     console.log('Redis Connected!');
            // });
            this.client.on('ready',function() {
              // console.log("connected")
                resolve();
                if (callback) {
                    callback();
                }
                //console.log("Redis is ready.");
            });
        });
    }

    async set(key, value, options) {
      //console.log("setting key value", key, value)
      if (!options) {
        options = {EX: 86400}
      }
      return new Promise( async (resolve, reject) => {
        if (options && options.EX) {
          //console.log("expires:", options.EX)
          try {
            this.client.set(
              key,
              value,
              'EX', options.EX,
              (err) => {
                if (err) {
                  reject(err);
                }
                else {
                  return resolve();
                }
              }
            );
          }
          catch(error) {
            reject(error)
          }
        }
        else {
          try {
            //console.log("setting here...key", key, value)
            await this.client.set(
              key,
              value,
              (err) => {
                if (err) {
                  reject(err);
                }
                else {
                  return resolve();
                }
              }
            );
          }
          catch(error) {
            console.error("TdCache Error:", error);
            reject(error)
          }
        }
        // if (options && options.callback) {
        //     options.callback();
        // }
        //console.log("resolving...", key);
        // return resolve();
      });
    }

    async incr(key) {
      // console.log("incr key:", key)
      return new Promise( async (resolve, reject) => {
          try {
            // console.log("incr here...key", key)
            await this.client.incr(key);
          }
          catch(error) {
            console.error("Error on incr:", error);
            reject(error)
          }
        return resolve();
      });
    }

    async hset(dict_key, key, value, options) {
      //console.log("hsetting dict_key key value", dict_key, key, value)
      return new Promise( async (resolve, reject) => {
        if (options && options.EX) {
          //console.log("expires:", options.EX)
          try {
            await this.client.hset(
              dict_key,
              key,
              value,
              'EX', options.EX);
          }
          catch(error) {
            reject(error)
          }
        }
        else {
          try {
            //console.log("setting here...key", key, value)
            await this.client.hset(
              dict_key,
              key,
              value);
          }
          catch(error) {
            console.error("Error", error);
            reject(error)
          }
        }
        if (options && options.callback) {
            options.callback();
        }
        return resolve();
      });
    }

    async hdel(dict_key, key, options) {
      //console.log("hsetting dict_key key value", dict_key, key, value)
      return new Promise( async (resolve, reject) => {
        if (options && options.EX) {
          //console.log("expires:", options.EX)
          try {
            await this.client.hdel(
              dict_key,
              key,
              'EX', options.EX);
          }
          catch(error) {
            reject(error)
          }
        }
        else {
          try {
            //console.log("setting here...key", key, value)
            await this.client.hdel(
              dict_key,
              key);
          }
          catch(error) {
            console.error("Error", error);
            reject(error);
          }
        }
        if (options && options.callback) {
            options.callback();
        }
        return resolve();
      });
    }
    
    async setJSON(key, value, options) {
      const _string = JSON.stringify(value);
      return await this.set(key, _string, options);
    }
    
    async get(key, callback) {
      //console.log("getting key", key)
      return new Promise( async (resolve, reject) => {
        this.client.get(key, (err, value) => {
          if (err) {
            reject(err);
          }
          else {
            if (callback) {
              callback(value);
          }
          return resolve(value);
          }
        });
      });
    }

    async hgetall(dict_key, callback) {
      //console.log("hgetting dics", dict_key);
      return new Promise( async (resolve, reject) => {
        this.client.hgetall(dict_key, (err, value) => {
          if (err) {
            reject(err);
            if (callback) {
              callback(err, null);
            }
          }
          else {
            if (callback) {
              callback(null, value);
            }
            resolve(value);
          }
        });
      });
    }

    async hget(dict_key, key, callback) {
      //console.log("hgetting dics", dict_key);
      return new Promise( async (resolve, reject) => {
        this.client.hget(dict_key, key, (err, value) => {
          if (err) {
            reject(err);
            if (callback) {
              callback(err, null);
            }
          }
          else {
            if (callback) {
              callback(null, value);
            }
            resolve(value);
          }
        });
      });
    }
    
    async getJSON(key, callback) {
      const value = await this.get(key);
      return JSON.parse(value);
    }
    
    async del(key, callback) {
      return new Promise( async (resolve, reject) => {
        this.client.del(key, () => {
          if (callback) {
            callback();
          }
          return resolve();
        });
      })
    }
}

module.exports = { TdCache };
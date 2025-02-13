/**
 * Created by zhangmiao on 2018/5/7.
 */
var grpc = require("@grpc/grpc-js");
//var fs = require("fs"); 需要监听文件的更改
var utils = require("../../util/utils");

var RpcServer = function (app, opts) {
    opts = opts || {};
    this.opts = opts;
    this.app = app;
    this.port = app.getCurServer().port;
};

module.exports.create = function (app, opts) {
    return new RpcServer(app, opts);
};

/**
 *
 * @param rpcPbPath {String}
 * @param serviceMap {Object} {name, path}
 */

RpcServer.prototype.addService = function (rpcPbPath, serviceMap) {
    if (!this.server)
        this.server = new grpc.Server();
    var services = require(rpcPbPath);
    if (!services) {
        console.error("没有对应的rpcPbPath文件:", rpcPbPath);
        return;
    }
    for (var serviceName in serviceMap) {
        if (!serviceMap.hasOwnProperty(serviceName)) continue;
        var pbService = services[serviceName] || services[serviceName + "Service"];
        if (!pbService) continue;
        var Service = require(serviceMap[serviceName]);
        if (!Service) continue;
        var service = new Service(this.app);
        this.server.addService(pbService, service);
    }
};


RpcServer.prototype.start = function (cb) {
    if (!this.server) return; //没有对应的服务器需要开启
    // this.server.bind('0.0.0.0:'+this.port, grpc.ServerCredentials.createInsecure());
    this.server.bindAsync('0.0.0.0:' + this.port, grpc.ServerCredentials.createInsecure(),
        (err, port) => {
            if (err) {
                console.error('绑定 gRPC 服务器出错:', err);
                // 处理错误，例如抛出异常或退出进程
                throw err; // 或 process.exit(1);
            } else {
                console.log(`gRPC 服务器监听端口 ${port}`);
                // this.server.start(); // 只有在成功绑定后才启动服务器

                // this.server.start(function (err, data) {
                //     utils.invokeCallback(cb, err, data);
                // });
            }
        }
    );
    // this.server.start(function(err, data){
    //     utils.invokeCallback(cb, err, data);
    // });
};
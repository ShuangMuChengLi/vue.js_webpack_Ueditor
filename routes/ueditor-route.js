/**
 * Created by lin on 2017/5/11.
 */
var formidable = require("formidable");
var qs = require('querystring');//解析参数的库
var express = require('express');
var path = require('path');
var fs = require('fs');
var http = require('http');
var async = require('async');
const url = require('url');
var conf = require('../config/conf');// 图片服务器地址配置
module.exports = function (routeReq, routeRes, next) {
	if (routeReq.query.action === 'config') {
		routeRes.setHeader('Content-Type', 'application/json');
		routeRes.redirect('/ueditor/nodejs/config.json');
		return;
	} else if (routeReq.query.action === 'catchimage') {
		function factory(remoteUrl) {
			return function (callbackfirst) {
				async.waterfall([
					function(callback) {
						var oUrl = url.parse(remoteUrl);
						var aPath = oUrl.pathname.split("/");
						var filename = aPath[aPath.length - 1];
						http.get({
							host: oUrl.hostname,
							path: oUrl.pathname,
							port: oUrl.port || 80
						}, function (res) {
							let rawData = '';
							res.setEncoding("binary");
							res.on('data', (chunk) => {
								rawData += chunk;
							});
							res.on('end', () => {
								try {
									var data = new Buffer(rawData, "binary").toString('base64');
									callback(null,data, filename);
								} catch (e) {
									callback(e);
									console.error(e.message);
								}
							});
						});
					}
				], function (err, data,fileName) {
					var base64Data = data;
					var postData = {
						data: base64Data,
						filename: fileName
					};
					var sPostData = qs.stringify(postData);
					var options = {
						hostname: conf.fileServer,
						port: conf.fileServerPort,
						path: conf.fileServerPath,
						method: "POST",
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Content-Length': Buffer.byteLength(sPostData)
						}
					};
					var req = http.request(options, (res) => {
						res.setEncoding('utf8');
						var aResData = [];
						res.on('data', (chunk) => {
							aResData.push(chunk);
						});
						res.on('end', () => {
							var resData = aResData.join("");
							var data = resData.toString();
							var jDate = JSON.parse(data);
							var sResule = {};
							if (jDate.code == "success") {
								sResule.url = "http://" + conf.fileServer + ":" + conf.fileServerPort + jDate.path;
								sResule.title = fileName;
								sResule.source = remoteUrl;
								sResule.state = "SUCCESS";
								sResule.size = base64Data.length;
							} else {
								sResule.state = "Fail";
							}
							callbackfirst(null,sResule);
						});
					});
					req.on('error', (e) => {
						callbackfirst(e);
						console.log(`请求遇到问题: ${e.message}`);
					});
					// 写入数据到请求主体
					req.write(sPostData);
					req.end();
				});
			}
		}
		var source = routeReq.body['source[]'];
		var aRemoteUrls = [];
		if (typeof source === "string") {
			aRemoteUrls.push(source);
		} else {
			aRemoteUrls = source;
		}
		var factorys = aRemoteUrls.map(factory);
		async.parallel(
			factorys,
			function (err, results) {
				if(err){
					next(err);
					return;
				}
				var result = {
					list: results,
					state: "SUCCESS"
				}
				routeRes.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
				routeRes.end(JSON.stringify(result));
			}
		);
		
	} else {
		function sentPicToServer(data, fileName) {
			var base64Data = data;
			var postData = {
				data: base64Data,
				filename: fileName
			};
			var sPostData = qs.stringify(postData);
			var options = {
				hostname: conf.fileServer,
				port: conf.fileServerPort,
				path: conf.fileServerPath,
				method: "POST",
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': Buffer.byteLength(sPostData)
				}
			};
			var req = http.request(options, (res) => {
				res.setEncoding('utf8');
				var aResData = [];
				res.on('data', (chunk) => {
					aResData.push(chunk);
				});
				res.on('end', () => {
					var resData = aResData.join("");
					routeRes.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
					var data = resData.toString();
					var jDate = JSON.parse(data);
					var sResule = {};
					if (jDate.code == "success") {
						sResule.url = "http://" + conf.fileServer + ":" + conf.fileServerPort + jDate.path;
						sResule.original = fileName;
						sResule.state = "SUCCESS";
					} else {
						sResule.state = "Fail";
					}
					routeRes.end(JSON.stringify(sResule));
				});
			});
			req.on('error', (e) => {
				next(e);
				console.log(`请求遇到问题: ${e.message}`);
			});
			// 写入数据到请求主体
			req.write(sPostData);
			req.end();
		}
		
		var form = new formidable.IncomingForm();
		form.parse(routeReq, function (err, fields, files) {
		});
		form.on('file', function (name, file) {
			fs.readFile(file.path, function (err, data) {
				if (err) next(err);
				sentPicToServer(new Buffer(data).toString('base64'), file.name);
			});
		});
	}
}

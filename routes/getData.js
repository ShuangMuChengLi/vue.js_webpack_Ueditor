var express = require('express');
var url = require('url');
var qs = require('querystring');//解析参数的库
var http=require('http');
var router = express.Router();
var async = require("async");
var session = require('express-session');
router.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));
/* GET users listing. */
router.post('/', function(routeReq, routeRes, next) {
	var arg = routeReq.body;
	var pageUrl =  arg['page'];
	var method =  arg['method'] || 'POST';
	var pageObject = url.parse(pageUrl);
	delete arg['page'];
	delete arg['method'];
	pageObject.port = pageObject.port || 80;
	var postData = JSON.stringify(arg);
	// var postData = qs.stringify(arg);
	var path = "";
	var headers = {};
	if(method == "GET"){
		path = pageObject.pathname + "?" + qs.stringify(arg);
		headers = {
			'Content-Type': 'application/json;charset=utf-8'
		}
	}else{
		path = pageObject.pathname;
		headers = {
			// 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
			'Content-Type': 'application/json;charset=utf-8',
			'Content-Length': Buffer.byteLength(postData)
		}
	}
	var options = {
		hostname: pageObject.hostname,
		port: pageObject.port,
		path:path,
		method: method,
		timeout:5000,
		headers: headers
	};
	var req = http.request(options, (res) => {
		console.log(`STATUS: ${res.statusCode}`);
		console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
		if(res.statusCode !== 200){
			var err = new Error();
			err.code = res.statusCode;
			next(err);
			return;
		}
		res.setEncoding('utf8');
		var aResData = [];
		res.on('data', (chunk) => {
			aResData.push(chunk);
		});
		res.on('end', () => {
			var resData = aResData.join("");
			routeRes.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
			var data = resData.toString();
			routeRes.end(data);
		});
	});
	req.on('timeout',function(){
		var err = new Error();
		err.code = "504";
		err.message = "请求超时:" + pageUrl;
		next(err);
		req.abort();
		return;
	});
	req.on('error', (e) => {
		next(e);
	});
	if(method == "POST"){
		// 写入数据到请求主体
		req.write(postData);
	}
	req.end();
});
module.exports = router;
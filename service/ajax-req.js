/**
 * Created by lin on 2017/7/8.
 */
const http = require('http');
const querystring = require('querystring');
const url = require('url');
function ajaxReq(targetUrl,method,data,contentType,callback) {
	let oTargetUrl = url.parse(targetUrl);
	let path = "";
	let headers;
	let postData = JSON.stringify(data);
	let sContentType = contentType || 'application/json;charset=utf-8';
	if (method == "GET") {
		path = oTargetUrl.pathname + "?" + querystring.stringify(data);
		headers = {
			'Content-Type': sContentType
		}
	} else if(method == "POST"){
		
		path = pageObject.pathname;
		headers = {
			'Content-Type': sContentType,
			'Content-Length': Buffer.byteLength(postData)
		}
	}else{
		// TODO other Method need to handle
		let err = new Error();
		err.message = "other Method";
		err.code = 500;
		callback(err);
		return false;
	}
	const options = {
		hostname: oTargetUrl.hostname,
		port: oTargetUrl.port || 80,
		path: path,
		method: method,
		headers: headers
	};
	
	const req = http.request(options, (res) => {
		res.setEncoding('utf8');
		let aResData = [];
		res.on('data', (chunk) => {
			aResData.push(chunk);
		});
		res.on('end', () => {
			let resData = aResData.join("");
			let data = resData.toString();
			callback(null,data);
		});
	});
	
	req.on('error', (e) => {
		callback(e);
	});

// write data to request body
	req.write(postData);
	req.end();
}
// ajaxReq("http://www.linchaoqun.com/","GET",{},"",function (err,data) {
// 	console.log(err)
// 	console.log(data)
// })
module.exports = ajaxReq;
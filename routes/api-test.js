var express = require('express');
var router = express.Router();
var session = require('express-session');
router.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));
/* GET users listing. */
router.post('/', function(routeReq, routeRes, next) {
	var arg = routeReq.body;
	routeRes.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
	var data = JSON.stringify(arg);
	routeRes.end(data);
});
module.exports = router;
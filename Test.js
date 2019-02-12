var	express = require("express")	//网络请求

var FoodGroup = require("./FoodGroup.js")

var uuid = require("uuid/v4")

var FoodModel = FoodGroup.FoodGroup

var app = express()

app.get("/",function(req,res){
	res.writeHead(200,{"Type-Content":"text/html;charset=UTF-8"})
	for (var i = 0; i <= 10; i++) {
		console.log(uuid());
	}
	
	m = new FoodModel(uuid(),"测试","www.baidu.com")
	console.log(m);
	res.end()
})


app.listen(5000)
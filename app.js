var http = require("http"),	//http协议请求
	url = require("url"),	//url地址
	sql = require("mssql"),	//数据库操作
	express = require("express"),	//框架
	superagent = require("superagent"),	//网络请求
	eventproxy = require("eventproxy"),	//异步回调
	cheerio = require("cheerio"),	//node.js中的jquery库
	uuid = require("uuid/v4"),		//v1：产生时间戳的uuid（在循环中使用该方法，循环速度过快导致生成一样的），v4：随机产生uuid
	async = require("async")

var FoodGroup = require("./FoodGroup"),	//组类别
	FooInfo = require("./FoodInfo")	//食物

//数据库连接配置
const app = express(),
	  config = {
	  	user:"sa",
	  	password:"1234",
	  	server:"DESKTOP-G0MEANI",
	  	database:"Change"
	  }

var ep = new eventproxy()

var FoodCount = 0;

//首页请求
/*app.get("/",function(req,res){
	res.writeHead(200,{"Type-Content":"text/html;charset=UTF-8"})
	res.end("succeed")
})*/

//薄荷网域名
var boohee = "http://www.boohee.com";


var GroupUrl = [],	//板块a标签存放数组
	GroupFoods = []

//抓取食物板块url
function GrabGroup(){
		//Get请求薄荷网食物热量查询页
		superagent.get("http://www.boohee.com/food/")
				.end(function(error,html){

					//console.log("if："+error);
					//检测请求是否成功
					if(html.status == 200){
						//将html页面内容加载为cheerio可操作的对象
						var $ = cheerio.load(html.text)
						//加载所有的板块a标签
						var GroupInfoUrl = $("#main ul[class='row'] li div[class='img-box'] a")
						//循环遍历得到所有的a标签路径
						for (var i = 0; i <= GroupInfoUrl.length; i++) {
							var temp = GroupInfoUrl.eq(i).attr("href");
							if(temp != undefined)
							{
								//将域名与板块连接进行拼接（全路径）
								//GroupUrl[i] = boohee + temp
								ep.emit("GroupUrl",boohee + temp)
								//console.log(boohee + temp);
								//console.log("板块路径连接："+ GroupUrl[i]);
							}
						}
						//console.log(GroupUrl.length);
						//开始执行板块中的单项抓取
						//GrabFoodInfo()
					}
				})
}

//抓取所有板块下的所有食物信息页
/*function GrabFoodInfo(){
	//循环遍历所有的板块路径
	 for (var i = 0; i < GroupUrl.length; i++) {
		 	(async function(i){
		 		await superagent.get(GroupUrl[i])
						.end(function(error,html){
							console.log("current i："+i);
								if(html.status == 200){
									//console.log("成功获取指定页面");
									var $ = cheerio.load(html.text)
									//将该板块进行录入数据库
									Group = new FoodGroup.FoodGroup(uuid(),$("#main div[class='widget-food-list pull-right']>h3").text(),GroupUrl[i]);
										try{
											(async function(){
												GroupFoods[i] = Group;
												
													//全局已存在sql连接对象，需要先进行关闭后，再次进行连接
													sql.close()
													//配置连接对象
													var pool = await sql.connect(config)
													var rez  = await pool.request()
													.query("select count(1) as rez from FoodGroup where GroupUrl = '" + GroupUrl[i]+"'")
													if(rez.recordset[0].rez == 0){
														console.log("不存在数据库：" + GroupUrl[i]);
														 pool.request()
														.query("insert into FoodGroup values('"+Group._Id+"','"+Group._GroupName+"','"+Group._GroupUrl+"')")
													}
												
											})();
										} 
										catch(err) 
										{
											console.log(err);
										}
										//console.log(Group);
							}
						})
		 	})(i)
		}
}*/


//主程序
function Start(){
	console.log("开始执行");
	//function Server(req,res){
	//	res.writeHead(200,{"Type-Content":"text/html;charset=UTF-8"})
		//开始抓取所有的板块a标签路径
		GrabGroup();
			ep.after("GroupUrl",11,function(GroupUrl){
				function reptileMove(url,callback){
					//console.log(url);
					superagent.get(url)
					.end(function(error,html){
						if(html.status == 200)
						{
							let $ = cheerio.load(html.text)
							var pageSize = $(".pagination").attr("limit_page")

							for (let i = 1; i <= pageSize; i++) {
								ep.emit("AllGroupUrl",url+"?page="+i)

								superagent.get(url+"?page="+i)
								.end(function(error,html){
									$ = cheerio.load(html.text)
									var FoodList = $("div[class='img-box pull-left'] a[target='_blank']")
									
										if(FoodList!=0)
										{
											for (var j = 0 ; j < FoodList.length; j++) 
											{
												//console.log(boohee+FoodList.eq(j).attr("href"));
												//console.log();
												var u = boohee+FoodList.eq(j).attr("href")
												ep.emit("Food",u)
												//食物详情信息抓取
												FoodGrad(u)
											}
										}
								})
							}
						}
					})
					//callback();
				}

				async.mapLimit(GroupUrl, 11 ,function (url, callback) {
				  reptileMove(url, callback);
					}, function (err,result) {
						console.log(FoodCount);
					});
			})

			/*ep.after("Food",FoodCount,function(url){

				console.log(FoodCount);

				function Grab(url,callback){
					console.log(url);
				}

				async.mapLimit(url,FoodCount,function(url,callback){
						Grab(url,callback)
				},function(err,result){
					console.log("完成");
				})
			})*/
		
		//res.end("success")
	//}

	//开启；localhost://5000端口
	//http.createServer(Server).listen(5000)
}

//食物抓取
function FoodGrad(url){
	
	superagent.get(url)
		.end(function(error,html){
			if(html.status == 200)
			{
				var str = "";
				console.log("当前抓取url地址："+url);
				let $ = cheerio.load(html.text)
				str+=$("#calory_form p").eq(0).text()+"，食物图片路径："+$(".lightbox").eq(0).attr("href");
				str+="，食物热量："+$("#food-calory").text();
				str+="，"+$(".content>dl").eq(1).find("dd").eq(0).text()
				str+="，"+$(".content>dl").eq(1).find("dd").eq(1).text()
				str+="，"+$(".content>dl").eq(2).find("dd").eq(0).text()
				str+="，"+$(".content>dl").eq(2).find("dd").eq(1).text()
				str+="，"+$(".content>dl").eq(3).find("dd").eq(0).text()
				str+="，"+$(".content>p").eq(0).text()

				console.log(str);
			}
		})
}

//暴露方法
exports.Start = Start


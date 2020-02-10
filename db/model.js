/*
包含n个操作数据库集合数据的Model模块
* */
const md5 = require('blueimp-md5')

/*连接数据库*/
//1. 引入mongoose
const mongoose = require('mongoose')
//2.连接指定数据库（url只有数据库是变化的. 最后一个是数据库project的名字）
mongoose.connect('mongodb://localhost:27017/indeed_project')

//3.获取连接对象
const conn = mongoose.connection
//4.绑定连接完成的监听
conn.on('connected', function () {
    console.log("successfully connected to database!")
})

//定义user schema
const userSchema = mongoose.Schema({
    username : {type : String, required:true},
    password : {type : String, required: true},
    type : {type : String, required : true},
    header : {type : String},   //头像名称
    position: {type: String}, // 职位
    info: {type: String}, // 个人或职位简介
    company: {type: String}, // 公司名称
    salary: {type: String} // 月薪
})


//定义chat schema
const chatSchema = mongoose.Schema({
    from : {type : String, required : true}, //发送用户的id
    to : {type: String, required : true},     //接受用户的id
    chat_id : {type: String, required : true}, //from和to组成的字符串
    content : {type : String, required: true }, //内容
    read : {type: Boolean, default: false},     //标识为是否已读
    create_time : {type:Number }             //创建时间
})

//定义为向外暴露的model
const UserModel = mongoose.model('user', userSchema)
const ChatModel = mongoose.model('chat',chatSchema)
// 2.3. 向外暴露Model
exports.UserModel = UserModel
exports.ChatModel = ChatModel
/*
* 测试使用mangoose 操作mongodb数据库
* */
const md5 = require('blueimp-md5') // md5加密的函数
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

/*定义对应的特定的集合model*/
//1. 定义schema（描述文档结构）
const userSchema = mongoose.Schema({
    username:{type : String, required:true}, //用户名
    password:{type : String, required:true}, //密码
    type : {type:String, required:true}, //用户类型
    header : {type : String}  //头像
})
//2. 定义Model
const UserModel = mongoose.model('user',userSchema) //两个参数，一个是集合名，一个是约束方法名


//3. 通过model来进行save()操作
function testSave(){
    //user数据对象
    const userModel = new UserModel({
        username : 'ghy',
        password : md5('1234'),
        type : 'faculty'
    })
    // 调用save()保存
    userModel.save(function (error, user) {
        console.log('test saving successfully', error, user)
    })
}
//testSave()


//通过model的find(), findOne()来查询多个数据
function testFind(){
    /*
    UserModel.find(function (error, users) {
        console.log('test finding', error, users)
    })*/
    // 查询多个: 得到是包含所有匹配文档对象的数组, 如果没有匹配的就是[]
    UserModel.find({_id:'5e189dcbb88b58f490733ef2'},function (error, users) {
        console.log('test finding', error, users)
    })
    // 查询一个: 得到是匹配的文档对象, 如果没有匹配的就是null
    UserModel.findOne({_id:'5e1955dc03100cf6d04584fe'}, function(error, user){
        console.log('test finding one', error, user)
    })
}
//testFind()

//通过Model的findByIdAndUpdate()更新某个数据
function testUpdate(){
    UserModel.findByIdAndUpdate({_id :'5e189dcbb88b58f490733ef2'},{username: 'jack'}, function(error, oldUsr){
        console.log('test updating', error, oldUsr)
    })
}
//testUpdate()

function testRemove() {
    UserModel.remove({_id: '5e19502e209430f62609a9e2'}, function (error, doc) {
        console.log('test removing...', error, doc)
    })
}
//testRemove()







var express = require('express');
var router = express.Router();
const filter = {password: 0, __v: 0} // 指定过滤的属性

//方法就要加中括号
const {UserModel,ChatModel} = require('../db/model')
const md5 = require('blueimp-md5')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//注册路由
router.post('/register',function (req, res) {
  //1. 读取请求参数
  //post请求必然是body
  const {username, password, type} = req.body
  //2. 处理
    //首先要根据用户名判断用户是否存在，如果存在，返回错误的提示
  UserModel.findOne({username:username}, function(error,user){
    if(user){
      res.send({code : 1, msg:'User has existed'})
    }else{
      //进行存值操作
      new UserModel({username:username, password:md5(password), type:type}).save(function (error, user) {
        //生成一个cookie，交给浏览器保存
        res.cookie('userid',user._id,{maxAge: 1000*60*60*24})
        // 返回包含user的json数据， 不直接写user是因为响应数据中不要携带password
        const data = {username: username, _id: user._id, type : type} // 响应数据中不要携带password
        res.send({code: 0, data})
      })
    }
  })
  //3.返回响应数据

})

//登陆的路由
router.post('/login',function(req, res){
  //1. 读取请求参数
  const {username, password} = req.body
  //2. 处理
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
  UserModel.findOne({username : username, password : md5(password)},function(error, user){
    if(user) { // 登陆成功
      // 生成一个cookie(userid: user._id), 并交给浏览器保存
      res.cookie('userid', user._id, {maxAge: 1000*60*60*24})
      // 返回登陆成功信息(包含user)
      res.send({code: 0, data: user})
    } else {// 登陆失败
      res.send({code: 1, msg: 'your username or password is invalid!'})
    }
  })
})

//更改用户信息的路由
router.post('/update', function(req, res){
  //从请求的cookie中获取userid，判断是否登陆了,如果不存在，直接返回提示信息
  const userid = req.cookies.userid
  if(!userid){
    res.send({code : 1, msg :'Please log in first'})
  }else{
    //存在，根据userid，更新对应user文档中的数据
    //读取请求参数，即得到用户提交的数据 可以写成const {position, header, info} = req.body，但是由于获取的数据类别太多，干脆直接用user接收，调用的时候user.position即可
    UserModel.findByIdAndUpdate({_id: userid}, req.body, function(error, oldUser){
      if(!oldUser){
        res.send({code : 1, msg :'Please log in first'})
      }else{
        //由于req.body里面没有username和type，所以需要把oldUser里面这两个属性提取出来，加入到新的user中
        const {_id, username, type} = oldUser
        //assign 可以将多个指定的对象进行合并，返回一个合并的对象。 注意assign是有顺序的，如果有重复的属性，后面的会覆盖前面的
        const data = Object.assign(req.body, {_id, username, type})
        res.send({code:0, data : data})
      }
    })
  }
})


//根据cookie中user_id来获取用户信息的路由
router.get('/user',function (req,res) {
  const userid = req.cookies.userid
  if(!userid){
    return res.send({code : 1, msg :'Please log in first'})
  }else{
    //根据user_id 查询对应的user
    UserModel.findOne({_id: userid}, filter, function (error, user) {
      res.send({code: 0, data:user})
    })
  }
})

//根据用户类型来获取对应的用户列表
router.get('/userList',function (req,res) {
  //如果参数在url中，例如/userList/:type, 我们获取type就是req.params
  //const type = req.body.type
  //console.log(type)
  const {type} = req.query
  UserModel.find({type : type}, filter, function (error,users) {
    res.send({code:0, data:users})
  })
})

/*
获取当前用户所有相关聊天信息列表
 */
router.get('/msgList', function(req,res){
  const userid = req.cookies.userid
  // 查询得到所有user文档数组
  UserModel.find(function (err, userDocs) {
    //用对象存储user的信息
    const users = {} //对象容器
    userDocs.forEach(doc => {
      users[doc._id] = {username : doc.username, header: doc.header}
    })

    /*
    接下来查询userid相关的所有聊天信息
    首先思考与userid相关的: 发送方， 接收方。 所以利用"或者"查询条件
    * */
    ChatModel.find({'$or':[{from: userid},{to:userid}]},filter,function (err, chatMsgs) {
        res.send({code:0, data:{users,chatMsgs}})
    })
  })
})

//修改指定消息为已读

router.post('/readMsg', function (req,res) {
    //获取接发消息双方
  const from = req.body.from
  //我只能改别人发给我的 消息
  const to = req.cookies.userid
  /*
  * 参数1： 查询条件
  * 参数2： 更新为指定的参数对象
  * 参数3: 是否1次更新多条, 默认只更新一条
  * 参数4: 更新完成的回调函数
  * */
  ChatModel.update({from,to,read:false},{read:true},{multi:true},function (err,doc) {
    //返回更新的数量
    console.log('/readmsg', doc)
      res.send({code: 0, data : doc.nModified})
  })
})
/*
修改指定消息为已读
 */
router.post('/readmsg', function (req, res) {
  ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
    res.send({code: 0, data: doc.nModified}) // 更新的数量
  })
})




module.exports = router;

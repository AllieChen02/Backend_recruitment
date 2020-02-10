const {ChatModel} = require( '../db/model')



module.exports = function (server) {
    const io = require('socket.io')(server)

    // 监视客户端与服务器的连接
    io.on('connection', function (socket) {
        console.log('a client connect to server')
        // 绑定监听, 接收客户端发送的消息
        socket.on('sendMsg', function ({from,to,content}) {
            console.log('Server has received messages from client', {from,to,content})
            //处理数据（即，保存消息)
            //先准备chatMsg相关数据 -- （还缺chatid和create_time
            const create_time = Date.now()
            const chat_id = [from,to].sort().join('_')   //from_to 或者to_from
            new ChatModel({from,to,content,create_time,chat_id}).save(function (err, chatMsg) {
                //向客户端发送数据
                //简化，向所有连接的对象都发 ---- 不是特别好
                io.emit('receiveMsg',chatMsg)
            })

        })
    })
}
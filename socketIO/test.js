module.exports = function (server) {
    const io = require('socket.io')(server)

    // 监视客户端与服务器的连接
    io.on('connection', function (socket) {
        console.log('socket io connected')

        // 绑定监听, 接收客户端发送的消息
        socket.on('sendMsg', function (data) {
            console.log('服务器接收到客户端发送的消息', data)
            // 服务器向客户端发送消息
            // socket.emit('receiveMsg', data)
            io.emit('receiveMsg', data.name +'_' +data.date,) //发送给所有连接上服务器的客户单
            console.log('服务器向客户端发送消息', data)
        })
    })
}
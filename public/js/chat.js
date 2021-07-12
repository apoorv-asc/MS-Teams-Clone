const socket = io();
console.log(roomId);


// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
// const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
// const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Triggered when "Send" button is pushed
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', 
        {
            message:message,
            roomId:roomId,
            username:username,
            time:moment(message.createdAt).format('h:mm a')
        },
        (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

// socket.on('message', (message) => {
socket.on('Show-Message',(message)=>{
    console.log(message.username);
    console.log(message.msg);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.msg,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    // autoscroll()
})

socket.emit('join', { username, roomId }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
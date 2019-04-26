
let listeners = [];
let state;

export function listen(fn){
    const l = ()=>{
        setInterval(()=>{
            fn(state);
        },1);
    }
    listeners.push(l);
    if ( state != undefined )
        l();

    return () => {
        listeners = listeners.filter(l2=>l2!= l )
    }
}


let socket;

export function fire(e){
    socket.send(JSON.stringify(e));
}

function createSocket(){
    socket = new WebSocket("ws://192.168.0.16:8080/state");

    socket.onmessage = event => {
        if ( typeof state == undefined ) {
            state = JSON.parse(event.data);
            if ( first ) {
                listeners.forEach(f=>f());
            }
        } else {
            state = JSON.parse(event.data);
        }
    };
    socket.onerror = error => {
    console.error(error);
    }
    socket.onclose = () => {
        socket = undefined;
        if ( listeners.length > 0 )
            connect();
    };
}
createSocket();
const APP_ID = 'efd7d3d435314591ac6738f65ad2d308';
const CHANNEL = sessionStorage.getItem('room');
const TOKEN = sessionStorage.getItem('token');
let UID =Number(sessionStorage.getItem('UID'));
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
let localTracks = [];
let remoteUsers = {};
let NAME = sessionStorage.getItem('username');
let joinAndDisplayLocalStream = async () => {
    document.getElementById('room-name').innerText=CHANNEL
    
    client.on('user-published',handleUserJoined)
    client.on('user-left',handleUserLeft)
    try{
        await client.join(APP_ID, CHANNEL, TOKEN, UID);
    }
    catch(error){
        console.error(error)
        window.open('/','_self')
    }
    member = await creatMember()
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
    let player = `  <div class="video-container" id='user-container-${UID}'>
                        <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                        <div class="video-player" id="user-${UID}"></div>
                    </div>`;
    document.getElementById('video-strem').insertAdjacentHTML('beforeend',player);
    localTracks[1].play(`user-${UID}`);
    await client.publish([localTracks[0],localTracks[1]]);
}
let handleUserJoined = async (user,mediaType)=>{
    remoteUsers[user.uid] = user;
    await client.subscribe(user,mediaType);
    if(mediaType== 'video'){
        let player = document.getElementById(`user-container-${user.uid}`);
        if(player != null){
            player.remove();
        }
        member = await getMember(user)
        console.error(member)
        player = `  <div class="video-container" id='user-container-${user.uid}'>
        <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
        <div class="video-player" id="user-${user.uid}"></div>
    </div>`;
        document.getElementById('video-strem').insertAdjacentHTML('beforeend',player);

        user.videoTrack.play(`user-${user.uid}`);
    }
    if(mediaType== 'audio'){
        console.log('audidfjsdfijdsfijsdifjisdfidjfisdjaifo');
        user.audioTrack.play();
    }
}
let handleUserLeft = async (user)=>{
    delete remoteUsers[user.uid];
    let player = document.getElementById(`user-container-${user.uid}`).remove();
}
let leaveAndRemoveLocalStream = async ()=>{
    for (i of localTracks){
        i.stop();
        i.close();
    }
    deleteMember(); 
    await client.leave();
    window.open('/','_self');
}
let muteCamera =async (e)=>{
    if(localTracks[1].muted){

        await localTracks[1].setMuted(false);
        e.target.style.backgroundColor='#fff';
    }
    else{
        await localTracks[1].setMuted(true);
        e.target.style.backgroundColor='red';
    }
  
}
let muteMic =async (e)=>{
    if(localTracks[0].muted){

        await localTracks[0].setMuted(false);
        e.target.style.backgroundColor='#fff';
    }
    else{
        await localTracks[0].setMuted(true);
        e.target.style.backgroundColor='red';
    }
  
}
let creatMember = async (e)=>{
    let response = await fetch('/create_member/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body : JSON.stringify({'name':NAME,'room_name':CHANNEL,'UID':UID})
    })
    let member = await response.json()
    return member
}


let deleteMember = async () => {
    let response = await fetch('/delete_member/', {
        method:'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
    });

}

let getMember = async (user) =>{
    let response = await fetch(`/get_member/?uid=${user.uid}&room_name=${CHANNEL}`);
    member = await response.json();
    return member;
}

joinAndDisplayLocalStream();

window.addEventListener('beforeunload',deleteMember)

document.getElementById('leave-btn').addEventListener('click',leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click',muteCamera)
document.getElementById('mic-btn').addEventListener('click',muteMic)


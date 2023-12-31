const clientId = "d0f4cbf4c19b4b93812d939de41e9627";
const redirectUri = "https://mynameiskennethl.github.io/myproject/";
const clientSecret = '5df8981440284ae88675ab4175135e58';
let authorizationCode = '';
let accessToken = '';
let selectedgenres = [];
let excludedgenres = [];

function authorizeUser() {
    const scopes = 'user-read-private playlist-read-private user-modify-playback-state user-read-currently-playing playlist-read-collaborative';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location = authUrl;
}

function checkvalidsongs(selector){
    let songinfo = []
    let songlist = document.getElementsByClassName('song')
    for(let i=0;i<songlist.length;i++){
        let song = {id:songlist[i].getAttribute('id'), genres:songlist[i].getAttribute('genres')};
        songinfo.push(song);     
    }
    
    for(let i=0;i<songinfo.length;i++){
        if(songinfo[i].genres.split(',').includes(selector)){
            console.log(document.getElementById(songinfo[i].id))
        }
    }
}

function addgenre(){
    let selector = document.getElementById('selector').value;
    if(!selectedgenres.includes(selector) && !excludedgenres.includes(selector)){
        selectedgenres.push(selector);
        document.getElementById('addedgenre').innerHTML += `<li>${selector}</li>`;
    }
    checkvalidsongs(selector);
}

function excludegenre(){
    let selector = document.getElementById('selector').value;
    if(!excludedgenres.includes(selector) && !selectedgenres.includes(selector)){
        excludedgenres.push(selector);
        document.getElementById('excludedgenre').innerHTML += `<li>${selector}</li>`;
    }
    checkvalidsongs(selector);
}

function displayAvailableGenre(){
    let listofgenres = [];
    const selector = document.getElementById("selector");
    const currentgenres = document.getElementsByClassName("song");
    selector.innerHTML = '';
    for (let i=0;i<currentgenres.length;i++){
        listofgenres.push(currentgenres[i].getAttribute('genres'));
    }
    stringGenre = listofgenres.toString();
    listofgenres = []
    stringGenre = stringGenre.split(',');
    for(let i=0;i<stringGenre.length;i++){
        if(!listofgenres.includes(stringGenre[i]) && stringGenre[i] != ''){
            listofgenres.push(stringGenre[i]);
        }
    }
    
    for(let i=0;i<listofgenres.length;i++){
        selector.innerHTML += `<option>${listofgenres[i]}</option>`;
    }
}

async function getGenre(artistid){
    const playlistsUrl = `https://api.spotify.com/v1/artists/${artistid}`;
    const playlistsHeaders = {
        Authorization: `Bearer ${accessToken}`,
    };

    const result = await fetch(playlistsUrl, {
        headers: playlistsHeaders,
    });
    data = await result.json();
    return data.genres;
}

async function displayTracks(songs){
    document.getElementById('tracksholder').innerHTML = ''
    for(let i=0;i<songs.length;i++){
        if(songs[i] != null && songs[i].is_local != true){
            let genres = await getGenre(songs[i].album.artists[0].id)
            document.getElementById('tracksholder').innerHTML += `<div class="song" genres="${genres}" id="song${i}"><image class="songimages" src="${songs[i].album.images[0].url}"></image><div class="songdescription">${songs[i].name}<br>By: ${songs[i].artists[0].name}</div></div>`
        }
    }
    displayAvailableGenre()
}

async function getTracks(playlist_id){
    document.getElementById('addedgenre').innerHTML = 'current genres:';
    document.getElementById('excludedgenre').innerHTML = 'excluded genres:';
    let allTracks = [];
    const playlistsUrl = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?limit=100`;
    const playlistsHeaders = {
        Authorization: `Bearer ${accessToken}`,
    };

    const result = await fetch(playlistsUrl, {
        headers: playlistsHeaders,
    });
    data = await result.json(); 
    for(let i=0;i<data.items.length;i++){
        allTracks.push(data.items[i].track);
    };

    while (data.next != null){
        const playlistsUrl = data.next;
        const playlistsHeaders = {
            Authorization: `Bearer ${accessToken}`,
        };

        const result = await fetch(playlistsUrl, {
            headers: playlistsHeaders,
        });
        data = await result.json()
        for(let i=0;i<data.items.length;i++){
            allTracks.push(data.items[i].track);
        };
    }
    
    displayTracks(allTracks);
};

async function getToken(authorizationCode) {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const tokenData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode, 
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
    });
    const tokenHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const response = await fetch(tokenUrl, {
        method: 'POST',
        body: tokenData,
        headers: tokenHeaders,
    });
    
    const data = await response.json();
    return data.access_token;
}

async function getUserPlaylists() {
    authorizationCode = new URLSearchParams(window.location.search).get('code');
    accessToken = await getToken(authorizationCode);
    const playlistsUrl = 'https://api.spotify.com/v1/me/playlists';
    const playlistsHeaders = {
        Authorization: `Bearer ${accessToken}`,
    };

    const result = await fetch(playlistsUrl, {
        headers: playlistsHeaders,
    });

    const data = await result.json();
    const playlist = data.items;
    
    for(let i=0;i<playlist.length;i++){
        let albumimage = ''
        let image = playlist[i].images;
        let ownername = playlist[i].owner;
        if(image != ''){
            albumimage = image[0].url;
        } else{
            albumimage = 'data:image/png;base64,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';
        };
        document.getElementById("playlistholder").innerHTML += `<div class="playlistinfo" onclick="getTracks('${playlist[i].id}')"><image src=${albumimage} class="playlistcover"></image><p>${playlist[i].name} <br> By: ${ownername.display_name}</p></div>`
    }

    if(document.getElementById('playlistholder').innerHTML != ' '){
        let login = document.getElementById('loginbutton');
        login.remove()
    }
}

getUserPlaylists();

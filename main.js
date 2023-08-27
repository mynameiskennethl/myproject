const clientId = "d0f4cbf4c19b4b93812d939de41e9627";
const redirectUri = "https://mynameiskennethl.github.io/myproject/";

function authorizeUser() {
    const scopes = 'user-read-private playlist-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location = authUrl;
}

async function getToken(authorizationCode) {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const tokenData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: redirectUri,
        client_id: clientId,
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
    const authorizationCode = new URLSearchParams(window.location.search).get('code');
    if (!authorizationCode) {
        authorizeUser();
        return;
    }

    const accessToken = await getToken(authorizationCode);
    
    const playlistsUrl = 'https://api.spotify.com/v1/me/playlists';
    const playlistsHeaders = {
        Authorization: `Bearer ${accessToken}`,
    };

    const result = await fetch(playlistsUrl, {
        headers: playlistsHeaders,
    });

    const data = await result.json();
    console.log(data);
}

getUserPlaylists();
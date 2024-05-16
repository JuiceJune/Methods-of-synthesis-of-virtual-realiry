function CreateWebcamTexture() {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture
}

function CreateVideo() {
    const video = document.createElement('video');
    video.setAttribute('autoplay', true);
    navigator.getUserMedia({ video: true, audio: false }, function (stream) {
        video.srcObject = stream;
    }, function (e) {
        console.error('Rejected!', e);
    });
    return video;
}
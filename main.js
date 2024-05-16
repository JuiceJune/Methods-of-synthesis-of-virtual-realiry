
/* Draws a colored cube, along with a set of coordinate axes.
 * (Note that the use of the above drawPrimitive function is not an efficient
 * way to draw with WebGL.  Here, the geometry is so simple that it doesn't matter.)
 */
function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let projectionMatrix = m4.perspective(scale, 2, 1, 40);
    const viewMatrix = m4.lookAt(CameraPosition, WorldOrigin, [0, 1, 0]);
    const camRotation = m4.axisRotation([0, 1, 0], 179);
    const projectionViewMatrix = m4.multiply(projectionMatrix, m4.multiply(viewMatrix, camRotation));

    if (ShowPath) {
        segmentProgram.Use();
        segment.Draw(projectionViewMatrix);
    }

    shProgram.Use()
    gl.bindTexture(gl.TEXTURE_2D, textureVideo);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        video
    );
    planeModel.Draw(stereoC.mProjectionMatrix, stereoC.mModelViewMatrix, true);
    gl.bindTexture(gl.TEXTURE_2D, textureSurface);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    stereoC.ApplyLeftFrustum();
    gl.colorMask(true, false, false, false);
    surface.Draw(stereoC.mProjectionMatrix, stereoC.mModelViewMatrix);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    stereoC.ApplyRightFrustum();
    gl.colorMask(false, true, true, false);
    surface.Draw(stereoC.mProjectionMatrix, stereoC.mModelViewMatrix);
    gl.colorMask(true, true, true, true);
}

/**
 * initialization function that will be called when the page has loaded
 */
let stereoC;
let video;
let textureVideo;
function init() {
    stereoC = new StereoCamera(10, 1, 1, 30, 1, 40);
    video = CreateVideo();
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
        textureVideo = CreateWebcamTexture();
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);

    canvas.onmousewheel = function (event) {
        if (+(scale - (Math.round(event.wheelDelta / 150) / 10.0)).toFixed(1) < 0.0 || +(scale - (Math.round(event.wheelDelta / 150) / 10.0)).toFixed(1) > 2.0) {
            return false;
        }
        scale -= ((event.wheelDelta / 150) / 10.0);
        document.getElementById("scale").value = +scale.toFixed(1);
        document.getElementById("scale_text").innerHTML = +scale.toFixed(1);
        draw();
        playVideo()
        return false;
    };
    // playVideo()
}

function playVideo() {
    draw();
    window.requestAnimationFrame(playVideo);
}

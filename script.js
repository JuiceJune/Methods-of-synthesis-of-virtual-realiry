

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let spaceball;                  // A SimpleRotator object that lets the user rotate the view by mouse.
let lineProgram;
let line;
let segment;
let segmentProgram;
let ModelRadius = 1;
let scale = 0.3;
let AmbientColor = [0.1, 0.1, 0.1];
let DiffuseColor = [1.0, 1.0, 1.0];
let SpecularColor = [0.97, 0.97, 0.97];
let Shininess = 12;
let LightIntensity = 1;
let World_X = 0;
let World_Y = 0;
let World_Z = -10;
let CameraPosition = [0, 0, -10]
let texturePoint = [0, 0]
let WorldOrigin = [0, 0, 0]
let LightPosition = [0, 0, 5]
let isAnimating = false;
let fps = 60;
let reqAnim;
let currentAnimationTime = 0;
let animationSpeed = 0;
let AnimationVelocity = [1, 1, 0];
let ShowPath = false;
let rotateValue = 0;
let planeModel;
const planeXYZs = [-1, -1, 0, 1, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0]
const planeUVs = [1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0]
let sphereGeom;

function SwitchAnimation() {

    isAnimating = !isAnimating;
    if (!isAnimating) {
        window.cancelAnimationFrame(reqAnim);
    }
    else {
        ExecuteAnimation();
    }

}

function GetNormalizedAnimVelocity() {
    return m4.normalize(AnimationVelocity);
}

function ExecuteAnimation() {
    if (!isAnimating) {
        return;
    }
    let deltaTime = 1000 / fps;
    LightPosition[0] = (Math.sin(currentAnimationTime / 500) * 2 * ModelRadius * GetNormalizedAnimVelocity()[0]);
    LightPosition[1] = (Math.sin(currentAnimationTime / 500) * 2 * ModelRadius * GetNormalizedAnimVelocity()[1]);

    BuildLine();
    draw();
    currentAnimationTime += deltaTime;
    setTimeout(() => {
        reqAnim = window.requestAnimationFrame(ExecuteAnimation);
    }, deltaTime);
}

function deg2rad(angle) {
    return angle * Math.PI / 180;
}

function Line(name, program) {
    this.position = m4.translation(0, 0, 0);
    this.name = name;
    this.iLightDirectionLineBuffer = gl.createBuffer();
    this.program = program;

    this.BufferData = function (data) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iLightDirectionLineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STREAM_DRAW)
    }

    this.Draw = function (projectionViewMatrix) {
        this.program.Use();

        gl.uniformMatrix4fv(this.program.iModelViewProjectionMatrix, false, m4.multiply(projectionViewMatrix, this.position));
        gl.uniform4fv(this.program.iSolidColor, [0, 1, 0, 1]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iLightDirectionLineBuffer);
        gl.vertexAttribPointer(this.program.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.program.iAttribVertex);

        gl.drawArrays(gl.LINE_STRIP, 0, 2);
    }
}


function SwitchShowPath() {
    ShowPath = !ShowPath;
    draw();
}

function GetDirLightDirection() {
    let test = m4.scaleVector(m4.normalize(LightPosition), -1);
    return test;
}


function CreateSurfaceData() {
    let phiMax = Math.PI * 2;
    let phiMin = 0;
    let vMax = Math.PI * 0.5;
    let vMin = 0;

    let vertexList = [];
    let normalsList = [];
    let textureList = [];

    let phiStep = phiMax / 100;
    let vStep = vMax / 100;

    for (let phi = phiMin; phi < phiMax + phiStep; phi += phiStep) {
        for (let v = vMin; v < vMax + vStep; v += vStep) {
            let vert = CalculateCorrugatedSpherePoint(phi, v)
            let n1 = CalcAnalyticNormal(phi, v, vert)
            let avert = CalculateCorrugatedSpherePoint(phi + phiStep, v)
            let n2 = CalcAnalyticNormal(phi + phiStep, v, avert)
            let bvert = CalculateCorrugatedSpherePoint(phi, v + vStep)
            let n3 = CalcAnalyticNormal(phi, v + vStep, bvert)
            let cvert = CalculateCorrugatedSpherePoint(phi + phiStep, v + vStep)
            let n4 = CalcAnalyticNormal(phi + phiStep, v + vStep, cvert)

            let u1 = map(phi, 0, phiMax, 0, 1)
            let v1 = map(v, 0, vMax, 0, 1)
            textureList.push(u1, v1)
            u1 = map(phi + phiStep, 0, phiMax, 0, 1)
            textureList.push(u1, v1)
            u1 = map(phi, 0, phiMax, 0, 1)
            v1 = map(v + vStep, 0, vMax, 0, 1)
            textureList.push(u1, v1)
            u1 = map(phi + phiStep, 0, phiMax, 0, 1)
            v1 = map(v, 0, vMax, 0, 1)
            textureList.push(u1, v1)
            v1 = map(v + vStep, 0, vMax, 0, 1)
            textureList.push(u1, v1)
            u1 = map(phi, 0, phiMax, 0, 1)
            v1 = map(v + vStep, 0, vMax, 0, 1)
            textureList.push(u1, v1)


            vertexList.push(vert.x, vert.y, vert.z)
            normalsList.push(n1.x, n1.y, n1.z)
            vertexList.push(avert.x, avert.y, avert.z)
            normalsList.push(n2.x, n2.y, n2.z)
            vertexList.push(bvert.x, bvert.y, bvert.z)
            normalsList.push(n3.x, n3.y, n3.z)

            vertexList.push(avert.x, avert.y, avert.z)
            normalsList.push(n2.x, n2.y, n2.z)
            vertexList.push(cvert.x, cvert.y, cvert.z)
            normalsList.push(n4.x, n4.y, n4.z)
            vertexList.push(bvert.x, bvert.y, bvert.z)
            normalsList.push(n3.x, n3.y, n3.z)
        }
    }

    return [vertexList, normalsList, textureList];
}

function map(val, f1, t1, f2, t2) {
    let m;
    m = (val - f1) * (t2 - f2) / (t1 - f1) + f2
    return Math.min(Math.max(m, f2), t2);
}

function CalcAnalyticNormal(u, v, xyz) {
    let DeltaU = 0.0001;
    let DeltaV = 0.0001;
    let uTangent = CalcDerivativeU(u, v, DeltaU, xyz)
    vec3Normalize(uTangent);
    let vTangent = CalcDerivativeV(u, v, DeltaV, xyz);
    vec3Normalize(vTangent);
    return vec3Cross(vTangent, uTangent);
}

function vec3Normalize(a) {
    var mag = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    a[0] /= mag; a[1] /= mag; a[2] /= mag;
}
function vec3Cross(a, b) {
    let x = a[1] * b[2] - b[1] * a[2];
    let y = a[2] * b[0] - b[2] * a[0];
    let z = a[0] * b[1] - b[0] * a[1];
    return { x: x, y: y, z: z }
}

function vec3Normalize(a) {
    var mag = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    a[0] /= mag; a[1] /= mag; a[2] /= mag;
}

function CalcDerivativeU(u, v, DeltaU, xyz) {
    let Dxyz = CalculateCorrugatedSpherePoint(u + DeltaU, v);

    let Dxdu = (Dxyz.x - xyz.x) / deg2rad(DeltaU);
    let Dydu = (Dxyz.y - xyz.y) / deg2rad(DeltaU);
    let Dzdu = (Dxyz.z - xyz.z) / deg2rad(DeltaU);

    return [Dxdu, Dydu, Dzdu];
}

function CalcDerivativeV(u, v, DeltaV, xyz) {
    let Dxyz = CalculateCorrugatedSpherePoint(u, v + DeltaV);

    let Dxdv = (Dxyz.x - xyz.x) / deg2rad(DeltaV);
    let Dydv = (Dxyz.y - xyz.y) / deg2rad(DeltaV);
    let Dzdv = (Dxyz.z - xyz.z) / deg2rad(DeltaV);

    return [Dxdv, Dydv, Dzdv];
}

function CalculateCorrugatedSpherePoint(phi, v) {
    let R = ModelRadius;
    let a = 0.24;
    let n = 6;
    let x = (R * Math.cos(v) - a * (1 - Math.sin(v)) * Math.abs(Math.cos(n * phi))) * Math.cos(phi);
    let y = (R * Math.cos(v) - a * (1 - Math.sin(v)) * Math.abs(Math.cos(n * phi))) * Math.sin(phi);
    let z = R * Math.sin(v);
    return { x, y, z };
}


/* Initialize the WebGL context. Called from init() */
let textureSurface;
function initGL() {

    textureSurface = LoadTexture();

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
}

function SetupSegment() {
    let prog = createProgram(gl, LineVertexShaderSource, LineFragmentShaderSource);

    segmentProgram = new ShaderProgram('Segment', prog);
    segmentProgram.Use();

    segmentProgram.iAttribVertex = gl.getAttribLocation(prog, "position");
    segmentProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    segmentProgram.iSolidColor = gl.getUniformLocation(prog, "color");
}

function BuildSegment() {
    segment = new Line("Segment", segmentProgram);
    segment.BufferData([...m4.scaleVector(GetNormalizedAnimVelocity(), -ModelRadius * 0.95), ...m4.scaleVector(GetNormalizedAnimVelocity(), ModelRadius * 0.95)]);
    segment.position = m4.translation(0, 2, 0);
}

function SetupLine() {
    let prog = createProgram(gl, LineVertexShaderSource, LineFragmentShaderSource);

    lineProgram = new ShaderProgram('Line', prog);
    lineProgram.Use();

    lineProgram.iAttribVertex = gl.getAttribLocation(prog, "position");
    lineProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    lineProgram.iSolidColor = gl.getUniformLocation(prog, "color");
}

function BuildLine() {
    line = new Line("Line", lineProgram);
    line.BufferData([...WorldOrigin, ...LightPosition])
}

function BuildSurface() {
    planeModel = new Model('Plane');
    planeModel.BufferData(planeXYZs, planeXYZs);
    planeModel.TextureBufferData(planeUVs);
    surface = new Model('Surface');
    let data = CreateSurfaceData();
    surface.BufferData(data[0], data[1]);
    surface.TextureBufferData(data[2]);
    sphereGeom = new Model('Sphere');
    sphereGeom.BufferData(CreateSphere(0.1), CreateSphere(0.1));
    sphereGeom.TextureBufferData(new Array(CreateSphere(0.1).length).fill(0));
}

function SetupSurface() {

    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    shProgram = new ShaderProgram('Basic', prog);
    shProgram.Use();

    shProgram.iAttribVertex = gl.getAttribLocation(prog, "position");
    shProgram.iTextureCoords2D = gl.getAttribLocation(prog, "textureCoord");

    shProgram.iNormalVertex = gl.getAttribLocation(prog, "normal");

    shProgram.iWorldInverseTranspose = gl.getUniformLocation(prog, "WorldInverseTranspose");
    shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");

    shProgram.iMatAmbientColor = gl.getUniformLocation(prog, "matAmbientColor");
    shProgram.iMatDiffuseColor = gl.getUniformLocation(prog, "matDiffuseColor");
    shProgram.iMatSpecularColor = gl.getUniformLocation(prog, "matSpecularColor");
    shProgram.iMatShininess = gl.getUniformLocation(prog, "matShininess");

    shProgram.iLSAmbientColor = gl.getUniformLocation(prog, "lsAmbientColor");
    shProgram.iLSDiffuseColor = gl.getUniformLocation(prog, "lsDiffuseColor");
    shProgram.iLSSpecularColor = gl.getUniformLocation(prog, "lsSpecularColor");

    shProgram.iLightDirection = gl.getUniformLocation(prog, "LightDirection");
    shProgram.iCamWorldPosition = gl.getUniformLocation(prog, "CamWorldPosition");

    shProgram.iTexture = gl.getUniformLocation(prog, "textureSampler");
    shProgram.iRotationPoint = gl.getUniformLocation(prog, "rotationPoint");
    shProgram.iRotationValue = gl.getUniformLocation(prog, "rotationValue");
    shProgram.iPointVizualizationPosition = gl.getUniformLocation(prog, "pointVizualizationPosition");
}


/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type Error is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 * The second and third parameters are strings that contain the
 * source code for the vertex shader and for the fragment shader.
 */
function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vShader);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}



window.onkeydown = (e) => {
    switch (e.keyCode) {
        case 65:
            texturePoint[0] += 0.01;
            break;
        case 68:
            texturePoint[0] -= 0.01;
            break;
        case 87:
            texturePoint[1] += 0.01;
            break;
        case 83:
            texturePoint[1] -= 0.01;
            break;
    }
    texturePoint[1] = Math.max(0.001, Math.min(texturePoint[1], 0.999))

    if (texturePoint[0] >= 1) {
        texturePoint[0] = 0.001;
    }
    else if (texturePoint[0] <= 0) {
        texturePoint[0] = 0.99;
    }
    draw();
}


let isLoadedTexture = false;

function LoadTexture() {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.crossOrigin = 'anonymus';

    image.src = "https://raw.githubusercontent.com/JuiceJune/VISUALIZATION-OF-GRAPHICAL-AND-GEOMETRIC-INFORMATION-LABS/cgw/texture.jpg";
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );

        SetupSurface();
        BuildSurface();

        SetupLine();
        BuildLine();

        SetupSegment();
        BuildSegment();


        draw()
    }
    return texture;
}


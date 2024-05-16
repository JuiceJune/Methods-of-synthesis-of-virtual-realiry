// Constructor
function ShaderProgram(name, program) {

    this.name = name;
    this.prog = program;

    this.iSolidColor = -1;
    this.iAttribVertex = -1;
    this.iNormalVertex = -1;
    this.iTextureCoords2D = -1;
    this.iTexture = -1;

    this.iModelViewProjectionMatrix = -1;
    this.iWorldInverseTranspose = -1;

    this.iLSAmbientColor = -1;
    this.iLSDiffuseColor = -1;
    this.iLSSpecularColor = -1;

    this.iMatAmbientColor = -1;
    this.iMatDiffuseColor = -1;
    this.iMatSpecularColor = -1;
    this.iMatShininess = -1;

    this.iLightDirection = -1;
    this.iCamWorldPosition = -1;

    this.iPointVizualizationPosition = -1;
    this.iRotationPoint = -1;
    this.iRotationValue = -1;

    this.Use = function () {
        gl.useProgram(this.prog);
    }
}
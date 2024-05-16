// Constructor
function Model(name) {
    let phiMax = Math.PI * 2;
    let phiMin = 0;
    let vMax = Math.PI * 0.5;
    let vMin = 0;

    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iTextureBuffer = gl.createBuffer();

    this.count = 0;
    this.countTexture = 0;

    this.BufferData = function (vertices, normals) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STREAM_DRAW);

        this.count = vertices.length / 3;
    }

    this.TextureBufferData = function (textureCoords) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STREAM_DRAW);

        this.countTexture = textureCoords.length / 2;
    }

    this.Draw = function (projectionMatrix, viewMatrix, background=false) {

        /*  the view matrix from the SimpleRotator object.*/
        let rotation = spaceball.getViewMatrix();

        let translation = m4.translation(World_X, World_Y, World_Z);

        let modelMatrix = m4.multiply(translation, rotation);

        /* Multiply the projection matrix times the modelview matrix to give the
           combined transformation matrix, and send that to the shader program. */
        let modelViewProjection = m4.multiply(projectionMatrix, m4.multiply(viewMatrix, modelMatrix));

        var worldInverseMatrix = m4.inverse(modelMatrix);
        var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);
        gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);
        if(background){
            gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, m4.identity());
        }
        gl.uniformMatrix4fv(shProgram.iWorldInverseTranspose, false, worldInverseTransposeMatrix);

        gl.uniform3fv(shProgram.iMatAmbientColor, AmbientColor);
        gl.uniform3fv(shProgram.iMatDiffuseColor, DiffuseColor);
        gl.uniform3fv(shProgram.iMatSpecularColor, SpecularColor);
        gl.uniform1f(shProgram.iMatShininess, Shininess);

        gl.uniform3fv(shProgram.iLSAmbientColor, [0.1, 0.1, 0.1]);
        gl.uniform3fv(shProgram.iLSDiffuseColor, [LightIntensity, LightIntensity, LightIntensity]);
        gl.uniform3fv(shProgram.iLSSpecularColor, [1, 1, 1]);

        gl.uniform3fv(shProgram.iCamWorldPosition, CameraPosition);
        gl.uniform3fv(shProgram.iLightDirection, GetDirLightDirection());

        gl.uniform2fv(shProgram.iRotationPoint, texturePoint);

        let point = CalculateCorrugatedSpherePoint(map(texturePoint[0], 0, 1, phiMin, phiMax), map(texturePoint[1], 0, 1, vMin, vMax));
        gl.uniform3fv(shProgram.iPointVizualizationPosition, [point.x, point.y, point.z]);
        gl.uniform1f(shProgram.iRotationValue, rotateValue);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);

        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iNormalVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iNormalVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
        gl.vertexAttribPointer(shProgram.iTextureCoords2D, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iTextureCoords2D);
        gl.uniform1i(shProgram.iTexture, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.count);
    }
    this.DrawPlane = function () {
        gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, m4.identity());
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.count);
    }
}
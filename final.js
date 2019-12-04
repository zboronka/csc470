"use strict";

var gl, program;
var vertices;

var mModel
var mView, cameraLoc;
var mPerspective, p;
var rights =  [0, 0, 0, 0, 0, 0, 0, 0, 0];
var middles = [0, 0, 0, 0, 0, 0, 0, 0]; 
var lefts =   [0, 0, 0, 0, 0, 0, 0, 0, 0];
var vLightPos;

window.onload = function() {
	var canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if(!gl) { alert("WebGL isn't available"); }

	resizeCanvas(canvas);

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	program = initShaders(gl, "vertex-shader", "fragment-shader");

	gl.useProgram(program);

	mModel = gl.getUniformLocation(program, "mModel");
	mView = gl.getUniformLocation(program, "mView");
	mPerspective = gl.getUniformLocation(program, "mPerspective");
	vLightPos = gl.getUniformLocation(program, "vLightPos");

	var text = loadTexture(gl, "cube.png");

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, text);
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

	rights[0] = translate( 2.5, 0.0, 0.0);
	rights[1] = translate( 2.5, 2.5, 0.0);
	rights[2] = translate( 2.5, 2.5, 2.5);
	rights[3] = translate( 2.5, 0.0, 2.5);
	rights[4] = translate( 2.5,-2.5, 2.5);
	rights[5] = translate( 2.5,-2.5, 0.0);
	rights[6] = translate( 2.5,-2.5,-2.5);
	rights[7] = translate( 2.5, 0.0,-2.5);
	rights[8] = translate( 2.5, 2.5,-2.5);

	middles[0] = translate( 0.0, 2.5, 0.0);
	middles[1] = translate( 0.0, 2.5, 2.5);
	middles[2] = translate( 0.0, 0.0, 2.5);
	middles[3] = translate( 0.0,-2.5, 2.5);
	middles[4] = translate( 0.0,-2.5, 0.0);
	middles[5] = translate( 0.0,-2.5,-2.5);
	middles[6] = translate( 0.0, 0.0,-2.5);
	middles[7] = translate( 0.0, 2.5,-2.5);

	lefts[0] = translate(-2.5, 0.0, 0.0);
	lefts[1] = translate(-2.5, 2.5, 0.0);
	lefts[2] = translate(-2.5, 2.5, 2.5);
	lefts[3] = translate(-2.5, 0.0, 2.5);
	lefts[4] = translate(-2.5,-2.5, 2.5);
	lefts[5] = translate(-2.5,-2.5, 0.0);
	lefts[6] = translate(-2.5,-2.5,-2.5);
	lefts[7] = translate(-2.5, 0.0,-2.5);
	lefts[8] = translate(-2.5, 2.5,-2.5);

	cameraLoc = vec3(0,0,20);
	p = perspective(30, canvas.width/canvas.height, .1, 1000);

	gl.uniformMatrix4fv(mView, false, flatten(lookAt(cameraLoc,vec3(0,0,0),vec3(0,1,0))));
	gl.uniformMatrix4fv(mPerspective, false, flatten(p));
	gl.uniform3fv(vLightPos, new Float32Array([4.0, 0.0, 10.0]));

	window.requestAnimationFrame(loop);
}

function loop() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	cameraLoc = vec3(mult(rotateY(1), vec4(cameraLoc)));
	gl.uniformMatrix4fv(mView, false, flatten(lookAt(cameraLoc,vec3(0,0,0),vec3(0,1,0))));

	for(var cube in rights) {
		rights[cube] = mult(rotateX(1), rights[cube]);
		gl.uniformMatrix4fv(mModel, false, flatten(rights[cube]));
		drawcube();
	}
	for(var cube in middles) {
		gl.uniformMatrix4fv(mModel, false, flatten(middles[cube]));
		drawcube();
	}
	for(var cube in lefts) {
		gl.uniformMatrix4fv(mModel, false, flatten(lefts[cube]));
		drawcube();
	}

	window.requestAnimationFrame(loop);
}

function drawcube() {
	vertices = [];
	for(var i = 0; i < 6; i++) {
		vertices = vertices.concat(cubevertices[i*6],   normals[i], UVCoords[i*4+1]);
		vertices = vertices.concat(cubevertices[i*6+1], normals[i], UVCoords[i*4+0]);
		vertices = vertices.concat(cubevertices[i*6+2], normals[i], UVCoords[i*4+3]);
		vertices = vertices.concat(cubevertices[i*6+3], normals[i], UVCoords[i*4+1]);
		vertices = vertices.concat(cubevertices[i*6+4], normals[i], UVCoords[i*4+3]);
		vertices = vertices.concat(cubevertices[i*6+5], normals[i], UVCoords[i*4+2]);
	}
	vertices = flatten(vertices);

	var bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	var vPos = gl.getAttribLocation(program, "vPos");
	gl.vertexAttribPointer(vPos, 3, gl.FLOAT, false, 32, 0);
	gl.enableVertexAttribArray(vPos);

	var vNormal = gl.getAttribLocation(program, "vNormal");
	gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 32, 12);
	gl.enableVertexAttribArray(vNormal);

	var vUV = gl.getAttribLocation(program, "vUV");
	gl.vertexAttribPointer(vUV, 2, gl.FLOAT, false, 32, 24);
	gl.enableVertexAttribArray(vUV);

	gl.drawArrays(gl.TRIANGLES, 0, vertices.length/8);
}

function render() {
	gl.drawArrays(gl.TRIANGLES, 0, vertices.length/6);
}

// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Because images have to be download over the internet
	// they might take a moment until they are ready.
	// Until then put a single pixel in the texture so we can
	// use it immediately. When the image has finished downloading
	// we'll update the texture with the contents of the image.
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
				  width, height, border, srcFormat, srcType,
				  pixel);

	const image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
					  srcFormat, srcType, image);

		// WebGL1 has different requirements for power of 2 images
		// vs non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			// Yes, it's a power of 2. Generate mips.
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			// No, it's not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	image.src = url;

	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
} 

function resizeCanvas(canvas) {
	// look up the size the canvas is being displayed
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;

	// If it's resolution does not match change it
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
		return true;
	}

	return false;
}

"use strict";

var gl, program;
var vertices;

var mModel
var mView, cameraLoc;
var mPerspective, p;
var vViewPos;
var rights =  [0, 0, 0, 0, 0, 0, 0, 0, 0];
var middles = [0, 0, 0, 0, 0, 0, 0, 0, 0]; 
var lefts =   [0, 0, 0, 0, 0, 0, 0, 0, 0];
var vLightPos;

var Ft = 810, ft = 810, Rt = 810, rt = 810, Bt = 810, bt = 810, Lt = 810, lt = 810, Dt = 810, dt = 810, Ut = 810, ut = 810;
var moving = false, prime = false, mawsedown = false;
var oldX = 0, dirX = 0;

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
	vViewPos = gl.getUniformLocation(program, "vViewPos");

	var text = loadTexture(gl, "cube.png");

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, text);
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
	/***********************
	 * ┌─────┬─────┬─────┐ *
	 * │  8  │  1  │  2  │ *
	 * ├─────┼─────┼─────┤ *
	 * │  7  │  0  │  3  │ *
	 * ├─────┼─────┼─────┤ *
	 * │  6  │  5  │  4  │ *
	 * └─────┴─────┴─────┘ *
	 * *********************/
	rights[0] = translate( 2.5, 0.0, 0.0);
	rights[1] = translate( 2.5, 2.5, 0.0);
	rights[2] = translate( 2.5, 2.5,-2.5);
	rights[3] = translate( 2.5, 0.0,-2.5);
	rights[4] = translate( 2.5,-2.5,-2.5);
	rights[5] = translate( 2.5,-2.5, 0.0);
	rights[6] = translate( 2.5,-2.5, 2.5);
	rights[7] = translate( 2.5, 0.0, 2.5);
	rights[8] = translate( 2.5, 2.5, 2.5);

	middles[0] = scalem(0,0,0);
	middles[1] = translate( 0.0, 2.5, 0.0);
	middles[2] = translate( 0.0, 2.5,-2.5);
	middles[3] = translate( 0.0, 0.0,-2.5);
	middles[4] = translate( 0.0,-2.5,-2.5);
	middles[5] = translate( 0.0,-2.5, 0.0);
	middles[6] = translate( 0.0,-2.5, 2.5);
	middles[7] = translate( 0.0, 0.0, 2.5);
	middles[8] = translate( 0.0, 2.5, 2.5);

	lefts[0] = translate(-2.5, 0.0, 0.0);
	lefts[1] = translate(-2.5, 2.5, 0.0);
	lefts[2] = translate(-2.5, 2.5,-2.5);
	lefts[3] = translate(-2.5, 0.0,-2.5);
	lefts[4] = translate(-2.5,-2.5,-2.5);
	lefts[5] = translate(-2.5,-2.5, 0.0);
	lefts[6] = translate(-2.5,-2.5, 2.5);
	lefts[7] = translate(-2.5, 0.0, 2.5);
	lefts[8] = translate(-2.5, 2.5, 2.5);

	cameraLoc = vec3(mult(rotateY(45), vec4(0,0,20,0)));
	p = perspective(30, canvas.width/canvas.height, .1, 1000);

	gl.uniformMatrix4fv(mView, false, flatten(lookAt(cameraLoc,vec3(0,0,0),vec3(0,1,0))));
	gl.uniformMatrix4fv(mPerspective, false, flatten(p));
	gl.uniform3fv(vLightPos, new Float32Array([-4.0, 0.0, 10.0]));
	gl.uniform3fv(vViewPos, cameraLoc);

	window.requestAnimationFrame(loop);
}

function loop() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	if(mawsedown) {
		cameraLoc = dirX > 0 ? vec3(mult(rotateY(1), vec4(cameraLoc))) : cameraLoc = vec3(mult(rotateY(-1), vec4(cameraLoc)));
		gl.uniformMatrix4fv(mView, false, flatten(lookAt(cameraLoc,vec3(0,0,0),vec3(0,1,0))));
		gl.uniform3fv(vViewPos, cameraLoc);
	}

	move();

	window.requestAnimationFrame(loop);
}

function move() {
	for(var cube in rights) {
		if(Rt < 810) {
			rights[cube] = mult(rotateX(-1), rights[cube]);
			Rt++;
			moving = Rt != 810;
		}
		if(rt < 810) {
			rights[cube] = mult(rotateX(1), rights[cube]);
			rt++;
			moving = rt != 810;
		}
		if(cube == 8 || cube == 1 || cube == 2) {
			if(Ut < 810) {
				rights[cube] = mult(rotateY(-1), rights[cube]);
				Ut++;
				moving = Ut != 810;
			}
			if(ut < 810) {
				rights[cube] = mult(rotateY(1), rights[cube]);
				ut++;
				moving = ut != 810;
			}
		}
		if(cube == 6 || cube == 5 || cube == 4) {
			if(Dt < 810) {
				rights[cube] = mult(rotateY(1), rights[cube]);
				Dt++;
				moving = Dt != 810;
			}
			if(dt < 810) {
				rights[cube] = mult(rotateY(-1), rights[cube]);
				dt++;
				moving = dt != 810;
			}
		}
		if(cube == 8 || cube == 7 || cube == 6) {
			if(Ft < 810) {
				rights[cube] = mult(rotateZ(1), rights[cube]);
				Ft++;
				moving = Ft != 810;
			}
			if(ft < 810) {
				rights[cube] = mult(rotateZ(-1), rights[cube]);
				ft++;
				moving = ft != 810;
			}
		}
		if(cube == 2 || cube == 3 || cube == 4) {
			if(Bt < 810) {
				rights[cube] = mult(rotateZ(-1), rights[cube]);
				Bt++;
				moving = Bt != 810;
			}
			if(bt < 810) {
				rights[cube] = mult(rotateZ(1), rights[cube]);
				bt++;
				moving = bt != 810;
			}
		}

		gl.uniformMatrix4fv(mModel, false, flatten(rights[cube]));
		drawcube();
	}

	for(var cube in middles) {
		if(cube == 8 || cube == 1 || cube == 2) {
			if(Ut < 810) {
				middles[cube] = mult(rotateY(-1), middles[cube]);
				Ut++;
				moving = Ut != 810;
			}
			if(ut < 810) {
				middles[cube] = mult(rotateY(1), middles[cube]);
				ut++;
				moving = ut != 810;
			}
		}
		if(cube == 6 || cube == 5 || cube == 4) {
			if(Dt < 810) {
				middles[cube] = mult(rotateY(1), middles[cube]);
				Dt++;
				moving = Dt != 810;
			}
			if(dt < 810) {
				middles[cube] = mult(rotateY(-1), middles[cube]);
				dt++;
				moving = dt != 810;
			}
		}
		if(cube == 8 || cube == 7 || cube == 6) {
			if(Ft < 810) {
				middles[cube] = mult(rotateZ(1), middles[cube]);
				Ft++;
				moving = Ft != 810;
			}
			if(ft < 810) {
				middles[cube] = mult(rotateZ(-1), middles[cube]);
				ft++;
				moving = ft != 810;
			}
		}
		if(cube == 2 || cube == 3 || cube == 4) {
			if(Bt < 810) {
				middles[cube] = mult(rotateZ(-1), middles[cube]);
				Bt++;
				moving = Bt != 810;
			}
			if(bt < 810) {
				middles[cube] = mult(rotateZ(1), middles[cube]);
				bt++;
				moving = bt != 810;
			}
		}

		gl.uniformMatrix4fv(mModel, false, flatten(middles[cube]));
		drawcube();
	}

	for(var cube in lefts) {
		if(Lt < 810) {
			lefts[cube] = mult(rotateX(1), lefts[cube]);
			Lt++;
			moving = Lt != 810;
		}
		if(lt < 810) {
			lefts[cube] = mult(rotateX(-1), lefts[cube]);
			lt++;
			moving = lt != 810;
		}
		if(cube == 8 || cube == 1 || cube == 2) {
			if(Ut < 810) {
				lefts[cube] = mult(rotateY(-1), lefts[cube]);
				Ut++;
				moving = Ut != 810;
			}
			if(ut < 810) {
				lefts[cube] = mult(rotateY(1), lefts[cube]);
				ut++;
				moving = ut != 810;
			}
		}
		if(cube == 6 || cube == 5 || cube == 4) {
			if(Dt < 810) {
				lefts[cube] = mult(rotateY(1), lefts[cube]);
				Dt++;
				moving = Dt != 810;
			}
			if(dt < 810) {
				lefts[cube] = mult(rotateY(-1), lefts[cube]);
				dt++;
				moving = dt != 810;
			}
		}
		if(cube == 8 || cube == 7 || cube == 6) {
			if(Ft < 810) {
				lefts[cube] = mult(rotateZ(1), lefts[cube]);
				Ft++;
				moving = Ft != 810;
			}
			if(ft < 810) {
				lefts[cube] = mult(rotateZ(-1), lefts[cube]);
				ft++;
				moving = ft != 810;
			}
		}
		if(cube == 2 || cube == 3 || cube == 4) {
			if(Bt < 810) {
				lefts[cube] = mult(rotateZ(-1), lefts[cube]);
				Bt++;
				moving = Bt != 810;
			}
			if(bt < 810) {
				lefts[cube] = mult(rotateZ(1), lefts[cube]);
				bt++;
				moving = bt != 810;
			}
		}

		gl.uniformMatrix4fv(mModel, false, flatten(lefts[cube]));
		drawcube();
	}
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

document.addEventListener('mousedown', function() {
	mawsedown = true;
});

document.addEventListener('mouseup', function() {
	mawsedown = false;
});

document.addEventListener('keydown', function() {
	if(event.code=="KeyP") {
		prime = !prime;
	}
	if(!moving) {
		if(event.code=="KeyR") {
			right();
		}

		if(event.code=="KeyL") {
			left();
		}

		if(event.code=="KeyU") {
			up();
		}

		if(event.code=="KeyD") {
			down();
		}

		if(event.code=="KeyF") {
			front();
		}

		if(event.code=="KeyB") {
			back();
		}
	}
});

function right() {
	if(!prime) {
		Rt = 0;
		moving = true;

		var temp = rights.shift();
		for(var i = 0; i < 2; i++) {
			rights.unshift(rights.pop());
		}
		rights.unshift(temp);
	}
	else {
		rt = 0;
		moving = true;

		var temp = rights.shift();
		for(var i = 0; i < 2; i++) {
			rights.push(rights.shift());
		}
		rights.unshift(temp);
	}
}

function left() {
	if(!prime) {
		Lt = 0;
		moving = true;

		var temp = lefts.shift();
		for(var i = 0; i < 2; i++) {
			lefts.push(lefts.shift());
		}
		lefts.unshift(temp);
	}
	else {
		lt = 0;
		moving = true;

		var temp = lefts.shift();
		for(var i = 0; i < 2; i++) {
			lefts.unshift(lefts.pop());
		}
		lefts.unshift(temp);
	}
}

function up() {
	if(!prime) {
		Ut = 0;
		moving = true;

		var temp8 = []; temp8.push(rights[8]); temp8.push(rights[1]); temp8.push(rights[2]);
		var temp1 = []; temp1.push(middles[8]); temp1.push(middles[1]); temp1.push(middles[2]);
		var temp2 = []; temp2.push(lefts[8]); temp2.push(lefts[1]); temp2.push(lefts[2]);

		lefts[8] = temp8[0]; middles[8] = temp8[1]; rights[8] = temp8[2];
		lefts[1] = temp1[0]; middles[1] = temp1[1]; rights[1] = temp1[2];
		lefts[2] = temp2[0]; middles[2] = temp2[1]; rights[2] = temp2[2];
	}
	else {
		ut = 0;
		moving = true;

		var temp8 = []; temp8.push(lefts[8]); temp8.push(lefts[1]); temp8.push(lefts[2]);
		var temp1 = []; temp1.push(middles[8]); temp1.push(middles[1]); temp1.push(middles[2]);
		var temp2 = []; temp2.push(rights[8]); temp2.push(rights[1]); temp2.push(rights[2]);

		rights[8] = temp8[0]; middles[8] = temp8[1]; lefts[8] = temp8[2];
		rights[1] = temp1[0]; middles[1] = temp1[1]; lefts[1] = temp1[2];
		rights[2] = temp2[0]; middles[2] = temp2[1]; lefts[2] = temp2[2];
	}
}

function down() {
	if(!prime) {
		Dt = 0;
		moving = true;

		var temp6 = []; temp6.push(lefts[6]); temp6.push(lefts[5]); temp6.push(lefts[4]);
		var temp5 = []; temp5.push(middles[6]); temp5.push(middles[5]); temp5.push(middles[4]);
		var temp4 = []; temp4.push(rights[6]); temp4.push(rights[5]); temp4.push(rights[4]);

		rights[6] = temp6[0]; middles[6] = temp6[1]; lefts[6] = temp6[2];
		rights[5] = temp5[0]; middles[5] = temp5[1]; lefts[5] = temp5[2];
		rights[4] = temp4[0]; middles[4] = temp4[1]; lefts[4] = temp4[2];
	}
	else {
		dt = 0;
		moving = true;

		var temp6 = []; temp6.push(rights[6]); temp6.push(rights[5]); temp6.push(rights[4]);
		var temp5 = []; temp5.push(middles[6]); temp5.push(middles[5]); temp5.push(middles[4]);
		var temp4 = []; temp4.push(lefts[6]); temp4.push(lefts[5]); temp4.push(lefts[4]);

		lefts[6] = temp6[0]; middles[6] = temp6[1]; rights[6] = temp6[2];
		lefts[5] = temp5[0]; middles[5] = temp5[1]; rights[5] = temp5[2];
		lefts[4] = temp4[0]; middles[4] = temp4[1]; rights[4] = temp4[2];
	}
}

function front() {
	if(!prime) {
		Ft = 0;
		moving = true;

		var temp8 = []; temp8.push(rights[8]); temp8.push(rights[7]); temp8.push(rights[6]);
		var temp7 = []; temp7.push(middles[8]); temp7.push(middles[7]); temp7.push(middles[6]);
		var temp6 = []; temp6.push(lefts[8]); temp6.push(lefts[7]); temp6.push(lefts[6]);

		lefts[8] = temp8[0]; middles[8] = temp8[1]; rights[8] = temp8[2];
		lefts[7] = temp7[0]; middles[7] = temp7[1]; rights[7] = temp7[2];
		lefts[6] = temp6[0]; middles[6] = temp6[1]; rights[6] = temp6[2];
	}
	else {
		ft = 0;
		moving = true;

		var temp8 = []; temp8.push(lefts[8]); temp8.push(lefts[7]); temp8.push(lefts[6]);
		var temp7 = []; temp7.push(middles[8]); temp7.push(middles[7]); temp7.push(middles[6]);
		var temp6 = []; temp6.push(rights[8]); temp6.push(rights[7]); temp6.push(rights[6]);

		rights[8] = temp8[0]; middles[8] = temp8[1]; lefts[8] = temp8[2];
		rights[7] = temp7[0]; middles[7] = temp7[1]; lefts[7] = temp7[2];
		rights[6] = temp6[0]; middles[6] = temp6[1]; lefts[6] = temp6[2];
	}
}

function back() {
	if(!prime) {
		Bt = 0;
		moving = true;

		var temp2 = []; temp2.push(lefts[2]); temp2.push(lefts[3]); temp2.push(lefts[4]);
		var temp3 = []; temp3.push(middles[2]); temp3.push(middles[3]); temp3.push(middles[4]);
		var temp4 = []; temp4.push(rights[2]); temp4.push(rights[3]); temp4.push(rights[4]);

		rights[2] = temp2[0]; middles[2] = temp2[1]; lefts[2] = temp2[2];
		rights[3] = temp3[0]; middles[3] = temp3[1]; lefts[3] = temp3[2];
		rights[4] = temp4[0]; middles[4] = temp4[1]; lefts[4] = temp4[2];
	}
	else {
		bt = 0;
		moving = true;

		var temp2 = []; temp2.push(rights[2]); temp2.push(rights[3]); temp2.push(rights[4]);
		var temp3 = []; temp3.push(middles[2]); temp3.push(middles[3]); temp3.push(middles[4]);
		var temp4 = []; temp4.push(lefts[2]); temp4.push(lefts[3]); temp4.push(lefts[4]);

		lefts[2] = temp2[0]; middles[2] = temp2[1]; rights[2] = temp2[2];
		lefts[3] = temp3[0]; middles[3] = temp3[1]; rights[3] = temp3[2];
		lefts[4] = temp4[0]; middles[4] = temp4[1]; rights[4] = temp4[2];
	}
}

document.addEventListener('mousemove', function() {
	dirX = oldX - event.clientX;
	oldX = event.clientX;
}, false);

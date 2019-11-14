var canvas;
var gl;

var program;
var lightProgram;

var mProjection;
var mView;
var mModel;

var vPosition;
var vNormal;
var fScale;
var vTrans;
var fThetaX;
var fThetaY;
var fThetaZ;

var vObjColor;
var vLightColor;
var vLightPos;
var vViewPos;
var vTexCoord;

var points = [];
var scales = [];
var trans = [];
var normals = [];
var texs = [];

var vertices = [
	vec3( -1,  1, 1 ),
	vec3( -1, -1, 1 ),
	vec3(  1,  1, 1 ),
	vec3(  1, -1, 1 ),
	vec3( -1,  1, -1 ),
	vec3( -1, -1, -1 ),
	vec3(  1,  1, -1 ),
	vec3(  1, -1, -1 ),
];

var norms = [
	vec3( 0,  0,  1),  // FRONT
	vec3( 0,  1,  0),  // UP
	vec3( 1,  0,  0),  // RIGHT
	vec3( 0, -1,  0),  // DOWN
	vec3(-1,  0,  0),  // LEFT
	vec3( 0,  0, -1)   // BACK
];

var view = [vec4(1, 0, 0, 0),
	        vec4(0, 1, 0, 0),
	        vec4(0, 0, 1, 0),
	        vec4(0, 0, 0, 1)];
view.matrix = true;

var cameraPos = vec3(0,0,0);
var cameraDir = vec3(0,0,-1);
var cameraUp = vec3(0,1,0);
var cameraRight = vec3(1,0,0);

var yaw = 90;
var pitch = 180;
var roll = 0;

var cubeX = 0;
var cubeY = 0;
var cubeZ = 0;

var cubeXinc = 0;
var cubeYinc = 0;
var cubeZinc = 0;

var oldX = 0;
var oldY = 0;

var model = [vec4(1, 0, 0, 0),
	         vec4(0, 1, 0, 0),
	         vec4(0, 0, 1, -5),
	         vec4(0, 0, 0, 1)];
model.matrix=true;
var lightmodel = [vec4(1, 0, 0, 0.5),
	              vec4(0, 1, 0, 0.5),
	              vec4(0, 0, 1, -3),
	              vec4(0, 0, 0, 1)];
lightmodel.matrix=true;

var squarelight = new Float32Array([-0.1,  0.1,  0.1, -0.1, -0.1,  0.1,  0.1, -0.1,  0.1,  -0.1,  0.1,  0.1,  0.1, -0.1,  0.1,  0.1,  0.1,  0.1,
                                     0.1,  0.1,  0.1,  0.1,  0.1, -0.1, -0.1,  0.1,  0.1,  -0.1,  0.1, -0.1, -0.1,  0.1,  0.1,  0.1,  0.1, -0.1,
                                     0.1,  0.1,  0.1,  0.1, -0.1,  0.1,  0.1, -0.1, -0.1,   0.1,  0.1,  0.1,  0.1, -0.1, -0.1,  0.1,  0.1, -0.1,
                                     0.1, -0.1,  0.1, -0.1, -0.1,  0.1, -0.1, -0.1, -0.1,   0.1, -0.1,  0.1, -0.1, -0.1, -0.1,  0.1, -0.1, -0.1,
                                    -0.1,  0.1,  0.1, -0.1,  0.1, -0.1, -0.1, -0.1,  0.1,  -0.1, -0.1,  0.1, -0.1,  0.1, -0.1, -0.1, -0.1, -0.1,
                                    -0.1,  0.1, -0.1,  0.1,  0.1, -0.1,  0.1, -0.1, -0.1,  -0.1,  0.1, -0.1,  0.1, -0.1, -0.1, -0.1, -0.1, -0.1]);

lightcolor = vec3(1,1,1);
objcolor = vec3(1,1,1);

var lev = 2;
var check = false;

var text, nmap;
var textImage = "alien.jpg";
var mapImage = "alien_normal.jpg";

document.getElementById("level").onchange = function() {
	lev = document.getElementById("level").value;
};

document.getElementById("rotate").onchange = function() {
	check = document.getElementById("rotate").checked;
};

document.getElementById("thetaX").onchange = function() {
	cubeXinc = parseInt(document.getElementById("thetaX").value, 10) / 100;
};

document.getElementById("thetaY").onchange = function() {
	cubeYinc = parseInt(document.getElementById("thetaY").value, 10) / 100;
};

document.getElementById("thetaZ").onchange = function() {
	cubeZinc = parseInt(document.getElementById("thetaZ").value, 10) / 100;
};

document.addEventListener('keydown', function() {
	speed = .1;
	if(event.code=="ArrowUp") {
		cameraPos = add(cameraPos, scale(speed, cameraDir));
		view = lookAt(cameraPos, add(cameraPos, cameraDir), cameraUp);
		gl.uniformMatrix4fv(mView, false, flatten(view)); 
	}

	if(event.code=="ArrowDown") {
		cameraPos = subtract(cameraPos, scale(speed, cameraDir));
		view = lookAt(cameraPos, add(cameraPos, cameraDir), cameraUp);
		gl.uniformMatrix4fv(mView, false, flatten(view)); 
	}
	
	if(event.code=="ArrowLeft") {
		cameraPos = subtract(cameraPos, scale(speed, cameraRight));
		view = lookAt(cameraPos, add(cameraPos, cameraDir), cameraUp);
		gl.uniformMatrix4fv(mView, false, flatten(view)); 
	}
	
	if(event.code=="ArrowRight") {
		cameraPos = add(cameraPos, scale(speed, cameraRight));
		view = lookAt(cameraPos, add(cameraPos, cameraDir), cameraUp);
		gl.uniformMatrix4fv(mView, false, flatten(view)); 
	}

	if(event.code=="KeyA") {
		roll++;
		cameraRight[0] = Math.cos(radians(roll));
		cameraRight[1] = Math.sin(radians(roll));
		cameraRight[2] = Math.cos(radians(roll));

		cameraUp = cross(cameraDir, cameraRight);

		view = lookAt(cameraPos, add(cameraPos, cameraDir), cameraUp);
		gl.uniformMatrix4fv(mView, false, flatten(view));
	}
}, false);

document.addEventListener('mousemove', function() {
	yaw -= oldX - event.clientX;
	pitch -= oldY - event.clientY;

	oldX = event.clientX;
	oldY = event.clientY;

	cameraDir[0] = Math.cos(radians(yaw)) * Math.cos(radians(pitch));
	cameraDir[1] = Math.sin(radians(pitch));
	cameraDir[2] = Math.sin(radians(yaw)) * Math.cos(radians(pitch));

	cameraUp[0] = Math.cos(radians(yaw)) * Math.cos(radians(pitch-90));
	cameraUp[1] = Math.sin(radians(pitch-90));
	cameraUp[2] = Math.sin(radians(yaw)) * Math.cos(radians(pitch-90));

	var oldx = cameraDir[0];
	var oldcx = cameraUp[0];

	cameraDir[0] = cameraDir[0] * Math.cos(radians(roll)) - cameraDir[1] * Math.sin(radians(roll));
	cameraDir[1] = oldx * Math.sin(radians(roll)) + cameraDir[1] * Math.cos(radians(roll));

	cameraUp[0] = cameraUp[0] * Math.cos(radians(roll)) - cameraUp[1] * Math.sin(radians(roll));
	cameraUp[1] = oldcx * Math.sin(radians(roll)) + cameraUp[1] * Math.cos(radians(roll));

	cameraRight = cross(cameraDir, cameraUp);

	view = lookAt(cameraPos, add(cameraPos, cameraDir), cameraUp);
	gl.uniformMatrix4fv(mView, false, flatten(view));
}, false);

document.addEventListener('click', function() {
	oldX = event.clientX;
	oldY = event.clientY;

	yaw = 90;
	pitch = 180;
	roll = 0;

	cameraPos = vec3(0,0,0);
	cameraDir = vec3(0,0,-1);
	cameraUp = vec3(0,1,0);
	cameraRight = vec3(1,0,0);

	view = lookAt(cameraPos, add(cameraPos, cameraDir), cameraUp);
	gl.uniformMatrix4fv(mView, false, flatten(view));
}, false);

function loop() {
	cubeX += cubeXinc;
	cubeY += cubeYinc;
	cubeZ += cubeZinc;

	gl.uniform1f(fThetaX, cubeX);
	gl.uniform1f(fThetaY, cubeY);
	gl.uniform1f(fThetaZ, cubeZ);
	draw(lev);
	window.requestAnimationFrame(loop);
}

window.onload = function() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers
	
	lightProgram = initShaders(gl, "light-v-shader", "light-f-shader");
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
	
	gl.useProgram(lightProgram);

	var lmodel = gl.getUniformLocation(lightProgram, "model");
	var lview = gl.getUniformLocation(lightProgram, "view");
	var lpers = gl.getUniformLocation(lightProgram, "perspective");

	vLightPos = gl.getUniformLocation(lightProgram, "vLightPos");

	gl.uniformMatrix4fv(lmodel, false, flatten(lightmodel));  
	gl.uniformMatrix4fv(lview, false, flatten(view));  
	gl.uniformMatrix4fv(lpers, false, flatten(flatten(perspective(30, 1000/700, .1, 1000))));  

	gl.uniform3fv(vLightPos, vec3(0.5, 0.5, -3));

	gl.useProgram(program);

	text = loadTexture(gl, textImage);
	nmap = loadTexture(gl, mapImage);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, text);
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, nmap);
	gl.uniform1i(gl.getUniformLocation(program, "normalmap"), 1);

	// Load vertex shader variable locations
	mProjection = gl.getUniformLocation(program, "mProjection");
	mView = gl.getUniformLocation(program, "mView");
	mModel = gl.getUniformLocation(program, "mModel");
    vPosition = gl.getAttribLocation(program, "vPosition");
	vNormal = gl.getAttribLocation(program, "vNormal");
	vTexCoord = gl.getAttribLocation(program, "vTexCoord");
	fScale = gl.getAttribLocation(program, "fScale");
	vTrans = gl.getAttribLocation(program, "vTrans");
	fThetaX = gl.getUniformLocation(program, "fThetaX");
	fThetaY = gl.getUniformLocation(program, "fThetaY");
	fThetaZ = gl.getUniformLocation(program, "fThetaZ");

	// Load fragment shader variable locations
	vObjColor = gl.getUniformLocation(program, "vObjColor");
	vLightColor = gl.getUniformLocation(program, "vLightColor");
	vViewPos = gl.getUniformLocation(program, "vViewPos");

	gl.uniform3fv(vObjColor, objcolor);
	gl.uniform3fv(vLightColor, lightcolor);
	gl.uniform3fv(vViewPos, vec3(0,0,0));

	gl.uniformMatrix4fv(mProjection, false, flatten(perspective(30, 1000/700, .1, 1000))); 
	gl.uniformMatrix4fv(mView, false, flatten(view)); 
	gl.uniformMatrix4fv(mModel, false, flatten(model));

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	draw(2);
	loop();
}

function draw(count) {
	points = [];
	scales = [];
	trans = [];
	normals = [];
	texs = [];

    gl.clear( gl.COLOR_BUFFER_BIT );

	gl.useProgram(lightProgram);

	var lview = gl.getUniformLocation(lightProgram, "view");
	var col = gl.getUniformLocation(lightProgram, "vLightColor");

	gl.uniformMatrix4fv(lview, false, flatten(view));  
	gl.uniform3fv(col, lightcolor);

	var bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferData(gl.ARRAY_BUFFER, squarelight, gl.STATIC_DRAW);

	var vPos = gl.getAttribLocation(lightProgram, "vPos");
	gl.vertexAttribPointer(vPos, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPos);

	gl.drawArrays(gl.TRIANGLES, 0, squarelight.length/3);

	gl.useProgram(program);
	sierpinski(vec3(0,0,0), count, 0);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texs), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(scales), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    gl.vertexAttribPointer( fScale, 1, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( fScale );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trans), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    gl.vertexAttribPointer(vTrans, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTrans);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

	gl.uniform3fv(vViewPos, vec3(view[0][3],view[1][3],view[2][3]));

    gl.drawArrays(check ? gl.LINES : gl.TRIANGLES, 0, points.length);
}

function square(transform, scale) {
	scales.push(scale, scale, scale, scale, scale, scale);
	points.push(vertices[0], vertices[1], vertices[2], vertices[1], vertices[2], vertices[3]);
	trans.push(transform, transform, transform, transform, transform, transform);
}

function cube(transform, scale) {
	scales.push(scale, scale, scale, scale, scale, scale,
	            scale, scale, scale, scale, scale, scale,
	            scale, scale, scale, scale, scale, scale,
	            scale, scale, scale, scale, scale, scale,
	            scale, scale, scale, scale, scale, scale,
	            scale, scale, scale, scale, scale, scale);
	points.push(vertices[0], vertices[1], vertices[2], vertices[1], vertices[3], vertices[2],  // FRONT
	            vertices[4], vertices[0], vertices[6], vertices[0], vertices[2], vertices[6],  // UP
	            vertices[2], vertices[3], vertices[6], vertices[3], vertices[7], vertices[6],  // RIGHT
	            vertices[1], vertices[5], vertices[3], vertices[5], vertices[7], vertices[3],  // DOWN
	            vertices[4], vertices[5], vertices[0], vertices[5], vertices[1], vertices[0],  // LEFT
	            vertices[6], vertices[7], vertices[4], vertices[7], vertices[5], vertices[4]); // BACK
	trans.push(transform, transform, transform, transform, transform, transform,
	           transform, transform, transform, transform, transform, transform,
	           transform, transform, transform, transform, transform, transform,
	           transform, transform, transform, transform, transform, transform,
	           transform, transform, transform, transform, transform, transform,
	           transform, transform, transform, transform, transform, transform);
	for(i = 0; i < 6; i++) {
		for(j = 0; j < 6; j++) {
			texs.push(0.0,1.0, 0.0,0.0, 1.0,1.0, 0.0,0.0, 1.0,0.0, 1.0,1.0);
		}
	}

	for(i = 0; i < 6; i++) {
		for(j = 0; j < 6; j++) {
			normals.push(norms[i]);
		}
	}
}

function sierpinski(t, count, level) {
	if (count == 1) {
		cube(t, level);
	}
	else {
		cube(t, level);

		count--;
		level++;

		var div = (2/Math.pow(3, level));

		/*****************
		 * Comment format
		 * X Y Z
		 * U = Up
		 * D = Down
		 * R = Right
		 * L = Left
		 * F = Front
		 * B = Back
		 * C = Center
		 *****************/
		sierpinski(vec3(t[0], t[1]+div, t[2]), count, level);         // C U C
		sierpinski(vec3(t[0], t[1]+div, t[2]+div), count, level);     // C U F
		sierpinski(vec3(t[0], t[1]+div, t[2]-div), count, level);     // C U B

		sierpinski(vec3(t[0]+div, t[1]+div, t[2]), count, level);     // R U C
		sierpinski(vec3(t[0]+div, t[1]+div, t[2]+div), count, level); // R U F
		sierpinski(vec3(t[0]+div, t[1]+div, t[2]-div), count, level); // R U B

		sierpinski(vec3(t[0]+div, t[1], t[2]), count, level);         // R C C
		sierpinski(vec3(t[0]+div, t[1], t[2]+div), count, level);     // R C F
		sierpinski(vec3(t[0]+div, t[1], t[2]-div), count, level);     // R C B

		sierpinski(vec3(t[0]+div, t[1]-div, t[2]), count, level);     // R D C
		sierpinski(vec3(t[0]+div, t[1]-div, t[2]+div), count, level); // R D F
		sierpinski(vec3(t[0]+div, t[1]-div, t[2]-div), count, level); // R D B

		sierpinski(vec3(t[0], t[1]-div, t[2]), count, level);         // C D C
		sierpinski(vec3(t[0], t[1]-div, t[2]+div), count, level);     // C D F
		sierpinski(vec3(t[0], t[1]-div, t[2]-div), count, level);     // C D B

		sierpinski(vec3(t[0]-div, t[1]-div, t[2]), count, level);     // L D C
		sierpinski(vec3(t[0]-div, t[1]-div, t[2]+div), count, level); // L D F
		sierpinski(vec3(t[0]-div, t[1]-div, t[2]-div), count, level); // L D B

		sierpinski(vec3(t[0]-div, t[1], t[2]), count, level);         // L C C
		sierpinski(vec3(t[0]-div, t[1], t[2]+div), count, level);     // L C F
		sierpinski(vec3(t[0]-div, t[1], t[2]-div), count, level);     // L C B

		sierpinski(vec3(t[0]-div, t[1]+div, t[2]), count, level);     // L U C
		sierpinski(vec3(t[0]-div, t[1]+div, t[2]+div), count, level); // L U F
		sierpinski(vec3(t[0]-div, t[1]+div, t[2]-div), count, level); // L U B

		sierpinski(vec3(t[0], t[1], t[2]+div), count, level);         // C C F
		sierpinski(vec3(t[0], t[1], t[2]-div), count, level);         // C C B
	}
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

function load_texture(img_path) {
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					  		  new Uint8Array([255, 0, 0, 255])); // red

		var img = new Image();
		img.onload = function() {
					gl.bindTexture(gl.TEXTURE_2D, tex);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				}
		img.src = img_path;
		return tex;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

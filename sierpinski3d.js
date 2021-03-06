var canvas;
var gl;

var mProjection;
var mView;
var mModel;

var vPosition;
var fScale;
var vTrans;
var fThetaX;
var fThetaY;
var fThetaZ;

var vObjColor;
var vLightColor;

var points = [];
var scales = [];
var trans = [];

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

var lev = 2;
var check = false;

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
	yaw += oldX - event.clientX;
	pitch += oldY - event.clientY;

	oldX = event.clientX;
	oldY = event.clientY;

	cameraDir[0] = Math.cos(radians(yaw)) * Math.cos(radians(pitch));
	cameraDir[1] = Math.sin(radians(pitch));
	cameraDir[2] = Math.sin(radians(yaw)) * Math.cos(radians(pitch));

	cameraUp[0] = Math.cos(radians(yaw)) * Math.cos(radians(pitch+90));
	cameraUp[1] = Math.sin(radians(pitch+90));
	cameraUp[2] = Math.sin(radians(yaw)) * Math.cos(radians(pitch+90));

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
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	// Load vertex shader variable locations
	mProjection = gl.getUniformLocation(program, "mProjection");
	mView = gl.getUniformLocation(program, "mView");
	mModel = gl.getUniformLocation(program, "mModel");
    vPosition = gl.getAttribLocation(program, "vPosition");
	fScale = gl.getAttribLocation(program, "fScale");
	vTrans = gl.getAttribLocation(program, "vTrans");
	fThetaX = gl.getUniformLocation(program, "fThetaX");
	fThetaY = gl.getUniformLocation(program, "fThetaY");
	fThetaZ = gl.getUniformLocation(program, "fThetaZ");

	// Load fragment shader variable locations
	vObjColor = gl.getUniformLocation( program, "vObjColor" );
	vLightColor = gl.getUniformLocation( program, "vLightColor" );

	gl.uniform3fv(vObjColor, [0.2, 0.0, 0.0]);
	gl.uniform3fv(vLightColor, [1.0, 1.0, 1.0]);

	gl.uniformMatrix4fv(mProjection, false, flatten(perspective(30, 1000/700, 1, 1000))); 
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

    gl.clear( gl.COLOR_BUFFER_BIT );
	sierpinski(vec3(0,0,0), count, 0);

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
	            vertices[0], vertices[4], vertices[1], vertices[1], vertices[4], vertices[5],  // LEFT
	            vertices[0], vertices[2], vertices[6], vertices[0], vertices[6], vertices[4],  // UP
	            vertices[4], vertices[6], vertices[5], vertices[5], vertices[6], vertices[7],  // BACK
	            vertices[1], vertices[7], vertices[3], vertices[1], vertices[5], vertices[7],  // DOWN
	            vertices[2], vertices[3], vertices[6], vertices[6], vertices[3], vertices[7]); // RIGHT
	trans.push(transform, transform, transform, transform, transform, transform,
	           transform, transform, transform, transform, transform, transform,
	           transform, transform, transform, transform, transform, transform,
	           transform, transform, transform, transform, transform, transform,
	           transform, transform, transform, transform, transform, transform,
	           transform, transform, transform, transform, transform, transform);
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

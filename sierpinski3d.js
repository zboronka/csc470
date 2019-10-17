var canvas;
var gl;

var mPerspective;
var mCamera;
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

var camera = [1, 0, 0, 0,
	          0, 1, 0, 0,
	          0, 0, 1, 0,
	          0, 0, -5,1];

var thetaX = 0;
var thetaY = 0;
var thetaZ = 0;
var r = 0;
var angle = 1;
var lev = 2;
var check = false;

document.getElementById("level").onchange = function() {
	lev = document.getElementById("level").value;
	draw(lev);
};

document.getElementById("rotate").onchange = function() {
	check = document.getElementById("rotate").checked;
};

document.getElementById("gl-canvas").onclick = function() {
	angle *= -1;
}

document.getElementById("thetaX").onchange = function() {
	thetaX = document.getElementById("thetaX").value;
	draw(lev);
}

document.getElementById("thetaY").onchange = function() {
	thetaY = document.getElementById("thetaY").value;
	draw(lev);
}

document.getElementById("thetaZ").onchange = function() {
	thetaZ = document.getElementById("thetaZ").value;
	draw(lev);
	console.log("blah");
}

document.onkeydown = function() {
	if(event.code=="ArrowUp") {
		camera[4*3+2] += .1;
		gl.uniformMatrix4fv(mCamera, false, camera); 
		draw(lev);
	}

	if(event.code=="ArrowDown") {
		camera[4*3+2] -= .1;
		gl.uniformMatrix4fv(mCamera, false, camera); 
		draw(lev);
	}
	
	if(event.code=="ArrowLeft") {
		camera[4*3] -= .1;
		gl.uniformMatrix4fv(mCamera, false, camera); 
		draw(lev);
	}
	
	if(event.code=="ArrowRight") {
		camera[4*3] += .1;
		gl.uniformMatrix4fv(mCamera, false, camera); 
		draw(lev);
	}
}

function loop() {
	if(check) {
		r += angle;
		draw(lev);
	}

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
	mPerspective = gl.getUniformLocation(program, "mPerspective");
	mCamera = gl.getUniformLocation(program, "mCamera");
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

	gl.uniformMatrix4fv(mPerspective, false, flatten(perspective(30, 1, 1, 1000))); 
	gl.uniformMatrix4fv(mCamera, false, camera); 

	draw(2);
	loop();
}

function draw(count) {
	points = [];
	scales = [];
	trans = [];

    gl.clear( gl.COLOR_BUFFER_BIT );
	sierpinski(vec3(0,0,0), count, 0);

	gl.uniform1f(fThetaX, radians(thetaX));
	gl.uniform1f(fThetaY, radians(thetaY));
	gl.uniform1f(fThetaZ, radians(thetaZ));

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

    gl.drawArrays(gl.LINES, 0, points.length);
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
	points.push(vertices[0], vertices[1], vertices[2], vertices[1], vertices[2], vertices[3],  // FRONT
	            vertices[0], vertices[4], vertices[1], vertices[1], vertices[4], vertices[5],  // LEFT
	            vertices[0], vertices[2], vertices[6], vertices[0], vertices[6], vertices[4],  // UP
	            vertices[4], vertices[5], vertices[6], vertices[5], vertices[6], vertices[7],  // BACK
	            vertices[1], vertices[3], vertices[7], vertices[1], vertices[7], vertices[5],  // DOWN
	            vertices[2], vertices[6], vertices[3], vertices[6], vertices[3], vertices[7]); // RIGHT
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

var canvas;
var gl;

var vPosition;
var iScale;
var vTrans;
var mTranslate;

var points = [];
var scales = [];
var trans = [];

var vertices = [
	vec2( -1,  1 ),
	vec2( -1, -1 ),
	vec2(  1,  1 ),
	vec2(  1, -1 )
];
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
    gl.clearColor( 1.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    vPosition = gl.getAttribLocation( program, "vPosition" );
	iScale = gl.getAttribLocation( program, "iScale");
	vTrans = gl.getAttribLocation( program, "vTrans");
	mRotate = gl.getUniformLocation(program, "mRotate");

	draw(2);
	loop();
}

function draw(count) {
	points = [];
	scales = [];
	trans = [];

    gl.clear( gl.COLOR_BUFFER_BIT );
	sierpinski(vec2(0,0), count, 0);

	gl.uniformMatrix4fv(mRotate, false, flatten(rotateZ(r)));

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(scales), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    gl.vertexAttribPointer( iScale, 1, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( iScale );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(trans), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    gl.vertexAttribPointer( vTrans, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTrans );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function square(transform, scale) {
	scales.push(scale, scale, scale, scale, scale, scale);
	points.push(vertices[0], vertices[1], vertices[2], vertices[1], vertices[2], vertices[3]);
	trans.push(transform, transform, transform, transform, transform, transform);
}

function sierpinski(t, count, level) {
	if (count == 1) {
		square(t, level);
	}
	else {
		square(t, level);

		count--;
		level++;

		var div = (2/Math.pow(3, level));

		sierpinski(vec2(t[0], t[1]+div), count, level);
		sierpinski(vec2(t[0]+div, t[1]+div), count, level);
		sierpinski(vec2(t[0]+div, t[1]), count, level);
		sierpinski(vec2(t[0]+div, t[1]-div), count, level);
		sierpinski(vec2(t[0], t[1]-div), count, level);
		sierpinski(vec2(t[0]-div, t[1]-div), count, level);
		sierpinski(vec2(t[0]-div, t[1]), count, level);
		sierpinski(vec2(t[0]-div, t[1]+div), count, level);
	}
}

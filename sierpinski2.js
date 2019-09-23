var canvas;
var gl;
var points = [];
const third = .333333333333;
var scale = scalem(third, third, 1);
var mScale;
var mTranslate;
var mRotate;
var vPosition;
var iScale; 
var program;
var r = 0;
var lev = 2;
var check = false;

function translate( x, y, z )
{
    var result = new Float32Array( [ 1, 0, 0, 0,
		                             0, 1, 0, 0,
		                             0, 0, 1, 0,
		                             x, y, z, 1 ] );

    return result;
}

function scalem( x, y, z )
{
	var result = new Float32Array( [ x, 0, 0, 0,
	                                 0, y, 0, 0,
	                                 0, 0, z, 0,
	                                 0, 0, 0, 1 ] );

    return result;
}

function mult(a, b) {
	out = new Float32Array(16);
	let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
	let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
	let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
	let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

	// Cache only the current line of the second matrix
	let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
	out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
	out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
	out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	return out;
}

document.getElementById("level").onchange = function() {
	lev = document.getElementById("level").value;
	draw(lev);
};

document.getElementById("rotate").onchange = function() {
	check = document.getElementById("rotate").checked;
};

window.onload = function init() {
	points = [];

    // Four Vertices
    var vertices = [
        vec2( -1,  1 ),
        vec2( -1, -1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 )
    ];

	points.push(vertices[0], vertices[1], vertices[2], vertices[1], vertices[2], vertices[3]);

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
	iScale = gl.getUniformLocation(program, "iScale");
	mScale = gl.getUniformLocation(program, "mScale");
	mTranslate = gl.getUniformLocation(program, "mTranslate");
	mRotate = gl.getUniformLocation(program, "mRotate");

	gl.uniformMatrix4fv(mScale, false, scalem(third,third,0));

	draw(lev);
	window.requestAnimationFrame(loop);
}

function loop() {
	if(check) {
		r++;
		draw(lev);
	}

	window.requestAnimationFrame(loop);
}

function draw(count) {
	gl.uniform1i(iScale, 0);
	gl.uniformMatrix4fv(mTranslate, false, translate(0, 0, 0));
	gl.uniformMatrix4fv(mRotate, false, flatten(rotateZ(r)));

    gl.clear( gl.COLOR_BUFFER_BIT );

	divideSquare(translate(0,0,0), count, 0);
}

function square() {

    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function divideSquare(t, count, level) {
	if (count == 0) {
		square();
	}
	else {
		--count;
		++level;

		var div = (2/Math.pow(3, level));

		gl.uniformMatrix4fv(mTranslate, false, t);
		square();

		//s = mult(s, scalem(third, third, 0));
		gl.uniform1i(iScale, level);

		var up = mult(translate(0,div,0), t);
		var upr = mult(translate(div,div,0), t);
		var r = mult(translate(div,0,0), t);
		var dnr = mult(translate(div,-div,0), t);
		var dn = mult(translate(0,-div,0), t);
		var dnl = mult(translate(-div,-div,0), t);
		var l = mult(translate(-div,0,0), t);
		var upl = mult(translate(-div,div,0), t);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, up);
		divideSquare(up, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, upr);
		divideSquare(upr, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, r);
		divideSquare(r, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, dnr);
		divideSquare(dnr, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, dn);
		divideSquare(dn, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, dnl);
		divideSquare(dnl, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, l);
		divideSquare(l, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, upl);
		divideSquare(upl, count, level);
	}
}

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

	points.push(vertices[0], vertices[1], vertices[2], vertices[3]);

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

	gl.uniformMatrix4fv(mScale, false, flatten(scalem(third,third,0)));

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
	gl.uniformMatrix4fv(mTranslate, false, flatten(translate(0, 0, 0)));
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

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, points.length );
}

function divideSquare(t, count, level) {
	if (count == 0) {
		square();
	}
	else {
		--count;
		++level;

		var div = (2/Math.pow(3, level));

		gl.uniformMatrix4fv(mTranslate, false, flatten(t));
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
		gl.uniformMatrix4fv(mTranslate, false, flatten(up));
		divideSquare(up, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, flatten(upr));
		divideSquare(upr, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, flatten(r));
		divideSquare(r, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, flatten(dnr));
		divideSquare(dnr, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, flatten(dn));
		divideSquare(dn, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, flatten(dnl));
		divideSquare(dnl, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, flatten(l));
		divideSquare(l, count, level);

		gl.uniform1i(iScale, level);
		gl.uniformMatrix4fv(mTranslate, false, flatten(upl));
		divideSquare(upl, count, level);
	}
}

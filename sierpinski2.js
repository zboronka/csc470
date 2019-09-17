var gl;
var points = [];
const third = .333333333333;
var scale = scalem(third, third, 1);
var mScale;
var mTranslate;
var mRotate;
var program;

document.getElementById("draw").onclick = function() {
	draw(document.getElementById("level").value);
};

window.onload = function init() {
	draw(2);
}

function draw(count) {
	points = [];
    var canvas = document.getElementById( "gl-canvas" );
    
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

	mScale = gl.getUniformLocation(program, "mScale");
	mTranslate = gl.getUniformLocation(program, "mTranslate");
	mRotate = gl.getUniformLocation(program, "mRotate");
	gl.uniformMatrix4fv(mScale, false, flatten(scalem(third,third,0)));
	gl.uniformMatrix4fv(mTranslate, false, flatten(translate(0, 0, 0)));
	gl.uniformMatrix4fv(mRotate, false, flatten(rotate(.1, 0, 0)));

    gl.clear( gl.COLOR_BUFFER_BIT );

    // Four Vertices
    var vertices = [
        vec2( -1,  1 ),
        vec2( -1, -1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 )
    ];

	points.push(vertices[0], vertices[1], vertices[2], vertices[3]);

	divideSquare(translate(0,0,0), scalem(third, third, 0), count, 0);
}

function square() {

    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, points.length );
}

function divideSquare(t, s, count, level) {
	if (count == 0) {
		square();
	}
	else {
		--count;
		++level;

		var div = (2/Math.pow(3, level));

		gl.uniformMatrix4fv(mTranslate, false, flatten(t));
		divideSquare(t, s, count, level);

		s = mult(s, scalem(third, third, 0));

		var up = mult(translate(0,div,0), t);
		var upr = mult(translate(div,div,0), t);
		var r = mult(translate(div,0,0), t);
		var dnr = mult(translate(div,-div,0), t);
		var dn = mult(translate(0,-div,0), t);
		var dnl = mult(translate(-div,-div,0), t);
		var l = mult(translate(-div,0,0), t);
		var upl = mult(translate(-div,div,0), t);


		gl.uniformMatrix4fv(mScale, false, flatten(s));
		gl.uniformMatrix4fv(mTranslate, false, flatten(up));
		divideSquare(up, s, count, level);

		gl.uniformMatrix4fv(mScale, false, flatten(s));
		gl.uniformMatrix4fv(mTranslate, false, flatten(upr));
		divideSquare(upr, s, count, level);

		gl.uniformMatrix4fv(mScale, false, flatten(s));
		gl.uniformMatrix4fv(mTranslate, false, flatten(r));
		divideSquare(r, s, count, level);

		gl.uniformMatrix4fv(mScale, false, flatten(s));
		gl.uniformMatrix4fv(mTranslate, false, flatten(dnr));
		divideSquare(dnr, s, count, level);

		gl.uniformMatrix4fv(mScale, false, flatten(s));
		gl.uniformMatrix4fv(mTranslate, false, flatten(dn));
		divideSquare(dn, s, count, level);

		gl.uniformMatrix4fv(mScale, false, flatten(s));
		gl.uniformMatrix4fv(mTranslate, false, flatten(dnl));
		divideSquare(dnl, s, count, level);

		gl.uniformMatrix4fv(mScale, false, flatten(s));
		gl.uniformMatrix4fv(mTranslate, false, flatten(l));
		divideSquare(l, s, count, level);

		gl.uniformMatrix4fv(mScale, false, flatten(s));
		gl.uniformMatrix4fv(mTranslate, false, flatten(upl));
		divideSquare(upl, s, count, level);
	}
}

function transform(u, v) {
	return vec2(mult(u, vec4(v, 0, 1)));
}

function sMove(mid, dir, v) {
	var center = translate(mid[0], mid[1], 0);
	return transform(dir, transform(center, transform(scale, transform(inverse4(center), v))));
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

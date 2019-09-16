var gl;
var points = [];
const third = .333333333333;
var scale = scalem(third, third, 1);
var mICenter;
var mCenter;
var mScale;
var mTranslate;
var program;

document.getElementById("draw").onclick = function() {
	draw(document.getElementById("level").value);
};

window.onload = function init() {
	draw(1);
}

function draw(level) {
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
	gl.uniformMatrix4fv(mScale, false, flatten(scalem(third,third,0)));
	gl.uniformMatrix4fv(mTranslate, false, flatten(translate(0, 0, 0)));

    gl.clear( gl.COLOR_BUFFER_BIT );

    // Four Vertices
    var vertices = [
        vec2( -1,  1 ),
        vec2( -1, -1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 )
    ];

	points.push(vertices[0], vertices[1], vertices[2], vertices[3]);

	square();
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

function divideSquare(a, b, c, d, count) {
	if (count == 0) {
		square(a, b, c, d);
	}
	else {
		var ab = a[1]-b[1];
		var abm = mix(a, b, .5);
		var acm = mix(a, c, .5);
		var mid = vec2(acm[0], abm[1]);
		--count;

		var up = translate(0,ab,0);
		var upr = translate(ab,ab,0);
		var r = translate(ab,0,0);
		var dnr = translate(ab,-ab,0);
		var dn = translate(0,-ab,0);
		var dnl = translate(-ab,-ab,0);
		var l = translate(-ab,0,0);
		var upl = translate(-ab,ab,0);

		divideSquare(a, b, c, d, count);
		gl.uniformMatrix4fv(mICenter, false, flatten(inverse(translate(mid[0], mid[1], 0))));
		gl.uniformMatrix4fv(mCenter, false, flatten(translate(mid[0], mid[1], 0)));
		gl.uniformMatrix4fv(mScale, false, flatten(scale));

		gl.uniformMatrix4fv(mTranslate, false, flatten(up));
		divideSquare(a, b, c, d, count);
		gl.uniformMatrix4fv(mTranslate, false, flatten(upr));
		divideSquare(a, b, c, d, count);
		gl.uniformMatrix4fv(mTranslate, false, flatten(r));
		divideSquare(a, b, c, d, count);
		gl.uniformMatrix4fv(mTranslate, false, flatten(dnr));
		divideSquare(a, b, c, d, count);
		gl.uniformMatrix4fv(mTranslate, false, flatten(dn));
		divideSquare(a, b, c, d, count);
		gl.uniformMatrix4fv(mTranslate, false, flatten(dnl));
		divideSquare(a, b, c, d, count);
		gl.uniformMatrix4fv(mTranslate, false, flatten(l));
		divideSquare(a, b, c, d, count);
		gl.uniformMatrix4fv(mTranslate, false, flatten(upl));
		divideSquare(a, b, c, d, count);
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

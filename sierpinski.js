var gl;
var points = [];
const third = .333333333333;
var scale = scalem(third, third, 1);

document.getElementById("draw").onclick = function() {
	draw(document.getElementById("level").value);
};

window.onload = function init() {
	draw(3);
}

function draw(level) {
	points = [];
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Four Vertices
    var vertices = [
        vec2( -third,  third ),
        vec2( -third, -third ),
        vec2(  third,  third ),
        vec2(  third, -third )
    ];

	divideSquare(vertices[0], vertices[1], vertices[2], vertices[3], level);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
}

function square(a, b, c, d) {
	points.push(a, b, c, d, b, c);
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
		divideSquare(sMove(mid, up, a), sMove(mid, up, b), sMove(mid, up, c), sMove(mid, up, d), count);
		divideSquare(sMove(mid, upr, a), sMove(mid, upr, b), sMove(mid, upr, c), sMove(mid, upr, d), count);
		divideSquare(sMove(mid, r, a), sMove(mid, r, b), sMove(mid, r, c), sMove(mid, r, d), count);
		divideSquare(sMove(mid, dnr, a), sMove(mid, dnr, b), sMove(mid, dnr, c), sMove(mid, dnr, d), count);
		divideSquare(sMove(mid, dn, a), sMove(mid, dn, b), sMove(mid, dn, c), sMove(mid, dn, d), count);
		divideSquare(sMove(mid, dnl, a), sMove(mid, dnl, b), sMove(mid, dnl, c), sMove(mid, dnl, d), count);
		divideSquare(sMove(mid, l, a), sMove(mid, l, b), sMove(mid, l, c), sMove(mid, l, d), count);
		divideSquare(sMove(mid, upl, a), sMove(mid, upl, b), sMove(mid, upl, c), sMove(mid, upl, d), count);
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

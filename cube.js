"use strict";

const F=1, B=-1;
const U=1, D=-1;
const R=1, L=-1;

const cubepoints = Object.freeze({
	LUF:vec3(L, U, F),
	LUB:vec3(L, U, B),
	LDF:vec3(L, D, F),
	LDB:vec3(L, D, B),
	RUF:vec3(R, U, F),
	RUB:vec3(R, U, B),
	RDF:vec3(R, D, F),
	RDB:vec3(R, D, B)
});

const normals = [
	vec3(0,0,1),  //FRONT
	vec3(1,0,0),  //RIGHT
	vec3(0,0,-1), //BACK
	vec3(-1,0,0), //LEFT
	vec3(0,-1,0), //DOWN
	vec3(0,1,0)   //UP
];

const UVCoords = [
   vec2(0.25,0.25), vec2(0.5,0.25), vec2(0.5,0.5), vec2(0.25,0.5),
   vec2(0.5,0.25), vec2(0.75,0.25), vec2(0.75,0.5), vec2(0.5,0.5),
   vec2(0.75,0.25), vec2(1.0,0.25), vec2(1.0,0.5), vec2(0.75,0.5),
   vec2(0,0.25), vec2(0.25,0.25), vec2(0.25,0.5), vec2(0,0.5),
   vec2(0.25,0.5), vec2(0.5,0.5), vec2(0.5,0.75), vec2(0.25,0.75),
   vec2(0.25,0), vec2(0.5,0), vec2(0.5,0.25), vec2(0.25,0.25),
];

const cubevertices = [ 
	cubepoints.RUF, cubepoints.LUF, cubepoints.LDF, cubepoints.RUF, cubepoints.LDF, cubepoints.RDF,
	cubepoints.RUB, cubepoints.RUF, cubepoints.RDF, cubepoints.RUB, cubepoints.RDF, cubepoints.RDB,
	cubepoints.LUB, cubepoints.RUB, cubepoints.RDB, cubepoints.LUB, cubepoints.RDB, cubepoints.LDB, 
	cubepoints.LUF, cubepoints.LUB, cubepoints.LDB, cubepoints.LUF, cubepoints.LDB, cubepoints.LDF, 
	cubepoints.RDF, cubepoints.LDF, cubepoints.LDB, cubepoints.RDF, cubepoints.LDB, cubepoints.RDB, 
	cubepoints.RUB, cubepoints.LUB, cubepoints.LUF, cubepoints.RUB, cubepoints.LUF, cubepoints.RUF 
];

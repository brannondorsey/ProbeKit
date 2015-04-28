var Butterfly = function () {

	var scope = this;

	THREE.Geometry.call( this );

	v( - 3,   3,  -6 );
	v(   3,   3,  -6 );
	v( - 3,   0,   0 );
	v(   3,   0,   0 );
	v( - 3,   3,   6 );
	v(   3,   3,   6 );

	f3( 0, 1, 3 );
	f3( 3, 2, 0 );
	f3( 4, 2, 3 );
	f3( 3, 5, 4 );

	this.faceVertexUvs[ 0 ].push([
        new THREE.Vector2(  0,  0 ),
        new THREE.Vector2(  1,  0 ),
        new THREE.Vector2(  1, .5 )
    ]);  
	this.faceVertexUvs[ 0 ].push([
        new THREE.Vector2(  1, .5 ),
        new THREE.Vector2(  0, .5 ),
        new THREE.Vector2(  0,  0 )
    ]);  
    this.faceVertexUvs[ 0 ].push([
        new THREE.Vector2( 0,  1 ),
        new THREE.Vector2( 0, .5 ),
        new THREE.Vector2( 1, .5 )
    ]);  
    this.faceVertexUvs[ 0 ].push([
        new THREE.Vector2( 1, .5 ),
        new THREE.Vector2( 1,  1 ),
        new THREE.Vector2( 0,  1 )
    ]);  
	// this.computeFaceNormals();

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vector3( x, y, z ) );

	}

	function f3( a, b, c ) {

		scope.faces.push( new THREE.Face3( a, b, c ) );

	}

}

Butterfly.prototype = Object.create( THREE.Geometry.prototype );
Butterfly.prototype.constructor = Butterfly;

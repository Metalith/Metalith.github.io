var w = window.innerWidth;
var h = window.innerHeight;
a = h / w;

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera( 20 / - 2, 20 / 2, 20 * a / 2, 20 * a / - 2, 0.1, 10 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = 0;
renderer.domElement.style.zIndex = -1;
renderer.setClearColor( 0x0e1115, 1 );
document.getElementById("Grid").appendChild( renderer.domElement );


var geometry = new THREE.PlaneBufferGeometry( 10, 10 );
//Plane material
var uniforms = {
    resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) }
};

var material = new THREE.ShaderMaterial( {
	vertexShader: document.getElementById( 'vertexShader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
} );
var plane = new THREE.Mesh( geometry, material );
plane.rotation.x = -1.57;
plane.position.y = -1;
scene.add( plane );

camera.position.set(0, 5, 0)
camera.lookAt(scene.position)

var render = function () {
    requestAnimationFrame( render );

    renderer.render(scene, camera);
};

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.bottom = (window.innerHeight / window.innerWidth) * -10;
    camera.top = (window.innerHeight / window.innerWidth) * 10;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

render();

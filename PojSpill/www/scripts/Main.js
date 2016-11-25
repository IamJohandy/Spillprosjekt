//Globale varianbler:
var renderer;
var scene;
var camera;

//Til koord:
var SIZE = 200;
var rotationZ=0;
var rotationX=0;
var rotRotor = 0;

var positionX = -20;
var positionY = 10;

//Roter & zoom:
var controls;

//Tar vare pĆ� tastetrykk:
var currentlyPressedKeys = {};

var groundMesh;
var modelMesh;

var speedVector = new THREE.Vector3(0.3, 0, 0.1);		//Fartsvektor.
var positionVector = new THREE.Vector3(0.3, 0, 0.1); 	//Posisjonsvetor.
//var delta = Math.PI / 100;  						//Hvor mye fartsvektoren roterer
var axis = new THREE.Vector3(0, 1, 0);		//Hvilken akse fartsvektoren roterer rundt.

//testings
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');

var raycaster;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

function main() {

    //Determine if the user's browser supports pointer lock
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    console.log("Pointer lock: " + havePointerLock);

    if (havePointerLock) {
        var element = document.body;

        var pointerlockchange = function (event) {

            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

                //controlsEnabled = true;
                //controls.enabled = true;

                blocker.style.display = 'none';

            } else {

                //controls.enabled = false;

                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';
            }
        };
    }

    // Hook pointer lock state change events
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

    //document.addEventListener('pointerlockerror', pointerlockerror, false);
    //document.addEventListener('mozpointerlockerror', pointerlockerror, false);
    //document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

    instructions.addEventListener('click', function (event) {

        instructions.style.display = 'none';

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

        if (/Firefox/i.test(navigator.userAgent)) {

            var fullscreenchange = function (event) {

                if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

                    document.removeEventListener('fullscreenchange', fullscreenchange);
                    document.removeEventListener('mozfullscreenchange', fullscreenchange);

                    element.requestPointerLock();
                }

            };

            document.addEventListener('fullscreenchange', fullscreenchange, false);
            document.addEventListener('mozfullscreenchange', fullscreenchange, false);

            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

            element.requestFullscreen();

        } else {

            element.requestPointerLock();

        }

    }, false);


    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);


	'use strict';	//Tvinger oss f.eks. til Ć� deklarere variabler.
	
	Physijs.scripts.worker = '../lib/physijs_worker.js';
	Physijs.scripts.ammo = '../lib/ammo.js';
	
	//Henter referanse til canvaset:
	var mycanvas = document.getElementById('webgl');
	
	//Lager et rendererobjekt (og setter stļæ½rrelse):
	renderer = new THREE.WebGLRenderer({canvas:mycanvas, antialias:true});
	renderer.setClearColor(0xBFD104, 0xff);  //farge, alphaverdi.
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true; //NB!
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;
	
	//Physis.scene:
	scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
	scene.setGravity(new THREE.Vector3( 0, -10, 0 ));
	scene.addEventListener(
		'update',
		function() {
			scene.simulate( undefined, 2 );
		}
	);
	
	//Oppretter et kamera:
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    //Roter/zoom hele scenen:
	controls = new THREE.PointerLockControls(camera);
	scene.add(controls.getObject());

	/*camera.position.x = 0;
	camera.position.y = 10;
	camera.position.z = 40;
	camera.up = new THREE.Vector3(0, 1, 0);	
    var target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);*/
    //scene.add(camera);
    
    // Light
	var light = new THREE.DirectionalLight( 0xFFFFFF );
	light.position.set( 0, 40, 15 );
	light.target.position.copy( scene.position );
	light.castShadow = true;
	light.shadow.camera.left = -60;
	light.shadow.camera.top = -60;
	light.shadow.camera.right = 60;
	light.shadow.camera.bottom = 60;
	light.shadow.camera.near = 20;
	light.shadow.camera.far = 200;
	light.shadow.bias = -.0001
	light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
	//light.shadowDarkness = .7;
	scene.add( light );
	
	
	
	//Input - standard Javascript / WebGL:
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    //Add ground
    addGround();

    //Add moddel
    addModel();

	//Starter animasjon:
	animate();
	scene.simulate();
	
}

//ANIMATE:
function animate(currentTime) {
    requestAnimationFrame(animate);
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    var intersections = raycaster.intersectObjects();

    var isOnObject = intersections.length > 0;

    var time = performance.now();
    var delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass


    controls.getObject().translateX(velocity.x * delta);
    controls.getObject().translateY(velocity.y * delta);
    controls.getObject().translateZ(velocity.z * delta);

    if (controls.getObject().position.y < 10) {

        velocity.y = 0;
        controls.getObject().position.y = 10;

        canJump = true;

    }

    prevTime = time;
	render();
};

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

function render()
{
     renderer.render(scene, camera);
     scene.simulate(undefined, 2);
}

//Sjekker tastaturet (standard Javascript/WebGL):
function keyCheck() {    
	if (currentlyPressedKeys[65]) { //As
	    
	}
	if (currentlyPressedKeys[68]) {	//D
	    
	}
	if (currentlyPressedKeys[32]) { //Space
	    
    }
}

function addGround() {
    // Materialer til terrenget/bakken:
    var ground_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('GameTest/img/rocks.jpg') }),
		.8, // high friction
		.4  // low restitution
	);
    ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
    ground_material.map.repeat.set(2.5, 2.5);

    // Physis-Mesh for bakken:
    groundMesh = new Physijs.BoxMesh(new THREE.BoxGeometry(50, 1, 50), ground_material, 0); // mass=0
    groundMesh.name = "groundMesh";
    groundMesh.receiveShadow = false;
    groundMesh.castShadow = false;
    scene.add( groundMesh );
}

function addModel() {
    var modelMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('GameTest/img/metal1.jpg') }), 0.8, 0.4);
    modelMesh = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 5, 2), modelMaterial, 100);
    modelMesh.position.y = 10;
    scene.add(modelMesh);
}
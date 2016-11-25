var camera, scene, renderer;
var geometry, material, mesh;
var controls;

var objects = [];

var raycaster;

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var clock = new THREE.Clock();
var velocity = new THREE.Vector3();

var prevTime = performance.now();
var velocity = new THREE.Vector3();

var currentlyPressedKeys = {};

var modelMesh;
var cameraDirection;
var allModels = [];
var GameSetting;

//SPILLOGIKK
// Mer om enums
// https://stijndewitt.com/2014/01/26/enums-in-javascript/
var GameLogic = {
    MENU: 1,
    PAUSED: 2,
    DEAD: 3,
    ACTION: 4
    
}

document.body.onmousedown = function () {
    bullet();
}

function bullet() {
    var bullet = new BulletObject(0.1, modelMesh);
    scene.add(bullet);
    allModels.push(bullet);
    bullet.fire(7000, 200, cameraDirection);
}

function main() {
    // VI STARTER MED AT VI ER I SPILLMENYEN
    GameSetting = GameLogic.MENU;

    //Locks the mouse cursor to the screen
    getPointerLock();

    //Get physijs worker
    Physijs.scripts.worker = '../lib/physijs_worker.js';
    Physijs.scripts.ammo = '../lib/ammo.js';

    //Canvas and renderer
    var mycanvas = document.getElementById('webgl');

    renderer = new THREE.WebGLRenderer({canvas:mycanvas, antialias:true});
    renderer.setClearColor(0xffffff, 0xff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.shadowMap.enabled = true; //NB!
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

    //Physis.scene:
    scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
    scene.setGravity(new THREE.Vector3(0, -10, 0));
    scene.addEventListener(
		'update',
		function () {
		    scene.simulate(undefined, 2);
		}
	);


    /*

        HEIA JOHAN
        hey olav
        skybox
        gamelogic
        hey olyvian
    */

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);

    //Add pointer lock controls
    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    //Temp hemi light for testing
    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 1);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    //Test
    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

    addSkybox(512, "images/skybox", ".png");
    addGround();
    addModel();

    //Input - standard Javascript / WebGL:
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);
 
    window.addEventListener('resize', onWindowResize, false);

    animate();
    scene.simulate();
}

//Handle key up
function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

//Handle key down
function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

//Adjust window on resize
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function handleKeyUp(event) {
    switch (event.keyCode) {

        case 38: // up
        case 87: // w
            moveForward = false;

            break;

        case 37: // left
        case 65: // a
            moveLeft = false;
            break;

        case 40: // down
        case 83: // s
            moveBackward = false;
            break;

        case 39: // right
        case 68: // d
            moveRight = false;
            break;
    }
}

function handleKeyDown(event) {
    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = true;
            break;

        case 37: // left
        case 65: // a
            moveLeft = true; break;

        case 40: // down
        case 83: // s
            moveBackward = true;
            break;

        case 39: // right
        case 68: // d
            moveRight = true;
            break;

        case 32: // space
            console.log("Can jump = " + canJump);
            if (canJump === true) {
                canJump = false;
                modelMesh.applyCentralImpulse(new THREE.Vector3(0, 750, 0));
            }
            break;
    }
}

//TODO: Fix jumping :/

function animate() {

    requestAnimationFrame(animate);
    var delta = clock.getDelta(); //Not currently used

    //Get camera direction
    cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();

    //Binds camera to modelMesh
    controls.getObject().position.x = modelMesh.position.x;
    controls.getObject().position.y = modelMesh.position.y;
    controls.getObject().position.z = modelMesh.position.z;

    //Cancel linear veelocity for x and z directions
    modelMesh.setLinearVelocity(new THREE.Vector3(0, modelMesh.getLinearVelocity().y, 0));

    //The force movement speed
    var speed = 600;

    //Respond to keyboard input with impulse to move character
    if (moveForward) {
        var impulse = new THREE.Vector3(cameraDirection.x * speed, 0, cameraDirection.z * speed);
        modelMesh.applyCentralImpulse(impulse);
    }
    if (moveBackward) {
        var impulse = new THREE.Vector3(-cameraDirection.x * speed, 0, -cameraDirection.z * speed);
        modelMesh.applyCentralImpulse(impulse);
    }
    if (moveRight) {
        var impulse = new THREE.Vector3(-cameraDirection.z * speed, 0, cameraDirection.x * speed);
        modelMesh.applyCentralImpulse(impulse);
    }
    if (moveLeft) {
        var impulse = new THREE.Vector3(cameraDirection.z * speed, 0, -cameraDirection.x * speed);
        modelMesh.applyCentralImpulse(impulse);
    }

    removeLifespanBullet();

    renderer.render(scene, camera);
    scene.simulate(undefined, 2);
}



//Gets pointer lock. NB! ONLY Chrome and FireFox
function getPointerLock() {
    if (havePointerLock) {

        var element = document.body;

        var pointerlockchange = function (event) {

            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

                controlsEnabled = true;
                controls.enabled = true;

                blocker.style.display = 'none';

            } else {

                controls.enabled = false;

                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';

            }

        };

        var pointerlockerror = function (event) {

            instructions.style.display = '';

        };

        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

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

    } else {

        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

    }
}

//Adds temp ground object
function addGround() {
    var ground_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('images/rocks.jpg') }),
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
    scene.add(groundMesh);

    groundMesh2 = new Physijs.BoxMesh(new THREE.BoxGeometry(3, 4, 3), ground_material, 0); // mass=0
    groundMesh2.name = "groundMesh";
    groundMesh2.receiveShadow = false;
    groundMesh2.castShadow = false;

    groundMesh2.position.set(-10, 2, 0);
    scene.add(groundMesh2);

    groundMesh3 = new Physijs.BoxMesh(new THREE.BoxGeometry(3, 4, 3), ground_material, 0); // mass=0
    groundMesh3.name = "groundMesh";
    groundMesh3.receiveShadow = false;
    groundMesh3.castShadow = false;
    groundMesh3.position.set(10, 2, 0);
    scene.add(groundMesh3);

    groundMesh4 = new Physijs.BoxMesh(new THREE.BoxGeometry(3, 4, 3), ground_material, 0); // mass=0
    groundMesh4.name = "groundMesh";
    groundMesh4.receiveShadow = false;
    groundMesh4.castShadow = false;
    groundMesh4.position.set(0, 2, 10);
    scene.add(groundMesh4);

    groundMesh5 = new Physijs.BoxMesh(new THREE.BoxGeometry(3, 4, 3), ground_material, 0); // mass=0
    groundMesh5.name = "groundMesh";
    groundMesh5.receiveShadow = false;
    groundMesh5.castShadow = false;
    groundMesh5.position.set(0, 2, -10);
    scene.add(groundMesh5);
}

//Adds temp model
//TODO: Change the model to a cylinder for better hit detection
function addModel() {
    var modelMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/metal1.jpg') }), 0.8, 0.4);
    modelMesh = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 5, 2), modelMaterial, 100);
    modelMesh.position.y = 10;

    modelMesh.addEventListener('ready', function () {
        modelMesh.setLinearFactor(new THREE.Vector3(1, 1, 1));
        modelMesh.setAngularFactor(new THREE.Vector3(0, 0, 0));
    });

    modelMesh.addEventListener('collision',
        function (other_object, relative_velocity, relative_rotation, contact_normal) {
            
            if (other_object.name == 'groundMesh') {
                console.log("collided");
                canJump = true;
            }
        });

    scene.add(modelMesh);
}
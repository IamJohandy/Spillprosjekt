/**
 * Creates a bullet near player
 * @param {type} size The desired size of the bullet
 * @param {type} player The playermodel mesh for the coordinates
 * 
 */
function BulletObject(size, player) {
    //Default values
    this.speed;
    this.hittable = true;
    this.player = player;
    this.canBeRemoved = false;
    this.lifespan = 1000; 
    this.scene = scene;
    this.type = 'BulletObject';
    this.bulletMaterial = Physijs.createMaterial(
		new THREE.MeshBasicMaterial({ color: 0x000000 }),
		0.9,
		0.9
	);
    this.size = size;
    this.bulletGeometry = new THREE.CubeGeometry(this.size, this.size, this.size);
    this.init();
    this.setCcdMotionThreshold(this.size); // Motion Clamping for collision detection of fast bullets
    Physijs.BoxMesh.call(this, this.bulletGeometry, this.bulletMaterial, 40);

    var scope = this;
    this.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
        scope.handleCollision(other_object);
    });
}

BulletObject.prototype = Object.create(Physijs.BoxMesh.prototype);
BulletObject.prototype.constructor = BulletObject;

/**
 * Handles the collision, render it useless when hit using hittable boolean variable
 * @param {type} other_object
 */
BulletObject.prototype.handleCollision = function (other_object) {
    if (other_object != null && this.hittable && other_object != this.player) {
        this.hittable = false;
    }
}

/**
 * Initializes the current object
 */
BulletObject.prototype.init = function () {
    this.name = "bulletMesh";
    this.receiveShadow = false;
    this.castShadow = false;
}

/**
 * Fires the bullet with a speed using an impulse
 * @param {type} bulletSpeed The desired speed of the bullet
 * @param {type} lifespan How long the bullet should last before it dissapears from the scene
 * @param {type} camdir The direction where the current fps camera holds
 */
BulletObject.prototype.fire = function (bulletSpeed, lifespan, camdir) {
    this.speed = bulletSpeed;
    this.lifespan = lifespan;

    this.position.x = modelMesh.position.x + camdir.x;
    this.position.y = modelMesh.position.y + camdir.y;
    this.position.z = modelMesh.position.z + camdir.z;
    var impulse = new THREE.Vector3(camdir.x * bulletSpeed, camdir.y * bulletSpeed, camdir.z * bulletSpeed);
    this.applyCentralImpulse(impulse);

    this.__dirtyPosition = true;
    this.__dirtyRotation = true;
}

/**
 * The current timer using lifespan and canBeRemoved variable
 */
BulletObject.prototype.animate = function () {
    (this.lifespan < 0 && !this.canBeRemoved) ? this.canBeRemoved = true : this.lifespan--;
}

/**
 * Returns the mesh of the player
 * @returns {type} 
 */
BulletObject.prototype.getMesh = function () {
    return this.mesh;
}


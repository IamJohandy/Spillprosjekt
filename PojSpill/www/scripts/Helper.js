/**
 * Removes bullets from the game when its lifespan has passed
 */
function removeLifespanBullet() {
    for (var i = 0; i < allModels.length; i++) {
        allModels[i].animate();
        if (allModels[i].canBeRemoved) {
            var removeableObject = allModels[i];
            allModels.splice(i, 1);
            removeableObject.bulletGeometry.dispose();
            removeableObject.bulletMaterial.dispose();
            scene.remove(removeableObject);
        }
    }
}
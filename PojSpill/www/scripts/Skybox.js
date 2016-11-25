/**
 * Creates a skybox.
 * 
 * @param {size} size The desired size in pixel width and height of the image.
 * @param {indexPath} indexPath The descriptive name path for the skybox image.
 * @param {extension} extension The extension for the image.
 */
function addSkybox(size, indexPath, extension) {
    var imagePrefix = indexPath + "-";
    var directions = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
    var imageSuffix = extension;
    var skyGeometry = new THREE.CubeGeometry(size, size, size);

    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push(new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
            side: THREE.BackSide
        }));
    var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyBox);
}
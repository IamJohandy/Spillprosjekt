/**
 * 
 */

//Koordinatsystemet:
function addCoordSystem(_scene) {
	addAxis(1, _scene); //x-aksen.
	addAxis(2, _scene); //y-aksen.
	addAxis(3, _scene); //z-aksen.
}

//Legger til enkeltakse (stiplet for negativ del av aksen)
//Bruker Geometry - klassen til å lage egne "modeller", her akser som 
//hver består av to punkter av type THREE.Vector3()
function addAxis(_axis, _scene) {
	var fromNeg=new THREE.Vector3( 0, 0, 0 );
	var toNeg=new THREE.Vector3( 0, 0, 0 );
	var fromPos=new THREE.Vector3( 0, 0, 0 );
	var toPos=new THREE.Vector3( 0, 0, 0 );
	var axiscolor = 0x000000;
	
	switch (_axis) {
	case 1: //x-aksen
		fromNeg=new THREE.Vector3( -SIZE, 0, 0 );;
		toNeg=new THREE.Vector3( 0, 0, 0 );
		fromPos=new THREE.Vector3( 0, 0, 0 );
		toPos=new THREE.Vector3( SIZE, 0, 0 );
		axiscolor = 0xff0000;
		break;
	case 2: //y-aksen
		fromNeg=new THREE.Vector3( 0, -SIZE, 0 );
		toNeg=new THREE.Vector3( 0, 0, 0 );
		fromPos=new THREE.Vector3( 0, 0, 0 );
		toPos=new THREE.Vector3( 0, SIZE, 0 );
		axiscolor = 0x00ff00;
		break;
	case 3: //z-aksen
		fromNeg=new THREE.Vector3( 0, 0, -SIZE );
		toNeg=new THREE.Vector3( 0, 0, 0 );
		fromPos=new THREE.Vector3( 0, 0, 0 );
		toPos=new THREE.Vector3( 0, 0, SIZE );
		axiscolor = 0x0000ff;
		break;
	}
	
	var posMat = new THREE.LineBasicMaterial({ linewidth: 2, color: axiscolor });
	var negMat = new THREE.LineDashedMaterial({ linewidth: 2, color: axiscolor, dashSize: 0.5, gapSize: 0.1 });
	
    var gNeg = new THREE.Geometry(); 
    gNeg.vertices.push( fromNeg ); 
    gNeg.vertices.push( toNeg );
    var coordNeg = new THREE.Line(gNeg, negMat, THREE.LinePieces);
    gNeg.computeLineDistances(); // NB!
    _scene.add(coordNeg);
   
    var gPos = new THREE.Geometry(); 
    gPos.vertices.push( fromPos ); 
    gPos.vertices.push( toPos );
    var coordPos = new THREE.Line(gPos, posMat, THREE.LinePieces);
    gPos.computeLineDistances(); 
    _scene.add(coordPos);
}

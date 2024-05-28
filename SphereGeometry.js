function CreateSphere(radius=1) {
    let vertexList = [];
    let lon = -Math.PI; // longitude from -PI to PI
    let lat = -Math.PI * 0.5; // latitude from -PI/2 to PI/2
    const STEP = 0.1;
    while (lon < Math.PI) {
        while (lat < Math.PI * 0.5) {
            let v1 = getLonLatToXYZ(radius, lon, lat);
            let v2 = getLonLatToXYZ(radius, lon + STEP, lat);
            let v3 = getLonLatToXYZ(radius, lon, lat + STEP);
            let v4 = getLonLatToXYZ(radius, lon + STEP, lat + STEP);
            vertexList.push(v1.x, v1.y, v1.z);
            vertexList.push(v2.x, v2.y, v2.z);
            vertexList.push(v3.x, v3.y, v3.z);
            vertexList.push(v3.x, v3.y, v3.z);
            vertexList.push(v4.x, v4.y, v4.z);
            vertexList.push(v2.x, v2.y, v2.z);
            lat += STEP;
        }
        lat = -Math.PI * 0.5
        lon += STEP;
    }
    return vertexList;
}
function getLonLatToXYZ(radius, u, v) {
    let x = radius * Math.sin(u) * Math.cos(v);
    let y = radius * Math.sin(u) * Math.sin(v);
    let z = radius * Math.cos(u);
    return { x: x, y: y, z: z };
}

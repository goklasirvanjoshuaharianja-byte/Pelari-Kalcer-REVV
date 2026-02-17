import * as THREE from 'three';

// --- 1. STATE GAME ---
let isGameOver = true;
let score = 999;
let coinCount = 0;
let currentLane = 0; 
let gameSpeed = 0.8;
const laneDistance = 3.5;
const obstacles = [];
const coins = [];
const trees = [];
let redEyes = null; 

// --- 2. THREE.JS SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202); 
scene.fog = new THREE.Fog(0x020202, 1, 85);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 3. LIGHTING ---
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const neon = new THREE.PointLight(0x00ffff, 15, 50);
neon.position.set(0, 5, 2);
scene.add(neon);

// --- 4. OBJEK DASAR ---
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 2000),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.5 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const player = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5 })
);
player.position.y = 0.6;
scene.add(player);

camera.position.set(0, 5, 10);
camera.lookAt(0, 1, 0);

// --- 5. FITUR MATA MERAH ---
function createRedEyes() {
    const group = new THREE.Group();
    const eyeGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.x = -0.4;
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.x = 0.4;
    
    group.add(leftEye, rightEye);
    group.position.set(0, 2, 25); 
    scene.add(group);
    return group;
}

// --- 6. POHON RECYCLING ---
function createTree(xPos, zPos) {
    const treeGroup = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 6, 8), new THREE.MeshStandardMaterial({ color: 0x4a2c0a }));
    trunk.position.y = 3;
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 0), new THREE.MeshStandardMaterial({ color: 0x0d3b0d }));
    leaves.position.y = 7;
    treeGroup.add(trunk, leaves);
    treeGroup.position.set(xPos, 0, zPos);
    scene.add(treeGroup);
    return treeGroup;
}

// --- 7. LOGIKA SPAWN ---
function spawnObstacle() {
    if (isGameOver) return;
    const numObs = Math.random() > 0.6 ? 2 : 1; 
    const lanes = [-laneDistance, 0, laneDistance].sort(() => 0.5 - Math.random());
    
    for(let i=0; i < numObs; i++) {
        const obs = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2, 4, 8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        obs.position.set(lanes[i], 1.3, -140);
        scene.add(obs);
        obstacles.push(obs);
    }
}

function spawnCoin() {
    if (isGameOver) return;
    const coin = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.1, 8, 16), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700 }));
    coin.position.set([-laneDistance, 0, laneDistance][Math.floor(Math.random() * 3)], 1.0, -140);
    scene.add(coin);
    coins.push(coin);
}

// --- 8. KONTROL (KEYBOARD & TOUCH) ---

// Keyboard
window.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    if (e.key === "ArrowLeft" && currentLane > -1) currentLane--;
    if (e.key === "ArrowRight" && currentLane < 1) currentLane++;
});

// Touch Swipe (Untuk Mobile)
let touchStartX = 0;
let touchEndX = 0;

window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

window.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold && currentLane > -1) currentLane--;
    if (touchEndX > touchStartX + swipeThreshold && currentLane < 1) currentLane++;
}, false);

// --- 9. START & GAME OVER ---
window.startGame = function() {
    document.getElementById('startOverlay').style.display = 'none';
    const bgm = document.getElementById('bgm');
    const sfxScream = document.getElementById('sfxScream');
    if (bgm) { bgm.volume = 0.4; bgm.play().catch(() => {}); }
    if (sfxScream) { sfxScream.play(); sfxScream.pause(); sfxScream.currentTime = 0; }
    
    for (let i = 0; i < 30; i++) {
        trees.push(createTree(-16, -i * 15), createTree(16, -i * 15));
    }
    
    setInterval(spawnObstacle, 1100);
    setInterval(spawnCoin, 800);
    animate();
};

function handleGameOver() {
    if (isGameOver) return;
    isGameOver = true;
    const bgm = document.getElementById('bgm');
    const sfxScream = document.getElementById('sfxScream');
    if (bgm) bgm.pause();
    if (sfxScream) { sfxScream.currentTime = 0; sfxScream.play(); }
    document.getElementById('jumpscareOverlay').style.display = 'block';

    const shake = setInterval(() => {
        camera.position.x += (Math.random() - 0.5) * 0.7;
        camera.position.y += (Math.random() - 0.5) * 0.7;
    }, 30);

    setTimeout(() => {
        clearInterval(shake);
        document.getElementById('jumpscareOverlay').style.display = 'none';
        document.getElementById('gameOverPanel').style.display = 'block';
        document.getElementById('finalScore').innerText = Math.floor(score);
        document.getElementById('finalCoins').innerText = coinCount;
    }, 1600);
    player.material.color.setHex(0xff0000);
}

// --- 10. ANIMATION LOOP ---
function animate() {
    if (isGameOver) return;
    requestAnimationFrame(animate);

    gameSpeed = Math.min(0.8 + (score / 12000), 2.0);
    player.position.x += (currentLane * laneDistance - player.position.x) * 0.15;

    // Mata Merah (Skor 5000)
    if (score > 5000 && !redEyes) {
        redEyes = createRedEyes();
        if(document.getElementById('warning-text')) document.getElementById('warning-text').style.display = 'block';
    }
    if (redEyes) {
        redEyes.position.z -= 0.02; 
        redEyes.position.x = player.position.x; 
        if (redEyes.position.z < 12) redEyes.position.y = 2 + Math.sin(Date.now() * 0.01) * 0.5;
    }

    // Recycling
    trees.forEach(t => { t.position.z += gameSpeed; if(t.position.z > 25) t.position.z = -400; });

    obstacles.forEach((obs, i) => {
        obs.position.z += gameSpeed;
        if (obs.position.z > -0.8 && obs.position.z < 0.8 && Math.abs(player.position.x - obs.position.x) < 1.2) handleGameOver();
        if (obs.position.z > 25) { scene.remove(obs); obstacles.splice(i, 1); }
    });

    coins.forEach((c, i) => {
        c.position.z += gameSpeed;
        c.rotation.y += 0.08;
        if (player.position.distanceTo(c.position) < 1.6) {
            scene.remove(c); coins.splice(i, 1);
            const s = document.getElementById('sfxCoin'); if(s) { s.currentTime=0; s.play(); }
            score += 200; coinCount++;
            document.getElementById('coinCount').innerText = coinCount;
        }
        if (c.position.z > 25) { scene.remove(c); coins.splice(i, 1); }
    });

    score += 0.25;
    document.getElementById('score').innerText = Math.floor(score);
    renderer.render(scene, camera);
}

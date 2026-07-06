// Get the canvas element from the HTML document
const canvas = document.getElementById('gameCanvas');
// Get the 2D rendering context to draw on the canvas
const ctx = canvas.getContext('2d');
let activeSelectedType = 'grass';
// Step 1: Audio Manager Object
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
let ytPlayer;
window.onYouTubeIframeAPIReady = function () {
    audioManager.init();
};
const audioManager = {
    init() {
        ytPlayer = new YT.Player("youtube-player", {
            height: "0",
            width: "0",
            videoId: "Jj74tRQuC9w",
            playerVars: {
                autoplay: 1,
                mute: 1,
                loop: 1,
                playlist: "Jj74tRQuC9w"
            },
            events: {
                onReady: (event) => {
                    event.target.setVolume(35);
                    event.target.unMute();
                    event.target.playVideo();
                }
            }
        });
    }
};
// Step 2: Game State
const gameState = {
    isStarted: false,
    initMenuController: function() {
        const playBtn = document.getElementById('play-button');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                document.getElementById('start-screen').style.display = 'none';
                document.getElementById('game-container').style.display = 'flex';
                this.isStarted = true;
            });
        }
    }
};
// Step 3: blockImages - Load images for the blocks
const blockImages = {
    stone: new Image(),
    grass: new Image(),
    dirt: new Image(),
    sky: new Image(),
    flower: new Image()
};
// Use images.weserv.nl proxy
function createProxyUrl(imageUrl, size = 40) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=${size}&h=${size}&mask=rectangle`;
}
// Load images
blockImages.grass.src = createProxyUrl('https://i.pinimg.com/1200x/bd/cb/64/bdcb6414071ce880f3fa1dc18e2eda5b.jpg');
blockImages.dirt.src = createProxyUrl('https://i.pinimg.com/736x/0e/1f/c2/0e1fc2e0638e878d3ba8db495152164c.jpg');
blockImages.stone.src = createProxyUrl('https://64.media.tumblr.com/22a4c98f65d1241fde7be0299e3289e7/49f0582d0d0f904d-fc/s500x750/6f7b5ec22e628d1fdad364db01a62f05bf34cf17.png');
blockImages.sky.src = createProxyUrl('https://i.pinimg.com/1200x/2b/28/c2/2b28c247bf28bb1ab69bce551084300c.jpg', 800);
blockImages.flower.src = createProxyUrl('https://i.pinimg.com/736x/33/e1/4d/33e14dfea11da0f241e2d9e5f9d77ed0.jpg')
// Track loading
let loadedCount = 0;
const totalBlockImages = 5;
function onBlockImageLoad() {
    loadedCount++;
    console.log(`Loaded ${loadedCount}/${totalBlockImages} blockImages`);
    if (loadedCount === totalBlockImages) {
        console.log('✅ All images loaded! Starting game...');
        initGame();
    }
}
function onBlockImageError(name, url) {
    console.error(`❌ Failed to load ${name}:`, url);
    loadedCount++;
    if (loadedCount === totalBlockImages) {
        initGame();
    }
}
blockImages.grass.onload = () => onBlockImageLoad();
blockImages.grass.onerror = () => onBlockImageError('grass', blockImages.grass.src);
blockImages.dirt.onload = () => onBlockImageLoad();
blockImages.dirt.onerror = () => onBlockImageError('dirt', blockImages.dirt.src);
blockImages.stone.onload = () => onBlockImageLoad();
blockImages.stone.onerror = () => onBlockImageError('stone', blockImages.stone.src);
blockImages.sky.onload = () => onBlockImageLoad();
blockImages.sky.onerror = () => onBlockImageError('sky', blockImages.sky.src);
blockImages.flower.onload = () => onBlockImageLoad();
blockImages.flower.onerror = () => onBlockImageError('flower', blockImages.flower.src);
// Timeout fallback
setTimeout(() => {
    if (loadedCount < totalBlockImages) {
        console.warn('⚠️ Some block images failed to load, starting anyway');
        initGame();
    }
}, 5000);
let grid;
let player;
const keys = { KeyA: false, KeyD: false, Space: false };
// Step 4: Initializes the core game environment
function initGame() {
    gameState.initMenuController();
    grid = createGrid(20, 15);
    grid.initWorld(blockImages);
    player = createPlayer(90, 190);
    window.addEventListener('keydown', e => { if (e.code in keys) keys[e.code] = true; });
    window.addEventListener('keyup', e => { if (e.code in keys) keys[e.code] = false; });
    const UISelectors = document.querySelectorAll('.block-selector');
    UISelectors.forEach(element => {
        element.addEventListener('click', () => {
            document.querySelector('.block-selector.active').classList.remove('active');
            element.classList.add('active');
            activeSelectedType = element.getAttribute('data-type');
        });
    });
    canvas.addEventListener('mousedown', (e) => {
        if (!gameState.isStarted) return;
        const rect = canvas.getBoundingClientRect();
        const clickedGridX = Math.floor((e.clientX - rect.left) / grid.tileSize);
        const clickedGridY = Math.floor((e.clientY - rect.top) / grid.tileSize);
        if (clickedGridX < 0 || clickedGridX >= grid.cols || clickedGridY < 0 || clickedGridY >= grid.rows) return;
        const gridKey = `${clickedGridX},${clickedGridY}`;
        // Remove selection from all blocks
        for (let key in grid.matrix) {
            if (grid.matrix[key]) {
                grid.matrix[key].selected = false;
            }
        }
        if (grid.matrix[gridKey]) {
            grid.matrix[gridKey] = createBlock(
                clickedGridX,
                clickedGridY,
                "sky",
                blockImages.sky
            );
            // Keep the new Sky block selected
            grid.matrix[gridKey].selected = true;
        } else {
            grid.matrix[gridKey] = createBlock(
                clickedGridX, 
                clickedGridY, 
                activeSelectedType, 
                blockImages[activeSelectedType]
            );
            grid.matrix[gridKey].selected = true;
        }
        grid.updateBlockCounts();
    });
    gameLoop();
}
// Step 5: Game Loop - NO BACKGROUND, just clear screen
function gameLoop() {
    if (gameState.isStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Just draw a simple blue background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        player.update();
        grid.draw(ctx);
        player.draw(ctx);
    }
    requestAnimationFrame(gameLoop);
}
// Step 6: Initialize the game environment and Start
initGame();
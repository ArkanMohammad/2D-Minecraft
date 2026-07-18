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
// Step 2: Game State Managment - Track if the game has started and handle the menu controller
const gameState = {
    isStarted: false,
    initMenuController: function() {
        const playBtn = document.getElementById('play-button');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                document.getElementById('start-screen').style.display = 'none';
                document.getElementById('game-container').style.display = 'flex';
                this.isStarted = true;
                // Move focus to window so keyboard controls work instantly
                window.focus();
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
// Helper function to load images securely via proxy (Use images.weserv.nl proxy)
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
//Global references for keys using strict KeyboardEvent codes
const keys = { KeyA: false, KeyD: false, Space: false };
// Step 4: Initializes the core game environment
function initGame() {
    gameState.initMenuController();
    grid = createGrid(20, 15);
    grid.initWorld(blockImages);
    player = createPlayer(0, 0);
    // Strict event listeners catching precise physical key codes
    window.addEventListener('keydown', e => { 
        if (e.code in keys) {
            keys[e.code] = true;
            if (e.code === 'Space') e.preventDefault(); // Prevent page scroll on spacebar press
        }
    });
    
    window.addEventListener('keyup', e => { 
        if (e.code in keys) {
            keys[e.code] = false; 
        }
    });
    // UI Block Selector Event Listeners
    const UISelectors = document.querySelectorAll('.block-selector');
    UISelectors.forEach(element => {
        element.addEventListener('click', () => {
            const activeEl = document.querySelector('.block-selector.active');
            if (activeEl) {
                activeEl.classList.remove('active');
            }
            element.classList.add('active');
            activeSelectedType = element.getAttribute('data-type');
            window.focus();
        });
    });
    // Mouse click listener for mining and building
    canvas.addEventListener('click', handleCanvasClick);
    gameLoop();
}
// Step 5: Handle Mouse click logic (Mine and Place engine)
function handleCanvasClick(e) {
    if (!gameState.isStarted) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    // Turn screen click pixels into grid cell positions
    const clickedGridX = Math.floor(mouseX / grid.tileSize);
    const clickedGridY = Math.floor(mouseY / grid.tileSize);
    // Exit if click falls outside canvas bounds
    if (clickedGridX < 0 || clickedGridX >= grid.cols || clickedGridY < 0 || clickedGridY >= grid.rows) return;
    
    const gridKey = `${clickedGridX},${clickedGridY}`;
    
    // Clear yellow selected border on all blocks
    for (let key in grid.matrix) {
        if (grid.matrix[key]) {
            grid.matrix[key].selected = false;
        }
    }
    
    if (grid.matrix[gridKey]) {
        const targetBlock = grid.matrix[gridKey];
     
        if (activeSelectedType === 'shovel') {
            // Mine Mode: If shovel is selected, replace current tile with sky
            if (targetBlock.type !== 'sky') {
                grid.matrix[gridKey] = createBlock(clickedGridX, clickedGridY, 'sky', blockImages.sky);
                grid.matrix[gridKey].selected = true;
            }
        } else {
            // Build Mode: If a block is chosen, replace sky tiles with it
            if (targetBlock.type === 'sky') {
                grid.matrix[gridKey] = createBlock(clickedGridX, clickedGridY, activeSelectedType, blockImages[activeSelectedType]);
                grid.matrix[gridKey].selected = true;
            }
        }
        
        // Refresh sidebar counting balances
        grid.updateBlockCounts();
    }
}
// Step 6: Infinite frame logic refresh loop
function gameLoop() {
    if (gameState.isStarted) {
        // Apply walk velocity configurations
        player.vx = 0;
        if (keys['KeyA']) player.vx = -4;
        if (keys['KeyD']) player.vx = 4;
        //If pressing S, increase downward speed (fast drop)
        if (keys['Space'] && player.vy === 0) {
            player.vy = -10;
        }
        // Run player physics updates
        player.vy += player.gravity;
        player.update();
        // Draw blue backdrop environment layer
        ctx.fillStyle = '#54b4f3';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Render updated map grid layouts and player
        grid.draw(ctx);
        player.draw(ctx);
    }
    requestAnimationFrame(gameLoop);
}
// Step 7: Initialize the game environment and Start
initGame();
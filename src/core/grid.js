function createGrid(cols, rows) {
    return {
        cols: cols,
        rows: rows,
        tileSize: 40,
        matrix: {}, 
        initWorld: function(blockImages) {
            this.matrix = {}; // Reset world layout container safely
            // skyDepths heights for rolling hills
            const skyDepths = [8, 7, 6, 7, 8, 9, 10, 9, 8, 7, 6, 7, 8, 9, 10, 9, 8, 7, 6, 7];
            for (let x = 0; x < this.cols; x++) {
                // Determine the grass line row for this specific column
                const grassRow = skyDepths[x];
                for (let y = 0; y < this.rows; y++) {
                    if((x===5 && y===8) || (x===6 && y===9) ||(x===7 && y===8) || (x===13 && y===8) || (x===14 && y===9) ||(x===15 && y===8) || (x===10 && y===2)|| (x===7 && y===5) || (x===13 && y===5)){
                        this.matrix[`${x},${y}`] = createBlock(x, y, 'flower', blockImages.flower);
                    }else if((x===5 && y===6) || (x===6 && y===5) ||(x===7 && y===6) || (x===8 && y===5)|| (x===9 && y===4) || (x===10 && y===4) || (x===10 && y===3) || (x===11 && y===4) || (x===12 && y===5)|| (x===13 && y===6) || (x===14 && y===5) ||(x===15 && y===6)){
                        this.matrix[`${x},${y}`] = createBlock(x, y, 'grass', blockImages.grass);
                    }else if (y < grassRow) {
                        // SKY BLOCKS: Fill all empty space above ground
                        this.matrix[`${x},${y}`] = createBlock(x, y, 'sky', blockImages.sky);
                    } else if (y === grassRow) {
                        // GRASS: Topmost layer
                        this.matrix[`${x},${y}`] = createBlock(x, y, 'grass', blockImages.grass);
                    } else if (y > grassRow && y < grassRow + 3) {
                        // DIRT: Middle layers (3 layers deep)
                        this.matrix[`${x},${y}`] = createBlock(x, y, 'dirt', blockImages.dirt);
                    } else if (y >= grassRow + 3) {
                        // STONE: Underground layers
                        this.matrix[`${x},${y}`] = createBlock(x, y, 'stone', blockImages.stone);
                    }
                }
            }
            this.updateBlockCounts();
        },
        updateBlockCounts: function() {
            const counts = { grass: 0, dirt: 0, stone: 0, sky: 0 };
            for (let key in this.matrix) {
                const block = this.matrix[key];
                if (block && counts.hasOwnProperty(block.type)) {
                    counts[block.type]++;
                }
            }
            const grassEl = document.getElementById('count-grass');
            const dirtEl = document.getElementById('count-dirt');
            const stoneEl = document.getElementById('count-stone');
            const skyEl = document.getElementById('count-sky');
            if (grassEl) grassEl.innerText = counts.grass;
            if (dirtEl) dirtEl.innerText = counts.dirt;
            if (stoneEl) stoneEl.innerText = counts.stone;
            if (skyEl) skyEl.innerText = counts.sky;
        },
        draw: function(ctx) {
            for (let key in this.matrix) {
                if (this.matrix[key]) {
                    this.matrix[key].draw(ctx);
                }
            }
        }
    };
}
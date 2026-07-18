function createPlayer(startX, startY) {
    // Load the Minecraft Steve image using a reliable proxy to avoid CORS issues
    const steveImage = new Image();
    steveImage.src = 'https://images.weserv.nl/?url=' + encodeURIComponent('https://i.pinimg.com/736x/6c/e8/4e/6ce84ec1cb08201c91b8deee19135b23.jpg') + '&w=24&h=50&mask=rectangle';
    return {
        x: startX,
        y: startY,
        width: 24,
        height: 50,
        vx: 0,
        vy: 0,
        gravity: 0.5,
        draw: function(ctx) {
            // Only draw the player if the image has successfully loaded
            if (steveImage.complete && steveImage.naturalWidth !== 0) {
                ctx.drawImage(steveImage, this.x, this.y, this.width, this.height);
            }
            // If the image fails to load, nothing will be drawn (no red fallback or borders)
        },
        update: function() {
            // Move horizontally and handle screen borders
            this.x += this.vx;
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > 800) this.x = 800 - this.width;
            // Move vertically
            this.y += this.vy;
            //Top edge - Stop player from leaving sky roof
            if (this.y < 0) {
                this.y = 0;
                this.vy = 0; // Cancel remaining upward velocity instantly
            }
            this.handleGridCollisions();
        },
        handleGridCollisions: function() {
            const tileSize = 40;
            // Calculate which grid indexes the player's feet are touching
            const footY = this.y + this.height;
            const leftCol = Math.floor(this.x / tileSize);
            const rightCol = Math.floor((this.x + this.width) / tileSize);
            const rowAtFeet = Math.floor(footY / tileSize);
            // Check if there is a solid block underneath the left or right side of the feet
            const leftBlockKey = `${leftCol},${rowAtFeet}`;
            const rightBlockKey = `${rightCol},${rowAtFeet}`;            
            // Check what block types are under his feet
            const leftBlock = grid && grid.matrix[leftBlockKey];
            const rightBlock = grid && grid.matrix[rightBlockKey];
            // Only stop the player if the block is solid AND the player is NOT pressing S
            const hasSolidLeft = leftBlock && leftBlock.type !== 'sky';
            const hasSolidRight = rightBlock && rightBlock.type !== 'sky';
           if ((hasSolidLeft || hasSolidRight)) {
                if (this.vy > 0) {
                    this.y = (rowAtFeet * tileSize) - this.height;
                    this.vy = 0;
                }
            }
            // Screen floor fallback safety check
            if (this.y + this.height > 600) {
                this.y = 600 - this.height;
                this.vy = 0;
            }
        }
    };
}
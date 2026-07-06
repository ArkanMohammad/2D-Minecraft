function createBlock(gridX, gridY, type, imgElement) {
    const tileSize = 40;
    return {
        gridX: gridX,
        gridY: gridY,
        type: type,
        image: imgElement,
        selected: false,
        draw: function(ctx) {
            const pixelX = this.gridX * tileSize;
            const pixelY = this.gridY * tileSize;
            // Check if the proxy successfully delivered the image source
            if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
                ctx.drawImage(this.image, pixelX, pixelY, tileSize, tileSize);
            } else {
                // Temporary backup color parameters while the proxy links resolve over the web network
                const fallbacks = { grass: '#2ecc71', dirt: '#875a36', stone: '#7f8c8d', sky: '#3498db'};
                ctx.fillStyle = fallbacks[this.type] || '#555';
                ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
            }
            // Draw subtle block tile grid dividers
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(pixelX, pixelY, tileSize, tileSize);
            if (this.selected) {
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(pixelX, pixelY, tileSize, tileSize);
            }
        }
    };
}
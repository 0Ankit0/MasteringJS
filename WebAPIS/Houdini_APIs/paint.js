// Define a custom paint worklet
class MyPaintWorklet {
    // The paint method is called when the element is painted
    paint(ctx, size, properties) {
        // Set the fill style to red
        ctx.fillStyle = 'red';

        // Fill the entire area of the element with a red rectangle
        ctx.fillRect(0, 0, size.width, size.height);
    }
}

// Register the custom paint worklet with the name 'my-red-paint'
registerPaint('my-red-paint', MyPaintWorklet);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('textInput');
const pencilBtn = document.getElementById('pencil');
const lineBtn = document.getElementById('line');
const rectangleBtn = document.getElementById('rectangle');
const circleBtn = document.getElementById('circle');
const handBtn = document.getElementById('hand');

let currentTool = 'pencil';
let isDrawing = false;
let startX, startY;
let shapes = [];
let selectedShape = null;
let dragging = false;

// Tool Selection
pencilBtn.addEventListener('click', () => setTool('pencil'));
lineBtn.addEventListener('click', () => setTool('line'));
rectangleBtn.addEventListener('click', () => setTool('rectangle'));
circleBtn.addEventListener('click', () => setTool('circle'));
handBtn.addEventListener('click', () => setTool('hand'));

function setTool(tool) {
    currentTool = tool;
    canvas.style.cursor = tool === 'hand' ? 'default' : 'crosshair';
    selectedShape = null;
    dragging = false; // Reset dragging state
    redrawCanvas();
}

// Mouse Events
canvas.addEventListener('mousedown', (e) => {
    const { offsetX, offsetY } = e;
    startX = offsetX;
    startY = offsetY;

    if (currentTool === 'hand') {
        selectedShape = shapes.find((shape) => isInsideShape(offsetX, offsetY, shape));
        if (selectedShape) {
            dragging = true;
            if (selectedShape.type === 'rectangle' || selectedShape.type === 'circle') {
                selectedShape.dragStartX = selectedShape.x;
                selectedShape.dragStartY = selectedShape.y;
            } else if (selectedShape.type === 'line') {
                selectedShape.dragStartX1 = selectedShape.x1;
                selectedShape.dragStartY1 = selectedShape.y1;
                selectedShape.dragStartX2 = selectedShape.x2;
                selectedShape.dragStartY2 = selectedShape.y2;
            } else if (selectedShape.type === 'pencil') {
                selectedShape.dragPath = selectedShape.path.map(p => ({ ...p }));
            }
            selectedShape.dragStartOffsetX = offsetX;
            selectedShape.dragStartOffsetY = offsetY;
            redrawCanvas();
        }
    } else {
        isDrawing = true;
        if (currentTool === 'pencil') {
            shapes.push({ type: 'pencil', path: [{ x: offsetX, y: offsetY }] });
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const { offsetX, offsetY } = e;

    if (isDrawing && currentTool !== 'hand') {
        const width = offsetX - startX;
        const height = offsetY - startY;

        if (currentTool === 'rectangle') {
            redrawCanvas();
            ctx.strokeRect(startX, startY, width, height);
        } else if (currentTool === 'circle') {
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            redrawCanvas();
            ctx.beginPath();
            ctx.arc(startX + width / 2, startY + height / 2, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (currentTool === 'line') {
            redrawCanvas();
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
        } else if (currentTool === 'pencil') {
            const pencilShape = shapes[shapes.length - 1];
            pencilShape.path.push({ x: offsetX, y: offsetY });
            redrawCanvas();
        }
    }

    if (dragging && currentTool === 'hand' && selectedShape) {
        const dx = offsetX - selectedShape.dragStartOffsetX;
        const dy = offsetY - selectedShape.dragStartOffsetY;

        if (selectedShape.type === 'rectangle' || selectedShape.type === 'circle') {
            selectedShape.x = selectedShape.dragStartX + dx;
            selectedShape.y = selectedShape.dragStartY + dy;
        } else if (selectedShape.type === 'line') {
            selectedShape.x1 = selectedShape.dragStartX1 + dx;
            selectedShape.y1 = selectedShape.dragStartY1 + dy;
            selectedShape.x2 = selectedShape.dragStartX2 + dx;
            selectedShape.y2 = selectedShape.dragStartY2 + dy;
        } else if (selectedShape.type === 'pencil') {
            selectedShape.path = selectedShape.dragPath.map(p => ({
                x: p.x + dx,
                y: p.y + dy
            }));
        }
        redrawCanvas();
    }

    if (currentTool === 'hand') {
        canvas.style.cursor = selectedShape ? 'move' : 'default';
    }
});

canvas.addEventListener('mouseup', (e) => {
    const { offsetX, offsetY } = e;

    if (isDrawing) {
        const width = offsetX - startX;
        const height = offsetY - startY;

        if (currentTool === 'rectangle') {
            // Ensure positive width and height
            const x = width < 0 ? startX + width : startX;
            const y = height < 0 ? startY + height : startY;
            shapes.push({
                type: 'rectangle',
                x: x,
                y: y,
                width: Math.abs(width),
                height: Math.abs(height)
            });
        } else if (currentTool === 'circle') {
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            const centerX = startX + width / 2;
            const centerY = startY + height / 2;
            shapes.push({
                type: 'circle',
                x: centerX,
                y: centerY,
                radius: radius
            });
        } else if (currentTool === 'line') {
            shapes.push({
                type: 'line',
                x1: startX,
                y1: startY,
                x2: offsetX,
                y2: offsetY
            });
        }
    }

    isDrawing = false;
    dragging = false;
    redrawCanvas();
});

canvas.addEventListener('dblclick', (e) => {
    const { offsetX, offsetY } = e;
    textInput.style.display = 'block';
    textInput.style.left = `${e.clientX}px`;
    textInput.style.top = `${e.clientY}px`;
    textInput.value = '';
    textInput.focus();

    textInput.addEventListener('blur', () => {
        shapes.push({ type: 'text', x: offsetX, y: offsetY, text: textInput.value });
        textInput.style.display = 'none';
        redrawCanvas();
    });
});

// Helpers
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(drawShape);
    if (selectedShape) drawBoundingBox(selectedShape);
}

function drawShape(shape) {
    if (shape.type === 'rectangle') {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
    } else if (shape.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
        ctx.closePath();
    } else if (shape.type === 'pencil') {
        ctx.beginPath();
        shape.path.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
    } else if (shape.type === 'text') {
        ctx.font = '16px Arial';
        ctx.fillText(shape.text, shape.x, shape.y);
    }
}

function isInsideShape(x, y, shape) {
    if (shape.type === 'rectangle') {
        return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
    } else if (shape.type === 'circle') {
        const dx = x - shape.x;
        const dy = y - shape.y;
        return Math.sqrt(dx ** 2 + dy ** 2) <= shape.radius;
    } else if (shape.type === 'line') {
        const distance = Math.abs((shape.y2 - shape.y1) * x - (shape.x2 - shape.x1) * y + shape.x2 * shape.y1 - shape.y2 * shape.x1) /
            Math.sqrt((shape.y2 - shape.y1) ** 2 + (shape.x2 - shape.x1) ** 2);
        return distance < 5;
    } else if (shape.type === 'pencil') {
        // Check if point is inside the bounding box first
        const minX = Math.min(...shape.path.map(p => p.x));
        const minY = Math.min(...shape.path.map(p => p.y));
        const maxX = Math.max(...shape.path.map(p => p.x));
        const maxY = Math.max(...shape.path.map(p => p.y));

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            // Check proximity to any line segment in the path
            for (let i = 1; i < shape.path.length; i++) {
                const p1 = shape.path[i - 1];
                const p2 = shape.path[i];
                const distance = Math.abs((p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x) /
                    Math.sqrt((p2.y - p1.y) ** 2 + (p2.x - p1.x) ** 2);
                if (distance < 5) return true;
            }
        }
        return false;
    }
    return false;
}

function drawBoundingBox(shape) {
    ctx.setLineDash([4, 2]);
    ctx.strokeStyle = 'blue';
    const gap = 5; // Small gap between the object and the outline
    if (shape.type === 'rectangle') {
        ctx.strokeRect(shape.x - gap, shape.y - gap, shape.width + 2 * gap, shape.height + 2 * gap);
    } else if (shape.type === 'circle') {
        ctx.strokeRect(shape.x - shape.radius - gap, shape.y - shape.radius - gap, shape.radius * 2 + 2 * gap, shape.radius * 2 + 2 * gap);
    } else if (shape.type === 'line') {
        const minX = Math.min(shape.x1, shape.x2);
        const minY = Math.min(shape.y1, shape.y2);
        const width = Math.abs(shape.x2 - shape.x1);
        const height = Math.abs(shape.y2 - shape.y1);
        ctx.strokeRect(minX - gap, minY - gap, width + 2 * gap, height + 2 * gap);
    } else if (shape.type === 'pencil') {
        const minX = Math.min(...shape.path.map((p) => p.x));
        const minY = Math.min(...shape.path.map((p) => p.y));
        const maxX = Math.max(...shape.path.map((p) => p.x));
        const maxY = Math.max(...shape.path.map((p) => p.y));
        ctx.strokeRect(minX - gap, minY - gap, maxX - minX + 2 * gap, maxY - minY + 2 * gap);
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = 'black';
}



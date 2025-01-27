class Pencil {
    constructor(startX, startY) {
        this.path = [{ x: startX, y: startY }];
    }

    addPoint(x, y) {
        this.path.push({ x, y });
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        this.path.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
    }

    isInside(x, y) {
        const sensitivity = 8;
        for (let i = 1; i < this.path.length; i++) {
            const p1 = this.path[i - 1];
            const p2 = this.path[i];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const t = ((x - p1.x) * dx + (y - p1.y) * dy) / (dx * dx + dy * dy);
            const closest = t < 0 ? p1 : t > 1 ? p2 : {
                x: p1.x + t * dx,
                y: p1.y + t * dy
            };
            if (Math.hypot(x - closest.x, y - closest.y) < sensitivity) return true;
        }
        return false;
    }

    startDragging(startX, startY) {
        this.offsetX = startX - this.path[0].x;
        this.offsetY = startY - this.path[0].y;
        this.originalPath = [...this.path];
    }

    drag(currentX, currentY) {
        const dx = currentX - this.offsetX - this.originalPath[0].x;
        const dy = currentY - this.offsetY - this.originalPath[0].y;
        this.path = this.originalPath.map(p => ({ x: p.x + dx, y: p.y + dy }));
    }

    drawBoundingBox(ctx) {
        const xs = this.path.map(p => p.x);
        const ys = this.path.map(p => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);

        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#2196F3';
        ctx.strokeRect(minX - 8, minY - 8, maxX - minX + 16, maxY - minY + 16);
        ctx.restore();
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }

    isInside(x, y) {
        const buffer = 8;
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const length = Math.hypot(dx, dy);
        const t = Math.max(0, Math.min(1, ((x - this.x1) * dx + (y - this.y1) * dy) / (length * length)));
        const closestX = this.x1 + t * dx;
        const closestY = this.y1 + t * dy;
        return Math.hypot(x - closestX, y - closestY) < buffer;
    }

    startDragging(startX, startY) {
        this.offsetX = startX - (this.x1 + this.x2) / 2;
        this.offsetY = startY - (this.y1 + this.y2) / 2;
        this.origX1 = this.x1;
        this.origY1 = this.y1;
        this.origX2 = this.x2;
        this.origY2 = this.y2;
    }

    drag(currentX, currentY) {
        const dx = currentX - this.offsetX - (this.origX1 + this.origX2) / 2;
        const dy = currentY - this.offsetY - (this.origY1 + this.origY2) / 2;
        this.x1 = this.origX1 + dx;
        this.y1 = this.origY1 + dy;
        this.x2 = this.origX2 + dx;
        this.y2 = this.origY2 + dy;
    }

    drawBoundingBox(ctx) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#2196F3';
        const minX = Math.min(this.x1, this.x2);
        const minY = Math.min(this.y1, this.y2);
        ctx.strokeRect(
            minX - 8,
            minY - 8,
            Math.abs(this.x2 - this.x1) + 16,
            Math.abs(this.y2 - this.y1) + 16
        );
        ctx.restore();
    }
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    isInside(x, y) {
        return x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height;
    }

    startDragging(startX, startY) {
        this.offsetX = startX - this.x;
        this.offsetY = startY - this.y;
    }

    drag(currentX, currentY) {
        this.x = currentX - this.offsetX;
        this.y = currentY - this.offsetY;
    }

    drawBoundingBox(ctx) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#2196F3';
        ctx.strokeRect(this.x - 8, this.y - 8, this.width + 16, this.height + 16);
        ctx.restore();
    }
}

class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    isInside(x, y) {
        return Math.hypot(x - this.x, y - this.y) <= this.radius;
    }

    startDragging(startX, startY) {
        this.offsetX = startX - this.x;
        this.offsetY = startY - this.y;
    }

    drag(currentX, currentY) {
        this.x = currentX - this.offsetX;
        this.y = currentY - this.offsetY;
    }

    drawBoundingBox(ctx) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#2196F3';
        ctx.strokeRect(
            this.x - this.radius - 8,
            this.y - this.radius - 8,
            this.radius * 2 + 16,
            this.radius * 2 + 16
        );
        ctx.restore();
    }
}

class Text {
    constructor(x, y, content) {
        this.x = x;
        this.y = y;
        this.content = content;
    }

    draw(ctx) {
        ctx.font = '16px Arial';
        ctx.fillText(this.content, this.x, this.y);
    }

    isInside(x, y) {
        const measure = ctx.measureText(this.content);
        return x >= this.x && x <= this.x + measure.width &&
            y >= this.y - 16 && y <= this.y;
    }

    startDragging(startX, startY) {
        this.offsetX = startX - this.x;
        this.offsetY = startY - this.y;
    }

    drag(currentX, currentY) {
        this.x = currentX - this.offsetX;
        this.y = currentY - this.offsetY;
    }

    drawBoundingBox(ctx) {
        const measure = ctx.measureText(this.content);
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#2196F3';
        ctx.strokeRect(this.x - 8, this.y - 24, measure.width + 16, 20);
        ctx.restore();
    }
}

class CanvasApp {
    constructor(canvas, textInput) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.lineWidth = 2;
        this.textInput = textInput;
        this.shapes = [];
        this.currentTool = 'pencil';
        this.isDrawing = false;
        this.selectedShape = null;
        this.startX = 0;
        this.startY = 0;
        this.dragging = false;
        this.initialize();
    }

    initialize() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.canvas.addEventListener('mousedown', e => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', e => this.onMouseUp(e));
        this.canvas.addEventListener('dblclick', e => this.onDoubleClick(e));

        document.querySelectorAll('.toolbar button').forEach(button => {
            button.addEventListener('click', () => {
                this.setTool(button.id);
                document.querySelectorAll('.toolbar button').forEach(b =>
                    b.style.backgroundColor = b === button ? '#ddd' : '#fff');
            });
        });
    }

    setTool(tool) {
        this.currentTool = tool;
        this.canvas.style.cursor = tool === 'hand' ? 'grab' : 'crosshair';
        this.selectedShape = null;
        this.redrawCanvas();
    }

    onMouseDown(e) {
        const { offsetX: x, offsetY: y } = e;
        this.startX = x;
        this.startY = y;

        if (this.currentTool === 'hand') {
            this.selectedShape = this.shapes.find(shape => shape.isInside(x, y));
            if (this.selectedShape) {
                this.dragging = true;
                this.selectedShape.startDragging(x, y);
            }
        } else {
            this.isDrawing = true;
            if (this.currentTool === 'pencil') {
                this.shapes.push(new Pencil(x, y));
            }
        }
    }

    onMouseMove(e) {
        const { offsetX: x, offsetY: y } = e;

        if (this.isDrawing) {
            switch (this.currentTool) {
                case 'rectangle':
                    this.redrawCanvas();
                    new Rectangle(
                        Math.min(this.startX, x),
                        Math.min(this.startY, y),
                        Math.abs(x - this.startX),
                        Math.abs(y - this.startY)
                    ).draw(this.ctx);
                    break;
                case 'circle':
                    this.redrawCanvas();
                    const radius = Math.hypot(x - this.startX, y - this.startY);
                    new Circle(this.startX, this.startY, radius).draw(this.ctx);
                    break;
                case 'line':
                    this.redrawCanvas();
                    new Line(this.startX, this.startY, x, y).draw(this.ctx);
                    break;
                case 'pencil':
                    this.shapes[this.shapes.length - 1].addPoint(x, y);
                    this.redrawCanvas();
                    break;
            }
        }

        if (this.dragging && this.selectedShape) {
            this.selectedShape.drag(x, y);
            this.redrawCanvas();
        }
    }

    onMouseUp(e) {
        const { offsetX: x, offsetY: y } = e;

        if (this.isDrawing) {
            switch (this.currentTool) {
                case 'rectangle':
                    this.shapes.push(new Rectangle(
                        Math.min(this.startX, x),
                        Math.min(this.startY, y),
                        Math.abs(x - this.startX),
                        Math.abs(y - this.startY)
                    ));
                    break;
                case 'circle':
                    const radius = Math.hypot(x - this.startX, y - this.startY);
                    this.shapes.push(new Circle(this.startX, this.startY, radius));
                    break;
                case 'line':
                    this.shapes.push(new Line(this.startX, this.startY, x, y));
                    break;
            }
        }

        this.isDrawing = false;
        this.dragging = false;
        this.redrawCanvas();
    }

    onDoubleClick(e) {
        const { offsetX: x, offsetY: y } = e;
        this.textInput.style.display = 'block';
        this.textInput.style.left = `${e.clientX}px`;
        this.textInput.style.top = `${e.clientY}px`;
        this.textInput.value = '';
        this.textInput.focus();

        this.textInput.addEventListener('blur', () => {
            if (this.textInput.value) {
                this.shapes.push(new Text(x, y, this.textInput.value));
                this.redrawCanvas();
            }
            this.textInput.style.display = 'none';
        }, { once: true });
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#000';
        this.shapes.forEach(shape => shape.draw(this.ctx));
        if (this.selectedShape) this.selectedShape.drawBoundingBox(this.ctx);
    }
}

// Initialize the app
const canvas = document.getElementById('canvas');
const textInput = document.getElementById('textInput');
new CanvasApp(canvas, textInput);
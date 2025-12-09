const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const socket = io(); 

// UI ELEMENTS
const colorPicker = document.getElementById('colorPicker');
const widthPicker = document.getElementById('widthPicker');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Initial State
let currentColor = '#000000';
let currentWidth = 5;

// Listen for changes in the toolbar
colorPicker.addEventListener('change', (e) => currentColor = e.target.value);
widthPicker.addEventListener('change', (e) => currentWidth = e.target.value);

// --- DRAWING LOGIC ---

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    // 1. Draw locally with CURRENT settings
    drawLine({
        x0: lastX,
        y0: lastY,
        x1: e.offsetX,
        y1: e.offsetY,
        color: currentColor,
        width: currentWidth
    });

    // 2. Send data + STYLE to server
    socket.emit('draw', {
        x0: lastX,
        y0: lastY,
        x1: e.offsetX,
        y1: e.offsetY,
        color: currentColor,     // <--- NEW
        width: currentWidth      // <--- NEW
    });

    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener('mouseup', () => isDrawing = false);

// --- SOCKET LISTENER ---

socket.on('draw', (data) => {
    drawLine(data);
});

// Universal Draw Function (Handles styles now)
function drawLine(data) {
    ctx.beginPath();
    ctx.moveTo(data.x0, data.y0);
    ctx.lineTo(data.x1, data.y1);
    
    // Use the style from the data package
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.stroke();
}
import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
    try {
        const { faceSkinColor, faceShape, mouthExpression, background } = await request.json();

        // Validate input data from client
        if (!faceSkinColor || !faceShape || !mouthExpression || !background) {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
        }

        // Create canvas
        const width = 400;
        const height = 400;
        const canvas: Canvas = createCanvas(width, height);
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

        // Background
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);

        // Helper functions
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function getRandom(min: number, max: number, seedOffset: number = 0): number {
            // For preview, we'll use a simple random function without a seed
            return Math.random() * (max - min) + min;
        }

        function drawScratchyCircle(
            x: number, y: number, radius: number,
            color: string, lineWidth: number, fillColor?: string
        ): void {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            for (let i = 0; i <= 25; i++) {
                const angle = (i / 25) * Math.PI * 2;
                const jitter = getRandom(-8, 8, i);
                const cx = x + Math.cos(angle) * (radius + jitter);
                const cy = y + Math.sin(angle) * (radius + jitter);
                if (i === 0) ctx.moveTo(cx, cy);
                else ctx.lineTo(cx, cy);
            }
            ctx.closePath();
            if (fillColor) {
                ctx.fillStyle = fillColor;
                ctx.fill();
            }
            ctx.stroke();
            for (let i = 0; i < 5; i++) {
                const angle = getRandom(0, Math.PI * 2, i);
                const r = radius + getRandom(-5, 5, i);
                const sx = x + Math.cos(angle) * r;
                const sy = y + Math.sin(angle) * r;
                drawScratchyLine(sx, sy, sx + getRandom(-10, 10, i), sy + getRandom(-10, 10, i), color, 1);
            }
        }

        function drawScratchyLine(x1: number, y1: number, x2: number, y2: number, color: string, lineWidth: number): void {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            for (let i = 0; i <= 15; i++) {
                const t = i / 15;
                const x = x1 + t * (x2 - x1) + getRandom(-8, 8, i);
                const y = y1 + t * (y2 - y1) + getRandom(-8, 8, i);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        function drawFaceShape(x: number, y: number, shape: string, w: number, h: number): void {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.fillStyle = faceSkinColor;
            if (shape === 'oval') {
                for (let i = 0; i <= 25; i++) {
                    const angle = (i / 25) * Math.PI * 2;
                    const cx = x + Math.cos(angle) * w / 2 + getRandom(-8, 8, i);
                    const cy = y + Math.sin(angle) * h / 2 + getRandom(-8, 8, i);
                    if (i === 0) ctx.moveTo(cx, cy);
                    else ctx.lineTo(cx, cy);
                }
            } else if (shape === 'long') {
                for (let i = 0; i <= 25; i++) {
                    const angle = (i / 25) * Math.PI * 2;
                    const cx = x + Math.cos(angle) * w / 2 * 0.8 + getRandom(-8, 8, i);
                    const cy = y + Math.sin(angle) * h / 2 * 1.2 + getRandom(-8, 8, i);
                    if (i === 0) ctx.moveTo(cx, cy);
                    else ctx.lineTo(cx, cy);
                }
            } else if (shape === 'round') {
                for (let i = 0; i <= 25; i++) {
                    const angle = (i / 25) * Math.PI * 2;
                    const cx = x + Math.cos(angle) * w / 2 * 1.1 + getRandom(-8, 8, i);
                    const cy = y + Math.sin(angle) * h / 2 * 1.1 + getRandom(-8, 8, i);
                    if (i === 0) ctx.moveTo(cx, cy);
                    else ctx.lineTo(cx, cy);
                }
            } else if (shape === 'square') {
                const points: [number, number][] = [
                    [x - w / 2, y - h / 2], [x + w / 2, y - h / 2],
                    [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]
                ];
                points.forEach(([px, py], i) => {
                    const cx = px + getRandom(-8, 8, i);
                    const cy = py + getRandom(-8, 8, i);
                    if (i === 0) ctx.moveTo(cx, cy);
                    else ctx.lineTo(cx, cy);
                });
            } else if (shape === 'diamond') {
                const points: [number, number][] = [
                    [x, y - h / 2], [x + w / 2, y],
                    [x, y + h / 2], [x - w / 2, y]
                ];
                points.forEach(([px, py], i) => {
                    const cx = px + getRandom(-8, 8, i);
                    const cy = py + getRandom(-8, 8, i);
                    if (i === 0) ctx.moveTo(cx, cy);
                    else ctx.lineTo(cx, cy);
                });
            } else if (shape === 'triangle') {
                const points: [number, number][] = [
                    [x, y - h / 2], [x + w / 2, y + h / 2],
                    [x - w / 2, y + h / 2]
                ];
                points.forEach(([px, py], i) => {
                    const cx = px + getRandom(-8, 8, i);
                    const cy = py + getRandom(-8, 8, i);
                    if (i === 0) ctx.moveTo(cx, cy);
                    else ctx.lineTo(cx, cy);
                });
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            for (let i = 0; i < 8; i++) {
                const angle = getRandom(0, Math.PI * 2, i);
                const r = w / 2 + getRandom(-10, 10, i);
                const sx = x + Math.cos(angle) * r;
                const sy = y + Math.sin(angle) * r;
                drawScratchyLine(sx, sy, sx + getRandom(-15, 15, i), sy + getRandom(-15, 15, i), 'black', 1);
            }
        }

        function drawMouth(x: number, y: number, expression: string, faceWidth: number): void {
            const mouthWidth = faceWidth * 0.6;
            const mouthStart: [number, number] = [x - mouthWidth / 2, y + getRandom(40, 60)];
            const mouthEnd: [number, number] = [x + mouthWidth / 2, y + getRandom(40, 60)];
            let mouthMiddle: [number, number];

            if (expression === 'smiling') {
                mouthMiddle = [x, y + getRandom(50, 70)];
                drawScratchyLine(mouthStart[0], mouthStart[1], mouthMiddle[0], mouthMiddle[1], 'black', 4);
                drawScratchyLine(mouthMiddle[0], mouthMiddle[1], mouthEnd[0], mouthEnd[1], 'black', 4);
            } else if (expression === 'laughing') {
                mouthMiddle = [x, y + getRandom(60, 80)];
                drawScratchyLine(mouthStart[0], mouthStart[1], mouthMiddle[0], mouthMiddle[1], 'black', 4);
                drawScratchyLine(mouthMiddle[0], mouthMiddle[1], mouthEnd[0], mouthEnd[1], 'black', 4);
                drawScratchyLine(mouthStart[0], mouthStart[1] - 10, mouthEnd[0], mouthEnd[1] - 10, 'black', 3);
            } else if (expression === 'flat') {
                drawScratchyLine(mouthStart[0], mouthStart[1], mouthEnd[0], mouthEnd[1], 'black', 4);
            } else if (expression === 'indifferent') {
                mouthMiddle = [x, y + getRandom(40, 50)];
                drawScratchyLine(mouthStart[0], mouthStart[1], mouthMiddle[0], mouthMiddle[1], 'black', 3);
                drawScratchyLine(mouthMiddle[0], mouthMiddle[1], mouthEnd[0], mouthEnd[1], 'black', 3);
            } else if (expression === 'angry') {
                mouthMiddle = [x, y + getRandom(30, 40)];
                drawScratchyLine(mouthStart[0], mouthStart[1], mouthMiddle[0], mouthMiddle[1], 'black', 4);
                drawScratchyLine(mouthMiddle[0], mouthMiddle[1], mouthEnd[0], mouthEnd[1] - 10, 'black', 4);
            } else if (expression === 'embarrassed') {
                mouthMiddle = [x, y + getRandom(50, 60)];
                drawScratchyLine(mouthStart[0], mouthStart[1] - 5, mouthMiddle[0], mouthMiddle[1], 'black', 3);
                drawScratchyLine(mouthMiddle[0], mouthMiddle[1], mouthEnd[0], mouthEnd[1] - 5, 'black', 3);
            }
            for (let i = 0; i < 3; i++) {
                const sx = x + getRandom(-mouthWidth / 2, mouthWidth / 2, i);
                const sy = y + getRandom(40, 70, i);
                drawScratchyLine(sx, sy, sx + getRandom(-10, 10, i), sy + getRandom(-10, 10, i), 'black', 1);
            }
        }

        // Draw face
        const centerX = width / 2;
        const centerY = height / 2;
        const faceWidth = 150;
        const faceHeight = 180;

        drawFaceShape(centerX, centerY, faceShape, faceWidth, faceHeight);

        // Ears
        drawScratchyCircle(centerX - faceWidth / 2 - 20, centerY, 20, 'black', 3, faceSkinColor);
        drawScratchyCircle(centerX + faceWidth / 2 + 20, centerY, 20, 'black', 3, faceSkinColor);

        // Eyes
        for (let i = -1; i <= 1; i += 2) {
            const eyeX = centerX + i * getRandom(30, 50, i + 1);
            const eyeY = centerY - getRandom(30, 10, i + 2);
            drawScratchyCircle(eyeX, eyeY, getRandom(10, 20, i + 3), 'black', 3, 'white');
            drawScratchyCircle(eyeX, eyeY, getRandom(5, 8, i + 4), 'black', 2, 'black');
            for (let j = 0; j < 2; j++) {
                const sx = eyeX + getRandom(-15, 15, j + i);
                const sy = eyeY + getRandom(-15, 15, j + i + 1);
                drawScratchyLine(sx, sy, sx + getRandom(-10, 10, j), sy + getRandom(-10, 10, j + 1), 'black', 1);
            }
        }

        // Nose
        const noseTopX = centerX;
        const noseTopY = centerY + getRandom(-10, 10, 5);
        const noseBottomX = centerX + getRandom(-5, 5, 6);
        const noseBottomY = centerY + getRandom(10, 20, 7);
        drawScratchyLine(noseTopX, noseTopY, noseBottomX, noseBottomY, 'black', 3);
        for (let i = 0; i < 2; i++) {
            const sx = noseTopX + getRandom(-10, 10, i + 8);
            const sy = noseTopY + getRandom(-10, 10, i + 9);
            drawScratchyLine(sx, sy, sx + getRandom(-5, 5, i), sy + getRandom(-5, 5, i + 1), 'black', 1);
        }

        // Mouth
        drawMouth(centerX, centerY, mouthExpression, faceWidth);

        // Additional scratches
        for (let i = 0; i < 10; i++) {
            const sx = centerX + getRandom(-faceWidth / 2, faceWidth / 2, i + 10);
            const sy = centerY + getRandom(-faceHeight / 2, faceHeight / 2, i + 11);
            drawScratchyLine(sx, sy, sx + getRandom(-15, 15, i), sy + getRandom(-15, 15, i + 1), 'black', 1);
        }

        // Return image buffer
        const buffer = canvas.toBuffer('image/png');
        return new Response(buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'no-store',
            },
        });
    } catch (error: unknown) {
        console.error('Error generating preview:', (error as Error).message);
        return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
    }
}
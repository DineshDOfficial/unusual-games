import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';

// Tetris piece shapes (L, J, I, O, S, Z, T)
const SHAPES = [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]], // L
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]], // J
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]], // S
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]], // Z
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]], // T
];

// Colors for each shape
const COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0x800080];

// Game constants
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 1;

interface TetrisPiece {
    shape: number[][];
    color: number;
    x: number;
    y: number;
}

const Tetris: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const gridRef = useRef<number[][]>(Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(0)));
    const currentPieceRef = useRef<TetrisPiece | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const blocksRef = useRef<THREE.Mesh[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Set up scene, camera, renderer
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            -GRID_WIDTH / 2, GRID_WIDTH / 2, GRID_HEIGHT / 2, -GRID_HEIGHT / 2, 0.1, 100
        );
        camera.position.z = 10;
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(400, 800);
        containerRef.current.appendChild(renderer.domElement);

        // Add grid border (visual bounding box)
        const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const borderGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-GRID_WIDTH / 2, -GRID_HEIGHT / 2, 0),
            new THREE.Vector3(-GRID_WIDTH / 2, GRID_HEIGHT / 2, 0),
            new THREE.Vector3(GRID_WIDTH / 2, GRID_HEIGHT / 2, 0),
            new THREE.Vector3(GRID_WIDTH / 2, -GRID_HEIGHT / 2, 0),
            new THREE.Vector3(-GRID_WIDTH / 2, -GRID_HEIGHT / 2, 0),
        ]);
        const border = new THREE.Line(borderGeometry, borderMaterial);
        scene.add(border);

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        // Spawn first piece
        spawnPiece();

        // Game loop
        const gameLoop = () => {
            renderer.render(scene, camera);
            requestAnimationFrame(gameLoop);
        };
        const loopId = requestAnimationFrame(gameLoop);

        // Auto-drop piece
        const dropInterval = setInterval(() => {
            if (currentPieceRef.current) movePieceDown();
        }, 1000);

        // Keyboard controls
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!currentPieceRef.current) return;
            switch (event.key) {
                case 'ArrowLeft': movePiece(-1, 0); break;
                case 'ArrowRight': movePiece(1, 0); break;
                case 'ArrowDown': movePieceDown(); break;
                case 'ArrowUp': rotatePiece(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            clearInterval(dropInterval);
            window.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(loopId);
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    const spawnPiece = () => {
        const shapeIndex = Math.floor(Math.random() * SHAPES.length);
        const piece: TetrisPiece = {
            shape: SHAPES[shapeIndex],
            color: COLORS[shapeIndex],
            x: Math.floor(GRID_WIDTH / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
            y: 0,
        };

        if (checkCollision(piece)) {
            alert(`Game Over! Score: ${score}`);
            gridRef.current = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(0));
            setScore(0);
            clearBoard();
        }

        currentPieceRef.current = piece;
        renderPiece(piece);
    };

    const checkCollision = (piece: TetrisPiece, dx: number = 0, dy: number = 0): boolean => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const gridX = piece.x + x + dx;
                    const gridY = piece.y + y + dy;
                    if (
                        gridX < 0 || gridX >= GRID_WIDTH || // Left/right bounds
                        gridY >= GRID_HEIGHT || // Bottom bound
                        (gridY >= 0 && gridRef.current[gridY][gridX]) // Block collision
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const movePiece = (dx: number, dy: number) => {
        if (!currentPieceRef.current) return;
        const piece = { ...currentPieceRef.current, x: currentPieceRef.current.x + dx, y: currentPieceRef.current.y + dy };
        if (!checkCollision(piece)) {
            currentPieceRef.current.x = piece.x;
            currentPieceRef.current.y = piece.y;
            renderPiece(currentPieceRef.current);
        }
    };

    const movePieceDown = () => {
        if (!currentPieceRef.current) return;
        const piece = { ...currentPieceRef.current, y: currentPieceRef.current.y + 1 };
        if (!checkCollision(piece)) {
            currentPieceRef.current.y = piece.y;
            renderPiece(currentPieceRef.current);
        } else {
            lockPiece(currentPieceRef.current);
            clearLines();
            spawnPiece();
        }
    };

    const rotatePiece = () => {
        if (!currentPieceRef.current) return;
        const newShape = currentPieceRef.current.shape[0]
            .map((_, index) => currentPieceRef.current!.shape.map(row => row[index]).reverse());
        const piece = { ...currentPieceRef.current, shape: newShape };
        if (!checkCollision(piece)) {
            currentPieceRef.current.shape = newShape;
            renderPiece(currentPieceRef.current);
        }
    };

    const lockPiece = (piece: TetrisPiece) => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const gridY = piece.y + y;
                    const gridX = piece.x + x;
                    if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
                        gridRef.current[gridY][gridX] = piece.color;
                    }
                }
            }
        }
    };

    const clearLines = () => {
        let linesCleared = 0;
        for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
            if (gridRef.current[y].every(cell => cell !== 0)) {
                gridRef.current.splice(y, 1);
                gridRef.current.unshift(Array(GRID_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared > 0) {
            setScore(prev => prev + linesCleared * 100);
            renderBoard();
        }
    };

    const renderBoard = () => {
        blocksRef.current.forEach(block => sceneRef.current?.remove(block));
        blocksRef.current = [];
        const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (gridRef.current[y][x]) {
                    const material = new THREE.MeshBasicMaterial({ color: gridRef.current[y][x] });
                    const block = new THREE.Mesh(geometry, material);
                    block.position.set(x - GRID_WIDTH / 2 + 0.5, GRID_HEIGHT / 2 - y - 0.5, 0);
                    sceneRef.current?.add(block);
                    blocksRef.current.push(block);
                }
            }
        }
    };

    const renderPiece = (piece: TetrisPiece) => {
        renderBoard();
        const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        const material = new THREE.MeshBasicMaterial({ color: piece.color });
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const block = new THREE.Mesh(geometry, material);
                    block.position.set(
                        piece.x + x - GRID_WIDTH / 2 + 0.5,
                        GRID_HEIGHT / 2 - (piece.y + y) - 0.5,
                        0
                    );
                    sceneRef.current?.add(block);
                    blocksRef.current.push(block);
                }
            }
        }
    };

    const clearBoard = () => {
        blocksRef.current.forEach(block => sceneRef.current?.remove(block));
        blocksRef.current = [];
    };

    return (
        <div>
            <div ref={containerRef} />
            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                }}
            >
                <h2 style={{ margin: 0 }}>Score: {score}</h2>
            </div>
        </div>
    );
};

export default Tetris;
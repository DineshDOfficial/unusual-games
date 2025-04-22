'use client';

import Head from "next/head";

import React from 'react';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * Importing the UTILS
 */
import { getGameInfoById } from "../../../utils/commons";

export default function Tetris() {

    /**
     * Pass the Game ID properly from this page
     */
    const gameInfo = getGameInfoById(1);

    const gameContainerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {

        const gameContainer = gameContainerRef.current!;

        const width = window.innerWidth
        const height = window.innerHeight

        /**
         * Creating a Scene
         */
        const scene = new THREE.Scene();

        /**
         * Creating Camera
         */
        const fieldOfView = 45; const aspectRatio = width / height; const nearClippingPlane = 0.1; const farClippingPlane = 1000
        const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearClippingPlane, farClippingPlane);

        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        /**
         * Renderer
         */
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        /**
         * Creating a Cube
         */
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial();
        const cube = new THREE.Mesh(geometry, material);

        scene.add(cube);


        gameContainer.appendChild(renderer.domElement);


        /**
         * Render the scene and camera
         */
        renderer.render(scene, camera)

    }, []);

    return (
        <>
            <Head>
                <title>{gameInfo.name}</title>
            </Head>

            <div ref={gameContainerRef} className="w-screen h-screen bg-black relative">

            </div>
        </>

    );
}
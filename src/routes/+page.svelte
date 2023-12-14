<script>
	import { onMount } from 'svelte';
	import { loadShader, vsSource, fsSource, vertices } from '$lib/webgl';

	/**
	 * @type {HTMLCanvasElement}
	 */
	let canvas;

	let hovered = false;
	let clicked = false;

	let state = [0, 0, 0, 0];
	/**
	 * @type {WebGLUniformLocation}
	 */
	let stateLocation;
	const colorNormal = [1.0, 0.0, 0.0, 1.0]; // Red
	const colorHovered = [0.0, 1.0, 0.0, 1.0]; // Green

	/**
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLProgram} shaderProgram
	 */
	function drawScene(gl, shaderProgram, lastTime = 0) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		const error = gl.getError();
		if (error !== gl.NO_ERROR) {
			console.error('WebGL Error: ' + error);
		}

		gl.uniform4fv(stateLocation, state);

		// Request to draw the next frame
		requestAnimationFrame((time) => {
			const dt = time - lastTime;
			tick(dt);
			drawScene(gl, shaderProgram, time);
		});
	}

	/**
	 * @param {number} dt
	 */
	function tick(dt) {
		if (dt <= 0) {
			return;
		}

		const processHovered = (hovered ? 1 : 0) - state[0];
		const processClicked = (clicked ? 1 : 0) - state[1];

		const processHoveredDt = processHovered * dt * 0.005;
		const processClickedDt = processClicked * dt * 0.005;

		state[0] += processHoveredDt;
		state[1] += processClickedDt;
	}

	onMount(() => {
		const gl = canvas.getContext('webgl');

		if (!gl) {
			console.error('WebGL not supported');
			return;
		}

		const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
		const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

		if (!vertexShader || !fragmentShader) {
			console.error('Unable to load shaders');
			return;
		}

		// Create shader program
		const shaderProgram = gl.createProgram();
		if (!shaderProgram) {
			console.error('Unable to create shader program');
			return;
		}

		// Attach shaders
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);

		// Link the shader program
		gl.linkProgram(shaderProgram);

		// Check the link status
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.error(
				'Unable to initialize the shader program: ' +
					gl.getProgramInfoLog(shaderProgram),
			);
			return;
		}

		// Use the shader program
		gl.useProgram(shaderProgram);

		// Create and bind a buffer
		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

		// Pass the vertices data to the buffer
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		// Get attribute locations after the program is successfully linked
		const positionAttributeLocation = gl.getAttribLocation(
			shaderProgram,
			'aVertexPosition',
		);
		gl.enableVertexAttribArray(positionAttributeLocation);

		// Point an attribute to the currently bound VBO
		gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

		const uStateLocation = gl.getUniformLocation(shaderProgram, 'uState');
		if (!uStateLocation) {
			console.error('Unable to find uniform location');
			return;
		}

		stateLocation = uStateLocation;
		const uColorNormalLocation = gl.getUniformLocation(
			shaderProgram,
			'uColorNormal',
		);
		const uColorHoveredLocation = gl.getUniformLocation(
			shaderProgram,
			'uColorHovered',
		);

		gl.uniform4fv(uStateLocation, state);
		gl.uniform4fv(uColorNormalLocation, colorNormal);
		gl.uniform4fv(uColorHoveredLocation, colorHovered);
		// Draw Scene
		drawScene(gl, shaderProgram);
	});
</script>

<button
	on:mouseenter={() => (hovered = true)}
	on:mouseleave={() => (hovered = false)}
>
	<canvas bind:this={canvas}></canvas>
	<span>Click me</span>
</button>
<h1>Welcome to SvelteKit</h1>
<p>
	Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 300px;
		height: 80px;
		border: none;
		background: none;
		cursor: pointer;
		z-index: 1;
	}

	canvas {
		width: 100%;
		height: 100%;
		z-index: 0;
		pointer-events: none;
	}

	span {
		position: absolute;
		font-size: 2rem;
	}
</style>

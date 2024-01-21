import WindowManager from './window_manager.js'

const t = THREE;
let camera, scene, renderer, world;
let galaxies = [];
let sceneOffsetTarget = {x: 0, y: 0};
let sceneOffset = {x: 0, y: 0};

let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime();

let windowManager;
let initialized = false;

const clock = new t.Clock();

// get time in seconds since beginning of the day (so that all windows use the same time)
function getTime() {
	return Math.abs((new Date().getTime() - today) / 1000.0);
}


if (new URLSearchParams(window.location.search).get("clear")) {
	localStorage.clear();
} else {	
	// this code is essential to circumvent that some browsers preload the content of some pages before you actually hit the url
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState != 'hidden' && !initialized) {
			init();
		}
	});

	window.onload = () => {
		if (document.visibilityState != 'hidden') {
			init();
		}
	};

	function init() {
		initialized = true;

		// add a short timeout because window.offsetX reports wrong values before a short period 
		setTimeout(() => {
			setupScene();
			setupWindowManager();
			resize();
			updateWindowShape(false);
			render();
			window.addEventListener('resize', resize);
		}, 500)	
	}

	function setupScene() {
		scene = new t.Scene();
		scene.background = new t.Color(255.0, 255.0, 255.0);

		renderer = new t.WebGLRenderer();
        camera = initCamera();

        world = new t.Object3D();
		scene.add(world);

		renderer.domElement.setAttribute("id", "scene");
		document.querySelector('content').appendChild(renderer.domElement);
	}

	function setupWindowManager() {
		windowManager = new WindowManager();
		windowManager.setWinShapeChangeCallback(updateWindowShape);
		windowManager.setWinChangeCallback(windowsUpdated);

		// here you can add your custom metadata to each windows instance
		let metaData = {foo: "bar"};

		// this will init the windowmanager and add this window to the centralised pool of windows
		windowManager.init(metaData);

		// call update windows initially (it will later be called by the win change callback)
		windowsUpdated();
	}

	function windowsUpdated() {
		updateNumberOfGalaxies();
	}

	function updateNumberOfGalaxies() {
		let wins = windowManager.getWindows();

		// remove all galaxies
		galaxies.forEach((g) => {
			world.remove(g);
		})

		galaxies = [];

		// add new galaxies based on the current window setup
		for (let i = 0; i < wins.length; i++) {
			let win = wins[i];

            let galaxy = createGalaxy(win, i);

			world.add(galaxy);
			galaxies.push(galaxy);
		}
	}

    function createGalaxy(win, i) {
        if(!camera) { return; }

        let c = new t.Color();
        c.setHSL(i * .1, 1.0, .5);

        const galaxy = new t.Group();

        galaxy.position.z = -10;

        // Check if rotation speeds exist in localStorage
        if (!localStorage.getItem(`galaxy${i}RotationSpeedX`) || !localStorage.getItem(`galaxy${i}RotationSpeedY`) || !localStorage.getItem(`galaxy${i}RotationSpeedZ`)) {
            localStorage.setItem(`galaxy${i}RotationSpeedX`, 0.02 + Math.random() * 0.03);
            localStorage.setItem(`galaxy${i}RotationSpeedY`, 0.02 + Math.random() * 0.03);
            localStorage.setItem(`galaxy${i}RotationSpeedZ`, 0.02 + Math.random() * 0.03);
        }
        galaxy.rotationSpeedX = parseFloat(localStorage.getItem(`galaxy${i}RotationSpeedX`));
        galaxy.rotationSpeedY = parseFloat(localStorage.getItem(`galaxy${i}RotationSpeedY`));
        galaxy.rotationSpeedZ = parseFloat(localStorage.getItem(`galaxy${i}RotationSpeedZ`));

        galaxy.velocity = new t.Vector3(0, 0, 0);

        const particleCount = 3000;
        const particleGeometry = new t.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            const radius = Math.random() * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const sinPhi = Math.sin(phi);

            const x = radius * sinPhi * Math.cos(theta);
            const y = radius * sinPhi * Math.sin(theta);
            const z = radius * Math.cos(phi);

            particlePositions[i] = x;
            particlePositions[i + 1] = y;
            particlePositions[i + 2] = z;
        }

        // Create a sphere geometry for the galaxy
        /*const geometry = new t.SphereGeometry(3, 32, 32);
        // Create a material for the particles
        const material = new t.MeshBasicMaterial({ color: c, opacity: 0.05, transparent: true });
        // Create a Points object and add it to the galaxy
        const container = new t.Mesh(geometry, material);
        galaxy.add(container);*/

        particleGeometry.addAttribute('position', new t.BufferAttribute(particlePositions, 3));
        const particleMaterial = new t.PointsMaterial({ color: c, size: 0.04 });
        const particleSystem = new t.Points(particleGeometry, particleMaterial);
        particleSystem.name = 'particleSystem';
        galaxy.add(particleSystem);

        return galaxy;
    }

	function updateWindowShape(easing = true) {
		// storing the actual offset in a proxy that we update against in the render function
		sceneOffsetTarget = {
            x: -window.screenX,
            y: -window.screenY,
        };
		if (!easing) sceneOffset = sceneOffsetTarget;
	}


	function render() {
		let t = getTime();

		windowManager.update();

		// calculate the new position based on the delta between current offset and new offset times a falloff value (to create the nice smoothing effect)
		let falloff = .05;
		sceneOffset.x = sceneOffset.x + ((sceneOffsetTarget.x - sceneOffset.x) * falloff);
		sceneOffset.y = sceneOffset.y + ((sceneOffsetTarget.y - sceneOffset.y) * falloff);
        
        // set the world position to the offset
		//world.position.x = sceneOffset.x
		//world.position.y = sceneOffset.y;

		let wins = windowManager.getWindows();

		// loop through all our galaxies and update their positions based on current window positions
		for (let i = 0; i < galaxies.length; i++) {
			let galaxy = galaxies[i];
			let win = wins[i];

            // Each galaxy is at (0, 0, -10) in its respective window
            // The window exists on the screen at (window.screenLeft, window.screenTop)
            // So each galaxy is at (win.screenLeft, win.screenTop, -10) in screen coordinates of its window
            //
            // The difficulty is that window.screenLeft/window.screenTop is (0, 0)
            // so our win is actually sitting at an offset of
            // (win.screenLeft - window.screenLeft, win.screenTop - window.screenTop)
            // In units of screen pixels. There are renderer.getSize().width pixels per viewport so this is just
            // (win.screenLeft - window.screenLeft) / renderer.getSize().width
            screen.width
			let posTarget = {
                x: 27 * (win.shape.x - window.screenLeft) / renderer.getSize().width,
                y: 27 * (win.shape.y - window.screenTop - window.innerHeight / 2 * (window.scrollY - window.innerHeight / 3) / screen.height) / renderer.getSize().height
            };

			galaxy.position.x = galaxy.position.x + (posTarget.x - galaxy.position.x) * falloff;
			galaxy.position.y = galaxy.position.y + (posTarget.y - galaxy.position.y) * falloff;

			galaxy.rotation.x += galaxy.rotationSpeedX;
			galaxy.rotation.y += galaxy.rotationSpeedY;
			galaxy.rotation.z += galaxy.rotationSpeedZ;
		};

		requestAnimationFrame(render);
		renderer.render(scene, camera);
    }

    function initCamera() {
		let width = screen.width;// window.innerWidth;
		let height = screen.height;//window.innerHeight;

        const camera = new t.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.z = 5;

		camera.updateProjectionMatrix();
		renderer.setSize(width, height);

        return camera;
    }

	// resize the renderer to fit the window size
	function resize() {
        camera = initCamera();
	}
}
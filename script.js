// Main JavaScript for Jainil Moradiya's Portfolio

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components when DOM is fully loaded
    initializeAOS();
    initLoadingSequence();
    setupScrollProgress();
    setupScrollAnimations();
    setupTypedText();
    setupCustomCursor();
    setupProjectCards();
    handleResponsiveLayout();
    
    // Make sure fallback content is immediately visible
    document.querySelectorAll('.fallback-content').forEach(el => {
        el.style.opacity = "1";
        el.style.visibility = "visible";
    });
    
    // Hide canvas elements by default until they are initialized
    document.querySelectorAll('.project-canvas').forEach((canvas, index) => {
        canvas.style.opacity = "0";
        initStaticFallback(canvas, index);
    });
});

// Initialize AOS library
function initializeAOS() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: false,
        mirror: true
    });
}

// Loading Animation
function initLoadingSequence() {
    const loadingScreen = document.querySelector('.loading-screen');
    
    if (!loadingScreen) {
        // If there's no loading screen, initialize everything immediately
        initHeroScene();
        initAboutScene();
        lazyLoadProjectScenes();
        return;
    }
    
    // Preload necessary resources
    const preloadResources = () => {
        return new Promise((resolve) => {
            // Simulate resource loading
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 8;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    resolve();
                }
                
                // Update loading progress if element exists
                const loadingText = document.querySelector('.loading-text');
                if (loadingText) {
                    loadingText.textContent = `Loading... ${Math.floor(progress)}%`;
                }
                
                // Update loading bar if exists
                const progressBar = document.querySelector('.loading-bar');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            }, 100);
        });
    };
    
    // Execute loading sequence
    preloadResources().then(() => {
        // Initialize hero scene first for faster perceived loading
        initHeroScene();
        
        // Then hide loading screen with smooth transition
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                
                // Initialize other components after loading screen is gone
                initAboutScene();
                lazyLoadProjectScenes();
                
                // Add a class to body to enable animations
                document.body.classList.add('loaded');
            }, 500);
        }, 300);
    });
}

// Custom cursor
function setupCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    // Cursor hover effect
    document.querySelectorAll('a, button, .project-card, .nav-link').forEach(item => {
        item.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        item.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
}

// Scroll progress indicator
function setupScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    });
}

// Scroll animations with improved skill bar animations
function setupScrollAnimations() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.15 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Skill bars animation
    const skillBars = document.querySelectorAll('.progress-bar');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressFill = entry.target.querySelector('.progress-fill');
                const percentage = entry.target.getAttribute('data-progress');
                if (progressFill) {
                    progressFill.style.width = percentage;
                }
            }
        });
    }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });
    
    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
    
    // Animate skill categories
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach((category, index) => {
        category.style.transitionDelay = `${index * 0.1}s`;
    });
}

// Typed text effect
function setupTypedText() {
    const typedElement = document.querySelector('.typed-text');
    if (!typedElement) return;
    
    const phrases = ["Web Developer", "Frontend Specialist", "UI/UX Designer", "Problem Solver"];
    let currentPhrase = 0;
    let currentChar = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeChar() {
        const phrase = phrases[currentPhrase];
        
        if (isDeleting) {
            typedElement.textContent = phrase.substring(0, currentChar - 1);
            currentChar--;
            typingSpeed = 50;
        } else {
            typedElement.textContent = phrase.substring(0, currentChar + 1);
            currentChar++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && currentChar === phrase.length) {
            isDeleting = true;
            typingSpeed = 1000; // Pause at end of word
        } else if (isDeleting && currentChar === 0) {
            isDeleting = false;
            currentPhrase = (currentPhrase + 1) % phrases.length;
            typingSpeed = 300; // Pause before next word
        }
        
        setTimeout(typeChar, typingSpeed);
    }
    
    setTimeout(typeChar, 1000);
}

// Hero 3D Scene
function initHeroScene() {
    const canvas = document.querySelector('.hero-canvas');
    if (!canvas) return;
    
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Set the canvas to properly fill the entire hero section
    canvas.width = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create particles that fill the entire scene
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = window.innerWidth < 768 ? 3000 : 8000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    // Calculate scene dimensions to ensure coverage
    const sceneDimension = Math.max(canvas.width, canvas.height) / 40;
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Position in a sphere for better distribution
        const radius = sceneDimension + Math.random() * (sceneDimension / 2);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[i+1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i+2] = radius * Math.cos(phi);
        
        // Add color variation
        colorArray[i] = 0.2 + Math.random() * 0.2; // R
        colorArray[i+1] = 0.5 + Math.random() * 0.3; // G
        colorArray[i+2] = 0.8 + Math.random() * 0.2; // B
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: canvas.width < 768 ? 0.1 : 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Position camera to view the entire scene
    camera.position.z = sceneDimension;
    
    // Add mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / canvas.width) * 2 - 1;
        mouseY = -(event.clientY / canvas.height) * 2 + 1;
    });
    
    // Animation with improved movement
    function animate() {
        requestAnimationFrame(animate);
        
        // Smooth mouse follow
        targetX = mouseX * 0.2;
        targetY = mouseY * 0.2;
        particlesMesh.rotation.y += 0.003;
        particlesMesh.rotation.x += 0.001;
        
        // Gentle swaying motion
        particlesMesh.rotation.y += (targetX - particlesMesh.rotation.y) * 0.05;
        particlesMesh.rotation.x += (targetY - particlesMesh.rotation.x) * 0.05;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Improved resize handler for full screen coverage
    window.addEventListener('resize', () => {
        if (!heroSection) return;
        
        // Update canvas dimensions
        canvas.width = heroSection.offsetWidth;
        canvas.height = heroSection.offsetHeight;
        
        // Update camera
        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();
        
        // Update renderer
        renderer.setSize(canvas.width, canvas.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
    
    // Show canvas after initialization
    canvas.style.opacity = "1";
}

// About Section 3D Scene
function initAboutScene() {
    const canvas = document.querySelector('.about-canvas');
    if (!canvas) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create a simple cube for now (will be replaced with 3D model)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00a3ff,
        metalness: 0.7,
        roughness: 0.2
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00a3ff, 1);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    
    camera.position.z = 2;
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.y += 0.01;
        cube.rotation.x += 0.005;
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Resize handler for the canvas
    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
    
    // Show canvas after initialization
    canvas.style.opacity = "1";
}

// Lazy load project 3D scenes
function lazyLoadProjectScenes() {
    const projectCanvases = document.querySelectorAll('.project-canvas');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initProjectScene(entry.target, Array.from(projectCanvases).indexOf(entry.target));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    projectCanvases.forEach(canvas => {
        observer.observe(canvas);
    });
}

// Project card animations
function setupProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Staggered animation for project features
        const features = card.querySelectorAll('.project-feature');
        features.forEach((feature, index) => {
            feature.style.transitionDelay = `${index * 0.1}s`;
        });
        
        // Underline animation for project title
        const title = card.querySelector('.project-title');
        if (title) {
            title.innerHTML = `<span>${title.textContent}</span>`;
        }
    });
}

// Initialize each project scene
function initProjectScene(canvas, index) {
    if (!canvas) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Different geometry for each project
    let geometry;
    switch(index % 3) {
        case 0:
            geometry = new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16);
            break;
        case 1:
            geometry = new THREE.IcosahedronGeometry(1, 1);
            break;
        case 2:
            geometry = new THREE.ConeGeometry(0.8, 1.6, 32);
            break;
    }
    
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00a3ff,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00a3ff, 1);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    
    camera.position.z = 2.5;
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.y += 0.01;
        mesh.rotation.x += 0.005;
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Show canvas after initialization
    canvas.style.opacity = "1";
    
    // Find the fallback content for this canvas and hide it
    const fallbackContent = canvas.parentElement.querySelector('.fallback-content');
    if (fallbackContent) {
        fallbackContent.style.opacity = "0";
        setTimeout(() => {
            fallbackContent.style.visibility = "hidden";
        }, 500);
    }
}

// Initialize static fallback images for project canvases
function initStaticFallback(canvas, index) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure canvas has correct dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simple icon based on the project index
    ctx.fillStyle = '#00a3ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height) * 0.3;
    
    switch(index % 3) {
        case 0: // First project - draw a globe/network icon
            ctx.beginPath();
            ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw cross lines like globe meridians
            ctx.beginPath();
            ctx.arc(centerX, centerY, size, 0, Math.PI, true);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX - size, centerY);
            ctx.lineTo(centerX + size, centerY);
            ctx.stroke();
            break;
            
        case 1: // Second project - draw a blood drop
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - size);
            ctx.bezierCurveTo(
                centerX - size, centerY - size,
                centerX - size, centerY + size,
                centerX, centerY + size
            );
            ctx.bezierCurveTo(
                centerX + size, centerY + size,
                centerX + size, centerY - size,
                centerX, centerY - size
            );
            ctx.fillStyle = 'rgba(255, 40, 40, 0.7)';
            ctx.fill();
            ctx.stroke();
            break;
            
        case 2: // Third project - draw wood/plywood icon
            // Draw rectangle representing plywood
            ctx.fillStyle = 'rgba(165, 125, 55, 0.7)';
            ctx.fillRect(centerX - size, centerY - size/2, size*2, size);
            ctx.strokeRect(centerX - size, centerY - size/2, size*2, size);
            
            // Draw wood grain lines
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const y = centerY - size/2 + size * i/4;
                ctx.moveTo(centerX - size, y);
                ctx.lineTo(centerX + size, y);
            }
            ctx.stroke();
            break;
    }
}

// Make everything responsive
function handleResponsiveLayout() {
    // Handle navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Update canvas sizes when window is resized
    const updateCanvasSizes = () => {
        // Hero canvas
        const heroCanvas = document.querySelector('.hero-canvas');
        const heroSection = document.querySelector('.hero');
        if (heroCanvas && heroSection) {
            heroCanvas.width = heroSection.offsetWidth;
            heroCanvas.height = heroSection.offsetHeight;
            
            // Force proper display
            heroCanvas.style.width = '100%';
            heroCanvas.style.height = '100%';
        }
        
        // About canvas
        const aboutCanvas = document.querySelector('.about-canvas');
        if (aboutCanvas) {
            aboutCanvas.width = aboutCanvas.clientWidth;
            aboutCanvas.height = aboutCanvas.clientHeight;
        }
        
        // Project canvases
        const projectCanvases = document.querySelectorAll('.project-canvas');
        projectCanvases.forEach(canvas => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        });
    };
    
    // Call immediately and on resize
    updateCanvasSizes();
    window.addEventListener('resize', () => {
        updateCanvasSizes();
        
        // Reinitialize any 3D scene if needed
        if (window.innerWidth <= 767) {
            // Mobile optimizations
            document.querySelectorAll('.project-canvas').forEach(canvas => {
                canvas.style.opacity = "0";
                const fallback = canvas.parentElement.querySelector('.fallback-content');
                if (fallback) {
                    fallback.style.opacity = "1";
                    fallback.style.visibility = "visible";
                }
            });
        }
    });
    
    // Handle mobile navigation
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
} 
// --- UTILIDADES DE AUDIO Y EFECTOS (Web Audio API nativa sin archivos externos) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'success') {
        // Sonido de logro / éxito (acorde ascendente)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // Nota La
        osc.frequency.setValueAtTime(554.37, now + 0.08); // Nota Do#
        osc.frequency.setValueAtTime(659.25, now + 0.16); // Nota Mi
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'click') {
        // Pequeño clic de interacción
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    }
}

// Notificaciones flotantes (Toast) con reacciones
function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.borderColor = isSuccess ? '#00dfa0' : '#ff405f';
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}

// --- GESTIÓN DE AUTENTICACIÓN (LOGIN / REGISTRO) ---
document.addEventListener('DOMContentLoaded', () => {
    const authTabs = document.querySelectorAll('.auth-tab');
    const nameLabel = document.getElementById('nameLabel');
    const authName = document.getElementById('authName');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authSubmit = document.getElementById('authSubmit');
    const authForm = document.getElementById('authForm');
    const authError = document.getElementById('authError');
    
    let isRegisterMode = false;

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSound('click');
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            isRegisterMode = tab.dataset.auth === 'register';
            
            if (isRegisterMode) {
                nameLabel.hidden = false;
                authName.required = true;
                authTitle.textContent = "Crea tu cuenta";
                authSubtitle.textContent = "Regístrate para guardar tu progreso de estudio.";
                authSubmit.innerHTML = "Crear cuenta <span>→</span>";
            } else {
                nameLabel.hidden = true;
                authName.required = false;
                authTitle.textContent = "Bienvenido de nuevo";
                authSubtitle.textContent = "Inicia sesión para continuar tu aprendizaje.";
                authSubmit.innerHTML = "Entrar <span>→</span>";
            }
            authError.textContent = "";
        });
    });

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            playSound('click');
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const name = authName.value;

            const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
            const payload = isRegisterMode ? { name, email, password } : { email, password };

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (res.ok) {
                    playSound('success');
                    showToast(isRegisterMode ? "¡Cuenta creada con éxito!" : "¡Sesión iniciada correctamente!");
                    setTimeout(() => { location.reload(); }, 1000);
                } else {
                    authError.textContent = data.error || "Ocurrió un error en la autenticación.";
                }
            } catch (err) {
                authError.textContent = "No se pudo conectar con el servidor backend.";
            }
        });
    }

    // Comprobación inicial de sesión y carga de datos si el usuario está autenticado
    checkSession();
});

async function checkSession() {
    try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
            const user = await res.json();
            if (user && user.loggedIn) {
                document.getElementById('authScreen').hidden = true;
                document.getElementById('appScreen').hidden = false;
                const signedNameEl = document.getElementById('signedName');
                if (signedNameEl) signedNameEl.textContent = user.name || "Estudiante";
                loadProgressData();
            }
        }
    } catch (e) {
        console.error("Modo local o sin sesión activa en servidor.");
    }
}

// --- GESTIÓN DE CIERRE DE SESIÓN ---
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        playSound('click');
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            location.reload();
        } catch (e) {
            location.reload();
        }
    });
}

// --- CARGA Y REGISTRO DE PROGRESO ---
async function loadProgressData() {
    try {
        const res = await fetch('/api/progress');
        if (res.ok) {
            const progress = await res.json();
            updateProgressUI(progress);
        }
    } catch (e) {
        console.error("Error al cargar progreso remoto.");
    }
}

function updateProgressUI(completedLessonsCount) {
    const total = 25;
    const percent = Math.round((completedLessonsCount / total) * 100);
    
    const metricDone = document.getElementById('metricDone');
    const metricPercent = document.getElementById('metricPercent');
    const progressBig = document.getElementById('progressBig');
    const progressBar = document.getElementById('progressBar');
    
    if (metricDone) metricDone.innerHTML = `${completedLessonsCount} <i>/ ${total}</i>`;
    if (metricPercent) metricPercent.textContent = `${percent}%`;
    if (progressBig) progressBig.textContent = `${percent}%`;
    if (progressBar) progressBar.style.width = `${percent}%`;

    if (completedLessonsCount > 0) {
        playSound('success');
        showToast(`¡Progreso actualizado: ${completedLessonsCount}/${total} lecciones!`);
    }
}

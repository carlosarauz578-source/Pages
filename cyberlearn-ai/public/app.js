// --- SISTEMA DE AUDIO Y EFECTOS DE LOGRO ---
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
        // Acorde triunfal para logros y finalización de lecciones
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'click') {
        // Clic sutil de interfaz
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
    }
}

function showToast(message, success = true) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.borderColor = success ? '#00dfa0' : '#ff405f';
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}

// Catálogo de las 25 Técnicas de Ciberseguridad e Inyección
const techniques = [
    {id:1, cat:"SQL Injection", name:"SQLi Clásico (In-band)", level:"Básico", concept:"Modificación de la lógica de una consulta mediante concatenación insegura de entradas.", defense:"Usar consultas parametrizadas (Prepared Statements)."},
    {id:2, cat:"SQL Injection", name:"Union-based SQLi", level:"Intermedio", concept:"Extracción de datos combinando resultados mediante el operador UNION.", defense:"Parametrización estricta y control de columnas."},
    {id:3, cat:"SQL Injection", name:"Error-based SQLi", level:"Intermedio", concept:"Provocación de fallos en la base de datos para filtrar información en los mensajes de error.", defense:"Desactivar la visualización de errores detallados al cliente."},
    {id:4, cat:"SQL Injection", name:"Boolean Blind SQLi", level:"Intermedio", concept:"Inferencia de datos analizando variaciones verdaderas o falsas en la respuesta.", defense:"Consultas parametrizadas y tiempos de respuesta consistentes."},
    {id:5, cat:"SQL Injection", name:"Time-based Blind SQLi", level:"Intermedio", concept:"Deducción de información midiendo retrasos intencionales (SLEEP) en la ejecución.", defense:"Validación de tipos y límites de tiempo en consultas."},
    {id:6, cat:"SQL Injection", name:"Out-of-band SQLi", level:"Avanzado", concept:"Exfiltración de datos mediante peticiones DNS o HTTP externas provocadas por la base de datos.", defense:"Restringir salidas de red y deshabilitar características innecesarias."},
    {id:7, cat:"SQL Injection", name:"Second-order SQLi", level:"Intermedio", concept:"Un dato almacenado de forma segura es reutilizado posteriormente en otra consulta vulnerable.", defense:"Aplicar parámetros en cada consulta que procese datos almacenados."},
    {id:8, cat:"SQL Injection", name:"Stored Procedure Injection", level:"Avanzado", concept:"Inyección dentro de procedimientos almacenados que construyen SQL dinámico.", defense:"Evitar SQL dinámico dentro de procedimientos almacenados."},
    {id:9, cat:"SQL Injection", name:"Function Abuse SQLi", level:"Avanzado", concept:"Abuso de funciones nativas de bases de datos (XML/JSON) para alterar flujos.", defense:"Restringir privilegios de funciones y control de esquemas."},
    {id:10, cat:"SQL Injection", name:"Advanced SQLi Chaining", level:"Avanzado", concept:"Combinación de múltiples técnicas de base de datos para lograr impacto total.", defense:"Defensa en profundidad y principio de mínimos privilegios."},
    {id:11, cat:"XSS", name:"Stored XSS", level:"Básico", concept:"Inyección de scripts maliciosos persistidos en la base de datos que afectan a otros usuarios.", defense:"Codificación contextual de salida y políticas CSP."},
    {id:12, cat:"XSS", name:"Reflected XSS", level:"Básico", concept:"Ejecución de scripts reflejados inmediatamente desde los parámetros de la petición HTTP.", defense:"Validación de entradas y escape estricto de salida."},
    {id:13, cat:"XSS", name:"DOM-based XSS", level:"Intermedio", concept:"Manipulación del DOM del navegador mediante fuentes y sumideros inseguros en JavaScript.", defense:"Evitar innerHTML y funciones eval; usar textContent."},
    {id:14, cat:"Command Injection", name:"Direct Command Injection", level:"Intermedio", concept:"Inyección de caracteres especiales para ejecutar comandos directos en el sistema operativo.", defense:"Evitar llamadas al shell y usar APIs con argumentos separados (shell=False)."},
    {id:15, cat:"Command Injection", name:"Indirect Command Injection", level:"Intermedio", concept:"Reenvío de datos no confiables a tareas o demonios del sistema que ejecutan procesos.", defense:"Validación rigurosa por listas blancas y aislamiento de procesos."},
    {id:16, cat:"Command Injection", name:"Command Chaining & Redirection", level:"Intermedio", concept:"Uso de operadores de shell (&&, ;, |) para concatenar comandos adicionales.", defense:"Nunca concatenar cadenas de comandos del sistema."},
    {id:17, cat:"DLL Injection", name:"Remote DLL Injection", level:"Avanzado", concept:"Inyección y carga forzada de bibliotecas dinámicas en espacios de memoria de otros procesos.", defense:"Controles estrictos de aplicación y firmas de módulos (EDR)."},
    {id:18, cat:"DLL Injection", name:"Reflective DLL Injection", level:"Avanzado", concept:"Carga de DLL directamente desde memoria sin registrar artefactos tradicionales en disco.", defense:"Monitoreo avanzado de comportamiento de memoria y EDR."},
    {id:19, cat:"LDAP / XML / XPath", name:"LDAP Injection", level:"Intermedio", concept:"Alteración de consultas a directorios LDAP manipulando filtros de autenticación.", defense:"Uso de APIs seguras y escape de caracteres especiales LDAP."},
    {id:20, cat:"LDAP / XML / XPath", name:"XXE (XML External Entity)", level:"Intermedio", concept:"Procesamiento malicioso de entidades externas en archivos XML para leer recursos locales.", defense:"Deshabilitar DTDs y resolución de entidades externas en el parser XML."},
    {id:21, cat:"LDAP / XML / XPath", name:"XPath Injection", level:"Intermedio", concept:"Modificación de consultas XPath para acceder a nodos XML no autorizados.", defense:"Consultas parametrizadas para XML y validación de tipos."},
    {id:22, cat:"Prompt Injection (IA)", name:"Direct Prompt Injection", level:"Intermedio", concept:"Instrucciones maliciosas del usuario para forzar al modelo de IA a ignorar sus directrices.", defense:"Separación estricta entre instrucciones del sistema y datos de usuario."},
    {id:23, cat:"Prompt Injection (IA)", name:"Indirect Prompt Injection", level:"Avanzado", concept:"Inyección oculta en documentos externos que la IA procesa y confunde con órdenes.", defense:"Tratar todo contenido externo o recuperado como datos no confiables."},
    {id:24, cat:"Prompt Injection (IA)", name:"Jailbreak Chaining", level:"Avanzado", concept:"Secuencia gradual de peticiones para erosionar las restricciones de seguridad del modelo.", defense:"Monitoreo conversacional y limitación de capacidades/herramientas."},
    {id:25, cat:"NoSQL Injection", name:"NoSQL Operator Injection", level:"Intermedio", concept:"Inyección de operadores lógicos ($ne,$gt) en consultas NoSQL (MongoDB).", defense:"Validación estricta de esquemas y tipos de datos (evitar objetos en campos escalares)."}
];

let completedLessons = new Set();
let activeLessonId = 1;

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    checkInitialSession();
});

// --- LÓGICA DE AUTENTICACIÓN FRONTEND ---
function initAuth() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const nameLabel = document.getElementById('nameLabel');
    const authName = document.getElementById('authName');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authSubmit = document.getElementById('authSubmit');
    const authForm = document.getElementById('authForm');
    const authError = document.getElementById('authError');
    let isRegister = false;

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSound('click');
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            isRegister = tab.dataset.auth === 'register';
            nameLabel.hidden = !isRegister;
            authName.required = isRegister;
            authTitle.textContent = isRegister ? "Crea tu cuenta" : "Bienvenido de nuevo";
            authSubtitle.textContent = isRegister ? "Registrate para guardar tu progreso de estudio." : "Inicia sesión para continuar tu aprendizaje.";
            authSubmit.innerHTML = (isRegister ? "Crear cuenta" : "Entrar") + " <span>→</span>";
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

            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
            const payload = isRegister ? { name, email, password } : { email, password };

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok) {
                    playSound('success');
                    showToast(isRegister ? "¡Cuenta creada con éxito!" : "¡Sesión iniciada!");
                    setTimeout(() => location.reload(), 800);
                } else {
                    authError.textContent = data.error || "Error en la autenticación.";
                }
            } catch (err) {
                authError.textContent = "No se pudo conectar con el servidor.";
            }
        });
    }
}

async function checkInitialSession() {
    try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
            const data = await res.json();
            if (data.loggedIn) {
                document.getElementById('authScreen').hidden = true;
                document.getElementById('appScreen').hidden = false;
                document.getElementById('signedName').textContent = data.name;
                await fetchProgress();
                initApp();
            }
        }
    } catch (e) {
        console.error("Sesión no activa");
    }
}

// --- CARGAR PROGRESO DESDE EL BACKEND ---
async function fetchProgress() {
    try {
        const res = await fetch('/api/progress');
        if (res.ok) {
            const data = await res.json();
            completedLessons = new Set(data.completedLessons || []);
            updateProgressUI();
        }
    } catch (e) {
        console.error("Error al obtener progreso.");
    }
}

async function toggleLessonCompletion(id) {
    playSound('click');
    const newState = !completedLessons.has(id);
    
    try {
        const res = await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonId: id, completed: newState })
        });
        if (res.ok) {
            if (newState) {
                completedLessons.add(id);
                playSound('success');
                showToast(`¡Lección ${id} completada! 🎉`);
            } else {
                completedLessons.delete(id);
            }
            updateProgressUI();
            renderTechList();
            renderLessonDetail(activeLessonId);
            renderRouteList();
        }
    } catch (e) {
        showToast("Error al guardar progreso en el servidor.", false);
    }
}

// --- APLICACIÓN PRINCIPAL Y NAVEGACIÓN ---
function initApp() {
    // Navegación lateral
    document.querySelectorAll('.sidebar .nav').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            document.querySelectorAll('.sidebar .nav').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const pageId = 'page-' + btn.dataset.page;
            document.getElementById(pageId).classList.add('active');
        });
    });

    // Botones de inicio rápido
    document.querySelectorAll('[data-goto]').forEach(b => {
        b.addEventListener('click', () => {
            playSound('click');
            document.querySelector(`[data-page="${b.dataset.goto}"]`).click();
        });
    });

    // Cierra sesión
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        playSound('click');
        await fetch('/api/auth/logout', { method: 'POST' });
        location.reload();
    });

    renderCategories();
    renderTechList();
    renderLessonDetail(1);
    renderRouteList();
    initAssistant();
    initLabs();

    // Exportar CSV
    document.getElementById('exportCsv').addEventListener('click', () => {
        playSound('click');
        let csv = "ID,Tecnica,Categoria,Nivel,Concepto,Defensa\n" + techniques.map(t => `"${t.id}","${t.name}","${t.cat}","${t.level}","${t.concept}","${t.defense}"`).join("\n");
        let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "cyberlearn_matriz.csv";
        link.click();
    });

    // Restablecer progreso
    document.getElementById('resetProgress').addEventListener('click', async () => {
        if (confirm("¿Estás seguro de restablecer todo tu progreso?")) {
            for (let id of completedLessons) {
                await fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lessonId: id, completed: false })
                });
            }
            completedLessons.clear();
            updateProgressUI();
            renderTechList();
            renderLessonDetail(activeLessonId);
            renderRouteList();
            showToast("Progreso restablecido.");
        }
    });
}

function updateProgressUI() {
    const total = techniques.length;
    const count = completedLessons.size;
    const percent = Math.round((count / total) * 100);

    document.getElementById('metricDone').innerHTML = `${count} <i>/ ${total}</i>`;
    document.getElementById('metricPercent').textContent = `${percent}%`;
    document.getElementById('progressBig').textContent = `${percent}%`;
    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('progressCircle').style.background = `conic-gradient(var(--cyan) ${percent * 3.6}deg, #113a63 0deg)`;

    const headline = document.getElementById('progressHeadline');
    const desc = document.getElementById('progressDescription');
    if (count === 0) {
        headline.textContent = "¡Empieza tu ruta!";
        desc.textContent = "Completa lecciones para avanzar.";
    } else if (count < total) {
        headline.textContent = "¡Buen avance!";
        desc.textContent = `Te faltan ${total - count} lecciones para dominar todas las técnicas.`;
    } else {
        headline.textContent = "¡Ruta completada con éxito! 🏆";
        desc.textContent = "Has dominado todas las técnicas de inyección y defensa.";
    }

    renderMatrixTable();
}

function renderCategories() {
    const cats = [...new Set(techniques.map(t => t.cat))];
    const grid = document.getElementById('categoryGrid');
    const select = document.getElementById('categoryFilter');
    
    grid.innerHTML = cats.map(c => `<div class="category-card" data-cat="${c}"><b>${c}</b><p style="font-size:11px;color:var(--muted);margin:5px 0 0">${techniques.filter(t=>t.cat===c).length} técnicas</p></div>`).join('');
    select.innerHTML = '<option value="all">Todas las categorías</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');

    grid.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            playSound('click');
            select.value = card.dataset.cat;
            renderTechList();
        });
    });

    select.addEventListener('change', renderTechList);
    document.getElementById('techSearch').addEventListener('input', renderTechList);
}

function renderTechList() {
    const search = document.getElementById('techSearch').value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;
    const list = document.getElementById('techList');

    const filtered = techniques.filter(t => {
        const matchSearch = t.name.toLowerCase().includes(search) || t.concept.toLowerCase().includes(search);
        const matchCat = cat === 'all' || t.cat === cat;
        return matchSearch && matchCat;
    });

    list.innerHTML = filtered.map(t => `
        <button class="tech-item ${t.id === activeLessonId ? 'active' : ''}" data-id="${t.id}">
            ${String(t.id).padStart(2, '0')}. ${t.name} ${completedLessons.has(t.id) ? '✓' : ''}
        </button>
    `).join('');

    list.querySelectorAll('.tech-item').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            activeLessonId = Number(btn.dataset.id);
            renderTechList();
            renderLessonDetail(activeLessonId);
        });
    });
}

function renderLessonDetail(id) {
    const t = techniques.find(x => x.id === id);
    if (!t) return;
    const detail = document.getElementById('techDetail');
    const isDone = completedLessons.has(id);

    detail.innerHTML = `
        <div class="eyebrow">TÉCNICA ${t.id} DE 25 · ${t.cat.toUpperCase()}</div>
        <h2 style="margin:5px 0 10px">${t.name}</h2>
        <div style="display:flex;gap:8px;margin-bottom:15px">
            <span style="background:var(--bg);border:1px solid var(--line);padding:2px 8px;border-radius:4px;font-size:10px">${t.level}</span>
            <span style="background:${isDone ? 'rgba(0,223,160,0.15)' : 'rgba(255,64,95,0.15)'};color:${isDone ? 'var(--green)' : 'var(--red)'};border:1px solid var(--line);padding:2px 8px;border-radius:4px;font-size:10px">${isDone ? 'Completada' : 'Pendiente'}</span>
        </div>
        <p style="font-size:13px;color:var(--muted)"><b>Concepto:</b> ${t.concept}</p>
        <div style="background:#020b17;border:1px solid var(--line);border-radius:8px;padding:12px;margin:15px 0">
            <h4 style="margin:0 0 5px;color:var(--cyan);font-size:12px">Estrategia de Defensa</h4>
            <p style="margin:0;font-size:12px">${t.defense}</p>
        </div>
        <button class="btn ${isDone ? 'outline' : 'primary'}" id="completeLessonBtn">${isDone ? 'Marcar como pendiente' : '✓ Marcar como aprendida'}</button>
    `;

    document.getElementById('completeLessonBtn').addEventListener('click', () => toggleLessonCompletion(id));
}

function renderRouteList() {
    const container = document.getElementById('routeList');
    container.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">` +
        techniques.map(t => `
            <div class="panel" style="cursor:pointer;border-color:${completedLessons.has(t.id) ? 'var(--green)' : 'var(--line)'}" data-route-id="${t.id}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <span style="font-size:10px;color:var(--cyan)">${t.cat}</span>
                    <span>${completedLessons.has(t.id) ? '✅' : '⏳'}</span>
                </div>
                <b style="font-size:13px">${t.id}. ${t.name}</b>
                <p style="font-size:11px;color:var(--muted);margin:5px 0 0">${t.level}</p>
            </div>
        `).join('') + `</div>`;

    container.querySelectorAll('[data-route-id]').forEach(card => {
        card.addEventListener('click', () => {
            playSound('click');
            activeLessonId = Number(card.dataset.routeId);
            document.querySelector('[data-page="home"]').click();
            renderTechList();
            renderLessonDetail(activeLessonId);
        });
    });
}

function renderMatrixTable() {
    const table = document.getElementById('matrixTable');
    table.innerHTML = `
        <thead><tr><th>#</th><th>Técnica</th><th>Categoría</th><th>Nivel</th><th>Defensa principal</th><th>Estado</th></tr></thead>
        <tbody>` + techniques.map(t => `
            <tr>
                <td>${t.id}</td>
                <td><b>${t.name}</b></td>
                <td>${t.cat}</td>
                <td>${t.level}</td>
                <td style="color:var(--green)">${t.defense}</td>
                <td>${completedLessons.has(t.id) ? 'Completada' : 'Pendiente'}</td>
            </tr>
        `).join('') + `</tbody>`;
}

// --- ASISTENTE LOCAL Y LABORATORIOS ---
function initAssistant() {
    const chat = document.getElementById('fullChat');
    const input = document.getElementById('fullChatInput');
    const send = document.getElementById('fullChatSend');

    function addMsg(text, isUser = false) {
        const div = document.createElement('div');
        div.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        div.textContent = text;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    function handleSend() {
        const val = input.value.trim();
        if (!val) return;
        playSound('click');
        addMsg(val, true);
        input.value = '';

        setTimeout(() => {
            let reply = "Como asistente de CyberLearn, te recomiendo analizar siempre el flujo de datos y aplicar parametrización o validación contextual.";
            const q = val.toLowerCase();
            if (q.includes('sql')) reply = "SQL Injection ocurre cuando datos externos modifican la consulta SQL. La defensa principal son las consultas parametrizadas.";
            else if (q.includes('xss')) reply = "XSS se previene escapando la salida de los datos según el contexto HTML/JS y configurando cabeceras CSP.";
            else if (q.includes('prompt')) reply = "Prompt Injection en IA manipula las instrucciones del modelo mediante datos maliciosos en el texto de entrada.";
            else if (q.includes('plan')) reply = "Plan de estudio sugerido: 5 técnicas diarias, repasando los conceptos y verificando las defensas en la matriz.";
            
            addMsg(reply, false);
            playSound('success');
        }, 500);
    }

    send.addEventListener('click', handleSend);
    input.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });

    document.querySelectorAll('.suggestions button').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            input.value = btn.dataset.prompt;
            handleSend();
        });
    });
}

function initLabs() {
    document.querySelectorAll('[data-lab]').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            const target = document.getElementById(btn.dataset.lab);
            if (target) target.hidden = !target.hidden;
        });
    });

    const passInput = document.getElementById('demoPassword');
    const passCheck = document.getElementById('passwordCheck');
    const passResult = document.getElementById('passwordResult');

    if (passCheck) {
        passCheck.addEventListener('click', () => {
            playSound('click');
            const val = passInput.value;
            passResult.hidden = false;
            if (val.length < 12) {
                passResult.style.color = 'var(--red)';
                passResult.textContent = "Débil: la contraseña tiene menos de 12 caracteres.";
            } else {
                passResult.style.color = 'var(--green)';
                passResult.textContent = "Fuerte: cumple con la longitud mínima recomendada.";
                playSound('success');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const terminalLogs = document.getElementById('terminal-logs');
    const hashRateEl = document.getElementById('hash-rate');
    const mempoolEl = document.getElementById('mempool-count');
    const blockHeightEl = document.getElementById('block-height');
    const nodeStatusEl = document.getElementById('node-status');

    const btnMine = document.getElementById('btn-mine');
    const btnDdos = document.getElementById('btn-ddos');
    const btnReset = document.getElementById('btn-reset');

    let currentBlockHeight = 842910;
    let mempoolTransactions = 24;
    let currentHashRate = 142.8;

    // Función para obtener marca de tiempo en formato [HH:MM:SS]
    function getTimestamp() {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    }

    // Función para agregar logs a la consola simulada
    function addLog(message, type = 'info') {
        const div = document.createElement('div');
        const time = getTimestamp();
        
        let colorClass = 'text-slate-300';
        let prefix = '[INFO]';

        if (type === 'success') {
            colorClass = 'text-neoncyan font-semibold';
            prefix = '[SUCCESS]';
        } else if (type === 'warn') {
            colorClass = 'text-amber-400 font-semibold';
            prefix = '[WARN]';
        } else if (type === 'danger') {
            colorClass = 'text-red-400 font-bold';
            prefix = '[ALERT]';
        } else if (type === 'hash') {
            colorClass = 'text-neonblue';
            prefix = '[HASH]';
        }

        div.className = colorClass;
        div.textContent = `[${time}] ${prefix} ${message}`;
        terminalLogs.appendChild(div);
        
        // Auto-scroll al fondo de la terminal
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
    }

    // Evento: Minar Siguiente Bloque
    btnMine.addEventListener('click', () => {
        currentBlockHeight++;
        blockHeightEl.textContent = `#${currentBlockHeight.toLocaleString()}`;
        mempoolTransactions = Math.max(2, mempoolTransactions - Math.floor(Math.random() * 10 + 5));
        mempoolEl.textContent = `${mempoolTransactions} TXs`;

        const randomHash = '0000000000000000' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
        addLog(`Prueba de trabajo (PoW) resuelta exitosamente. Bloque #${currentBlockHeight} minado.`, 'success');
        addLog(`Merkle Root verificado: ${randomHash}`, 'hash');
        
        // Simular fluctuación de Hash Rate
        currentHashRate = +(140 + Math.random() * 15).toFixed(1);
        hashRateEl.textContent = `${currentHashRate} MH/s`;
    });

    // Evento: Simular Ataque DDoS (Defensa Activa)
    btnDdos.addEventListener('click', () => {
        addLog('¡Alerta! Tráfico malicioso masivo detectado proveniente de múltiples IPs fantasma (Ataque DDoS).', 'danger');
        nodeStatusEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping mr-2"></span> BAJO ATAQUE (MITIGANDO)`;
        nodeStatusEl.className = 'font-mono font-bold text-red-400 flex items-center';

        setTimeout(() => {
            addLog('Cortafuegos de IA activado: Reglas de filtrado BGP aplicadas. Tráfico malicioso bloqueado.', 'warn');
        }, 1200);

        setTimeout(() => {
            nodeStatusEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-neoncyan animate-ping mr-2"></span> CONECTADO (P2P)`;
            nodeStatusEl.className = 'font-mono font-bold text-neoncyan flex items-center';
            addLog('Red estabilizada. Integridad del nodo recuperada al 100%.', 'success');
        }, 3000);
    });

    // Evento: Reiniciar Conexión P2P
    btnReset.addEventListener('click', () => {
        addLog('Reiniciando demonio y sockets de red P2P...', 'warn');
        nodeStatusEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping mr-2"></span> RECONECTANDO...`;
        nodeStatusEl.className = 'font-mono font-bold text-yellow-400 flex items-center';

        setTimeout(() => {
            nodeStatusEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-neoncyan animate-ping mr-2"></span> CONECTADO (P2P)`;
            nodeStatusEl.className = 'font-mono font-bold text-neoncyan flex items-center';
            addLog('Handshake P2P completado con éxito. Pares sincronizados.', 'success');
        }, 1500);
    });

    // Simulación periódica de actividad en segundo plano en la mempool
    setInterval(() => {
        if (Math.random() > 0.6) {
            mempoolTransactions += Math.floor(Math.random() * 3 + 1);
            mempoolEl.textContent = `${mempoolTransactions} TXs`;
            addLog(`Nueva transacción cifrada añadida a la Mempool local (Gas: 18 Gwei).`, 'info');
        }
    }, 6000);
});

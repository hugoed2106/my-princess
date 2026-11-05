// Rangos de fechas en los que se muestran los mensajes especiales
const DIC_INICIO = new Date(2024, 11, 23, 0, 0, 0); // 23 de Diciembre de 2024
const DIC_FIN = new Date(2025, 11, 31, 23, 59, 59); // 31 de Diciembre de 2025
const JUN_INICIO = new Date(2026, 5, 4, 0, 0, 0); // 4 de Junio de 2026
const JUN_FIN = new Date(2026, 11, 31, 23, 59, 59); // 31 de Diciembre de 2026

function dentroDeRango(inicio, fin) {
  const hoy = new Date();
  return hoy >= inicio && hoy <= fin;
}

// ---------- Notificaciones desde Firebase ----------
const firebaseConfig = {
  apiKey: "AIzaSyBYKVOqh4d9k3KkzYqxEXZWBwCpbXytpmM",
  authDomain: "my-princess-hg.firebaseapp.com",
  projectId: "my-princess-hg",
  storageBucket: "my-princess-hg.firebasestorage.app",
  messagingSenderId: "444245442541",
  appId: "1:444245442541:web:9f93023640f59273bd71e4"
};

const COLECCION_NOTIFICACIONES = "notificaciones";

function agregarLineas(p, texto) {
  const lineas = texto.split(/\r?\n/);
  lineas.forEach(function (linea, i) {
    p.appendChild(document.createTextNode(linea));
    if (i < lineas.length - 1) p.appendChild(document.createElement("br"));
  });
}

// El cierre se añade al final del <p>, después del mensaje
function renderTexto(p, mensaje, cierre) {
  p.textContent = "";
  agregarLineas(p, mensaje.trim());
  const c = (cierre || "").replace(/\s+$/, "");
  if (c.trim()) {
    p.appendChild(document.createElement("br"));
    agregarLineas(p, c);
  }
}

// Crea en el DOM el mensaje de una notificación (título = div, mensaje + cierre = p)
function crearMensajeDOM(n) {
  const aside = document.createElement("aside");
  aside.className = "msg hidden";
  aside.style.maxWidth = "min(90vw, 640px)";

  const titulo = document.createElement("div");
  titulo.className = "text-xs text-purple-400 mb-2";
  titulo.textContent = n.titulo;

  const p = document.createElement("p");
  p.className = "text-sm text-gray-200 leading-relaxed";
  renderTexto(p, n.mensaje, n.cierre);

  aside.append(titulo, p);
  document.getElementById("mainPage").appendChild(aside);
  return aside;
}

// Descarga las notificaciones y devuelve solo las vigentes (entre inicio y expiración)
async function obtenerNotificaciones() {
  try {
    const base = "https://www.gstatic.com/firebasejs/10.12.2/";
    const [appMod, fsMod] = await Promise.all([
      import(base + "firebase-app.js"),
      import(base + "firebase-firestore.js")
    ]);

    const app = appMod.initializeApp(firebaseConfig);
    const db = fsMod.getFirestore(app);
    const q = fsMod.query(
      fsMod.collection(db, COLECCION_NOTIFICACIONES),
      fsMod.orderBy("inicio", "desc")
    );
    const snap = await fsMod.getDocs(q);

    const ahora = new Date();
    const vigentes = [];
    snap.forEach(function (d) {
      const x = d.data();
      if (!x.inicio || !x.expira) return;
      const inicio = x.inicio.toDate();
      const expira = x.expira.toDate();
      if (ahora >= inicio && ahora <= expira) {
        vigentes.push({
          titulo: x.titulo || "",
          mensaje: x.mensaje || "",
          cierre: x.cierre || ""
        });
      }
    });
    return vigentes;
  } catch (err) {
    console.warn("No se pudieron cargar las notificaciones:", err);
    return [];
  }
}

// ---------- Cola de mensajes (se muestra uno a la vez) ----------
let colaMensajes = [];
let mensajeActual = null;
let mensajesIniciados = false;

// Muestra el siguiente mensaje de la cola y lo cierra al hacer clic fuera de él
function mostrarSiguiente() {
  const el = colaMensajes.shift();
  if (!el) return;

  mensajeActual = el;
  el.classList.remove("hidden");

  // Se registra en el siguiente ciclo para que el clic que lo abrió no lo cierre
  setTimeout(function () {
    document.addEventListener("click", function cerrar(e) {
      if (el.contains(e.target)) return;
      el.classList.add("hidden");
      document.removeEventListener("click", cerrar);
      mensajeActual = null;
      mostrarSiguiente();
    });
  }, 0);
}

async function mostrarMensajes() {
  if (mensajesIniciados) return;
  mensajesIniciados = true;

  // 1) Mensajes fijos de la página, si están dentro de su rango de fechas
  if (dentroDeRango(DIC_INICIO, DIC_FIN)) {
    colaMensajes.push(document.getElementById("mensaje-dic"));
  }
  if (dentroDeRango(JUN_INICIO, JUN_FIN)) {
    colaMensajes.push(document.getElementById("mensaje-jun"));
  }
  colaMensajes = colaMensajes.filter(Boolean);
  if (!mensajeActual) mostrarSiguiente();

  // 2) Notificaciones vigentes guardadas en Firebase
  const notificaciones = await obtenerNotificaciones();
  notificaciones.forEach(function (n) {
    colaMensajes.push(crearMensajeDOM(n));
  });
  if (!mensajeActual) mostrarSiguiente();
}

function mostrarJun() {
  const fin = JUN_FIN;
  const timerJun = document.getElementById("mensaje-jun-timer");
  if (!timerJun) return;

  let intervalo;

  // Actualizar el temporizador cada segundo
  function updateTimer() {
    const hoy = new Date();
    const totalTimeLeft = fin - hoy;

    // Si el tiempo terminó, se detiene el contador
    if (totalTimeLeft <= 0) {
      timerJun.textContent = "Tiempo agotado";
      clearInterval(intervalo);
      return;
    }

    // 1. Calcular la diferencia base en meses y años
    let months = (fin.getFullYear() - hoy.getFullYear()) * 12 + (fin.getMonth() - hoy.getMonth());

    // Crear una fecha intermedia para ver cuántos días exactos quedan en el mes actual
    const fechaIntermedia = new Date(hoy.getFullYear(), hoy.getMonth() + months, hoy.getDate(), hoy.getHours(), hoy.getMinutes(), hoy.getSeconds());

    // Si al sumarle los meses nos pasamos de la fecha de fin, restamos un mes
    if (fechaIntermedia > fin) {
      months--;
      fechaIntermedia.setMonth(hoy.getMonth() + months);
    }

    // 2. El tiempo restante "dentro del mes" se calcula con los milisegundos que quedan
    const timeLeftEnMes = fin - fechaIntermedia;

    // 3. Ahora sí, calculamos el resto de componentes de forma segura
    const days = Math.floor(timeLeftEnMes / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeftEnMes % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftEnMes % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeftEnMes % (1000 * 60)) / 1000);

    // 4. Construir el texto dinámico y mostrarlo en el HTML
    const parts = [];
    if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hora' : 'hrs'}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'mins'}`);
    parts.push(`${seconds}s`);

    timerJun.textContent = parts.join(' ');
  }

  // Ejecutar inmediatamente al cargar y luego cada segundo
  intervalo = setInterval(updateTimer, 1000);
  updateTimer();
}

(function () {
    const PASSWORD = "DL2312*"; // Cambia aquí la contraseña si lo deseas
    const STORAGE_KEY = "poems-unlocked-v1";

    const screen = document.getElementById("blockedScreen");
    const form = document.getElementById("passForm");
    const input = document.getElementById("passInput");
    const err = document.getElementById("passError");
    const remember = document.getElementById("remember");
    const clearBtn = document.getElementById("clearBtn");
    const main = document.getElementById('mainPage'); // Pagina principal
    const hm = document.getElementById('hm'); // Menu de inicio

    mostrarJun(); // Inicia el contador del mensaje de Junio

    // Si ya está autorizado, ocultar la pantalla de bloqueo
    if (localStorage.getItem(STORAGE_KEY) === "1") {
        screen.classList.add("hidden");
        mostrarMensajes();
    } else {
        main.classList.add('hidden'); // Ocultar la lista de poemas
        hm.classList.add('hidden'); // Mostrar el menu de inicio
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const val = input.value || "";
        if (val === PASSWORD) {
            if (remember.checked) localStorage.setItem(STORAGE_KEY, "1");
            screen.classList.add("hidden");
            err.style.display = "none";
            main.classList.remove('hidden'); // Mostrar la lista de poemas
            hm.classList.remove('hidden'); // Ocultar el menu de inicio
            mostrarMensajes(); // Mostrar los mensajes especiales
        } else {
            err.style.display = "block";
            input.value = "";
            input.focus();
        }
    });

    clearBtn.addEventListener("click", function () {
        input.value = "";
        err.style.display = "none"; // Ocultar el mensaje de error al limpiar
        input.focus();
    });
})();
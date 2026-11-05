// Rangos de fechas en los que se muestran los mensajes especiales
const DIC_INICIO = new Date(2024, 11, 23, 0, 0, 0); // 23 de Diciembre de 2024
const DIC_FIN = new Date(2025, 11, 31, 23, 59, 59); // 31 de Diciembre de 2025
const JUN_INICIO = new Date(2026, 5, 4, 0, 0, 0); // 4 de Junio de 2026
const JUN_FIN = new Date(2026, 10, 10, 23, 59, 59); // 10 de Noviembre de 2026
const NOV_INICIO = new Date(2026, 10, 11, 0, 0, 0); // 11 de Noviembre de 2026
const NOV_FIN = new Date(2026, 11, 31, 23, 59, 59); // 31 de Diciembre de 2026

function dentroDeRango(inicio, fin) {
  const hoy = new Date();
  return hoy >= inicio && hoy <= fin;
}

// Muestra un mensaje y lo cierra al hacer clic fuera de él
function abrirMensaje(el) {
  if (!el) return;
  el.classList.remove("hidden");

  // Se registra en el siguiente ciclo para que el clic que lo abrió no lo cierre
  setTimeout(function () {
    document.addEventListener("click", function cerrar(e) {
      if (!el.contains(e.target)) {
        el.classList.add("hidden");
        document.removeEventListener("click", cerrar);
      }
    });
  }, 0);
}

function mostrarMensajes() {
  if (dentroDeRango(DIC_INICIO, DIC_FIN)) {
    abrirMensaje(document.getElementById("mensaje-dic1"));
  }
  if (dentroDeRango(JUN_INICIO, JUN_FIN)) {
    abrirMensaje(document.getElementById("mensaje-jun1"));
  }
  if (dentroDeRango(NOV_INICIO, NOV_FIN)) {
    abrirMensaje(document.getElementById("mensaje-nov1"));
  }
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
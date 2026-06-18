function mostrarDic() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const day = new Date().getDate();
  const hoy = new Date(year, month, day);
  const inicio = new Date(2024, 11, 23, 0, 0, 0); // 23 de Diciembre de 2024
  const fin = new Date(2025, 11, 31, 23, 59, 59); // 31 de Diciembre de 2025

  // Actualizar el temporizador cada segundo
  const updateTimer = () => {
    const timeLeft = finJun - new Date();
    if (timeLeft > 0) {
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      timerJun.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
      timerJun.textContent = "Tiempo agotado";
    }
  };

  // Iniciar el temporizador
  updateTimer();
  setInterval(updateTimer, 1000);

  if (hoy >= inicio && hoy <= finDic) {
    dic.classList.remove("hidden");

    // Cerrar al hacer clic fuera del div
    document.addEventListener("click", function cerrar(e) {
      if (!dic.contains(e.target)) {
        dic.classList.add("hidden");
        document.removeEventListener("click", cerrar);
      }
    });
  }

  if (hoy >= inicio && hoy <= finJun) {
    jun.classList.remove("hidden");

    // Cerrar al hacer clic fuera del div
    document.addEventListener("click", function cerrar(e) {
      if (!jun.contains(e.target)) {
        jun.classList.add("hidden");
        document.removeEventListener("click", cerrar);
      }
    });
  }


}
function mostrarJun() {
  const hoy = new Date();
  const inicio = new Date(2026, 5, 4, 0, 0, 0); // 4 de Junio de 2026
  const fin = new Date(2026, 11, 31, 23, 59, 59); // 31 de Diciembre de 2026
  const jun = document.getElementById("mensaje-jun");
  const timerJun = document.getElementById("mensaje-jun-timer");

  // Actualizar el temporizador cada segundo
  function updateTimer() {
    const hoy = new Date();
    const totalTimeLeft = fin - hoy;

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
  updateTimer();
  setInterval(updateTimer, 1000);

  // Mostrar el contenedor solo si estamos dentro del rango de fechas
  if (hoy >= inicio && hoy <= fin) {
    if (jun) {
      jun.classList.remove("hidden");

      // Cerrar al hacer clic fuera del div
      document.addEventListener("click", function cerrar(e) {
        if (!jun.contains(e.target)) {
          jun.classList.add("hidden");
          document.removeEventListener("click", cerrar);
        }
      });
    }
  }
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
    const jun = document.getElementById('mensaje-jun'); // Mensaje de Junio
    const junFuction = mostrarJun(); // Función para mostrar el mensaje de Junio

    // Si ya está autorizado, ocultar la pantalla de bloqueo
    if (localStorage.getItem(STORAGE_KEY) === "1") {
        screen.classList.add("hidden");
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
            jun.classList.remove('hidden'); // Mostrar el mensaje de Junio
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

    // Permitir Enter y accesibilidad mínima
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") form.requestSubmit();
    });
})();
(function () {
    const PASSWORD = "DL2312*"; // Cambia aquí la contraseña si lo deseas
    const STORAGE_KEY = "poemas-unlocked-v1";

    const screen = document.getElementById("blockedScreen");
    const form = document.getElementById("passForm");
    const input = document.getElementById("passInput");
    const err = document.getElementById("passError");
    const remember = document.getElementById("remember");
    const clearBtn = document.getElementById("clearBtn");
    const main = document.getElementById('mainPage'); // Pagina principal
    const hm = document.getElementById('hm'); // Menu de inicio

    // Si ya está autorizado, ocultar la pantalla de bloqueo
    if (localStorage.getItem(STORAGE_KEY) === "1") {
        screen.classList.add("hidden");
    } else {
        main.classList.add('hidden'); // Ocultar la lista de poemas
        hm.classList.remove('hidden'); // Mostrar el menu de inicio
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
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, addDoc, doc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYKVOqh4d9k3KkzYqxEXZWBwCpbXytpmM",
  authDomain: "my-princess-hg.firebaseapp.com",
  projectId: "my-princess-hg",
  storageBucket: "my-princess-hg.firebasestorage.app",
  messagingSenderId: "444245442541",
  appId: "1:444245442541:web:9f93023640f59273bd71e4"
};

const COLECCION = "notificaciones";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);

let editandoId = null;
let docs = [];
let cancelarSnapshot = null;

/* ---------- Utilidades ---------- */
function aInputLocal(fecha) {
  const p = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}T${p(fecha.getHours())}:${p(fecha.getMinutes())}`;
}

function formatear(fecha) {
  return fecha.toLocaleString("es", { dateStyle: "medium", timeStyle: "short" });
}

function agregarLineas(p, texto) {
  const lineas = texto.split(/\r?\n/);
  lineas.forEach((linea, i) => {
    p.appendChild(document.createTextNode(linea));
    if (i < lineas.length - 1) p.appendChild(document.createElement("br"));
  });
}

// El cierre se añade al final del <p>, después del mensaje
function renderTexto(p, mensaje, cierre) {
  p.textContent = "";
  agregarLineas(p, mensaje.trim());
  const c = cierre.replace(/\s+$/, "");
  if (c.trim()) {
    p.appendChild(document.createElement("br"));
    agregarLineas(p, c);
  }
}

function estado(inicio, expira, ahora) {
  if (ahora < inicio) return ["programada", "Programada"];
  if (ahora > expira) return ["expirada", "Expirada"];
  return ["activa", "Activa"];
}

function mostrarError(el, texto) {
  el.textContent = texto;
  el.hidden = !texto;
}

function mensajeAuth(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
    case "auth/network-request-failed":
      return "Sin conexión. Revisa tu internet.";
    case "auth/operation-not-allowed":
      return "El acceso con correo y contraseña no está habilitado en Firebase.";
    default:
      return "No se pudo iniciar sesión (" + code + ").";
  }
}

function mensajeFirestore(e) {
  if (e && e.code === "permission-denied") {
    return "Sin permisos: revisa las reglas de Firestore y que tu cuenta sea la autorizada.";
  }
  return "Error: " + (e && e.message ? e.message : e);
}

/* ---------- Vista previa ---------- */
function actualizarVistaPrevia() {
  $("prevTitulo").textContent = $("titulo").value.trim() || "Título";
  renderTexto($("prevMensaje"), $("mensaje").value || "Mensaje", $("cierre").value);
}

["titulo", "mensaje", "cierre"].forEach((id) => $(id).addEventListener("input", actualizarVistaPrevia));

/* ---------- Formulario ---------- */
function limpiarFormulario() {
  editandoId = null;
  $("notifForm").reset();
  const ahora = new Date();
  ahora.setSeconds(0, 0);
  $("inicio").value = aInputLocal(ahora);
  $("expira").value = aInputLocal(new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000));
  $("formTitle").textContent = "NUEVA NOTIFICACIÓN:";
  $("saveBtn").textContent = "Publicar";
  $("cancelBtn").hidden = true;
  mostrarError($("formError"), "");
  actualizarVistaPrevia();
}

function editar(d) {
  editandoId = d.id;
  $("titulo").value = d.titulo;
  $("mensaje").value = d.mensaje;
  $("cierre").value = d.cierre;
  $("inicio").value = aInputLocal(d.inicio);
  $("expira").value = aInputLocal(d.expira);
  $("formTitle").textContent = "EDITANDO NOTIFICACIÓN:";
  $("saveBtn").textContent = "Guardar cambios";
  $("cancelBtn").hidden = false;
  mostrarError($("formError"), "");
  mostrarError($("formOk"), "");
  actualizarVistaPrevia();
  $("notifForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("cancelBtn").addEventListener("click", limpiarFormulario);

$("notifForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarError($("formError"), "");
  mostrarError($("formOk"), "");

  const titulo = $("titulo").value.trim();
  const mensaje = $("mensaje").value.trim();
  const cierre = $("cierre").value.replace(/\s+$/, "");
  const inicio = new Date($("inicio").value);
  const expira = new Date($("expira").value);

  if (!titulo || !mensaje) {
    return mostrarError($("formError"), "El título y el mensaje son obligatorios.");
  }
  if (isNaN(inicio) || isNaN(expira)) {
    return mostrarError($("formError"), "Indica las fechas de inicio y expiración.");
  }
  if (expira <= inicio) {
    return mostrarError($("formError"), "La expiración debe ser posterior al inicio.");
  }

  const data = {
    titulo,
    mensaje,
    cierre,
    inicio: Timestamp.fromDate(inicio),
    expira: Timestamp.fromDate(expira)
  };

  $("saveBtn").disabled = true;
  try {
    if (editandoId) {
      await updateDoc(doc(db, COLECCION, editandoId), data);
      mostrarError($("formOk"), "Cambios guardados.");
    } else {
      await addDoc(collection(db, COLECCION), { ...data, creado: serverTimestamp() });
      mostrarError($("formOk"), "Notificación publicada.");
    }
    limpiarFormulario();
  } catch (err) {
    mostrarError($("formError"), mensajeFirestore(err));
  } finally {
    $("saveBtn").disabled = false;
  }
});

/* ---------- Lista ---------- */
function renderLista() {
  const ul = $("lista");
  ul.textContent = "";
  $("listaVacia").hidden = docs.length > 0;
  const ahora = new Date();

  docs.forEach((d) => {
    const [clase, etiqueta] = estado(d.inicio, d.expira, ahora);

    const li = document.createElement("li");
    li.className = "item";

    const head = document.createElement("div");
    head.className = "item-head";
    const titulo = document.createElement("div");
    titulo.className = "item-title";
    titulo.textContent = d.titulo;
    const badge = document.createElement("span");
    badge.className = "badge " + clase;
    badge.textContent = etiqueta;
    head.append(titulo, badge);

    const fechas = document.createElement("div");
    fechas.className = "item-dates";
    fechas.textContent = `Inicio: ${formatear(d.inicio)} · Expira: ${formatear(d.expira)}`;

    const texto = document.createElement("div");
    texto.className = "item-text";
    texto.textContent = d.mensaje + (d.cierre ? "\n" + d.cierre : "");

    const acciones = document.createElement("div");
    acciones.className = "item-actions";
    const bEditar = document.createElement("button");
    bEditar.type = "button";
    bEditar.className = "btn btn-dark btn-small";
    bEditar.textContent = "Editar";
    bEditar.addEventListener("click", () => editar(d));
    const bBorrar = document.createElement("button");
    bBorrar.type = "button";
    bBorrar.className = "btn btn-danger btn-small";
    bBorrar.textContent = "Eliminar";
    bBorrar.addEventListener("click", async () => {
      if (!confirm("¿Eliminar esta notificación?")) return;
      try {
        await deleteDoc(doc(db, COLECCION, d.id));
        if (editandoId === d.id) limpiarFormulario();
      } catch (err) {
        mostrarError($("formError"), mensajeFirestore(err));
      }
    });
    acciones.append(bEditar, bBorrar);

    li.append(head, fechas, texto, acciones);
    ul.appendChild(li);
  });
}

function escucharNotificaciones() {
  const q = query(collection(db, COLECCION), orderBy("inicio", "desc"));
  cancelarSnapshot = onSnapshot(
    q,
    (snap) => {
      docs = snap.docs
        .map((s) => {
          const x = s.data();
          if (!x.inicio || !x.expira) return null;
          return {
            id: s.id,
            titulo: x.titulo || "",
            mensaje: x.mensaje || "",
            cierre: x.cierre || "",
            inicio: x.inicio.toDate(),
            expira: x.expira.toDate()
          };
        })
        .filter(Boolean);
      renderLista();
    },
    (err) => mostrarError($("formError"), mensajeFirestore(err))
  );
}

// Actualiza los estados (programada / activa / expirada) cada minuto
setInterval(() => { if (docs.length) renderLista(); }, 60000);

/* ---------- Sesión ---------- */
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarError($("loginError"), "");
  $("loginBtn").disabled = true;
  try {
    await signInWithEmailAndPassword(auth, $("loginEmail").value.trim(), $("loginPass").value);
    $("loginPass").value = "";
  } catch (err) {
    mostrarError($("loginError"), mensajeAuth(err.code));
    $("loginPass").value = "";
  } finally {
    $("loginBtn").disabled = false;
  }
});

$("logoutBtn").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (user) {
    $("userEmail").textContent = user.email || "";
    $("loginView").hidden = true;
    $("panelView").hidden = false;
    limpiarFormulario();
    escucharNotificaciones();
  } else {
    if (cancelarSnapshot) { cancelarSnapshot(); cancelarSnapshot = null; }
    docs = [];
    $("panelView").hidden = true;
    $("loginView").hidden = false;
  }
});

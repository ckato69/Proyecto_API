// Claves para guardar datos en el navegador (localStorage)
const CLAVE_USUARIOS = "nj_usuarios";
const CLAVE_SESION = "nj_sesion";

// Elementos del HTML
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const authAlert = document.getElementById("authAlert");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");
const currentUserLabel = document.getElementById("currentUserLabel");

const apiStatusBox = document.getElementById("apiStatusBox");
const albumsGrid = document.getElementById("albumsGrid");
const favoriteSummary = document.getElementById("favoriteSummary");
const searchAlbumInput = document.getElementById("searchAlbumInput");

// Variables que cambian mientras se usa la app
let usuarioActual = null;
let albumes = [];
let calificaciones = {}; // ejemplo: { "idAlbum": 5 }
let favoritoId = null;

// Datos de las integrantes de NewJeans
const miembrosNewJeans = [
  {
    nombre: "Minji",
    nombreCompleto: "Kim Min-ji",
    nacimiento: "7 de mayo de 2004",
    nacionalidad: "Surcoreana",
    rol: "Vocalista y bailarina",
    bio: "Debutó en julio de 2022 con NewJeans; conocida por su estilo clásico y presencia en el grupo.",
    foto: "https://placehold.co/400x400/a8d8f0/181920?text=Minji"
  },
  {
    nombre: "Hanni",
    nombreCompleto: "Hanni Pham",
    nacimiento: "6 de octubre de 2004",
    nacionalidad: "Vietnamita-australiana",
    rol: "Vocalista y bailarina",
    bio: "Destacada por su voz, energía en el escenario y participación en canciones del grupo.",
    foto: "https://placehold.co/400x400/f7c6d9/181920?text=Hanni"
  },
  {
    nombre: "Danielle",
    nombreCompleto: "Danielle Marsh",
    nacimiento: "11 de abril de 2005",
    nacionalidad: "Surcoreana-australiana",
    rol: "Vocalista y bailarina",
    bio: "Parte del grupo desde su debut en 2022, conocida por su estilo fresco en temas como Super Shy.",
    foto: "https://placehold.co/400x400/fff3b0/181920?text=Danielle"
  },
  {
    nombre: "Haerin",
    nombreCompleto: "Kang Haerin",
    nacimiento: "15 de mayo de 2006",
    nacionalidad: "Surcoreana",
    rol: "Vocalista y bailarina",
    bio: "Tiene una voz suave, baila muy limpio y suele tener una vibra tranquila.",
    foto: "https://placehold.co/400x400/d8ecfa/181920?text=Haerin"
  },
  {
    nombre: "Hyein",
    nombreCompleto: "Lee Hyein",
    nacimiento: "21 de abril de 2008",
    nacionalidad: "Surcoreana",
    rol: "Vocalista, bailarina y maknae",
    bio: "La integrante más joven; debutó a los 14 años y destaca mucho en el escenario.",
    foto: "https://placehold.co/400x400/fce4ec/181920?text=Hyein"
  }
];

// ==================== LOGIN Y REGISTRO ====================

function obtenerUsuarios() {
  const datos = localStorage.getItem(CLAVE_USUARIOS);
  if (!datos) return [];
  return JSON.parse(datos);
}

function guardarUsuarios(lista) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
}

function mostrarAlerta(mensaje, tipo) {
  authAlert.textContent = mensaje;
  authAlert.className = "alert alert-" + tipo + " py-2 small";
}

function ocultarAlerta() {
  authAlert.textContent = "";
  authAlert.className = "alert d-none py-2 small";
}

// Registrar usuario nuevo
registerForm.addEventListener("submit", function (evento) {
  evento.preventDefault();
  ocultarAlerta();

  const usuario = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmar = document.getElementById("regConfirmPassword").value;

  if (usuario.length < 3) {
    mostrarAlerta("El usuario debe tener al menos 3 letras.", "danger");
    return;
  }

  if (password.length < 4) {
    mostrarAlerta("La contraseña debe tener al menos 4 caracteres.", "danger");
    return;
  }

  if (password !== confirmar) {
    mostrarAlerta("Las contraseñas no son iguales.", "danger");
    return;
  }

  const usuarios = obtenerUsuarios();
  const yaExiste = usuarios.some(function (u) {
    return u.usuario.toLowerCase() === usuario.toLowerCase();
  });

  if (yaExiste) {
    mostrarAlerta("Ese usuario ya existe.", "danger");
    return;
  }

  usuarios.push({ usuario: usuario, password: password });
  guardarUsuarios(usuarios);

  registerForm.reset();
  mostrarAlerta("Cuenta creada. Ahora inicia sesión.", "success");

  const tabLogin = document.getElementById("tabLoginBtn");
  if (window.bootstrap && tabLogin) {
    bootstrap.Tab.getOrCreateInstance(tabLogin).show();
  }
});

// Iniciar sesión
loginForm.addEventListener("submit", function (evento) {
  evento.preventDefault();
  ocultarAlerta();

  const usuario = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (usuario === "" || password === "") {
    mostrarAlerta("Escribe tu usuario y contraseña.", "danger");
    return;
  }

  const usuarios = obtenerUsuarios();
  const encontrado = usuarios.find(function (u) {
    return (
      u.usuario.toLowerCase() === usuario.toLowerCase() &&
      u.password === password
    );
  });

  if (!encontrado) {
    mostrarAlerta("Usuario o contraseña incorrectos.", "danger");
    return;
  }

  localStorage.setItem(CLAVE_SESION, encontrado.usuario);
  entrarAApp(encontrado.usuario);
});

// Cerrar sesión
logoutBtn.addEventListener("click", function () {
  localStorage.removeItem(CLAVE_SESION);
  usuarioActual = null;
  appSection.classList.add("d-none");
  authSection.classList.remove("d-none");
  loginForm.reset();
  ocultarAlerta();
});

// ==================== CALIFICACIONES Y FAVORITO ====================

function clavePreferencias(usuario) {
  return "nj_prefs_" + usuario.toLowerCase();
}

function cargarPreferencias(usuario) {
  const guardadas = localStorage.getItem(clavePreferencias(usuario));
  if (!guardadas) {
    calificaciones = {};
    favoritoId = null;
    return;
  }

  const obj = JSON.parse(guardadas);
  calificaciones = obj.calificaciones || {};
  favoritoId = obj.favoritoId || null;
}

function guardarPreferencias() {
  if (!usuarioActual) return;
  const obj = {
    calificaciones: calificaciones,
    favoritoId: favoritoId
  };
  localStorage.setItem(clavePreferencias(usuarioActual), JSON.stringify(obj));
}

function calificarAlbum(idAlbum, estrellas) {
  calificaciones[idAlbum] = estrellas;
  guardarPreferencias();
  mostrarAlbumes(searchAlbumInput.value);
}

function cambiarFavorito(idAlbum) {
  if (favoritoId === idAlbum) {
    favoritoId = null;
  } else {
    favoritoId = idAlbum;
  }
  guardarPreferencias();
  actualizarResumenFavorito();
  mostrarAlbumes(searchAlbumInput.value);
}

function actualizarResumenFavorito() {
  if (!favoritoId) {
    favoriteSummary.textContent = "Aún no eliges un favorito";
    return;
  }

  const albumFav = albumes.find(function (a) {
    return String(a.id) === String(favoritoId);
  });

  if (albumFav) {
    favoriteSummary.textContent = albumFav.titulo + " (" + albumFav.anio + ")";
  } else {
    favoriteSummary.textContent = "Álbum favorito seleccionado";
  }
}

// ==================== CARGAR ÁLBUMES DESDE API ====================

async function cargarAlbumes() {
  apiStatusBox.className = "alert alert-info py-2 small";
  apiStatusBox.textContent = "Cargando lanzamientos de NewJeans...";

  // 1) Intentar con MusicBrainz
  try {
    const urlMB =
      "https://musicbrainz.org/ws/2/release-group?query=artist:NewJeans&fmt=json&limit=25";
    const respMB = await fetch(urlMB);
    if (!respMB.ok) throw new Error("Error en MusicBrainz");

    const dataMB = await respMB.json();
    const grupos = dataMB["release-groups"] || [];
    const titulosVistos = [];
    const listaMB = [];

    for (let i = 0; i < grupos.length; i++) {
      const g = grupos[i];
      const titulo = (g.title || "").trim();
      if (!titulo) continue;

      const minuscula = titulo.toLowerCase();
      if (titulosVistos.includes(minuscula)) continue;
      titulosVistos.push(minuscula);

      const anio = g["first-release-date"]
        ? g["first-release-date"].slice(0, 4)
        : "N/A";
      const tipo = g["primary-type"] || "Lanzamiento";

      listaMB.push({
        id: g.id || "mb-" + i,
        titulo: titulo,
        anio: anio,
        pistas: "—",
        tipo: tipo,
        portada:
          "https://coverartarchive.org/release-group/" + g.id + "/front-500",
        respaldoPortada:
          "https://placehold.co/400x400/a8d8f0/181920?text=" +
          encodeURIComponent(titulo)
      });
    }

    if (listaMB.length > 0) {
      albumes = listaMB;
      apiStatusBox.className = "alert alert-success py-2 small";
      apiStatusBox.textContent =
        "Se cargaron " + albumes.length + " lanzamientos desde MusicBrainz.";
      actualizarResumenFavorito();
      mostrarAlbumes();
      return;
    }
  } catch (error) {
    console.log("Falló MusicBrainz, probando iTunes...", error);
  }

  // 2) Respaldo con iTunes
  try {
    const urlItunes =
      "https://itunes.apple.com/search?term=NewJeans&entity=album&attribute=artistTerm&limit=25";
    const respIt = await fetch(urlItunes);
    if (!respIt.ok) throw new Error("Error en iTunes");

    const dataIt = await respIt.json();
    const resultados = dataIt.results || [];
    const titulosIt = [];
    const listaIt = [];

    for (let i = 0; i < resultados.length; i++) {
      const item = resultados[i];
      const artista = (item.artistName || "").toLowerCase();
      if (!artista.includes("newjeans")) continue;

      const titulo = item.collectionName || "Sin título";
      const clave = titulo.toLowerCase();
      if (titulosIt.includes(clave)) continue;
      titulosIt.push(clave);

      const anio = item.releaseDate
        ? new Date(item.releaseDate).getFullYear()
        : "N/A";
      const portada = item.artworkUrl100
        ? item.artworkUrl100.replace("100x100bb", "600x600bb")
        : "https://placehold.co/400x400/f7c6d9/181920?text=" +
          encodeURIComponent(titulo);

      listaIt.push({
        id: String(item.collectionId),
        titulo: titulo,
        anio: anio,
        pistas: item.trackCount || "—",
        tipo: item.primaryGenreName || "K-Pop",
        portada: portada,
        respaldoPortada:
          "https://placehold.co/400x400/f7c6d9/181920?text=" +
          encodeURIComponent(titulo)
      });
    }

    if (listaIt.length > 0) {
      albumes = listaIt;
      apiStatusBox.className = "alert alert-success py-2 small";
      apiStatusBox.textContent =
        "Se cargaron " + albumes.length + " álbumes desde iTunes.";
      actualizarResumenFavorito();
      mostrarAlbumes();
      return;
    }
  } catch (error) {
    console.log("Falló iTunes, usando lista local...", error);
  }

  // 3) Lista local por si no hay internet o fallan las APIs
  albumes = [
    {
      id: "ep1",
      titulo: "New Jeans",
      anio: 2022,
      pistas: 4,
      tipo: "EP",
      portada: "https://placehold.co/400x400/a8d8f0/181920?text=New+Jeans+EP",
      respaldoPortada: "https://placehold.co/400x400/a8d8f0/181920?text=New+Jeans+EP"
    },
    {
      id: "omg",
      titulo: "OMG",
      anio: 2023,
      pistas: 2,
      tipo: "Single Album",
      portada: "https://placehold.co/400x400/f7c6d9/181920?text=OMG",
      respaldoPortada: "https://placehold.co/400x400/f7c6d9/181920?text=OMG"
    },
    {
      id: "getup",
      titulo: "Get Up",
      anio: 2023,
      pistas: 6,
      tipo: "EP",
      portada: "https://placehold.co/400x400/fff3b0/181920?text=Get+Up",
      respaldoPortada: "https://placehold.co/400x400/fff3b0/181920?text=Get+Up"
    },
    {
      id: "howsweet",
      titulo: "How Sweet",
      anio: 2024,
      pistas: 2,
      tipo: "Single",
      portada: "https://placehold.co/400x400/d8ecfa/181920?text=How+Sweet",
      respaldoPortada: "https://placehold.co/400x400/d8ecfa/181920?text=How+Sweet"
    },
    {
      id: "supernatural",
      titulo: "Supernatural",
      anio: 2024,
      pistas: 2,
      tipo: "Single",
      portada: "https://placehold.co/400x400/fce4ec/181920?text=Supernatural",
      respaldoPortada: "https://placehold.co/400x400/fce4ec/181920?text=Supernatural"
    }
  ];

  apiStatusBox.className = "alert alert-warning py-2 small";
  apiStatusBox.textContent =
    "No hubo conexión con las APIs; se muestra una lista local.";
  actualizarResumenFavorito();
  mostrarAlbumes();
}

// ==================== DIBUJAR ÁLBUMES EN PANTALLA ====================

function dibujarEstrellas(idAlbum, puntuacionActual) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const llena = i <= puntuacionActual;
    html += `
      <button type="button" class="star-btn" onclick="calificarAlbum('${idAlbum}', ${i})">
        <i class="bi ${llena ? "bi-star-fill text-warning" : "bi-star text-secondary"}"></i>
      </button>
    `;
  }
  return html;
}

function mostrarAlbumes(textoFiltro = "") {
  const filtro = textoFiltro.trim().toLowerCase();

  const filtrados = albumes.filter(function (album) {
    if (filtro === "") return true;
    return (
      album.titulo.toLowerCase().includes(filtro) ||
      String(album.anio).toLowerCase().includes(filtro)
    );
  });

  if (filtrados.length === 0) {
    albumsGrid.innerHTML = `
      <div class="col-12">
        <div class="text-center py-4 bg-white rounded border">
          <p class="text-muted mb-0">No se encontraron resultados.</p>
        </div>
      </div>
    `;
    return;
  }

  let html = "";

  for (let i = 0; i < filtrados.length; i++) {
    const album = filtrados[i];
    const puntuacion = calificaciones[album.id] || 0;
    const esFavorito = String(favoritoId) === String(album.id);

    html += `
      <div class="col">
        <div class="card album-card h-100 ${esFavorito ? "is-favorite" : ""}">
          <img
            src="${album.portada}"
            alt="${album.titulo}"
            class="album-cover"
            onerror="this.onerror=null; this.src='${album.respaldoPortada}';"
          />
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <h5 class="card-title fw-bold mb-0">${album.titulo}</h5>
              ${
                esFavorito
                  ? '<span class="badge bg-danger">Favorito</span>'
                  : '<span class="badge bg-light text-dark border">' + album.anio + "</span>"
              }
            </div>

            <p class="text-muted small mb-3">
              ${album.tipo} • ${album.pistas} pistas • ${album.anio}
            </p>

            <div class="mb-3">
              <div class="small fw-semibold mb-1">
                Tu calificación: ${puntuacion > 0 ? puntuacion + "/5" : "Sin calificar"}
              </div>
              <div>${dibujarEstrellas(album.id, puntuacion)}</div>
            </div>

            <button
              type="button"
              class="btn ${esFavorito ? "btn-danger" : "btn-outline-danger"} btn-sm mt-auto"
              onclick="cambiarFavorito('${album.id}')"
            >
              ${esFavorito ? "Quitar favorito" : "Marcar favorito"}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  albumsGrid.innerHTML = html;
}

// ==================== SECCIÓN DE MIEMBROS ====================

function mostrarMiembros() {
  if (document.getElementById("membersSection")) return;

  const main = appSection.querySelector("main");
  if (!main) return;

  const seccion = document.createElement("section");
  seccion.id = "membersSection";
  seccion.className = "mt-5 pt-4 border-top";

  let tarjetasMiembros = "";
  for (let i = 0; i < miembrosNewJeans.length; i++) {
    const m = miembrosNewJeans[i];
    tarjetasMiembros += `
      <div class="col">
        <div class="card h-100 shadow-sm border-0">
          <img
            src="${m.foto}"
            alt="${m.nombre}"
            class="w-100"
            style="height: 240px; object-fit: cover;"
          />
          <div class="card-body">
            <h5 class="card-title fw-bold mb-1">${m.nombre}</h5>
            <p class="text-muted small mb-2">${m.nombreCompleto} (${m.nacionalidad})</p>
            <p class="small mb-1"><strong>Nacimiento:</strong> ${m.nacimiento}</p>
            <p class="small mb-2"><strong>Rol:</strong> ${m.rol}</p>
            <p class="card-text small text-secondary mb-0">${m.bio}</p>
          </div>
        </div>
      </div>
    `;
  }

  seccion.innerHTML = `
    <h2 class="fw-bold mb-1">Miembros de NewJeans</h2>
    <p class="text-muted mb-4">Datos básicos de cada integrante</p>
    <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
      ${tarjetasMiembros}
    </div>
  `;

  main.appendChild(seccion);
}

// Buscar álbumes mientras escribes
searchAlbumInput.addEventListener("input", function (evento) {
  mostrarAlbumes(evento.target.value);
});

// ==================== INICIO ====================

function entrarAApp(usuario) {
  usuarioActual = usuario;
  currentUserLabel.textContent = usuario;
  cargarPreferencias(usuario);

  authSection.classList.add("d-none");
  appSection.classList.remove("d-none");

  mostrarMiembros();
  cargarAlbumes();
}

document.addEventListener("DOMContentLoaded", function () {
  const sesionGuardada = localStorage.getItem(CLAVE_SESION);
  if (sesionGuardada) {
    entrarAApp(sesionGuardada);
  }
});
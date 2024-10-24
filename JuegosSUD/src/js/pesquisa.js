let jugadores = [];
let puntajes = {};
let rondas = 0;
let tiempoPorRonda = 0;
let rondaActual = 0;
let referencias = [];
let propiedadActual = "";
let propiedadSeleccionada = "";

// Cargar las referencias desde el JSON
async function cargarReferencias() {
  try {
    const response = await fetch("referencias.json");
    referencias = await response.json();
  } catch (error) {
    console.error("Error al cargar las referencias:", error);
  }
}

// Iniciar el juego con la configuración ingresada
function iniciarJuego() {
  const jugadoresInput = document.getElementById("jugadoresInput").value.trim();
  jugadores = jugadoresInput
    .split(/\s*,\s*/)
    .map((nombre) => nombre.replace(/\s+/g, "_"));
  rondas = parseInt(document.getElementById("rondasInput").value);
  tiempoPorRonda = parseInt(document.getElementById("tiempoInput").value);

  if (jugadores.length < 2) {
    // alert("Debes ingresar al menos dos jugadores.");
    document.getElementById("jugadoresInput").classList.add("is-invalid");
    document
      .getElementById("feedback-jugadores")
      .classList.add("invalid-feedback");
    document.getElementById("feedback-jugadores").innerHTML =
      "Debes ingresar al menos dos jugadores.";
    document.getElementById("feedback-jugadores").classList.remove("esconder");
    return;
  }
  document.getElementById("jugadoresInput").classList.remove("is-invalid");
  document
    .getElementById("feedback-jugadores")
    .classList.remove("invalid-feedback");
  document.getElementById("feedback-jugadores").classList.add("esconder");

  jugadores.forEach((jugador) => (puntajes[jugador.trim()] = 0));

  document.getElementById("configuracion").classList.add("esconder");
  document.getElementById("juego").classList.remove("esconder");
  document.getElementById("puntajes").classList.remove("esconder");

  cargarReferencias().then(() => {
    siguienteRonda();
  });
}

// Mostrar la siguiente ronda
function siguienteRonda(desempate) {
  if (rondaActual < rondas) {
    rondaActual++;
    mostrarReferenciaAleatoria(desempate);
  } else {
    mostrarGanador();
  }
}

// Mostrar una referencia aleatoria y permitir seleccionar la propiedad
function mostrarReferenciaAleatoria(desempate) {
  const referencia =
    referencias[Math.floor(Math.random() * referencias.length)];
  const propiedades = ["frase"];

  // Crear botones para seleccionar la propiedad
  let opcionesHTML = `<h2>Ronda ${rondaActual} de ${rondas}</h2>`;
  propiedades.forEach((prop) => {
    opcionesHTML += `<button class="btn btn-primary" onclick="mostrarPropiedad('${prop}', '${referencia[prop]}', '${referencia.escritura}', '${desempate}')">Comenzar</button>`;
  });

  document.getElementById("juego").innerHTML = opcionesHTML;
}

// Mostrar la propiedad seleccionada y el temporizador
function mostrarPropiedad(propiedad, valor, escritura, desempate) {
  propiedadActual = propiedad;
  const ronda = ``;
  if (desempate) {
    ronda == `<h2>Ronda de Desempate</h2>`;
  } else {
    ronda == `<h2>Ronda ${rondaActual} de ${rondas}</h2>`;
  }
  document.getElementById("juego").innerHTML = `
    <h1>Referencia:</h1>
    <h1>${valor}</h1>
    ${ronda}
    <h3 class="text-success esconder" id="escritura">${escritura}</h3>
    <button class="btn btn-info esconder" id="botonRespuesta" onclick="mostrarEscritura('${escritura}')">RESPUESTA</button>
    <p class="lead">Tiempo restante:</p> <h1 id="contador">${tiempoPorRonda}<br><small>segundos</small></h1>
    <button id="btnTiempo" class="btn btn-success" onclick="iniciarRonda('${escritura}')">Corre tiempo</button>
    <div class="progress esconder" id="progressbar" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" style="height: 20px">
    <div id="barraProgreso" class="progress-bar" style="width: 100%"></div>
    </div>
  `;
}

// Iniciar el temporizador para la ronda
function iniciarRonda() {
  $("#btnTiempo").hide();
  $("#progressbar").removeClass("esconder");

  let tiempoRestante = tiempoPorRonda;
  let progresoInicial = 100; // Progreso inicial de la barra
  const decremento = 100 / tiempoPorRonda; // Cuánto disminuye por segundo

  const timer = setInterval(() => {
    tiempoRestante--;
    $("#contador").text(tiempoRestante);

    // Actualizar barra de progreso
    progresoInicial -= decremento;
    document.getElementById(
      "barraProgreso"
    ).style.width = `${progresoInicial}%`;
    document
      .getElementById("barraProgreso")
      .setAttribute("aria-valuenow", progresoInicial);

    // Cambiar color según el progreso
    if (progresoInicial > 50) {
      barraProgreso.classList.remove("bg-warning", "bg-danger");
      barraProgreso.classList.add("bg-success");
    } else if (progresoInicial > 25) {
      barraProgreso.classList.remove("bg-success", "bg-danger");
      barraProgreso.classList.add("bg-warning");
    } else {
      barraProgreso.classList.remove("bg-success", "bg-warning");
      barraProgreso.classList.add("bg-danger");
    }

    if (tiempoRestante <= 0) {
      clearInterval(timer);
      document
        .getElementById("botonSiguienteRonda")
        .classList.remove("esconder");
      $("#botonRespuesta").removeClass("esconder");
      $("#progressbar").addClass("esconder");
    }
  }, 1000);

  document.getElementById("botonSiguienteRonda").classList.add("esconder");
  document.getElementById("escritura").classList.add("esconder");
}

// Verificar las respuestas y asignar puntos
function verificarRespuestas() {
  document.getElementById("botonRespuesta").classList.remove("esconder");
  let opcionesHTML = `<div class="row row-cols-md-3">`;
  let btnClass = [
    ["primary"],
    ["secondary"],
    ["success"],
    ["danger"],
    ["warning"],
    ["info"],
    ["light"],
  ];
  jugadores.forEach((jugador, index) => {
    opcionesHTML += `<div class="col" id="${jugador}">
    <div class="card border-${btnClass[index]} mb-3">
    <div class="card-header">${jugador}</div>
    <div class="card-body">
    <div class="card-title puntos-${jugador}">Puntos: ${puntajes[jugador]}</div>
    <div class="btn-group btn-group-sm">
    <button class="btn btn-outline-success" id="add-${jugador}" onclick="asignarPunto('${jugador}')"><i class="fa fa-plus-circle" aria-hidden="true"></i></button>
    <button class="btn btn-outline-danger" id="remove-${jugador}" onclick="quitarPunto('${jugador}')"><i class="fa fa-minus-circle" aria-hidden="true"></i></button>
    </div>
    </div>
    </div>
    </div>
    `;
  });
  document.getElementById("juego").innerHTML += opcionesHTML + "</div>";
}

// Mostrar la escritura correcta
function mostrarEscritura() {
  verificarRespuestas();
  document.getElementById("escritura").classList.remove("esconder");
  document.getElementById("botonRespuesta").classList.add("esconder");
}

// Asignar el punto al jugador seleccionado
function asignarPunto(jugador) {
  puntajes[jugador]++;
  mostrarPuntajes();
  document.getElementById("botonSiguienteRonda").classList.remove("esconder");
}

// Eliminar el punto al jugador seleccionado
function quitarPunto(jugador) {
  puntajes[jugador]--;
  mostrarPuntajes();
  document.getElementById("botonSiguienteRonda").classList.remove("esconder");
}

// Mostrar los puntajes actuales
function mostrarPuntajes() {
  jugadores.forEach((jugador) => {
    $(".puntos-" + jugador).text("Puntos: " + puntajes[jugador]);
    console.log($(".puntos-" + jugador));
    console.log(jugador + ":" + puntajes[jugador]);
  });
}

// Mostrar el jugador o equipo ganador
function mostrarGanador() {
  const maxPuntaje = Math.max(...Object.values(puntajes));
  let ganador = "";
  const jugadoresEmpatados = jugadores.filter(
    (jugador) => puntajes[jugador] === maxPuntaje
  );
  if (jugadoresEmpatados.length > 1) {
    // Hay empate
    document.getElementById(
      "juego"
    ).innerHTML = `<h3>Empate entre: ${jugadoresEmpatados.join(", ")}</h3>`;
    rondas++;
    const desempate = true;
    document.getElementById(
      "juego"
    ).innerHTML += `<button class="btn btn-warning" onclick="siguienteRonda(${desempate})">Iniciar ronda de desempate</button>`;
  } else {
    document.getElementById(
      "juego"
    ).innerHTML = `<h2>El ganador es: <strong>${jugadoresEmpatados[0]}</strong> con <strong>${maxPuntaje} puntos</strong></h2>`;
    $("#botonSiguienteRonda").addClass("esconder");
    $("#botonReiniciar").removeClass("esconder");
  }
}

// Reiniciar el juego para comenzar nuevamente
function reiniciarJuego() {
  jugadores = [];
  puntajes = {};
  rondaActual = 0;

  $("#configuracion").removeClass("esconder");
  $("#juego").addClass("esconder");
  $("#puntajes").addClass("esconder");
  $("#botonReiniciar").addClass("esconder");
}

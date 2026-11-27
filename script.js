const portada = document.querySelector('.portada');
const estela = document.querySelector('.estela');
const recorrido = document.querySelector('#recorrido');
const monarca = document.querySelector('.monarca');
const boton = document.querySelector('#empezar');
const movil = matchMedia('(max-width: 700px)');
const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)');

let longitud = 0;
let avance = 0;
let fotograma = 0;

function colocarMonarca(progreso) {
  const distancia = progreso * longitud;
  const punto = recorrido.getPointAtLength(distancia);
  const anterior = recorrido.getPointAtLength(Math.max(0, distancia - 6));
  const siguiente = recorrido.getPointAtLength(Math.min(longitud, distancia + 6));
  const rumbo = Math.atan2(siguiente.y - anterior.y, siguiente.x - anterior.x);
  const despegue = Math.min(1, progreso * 8);
  const giro = (Math.sin(rumbo) * 26 + Math.cos(rumbo) * 12) * despegue;
  const escala = 1 - .77 * (1 - (1 - progreso) ** 6);

  monarca.style.left = `${punto.x}px`;
  monarca.style.top = `${punto.y}px`;
  monarca.style.transform = `rotate(${giro}deg) scale(${escala})`;
}

function dibujarEstela() {
  const marco = portada.getBoundingClientRect();
  const fin = boton.getBoundingClientRect();
  const ancho = marco.width;
  const yBoton = fin.top - marco.top + fin.height * .57;
  const xBoton = fin.right - marco.left;
  const x = proporcion => ancho * proporcion;
  const yPapel = document.querySelector('.introduccion').offsetTop;
  const d = movil.matches
    ? `M ${x(.75)} ${x(.33)}
       C ${x(.86)} ${x(.35)} ${x(.966)} ${x(.49)} ${x(.946)} ${x(.66)}
       C ${x(.926)} ${x(.81)} ${x(.94)} ${yBoton - 48} ${x(.94)} ${yBoton - 18}
       Q ${x(.94)} ${yBoton + 9} ${xBoton + 17} ${yBoton + 5}`
    : `M ${x(.64)} ${x(.143)}
       C ${x(.55)} ${x(.155)} ${x(.425)} ${x(.186)} ${x(.44)} ${x(.254)}
       C ${x(.447)} ${x(.287)} ${x(.472)} ${x(.303)} ${x(.45)} ${yPapel - 3}
       C ${x(.429)} ${yPapel + 19} ${x(.51)} ${yPapel + 24} ${x(.553)} ${yPapel + x(.093)}
       C ${x(.628)} ${yPapel + x(.203)} ${x(.57)} ${yBoton + x(.033)} ${xBoton + 16} ${yBoton}`;

  estela.setAttribute('viewBox', `0 0 ${ancho} ${marco.height}`);
  recorrido.setAttribute('d', d);
  longitud = recorrido.getTotalLength();
  colocarMonarca(avance);
}

function avanzar() {
  const siguiente = portada.nextElementSibling;
  if (!siguiente) return;
  siguiente.querySelector('h2')?.focus({ preventScroll: true });
  siguiente.scrollIntoView({ behavior: reducirMovimiento.matches ? 'instant' : 'smooth' });
}

boton.addEventListener('click', () => {
  if (fotograma) return;
  if (entradaIniciada || reducirMovimiento.matches) {
    avanzar();
    return;
  }

  avance = 0;
  colocarMonarca(avance);
  const inicio = performance.now();
  function volar(ahora) {
    const tiempo = Math.min(1, (ahora - inicio) / 2900);
    avance = tiempo * tiempo * (3 - 2 * tiempo);
    colocarMonarca(avance);
    if (tiempo < 1) {
      fotograma = requestAnimationFrame(volar);
    } else {
      fotograma = 0;
      avanzar();
    }
  }
  fotograma = requestAnimationFrame(volar);
});

reducirMovimiento.addEventListener('change', () => {
  if (!reducirMovimiento.matches || !fotograma) return;
  cancelAnimationFrame(fotograma);
  fotograma = 0;
  avance = 0;
  colocarMonarca(avance);
  avanzar();
});

new ResizeObserver(dibujarEstela).observe(portada);
movil.addEventListener('change', dibujarEstela);
document.fonts.ready.then(dibujarEstela);
dibujarEstela();

const grafica = document.querySelector('.sentimiento');
const lienzo = document.querySelector('.lienzo-sentimiento');
const estelaEntrada = document.querySelector('.estela-entrada');
const caminoEntrada = estelaEntrada.querySelector('.vuelo-entrada');
const estelaAlOrigen = estelaEntrada.querySelector('.estela-al-origen');
const monarcaEntrada = document.querySelector('.monarca-entrada');
const origen = document.querySelector('.origen-sentimiento');
const indicio = document.querySelector('.indicio-sentimiento');
const categorias = document.querySelector('.categorias-sentimiento');
const botonesCategoria = Array.from(categorias.querySelectorAll('button'));
const tactil = matchMedia('(hover: none), (pointer: coarse)');
let entradaIniciada = false;
let avanceEntrada = 0;
let fotogramaEntrada = 0;
let longitudEntrada = 0;

const maximoMenciones = Math.max(...botonesCategoria.map(categoria => Number(categoria.dataset.menciones)));
for (const categoria of botonesCategoria) {
  categoria.style.setProperty('--proporcion', Number(categoria.dataset.menciones) / maximoMenciones);
  categoria.addEventListener('click', evento => {
    if (evento.pointerType !== 'touch' && !tactil.matches) return;
    const destacar = categoria.getAttribute('aria-pressed') === 'false';
    for (const otra of botonesCategoria) {
      otra.setAttribute('aria-pressed', String(otra === categoria && destacar));
    }
  });
}

function actualizarIndicio() {
  const mensaje = tactil.matches ? 'Toca para ver los datos' : 'Acércate para ver los datos';
  indicio.textContent = mensaje;
  origen.setAttribute('aria-label', origen.getAttribute('aria-expanded') === 'true' ? 'Datos de sentimiento desplegados' : mensaje);
}

function abrirGrafica() {
  if (grafica.classList.contains('abierto')) return;
  grafica.classList.add('abierto');
  origen.setAttribute('aria-expanded', 'true');
  categorias.inert = false;
  actualizarIndicio();
}

grafica.addEventListener('pointermove', evento => {
  if (evento.pointerType === 'mouse') abrirGrafica();
});
origen.addEventListener('click', abrirGrafica);
tactil.addEventListener('change', actualizarIndicio);
actualizarIndicio();

function colocarEntrada() {
  const distancia = avanceEntrada * longitudEntrada;
  const punto = caminoEntrada.getPointAtLength(distancia);
  const anterior = caminoEntrada.getPointAtLength(Math.max(0, distancia - 5));
  const siguiente = caminoEntrada.getPointAtLength(Math.min(longitudEntrada, distancia + 5));
  const giro = Math.atan2(siguiente.y - anterior.y, siguiente.x - anterior.x);
  monarcaEntrada.style.left = `${punto.x}px`;
  monarcaEntrada.style.top = `${punto.y}px`;
  monarcaEntrada.style.setProperty('--giro', `${Math.sin(giro) * 27 * (1 - avanceEntrada ** 5)}deg`);
}

function dibujarEntrada() {
  const marco = lienzo.getBoundingClientRect();
  const punto = origen.getBoundingClientRect();
  const x = punto.left + punto.width / 2 - marco.left;
  const y = punto.top + punto.height / 2 - marco.top;
  const anchoMonarca = monarcaEntrada.getBoundingClientRect().width;
  const llegadaX = marco.width * (movil.matches ? .225 : .18);
  const llegadaY = y - anchoMonarca * (movil.matches ? .31 : .13);
  const curva = `M ${-anchoMonarca} ${y + 52}
    C ${llegadaX * .13} ${y - 110} ${llegadaX * .38} ${y - 76} ${llegadaX * .53} ${y - 28}
    S ${llegadaX * .82} ${y + 24} ${llegadaX} ${llegadaY}`;

  estelaEntrada.setAttribute('viewBox', `0 0 ${marco.width} ${marco.height}`);
  caminoEntrada.setAttribute('d', curva);
  estelaAlOrigen.setAttribute('d', `M ${llegadaX} ${llegadaY} Q ${(llegadaX + x) / 2} ${y - 19} ${x} ${y}`);
  longitudEntrada = caminoEntrada.getTotalLength();
  colocarEntrada();
}

function iniciarEntrada() {
  entradaIniciada = true;
  cancelAnimationFrame(fotograma);
  fotograma = 0;
  monarca.style.visibility = 'hidden';
  if (reducirMovimiento.matches) avanceEntrada = 1;
  dibujarEntrada();
  monarcaEntrada.classList.add('visible');
  if (reducirMovimiento.matches) return;

  const inicio = performance.now();
  function volar(ahora) {
    const tiempo = Math.min(1, (ahora - inicio) / 1600);
    avanceEntrada = 1 - (1 - tiempo) ** 2;
    colocarEntrada();
    fotogramaEntrada = tiempo < 1 ? requestAnimationFrame(volar) : 0;
  }
  fotogramaEntrada = requestAnimationFrame(volar);
}

const observarEntrada = new IntersectionObserver(([entrada]) => {
  if (entrada.intersectionRatio < .2) return;
  observarEntrada.disconnect();
  iniciarEntrada();
}, { threshold: .2 });
observarEntrada.observe(lienzo);
new ResizeObserver(dibujarEntrada).observe(lienzo);
reducirMovimiento.addEventListener('change', () => {
  if (!reducirMovimiento.matches || !fotogramaEntrada) return;
  cancelAnimationFrame(fotogramaEntrada);
  fotogramaEntrada = 0;
  avanceEntrada = 1;
  colocarEntrada();
});
dibujarEntrada();

const interludio = document.querySelector('.interludio');
const estelaInterludio = interludio.querySelector('.estela-interludio');
const caminoInterludio = estelaInterludio.querySelector('path');
const monarcaInterludio = interludio.querySelector('.monarca-interludio');
const letraCruje = interludio.querySelector('.e-cruje');
const baseCruje = interludio.querySelector('.base-cruje');
const migasInterludio = interludio.querySelector('.migas-interludio');
const medidaLetra = document.createElement('canvas').getContext('2d');

let interludioIniciado = false;
let avanceInterludio = 0;
let longitudInterludio = 0;
let fotogramaInterludio = 0;

const chileInterludio = interludio.querySelector('.chile-interludio');
const restosChile = document.createDocumentFragment();
let semillaChile = 31;
function azarChile() {
  semillaChile = (Math.imul(1664525, semillaChile) + 1013904223) >>> 0;
  return semillaChile / 4294967296;
}
for (let n = 0; n < 140; n++) {
  const resto = document.createElement('i');
  const cercania = azarChile() ** 1.65;
  const dispersion = (azarChile() - .5) * (32 + cercania * 52);
  resto.style.left = `${100 - cercania * 16}%`;
  resto.style.top = `${24 + dispersion + cercania * 12}%`;
  resto.style.setProperty('--tamano', `${.10 + azarChile() ** 3 * (1.65 - cercania)}cqw`);
  resto.style.setProperty('--giro', `${azarChile() * 360}deg`);
  resto.style.opacity = String(.25 + azarChile() * .72);
  restosChile.append(resto);
}
chileInterludio.append(restosChile);

function colocarMonarcaInterludio() {
  const distancia = avanceInterludio * longitudInterludio;
  const punto = caminoInterludio.getPointAtLength(distancia);
  const anterior = caminoInterludio.getPointAtLength(Math.max(0, distancia - 5));
  const siguiente = caminoInterludio.getPointAtLength(Math.min(longitudInterludio, distancia + 5));
  const angulo = Math.atan2(siguiente.y - anterior.y, siguiente.x - anterior.x);
  const giro = Math.cos(angulo) * 25 * (1 - avanceInterludio ** 5);
  monarcaInterludio.style.left = `${punto.x}px`;
  monarcaInterludio.style.top = `${punto.y}px`;
  monarcaInterludio.style.setProperty('--giro-monarca', `${giro}deg`);
}

function dibujarInterludio() {
  const marco = interludio.getBoundingClientRect();
  const letra = letraCruje.getBoundingClientRect();
  const estilo = getComputedStyle(letraCruje);
  medidaLetra.font = `${estilo.fontStyle} ${estilo.fontWeight} ${estilo.fontSize} ${estilo.fontFamily}`;
  const ascenso = medidaLetra.measureText('E').actualBoundingBoxAscent;
  const x = letra.left - marco.left + letra.width * .53;
  const y = baseCruje.getBoundingClientRect().top - marco.top - ascenso;
  const ancho = marco.width;
  const curva = movil.matches
    ? `M ${ancho * .77} -8
       C ${ancho * .79} ${y * .23} ${ancho * .98} ${y * .2} ${ancho * .9} ${y * .43}
       S ${Math.min(ancho * .91, x + 93)} ${y * .67} ${x} ${y}`
    : `M ${ancho * .71} -8
       C ${ancho * .717} ${y * .12} ${ancho * .79} ${y * .18} ${ancho * .773} ${y * .37}
       S ${x + ancho * .055} ${y * .53} ${x + ancho * .055} ${y * .74}
       Q ${x + ancho * .05} ${y * .94} ${x} ${y}`;

  estelaInterludio.setAttribute('viewBox', `0 0 ${ancho} ${marco.height}`);
  caminoInterludio.setAttribute('d', curva);
  longitudInterludio = caminoInterludio.getTotalLength();
  migasInterludio.style.left = `${x}px`;
  migasInterludio.style.top = `${y}px`;
  colocarMonarcaInterludio();
}

function iniciarInterludio() {
  if (interludioIniciado) return;
  interludioIniciado = true;
  if (reducirMovimiento.matches) return;

  interludio.classList.add('entrada-interludio');
  monarcaInterludio.classList.add('visible');
  const inicio = performance.now();
  function volar(ahora) {
    const tiempo = Math.min(1, (ahora - inicio) / 2250);
    avanceInterludio = 1 - (1 - tiempo) ** 1.55;
    colocarMonarcaInterludio();
    if (tiempo === 1) {
      fotogramaInterludio = 0;
      interludio.classList.add('contacto');
    } else {
      fotogramaInterludio = requestAnimationFrame(volar);
    }
  }
  fotogramaInterludio = requestAnimationFrame(volar);
}

function posarSinMovimiento() {
  if (!reducirMovimiento.matches) return;
  cancelAnimationFrame(fotogramaInterludio);
  fotogramaInterludio = 0;
  avanceInterludio = 1;
  monarcaInterludio.classList.add('visible');
  colocarMonarcaInterludio();
}

const observarInterludio = new IntersectionObserver(([entrada]) => {
  const enPantalla = entrada.intersectionRatio >= .25;
  monarcaEntrada.classList.toggle('cede-vuelo', enPantalla);
  if (enPantalla) iniciarInterludio();
}, { threshold: .25 });
observarInterludio.observe(interludio);
new ResizeObserver(dibujarInterludio).observe(interludio);
document.fonts.ready.then(dibujarInterludio);
movil.addEventListener('change', dibujarInterludio);
reducirMovimiento.addEventListener('change', posarSinMovimiento);
dibujarInterludio();
posarSinMovimiento();

const anaquelAnual = document.querySelector('.escena-anaquel');
const filaSabores = anaquelAnual.querySelector('.fila-bolsas');
const desplazarSabores = anaquelAnual.querySelector('.desplazamiento-anaquel');
const papelAnual = anaquelAnual.querySelector('.papel-antojo');
const puenteAnual = anaquelAnual.querySelector('.puente-antojo');
const tituloAnual = papelAnual.querySelector('h3');
const lineaAnual = papelAnual.querySelector('.linea-antojo');
const listaAnual = papelAnual.querySelector('.valores-antojo');
const anuncioAnual = papelAnual.querySelector('.solo-lectores');

const saboresAnuales = [
  { id: 'queso', nombre: 'Queso', tinta: '#b34008', cifras: [33, 49.5, 42], exactos: [2025] },
  { id: 'chile', nombre: 'Chile', tinta: '#bb241c', cifras: [30.5, 34.7, 31.9], exactos: [] },
  { id: 'limon', nombre: 'Limón', tinta: '#526a04', cifras: [19.3, 26, 25.2], exactos: [] },
  { id: 'fuego', nombre: 'Flamin’ Hot', tinta: '#29212a', cifras: [6.4, 7.9, 10.6], exactos: [] },
  { id: 'habanero', nombre: 'Habanero', tinta: '#75258f', cifras: [3.3, 3.1, 4], exactos: [] }
];

const formatoMenciones = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
let bolsaActiva = null;
let saborActivo = null;
let aperturaFijada = false;
let cierreAnual = 0;
let fotogramaAnual = 0;

function cifraAnual(valor, aproximado) {
  return `${aproximado ? '≈' : ''}${formatoMenciones.format(valor)} mil`;
}

function colocarPapelAnual() {
  if (!bolsaActiva) return;
  const escena = anaquelAnual.getBoundingClientRect();
  const bolsa = bolsaActiva.getBoundingClientRect();
  const centro = bolsa.left + bolsa.width / 2 - escena.left;
  const ancho = papelAnual.offsetWidth;
  const izquierda = Math.max(10, Math.min(centro - ancho / 2, escena.width - ancho - 10));
  const ancla = Math.max(0, Math.min(100, (centro - izquierda) / ancho * 100));

  papelAnual.style.setProperty('--papel-x', `${izquierda}px`);
  papelAnual.style.setProperty('--boca-papel', `${ancla}%`);
  puenteAnual.style.left = `${Math.max(izquierda, centro - bolsa.width * .47)}px`;
  puenteAnual.style.width = `${Math.min(izquierda + ancho, centro + bolsa.width * .47) - Math.max(izquierda, centro - bolsa.width * .47)}px`;
  puenteAnual.style.bottom = `${escena.bottom - bolsa.top}px`;
  const espacio = Math.max(0, bolsa.top - papelAnual.getBoundingClientRect().bottom);
  if (papelAnual.classList.contains('abierto') && espacio > 0) puenteAnual.style.height = `${espacio + 3}px`;
  const aLaDerecha = izquierda + ancho + 18 > escena.width * .97 - controlSonoro.offsetWidth;
  seccionSonora.classList.toggle('control-encimado', aLaDerecha);
  seccionSonora.style.setProperty('--altura-papel-sonoro', papelAnual.offsetHeight + 'px');
}

function cerrarBolsaAnual() {
  if (reproduccionAnual?.modo === 'sabor') detenerSonidoAnual();
  clearTimeout(cierreAnual);
  cancelAnimationFrame(fotogramaAnual);
  bolsaActiva?.setAttribute('aria-expanded', 'false');
  papelAnual.classList.remove('abierto', 'dibujada');
  papelAnual.inert = true;
  seccionSonora.classList.remove('control-encimado');
  puenteAnual.hidden = true;
  bolsaActiva = null;
  saborActivo = null;
  aperturaFijada = false;
}

function dibujarDatosAnuales(sabor) {
  cancelAnimationFrame(fotogramaAnual);
  papelAnual.classList.remove('dibujada');
  listaAnual.replaceChildren();
  tituloAnual.textContent = `${sabor.nombre}, año con año`;

  papelAnual.style.setProperty('--tinta-antojo', sabor.tinta);
  const minimo = Math.min(...sabor.cifras);
  const maximo = Math.max(...sabor.cifras);
  const amplitud = Math.max(1.5, maximo - minimo);
  const datos = sabor.cifras.map((valor, indice) => {
    const anio = 2024 + indice;
    const aproximado = !sabor.exactos.includes(anio);
    const x = 12 + indice * 38;
    const y = 81 - (valor - minimo) / amplitud * 52;
    const item = document.createElement('li');
    item.style.setProperty('--x', `${x}%`);
    item.style.setProperty('--y', `${y}%`);
    item.innerHTML = '<span class="punto-antojo" aria-hidden="true"></span><b class="cifra-antojo" aria-hidden="true"></b><time></time>';
    item.querySelector('time').textContent = String(anio);
    listaAnual.append(item);
    return { valor, anio, aproximado, x, y, item, cifra: item.querySelector('.cifra-antojo') };
  });
  lineaAnual.setAttribute('d', datos.map(({x,y}, i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' '));
  anuncioAnual.textContent = datos.map(dato => `${dato.anio}, ${cifraAnual(dato.valor, dato.aproximado)}`).join('. ');

  if (reducirMovimiento.matches) {
    papelAnual.classList.add('dibujada');
    for (const dato of datos) {
      dato.item.classList.add('revelado');
      dato.cifra.textContent = cifraAnual(dato.valor, dato.aproximado);
    }
    return;
  }

  const inicio = performance.now();
  function revelar(ahora) {
    const transcurrido = ahora - inicio;
    if (transcurrido >= 580) papelAnual.classList.add('dibujada');
    for (const [indice, dato] of datos.entries()) {
      const tiempo = (transcurrido - 580 - indice * 390) / 280;
      if (tiempo < 0) continue;
      dato.item.classList.add('revelado');
      const progreso = 1 - (1 - Math.min(1, tiempo)) ** 2;
      dato.cifra.textContent = cifraAnual(dato.valor * progreso, dato.aproximado);
    }
    if (transcurrido < 1640) fotogramaAnual = requestAnimationFrame(revelar);
  }
  fotogramaAnual = requestAnimationFrame(revelar);
}

function abrirBolsaAnual(bolsa, sabor, fijar) {
  clearTimeout(cierreAnual);
  if (bolsaActiva === bolsa) {
    aperturaFijada ||= fijar;
    return;
  }
  if (reproduccionAnual?.modo === 'sabor') detenerSonidoAnual();
  bolsaActiva?.setAttribute('aria-expanded', 'false');
  bolsaActiva = bolsa;
  saborActivo = sabor;
  aperturaFijada = fijar;
  bolsa.setAttribute('aria-expanded', 'true');
  papelAnual.inert = false;
  papelAnual.classList.remove('abierto', 'dibujada');
  papelAnual.classList.add('reiniciando');
  colocarPapelAnual();
  void papelAnual.offsetWidth;
  papelAnual.classList.remove('reiniciando');
  papelAnual.classList.add('abierto');
  puenteAnual.hidden = false;
  dibujarDatosAnuales(sabor);
  colocarPapelAnual();
}

function programarCierreAnual() {
  clearTimeout(cierreAnual);
  if (!aperturaFijada && reproduccionAnual?.modo !== 'sabor') cierreAnual = setTimeout(cerrarBolsaAnual, 160);
}

for (const sabor of saboresAnuales) {
  const bolsa = document.createElement('button');
  bolsa.type = 'button';
  bolsa.className = `bolsa-antojo bolsa-${sabor.id}`;
  bolsa.setAttribute('aria-label', sabor.nombre);
  bolsa.setAttribute('aria-controls', 'tendencia-sabor');
  bolsa.setAttribute('aria-expanded', 'false');
  bolsa.style.setProperty('--arte-bolsa', `url("assets/pinceladas.svg#bolsa-${sabor.id}")`);
  bolsa.innerHTML = '<span class="bolsa-cuerpo" aria-hidden="true"></span><span class="bolsa-sello" aria-hidden="true"></span><span class="bolsa-abertura" aria-hidden="true"></span><span class="papas-bolsa" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
  bolsa.addEventListener('pointerenter', evento => {
    if (evento.pointerType === 'mouse' && reproduccionAnual?.modo !== 'sabor') abrirBolsaAnual(bolsa, sabor, false);
  });
  bolsa.addEventListener('pointerleave', evento => {
    if (evento.pointerType === 'mouse' && bolsaActiva === bolsa) programarCierreAnual();
  });
  bolsa.addEventListener('click', evento => {
    if (evento.pointerType === 'mouse' && evento.detail !== 0 && reproduccionAnual?.modo !== 'sabor') return;
    if (bolsaActiva === bolsa && aperturaFijada) cerrarBolsaAnual();
    else abrirBolsaAnual(bolsa, sabor, true);
  });
  filaSabores.append(bolsa);
}

for (const zona of [papelAnual, puenteAnual]) {
  zona.addEventListener('pointerenter', () => clearTimeout(cierreAnual));
  zona.addEventListener('pointerleave', programarCierreAnual);
}
desplazarSabores.addEventListener('scroll', colocarPapelAnual, { passive: true });
new ResizeObserver(colocarPapelAnual).observe(anaquelAnual);
anaquelAnual.addEventListener('keydown', evento => {
  if (evento.key === 'Escape') cerrarBolsaAnual();
});
reducirMovimiento.addEventListener('change', () => {
  if (saborActivo) dibujarDatosAnuales(saborActivo);
});

const seccionSonora = document.querySelector('.antojo-anual');
const botonSaborSonoro = papelAnual.querySelector('.escuchar-sabor');
const botonAnaquelSonoro = seccionSonora.querySelector('.escuchar-anaquel');
const controlSonoro = seccionSonora.querySelector('.control-anaquel');
const anioSonoro = seccionSonora.querySelector('.anio-sonoro');
const vueloSonoro = papelAnual.querySelector('.vuelo-sonoro');
let reproduccionAnual = null;
let contextoInstrumental;
let bancoInstrumental;

const instrumentosAnuales = {
  queso: { nombre: 'Clarinete', notas: ['Si4', 'Si5', 'Si3'], nivel: .44, panorama: -.16, ataque: .07 },
  limon: { nombre: 'Flauta', notas: ['La5', 'La6', 'La4'], nivel: .31, panorama: .40, ataque: .095 },
  chile: { nombre: 'Trompeta con sordina', notas: ['Do5', 'Do6', 'Do4'], nivel: .30, panorama: -.40, ataque: .045 },
  fuego: { nombre: 'Violín', notas: ['Mi5', 'Mi6', 'Mi4'], nivel: .28, panorama: .24, ataque: .105 },
  habanero: { nombre: 'Violonchelo', notas: ['Sol3', 'Sol4', 'Sol2'], nivel: .54, panorama: .02, ataque: .15 }
};

function cargarBancoInstrumental(contexto) {
  bancoInstrumental ??= fetch('assets/instrumentos.json')
    .then(respuesta => {
      if (!respuesta.ok) throw new Error('Banco de instrumentos no disponible');
      return respuesta.json();
    })
    .then(async muestras => Object.fromEntries(await Promise.all(
      Object.entries(muestras).map(async ([sabor, notas]) => [
        sabor,
        await Promise.all(notas.map(nota => contexto.decodeAudioData(Uint8Array.from(atob(nota), letra => letra.charCodeAt(0)).buffer)))
      ])
    )))
    .catch(error => {
      bancoInstrumental = null;
      throw error;
    });
  return bancoInstrumental;
}

function duracionMenciones(valor) {
  return .48 + valor * .025;
}

function prepararPuntosSonoros(sabor) {
  cancelAnimationFrame(fotogramaAnual);
  papelAnual.classList.add('dibujada');
  return Array.from(listaAnual.children, (elemento, indice) => {
    elemento.classList.add('revelado');
    elemento.querySelector('.cifra-antojo').textContent = cifraAnual(sabor.cifras[indice], !sabor.exactos.includes(2024 + indice));
    return {
      elemento,
      x: Number.parseFloat(elemento.style.getPropertyValue('--x')),
      y: Number.parseFloat(elemento.style.getPropertyValue('--y'))
    };
  });
}

function partituraAnual(modo, sabor) {
  if (modo === 'sabor') {
    let inicio = .13;
    return sabor.cifras.map((valor, anio) => {
      const duracion = duracionMenciones(valor);
      const evento = { id: sabor.id, anio, inicio, duracion };
      inicio += duracion + .52;
      return evento;
    });
  }

  const frases = [
    { inicio: 0, entradas: [['queso', .08], ['limon', .91], ['chile', 1.56], ['habanero', 1.94], ['fuego', 2.35]] },
    { inicio: 4.35, entradas: [['queso', .08], ['habanero', .35], ['limon', .68], ['fuego', 1.04], ['chile', 1.44], ['limon', 2.85]] },
    { inicio: 9.15, entradas: [['queso', .08], ['fuego', .52], ['chile', .96], ['limon', 1.32], ['habanero', 2.55]] }
  ];

  return frases.flatMap(({inicio, entradas}, anio) => entradas.map(([id, desfase]) => {
    const saborDelAnaquel = saboresAnuales.find(item => item.id === id);
    const base = duracionMenciones(saborDelAnaquel.cifras[anio]);
    const cierre = id === 'habanero' && anio === 2;
    const sostener = id === 'habanero' ? 1.12 : 0;
    return { id, anio, inicio: inicio + desfase, duracion: cierre ? 2.75 : Math.min(2.7, base * 1.36 + sostener) };
  }));
}

function programarInstrumento(estado, evento, buffer) {
  const contexto = contextoInstrumental;
  const instrumento = instrumentosAnuales[evento.id];
  const fuente = contexto.createBufferSource();
  const volumen = contexto.createGain();
  const salida = contexto.createStereoPanner();
  const comienzo = estado.inicio + evento.inicio;
  const fin = comienzo + evento.duracion;
  const intensidad = instrumento.nivel * (estado.modo === 'anaquel' ? .86 : 1.22);
  fuente.buffer = buffer;
  salida.pan.value = estado.modo === 'anaquel' ? instrumento.panorama : 0;
  volumen.gain.setValueAtTime(.0001, comienzo);
  volumen.gain.exponentialRampToValueAtTime(intensidad, comienzo + instrumento.ataque);
  volumen.gain.exponentialRampToValueAtTime(intensidad * .69, comienzo + evento.duracion * .72);
  volumen.gain.exponentialRampToValueAtTime(.0001, fin + .24);
  fuente.connect(volumen).connect(salida).connect(contexto.destination);

  const osciladores = [fuente];
  let amplitud;
  if (evento.id === 'fuego') {
    const tremolo = contexto.createOscillator();
    amplitud = contexto.createGain();
    tremolo.frequency.value = 7.8;
    amplitud.gain.setValueAtTime(0, comienzo);
    amplitud.gain.linearRampToValueAtTime(intensidad * .16, comienzo + .16);
    amplitud.gain.linearRampToValueAtTime(0, comienzo + Math.min(.74, evento.duracion));
    tremolo.connect(amplitud).connect(volumen.gain);
    tremolo.start(comienzo);
    tremolo.stop(fin + .24);
    osciladores.push(tremolo);
  }

  estado.fuentes.push(...osciladores);
  fuente.onended = () => {
    for (const nodo of osciladores) nodo.disconnect();
    amplitud?.disconnect();
    volumen.disconnect();
    salida.disconnect();
  };
  fuente.start(comienzo);
  fuente.stop(fin + .24);
}

function actualizarControlesSonoros() {
  const estado = reproduccionAnual;
  for (const [modo, boton, inicio] of [
    ['sabor', botonSaborSonoro, '▶ Escuchar este sabor'],
    ['anaquel', botonAnaquelSonoro, '▶ Escuchar todo el anaquel']
  ]) {
    boton.textContent = estado?.modo !== modo ? inicio : estado.cargando ? 'Cargando instrumentos…' : estado.pausada ? '▶ Reanudar' : 'Ⅱ Pausar';
    boton.disabled = estado?.modo === modo && estado.cargando;
  }
  seccionSonora.classList.toggle('suena-anaquel', estado?.modo === 'anaquel');
  papelAnual.classList.toggle('suena-sabor', estado?.modo === 'sabor' && !estado.cargando);
}

function detenerSonidoAnual(completo = false) {
  const estado = reproduccionAnual;
  if (!estado) return;
  cancelAnimationFrame(estado.fotograma);
  if (!completo) {
    for (const fuente of estado.fuentes) fuente.stop();
  }
  reproduccionAnual = null;
  for (const elemento of [...listaAnual.children, ...filaSabores.children]) elemento.classList.remove('sonando');
  anioSonoro.textContent = '';
  actualizarControlesSonoros();
}

function mostrarVueloInstrumental(estado, transcurrido) {
  let indice = 0;
  while (indice < 2 && transcurrido >= estado.eventos[indice + 1].inicio) indice++;
  const actual = estado.eventos[indice];
  const siguiente = estado.eventos[indice + 1];
  const a = estado.puntos[indice];
  const b = estado.puntos[indice + 1] || a;
  const salida = actual.inicio + actual.duracion;
  const avance = siguiente ? Math.max(0, Math.min(1, (transcurrido - salida) / (siguiente.inicio - salida))) : 0;
  vueloSonoro.style.setProperty('--x-sonoro', `${a.x + (b.x - a.x) * avance}%`);
  vueloSonoro.style.setProperty('--y-sonoro', `${a.y + (b.y - a.y) * avance}%`);
  vueloSonoro.style.setProperty('--giro-sonoro', `${Math.sin(avance * Math.PI) * (b.y < a.y ? -15 : 15)}deg`);
  for (const [i, punto] of estado.puntos.entries()) {
    punto.elemento.classList.toggle('sonando', i === indice && transcurrido >= actual.inicio && transcurrido < salida + .18);
  }
  const texto = transcurrido >= actual.inicio ? `${2024 + actual.anio} · ${instrumentosAnuales[actual.id].notas[actual.anio]}` : '';
  if (anioSonoro.textContent !== texto) anioSonoro.textContent = texto;
}

function mostrarAnaquelInstrumental(estado, transcurrido) {
  const ultimo = estado.eventos.findLast(evento => evento.inicio <= transcurrido);
  const anio = ultimo ? `Sonando: ${2024 + ultimo.anio}` : '';
  if (anioSonoro.textContent !== anio) anioSonoro.textContent = anio;
  for (const [i, bolsa] of Array.from(filaSabores.children).entries()) {
    const id = saboresAnuales[i].id;
    bolsa.classList.toggle('sonando', estado.eventos.some(evento => evento.id === id &&
      transcurrido >= evento.inicio && transcurrido < evento.inicio + evento.duracion + .18));
  }
}

function seguirPartitura(estado) {
  if (estado !== reproduccionAnual || estado.pausada) return;
  const transcurrido = contextoInstrumental.currentTime - estado.inicio;
  if (transcurrido >= estado.fin) {
    detenerSonidoAnual(true);
    return;
  }
  if (estado.modo === 'sabor') mostrarVueloInstrumental(estado, transcurrido);
  else mostrarAnaquelInstrumental(estado, transcurrido);
  estado.fotograma = requestAnimationFrame(() => seguirPartitura(estado));
}

async function controlarSonidoAnual(modo) {
  if (modo === 'sabor' && !saborActivo) return;
  const anterior = reproduccionAnual;
  if (anterior?.modo === modo) {
    if (anterior.cargando) return;
    anterior.pausada = !anterior.pausada;
    cancelarOSeguir(anterior);
    return;
  }

  detenerSonidoAnual();
  clearTimeout(cierreAnual);
  const eventos = partituraAnual(modo, saborActivo);
  const estado = {
    modo, eventos, fuentes: [], cargando: true, pausada: false, fotograma: 0,
    puntos: modo === 'sabor' ? prepararPuntosSonoros(saborActivo) : [],
    fin: modo === 'anaquel' ? 15 : eventos.at(-1).inicio + eventos.at(-1).duracion + .26
  };
  reproduccionAnual = estado;
  actualizarControlesSonoros();

  try {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    contextoInstrumental ??= new Contexto();
    const [, muestras] = await Promise.all([contextoInstrumental.resume(), cargarBancoInstrumental(contextoInstrumental)]);
    if (estado !== reproduccionAnual) return;
    estado.inicio = contextoInstrumental.currentTime + .08;
    for (const evento of eventos) programarInstrumento(estado, evento, muestras[evento.id][evento.anio]);
    estado.cargando = false;
    actualizarControlesSonoros();
    seguirPartitura(estado);
  } catch {
    if (estado === reproduccionAnual) {
      detenerSonidoAnual();
      anioSonoro.textContent = 'No se pudo cargar el audio.';
    }
  }
}

function cancelarOSeguir(estado) {
  cancelAnimationFrame(estado.fotograma);
  actualizarControlesSonoros();
  if (estado.pausada) {
    void contextoInstrumental.suspend();
  } else {
    void contextoInstrumental.resume().then(() => seguirPartitura(estado));
  }
}

botonSaborSonoro.addEventListener('click', () => controlarSonidoAnual('sabor'));
botonAnaquelSonoro.addEventListener('click', () => controlarSonidoAnual('anaquel'));

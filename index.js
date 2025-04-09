// --- Funciones de manejo de secciones ---
function mostrarSeccion(id) {
    // Esta función muestra la sección con el ID dado y oculta las demás.
    var secciones = document.getElementsByClassName('seccion');
    for (var i = 0; i < secciones.length; i++) {
        secciones[i].classList.add('oculto'); // Oculta todas las secciones
    }

    document.getElementById(id).classList.remove('oculto'); // Muestra la sección seleccionada
}

// --- Menu Productos ---
// Se obtienen referencias a elementos del DOM para el menú de productos y detalles.
var menuProductos = document.querySelector('.menu-productos');
var opcionesProductos = document.querySelector('.opciones-productos');
var detalleProducto = document.getElementById('detalle-producto');
var carritoLista = document.getElementById('carrito-lista');
var carritoListaModal = document.getElementById('carrito-lista-modal');
var carritoTotal = document.getElementById('carrito-total');
var carritoTotalModal = document.getElementById('carrito-total-modal');

// Event listeners para mostrar/ocultar las opciones del menú al pasar el mouse.
menuProductos.addEventListener('mouseenter', function() {
    opcionesProductos.classList.remove('oculto');
});

menuProductos.addEventListener('mouseleave', function() {
    opcionesProductos.classList.add('oculto');
});

detalleProducto.innerHTML = ''; // Limpia el detalle del producto al inicio

// Inicialización de variables para el carrito, historial y stock de productos.
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let historial = JSON.parse(localStorage.getItem('historial')) || [];
let stockProductos = {};

// Function to handle changes in payment method selection
function handlePaymentMethodChange() {
    // Esta función maneja los cambios en la selección del método de pago.
    const qrBcpInfo = document.getElementById('qr-bcp-info');
    const transferenciaBcpInfo = document.getElementById('transferencia-bcp-info');
    const metodoPagoSeleccionado = document.querySelector('input[name="metodoPago"]:checked');

    qrBcpInfo.classList.add('oculto'); // Oculta la información de QR BCP
    transferenciaBcpInfo.classList.add('oculto'); // Oculta la información de Transferencia BCP

    if (metodoPagoSeleccionado) {
        // Muestra la información del método de pago seleccionado.
        switch (metodoPagoSeleccionado.value) {
            case 'qr-bcp':
                qrBcpInfo.classList.remove('oculto');
                break;
            case 'transferencia-bcp':
                transferenciaBcpInfo.classList.remove('oculto');
                break;
            case 'efectivo':
                // No additional info for efectivo
                break;
        }
    }
}

// Attach event listeners to payment method radio buttons
const paymentMethods = document.querySelectorAll('input[name="metodoPago"]');
paymentMethods.forEach(method => {
    // Agrega un event listener a cada radio button del método de pago.
    method.addEventListener('change', handlePaymentMethodChange);
});

function actualizarContador() {
    // Actualiza el contador del carrito en el header.
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    document.getElementById('contador-carrito').textContent = totalItems;
}

function agregarAlCarrito(id, nombre, precio, imagen) {
    // Agrega un producto al carrito.
    if (stockProductos[id] <= 0) {
        alert('Este producto está agotado.');
        return;
    }

    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        if (productoExistente.cantidad < stockProductos[id]) {
            productoExistente.cantidad++;
        } else {
            alert('No hay más stock disponible de este producto.');
            return;
        }
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1
        });
    }

    stockProductos[id]--; // Decrementa el stock
    guardarEnStorage(); // Guarda los cambios en el localStorage
    actualizarCarrito(); // Actualiza la visualización del carrito
}

function eliminarDelCarrito(id) {
    // Elimina un producto del carrito.
    carrito = carrito.filter(item => item.id !== id);
    guardarEnStorage();
    actualizarCarrito();
}

function ajustarCantidad(id, operacion) {
    // Ajusta la cantidad de un producto en el carrito.
    const producto = carrito.find(item => item.id === id);

    if (producto) {
        if (operacion === '+') {
            producto.cantidad++;
        } else if (operacion === '-' && producto.cantidad > 1) {
            producto.cantidad--;
        }
    }

    guardarEnStorage();
    actualizarCarrito();
}

function guardarEnStorage() {
    // Guarda el carrito y el stock de productos en el localStorage.
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('stockProductos', JSON.stringify(stockProductos));
}

function cargarStockDesdeStorage() {
    // Carga el stock de productos desde el localStorage.
    const stockGuardado = JSON.parse(localStorage.getItem('stockProductos'));
    if (stockGuardado) {
        stockProductos = stockGuardado;
    }
}

cargarStockDesdeStorage(); // Carga el stock al cargar la página

function actualizarCarrito() {
    // Actualiza la visualización del carrito.
    carritoLista.innerHTML = '';
    carritoListaModal.innerHTML = '';
    let total = 0;

    carrito.forEach(item => {
        const itemHTML = `
            <div class="carrito-item">
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="flex-grow-1">
                    <h6>${item.nombre}</h6>
                    <p>Bs. ${item.precio} c/u</p>
                </div>
                <div class="cantidad-control">
                    <button onclick="ajustarCantidad('${item.id}', '-')">-</button>
                    <span class="mx-2">${item.cantidad}</span>
                    <button onclick="ajustarCantidad('${item.id}', '+')">+</button>
                </div>
                <p class="mx-3">Bs. ${item.precio * item.cantidad}</p>
                <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito('${item.id}')">
                    Eliminar
                </button>
            </div>
        `;

        total += item.precio * item.cantidad;
        carritoLista.innerHTML += itemHTML;
        carritoListaModal.innerHTML += itemHTML;
    });

    carritoTotal.textContent = total;
    carritoTotalModal.textContent = total;
    actualizarContador();
}

function finalizarCompra() {
    // Finaliza la compra, guarda el historial y limpia el carrito.
    let metodoPagoSeleccionado = document.querySelector('input[name="metodoPago"]:checked');

    if (!metodoPagoSeleccionado) {
        alert('Por favor, seleccione un método de pago');
        return;
    }

    metodoPagoSeleccionado = metodoPagoSeleccionado.value;

    let numeroWhatsApp = '67655617';

    const totalCompra = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    historial.push({
        fecha: new Date().toLocaleString(),
        items: [...carrito],
        total: totalCompra,
        metodoPago: metodoPagoSeleccionado,
        numeroWhatsApp: numeroWhatsApp
    });

    localStorage.setItem('historial', JSON.stringify(historial));
    carrito = [];
    guardarEnStorage();
    actualizarCarrito();
    mostrarHistorial();

    enviarMensajeWhatsApp(numeroWhatsApp, `¡Gracias por tu compra! Total: Bs. ${totalCompra}`);

    $('#carritoModal').modal('hide'); // Cierra el modal
}

function mostrarHistorial() {
    // Muestra el historial de compras.
    const historialLista = document.getElementById('historial-lista');
    historialLista.innerHTML = '';

    historial.forEach(compra => {
        const compraHTML = `
            <div class="historial-item">
                <small>${compra.fecha}</small>
                <div class="d-flex justify-content-between">
                    <span>${compra.items.length} productos</span>
                    <strong>Bs. ${compra.total}</strong>
                </div>
                <p>Método de pago: ${compra.metodoPago}</p>
            </div>
        `;
        historialLista.innerHTML += compraHTML;
    });
}

function mostrarDetalle(idCategoria) {
    // Muestra los detalles de los productos según la categoría seleccionada.
    detalleProducto.innerHTML = '';
    let productosHTML = '';
    let productos = [];
    if (idCategoria === 'coca') {
        productos = [
            { id: 'coca1', nombre: 'Sabor banana', precio: 10, imagen: 'img/banana.jpg', stock: 35 },
            { id: 'coca2', nombre: 'Sabor sandia', precio: 12, imagen: 'img/chicle.jpg', stock: 33 },
            { id: 'coca3', nombre: 'Sabor Mango', precio: 11, imagen: 'img/mango.jpg', stock: 30 },
            { id: 'coca4', nombre: 'Sabor Maracuya', precio: 13, imagen: 'img/maracuya.jpg', stock: 32 },
            { id: 'coca5', nombre: 'Sabor menta', precio: 12, imagen: 'img/menta.jpg', stock: 34 },
            { id: 'coca6', nombre: 'Sabor Coco', precio: 14, imagen: 'img/coco.jpg', stock: 31 }
        ];
    } else if (idCategoria === 'gaseosas') {
        productos = [
            { id: 'gaseosa1', nombre: 'Coca Cola', precio: 8, imagen: 'img/coca cola.jpg', stock: 50 },
            { id: 'gaseosa2', nombre: 'Pepsi', precio: 7, imagen: 'img/pepsii.jpg', stock: 55 },
            { id: 'gaseosa3', nombre: 'Sprite', precio: 7, imagen: 'img/sprite.jpg', stock: 52 },
            { id: 'gaseosa4', nombre: 'Fanta', precio: 7, imagen: 'img/fanta.jpg', stock: 50 },
            { id: 'gaseosa5', nombre: 'Pura Vida', precio: 7, imagen: 'img/pura vida.jpg', stock: 57 }
        ];
    } else if (idCategoria === 'bebidas') {
        productos = [
            { id: 'bebida1', nombre: 'Vino', precio: 15, imagen: 'img/vino.jpg', stock: 58 },
            { id: 'bebida2', nombre: 'Paseña', precio: 10, imagen: 'img/pasena.jpg', stock: 44 },
            { id: 'bebida3', nombre: 'Corona', precio: 12, imagen: 'img/corona.jpg', stock: 46 },
            { id: 'bebida4', nombre: 'Doble B', precio: 8, imagen: 'img/doble b.jpg', stock: 40 },
            { id: 'bebida5', nombre: 'Fernet', precio: 15, imagen: 'img/fernet.jpg', stock: 40 }
        ];
    } else if (idCategoria === 'cigarrillos') {
        productos = [
            { id: 'cigarro1', nombre: 'LM', precio: 9, imagen: 'img/l&m.jpg', stock: 15 },
            { id: 'cigarro2', nombre: 'Marlboro', precio: 10, imagen: 'img/marlboro.jpg', stock: 48},
            { id: 'cigarro3', nombre: 'Kent', precio: 7, imagen: 'img/kent.jpg', stock: 47},
            { id: 'cigarro4', nombre: 'Lucky Strike', precio: 11, imagen: 'img/lucky.jpg', stock: 45 },
            { id: 'cigarro5', nombre: 'Camel', precio: 12, imagen: 'img/camel.jpg', stock: 47 }
        ];
    }

    productos.forEach(producto => {
        // Itera sobre cada producto para construir el HTML.
        if (stockProductos[producto.id] === undefined) {
            stockProductos[producto.id] = producto.stock;
        }

        const botonAgregar = stockProductos[producto.id] > 0
            ? `<button class="btn btn-primary" onclick="agregarAlCarrito('${producto.id}', '${producto.nombre}', ${producto.precio}, '${producto.imagen}')">
                    Agregar al Carrito
               </button>`
            : '';

        const botonAgotado = stockProductos[producto.id] <= 0
            ? `<button class="btn btn-secondary" disabled>Agotado</button>`
            : '';

        const botonAumentarStock = stockProductos[producto.id] <= 0
            ? `<button class="btn btn-info" onclick="aumentarStock('${producto.id}')">Aumentar Stock</button>`
            : '';

        productosHTML += `
            <div class="producto">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h4>${producto.nombre}</h4>
                <p>Bs. ${producto.precio}</p>
                ${botonAgregar}
                ${botonAgotado}
                ${botonAumentarStock}
            </div>
        `;
    });

    detalleProducto.innerHTML = `<div class="producto-container">${productosHTML}</div>`;
}

// Función para aumentar el stock
function aumentarStock(idProducto) {
    // Permite al administrador aumentar el stock de un producto.
    let cantidad = prompt("Ingrese la cantidad a agregar al stock:");
    if (cantidad !== null && !isNaN(cantidad) && cantidad > 0) {
        if (stockProductos[idProducto] === undefined) {
            stockProductos[idProducto] = parseInt(cantidad);
        } else {
            stockProductos[idProducto] += parseInt(cantidad);
        }
        // Luego de aumentar el stock, refresca la vista para mostrar los cambios
        mostrarDetalle(obtenerCategoriaActual()); // Asegúrate de tener una función obtener cantidad Actual()
    } else {
        alert("Por favor, ingrese una cantidad válida.");
    }
}

// Función para obtener la categoría actual (debes adaptarla según tu implementación)
function obtenerCategoriaActual() {
    // Implementa la lógica para obtener la categoría actual
    // Por ejemplo, si tienes un elemento que muestra la categoría actual
    return document.getElementById('categoriaActual').textContent;
}


function enviarMensajeWhatsApp(numero, mensaje) {
    // Envía un mensaje de WhatsApp usando la API de WhatsApp.
    let url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function validateForm() {
    // Valida el formulario de contacto.
    let emailInput = document.getElementById('emailForm');
    let telefonoInput = document.getElementById('telefonoForm');
    let emailError = document.getElementById('emailForm-error');
    let telefonoError = document.getElementById('telefonoForm-error');
    let isValid = true;

    if (!isValidEmail(emailInput.value)) {
        emailError.textContent = 'pablo@gmail.com';
        isValid = false;
    } else {
        emailError.textContent = '';
    }

    if (!isValidTelefono(telefonoInput.value)) {
        telefonoError.textContent = '67655627';
        isValid = false;
    } else {
        telefonoError.textContent = '';
    }

    return isValid;
}

function isValidEmail(email) {
    // Valida el formato del email.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidTelefono(telefono) {
    // Valida el formato del teléfono.
    const telefonoRegex = /^[0-9]+$/;
    return telefonoRegex.test(telefono);
}

$(document).ready(function() {
    // Configura los enlaces a redes sociales.
    $('#whatsapp-link').attr('href', 'https://wa.me/67655617');
    $('#instagram-link').attr('href', 'https://instagram.com/');
    $('#facebook-link').attr('href', 'https://facebook.com/');
    $('#tiktok-link').attr('href', 'https://tiktok.com/');
});

actualizarContador(); // Actualiza el contador al cargar la página

let usuarioLogueado = null; // Usuario logueado (simulación)

document.getElementById('btn-login').addEventListener('click', function() {
    // Muestra el formulario de login.
    document.getElementById('form-login').style.display = 'block';
    document.getElementById('btn-login').style.display = 'none';
});

document.getElementById('btn-cancel').addEventListener('click', function() {
    // Cancela el formulario de login.
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('btn-login').style.display = 'block';
});

document.getElementById('btn-submit').addEventListener('click', function(event) {
    // Procesa el login del usuario (simulación).
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simulación de credenciales
    if (username === 'admin' && password === 'admin123') {
        usuarioLogueado = 'admin';
        console.log("Iniciando sesión como administrador...");
    } else if (username === 'usuario1' && password === 'usuario123') {
        usuarioLogueado = 'usuario1';
        console.log("Iniciando sesión como usuario...");
    } else {
        alert("Credenciales incorrectas");
        return;
    }

    document.getElementById('form-login').style.display = 'none';
    document.getElementById('btn-login').style.display = 'none';
    document.getElementById('btn-logout').style.display = 'block';
});

document.getElementById('btn-logout').addEventListener('click', function() {
    // Cierra la sesión del usuario (simulación).
    usuarioLogueado = null;
    document.getElementById('btn-logout').style.display = 'none';
    document.getElementById('btn-login').style.display = 'block';
});


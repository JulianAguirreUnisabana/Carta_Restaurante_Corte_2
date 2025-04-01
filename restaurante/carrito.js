document.addEventListener("DOMContentLoaded", function () {
    cargarCarrito();
});

function agregarAlCarrito(nombre, precio) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let productoIndex = carrito.findIndex(item => item.nombre === nombre);

    if (productoIndex !== -1) {
        carrito[productoIndex].cantidad += 1;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarBotonCarrito();
}

function cargarCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let tablaBody = document.getElementById("carrito-body");
    let totalCarrito = 0;
    tablaBody.innerHTML = "";

    carrito.forEach((producto, index) => {
        let totalProducto = producto.precio * producto.cantidad;
        totalCarrito += totalProducto;

        let fila = `<tr>
            <td>${producto.nombre}</td>
            <td>${producto.cantidad}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>$${totalProducto.toFixed(2)}</td>
            <td><button onclick="eliminarProducto(${index})">Eliminar</button></td>
        </tr>`;
        tablaBody.innerHTML += fila;
    });

    document.getElementById("total-carrito").innerText = totalCarrito.toFixed(2);
}

function eliminarProducto(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    cargarCarrito();
    actualizarBotonCarrito();
}

function actualizarBotonCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    let botonCarrito = document.getElementById("contador-carrito");
    if (botonCarrito) {
        botonCarrito.innerText = totalItems;
    }
}

function procederAlPago() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let params = new URLSearchParams();
    carrito.forEach(producto => {
        params.append("producto", producto.nombre);
        params.append("cantidad", producto.cantidad);
        params.append("precio", producto.precio);
    });

    window.location.href = "pago.html?" + params.toString();
    localStorage.removeItem("carrito");
}
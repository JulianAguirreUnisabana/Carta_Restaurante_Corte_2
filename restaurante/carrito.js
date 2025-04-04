document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = "https://script.google.com/macros/s/AKfycby2w3A_fwyhb2hbwLaMoUFw5PNLnHy_8uQgvv8gBT9pJCerp-3VaLDLVu9lV8A_24Vj/exec";
    const cartItemsContainer = document.querySelector(".cart-items");
    let carrito = {};

    // Cargar productos desde la API (GET)
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            data.data.forEach(item => {
                // Solo mostrarlos en consola o usarlos si los necesitas para una tienda de categorías
                console.log(`${item.Nombre} - Stock: ${item.Stock}`);
            });
        })
        .catch(error => console.error("Error al cargar productos:", error));

    // Función para actualizar el carrito
    function actualizarCarrito() {
        cartItemsContainer.innerHTML = "";
        let subtotal = 0;

        Object.values(carrito).forEach(producto => {
            const totalProducto = producto.cantidad * producto.precio;
            subtotal += totalProducto;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>$${totalProducto.toFixed(2)}</td>
                <td><button class="quitar-item" data-nombre="${producto.nombre}">Eliminar</button></td>
            `;
            cartItemsContainer.appendChild(row);
        });

        const tax = subtotal * 0.10;
        const total = subtotal + tax;

        document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
        document.getElementById("total").textContent = `$${total.toFixed(2)}`;

        // Listeners para eliminar productos
        document.querySelectorAll(".quitar-item").forEach(button => {
            button.addEventListener("click", function () {
                const nombre = this.dataset.nombre;
                if (carrito[nombre].cantidad > 1) {
                    carrito[nombre].cantidad--;
                } else {
                    delete carrito[nombre];
                }
                actualizarCarrito();
            });
        });
    }

    // Simular agregar productos manualmente (puedes quitar esto si lo haces desde otro archivo)
    carrito = {
        "Pizza Americana Favorita": { id: "1", nombre: "Pizza Americana Favorita", precio: 4.87, cantidad: 2 },
        "Jugo de Naranja": { id: "2", nombre: "Jugo de Naranja", precio: 2.00, cantidad: 1 },
        "Papas Fritas": { id: "3", nombre: "Papas Fritas", precio: 2.50, cantidad: 3 }
    };
    actualizarCarrito();

    //  Enviar pedido al servidor (POST)
    document.querySelector(".print-bill").addEventListener("click", () => {
        const nombre = document.getElementById("nombreCliente").value.trim();
        const telefono = document.getElementById("telefonoCliente").value.trim();
        const direccion = document.getElementById("direccionCliente").value.trim();

        if (!nombre || !telefono || !direccion) {
            alert("Por favor completa todos los datos del cliente.");
            return;
        }

        const items = Object.values(carrito).map(p => ({
            id: p.id || p.nombre, // Usa el ID real si lo tienes
            precio: p.precio,
            cantidad: p.cantidad
        }));

        if (items.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        const totalTexto = document.getElementById("total").textContent.replace("$", "");
        const total = parseFloat(totalTexto);

        const data = {
            cliente: {
                nombre,
                telefono,
                direccion
            },
            pedido: items,
            total
        };

        fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.text())
            .then(() => {
                alert("¡Pedido enviado exitosamente!");
                carrito = {};
                actualizarCarrito();
                document.getElementById("nombreCliente").value = "";
                document.getElementById("telefonoCliente").value = "";
                document.getElementById("direccionCliente").value = "";
            })
            .catch(err => {
                console.error("Error al enviar pedido:", err);
                alert("Hubo un problema al enviar el pedido.");
            });
    });
});

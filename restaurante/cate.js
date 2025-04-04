document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = "https://script.google.com/macros/s/AKfycby2w3A_fwyhb2hbwLaMoUFw5PNLnHy_8uQgvv8gBT9pJCerp-3VaLDLVu9lV8A_24Vj/exec"; // <-- Reemplaza con tu URL real
    const listaComida = document.querySelector(".listaComida");
    const cartItemsContainer = document.querySelector(".cart-items");
    let carrito = {};

    //  1. Cargar productos desde la API
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            data.data.forEach(item => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <div class="menu-item" data-nombre="${item.Nombre}" data-precio="${item.Precio}">
                        <img src="imagenes/${item.Nombre}.jpg" alt="${item.Nombre}" />
                        <h3>${item.Nombre}</h3>
                        <p>Precio: $${item.Precio}</p>
                        <p>${item.Descripcion}</p> <!-- Cambiado a mostrar la descripción -->
                        <button class="agregar-carrito">Agregar al carrito</button>
                    </div>
                `;
                listaComida.appendChild(li);
            });

            //  Agregar eventos después de crear los botones
            document.querySelectorAll(".agregar-carrito").forEach(button => {
                button.addEventListener("click", function () {
                    const item = this.closest(".menu-item");
                    const nombre = item.dataset.nombre;
                    const precio = parseFloat(item.dataset.precio);

                    if (carrito[nombre]) {
                        carrito[nombre].cantidad++;
                    } else {
                        carrito[nombre] = { nombre, precio, cantidad: 1 };
                    }

                    actualizarCarrito();
                });
            });
        })
        .catch(error => console.error("Error al cargar productos:", error));

    //  Función para actualizar el carrito
    function actualizarCarrito() {
        cartItemsContainer.innerHTML = "";
        let subtotal = 0;

        Object.values(carrito).forEach(producto => {
            const totalProducto = producto.cantidad * producto.precio;
            subtotal += totalProducto;

            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item", "item");
            cartItem.dataset.nombre = producto.nombre;
            cartItem.dataset.precio = producto.precio;
            cartItem.dataset.cantidad = producto.cantidad;

            cartItem.innerHTML = `
                <p>${producto.nombre} (${producto.cantidad}) - $${producto.precio.toFixed(2)} c/u</p>
                <p>Total: $${totalProducto.toFixed(2)}</p>
                <button class="quitar-item" data-nombre="${producto.nombre}">Quitar</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        const tax = subtotal * 0.10;
        const total = subtotal + tax;

        document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
        document.getElementById("total").textContent = `$${total.toFixed(2)}`;

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

    //  3. Enviar pedido a la API (POST)
    document.querySelector(".print-bill").addEventListener("click", () => {
        const items = Object.values(carrito).map(p => ({
            nombre: p.nombre,
            precio: p.precio,
            cantidad: p.cantidad,
        }));

        if (items.length === 0) {
            alert("Tu carrito está vacío");
            return;
        }

        const data = {
            pedido: items,
            subtotal: document.getElementById("subtotal").textContent,
            tax: document.getElementById("tax").textContent,
            total: document.getElementById("total").textContent,
        };

        fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(res => res.text())
            .then(() => {
                alert("¡Pedido enviado exitosamente!");
                carrito = {};
                actualizarCarrito();
            })
            .catch(err => {
                console.error("Error al enviar pedido:", err);
                alert("Hubo un problema al enviar el pedido");
            });
    });
});

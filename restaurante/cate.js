document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.querySelector(".cart-items");
    let carrito = {}; // Objeto para almacenar los productos agregados

    // Evento para agregar productos al carrito
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

    function actualizarCarrito() {
        cartItemsContainer.innerHTML = ""; // Limpiar el carrito antes de actualizarlo
        let subtotal = 0;

        Object.values(carrito).forEach(producto => {
            const totalProducto = producto.cantidad * producto.precio;
            subtotal += totalProducto;

            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <p>${producto.nombre} (${producto.cantidad}) - $${producto.precio.toFixed(2)} c/u</p>
                <p>Total: $${totalProducto.toFixed(2)}</p>
                <button class="quitar-item" data-nombre="${producto.nombre}">Quitar</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        // Calcular impuestos y total
        const tax = subtotal * 0.10;
        const total = subtotal + tax;

        document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
        document.getElementById("total").textContent = `$${total.toFixed(2)}`;

        // Evento para quitar productos del carrito
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
});

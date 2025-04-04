document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycby2w3A_fwyhb2hbwLaMoUFw5PNLnHy_8uQgvv8gBT9pJCerp-3VaLDLVu9lV8A_24Vj/exec";
  const listaComida = document.querySelector(".listaComida");
  const cartItemsContainer = document.querySelector(".cart-items");
  const loadingElement = document.getElementById("loading");
  let carrito = {};
  let productos = []; // Almacena todos los productos para filtrar

  // 1. Cargar productos desde la API
  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      productos = data.data; // Guardar todos los productos
      // Mostrar por defecto la categoría "Pizza"
      const productosPizza = productos.filter(
        (item) => item.Categoria === "Pizza"
      );
      mostrarProductos(productosPizza);
    })
    .catch((error) => console.error("Error al cargar productos:", error))
    .finally(() => {
      // Ocultar la animación de carga
      loadingElement.classList.add("hidden");
    });

  // Función para mostrar productos en la lista
  function mostrarProductos(productosFiltrados) {
    listaComida.innerHTML = ""; // Limpiar la lista
    productosFiltrados.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <div class="menu-item" data-nombre="${item.Nombre}" data-precio="${item.Precio}" data-categoria="${item.Categoria}">
                    <img src="imagenes/${item.Nombre}.jpg" alt="${item.Nombre}" onerror="this.src='imagenes/default.jpg'" />
                    <h3>${item.Nombre}</h3>
                    <p>Precio: $${item.Precio}</p>
                    <p>${item.Descripcion}</p>
                    <button class="agregar-carrito">Agregar al carrito</button>
                </div>
            `;
      listaComida.appendChild(li);
    });

    // Agregar eventos después de crear los botones
    document.querySelectorAll(".agregar-carrito").forEach((button) => {
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
  }

  // Función para actualizar el carrito
  function actualizarCarrito() {
    cartItemsContainer.innerHTML = "";
    let subtotal = 0;

    Object.values(carrito).forEach((producto) => {
      const totalProducto = producto.cantidad * producto.precio;
      subtotal += totalProducto;

      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item", "item");
      cartItem.dataset.nombre = producto.nombre;
      cartItem.dataset.precio = producto.precio;
      cartItem.dataset.cantidad = producto.cantidad;

      cartItem.innerHTML = `
                <p>${producto.nombre} (${
        producto.cantidad
      }) - $${producto.precio.toFixed(2)} c/u</p>
                <p>Total: $${totalProducto.toFixed(2)}</p>
                <button class="quitar-item" data-nombre="${
                  producto.nombre
                }">Quitar</button>
            `;
      cartItemsContainer.appendChild(cartItem);
    });

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;

    document.querySelectorAll(".quitar-item").forEach((button) => {
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

  // Evento para filtrar productos por categoría
  document.querySelectorAll(".filter-category").forEach((button) => {
    button.addEventListener("click", function () {
      const categoria = this.dataset.category;
      const productosFiltrados = productos.filter(
        (item) => item.Categoria === categoria
      );
      mostrarProductos(productosFiltrados);
    });
  });

  // 3. Enviar pedido a la API (POST)
  document.querySelector(".print-bill").addEventListener("click", () => {
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const direccion = document.getElementById("direccion").value.trim();

    if (!nombre || !telefono || !direccion) {
      alert("Por favor, completa toda la información del cliente.");
      return;
    }

    const items = Object.values(carrito).map((p) => ({
      id: p.nombre, // Cambiar "nombre" por "id" si tienes un identificador único
      precio: p.precio,
      cantidad: p.cantidad,
    }));

    if (items.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    const data = {
      cliente: {
        nombre,
        telefono,
        direccion,
      },
      pedido: items,
      total: parseFloat(
        document.getElementById("total").textContent.replace("$", "")
      ),
    };

    fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Cambia a "cors" si tu API lo permite
    })
      .then((res) => res.text())
      .then(() => {
        alert("¡Pedido enviado exitosamente!");
        carrito = {};
        actualizarCarrito();
        document.getElementById("customer-info").reset(); // Limpiar formulario
      })
      .catch((error) => {
        console.error("Error al enviar pedido:", error);
        alert("Hubo un problema al enviar el pedido");
      });
  });

  document.getElementById("telefono").addEventListener("input", function (e) {
    this.value = this.value.replace(/[^0-9]/g, ""); // Elimina cualquier carácter que no sea un número
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbwRjYeUQnXxdP54U_8ouP2ySlgzGb0GvjA4TWbEZ-BKO4yFEGi4hLgY26gz7Mh8crRR/exec";
  const listaComida = document.querySelector(".listaComida");
  const cartItemsContainer = document.querySelector(".cart-items");
  const loadingElement = document.getElementById("loading");
  const form = document.getElementById("customer-info");
  const printBillBtn = document.querySelector(".print-bill");
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
  printBillBtn.addEventListener("click", function () {
    const payload = {
      cliente: form.nombre.value,
      telefono: form.telefono.value,
      direccion: form.direccion.value,
      descripcion, // tu lógica para concatenar ítems
      total: parseFloat(
        document.getElementById("total").textContent.replace("$", "")
      ),
    };

    fetch("https://render-x8ls.onrender.com/api/pedidos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt_access"),
      },
      body: JSON.stringify(payload),
    });
  });

  document.getElementById("telefono").addEventListener("input", function (e) {
    this.value = this.value.replace(/[^0-9]/g, ""); // Elimina cualquier carácter que no sea un número
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const loading = document.getElementById("loading");
  const container = document.querySelector(".contenedorComida .listaComida");

  fetch("https://render-x8ls.onrender.com/api/platos/")
    .then((response) => response.json())
    .then((data) => {
      loading.style.display = "none"; // Oculta el indicador de carga

      data.forEach((plato) => {
        const card = document.createElement("li");
        card.className = "card";
        card.innerHTML = `
          <img src="${plato.imagen}" alt="${plato.nombre}" />
          <h3>${plato.nombre}</h3>
          <p><strong>Categoría:</strong> ${plato.categoria}</p>
          <p>${plato.descripcion}</p>
          <p><strong>Precio:</strong> $${plato.precio}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch((error) => {
      loading.innerHTML = "<p>Error al cargar los platos.</p>";
      console.error("Error:", error);
    });
});

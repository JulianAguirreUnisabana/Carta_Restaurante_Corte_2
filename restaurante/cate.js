document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://render-x8ls.onrender.com/api/platos/";
  const listaComida = document.querySelector(".listaComida");
  const cartItemsContainer = document.querySelector(".cart-items");
  const loadingElement = document.getElementById("loading");
  const form = document.getElementById("customer-info");
  const printBillBtn = document.querySelector(".print-bill");
  let carrito = {};
  let productos = [];

  // Cargar productos desde la API de Render
  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      productos = data;
      renderProductos(productos);
    })
    .catch((error) => console.error("Error al cargar productos:", error))
    .finally(() => {
      loadingElement.classList.add("hidden");
    });

  function renderProductos(productosFiltrados) {
    listaComida.innerHTML = "";
    productosFiltrados.forEach((item) => {
      const li = document.createElement("li");
      li.classList.add("menu-item"); // para estilos
      li.innerHTML = `
        <div data-nombre="${item.nombre}" data-precio="${
        item.precio
      }" data-categoria="${item.categoria}">
          <img src="imagenes/${item.imagen || "default.jpg"}" alt="${
        item.nombre
      }" onerror="this.src='imagenes/default.jpg'" />
          <h3>${item.nombre}</h3>
          <p>Precio: $${item.precio}</p>
          <p>${item.descripcion}</p>
          <button class="agregar-carrito">Agregar al carrito</button>
        </div>
      `;
      listaComida.appendChild(li);
    });

    document.querySelectorAll(".agregar-carrito").forEach((button) => {
      button.addEventListener("click", function () {
        const item = this.closest("[data-nombre]");
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

  function actualizarCarrito() {
    cartItemsContainer.innerHTML = "";
    let subtotal = 0;

    Object.values(carrito).forEach((producto) => {
      const totalProducto = producto.cantidad * producto.precio;
      subtotal += totalProducto;

      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item", "item");
      cartItem.innerHTML = `
        <p>${producto.nombre} - $${producto.precio.toFixed(2)} c/u</p>
        <div>
          <button class="menos" data-nombre="${producto.nombre}">-</button>
          <span>${producto.cantidad}</span>
          <button class="mas" data-nombre="${producto.nombre}">+</button>
        </div>
        <p>Total: $${totalProducto.toFixed(2)}</p>
      `;
      cartItemsContainer.appendChild(cartItem);
    });

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;

    // Eventos para botones + y -
    document.querySelectorAll(".mas").forEach((btn) => {
      btn.addEventListener("click", function () {
        const nombre = this.dataset.nombre;
        carrito[nombre].cantidad++;
        actualizarCarrito();
      });
    });

    document.querySelectorAll(".menos").forEach((btn) => {
      btn.addEventListener("click", function () {
        const nombre = this.dataset.nombre;
        carrito[nombre].cantidad--;
        if (carrito[nombre].cantidad <= 0) {
          delete carrito[nombre];
        }
        actualizarCarrito();
      });
    });
  }

  document.querySelectorAll(".filter-category").forEach((button) => {
    button.addEventListener("click", function () {
      const categoria = this.dataset.category;
      const productosFiltrados =
        categoria === "Todos"
          ? productos
          : productos.filter((item) => item.categoria === categoria);
      renderProductos(productosFiltrados);
    });
  });

  printBillBtn.addEventListener("click", function () {
    const descripcion = Object.values(carrito)
      .map((p) => `${p.nombre} x${p.cantidad}`)
      .join(", ");

    const total = parseFloat(
      document.getElementById("total").textContent.replace("$", "")
    );

    const payload = {
      cliente: form.nombre.value.trim(),
      telefono: form.telefono.value.trim(),
      direccion: form.direccion.value.trim(),
      descripcion: descripcion,
      total: total,
    };

    if (
      !payload.cliente ||
      !payload.direccion ||
      total <= 0 ||
      descripcion.length === 0
    ) {
      alert(
        "Por favor completa todos los campos requeridos y agrega productos al carrito."
      );
      return;
    }

    fetch("https://render-x8ls.onrender.com/api/pedidos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Aquí no enviamos token porque no quieres usarlo
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `No se pudo enviar el pedido. Servidor respondió: ${errorText}`
          );
        }
        return response.json();
      })
      .then(() => {
        alert("Pedido enviado con éxito.");
        carrito = {};
        actualizarCarrito();
        form.reset();
      })
      .catch((error) => {
        alert("Error al enviar el pedido: " + error.message);
        console.error("Error detallado:", error);
      });
  });

  document.getElementById("telefono").addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
  });
});

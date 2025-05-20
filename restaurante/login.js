const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = loginForm.username.value;
  const password = loginForm.password.value;

  try {
    const response = await fetch("http://localhost:8000/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("jwt_access", data.access);
      localStorage.setItem("jwt_refresh", data.refresh);

      loginMessage.textContent = "¡Inicio de sesión exitoso!";
      loginMessage.style.color = "green";

      // Aquí puedes redirigir o cargar pedidos protegidos
      // window.location.href = 'dashboard.html';
      // cargarPedidos();
    } else {
      loginMessage.textContent = "Usuario o contraseña incorrectos.";
      loginMessage.style.color = "red";
    }
  } catch (error) {
    console.error("Error:", error);
    loginMessage.textContent = "Error al iniciar sesión.";
    loginMessage.style.color = "red";
  }
});

// pedidos.js
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt_access");
  const listaPedidos = document.getElementById("listaPedidos");
  const errorMsg = document.getElementById("errorMsg");

  if (!token) {
    errorMsg.textContent = "Debe iniciar sesión para ver los pedidos.";
    errorMsg.style.color = "red";
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/api/pedidos/", {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const pedidos = await response.json();
      if (pedidos.length === 0) {
        listaPedidos.innerHTML = "<li>No hay pedidos registrados.</li>";
      } else {
        pedidos.forEach((pedido) => {
          const item = document.createElement("li");
          item.textContent = `Pedido #${pedido.id} - Cliente: ${pedido.cliente} - Total: $${pedido.total}`;
          listaPedidos.appendChild(item);
        });
      }
    } else if (response.status === 401) {
      errorMsg.textContent =
        "Token inválido o expirado. Inicie sesión nuevamente.";
      errorMsg.style.color = "red";
    } else {
      errorMsg.textContent = "Error al cargar los pedidos.";
    }
  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Error de conexión con el servidor.";
  }
});

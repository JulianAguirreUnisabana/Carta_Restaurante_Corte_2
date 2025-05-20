const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = loginForm.username.value;
  const password = loginForm.password.value;

  try {
    const response = await fetch(
      "https://render-x8ls.onrender.com/api/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("jwt_access", data.access);
      localStorage.setItem("jwt_refresh", data.refresh);

      loginMessage.textContent = "¡Inicio de sesión exitoso!";
      loginMessage.style.color = "green";

      // Redirige a tu página de pedidos protegida
      window.location.href = "pedidos.html";
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
document.addEventListener("DOMContentLoaded", cargarPedidos);

function logout() {
  localStorage.removeItem("jwt_access");
  window.location.href = "ingresar.html"; // ajusta si tu login se llama distinto
}

async function cargarPedidos() {
  const token = localStorage.getItem("jwt_access");
  const listaPedidos = document.getElementById("listaPedidos");
  const errorMsg = document.getElementById("errorMsg");
  const estado = document.getElementById("estado").value;
  const cliente = document.getElementById("cliente").value;

  if (!token) {
    errorMsg.textContent = "Debe iniciar sesión.";
    return;
  }

  let url = "https://render-x8ls.onrender.com/api/pedidos/";
  const params = [];
  if (estado) params.push(`estado=${estado}`);
  if (cliente) params.push(`cliente=${cliente}`);
  if (params.length) url += "?" + params.join("&");

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (response.ok) {
      const pedidos = await response.json();
      listaPedidos.innerHTML = "";

      if (pedidos.length === 0) {
        listaPedidos.innerHTML = "<p>No hay pedidos.</p>";
        return;
      }

      pedidos.forEach((pedido) => {
        const div = document.createElement("div");
        div.className = "pedido";
        div.innerHTML = `
          <strong>Pedido #${pedido.id}</strong><br>
          Cliente: ${pedido.cliente}<br>
          Descripción: ${pedido.descripcion}<br>
          Total: $${pedido.total}<br>
          Estado: ${pedido.estado}<br>
          <button class="btn" onclick="cambiarEstado(${pedido.id}, '${
          pedido.estado
        }')">
            ${
              pedido.estado === "pendiente"
                ? "Marcar como atendido"
                : "✔ Atendido"
            }
          </button>
        `;
        listaPedidos.appendChild(div);
      });
    } else if (response.status === 401) {
      errorMsg.textContent = "Token inválido o expirado.";
    } else {
      errorMsg.textContent = "Error al cargar pedidos.";
    }
  } catch (err) {
    errorMsg.textContent = "Error de conexión.";
    console.error(err);
  }
}

async function cambiarEstado(id, estadoActual) {
  if (estadoActual === "atendido") {
    return alert("Ya está atendido.");
  }

  const token = localStorage.getItem("jwt_access");
  if (!token) {
    return alert("No autenticado.");
  }

  const response = await fetch(
    `https://render-x8ls.onrender.com/api/pedidos/${id}/`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado: "atendido" }),
    }
  );

  if (response.ok) {
    alert("Estado actualizado.");
    cargarPedidos();
  } else {
    alert("Error al actualizar.");
  }
}

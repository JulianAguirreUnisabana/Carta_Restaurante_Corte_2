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

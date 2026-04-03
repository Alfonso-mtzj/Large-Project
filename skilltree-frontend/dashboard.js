// Check if token exists
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// Get stored user info
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
  document.getElementById("userName").textContent =
    user.firstName + " " + user.lastName;
  document.getElementById("userEmail").textContent =
    user.email;
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

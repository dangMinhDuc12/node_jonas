const logOutBtn = document.querySelector(".nav__el--logout");
function hideAlert() {
  const el = document.querySelector(".alert");
  if (el) el.remove();
}

function showAlert(type, msg) {
  hideAlert();
  const alertElm = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", alertElm);
  setTimeout(hideAlert, 5000);
}

async function handleLogout() {
  try {
    const res = await axios({
      method: "GET",
      url: "http://localhost:3000/api/v1/users/logout",
    });
    if (res.data.status === "success") {
      showAlert("success", "Log out successful");
      setTimeout(() => {
        window.location.assign("/");
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
}
if (logOutBtn) {
  logOutBtn.addEventListener("click", handleLogout);
}

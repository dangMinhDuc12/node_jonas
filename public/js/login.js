const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Log in successful");
      setTimeout(() => {
        window.location.assign("/"); //Navigation to url in param
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

const form = document.querySelector(".form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  login(email, password);
});

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

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

async function updateSettings(type, data) {
  const url =
    type === "password"
      ? "/api/v1/users/updatePassword"
      : "/api/v1/users/updateMe";
  try {
    const updatedUser = await axios({
      method: "PATCH",
      url,
      data,
    });
    showAlert("success", `${type.toUpperCase()} update successfully`);
    if (type === "data" && data.get("photo") !== "undefined") {
      window.location.reload();
    }
  } catch (err) {
    console.log(err.response);
    showAlert("error", err.response.data.message);
  }
}

const formUpdateUser = document.querySelector(".form-user-data");
const formUpdatePw = document.querySelector(".form-user-settings");

formUpdateUser.addEventListener("submit", async (e) => {
  e.preventDefault();
  document.querySelector(".btn-save-settings").textContent = "Updating...";

  //Định dạng giống form data có thể up ảnh
  const form = new FormData();
  form.append("name", document.querySelector("#name").value);
  form.append("email", document.querySelector("#email").value);
  form.append("photo", document.querySelector("#photo").files[0]);

  await updateSettings("data", form);
  document.querySelector(".btn-save-settings").textContent = "Save settings";
});

formUpdatePw.addEventListener("submit", async (e) => {
  e.preventDefault();
  document.querySelector(".btn-save-password").textContent = "Updating...";
  const passwordCurrent = document.querySelector("#password-current").value;
  const password = document.querySelector("#password").value;
  const passwordConfirm = document.querySelector("#password-confirm").value;
  await updateSettings("password", {
    passwordCurrent,
    password,
    passwordConfirm,
  });
  document.querySelector("#password-current").value = "";
  document.querySelector("#password").value = "";
  document.querySelector("#password-confirm").value = "";
  document.querySelector(".btn-save-password").textContent = "Save password";
});

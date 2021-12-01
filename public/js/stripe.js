// DOC: https://stripe.com/docs/js/checkout/redirect_to_checkout

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

//use publish key
const stripe = Stripe(
  "pk_test_51JZxAbJzdm9oGD68h3h09DnxPKFNNxzrGRqgikMNGspY0rnyThFWGeVPVpOLsxjo9fBLrRK2haz6gzm7LcyNwitz00edMv3EB7"
);

const bookingBtn = document.querySelector("#book-tour");

const bookTour = async (tourId) => {
  //get session stripe from server
  try {
    const session = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    //create form to charge
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};

bookingBtn.addEventListener("click", async (e) => {
  const tourId = e.target.dataset.tourId;
  e.target.textContent = "Processing ...";
  await bookTour(tourId);
  e.target.textContent = "Book tour now!";
});

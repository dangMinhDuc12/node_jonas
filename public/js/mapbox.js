//DOC: https://docs.mapbox.com/mapbox-gl-js/guides/

const locations = JSON.parse(document.querySelector("#map").dataset.locations);

mapboxgl.accessToken =
  "pk.eyJ1IjoiZHVjZGFuZyIsImEiOiJja3c4dTI0emowaHkyMm5zM2pqYTZvbHkyIn0.95tPUmBH2vhxHoFvxge1sg";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  // center: [-118.113491, 34.111745],
  // zoom: 10,
  // interactive: false,
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  const el = document.createElement("div");
  el.className = "marker";

  new mapboxgl.Marker({
    element: el,
    anchor: "bottom",
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: { top: 200, bottom: 150, left: 100, right: 100 },
});

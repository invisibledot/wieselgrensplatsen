// ---------- MAP SETUP ----------
const map = L.map("map").setView([57.7204, 11.9442], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// ---------- PIN STATE ----------
let marker = null;
let selectedLat = null;
let selectedLng = null;

// ---------- MAP CLICK ----------
map.on("click", e => {
  selectedLat = e.latlng.lat;
  selectedLng = e.latlng.lng;
})

if (marker) {
  marker.setLatLng(e.latlng);
} else {
  marker = L.marker(e.latlng, { draggable: true }).addTo(map);

  marker.on("dragend", e => {
    const pos = e.target.getLatLng();
    selectedLat = pos.lat;
    selectedLng = pos.lng;
  });
}

// ---------- FORM SUBMISSION ----------
document
  .getElementById("mapForm")
  .addEventListener("submit", async e => {
    e.preventDefault();

  if (selectedLat === null || selectedLng === null) {
      alert("Please place a pin on the map first.");
      return;
    }

    const payload = {
      text: document.getElementById("text").value,
      layer: document.getElementById("layer").value,
      approximate: document.getElementById("approximate").checked,
      lat: selectedLat,
      lng: selectedLng
    };

    try {
      const response = await fetch("/.netlify/functions/submitEntry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Submission failed");

      alert("Thank you — your entry will appear after review.");

      e.target.reset();
      if (marker) map.removeLayer(marker);
      marker = null;
      selectedLat = null;
      selectedLng = null;

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  });
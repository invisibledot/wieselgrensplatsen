document.addEventListener("DOMContentLoaded", () => {
  // ---------- MAP SETUP ----------
  const map = L.map("map").setView([57.7204, 11.9442], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  let marker = null;
  let selectedLat = null;
  let selectedLng = null;

  // Layer colors for markers
  const layerColors = {
    memories: "red",
    everyday: "blue",
    social: "green"
  };

  // ---------- MAP CLICK ----------
  map.on("click", e => {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;

    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng, { draggable: true }).addTo(map);
      marker.on("dragend", ev => {
        const pos = ev.target.getLatLng();
        selectedLat = pos.lat;
        selectedLng = pos.lng;
      });
    }
  });

  // ---------- FORM SUBMISSION ----------
  document.getElementById("mapForm").addEventListener("submit", async e => {
    e.preventDefault();

    const textValue = document.getElementById("text").value.trim();
    const layerValue = document.getElementById("layer").value;
    const approximate = document.getElementById("approximate").checked;

    if (!textValue) return alert("Please enter a note.");
    if (!layerValue) return alert("Please select a layer.");
    if (!selectedLat || !selectedLng) return alert("Place a pin first.");

    const photoInput = document.getElementById("photos");
    const uploadedPhotos = [];

    // ---------- CLOUDINARY UPLOAD ----------
    const cloudName = "dwhz1sbzs";
    const uploadPreset = "unsigned_upload”;

    try {
      for (const file of photoInput.files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        const result = await res.json();
        if (result.secure_url) uploadedPhotos.push({ url: result.secure_url });
      }
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert("Photo upload failed. You can still submit without photos.");
    }

    const payload = {
      text: textValue,
      layer: layerValue,
      approximate,
      lat: selectedLat,
      lng: selectedLng,
      photos: uploadedPhotos,
      status: "Pending"
    };

    try {
      const response = await fetch("/.netlify/functions/submitEntry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Submission failed");

      alert("Thank you — your entry will appear after review.");
      e.target.reset();
      if (marker) map.removeLayer(marker);
      marker = null;
      selectedLat = null;
      selectedLng = null;

      // Optionally reload entries after submission
      loadEntries();

    } catch (err) {
      console.error(err);
      alert("Submission failed: " + err.message);
    }
  });

  // ---------- LOAD EXISTING ENTRIES ----------
  async function loadEntries() {
    try {
      const res = await fetch("/.netlify/functions/getEntries");
      const data = await res.json();

      if (!data.entries) return;

      // Optional: clear previous markers if you keep them in an array
      // For simplicity, just keep adding markers here

      data.entries.forEach(entry => {
        const lat = entry.fields.Latitude;
        const lng = entry.fields.Longitude;
        const text = entry.fields.Text;
        const photos = entry.fields.Photos || [];
        const layer = entry.fields.Layer?.[0] || "";

        if (lat && lng) {
          const color = layerColors[layer] || "gray";
          const markerIcon = L.icon({
            iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=pin|${color}`,
            iconSize: [30, 50],
            iconAnchor: [15, 50],
            popupAnchor: [0, -50]
          });

          const m = L.marker([lat, lng], { icon: markerIcon }).addTo(map);

          let popupContent = `<p>${text}</p>`;
          photos.forEach(p => {
            popupContent += `<img src="${p.url}" width="100"/>`;
          });

          m.bindPopup(popupContent);
        }
      });
    } catch (err) {
      console.error("Failed to load entries:", err);
    }
  }

  // Initial load
  loadEntries();
});
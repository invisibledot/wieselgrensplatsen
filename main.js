document.addEventListener("DOMContentLoaded", () => {
  // ---------- MAP SETUP ----------
  const map = L.map("map").setView([57.7204, 11.9442], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  let marker = null;
  let selectedLat = null;
  let selectedLng = null;

  map.on("click", e => {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;

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
  });

  // ---------- FORM SUBMISSION ----------
  document.getElementById("mapForm").addEventListener("submit", async e => {
    e.preventDefault();

    const layerValue = document.getElementById("layer").value;
    if (!layerValue) return alert("Please select a layer.");
    if (selectedLat === null || selectedLng === null) return alert("Place a pin first.");

    const uploadedPhotos = [];
    const photoInput = document.getElementById("photos");

    // ---------- Cloudinary setup ----------
    const cloudName = "YOUR_CLOUD_NAME";         // Replace
    const uploadPreset = "YOUR_UNSIGNED_PRESET"; // Replace

    try {
      for (const file of photoInput.files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const uploadResp = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        const result = await uploadResp.json();
        uploadedPhotos.push({ url: result.secure_url });
      }
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert("Photo upload failed. You can still submit without photos.");
    }

    // ---------- SUBMIT TO NETLIFY FUNCTION ----------
    const payload = {
      text: document.getElementById("text").value,
      layer: layerValue,
      approximate: document.getElementById("approximate").checked,
      lat: selectedLat,
      lng: selectedLng,
      status: "Pending",
      photos: uploadedPhotos
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

    } catch (err) {
      console.error(err);
      alert("Submission failed: " + err.message);
    }
  });
});
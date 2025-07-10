window.onload = function () {
  const loading = document.getElementById("loading");
  const ipInfo = document.getElementById("ip-info");

  fetch("https://ipinfo.io/json?token=941bf3191d1361") // Replace with your free token
    .then((response) => response.json())
    .then((data) => {
      const [city, region, country] = data.loc ? [data.city, data.region, data.country] : ["-", "-", "-"];

      document.getElementById("ip").textContent = data.ip || "-";
      document.getElementById("city").textContent = city;
      document.getElementById("region").textContent = region;
      document.getElementById("country").textContent = country;
      document.getElementById("timezone").textContent = data.timezone || "-";
      document.getElementById("org").textContent = data.org || "-";

      loading.classList.add("d-none");
      ipInfo.classList.remove("d-none");
    })
    .catch((error) => {
      loading.innerHTML = `<p class="text-danger">Failed to fetch IP details. Please try again.</p>`;
      console.error("Fetch error:", error);
    });
};

  function lookupCustomIP() {
      const ip = document.getElementById("customIp").value.trim();
      const name = document.getElementById("clientName").value.trim();
      const resultDiv = document.getElementById("custom-result");

      if (!ip || !name) {
        resultDiv.innerHTML = `<div class="text-danger">Please enter both IP address and your name.</div>`;
        return;
      }

      resultDiv.innerHTML = `<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p>Fetching data...</p></div>`;

      fetch(`https://ipinfo.io/${ip}/json?token=941bf3191d1361`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            resultDiv.innerHTML = `<div class="text-danger">Error: ${data.error.message}</div>`;
            return;
          }

          // Remove AS number from ISP name
          let isp = data.org || "-";
          isp = isp.replace(/^AS\d+\s/, "");

          resultDiv.innerHTML = `
            <div class="mb-2"><strong>Name:</strong> ${name}</div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><strong>IP Address:</strong> ${data.ip}</li>
              <li class="list-group-item"><strong>City:</strong> ${data.city || "-"}</li>
              <li class="list-group-item"><strong>Region:</strong> ${data.region || "-"}</li>
              <li class="list-group-item"><strong>Country:</strong> ${data.country || "-"}</li>
              <li class="list-group-item"><strong>Timezone:</strong> ${data.timezone || "-"}</li>
              <li class="list-group-item"><strong>ISP:</strong> ${isp}</li>
            </ul>
          `;
        })
        .catch(error => {
          resultDiv.innerHTML = `<div class="text-danger">Failed to fetch IP details.</div>`;
          console.error(error);
        });
    }
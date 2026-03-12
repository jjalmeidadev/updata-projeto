const tokenInput = document.getElementById("tokenInput");
const sendTokenButton = document.getElementById("sendTokenButton");

function sendCryptographedToken() {
  // Read token from input and remove accidental spaces.
  return tokenInput?.value?.trim() ?? "";
}

async function requestApi(url, token) {
  // Send the token to the protected users endpoint.
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

if (sendTokenButton) {
  sendTokenButton.addEventListener("click", async () => {
    try {
      // Minimal click flow: get token, call API, print result.
      const token = sendCryptographedToken();
      const result = await requestApi("/api/users", token);
      console.log("API response:", result);
    } catch (error) {
      console.error("Request error:", error);
    }
  });
}




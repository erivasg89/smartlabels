document.addEventListener('DOMContentLoaded', () => {
    async function getIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error("Error obteniendo la IP: ", error);
            return null;
        }
    }

    async function validateIP() {
        const allowedIPs = ["187.234.222.84","187.228.172.137"];
        const userIP = await getIP();

        console.log("IP detectada: ", userIP);

        if (userIP && allowedIPs.includes(userIP)) {
            console.log("IP permitida: " + userIP);
        } else {
            console.log("IP no permitida: " + (userIP || "No se pudo obtener la IP"));
            alert("Acceso restringido: IP no autorizada.");

            document.body.innerHTML = '';
            const errorMessage = document.createElement('div');
            errorMessage.textContent = "Acceso restringido. Tu IP no está autorizada para acceder a esta herramienta, contacta al administrador.";
            errorMessage.style.textAlign = 'center';
            errorMessage.style.fontSize = '24px';
            errorMessage.style.marginTop = '20%';
            document.body.appendChild(errorMessage);
        }
    }

    validateIP();
});


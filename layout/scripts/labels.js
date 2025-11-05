let productos = [];

function procesarArchivo() {
    const file = document.getElementById("csvFile").files[0];
    if (!file) return alert("Selecciona un archivo primero (.csv o .xlsx)");
    
    // Actualizar información del archivo
    const fileInfo = document.getElementById("fileInfo");
    fileInfo.textContent = `Archivo seleccionado: ${file.name}`;
    fileInfo.style.display = 'block';
    
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                productos = limpiarDatos(result.data);
                generarEtiquetas();
            },
            error: (error) => {
                alert("Error al procesar el archivo CSV: " + error.message);
            }
        });
    } else if (extension === 'xlsx') {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet);
                productos = limpiarDatos(json);
                generarEtiquetas();
            } catch (error) {
                alert("Error al procesar el archivo Excel: " + error.message);
            }
        };
        reader.onerror = () => {
            alert("Error al leer el archivo");
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Formato no compatible. Usa .csv o .xlsx");
    }
}

function limpiarDatos(data) {
    return data.map(item => {
        // Buscar campos con nombres diferentes
        const nombre = (item.nombre || item.Nombre || item.Producto || item.producto || item.descripcion || item.Descripcion || "").toString().trim();
        const precioTexto = (item.precio || item.Precio || item.price || item.Price || "").toString().trim();
        const precio = parseFloat(precioTexto.replace(/[^\d.]/g, "")) || 0;
        const sku = (item.sku || item.SKU || item.codigo || item.Codigo || item.code || "").toString().trim();
        
        return { nombre, precio, sku };
    }).filter(p => p.nombre && p.sku);
}

function generarEtiquetas() {
    const container = document.getElementById("labelContainer");
    const emptyState = document.getElementById("emptyState");
    
    container.innerHTML = "";
    
    if (productos.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';

    productos.forEach((p, i) => {
        const div = document.createElement("div");
        div.classList.add("label");

        div.innerHTML = `
            <div class="product-name">${p.nombre}</div>
            <div class="barcode-container">
                <svg id="barcode${i}" class="barcode"></svg>
            </div>
            <div class="price">$${p.precio.toFixed(2)}</div>
            <div class="sku">${p.sku}</div>
        `;

        container.appendChild(div);

        // Generar código de barras
        try {
            JsBarcode(`#barcode${i}`, p.sku, {
                format: "CODE128",
                width: 1,
                height: 25,
                displayValue: false,
                margin: 0,
                background: "transparent"
            });
        } catch (err) {
            console.warn("Error generando código de barras:", p.sku, err);
            const barcodeContainer = div.querySelector('.barcode-container');
            barcodeContainer.innerHTML = `<span style="font-size: 8px;">${p.sku}</span>`;
        }
    });
}

// Mostrar nombre del archivo seleccionado
document.getElementById('csvFile').addEventListener('change', function(e) {
    const fileInfo = document.getElementById("fileInfo");
    if (this.files.length > 0) {
        fileInfo.textContent = `Archivo seleccionado: ${this.files[0].name}`;
        fileInfo.style.display = 'block';
    } else {
        fileInfo.style.display = 'none';
    }
});
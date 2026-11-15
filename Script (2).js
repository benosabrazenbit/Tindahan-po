
// ======================================
// TindahanPro - Store Management System
// ======================================

// STORAGE KEYS
const PRODUCT_KEY = "tindahanpro_products";
const SALES_KEY = "tindahanpro_sales";

// DEFAULT PRODUCTS
const defaultProducts = [
    { id: 1, name: "Bottled Water", price: 15, stock: 20 },
    { id: 2, name: "Instant Noodles", price: 18, stock: 15 },
    { id: 3, name: "Canned Sardines", price: 28, stock: 10 }
];

// ======================================
// LOAD AND VALIDATE DATA
// ======================================

function loadData(key, fallback, validator) {
    try {
        const saved = localStorage.getItem(key);

        if (saved === null) {
            return fallback;
        }

        const data = JSON.parse(saved);

        return Array.isArray(data) && data.every(validator)
            ? data
            : fallback;

    } catch (error) {
        console.error("Loading error:", error);
        return fallback;
    }
}

function validProduct(product) {
    return product &&
        (typeof product.id === "number" ||
         typeof product.id === "string") &&
        typeof product.name === "string" &&
        Number.isFinite(product.price) &&
        product.price > 0 &&
        Number.isInteger(product.stock) &&
        product.stock >= 0;
}

function validSale(sale) {
    return sale &&
        typeof sale.product === "string" &&
        Number.isInteger(sale.quantity) &&
        sale.quantity > 0 &&
        Number.isFinite(sale.total) &&
        sale.total >= 0 &&
        typeof sale.date === "string" &&
        !Number.isNaN(Date.parse(sale.date));
}

let products = loadData(
    PRODUCT_KEY,
    defaultProducts,
    validProduct
);

let sales = loadData(
    SALES_KEY,
    [],
    validSale
);

// ======================================
// SAVE DATA
// ======================================

function saveData() {
    try {
        localStorage.setItem(
            PRODUCT_KEY,
            JSON.stringify(products)
        );

        localStorage.setItem(
            SALES_KEY,
            JSON.stringify(sales)
        );

        return true;

    } catch (error) {
        console.error("Saving error:", error);

        alert(
            "Unable to save data. Your browser storage may be full or unavailable."
        );

        return false;
    }
}

// ======================================
// HELPER FUNCTIONS
// ======================================

function money(amount) {
    return "₱" + Number(amount).toFixed(2);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
}

function generateId() {
    return Date.now() + Math.random();
}

function showMessage(elementId, message, color) {
    const element = document.getElementById(elementId);

    element.textContent = message;
    element.style.color = color;
}

// ======================================
// NAVIGATION
// ======================================

function showSection(sectionId) {
    const target = document.getElementById(sectionId);

    if (!target || !target.classList.contains("section")) {
        return;
    }

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    target.classList.add("active");

    updateDashboard();
    displayProducts();
    updateSaleOptions();
    displaySales();
}

// ======================================
// ADD PRODUCT
// ======================================

function addProduct(event) {
    event.preventDefault();

    const name = document.getElementById("productName")
        .value.trim();

    const price = Number(
        document.getElementById("productPrice").value
    );

    const stock = Number(
        document.getElementById("productStock").value
    );

    if (
        !name ||
        name.length > 100 ||
        !Number.isFinite(price) ||
        price <= 0 ||
        !Number.isInteger(stock) ||
        stock < 0
    ) {
        showMessage(
            "inventoryMessage",
            "Please enter valid product information.",
            "red"
        );

        return;
    }

    const newProduct = {
        id: generateId(),
        name: name,
        price: Math.round(price * 100) / 100,
        stock: stock
    };

    products.push(newProduct);

    saveData();

    document.getElementById("productForm").reset();

    showMessage(
        "inventoryMessage",
        "Product added successfully!",
        "green"
    );

    displayProducts();
    updateDashboard();
    updateSaleOptions();
}

// ======================================
// DISPLAY PRODUCTS
// ======================================

function displayProducts() {
    const table = document.getElementById("productTable");

    const search = document.getElementById("searchProduct")
        .value.trim().toLowerCase();

    table.innerHTML = "";

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search)
    );

    if (filteredProducts.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4">No products found.</td>
            </tr>
        `;

        return;
    }

    filteredProducts.forEach(product => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = product.name;

        const priceCell = document.createElement("td");
        priceCell.textContent = money(product.price);

        const stockCell = document.createElement("td");
        stockCell.textContent = product.stock;

        if (product.stock <= 5) {
            stockCell.classList.add("low-stock");
        }

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "action-button edit";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editProduct(product.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "action-button delete";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteProduct(product.id);
        });

        actionCell.append(editButton, deleteButton);

        row.append(
            nameCell,
            priceCell,
            stockCell,
            actionCell
        );

        table.appendChild(row);
    });
}

// ======================================
// EDIT PRODUCT
// ======================================

function editProduct(id) {
    const product = products.find(p => p.id === id);

    if (!product) return;

    const name = prompt(
        "Enter product name:",
        product.name
    );

    if (name === null) return;

    const price = prompt(
        "Enter product price:",
        product.price
    );

    if (price === null) return;

    const stock = prompt(
        "Enter stock quantity:",
        product.stock
    );

    if (stock === null) return;

    const newName = name.trim();
    const newPrice = Number(price);
    const newStock = Number(stock);

    if (
        !newName ||
        newName.length > 100 ||
        !Number.isFinite(newPrice) ||
        newPrice <= 0 ||
        !Number.isInteger(newStock) ||
        newStock < 0
    ) {
        alert("Invalid product information.");
        return;
    }

    product.name = newName;
    product.price = Math.round(newPrice * 100) / 100;
    product.stock = newStock;

    saveData();

    displayProducts();
    updateDashboard();
    updateSaleOptions();

    alert("Product updated successfully!");
}

// ======================================
// DELETE PRODUCT
// ======================================

function deleteProduct(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    products = products.filter(product =>
        product.id !== id
    );

    saveData();

    displayProducts();
    updateDashboard();
    updateSaleOptions();
}

// ======================================
// UPDATE SALE OPTIONS
// ======================================

function updateSaleOptions() {
    const select = document.getElementById("saleProduct");

    const previous = select.value;

    select.innerHTML = "";

    const availableProducts = products.filter(product =>
        product.stock > 0
    );

    if (availableProducts.length === 0) {
        const option = document.createElement("option");

        option.value = "";
        option.textContent = "No products available";

        select.appendChild(option);
        select.disabled = true;

    } else {
        select.disabled = false;

        availableProducts.forEach(product => {
            const option = document.createElement("option");

            option.value = product.id;

            option.textContent =
                `${product.name} - ${money(product.price)} (${product.stock} available)`;

            select.appendChild(option);
        });

        const previousOption = [...select.options].find(option =>
            option.value === previous
        );

        if (previousOption) {
            select.value = previous;
        }
    }

    calculateSale();
}

// ======================================
// CALCULATE SALE
// ======================================

function calculateSale() {
    const id = document.getElementById("saleProduct").value;

    const quantity = Number(
        document.getElementById("saleQuantity").value
    );

    const product = products.find(p =>
        String(p.id) === id
    );

    const quantityInput = document.getElementById("saleQuantity");

    if (product) {
        quantityInput.max = product.stock;
    } else {
        quantityInput.removeAttribute("max");
    }

    const validQuantity =
        Number.isInteger(quantity) &&
        quantity > 0 &&
        product &&
        quantity <= product.stock;

    const total = validQuantity
        ? product.price * quantity
        : 0;

    document.getElementById("saleTotal").textContent =
        "Total: " + money(total);
}

// ======================================
// RECORD SALE
// ======================================

function recordSale(event) {
    event.preventDefault();

    const id = document.getElementById("saleProduct").value;

    const quantity = Number(
        document.getElementById("saleQuantity").value
    );

    const product = products.find(p =>
        String(p.id) === id
    );

    if (
        !product ||
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {
        showMessage(
            "saleMessage",
            "Please select a product and enter a valid quantity.",
            "red"
        );

        return;
    }

    if (quantity > product.stock) {
        showMessage(
            "saleMessage",
            "Not enough stock available!",
            "red"
        );

        return;
    }

    const total = Math.round(
        product.price * quantity * 100
    ) / 100;

    if (!Number.isFinite(total)) {
        showMessage(
            "saleMessage",
            "Unable to calculate the sale total.",
            "red"
        );

        return;
    }

    const newSale = {
        id: generateId(),
        product: product.name,
        quantity: quantity,
        total: total,
        date: new Date().toISOString()
    };

    // Deduct stock and record sale.
    product.stock -= quantity;
    sales.push(newSale);

    saveData();

    document.getElementById("saleQuantity").value = 1;

    showMessage(
        "saleMessage",
        "Sale recorded successfully! Total: " + money(total),
        "green"
    );

    updateSaleOptions();
    updateDashboard();
    displayProducts();
    displaySales();
}

// ======================================
// UPDATE DASHBOARD
// ======================================

function updateDashboard() {
    document.getElementById("totalProducts").textContent =
        products.length;

    const totalStock = products.reduce(
        (sum, product) => sum + product.stock,
        0
    );

    document.getElementById("totalStock").textContent =
        totalStock;

    const today = new Date().toDateString();

    const todayTotal = sales
        .filter(sale =>
            new Date(sale.date).toDateString() === today
        )
        .reduce(
            (sum, sale) => sum + sale.total,
            0
        );

    const allTotal = sales.reduce(
        (sum, sale) => sum + sale.total,
        0
    );

    document.getElementById("todaySales").textContent =
        money(todayTotal);

    document.getElementById("allSales").textContent =
        money(allTotal);

    // LOW STOCK ALERT

    const lowStockContainer =
        document.getElementById("lowStock");

    const lowStockProducts = products.filter(product =>
        product.stock <= 5
    );

    lowStockContainer.innerHTML = "";

    if (lowStockProducts.length === 0) {
        lowStockContainer.textContent =
            "No low-stock products.";

        return;
    }

    lowStockProducts.forEach(product => {
        const item = document.createElement("p");

        item.className = "low-stock";

        item.textContent =
            `${product.name} — ${product.stock} remaining`;

        lowStockContainer.appendChild(item);
    });
}

// ======================================
// DISPLAY SALES HISTORY
// ======================================

function displaySales() {
    const table = document.getElementById("salesTable");

    table.innerHTML = "";

    if (sales.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4">No sales recorded yet.</td>
            </tr>
        `;

        return;
    }

    [...sales].reverse().forEach(sale => {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent =
            new Date(sale.date).toLocaleString();

        const productCell = document.createElement("td");
        productCell.textContent = sale.product;

        const quantityCell = document.createElement("td");
        quantityCell.textContent = sale.quantity;

        const totalCell = document.createElement("td");
        totalCell.textContent = money(sale.total);

        row.append(
            dateCell,
            productCell,
            quantityCell,
            totalCell
        );

        table.appendChild(row);
    });
}

// ======================================
// EXPORT SALES TO CSV
// ======================================

function exportSales() {
    if (sales.length === 0) {
        alert("No sales available to export.");
        return;
    }

    const rows = [
        ["Date", "Product", "Quantity", "Total"],

        ...sales.map(sale => [
            new Date(sale.date).toLocaleString(),
            sale.product,
            sale.quantity,
            sale.total.toFixed(2)
        ])
    ];

    function escapeCSV(value) {
        let text = String(value);

        // Prevent spreadsheet formula execution.
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }

    const csv = rows.map(row =>
        row.map(escapeCSV).join(",")
    ).join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "TindahanPro-Sales.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

// ======================================
// CONNECT EVENTS
// ======================================

document.getElementById("productForm")
    .addEventListener("submit", addProduct);

document.getElementById("saleForm")
    .addEventListener("submit", recordSale);

document.getElementById("searchProduct")
    .addEventListener("input", displayProducts);

document.getElementById("saleProduct")
    .addEventListener("change", calculateSale);

document.getElementById("saleQuantity")
    .addEventListener("input", calculateSale);

document.getElementById("exportSalesBtn")
    .addEventListener("click", exportSales);

// ======================================
// INITIALIZE APPLICATION
// ======================================

document.getElementById("year").textContent =
    new Date().getFullYear();

displayProducts();
updateDashboard();
updateSaleOptions();
displaySales();

console.log("TindahanPro successfully initialized!");

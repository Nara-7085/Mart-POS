
      
      let products = [
        
      ];
const categories = [
  "Electronics",
  "Accessories",
  "Appliances",
  "Drink"
];
      const brands = [
        "Samsung",
        "Logitech",
        "Apple",
        "Sony",
        "Khmer Beverages ",
      ];

      document.addEventListener("DOMContentLoaded", () => {
      
        const currentPage =
          window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".nav-link").forEach((link) => {
          const href = link.getAttribute("href");
          if (href && href.endsWith(currentPage)) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });

        VANTA.NET({
          el: "#vanta-canvas",
          mouseControls: true,
          touchControls: true,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          color: 0x3fbdf,
          backgroundColor: 0x0f172a,
          points: 12.0,
          maxDistance: 20.0,
          spacing: 16.0,
        });

        populateSelects();
        renderTable();
        updateStats();
      });

      function populateSelects() {
        const cS = document.getElementById("catSelect");
        const bS = document.getElementById("brandSelect");
        categories.forEach(
          (c) => (cS.innerHTML += `<option value="${c}">${c}</option>`),
        );
        brands.forEach(
          (b) => (bS.innerHTML += `<option value="${b}">${b}</option>`),
        );
      }

      function updateStats() {
        const critical = products.filter(
          (p) => p.qty_in_stock <= p.reorder_level,
        ).length;
        const container = document.getElementById("stats-container");
        container.innerHTML = `
                <div class="col-md-3"><div class="card stock-card shadow-sm p-3 border-start border-primary border-5"><small class="text-muted fw-bold">TOTAL PRODUCTS</small><h3 class="fw-bold mb-0">${products.length}</h3></div></div>
                <div class="col-md-3"><div class="card stock-card shadow-sm p-3 border-start border-danger border-5"><small class="text-danger fw-bold">CRITICAL STOCK</small><h3 class="fw-bold mb-0">${critical}</h3></div></div>
                <div class="col-md-3"><div class="card stock-card shadow-sm p-3 border-start border-success border-5"><small class="text-muted fw-bold">SUPPLIERS</small><h3 class="fw-bold mb-0">12</h3></div></div>
                <div class="col-md-3"><div class="card stock-card shadow-sm p-3 border-start border-info border-5"><small class="text-muted fw-bold">WAREHOUSES</small><h3 class="fw-bold mb-0">3</h3></div></div>
            `;
      }

      function renderTable(filter = "") {
        const tbody = document.getElementById("productTableBody");
        tbody.innerHTML = "";

        products
          .filter((p) =>
            p.product_name.toLowerCase().includes(filter.toLowerCase()),
          )
          .forEach((p) => {
            const isLow = p.qty_in_stock <= p.reorder_level;
            tbody.innerHTML += `
                    <tr>
                        <td class="ps-4"><strong>${p.product_name}</strong><br><small class="text-muted">BC: ${p.barcode}</small></td>
                        <td><span class="badge bg-light text-dark border">${p.category}</span></td>
                        <td>${p.brand}</td>
                        <td><small class="text-muted">C: $${p.cost_price}</small><br><span class="text-success fw-bold">S: $${p.selling_price}</span></td>
                        <td><div class="${isLow ? "text-danger fw-bold" : ""}">${p.qty_in_stock} In Stock</div></td>
                        <td class="text-end pe-4">
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${p.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
          });
      }

      // --- Handlers ---
      document
        .getElementById("formCreateProduct")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          const formData = new FormData(this);
          const dto = Object.fromEntries(formData);

          // Convert numeric fields
          dto.cost_price = parseFloat(dto.cost_price) || 0;
          dto.selling_price = parseFloat(dto.selling_price) || 0;
          dto.qty_in_stock = parseInt(dto.qty_in_stock) || 0;
          dto.reorder_level = parseInt(dto.reorder_level) || 0;
          dto.id = Date.now();

          products.push(dto);
          renderTable();
          updateStats();

          // Close modal and reset form
          const modalElement = document.getElementById("modalInsert");
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
          this.reset();
        });

      document
        .getElementById("searchInput")
        .addEventListener("input", (e) => renderTable(e.target.value));

      function deleteItem(id) {
        if (confirm("Delete this product?")) {
          products = products.filter((p) => p.id !== id);
          renderTable();
          updateStats();
        }
}
      document.getElementById("productImageInput").onchange = function (evt) {
        const [file] = this.files;
        if (file) {
          const imgPreview = document.getElementById("imgPreview");
          const previewText = document.getElementById("previewText");

          imgPreview.src = URL.createObjectURL(file);
          imgPreview.style.display = "block";
          previewText.style.display = "none";
        }
      };
// offcanvas
const openBtn = document.getElementById("openCanvas");
const closeBtn = document.getElementById("closeCanvas");
const offCanvas = document.getElementById("offCanvas");
const overlay = document.getElementById("overlay");

openBtn.addEventListener("click", () => {
  offCanvas.classList.remove("translate-x-full");
  overlay.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
  offCanvas.classList.add("translate-x-full");
  overlay.classList.add("hidden");
});

overlay.addEventListener("click", () => {
  offCanvas.classList.add("translate-x-full");
  overlay.classList.add("hidden");
});

// ====================== STORAGE =========================
function saveCartToStorage() {
  const cartData = products.map((p) => ({
    code_no: p.code_no,
    quantity: p.quantity || 0,
  }));
  localStorage.setItem("cartData", JSON.stringify(cartData));
}

function loadCartFromStorage() {
  const data = localStorage.getItem("cartData");
  if (!data) return;
  const cartData = JSON.parse(data);

  cartData.forEach((saved) => {
    const prod = products.find((p) => p.code_no === saved.code_no);
    if (prod) prod.quantity = saved.quantity;
  });

  updateAnbuView();
}

// ====================== RENDER =========================
function populateCategories() {
  const dd = document.getElementById("category-dropdown-desktop");
  if (!dd) return;

  const uniqueCats = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  dd.innerHTML = '<option value="all">All Categories</option>';
  uniqueCats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    dd.appendChild(opt);
  });
}

function renderCards(filteredProducts = products) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  const sortedProducts = sortProducts(filteredProducts);

  sortedProducts.forEach((product) => {
    const card = createProductCard(product);
    card.classList.add(`products-grid-${product.code_no}`);
    container.appendChild(card);
  });

  updateAnbuView();
}
function sortProducts(arr) {
  const sortDropdown = document.getElementById("sort-dropdown-desktop");
  const val = sortDropdown ? sortDropdown.value : "default";
  return [...arr].sort((a, b) => {
    switch (val) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "offer_price-asc":
        return a.offer_price - b.offer_price;
      case "offer_price-desc":
        return b.offer_price - a.offer_price;
      default:
        return parseInt(a.code_no) - parseInt(b.code_no);
    }
  });
}

function createProductCard(p) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <div class="product-image">
      <img src="${p.img}" alt="${p.name}" onerror="this.src=''">
    </div>
    <div class="product-info">
      <h2>${p.name}</h2>
      <p class="product-author">- ${p.writer || ""}</p>
      <div class="product-prices">
        <span class="original-price"><del>₹ ${p.original_price.toFixed(
          2
        )}</del></span>
        <span class="offer-price">₹ ${p.offer_price.toFixed(2)}</span>
      </div>
      <div class="product-quantity">
        <button onclick="changeQuantity('${
          p.code_no
        }',-1)" class="less"><i class="fa-solid fa-minus"></i></button>
        <input type="text" value="${p.quantity || 0}" class="quantity-input"
          onchange="updateQuantityFromInput('${p.code_no}', this)">
        <button onclick="changeQuantity('${
          p.code_no
        }',1)" class="add"><i class="fa-solid fa-plus"></i></button>
      </div>
      <p class="product-total">Total: ₹ 
        <span class="total-cell" data-code="${p.code_no}">${(
    p.offer_price * (p.quantity || 0)
  ).toFixed(2)}</span>
      </p>
    </div>
  `;

  return card;
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  renderCards(products); // load all as cards
  loadCartFromStorage();
  populateCategories(); // restore saved quantities
});

// ====================== QUANTITY =========================
function changeQuantity(code, delta) {
  const p = products.find((x) => x.code_no === code);
  if (!p) return;
  p.quantity = Math.max(0, (p.quantity || 0) + delta);
  updateAnbuView();
  saveCartToStorage();
}

function updateQuantityFromInput(code, input) {
  let qty = parseInt(input.value);
  if (isNaN(qty) || qty < 0) qty = 0;
  const p = products.find((x) => x.code_no === code);
  if (p) p.quantity = qty;
  updateAnbuView();
  saveCartToStorage();
}

function updateAnbuView() {
  products.forEach((p) => {
    // Update all card inputs
    const inputs = document.querySelectorAll(
      `.product-card input.quantity-input`
    );
    inputs.forEach((input) => {
      if (input.closest(`.products-grid-${p.code_no}`)) {
        input.value = p.quantity || 0;
      }
    });

    // Update totals
    const totalElems = document.querySelectorAll(
      `.total-cell[data-code="${p.code_no}"]`
    );
    totalElems.forEach((totalElem) => {
      totalElem.textContent = (p.quantity * p.offer_price).toFixed(2);
    });
  });

  updateBottomBar();
}

function updateBottomBar() {
  const total = products.reduce(
    (s, p) => s + (p.quantity || 0) * p.offer_price,
    0
  );
  const totalElem = document.getElementById("total-amount");
  if (totalElem) totalElem.textContent = total.toFixed(2);
}

function clearAnbu() {
  products.forEach((p) => (p.quantity = 0));
  updateAnbuView();
  localStorage.removeItem("cartData");
}

// ====================== FILTER & SEARCH =========================
function filterAndRender() {
  const term = document
    .getElementById("search-bar-desktop")
    .value.toLowerCase();
  const cat = document.getElementById("category-dropdown-desktop").value;
  let filtered = products;

  if (cat !== "all") {
    filtered = filtered.filter((p) => p.category === cat);
  }

  if (term) {
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));
  }

  renderCards(filtered); // ✅ Use card renderer instead of table renderer
}

// ====================== EVENTS =========================
document.getElementById("clear-button").onclick = clearAnbu;
document
  .getElementById("search-bar-desktop")
  .addEventListener("input", filterAndRender);
document
  .getElementById("category-dropdown-desktop")
  .addEventListener("change", filterAndRender);
document
  .getElementById("sort-dropdown-desktop")
  .addEventListener("change", filterAndRender);

// ====================== MODAL & ENQUIRY =========================
const okBtn = document.getElementById("ok-button");
if (okBtn) {
  okBtn.onclick = () => {
    const cart = products.filter((p) => p.quantity > 0);
    if (cart.length === 0) {
      $.notify("No items selected", "error");
      // alert("No items selected");
      return;
    }

    let totalOffer = 0,
      totalOriginal = 0;
    cart.forEach((p) => {
      totalOffer += p.quantity * p.offer_price;
      totalOriginal += p.quantity * p.original_price;
    });

    const saved = totalOriginal - totalOffer;

    document.getElementById(
      "total-amount-modal"
    ).textContent = `₹ ${totalOffer.toFixed(2)}`;
    document.getElementById("saved-amount").textContent = `₹ ${saved.toFixed(
      2
    )}`;

    document.getElementById("form-modal").style.display = "flex";
  };
}

document.querySelector("#form-modal .close").onclick = () => closeModal();
document.getElementById("close-form").onclick = () => closeModal();
function closeModal() {
  document.getElementById("form-modal").style.display = "none";
}

document.getElementById("submit-button").onclick = () => {
  const name = document.getElementById("name-input").value.trim();
  const phone = document.getElementById("phone-input").value.trim();

  // Validation
  if (!name) {
    $.notify("Name is required", "error");
    return;
  }
  if (!phone) {
    $.notify("Phone number is required", "error");
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    $("#phone-input").notify("Enter a valid 10-digit phone", "warn");
    return;
  }

  // ✅ Only include products with quantity > 0
  const cartData = products
    .filter((item) => item.quantity > 0)
    .map(
      (item) =>
        `${parseInt(item.code_no).toString(16)}-${item.quantity.toString(16)}`
    )
    .join(",");

  const currentFile = window.location.pathname.split("/").pop();
  const fileNameWithoutExt = currentFile.split(".")[0];

  const enquiryFile = `invoice.html`;
  const basePath = window.location.href.replace(currentFile, "");

  const enquiryUrl = `/${enquiryFile}?n=${name}&p=${phone}&c=${cartData}`;
  const fullUrl = `${window.location.origin}${enquiryUrl}`;

  const message = `New Enquiry! View details here:\n\n${fullUrl}`;
  const adminPhoneNumber = document
    .getElementById("phoneTag")
    .textContent.trim();

  const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(
    message
  )}`;
  window.open(whatsappUrl, "_blank");
};

// ====================== EVENTS =========================
document.getElementById("clear-button").onclick = clearAnbu;
document
  .getElementById("search-bar-desktop")
  .addEventListener("input", filterAndRender);
document
  .getElementById("category-dropdown-desktop")
  .addEventListener("change", filterAndRender);
document
  .getElementById("sort-dropdown-desktop")
  .addEventListener("change", filterAndRender);

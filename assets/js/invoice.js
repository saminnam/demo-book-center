function hexToString(hex) {
    if (!hex) return 'N/A';
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const hexValue = hex.substr(i, 2);
        const decimalValue = parseInt(hexValue, 16);
        str += String.fromCharCode(decimalValue);
    }
    return str;
}

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const customerName = urlParams.get('n');
    const customerPhone = urlParams.get('p');
    const cartHex = urlParams.get('c');


    // const customerPhone = hexToString(phoneHex);

    const cartItems = cartHex ? cartHex.split(',').map(item => {
        const [code_no_hex, quantity_hex] = item.split('-');
        return {
            code_no: parseInt(code_no_hex, 16).toString(),
            quantity: parseInt(quantity_hex, 16)
        };
    }) : [];

    document.getElementById('customer-name').textContent = `Name: ${customerName}`;
    document.getElementById('customer-phone').textContent = `Phone: ${customerPhone}`;
    document.getElementById('enquiry-id').textContent = Math.floor(100000 + Math.random() * 900000);
    document.getElementById('enquiry-date').textContent = new Date().toLocaleDateString('en-GB');

    const invoiceItemsTbody = document.getElementById('invoice-items');
    let total_amount = 0;
    let original_total = 0;
    let total_quantity = 0;
    let serialNumber = 1;

    cartItems.forEach(item => {
        const product = products.find(p => p.code_no === item.code_no);

        if (product) {
            const itemTotal = item.quantity * product.offer_price;
            total_amount += itemTotal;
            original_total += item.quantity * product.original_price;
            total_quantity += item.quantity;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${serialNumber++}</td> 
                <td class="item-name">${product.name}</td>
                <td class="align-right">${item.quantity}</td>
                <td class="align-right">₹${product.original_price.toFixed(2)}</td>
                <td class="align-right">₹${product.offer_price.toFixed(2)}</td>
                <td class="align-right"><strong>₹${itemTotal.toFixed(2)}</strong></td>
            `;
            invoiceItemsTbody.appendChild(row);
        }
    });

    const saved_amount = original_total - total_amount;

    document.getElementById('total-qty').textContent = total_quantity;
    document.getElementById('saved-amount').textContent = `₹${saved_amount.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `₹${total_amount.toFixed(2)}`;
});
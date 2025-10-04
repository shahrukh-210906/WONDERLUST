document.addEventListener('DOMContentLoaded', () => {
    const checkInInput = document.getElementById('checkIn');
if (!checkInInput) return;

    const checkOutInput = document.getElementById('checkOut');
    const priceDetailsDiv = document.getElementById('price-details');
    const priceCalculationText = document.getElementById('price-calculation-text');
    const subtotalPriceSpan = document.getElementById('subtotal-price');
const serviceFeePriceSpan = document.getElementById('service-fee-price');
    const totalPriceSpan = document.getElementById('total-price');

    const pricePerNight = Number('<%= listing.price %>');
    const serviceFeeRate = 0.18;
const bookings = JSON.parse('<%- JSON.stringify(bookings) %>');

    const bookedDates = [];
bookings.forEach(booking => {
        let start = new Date(booking.checkIn);
        let end = new Date(booking.checkOut);
        for (let dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
            bookedDates.push(new Date(dt).toISOString().split('T')[0]);
        }
    });
function updatePrice() {
        const checkInDate = new Date(checkInInput.value);
        const checkOutDate = new Date(checkOutInput.value);
if (checkInInput.value && checkOutInput.value && checkOutDate > checkInDate) {
            const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000*3600*24));
let conflict = false;
            for (let dt = new Date(checkInDate); dt < checkOutDate; dt.setDate(dt.getDate() + 1)) {
                if (bookedDates.includes(dt.toISOString().split('T')[0])) {
                    conflict = true;
break;
                }
            }

            if (conflict) {
                priceDetailsDiv.classList.add('d-none');
alert("The selected dates overlap with an existing booking. Please choose different dates.");
                checkInInput.value = ""; checkOutInput.value = "";
                return;
}

            const subtotal = pricePerNight * numberOfNights;
const serviceFee = subtotal * serviceFeeRate;
            const total = subtotal + serviceFee;
            priceCalculationText.textContent = `₹${pricePerNight.toLocaleString('en-IN')} x ${numberOfNights} nights`;
subtotalPriceSpan.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
            serviceFeePriceSpan.textContent = `₹${serviceFee.toLocaleString('en-IN')}`;
            totalPriceSpan.textContent = `₹${total.toLocaleString('en-IN')}`;
            priceDetailsDiv.classList.remove('d-none');
} else {
            priceDetailsDiv.classList.add('d-none');
}
    }

    checkInInput.addEventListener('change', updatePrice);
    checkOutInput.addEventListener('change', updatePrice);
});
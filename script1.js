const API_BASE = "https://api.thedogapi.com/v1"; 
const apiKey = 'live_ChkZIauCJmS2NR9W2saSyBXKROi85TBwseD2Tvm3JsTAtAUlbiVZrC6p77puA44M';
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Giỏ hàng

// 🛒 Hàm cập nhật số lượng hiển thị trên icon giỏ hàng
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;

    cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
}

// 🛒 Hàm thêm sản phẩm vào giỏ hàng
function addToCart(name, image, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        const cartItem = { name, image, price, quantity: 1 };
        cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} has been added a dog adoption section!`);

    updateCartCount();
    updateCart(); // Nếu đang ở trang giỏ hàng, cập nhật luôn
}

// 📃 Hàm cập nhật giỏ hàng trong cart.html
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    if (!cartItems) return;

    cartItems.innerHTML = ''; // Xóa nội dung cũ
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex align-items-center justify-content-between';
        li.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${item.image}" alt="${item.name}" class="img-thumbnail" style="width: 200px; height: 200px; margin-right: 10px;">
                <span>${item.name} - $${item.price} x ${item.quantity}</span>
            </div>
            <div class="d-flex align-items-center">
                <strong class="me-3">Total: $${itemTotal}</strong>
                <button class="btn btn-outline-secondary btn-sm me-1" onclick="updateQuantity('${item.name}', 1)">+</button>
                <button class="btn btn-outline-secondary btn-sm me-1" onclick="updateQuantity('${item.name}', -1)">-</button>
                <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart('${item.name}')">Remove</button>
            </div>
        `;
        cartItems.appendChild(li);
        total += itemTotal;
    });

    totalPriceElement.textContent = `$${total}`;
}

document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    updateCart();
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;

        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name); // Xóa sản phẩm nếu số lượng <= 0
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        updateCartCount();
    }
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    updateCartCount();
}

// 🌟 Xử lý sự kiện "Add to Cart"
document.getElementById("breeds-list").addEventListener("click", function (e) {
    if (e.target.classList.contains("add-to-cart")) {
        const button = e.target;
        const name = button.getAttribute("data-name");
        const image = button.getAttribute("data-image");
        const price = parseInt(button.getAttribute("data-price"));

        addToCart(name, image, price);
    }
});

// 🛠️ Tìm kiếm giống chó
document.getElementById("search-btn").addEventListener("click", function () {
    const searchInput = document.getElementById("search-input").value.toLowerCase();
    const breedsList = document.getElementById("breeds-list");

    // Xóa nội dung cũ
    breedsList.innerHTML = "";

    if (!searchInput) {
        loadBreeds(); // Nếu không nhập gì, tải lại toàn bộ danh sách
        return;
    }

    // Lọc giống chó theo từ khóa
    fetch(`${API_BASE}/breeds`, {
        headers: {
            "x-api-key": apiKey
        }
    })
        .then(response => response.json())
        .then(breeds => {
            const filteredBreeds = breeds.filter(breed =>
                breed.name.toLowerCase().includes(searchInput)
            );

            if (filteredBreeds.length === 0) {
                breedsList.innerHTML = `<p class="text-center">No breeds found for "${searchInput}".</p>`;
            } else {
                filteredBreeds.forEach(breed => {
                    const imageUrl = breed.image?.url || "https://via.placeholder.com/300x200?text=No+Image";
                    const weight = breed.weight?.metric || "N/A";
                    const height = breed.height?.metric || "N/A";
                    const lifeSpan = breed.life_span || "Unknown";
                    const temperament = breed.temperament || "No description available";
                    // Tạo giá ngẫu nhiên cho từng giống chó dựa trên `breed.id`
                    const randomPrice = Math.floor(Math.random() * 101) + 50;// Giá trị sẽ không thay đổi khi tải lại trang


                    const col = document.createElement("div");
                    col.className = "col-md-4 mb-4";
                    col.innerHTML = `
                        <div class="card">
                            <img src="${imageUrl}" class="dog-image" alt="${breed.name}">
                            <div class="card-body">
                                    <h5 class="card-title">${breed.name}</h5>
                                    <p><strong>Average weight: </strong> ${weight} kg</p>
                                    <p><strong>Average height: </strong> ${height} cm</p>
                                    <p><strong>Average age: </strong> ${lifeSpan}</p>
                                    <p><strong>Temperament: </strong> ${temperament}</p>
                                    <p><strong>Adoption price: </strong> $${randomPrice}</p>
                                    <button class="btn btn-success add-to-cart" 
                                    data-name="${breed.name}" 
                                    data-image="${imageUrl}" 
                                    data-price="${randomPrice}">Adopt</button>
                        </div>
                        </div>
                    `;
                    breedsList.appendChild(col);
                });
            }
        })
        .catch(error => console.error("Error fetching breeds:", error));
});

// 🔥 Khởi tạo khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Loại bỏ sản phẩm không hợp lệ
    cart = cart.filter(item => item.name && item.price && item.image);
    localStorage.setItem('cart', JSON.stringify(cart));

    updateCartCount();

    if (document.getElementById('breeds-list')) loadBreeds();
    if (document.getElementById('cart-items')) updateCart();
});

// Hiển thị hoặc ẩn nút khi cuộn
window.addEventListener('scroll', function () {
    const backToTopButton = document.getElementById('back-to-top');

    if (window.scrollY > 200) { // Hiển thị khi cuộn xuống hơn 200px
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

// Trở về đầu trang khi nhấn nút
document.getElementById('back-to-top').addEventListener('click', function (e) {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn mượt về đầu trang
});

async function loadBreeds() {
    const response = await fetch(`${API_BASE}/breeds`, {
        headers: {
            'x-api-key': apiKey
        }
    });

    const breeds = await response.json();
    const breedsList = document.getElementById("breeds-list");
    const breedFilter = document.getElementById("breed-filter");

    // Populate breed dropdown
    breeds.forEach(breed => {
        const option = document.createElement("option");
        option.value = breed.name;
        option.textContent = breed.name;
        breedFilter.appendChild(option);
    });

    displayBreeds(breeds);
}

// Thêm sự kiện "click" cho nút "Apply Filters"
document.getElementById("apply-filters").addEventListener("click", function () { 
    // Lấy giá trị từ các ô nhập liệu và chuyển đổi nếu cần
    const breedFilter = document.getElementById("breed-filter").value.toLowerCase(); // Lọc theo tên giống chó
    const ageFilter = parseInt(document.getElementById("age-filter").value); // Lọc theo tuổi
    const heightFilter = parseInt(document.getElementById("height-filter").value); // Lọc theo chiều cao
    const weightFilter = parseInt(document.getElementById("weight-filter").value); // Lọc theo cân nặng

    // Gọi API lấy danh sách giống chó từ API_BASE
    fetch(`${API_BASE}/breeds`, {
        headers: {
            'x-api-key': apiKey // Thêm API Key để xác thực
        }
    })
    .then(response => response.json()) // Chuyển đổi dữ liệu JSON từ API
    .then(breeds => {
        // Lọc giống chó dựa trên các tiêu chí
        const filteredBreeds = breeds.filter(breed => {
            const breedNameMatch = breedFilter ? breed.name.toLowerCase() === breedFilter : true; // So khớp tên giống chó
            const ageMatch = !isNaN(ageFilter) ? breed.life_span.includes(ageFilter) : true; // So khớp tuổi
            const heightMatch = !isNaN(heightFilter) ? breed.height.metric.includes(heightFilter) : true; // So khớp chiều cao
            const weightMatch = !isNaN(weightFilter) ? breed.weight.metric.includes(weightFilter) : true; // So khớp cân nặng

            // Chỉ giữ những giống chó thỏa mãn tất cả các điều kiện
            return breedNameMatch && ageMatch && heightMatch && weightMatch;
        });

        // Hiển thị danh sách giống chó sau khi lọc
        displayBreeds(filteredBreeds);
    })
    .catch(error => console.error("Error fetching breeds:", error)); // Xử lý lỗi nếu API gặp vấn đề
});

// Hàm hiển thị danh sách giống chó
function displayBreeds(breeds) {
    const breedsList = document.getElementById("breeds-list"); // Lấy phần tử HTML chứa danh sách giống chó
    breedsList.innerHTML = ""; // Xóa nội dung cũ trước khi hiển thị danh sách mới

    // Duyệt qua từng giống chó và tạo giao diện hiển thị
    breeds.forEach(breed => {
        const imageUrl = breed.image?.url || 'https://via.placeholder.com/300x200?text=No+Image'; // Lấy URL ảnh hoặc hiển thị ảnh mặc định
        const weight = breed.weight?.metric || "N/A"; // Lấy cân nặng (hoặc hiển thị "N/A" nếu không có)
        const height = breed.height?.metric || "N/A"; // Lấy chiều cao (hoặc hiển thị "N/A" nếu không có)
        const lifeSpan = breed.life_span || "Unknown"; // Lấy tuổi thọ trung bình
        const temperament = breed.temperament || "No description available"; // Lấy mô tả tính cách
        // Tạo giá ngẫu nhiên cho từng giống chó dựa trên `breed.id`
        const randomPrice = Math.floor(Math.random() * 101) + 50;
            // Tạo giá ngẫu nhiên từ 50 đến 150

        // Tạo phần tử HTML cho mỗi giống chó
        const col = document.createElement("div");
        col.className = "col-md-4 mb-4"; // Sử dụng lớp Bootstrap để bố trí giao diện
        col.innerHTML = `
            <div class="card">
                <img src="${imageUrl}" class="dog-image" alt="${breed.name}" >
                <div class="card-body">
                    <h5 class="card-title">${breed.name}</h5>
                    <p><strong>Average weight: </strong> ${weight} kg</p>
                    <p><strong>Average height: </strong> ${height} cm</p>
                    <p><strong>Average age: </strong> ${lifeSpan}</p>
                    <p><strong>Temperament: </strong> ${temperament}</p>
                    <p><strong>Adoption price: </strong> $${randomPrice}</p>
                    <button class="btn btn-success add-to-cart" 
                        data-name="${breed.name}" 
                        data-image="${imageUrl}" 
                        data-price="${randomPrice}">Adopt</button>
                </div>
            </div>
        `;
        breedsList.appendChild(col); // Thêm phần tử giống chó vào danh sách
    });
}

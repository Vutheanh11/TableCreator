let rowCounter = 0;

// Add initial sample row
window.onload = function() {
    addRow();
};

function addRow() {
    rowCounter++;
    const tbody = document.getElementById('tableBody');
    const row = tbody.insertRow();
    
    row.innerHTML = `
        <td>${rowCounter}</td>
        <td><input type="text" class="item-name" placeholder="Nhập tên hàng"></td>
        <td><input type="text" class="dimension" placeholder="VD: 330 x 120" onblur="formatDimensionOnBlur(this)"></td>
        <td><input type="text" class="quantity" placeholder="Tự động hoặc nhập thủ công" oninput="calculateRow(this)"></td>
        <td><input type="text" class="unit-price" placeholder="0" oninput="formatAndCalculate(this)" required></td>
        <td class="line-total">0</td>
        <td class="no-print">
            <div class="row-actions">
                <button onclick="deleteRow(this)" class="delete-btn">Xóa</button>
            </div>
        </td>
    `;
}

async function deleteRow(btn) {
    const row = btn.closest('tr');
    
    // Kiểm tra xem hàng có dữ liệu không
    const itemName = row.querySelector('.item-name').value.trim();
    const dimension = row.querySelector('.dimension').value.trim();
    const quantity = row.querySelector('.quantity').value.trim();
    const unitPrice = row.querySelector('.unit-price').value.trim();
    
    const hasData = itemName || dimension || quantity || unitPrice;
    
    // Nếu có dữ liệu, yêu cầu xác nhận
    if (hasData) {
        const confirmed = await showConfirm('Bạn có chắc muốn xóa hàng này?');
        if (!confirmed) {
            return;
        }
    }
    
    row.remove();
    updateRowNumbers();
    calculateGrandTotal();
}

function updateRowNumbers() {
    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
    rowCounter = rows.length;
}

function formatDimensionOnBlur(input) {
    const row = input.closest('tr');
    const quantityInput = row.querySelector('.quantity');
    let dimensionText = input.value.trim();
    
    if (!dimensionText) {
        return;
    }
    
    // Tự động format dimension input (120 x 90 → 1m20 x 90cm)
    dimensionText = autoFormatDimension(dimensionText);
    input.value = dimensionText;
    
    // Tính toán số lượng
    calculateFromDimension(input);
}

function calculateFromDimension(input) {
    const row = input.closest('tr');
    const quantityInput = row.querySelector('.quantity');
    const dimensionText = input.value.trim();
    
    if (!dimensionText) {
        return;
    }
    
    let result = 0;
    
    // Tách và xử lý biểu thức
    if (dimensionText.toLowerCase().includes('x')) {
        // Phép nhân - tính diện tích (m²)
        const parts = dimensionText.toLowerCase().split('x').map(p => p.trim());
        if (parts.length >= 2) {
            const num1 = parseDimensionToMeter(parts[0]); // Chuyển về mét
            const num2 = parseDimensionToMeter(parts[1]); // Chuyển về mét
            const area = num1 * num2; // Diện tích m²
            result = area * 100; // Chuyển thành "cm" để format (3.96 m² = 396)
            quantityInput.value = formatResultDimension(result);
        }
    } else if (dimensionText.includes('+')) {
        // Phép cộng
        const parts = dimensionText.split('+').map(p => p.trim());
        result = parts.reduce((sum, part) => sum + parseDimensionToCm(part), 0);
        quantityInput.value = formatResultDimension(result);
    } else {
        // Chỉ có một giá trị
        result = parseDimensionToCm(dimensionText);
        quantityInput.value = formatResultDimension(result);
    }
    
    calculateRow(quantityInput);
}

function autoFormatDimension(text) {
    // Tự động format: 309,8 x 295,6 → 3m09,8 x 2m95,6
    // Xử lý cả phép nhân và phép cộng
    
    // Kiểm tra xem đã có format m hoặc cm chưa
    const hasUnit = /\d+m[\d,]+|\d+cm/i.test(text);
    if (hasUnit) {
        return text;
    }
    
    // Tách theo dấu x hoặc +
    let operator = '';
    let parts = [];
    
    if (/\s*x\s*/i.test(text)) {
        operator = 'x';
        parts = text.split(/\s*x\s*/i).map(p => p.trim());
    } else if (text.includes('+')) {
        operator = '+';
        parts = text.split('+').map(p => p.trim());
    } else {
        parts = [text.trim()];
    }
    
    // Format từng phần
    const formattedParts = parts.map(part => {
        // Loại bỏ tất cả ký tự không phải số, dấu phẩy
        const cleanPart = part.replace(/[^0-9,]/g, '');
        
        // Tách phần nguyên và phần thập phân
        const hasDecimal = cleanPart.includes(',');
        let integerPart, decimalPart;
        
        if (hasDecimal) {
            [integerPart, decimalPart] = cleanPart.split(',');
        } else {
            integerPart = cleanPart;
            decimalPart = '';
        }
        
        const num = parseInt(integerPart);
        
        if (isNaN(num) || num === 0) return part;
        
        if (num >= 100) {
            // Chuyển thành format mXX (vd: 309 → 3m09, 309,8 → 3m09,8)
            const meters = Math.floor(num / 100);
            const remainder = num % 100;
            const formattedRemainder = remainder.toString().padStart(2, '0');
            
            if (decimalPart) {
                return `${meters}m${formattedRemainder},${decimalPart}`;
            } else {
                return `${meters}m${formattedRemainder}`;
            }
        } else {
            // Giữ nguyên và thêm cm (vd: 90 → 90cm, 90,5 → 90,5cm)
            if (decimalPart) {
                return `${num},${decimalPart}cm`;
            } else {
                return `${num}cm`;
            }
        }
    });
    
    // Ghép lại với operator
    if (operator) {
        return formattedParts.join(` ${operator} `);
    } else {
        return formattedParts[0];
    }
}

function parseDimensionToCm(text) {
    // Parse "1m20", "90cm", "3m09.8" về cm
    text = text.toLowerCase().trim();
    
    if (text.includes('m') && !text.includes('cm')) {
        // Format: 1m20, 3m09.8, 3m30
        const parts = text.split('m');
        const meters = parseFloat(parts[0]) || 0;
        const cms = parseFloat(parts[1]) || 0;
        return meters * 100 + cms;
    } else if (text.includes('cm')) {
        // Format: 90cm
        return parseFloat(text.replace('cm', '')) || 0;
    } else {
        // Số thuần
        return parseFloat(text) || 0;
    }
}

function parseDimensionToMeter(text) {
    // Parse về mét để tính diện tích
    // Hỗ trợ: 3m09,8 -> 3.098, 2m95,6 -> 2.956
    text = text.toLowerCase().trim();
    
    if (text.includes('m') && !text.includes('cm')) {
        // Format: 1m20, 3m30, 3m09,8
        const parts = text.split('m');
        const meters = parseFloat(parts[0].replace(',', '.')) || 0;
        const cmsText = parts[1] ? parts[1].replace(',', '.') : '0';
        const cms = parseFloat(cmsText) || 0;
        return meters + (cms / 100);
    } else if (text.includes('cm')) {
        // Format: 90cm, 90,5cm
        const cm = parseFloat(text.replace('cm', '').replace(',', '.')) || 0;
        return cm / 100;
    } else {
        // Số thuần, giả sử là cm
        return parseFloat(text.replace(',', '.')) / 100 || 0;
    }
}

function formatResultDimension(num) {
    // Format kết quả: 915.348 → 9m15,348, 89 → 89cm
    // KHÔNG làm tròn, giữ nguyên độ chính xác
    
    if (num >= 100) {
        const meters = Math.floor(num / 100);
        const remainder = num % 100;
        
        // Kiểm tra có phần thập phân không
        if (remainder % 1 !== 0) {
            // Có phần thập phân - giữ nguyên độ chính xác
            const remainderStr = remainder.toString().replace('.', ',');
            return `${meters}m${remainderStr}`;
        } else {
            // Không có phần thập phân
            return `${meters}m${Math.floor(remainder).toString().padStart(2, '0')}`;
        }
    } else {
        // Nhỏ hơn 100
        if (num % 1 !== 0) {
            // Có phần thập phân
            return `${num.toString().replace('.', ',')}cm`;
        } else {
            // Không có phần thập phân
            return `${Math.floor(num)}cm`;
        }
    }
}

function formatAndCalculate(input) {
    let value = input.value.replace(/[^0-9]/g, ''); // Chỉ giữ số
    if (value) {
        // Format với dấu chấm ngăn cách hàng nghìn
        input.value = parseInt(value).toLocaleString('de-DE');
    }
    calculateRow(input);
}

function calculateRow(input) {
    const row = input.closest('tr');
    const quantityInput = row.querySelector('.quantity');
    const unitPriceInput = row.querySelector('.unit-price');
    const lineTotalCell = row.querySelector('.line-total');

    let quantity = 0;
    const quantityText = quantityInput.value.trim();
    
    // Try to extract number from quantity (handles formats like "9m1.5.7", "16 con", etc.)
    const numberMatch = quantityText.match(/[\d.]+/);
    if (numberMatch) {
        quantity = parseFloat(numberMatch[0]);
    }

    // Parse unit price - remove dots and convert to number
    let unitPrice = parseFloat(unitPriceInput.value.replace(/\./g, '')) || 0;
    if (unitPrice < 0) {
        unitPrice = 0;
        unitPriceInput.value = '0';
    }
    
    const lineTotal = quantity * unitPrice;

    lineTotalCell.textContent = formatNumber(lineTotal);
    calculateGrandTotal();
}

function calculateGrandTotal() {
    let total = 0;
    const lineTotals = document.querySelectorAll('.line-total');
    
    lineTotals.forEach(cell => {
        const value = parseFloat(cell.textContent.replace(/[,.]/g, '')) || 0;
        total += value;
    });

    document.getElementById('grandTotal').textContent = formatNumber(total);
}

function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(num));
}

function printTable() {
    window.print();
}

async function clearTable() {
    const confirmed = await showConfirm('Bạn có chắc muốn xóa tất cả dữ liệu?');
    if (confirmed) {
        document.getElementById('tableBody').innerHTML = '';
        rowCounter = 0;
        calculateGrandTotal();
    }
}

function showHelp() {
    document.getElementById('helpModal').style.display = 'block';
}

function closeHelp() {
    document.getElementById('helpModal').style.display = 'none';
}

// Đóng modal khi click bên ngoài
window.onclick = function(event) {
    const modal = document.getElementById('helpModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Custom Confirm Dialog
let confirmCallback = null;

function showConfirm(message) {
    return new Promise((resolve) => {
        confirmCallback = resolve;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
    });
}

function confirmAction(result) {
    document.getElementById('confirmModal').style.display = 'none';
    if (confirmCallback) {
        confirmCallback(result);
        confirmCallback = null;
    }
}

let rowCounter = 0;

// Make table columns resizable
function makeColumnsResizable() {
    const table = document.getElementById('priceTable');
    const headers = table.querySelectorAll('thead th');
    
    headers.forEach((header, index) => {
        // Skip last column (actions)
        if (header.classList.contains('no-print')) return;
        
        const resizer = document.createElement('div');
        resizer.className = 'column-resizer';
        header.style.position = 'relative';
        header.appendChild(resizer);
        
        let startX, startWidth, nextHeader, nextWidth;
        
        resizer.addEventListener('mousedown', function(e) {
            e.preventDefault();
            startX = e.pageX;
            startWidth = header.offsetWidth;
            
            // Get next column (skip no-print columns)
            nextHeader = header.nextElementSibling;
            while (nextHeader && nextHeader.classList.contains('no-print')) {
                nextHeader = nextHeader.nextElementSibling;
            }
            
            if (nextHeader) {
                nextWidth = nextHeader.offsetWidth;
            }
            
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
            
            resizer.classList.add('resizing');
        });
        
        function resize(e) {
            const diff = e.pageX - startX;
            const newWidth = startWidth + diff;
            
            if (newWidth > 50 && nextHeader) {
                const newNextWidth = nextWidth - diff;
                
                if (newNextWidth > 50) {
                    header.style.width = newWidth + 'px';
                    nextHeader.style.width = newNextWidth + 'px';
                    
                    // Save to localStorage
                    localStorage.setItem(`column_${index}_width`, newWidth);
                    
                    // Find next column index
                    const nextIndex = Array.from(headers).indexOf(nextHeader);
                    if (nextIndex !== -1) {
                        localStorage.setItem(`column_${nextIndex}_width`, newNextWidth);
                    }
                }
            }
        }
        
        function stopResize() {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            resizer.classList.remove('resizing');
        }
    });
    
    // Load saved column widths
    headers.forEach((header, index) => {
        const columnKey = `column_${index}_width`;
        const savedWidth = localStorage.getItem(columnKey);
        if (savedWidth) {
            header.style.width = savedWidth + 'px';
        }
    });
}

// Make columns resizable from tbody cells
function makeColumnsResizableInBody() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const headers = document.querySelectorAll('thead th');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td:not(.no-print)');
        
        cells.forEach((cell, cellIndex) => {
            // Check if resizer already exists
            if (cell.querySelector('.column-resizer')) return;
            
            const resizer = document.createElement('div');
            resizer.className = 'column-resizer';
            cell.appendChild(resizer);
            
            let startX, startWidth, nextCell, nextWidth, currentHeader, nextHeader;
            
            resizer.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                startX = e.pageX;
                
                // Find current and next header
                const allCells = Array.from(row.querySelectorAll('td'));
                const actualIndex = allCells.indexOf(cell);
                currentHeader = headers[actualIndex];
                
                startWidth = currentHeader ? currentHeader.offsetWidth : cell.offsetWidth;
                
                // Get next cell and header
                nextCell = cell.nextElementSibling;
                while (nextCell && nextCell.classList.contains('no-print')) {
                    nextCell = nextCell.nextElementSibling;
                }
                
                if (nextCell) {
                    const nextIndex = allCells.indexOf(nextCell);
                    nextHeader = headers[nextIndex];
                    nextWidth = nextHeader ? nextHeader.offsetWidth : nextCell.offsetWidth;
                }
                
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
                
                resizer.classList.add('resizing');
            });
            
            function resize(e) {
                const diff = e.pageX - startX;
                const newWidth = startWidth + diff;
                
                if (newWidth > 50 && nextHeader) {
                    const newNextWidth = nextWidth - diff;
                    
                    if (newNextWidth > 50) {
                        if (currentHeader) {
                            currentHeader.style.width = newWidth + 'px';
                            nextHeader.style.width = newNextWidth + 'px';
                            
                            // Save to localStorage
                            const currentIndex = Array.from(headers).indexOf(currentHeader);
                            const nextIndex = Array.from(headers).indexOf(nextHeader);
                            
                            if (currentIndex !== -1) {
                                localStorage.setItem(`column_${currentIndex}_width`, newWidth);
                            }
                            if (nextIndex !== -1) {
                                localStorage.setItem(`column_${nextIndex}_width`, newNextWidth);
                            }
                        }
                    }
                }
            }
            
            function stopResize() {
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
                resizer.classList.remove('resizing');
            }
        });
    });
}

// Make table rows resizable
function makeRowsResizable() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td:not(.no-print)');
        
        cells.forEach(cell => {
            // Check if resizer already exists
            if (cell.querySelector('.row-resizer')) return;
            
            const resizer = document.createElement('div');
            resizer.className = 'row-resizer';
            cell.style.position = 'relative';
            cell.appendChild(resizer);
            
            let startY, startHeight;
            
            resizer.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                startY = e.pageY;
                startHeight = row.offsetHeight;
                
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
                
                resizer.classList.add('resizing');
            });
            
            function resize(e) {
                const height = startHeight + (e.pageY - startY);
                if (height > 30) { // Minimum height
                    row.style.height = height + 'px';
                    
                    // Apply height to all cells in the row
                    const allCells = row.querySelectorAll('td');
                    allCells.forEach(c => {
                        c.style.height = height + 'px';
                    });
                    
                    // Save to localStorage
                    const rowKey = `row_${rowIndex}_height`;
                    localStorage.setItem(rowKey, height);
                }
            }
            
            function stopResize() {
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
                resizer.classList.remove('resizing');
            }
        });
    });
    
    // Load saved row heights
    rows.forEach((row, rowIndex) => {
        const rowKey = `row_${rowIndex}_height`;
        const savedHeight = localStorage.getItem(rowKey);
        if (savedHeight) {
            row.style.height = savedHeight + 'px';
            const cells = row.querySelectorAll('td');
            cells.forEach(cell => {
                cell.style.height = savedHeight + 'px';
            });
        }
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    makeColumnsResizable();
    makeRowsResizable();
    makeColumnsResizableInBody();
});

function addRow() {
    rowCounter++;
    const tbody = document.getElementById('tableBody');
    const row = tbody.insertRow();
    
    row.innerHTML = `
        <td>${rowCounter}</td>
        <td><textarea class="item-name" placeholder="Nhập tên hàng" rows="1"></textarea></td>
        <td><input type="text" class="dimension" placeholder="VD: 330 x 120" onblur="formatDimensionOnBlur(this)"></td>
        <td><input type="text" class="quantity" placeholder="Tự động hoặc nhập thủ công" oninput="calculateRow(this)"></td>
        <td><input type="text" class="unit-price" placeholder="0" onblur="formatAndCalculate(this)" required></td>
        <td class="line-total">0</td>
        <td class="no-print">
            <div class="row-actions">
                <div class="tooltip">
                    <button onclick="deleteRow(this)" class="delete-btn icon-btn">Xóa</button>
                    <span class="tooltiptext">Xóa dòng</span>
                </div>
            </div>
        </td>
    `;
    
    // Make the new row resizable
    makeRowsResizable();
    makeColumnsResizableInBody();
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
    // Format kết quả: 915.348 → 9m15,3, 89 → 89cm
    // Cắt bỏ phần thập phân sau chữ số thứ nhất (không làm tròn)
    
    if (num >= 100) {
        const meters = Math.floor(num / 100);
        const remainder = num % 100;
        
        // Kiểm tra có phần thập phân không
        if (remainder % 1 !== 0) {
            // Có phần thập phân - cắt đến 1 chữ số (không làm tròn)
            const truncatedRemainder = Math.floor(remainder * 10) / 10;
            const intPart = Math.floor(truncatedRemainder);
            const decimalPart = truncatedRemainder - intPart;
            
            if (decimalPart > 0) {
                // Có phần thập phân sau khi cắt
                const remainderStr = truncatedRemainder.toString().replace('.', ',');
                const paddedInt = intPart.toString().padStart(2, '0');
                const decimal = remainderStr.split(',')[1] || '';
                return `${meters}m${paddedInt},${decimal}`;
            } else {
                // Không có phần thập phân sau khi cắt
                return `${meters}m${intPart.toString().padStart(2, '0')}`;
            }
        } else {
            // Không có phần thập phân
            return `${meters}m${Math.floor(remainder).toString().padStart(2, '0')}`;
        }
    } else {
        // Nhỏ hơn 100
        if (num % 1 !== 0) {
            // Có phần thập phân - cắt đến 1 chữ số (không làm tròn)
            const truncated = Math.floor(num * 10) / 10;
            return `${truncated.toString().replace('.', ',')}cm`;
        } else {
            // Không có phần thập phân
            return `${Math.floor(num)}cm`;
        }
    }
}

function formatAndCalculate(input) {
    let value = input.value.replace(/\./g, '').replace(/[^0-9]/g, ''); // Xóa dấu chấm cũ và giữ số
    if (value) {
        // Nếu số có 4 chữ số trở xuống, tự động nhân 1000
        // VD: 1200 → 1200000, 500 → 500000
        let numValue = parseInt(value);
        if (numValue > 0 && numValue < 10000) {
            numValue = numValue * 1000;
        }
        // Format với dấu chấm ngăn cách hàng nghìn
        input.value = numValue.toLocaleString('de-DE');
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
    
    // Parse quantity - handle formats like "9m40" (9.4), "3m96,5" (3.965), "89cm" (0.89), etc.
    if (quantityText.toLowerCase().includes('m') && !quantityText.toLowerCase().includes('cm')) {
        // Format: 9m40 -> 9.4, 3m96,5 -> 3.965
        const parts = quantityText.toLowerCase().split('m');
        const meters = parseFloat(parts[0].replace(',', '.')) || 0;
        const cmsText = parts[1] ? parts[1].replace(',', '.') : '0';
        const cms = parseFloat(cmsText) || 0;
        quantity = meters + (cms / 100);
    } else if (quantityText.toLowerCase().includes('cm')) {
        // Format: 89cm -> 0.89
        const cm = parseFloat(quantityText.toLowerCase().replace('cm', '').replace(',', '.')) || 0;
        quantity = cm / 100;
    } else {
        // Plain number or other format
        const numberMatch = quantityText.match(/[\d.,]+/);
        if (numberMatch) {
            quantity = parseFloat(numberMatch[0].replace(',', '.'));
        }
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

// ===== PDF EXPORT FUNCTION =====
let pdfOrientationCallback = null;

function exportToPDF() {
    document.getElementById('pdfOrientationModal').style.display = 'block';
}

function confirmPDFOrientation(orientation) {
    document.getElementById('pdfOrientationModal').style.display = 'none';
    
    const customerName = document.getElementById('customerName').value || 'KhachHang';
    const fileName = `BKL_${customerName}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.pdf`;
    
    const element = document.querySelector('.container');
    
    // Save and remove all placeholders
    const placeholderMap = new Map();
    const allInputs = element.querySelectorAll('input, textarea');
    allInputs.forEach(input => {
        if (input.placeholder) {
            placeholderMap.set(input, input.placeholder);
            input.placeholder = '';
        }
    });
    
    // Temporarily hide borders for PDF export
    const style = document.createElement('style');
    style.id = 'pdf-export-style';
    style.innerHTML = `
        .editable-header input, #customerName, table input {
            border: none !important;
            background: transparent !important;
            outline: none !important;
            box-shadow: none !important;
        }
        .row-actions {
            display: none !important;
        }
        th.no-print, td.no-print {
            display: none !important;
        }
        tfoot {
            display: table-footer-group !important;
        }
        .total-row {
            display: table-row !important;
            visibility: visible !important;
            page-break-inside: avoid !important;
        }
        #grandTotal {
            display: table-cell !important;
            visibility: visible !important;
        }
        .container {
            width: 100% !important;
        }
        table {
            width: 100% !important;
            table-layout: auto !important;
        }
    `;
    document.head.appendChild(style);
    
    const opt = {
        margin: [3, 3, 3, 3],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: orientation === 'portrait' ? 1.0 : 2,
            useCORS: true,
            windowWidth: 1000,
            width: 1000,
            height: orientation === 'portrait' ? 2000 : undefined,
            logging: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: orientation === 'portrait' ? [210, 350] : 'a4',
            orientation: orientation,
            compress: true
        },
        pagebreak: { mode: 'avoid-all' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        // Restore placeholders
        placeholderMap.forEach((placeholder, input) => {
            input.placeholder = placeholder;
        });
        
        // Remove temporary style after export
        const tempStyle = document.getElementById('pdf-export-style');
        if (tempStyle) tempStyle.remove();
    });
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

// ===== FAB MENU TOGGLE =====
function toggleFabMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    const fabBtn = document.getElementById('fabBtn');
    const fabMenu = document.getElementById('fabMenu');
    fabBtn.classList.toggle('active');
    fabMenu.classList.toggle('active');
}

// ===== TOGGLE EDIT TABLE MODE FOR MOBILE =====
let isEditModeActive = false;
function toggleEditMode() {
    isEditModeActive = !isEditModeActive;
    const table = document.getElementById('priceTable');
    
    if (isEditModeActive) {
        table.classList.add('edit-mode-active');
        addEditModeButtons();
    } else {
        table.classList.remove('edit-mode-active');
        removeEditModeButtons();
    }
}

function addEditModeButtons() {
    // Add column edit buttons to headers
    const headers = document.querySelectorAll('#priceTable thead th');
    headers.forEach((th, index) => {
        if (th.classList.contains('no-print')) return;
        
        const editBtn = document.createElement('div');
        editBtn.className = 'column-edit-btn';
        editBtn.innerHTML = '<span class="edit-btn-control" onclick="adjustColumnWidth(' + index + ', 20)">+</span><span class="edit-btn-control" onclick="adjustColumnWidth(' + index + ', -20)">−</span>';
        th.style.position = 'relative';
        th.appendChild(editBtn);
    });
    
    // Add row edit buttons to first cell of each row
    const rows = document.querySelectorAll('#priceTable tbody tr');
    rows.forEach((row, index) => {
        const firstCell = row.querySelector('td');
        if (firstCell) {
            const editBtn = document.createElement('div');
            editBtn.className = 'row-edit-btn';
            editBtn.innerHTML = '<span class="edit-btn-control" onclick="adjustRowHeight(' + index + ', 10)">+</span><span class="edit-btn-control" onclick="adjustRowHeight(' + index + ', -10)">−</span>';
            firstCell.style.position = 'relative';
            firstCell.appendChild(editBtn);
        }
    });
}

function removeEditModeButtons() {
    document.querySelectorAll('.column-edit-btn, .row-edit-btn').forEach(btn => btn.remove());
}

function adjustColumnWidth(columnIndex, delta) {
    const headers = document.querySelectorAll('#priceTable thead th');
    const th = headers[columnIndex];
    if (!th) return;
    
    const currentWidth = th.offsetWidth;
    const newWidth = Math.max(50, currentWidth + delta);
    th.style.width = newWidth + 'px';
    
    // Save to localStorage
    localStorage.setItem('column_' + columnIndex + '_width', newWidth);
}

function adjustRowHeight(rowIndex, delta) {
    const rows = document.querySelectorAll('#priceTable tbody tr');
    const row = rows[rowIndex];
    if (!row) return;
    
    const currentHeight = row.offsetHeight;
    const newHeight = Math.max(30, currentHeight + delta);
    row.style.height = newHeight + 'px';
    
    // Save to localStorage
    localStorage.setItem('row_' + rowIndex + '_height', newHeight);
}

// Close FAB menu when clicking outside
document.addEventListener('click', function(event) {
    const fabBtn = document.getElementById('fabBtn');
    const fabMenu = document.getElementById('fabMenu');
    
    if (fabBtn && fabMenu && fabMenu.classList.contains('active')) {
        if (!fabBtn.contains(event.target) && !fabMenu.contains(event.target)) {
            fabBtn.classList.remove('active');
            fabMenu.classList.remove('active');
        }
    }
});

// ===== EXCEL EXPORT/IMPORT FUNCTIONS =====
function exportToExcel() {
    // Thu thập dữ liệu từ header
    const companyName = document.getElementById('companyName').value;
    const companyTax = document.getElementById('companyTax').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const customerName = document.getElementById('customerName').value;
    
    // Thu thập dữ liệu từ bảng
    const rows = document.querySelectorAll('#tableBody tr');
    const data = [];
    
    // Header info
    data.push([companyName]);
    data.push([companyTax]);
    data.push([companyAddress]);
    data.push([companyPhone]);
    data.push(['Khách hàng:', customerName]);
    data.push([]);
    data.push(['BẢNG KHỐI LƯỢNG']);
    data.push([]);
    
    // Table headers
    data.push(['STT', 'Tên Hàng', 'Kích Thước', 'Số Lượng', 'Đơn Giá', 'Thành Tiền']);
    
    // Table rows
    rows.forEach((row, index) => {
        const itemName = row.querySelector('.item-name')?.value || '';
        const dimension = row.querySelector('.dimension')?.value || '';
        const quantity = row.querySelector('.quantity')?.value || '';
        const unitPrice = row.querySelector('.unit-price')?.value.replace(/\./g, '') || '0';
        const lineTotal = row.querySelector('.line-total')?.textContent.replace(/\./g, '') || '0';
        
        data.push([
            index + 1,
            itemName,
            dimension,
            quantity,
            parseInt(unitPrice),
            parseInt(lineTotal)
        ]);
    });
    
    // Grand total
    const grandTotal = document.getElementById('grandTotal').textContent.replace(/\./g, '');
    data.push([]);
    data.push(['', 'Tổng Cộng', '', '', '', parseInt(grandTotal)]);
    
    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
        {wch: 8},  // STT
        {wch: 30}, // Tên Hàng
        {wch: 20}, // Kích Thước
        {wch: 15}, // Số Lượng
        {wch: 15}, // Đơn Giá
        {wch: 15}  // Thành Tiền
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Khối Lượng');
    
    // Xuất file
    const fileName = `BKL_${customerName || 'KhachHang'}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

function loadFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
            
            // Tìm vị trí của header table (dòng chứa 'STT')
            let headerIndex = -1;
            for (let i = 0; i < jsonData.length; i++) {
                if (jsonData[i][0] === 'STT' || jsonData[i][0] === 'stt') {
                    headerIndex = i;
                    break;
                }
            }
            
            // Xóa tất cả các hàng hiện tại
            document.getElementById('tableBody').innerHTML = '';
            rowCounter = 0;
            
            // Load thông tin header (các dòng trước table) nếu có
            if (jsonData.length > 0) {
                if (jsonData[0] && jsonData[0][0]) {
                    document.getElementById('companyName').value = jsonData[0][0] || '';
                }
                if (jsonData[1] && jsonData[1][0]) {
                    document.getElementById('companyTax').value = jsonData[1][0] || '';
                }
                if (jsonData[2] && jsonData[2][0]) {
                    document.getElementById('companyAddress').value = jsonData[2][0] || '';
                }
                if (jsonData[3] && jsonData[3][0]) {
                    document.getElementById('companyPhone').value = jsonData[3][0] || '';
                }
                if (jsonData[4] && jsonData[4][1]) {
                    document.getElementById('customerName').value = jsonData[4][1] || '';
                }
            }
            
            let rowsLoaded = 0;
            
            // Load data vào bảng nếu tìm thấy header
            if (headerIndex !== -1) {
                for (let i = headerIndex + 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    
                    // Bỏ qua hàng trống hoặc hàng tổng cộng
                    if (!row[1] || row[1] === 'Tổng Cộng') break;
                    
                    addRow();
                    const tbody = document.getElementById('tableBody');
                    const lastRow = tbody.lastElementChild;
                    
                    // Fill data
                    if (lastRow) {
                        const itemName = lastRow.querySelector('.item-name');
                        const dimension = lastRow.querySelector('.dimension');
                        const quantity = lastRow.querySelector('.quantity');
                        const unitPrice = lastRow.querySelector('.unit-price');
                        
                        if (itemName) itemName.value = row[1] || '';
                        if (dimension) dimension.value = row[2] || '';
                        if (quantity) quantity.value = row[3] || '';
                        if (unitPrice && row[4]) {
                            // Load giá trực tiếp từ Excel mà không xử lý (đã là số đầy đủ)
                            const price = parseInt(row[4]) || 0;
                            unitPrice.value = price.toLocaleString('de-DE');
                            calculateRow(unitPrice);
                        }
                        rowsLoaded++;
                    }
                }
            }
            
            // Nếu không có hàng nào được load hoặc file trống, thêm 1 hàng trống để người dùng có thể nhập
            if (rowsLoaded === 0) {
                addRow();
            }
            
            calculateGrandTotal();
            
            if (headerIndex === -1) {
                alert('Không tìm thấy dữ liệu bảng trong file Excel!\nĐã tạo hàng trống để bạn có thể nhập liệu.');
            } else if (rowsLoaded === 0) {
                alert('File Excel không có dữ liệu hàng hóa!\nĐã tạo hàng trống để bạn có thể nhập liệu.');
            } else {
                alert(`Đã load ${rowsLoaded} hàng từ Excel thành công!\nBạn có thể tiếp tục chỉnh sửa hoặc thêm hàng mới.`);
            }
            
        } catch (error) {
            console.error('Lỗi khi đọc file Excel:', error);
            // Thêm 1 hàng trống khi có lỗi
            document.getElementById('tableBody').innerHTML = '';
            rowCounter = 0;
            addRow();
            alert('Lỗi khi đọc file Excel!\nĐã tạo hàng trống để bạn có thể nhập liệu thủ công.');
        }
        
        // Reset input file
        event.target.value = '';
    };
    
    reader.readAsArrayBuffer(file);
}

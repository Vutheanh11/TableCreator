let currentEditingRow = null;

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
        
        function initResize(e) {
            e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.pageX;
            startX = clientX;
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
            document.addEventListener('touchmove', resize, { passive: false });
            document.addEventListener('touchend', stopResize);
            
            resizer.classList.add('resizing');
        }
        
        resizer.addEventListener('mousedown', initResize);
        resizer.addEventListener('touchstart', initResize, { passive: false });
        
        function resize(e) {
            e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.pageX;
            const diff = clientX - startX;
            const newWidth = startWidth + diff;
            
            if (newWidth > 50 && nextHeader) {
                const newNextWidth = nextWidth - diff;
                
                if (newNextWidth > 50) {
                    header.style.width = newWidth + 'px';
                    nextHeader.style.width = newNextWidth + 'px';
                    
                    // Save to localStorage
                    localStorage.setItem(`bbg_column_${index}_width`, newWidth);
                    
                    // Find next column index
                    const nextIndex = Array.from(headers).indexOf(nextHeader);
                    if (nextIndex !== -1) {
                        localStorage.setItem(`bbg_column_${nextIndex}_width`, newNextWidth);
                    }
                }
            }
        }
        
        function stopResize() {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchmove', resize);
            document.removeEventListener('touchend', stopResize);
            resizer.classList.remove('resizing');
        }
    });
    
    // Load saved column widths
    headers.forEach((header, index) => {
        const columnKey = `bbg_column_${index}_width`;
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
            
            function initResize(e) {
                e.preventDefault();
                e.stopPropagation();
                const clientX = e.touches ? e.touches[0].clientX : e.pageX;
                startX = clientX;
                
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
                document.addEventListener('touchmove', resize, { passive: false });
                document.addEventListener('touchend', stopResize);
                
                resizer.classList.add('resizing');
            }
            
            resizer.addEventListener('mousedown', initResize);
            resizer.addEventListener('touchstart', initResize, { passive: false });
            
            function resize(e) {
                e.preventDefault();
                const clientX = e.touches ? e.touches[0].clientX : e.pageX;
                const diff = clientX - startX;
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
                                localStorage.setItem(`bbg_column_${currentIndex}_width`, newWidth);
                            }
                            if (nextIndex !== -1) {
                                localStorage.setItem(`bbg_column_${nextIndex}_width`, newNextWidth);
                            }
                        }
                    }
                }
            }
            
            function stopResize() {
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
                document.removeEventListener('touchmove', resize);
                document.removeEventListener('touchend', stopResize);
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
            
            function initResize(e) {
                e.preventDefault();
                e.stopPropagation();
                const clientY = e.touches ? e.touches[0].clientY : e.pageY;
                startY = clientY;
                startHeight = row.offsetHeight;
                
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
                document.addEventListener('touchmove', resize, { passive: false });
                document.addEventListener('touchend', stopResize);
                
                resizer.classList.add('resizing');
            }
            
            resizer.addEventListener('mousedown', initResize);
            resizer.addEventListener('touchstart', initResize, { passive: false });
            
            function resize(e) {
                e.preventDefault();
                const clientY = e.touches ? e.touches[0].clientY : e.pageY;
                const height = startHeight + (clientY - startY);
                if (height > 30) { // Minimum height
                    row.style.height = height + 'px';
                    
                    // Apply height to all cells in the row
                    const allCells = row.querySelectorAll('td');
                    allCells.forEach(c => {
                        c.style.height = height + 'px';
                    });
                    
                    // Save to localStorage
                    const rowKey = `bbg_row_${rowIndex}_height`;
                    localStorage.setItem(rowKey, height);
                }
            }
            
            function stopResize() {
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
                document.removeEventListener('touchmove', resize);
                document.removeEventListener('touchend', stopResize);
                resizer.classList.remove('resizing');
            }
        });
    });
    
    // Load saved row heights
    rows.forEach((row, rowIndex) => {
        const rowKey = `bbg_row_${rowIndex}_height`;
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

// Override addRow for Bảng Báo Giá
function addRow() {
    rowCounter++;
    const tbody = document.getElementById('tableBody');
    const row = tbody.insertRow();
    
    row.innerHTML = `
        <td>${rowCounter}</td>
        <td><textarea class="item-name" placeholder="Nhập tên hàng" rows="1"></textarea></td>
        <td><input type="text" class="unit-price" placeholder="0" onblur="formatPrice(this)"></td>
        <td class="no-print">
            <div class="row-actions">
                <div class="tooltip">
                    <button onclick="openUnitModal(this)" class="print-btn icon-btn">Sửa</button>
                    <span class="tooltiptext">Chỉnh sửa</span>
                </div>
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

function formatPrice(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    
    if (value) {
        let numValue = parseInt(value);
        
        if (numValue > 0 && numValue < 10000) {
            numValue = numValue * 1000;
        }
        
        const formatted = numValue.toLocaleString('de-DE');
        const currentValue = input.value;
        const unitMatch = currentValue.match(/\/(m²|cái|cây)$/);
        
        if (unitMatch) {
            input.value = formatted + '/' + unitMatch[1];
        } else {
            input.value = formatted;
        }
    }
}

function openUnitModal(btn) {
    currentEditingRow = btn.closest('tr');
    document.getElementById('unitModal').style.display = 'block';
}

function closeUnitModal() {
    document.getElementById('unitModal').style.display = 'none';
    currentEditingRow = null;
}

function selectUnit(unit) {
    if (!currentEditingRow) return;
    
    const priceInput = currentEditingRow.querySelector('.unit-price');
    let currentValue = priceInput.value;
    
    currentValue = currentValue.replace(/\/(m²|cái|cây)$/, '');
    
    if (currentValue) {
        priceInput.value = currentValue + unit;
    }
    
    closeUnitModal();
}

// deleteRow function for Bảng Báo Giá
function deleteRow(btn) {
    const row = btn.closest('tr');
    row.remove();
    updateRowNumbers();
}

function updateRowNumbers() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.getElementsByTagName('tr');
    rowCounter = 0;
    
    for (let i = 0; i < rows.length; i++) {
        rowCounter++;
        rows[i].cells[0].textContent = rowCounter;
    }
}

// Đóng modal khi click bên ngoài
window.addEventListener('click', function(event) {
    const unitModal = document.getElementById('unitModal');
    if (event.target === unitModal) {
        closeUnitModal();
    }
});

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
    } else {
        table.classList.remove('edit-mode-active');
    }
}

// ===== PDF EXPORT FUNCTION =====
function exportToPDF() {
    document.getElementById('pdfOrientationModal').style.display = 'block';
}

function confirmPDFOrientation(orientation) {
    document.getElementById('pdfOrientationModal').style.display = 'none';
    
    const customerName = document.getElementById('customerName').value || 'KhachHang';
    const fileName = `BBG_${customerName}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.pdf`;
    
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
    
    // Replace noteText input with span for PDF export
    const noteInput = document.getElementById('noteText');
    const noteValue = noteInput.value || '';
    const noteSpan = document.createElement('span');
    noteSpan.id = 'noteText-temp';
    noteSpan.textContent = noteValue;
    noteSpan.style.cssText = 'display: inline-block; color: #000; font-size: 14px;';
    noteInput.style.display = 'none';
    noteInput.parentNode.insertBefore(noteSpan, noteInput.nextSibling);
    
    // Temporarily hide borders for PDF export
    const style = document.createElement('style');
    style.id = 'pdf-export-style';
    style.innerHTML = `
        .editable-header input, #customerName, table input, table textarea {
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
    `;
    document.head.appendChild(style);
    
    const opt = {
        margin: [5, 5, 5, 5],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: orientation === 'portrait' ? 1.5 : 2,
            useCORS: true,
            windowWidth: orientation === 'portrait' ? 800 : 1200,
            height: orientation === 'portrait' ? 1400 : undefined
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: orientation,
            compress: true
        }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        // Restore placeholders
        placeholderMap.forEach((placeholder, input) => {
            input.placeholder = placeholder;
        });
        
        // Restore noteText input
        noteInput.style.display = '';
        const tempSpan = document.getElementById('noteText-temp');
        if (tempSpan) tempSpan.remove();
        
        // Remove temporary style after export
        const tempStyle = document.getElementById('pdf-export-style');
        if (tempStyle) tempStyle.remove();
    });
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

// Override exportToExcel for Bảng Báo Giá
function exportToExcel() {
    const companyName = document.getElementById('companyName').value;
    const companyTax = document.getElementById('companyTax').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const customerName = document.getElementById('customerName').value;
    const noteText = document.getElementById('noteText').value;

    const data = [
        [companyName],
        [companyTax],
        [companyAddress],
        [companyPhone],
        [],
        ['BẢNG BÁO GIÁ'],
        ['Kính gửi quý khách hàng: ' + customerName],
        [],
        ['STT', 'Tên Hàng', 'Đơn Giá']
    ];

    const tbody = document.getElementById('tableBody');
    const rows = tbody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const rowData = [
            cells[0].textContent,
            cells[1].querySelector('.item-name').value,
            cells[2].querySelector('.unit-price').value
        ];
        data.push(rowData);
    }

    if (noteText) {
        data.push([]);
        data.push(['*Chú ý: ' + noteText]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo Giá');

    const fileName = `BBG_${customerName || 'KhachHang'}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Override loadFromExcel for Bảng Báo Giá
function loadFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1});

        // Load company info from first 4 rows
        if (jsonData[0] && jsonData[0][0]) {
            document.getElementById('companyName').value = jsonData[0][0];
        }
        if (jsonData[1] && jsonData[1][0]) {
            document.getElementById('companyTax').value = jsonData[1][0];
        }
        if (jsonData[2] && jsonData[2][0]) {
            document.getElementById('companyAddress').value = jsonData[2][0];
        }
        if (jsonData[3] && jsonData[3][0]) {
            document.getElementById('companyPhone').value = jsonData[3][0];
        }

        // Load customer name
        for (let i = 0; i < jsonData.length; i++) {
            if (jsonData[i][0] && jsonData[i][0].toString().includes('Kính gửi quý khách hàng')) {
                const customerMatch = jsonData[i][0].toString().match(/Kính gửi quý khách hàng:\s*(.+)/);
                if (customerMatch) {
                    document.getElementById('customerName').value = customerMatch[1];
                }
                break;
            }
        }

        document.getElementById('tableBody').innerHTML = '';
        rowCounter = 0;

        let startRow = -1;
        for (let i = 0; i < jsonData.length; i++) {
            if (jsonData[i][0] === 'STT') {
                startRow = i + 1;
                break;
            }
        }

        if (startRow === -1) {
            alert('Không tìm thấy bảng dữ liệu hợp lệ!');
            addRow();
            return;
        }

        let hasData = false;
        for (let i = startRow; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0 || !row[0]) {
                continue;
            }
            
            if (row[0] && row[0].toString().includes('*Chú ý')) {
                const noteMatch = row[0].toString().match(/\*Chú ý:\s*(.+)/);
                if (noteMatch) {
                    document.getElementById('noteText').value = noteMatch[1];
                }
                break;
            }

            hasData = true;
            rowCounter++;
            const tbody = document.getElementById('tableBody');
            const newRow = tbody.insertRow();
            
            newRow.innerHTML = `
                <td>${rowCounter}</td>
                <td><input type="text" class="item-name" placeholder="Nhập tên hàng" value="${row[1] || ''}"></td>
                <td><input type="text" class="unit-price" placeholder="0" value="${row[2] || ''}" onblur="formatPrice(this)"></td>
                <td class="no-print">
                    <div class="row-actions">
                        <button onclick="openUnitModal(this)" class="print-btn" style="margin-right: 5px;">Edit</button>
                        <button onclick="deleteRow(this)" class="delete-btn">Xóa</button>
                    </div>
                </td>
            `;
        }

        if (!hasData) {
            addRow();
        }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
}


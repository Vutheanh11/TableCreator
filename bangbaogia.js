let currentEditingRow = null;

// Override addRow for Bảng Báo Giá
function addRow() {
    rowCounter++;
    const tbody = document.getElementById('tableBody');
    const row = tbody.insertRow();
    
    row.innerHTML = `
        <td>${rowCounter}</td>
        <td><input type="text" class="item-name" placeholder="Nhập tên hàng"></td>
        <td><input type="text" class="unit-price" placeholder="0" onblur="formatPrice(this)"></td>
        <td class="no-print">
            <div class="row-actions">
                <button onclick="openUnitModal(this)" class="print-btn" style="margin-right: 5px;">Edit</button>
                <button onclick="deleteRow(this)" class="delete-btn">Xóa</button>
            </div>
        </td>
    `;
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

// ===== PDF EXPORT FUNCTION =====
function exportToPDF() {
    const customerName = document.getElementById('customerName').value || 'KhachHang';
    const fileName = `BBG_${customerName}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.pdf`;
    
    const element = document.querySelector('.container');
    const opt = {
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
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


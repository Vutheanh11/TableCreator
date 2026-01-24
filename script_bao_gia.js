let selectedCell = null;

// Lắng nghe sự kiện click trong bảng để chọn ô
document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('table');
    table.addEventListener('click', function(e) {
        let cell = e.target.closest('td, th');
        if (!cell) return;
        
        if (selectedCell === cell) {
            selectedCell.classList.remove('selected-cell');
            selectedCell = null;
            return;
        }

        if (selectedCell) {
            selectedCell.classList.remove('selected-cell');
        }
        
        selectedCell = cell;
        selectedCell.classList.add('selected-cell');
    });

    // Add row initially if empty? Or just let it be.
});

function adjustSelectedRowHeight(amount) {
    if (!selectedCell) {
        alert('Vui lòng chọn một ô trong hàng muốn chỉnh!');
        return;
    }
    const row = selectedCell.parentElement;
    let currentH = parseFloat(window.getComputedStyle(selectedCell).height); 
    let newH = currentH + amount;
    if (newH < 5) newH = 5;
    
    Array.from(row.children).forEach(td => {
            td.style.height = newH + 'px';
    });
}

function deleteSelectedRow() {
    if (!selectedCell) {
        alert('Vui lòng chọn một ô trong hàng muốn xóa!');
        return;
    }
    const row = selectedCell.parentElement;
    if (row.parentElement.tagName === 'THEAD') {
        alert('Không thể xóa dòng tiêu đề!');
        return;
    }
    row.remove();
    selectedCell = null;
}

function adjustSelectedColWidth(amount) {
    if (!selectedCell) {
        alert('Vui lòng chọn một ô trong cột muốn chỉnh!');
        return;
    }
    const cellIndex = selectedCell.cellIndex;
    const table = selectedCell.closest('table');
    const th = table.querySelector('thead tr').children[cellIndex];
    
    if (th) {
        let currentW = parseFloat(window.getComputedStyle(th).width);
        let newW = currentW + amount;
        if (newW < 5) newW = 5;
        th.style.width = newW + 'px';
    }
}

function resetSelectedRowHeight() {
    if (!selectedCell) {
        alert('Vui lòng chọn một ô trong hàng muốn đặt lại!');
        return;
    }
    const row = selectedCell.parentElement;
    Array.from(row.children).forEach(td => {
        td.style.height = '50px';
    });
}

function resetSelectedColWidth() {
    if (!selectedCell) {
        alert('Vui lòng chọn một ô trong cột muốn đặt lại!');
        return;
    }
    const cellIndex = selectedCell.cellIndex;
    const table = selectedCell.closest('table');
    const th = table.querySelector('thead tr').children[cellIndex];
    if (th) {
        th.style.width = '';
    }
}

function addRow() {
    const tbody = document.querySelector('table tbody');
    const rowCount = tbody.querySelectorAll('tr').length;
    const newRow = document.createElement('tr');
    
    // Tạo 3 ô: STT, Tên Hàng, Đơn Giá
    const cells = [rowCount + 1, '', ''];
    
    cells.forEach((content, index) => {
        const td = document.createElement('td');
        if (index === 1) {
            td.className = 'text-left';
            td.setAttribute('data-placeholder', 'Nhập tên hàng...');
        }
        else if (index === 2) {
            td.className = 'text-center';
            td.setAttribute('data-placeholder', 'Nhập giá (VD: 1200 → 1.200.000)...');
            // Add onblur event for formatting
            td.onblur = function() { formatPrice(this); };
        }
        
        td.innerText = content;
        td.style.height = '50px'; 
        
        // Nếu đang ở chế độ sửa thì cho phép sửa, trừ cột STT (0)
        if (isEditMode && index !== 0) {
            td.contentEditable = "true";
        }
        
        newRow.appendChild(td);
    });
    
    tbody.appendChild(newRow);
}

let isEditMode = false;
function toggleEditMode() {
    isEditMode = !isEditMode;
    const btn = document.getElementById('editBtn');
    
    if (isEditMode) {
        btn.innerText = "Tắt sửa nội dung";
        btn.classList.add('active');
        
        document.querySelectorAll('.company-info, h1, .title-section, th').forEach(el => el.contentEditable = "true");
        // Customer name specifically
        document.querySelector('.customer-name').contentEditable = "true";

        document.querySelectorAll('td').forEach(td => {
            if (td.cellIndex !== 0) { // All columns editable except STT
                td.contentEditable = "true";
            }
        });
    } else {
        btn.innerText = "Bật sửa nội dung";
        btn.classList.remove('active');
        document.querySelectorAll('.company-info, h1, .title-section, th, td, .customer-name').forEach(el => el.contentEditable = "false");
    }
}

function togglePanel() {
    const panel = document.getElementById('mainControlPanel');
    panel.classList.toggle('collapsed');
}

function toggleRowColControls() {
    const controls = document.getElementById('rowColControls');
    if (controls.classList.contains('hidden')) {
        controls.classList.remove('hidden');
        controls.style.display = 'flex'; 
    } else {
        controls.classList.add('hidden');
        controls.style.display = 'none';
    }
}

function toggleUnitControl() {
    const controls = document.getElementById('unitControls');
    if (controls.classList.contains('hidden')) {
        controls.classList.remove('hidden');
        controls.style.display = 'flex'; 
    } else {
        controls.classList.add('hidden');
        controls.style.display = 'none';
    }
}

function formatPrice(cell) {
    if (!cell) return;
    let text = cell.innerText.trim();
    if (!text) return;

    // Check if there is an existing unit suffix
    let parts = text.split('/');
    let valuePart = parts[0];
    let unitPart = parts.length > 1 ? '/' + parts.slice(1).join('/') : '';

    // Remove non-digit characters from value
    let rawValue = valuePart.replace(/[^0-9]/g, '');
    
    if (rawValue === '') return;

    let num = parseInt(rawValue, 10);
    
    // Heuristic: If number is entered as shorthand (e.g. 1200), multiply by 1000.
    // Assuming entered values < 1,000,000 are shorthand for thousands 
    // unless the user intended a very small value. 
    // Given the example 1200 -> 1.200.000, we apply this rule.
    // Let's use a threshold. If val < 100,000, multiply by 1000.
    // If user enters 1.200.000 (1200000), it stays.
    if (num < 100000 && num > 0) {
        num = num * 1000;
    }

    // Format with dots (Vietnamese style) manually to ensure consistency
    let formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Restore unit if it existed or just update value
    cell.innerText = formatted + unitPart;
}

function addUnit(suffix) {
    if (!selectedCell) {
        alert('Vui lòng chọn ô đơn giá cần thêm đơn vị!');
        return;
    }
    // Check if selected cell is in Price column (index 2)
    if (selectedCell.cellIndex !== 2) {
        alert('Vui lòng chọn ô trong cột Đơn Giá!');
        return;
    }

    let text = selectedCell.innerText.trim();
    // If empty, just set suffix? No, usually follows number.
    
    // Remove existing suffix if any, or just append? 
    // User snippet: "1.200.000" -> "1.200.000/cm2". 
    // If it already has unit, replace it?
    // Let's try to replace existing unit if present (detected by /)
    
    let parts = text.split('/');
    let valuePart = parts[0];
    
    selectedCell.innerText = valuePart + suffix;
}

function printPage() {
    window.print();
}

// --- EXCEL EXPORT / IMPORT FUNCTIONS ---
function exportExcel() {
    // 1. Lấy thông tin Tên bảng và Khách hàng
    const titleVal = document.querySelector('h1').innerText.trim(); // BẢNG BÁO GIÁ
    const subtitleVal = document.querySelector('.subtitle').innerText.trim(); // Kính gửi...
    
    // 2. Chế biến tên file: BBG_Tên Khách hàng_Ngày Tháng Năm.xlsx
    // Lấy tên khách hàng từ subtitle (bỏ phần "Kính gửi...")
    let custName = subtitleVal.replace("Kính gửi quý khách hàng:", "").replace("Kính gửi:", "").trim();
    // Bỏ các ký tự dấu chấm, dấu _ thừa
    custName = custName.replace(/[._]/g, ' ').trim();
    if (custName === "" || custName.match(/^\.*$/)) custName = "KhachHang";
    
    // Format ngày tháng năm: ddMMyyyy
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}${month}${year}`;
    
    // Tạo tên file an toàn (bỏ ký tự đặc biệt)
    const safeCustName = custName.replace(/[^a-zA-Z0-9\s\u00C0-\u1EF9]/g, "").replace(/\s+/g, "_");
    const fileName = `BBG_${safeCustName}_${dateStr}.xlsx`;

    // 3. Tạo dữ liệu Excel
    // Tạo sheet thủ công để chèn thêm header bên trên bảng
    // Dòng 1: Tên bảng (H1)
    // Dòng 2: Tên khách hàng (H2)
    // Dòng 3: Trống
    // Dòng 4: Bắt đầu bảng (Header bảng)
    
    const ws = XLSX.utils.aoa_to_sheet([
        [titleVal],
        [subtitleVal],
        [''] // Dòng trống ngăn cách
    ]);
    
    // Append bảng HTML vào sheet, bắt đầu từ dòng 4 (A4)
    const table = document.querySelector("table");
    XLSX.utils.sheet_add_dom(ws, table, {origin: "A4"}); // A4 reference

    // (Optional) Merge cells cho tiêu đề đẹp hơn?
    // Giả sử bảng có 3 cột (STT, Tên Hàng, Đơn Giá) -> Merge A1:C1 và A2:C2
    if(!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({s:{r:0,c:0}, e:{r:0,c:2}}); // Merge Title (3 cols)
    ws['!merges'].push({s:{r:1,c:0}, e:{r:1,c:2}}); // Merge Subtitle (3 cols)

    // Căn giữa cho Tiêu đề (Style trong SheetJS bản community hạn chế, nhưng cứ để structure đúng là được)

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bảng Báo Giá");

    XLSX.writeFile(wb, fileName);
}

function importExcel(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        
        // Lấy sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Chuyển đổi sang JSON (mảng của các mảng)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
        
        // --- Logic: Tìm và điền Tên Khách Hàng ---
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i];
            if (!row || !row[0]) continue;
            
            const cellText = row[0].toString();
            if (cellText.toLowerCase().includes("kính gửi")) {
                let custName = "";
                if (cellText.includes(":")) {
                    custName = cellText.split(":")[1].trim();
                } else {
                    custName = cellText.replace(/kính gửi.*?(khách hàng)?/i, "").trim();
                }
                
                if (custName) {
                    const nameEl = document.querySelector('.customer-name');
                    if (nameEl) nameEl.innerText = custName;
                }
                break;
            }
        }

        // Tìm tbody để xóa và điền lại dữ liệu
        const tbody = document.querySelector('table tbody');
        
        // Tìm header row
        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row) continue;
            const rowStr = row.join(" ").toLowerCase();
            // Báo giá check 'stt' và 'tên hàng' hoặc 'đơn giá'
            if (rowStr.includes("stt") && (rowStr.includes("tên hàng") || rowStr.includes("tên"))) {
                headerRowIndex = i;
                break;
            }
        }
        
        let newRowsData = [];
        let startIndex = (headerRowIndex !== -1) ? headerRowIndex + 1 : 0;
        
        for (let i = startIndex; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Bỏ qua dòng trống
            if (!row || row.length === 0 || row.every(cell => !cell)) continue;
            
            const rowStr = row.join(" ").toLowerCase();
            
            // Bỏ qua dòng tổng cộng
            if (rowStr.includes("tổng cộng") || rowStr.includes("tong cong")) continue;
            
            // Extra check header repeat
            if (rowStr.includes("stt") && rowStr.includes("tên hàng")) continue;

            newRowsData.push(row);
        }
        
        if (newRowsData.length > 0) {
            tbody.innerHTML = '';
            
            newRowsData.forEach((row, rowIndex) => {
                const tr = document.createElement('tr');
                
                // Tạo 3 cột: STT(0), Tên Hàng(1), Đơn Giá(2)
                for (let i = 0; i < 3; i++) {
                    const td = document.createElement('td');
                    let cellContent = (row[i] !== undefined && row[i] !== null) ? row[i].toString() : "";
                    
                    // Format style
                    td.style.height = '50px';
                    if (i === 1) {
                         td.className = 'text-left';
                         td.setAttribute('data-placeholder', 'Nhập tên hàng...');
                    }
                    else if (i === 2) {
                        td.className = 'text-right';
                        td.setAttribute('data-placeholder', 'Nhập giá...');
                        // Re-bind format on blur
                        td.onblur = function() { formatPrice(this); };
                    }

                    if (i === 0 && !cellContent) cellContent = (rowIndex + 1).toString();
                    
                    td.innerText = cellContent;
                    
                    if (isEditMode && i !== 0) {
                        td.contentEditable = "true";
                    }
                    
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            });
            
            const btn = document.getElementById('excelInput');
            if(btn) btn.value = ""; 
            
            alert("Đã nhập dữ liệu từ Excel thành công!");
        } else {
            alert("Không tìm thấy dữ liệu hợp lệ trong file Excel!");
        }
        
        input.value = "";
    };
    reader.readAsArrayBuffer(file);
}

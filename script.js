let selectedCell = null;

// Lắng nghe sự kiện click trong bảng để chọn ô
document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('table');
    table.addEventListener('click', function(e) {
        // Tìm ô td gần nhất (nếu click vào chữ bên trong)
        let cell = e.target.closest('td, th');
        if (!cell) return;
        
        // Nếu click lại vào ô đang được chọn -> Hủy chọn
        if (selectedCell === cell) {
            selectedCell.classList.remove('selected-cell');
            selectedCell = null;
            return;
        }

        // Bỏ chọn ô cũ
        if (selectedCell) {
            selectedCell.classList.remove('selected-cell');
        }
        
        // Chọn ô mới
        selectedCell = cell;
        selectedCell.classList.add('selected-cell');
    });
});

function adjustSelectedRowHeight(amount) {
    if (!selectedCell) {
        alert('Vui lòng chọn một ô trong hàng muốn chỉnh!');
        return;
    }
    const row = selectedCell.parentElement;
    // Sử dụng getComputedStyle để lấy chiều cao content thực tế (không tính padding/border)
    // Tránh lỗi khi dùng offsetHeight (bao gồm padding) cộng thêm vào content height gây tăng kích thước dù đang giảm
    let currentH = parseFloat(window.getComputedStyle(selectedCell).height); 
    let newH = currentH + amount;
    if (newH < 5) newH = 5; // Giảm giới hạn tối thiểu xuống 5px
    
    // Set inline style cho tất cả các ô trong hàng đó để đảm bảo độ cao
    // (Mặc dù set tr height cũng được nhưng td ưu tiên hơn trong một số trường hợp)
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
    // Không cho xóa dòng tiêu đề
    if (row.parentElement.tagName === 'THEAD') {
        alert('Không thể xóa dòng tiêu đề!');
        return;
    }
    row.remove();
    selectedCell = null; // Reset selection
    updateGrandTotal(); // Cập nhật lại tổng cộng
}

function adjustSelectedColWidth(amount) {
    if (!selectedCell) {
        alert('Vui lòng chọn một ô trong cột muốn chỉnh!');
        return;
    }
    const cellIndex = selectedCell.cellIndex;
    const table = selectedCell.closest('table');
    
    // Tìm thẻ th tương ứng ở thead để chỉnh width chung cho cả cột
    const th = table.querySelector('thead tr').children[cellIndex];
    
    if (th) {
        // Tương tự, dùng getComputedStyle cho width
        let currentW = parseFloat(window.getComputedStyle(th).width);
        let newW = currentW + amount;
        if (newW < 5) newW = 5; // Giảm giới hạn tối thiểu xuống 5px
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
        td.style.height = '50px'; // Reset về 50px mặc định
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
        th.style.width = ''; // Xóa style width để quay về css class override (percentage)
    }
}

function addRow() {
    const tbody = document.querySelector('table tbody');
    const rowCount = tbody.querySelectorAll('tr').length; // Đếm lại số dòng thực tế
    const newRow = document.createElement('tr');
    
    // Tạo 6 ô trống tương ứng 6 cột
    const cells = [rowCount + 1, '', '', '', '', ''];
    
    cells.forEach((content, index) => {
        const td = document.createElement('td');
        if (index === 1) {
            td.className = 'text-left';
            td.setAttribute('data-placeholder', 'Nhập tên hàng...');
        }
        else if (index === 2) {
            td.setAttribute('data-placeholder', 'VD: 120x240');
        }
        else if (index === 3) {
            td.setAttribute('data-placeholder', 'Tự tính diện tích');
        }
        else if (index === 4) {
            td.className = 'text-right';
            td.setAttribute('data-placeholder', 'Nhập giá...');
        }
        else if (index === 5) {
            td.className = 'text-right';
            td.setAttribute('data-placeholder', 'Tự tính thành tiền');
        }
        else if (index >= 3) td.className = 'text-right';
        
        td.innerText = content;
        
        // Set default height or copy from previous row? 
        // Let's use CSS default unless set explicitly.
        td.style.height = '50px'; 
        
        // Nếu đang ở chế độ sửa thì cho phép sửa, trừ cột STT (0) và Thành tiền (5)
        if (isEditMode && index !== 0 && index !== 5) {
            td.contentEditable = "true";
        }
        
        newRow.appendChild(td);
    });
    
    tbody.appendChild(newRow);
}

function removeRow() {
    if (tbody.rows.length > 0) {
        tbody.deleteRow(-1);
        updateGrandTotal(); // Cập nhật lại tổng cộngh > 0) {
        tbody.deleteRow(-1);
    }
}

let isEditMode = false;
function toggleEditMode() {
    isEditMode = !isEditMode;
    const btn = document.getElementById('editBtn');
    
    if (isEditMode) {
        btn.innerText = "Tắt sửa nội dung";
        btn.classList.add('active');
        
        // Cho phép sửa các thành phần chung và tiêu đề bảng (chỉ sửa tên khách hàng, ko sửa label)
        document.querySelectorAll('.company-info, h1, .customer-name, th').forEach(el => el.contentEditable = "true");
        
        // Với các ô dữ liệu (td), loại trừ cột STT (index 0) và Thành tiền (index 5)
        document.querySelectorAll('td').forEach(td => {
            if (td.cellIndex !== 0 && td.cellIndex !== 5) {
                td.contentEditable = "true";
            }
        });
    } else {
        btn.innerText = "Bật sửa nội dung";
        btn.classList.remove('active');
        document.querySelectorAll('.company-info, h1, .customer-name, th, td').forEach(el => el.contentEditable = "false");
    }
}


function togglePanel() {
    const panel = document.getElementById('mainControlPanel');
    panel.classList.toggle('collapsed');
}

function toggleRowColControls() {
    const controls = document.getElementById('rowColControls');
    const btn = document.getElementById('btnRowCol');
    
    if (controls.classList.contains('hidden')) {
        controls.classList.remove('hidden');
        controls.style.display = 'flex'; 
        btn.classList.add('active');
    } else {
        controls.classList.add('hidden');
        controls.style.display = 'none';
        btn.classList.remove('active');
    }
}

function printPage() {
    window.print();
}

function exportPDF() {
    const originalElement = document.querySelector('.page');
    
    // Clone để xử lý layout cho PDF mà không ảnh hưởng giao diện hiện tại
    // Tuy nhiên html2pdf cần element nằm trong DOM để render css đúng?
    // Cách tốt nhất: Tạm thời add class "printing-mode" cho body/page, render xong remove.
    
    document.body.classList.add('pdf-exporting');
    
    // Cấu hình cho html2pdf
    // Margin: [Top, Left, Bottom, Right]
    // Top=10mm (1cm) theo yêu cầu. Left/Right=5mm để tận dụng tối đa chiều rộng A4.
    const opt = {
        margin:       [10, 5, 10, 5], 
        filename:     'Bang_Khoi_Luong.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: 'css' }
    };

    // Ẩn selection nếu có
    if (selectedCell) selectedCell.classList.remove('selected-cell');
    
    // Sử dụng promise để đảm bảo render xong mới reset class
    html2pdf().set(opt).from(originalElement).save().then(() => {
        document.body.classList.remove('pdf-exporting');
        if (selectedCell) selectedCell.classList.add('selected-cell'); // Restore selection visual setting (optional)
    }).catch((err) => {
        console.error(err);
        document.body.classList.remove('pdf-exporting');
    });
} // End exportPDF

// --- TỰ ĐỘNG FORMAT VÀ TÍNH TOÁN ---
document.addEventListener('focusout', function(e) {
    const cell = e.target;
    if (cell.tagName !== 'TD') return;

    const row = cell.parentElement;
    const cellIndex = cell.cellIndex;

    // Cột Kích Thước (Index 2)
    if (cellIndex === 2) {
        const rawText = cell.innerText.trim();
        if (!rawText) return;

        // Tách theo 'x', 'X', hoặc '*'
        let parts = rawText.split(/[xX*]/);
        if (parts.length === 2) {
            let wRaw = parts[0].trim().replace(',', '.');
            let hRaw = parts[1].trim().replace(',', '.');
            
            let wVal = parseFloat(wRaw);
            let hVal = parseFloat(hRaw);

            if (!isNaN(wVal) && !isNaN(hVal)) {
                // Format hiển thị
                let wFmt = formatDimension(wVal, wRaw);
                let hFmt = formatDimension(hVal, hRaw);
                cell.innerText = `${wFmt} x ${hFmt}`;

                // Tính diện tích
                // wVal, hVal đang là cm (theo giả định input)
                // Diện tích (m2) = (w * h) / 10000
                let area = (wVal * hVal) / 10000;
                
                // Cập nhật cột Diện Tích (Index 3)
                let areaCell = row.cells[3];
                if (areaCell) {
                    areaCell.innerText = area.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + " m2";
                    
                    // Trigger tính Thành Tiền luôn nếu đã có Đơn Giá
                    updateTotal(row);
                }
            }
        }
    }
    
    // Cột Đơn Giá (Index 4)
    if (cellIndex === 4) {
            let rawText = cell.innerText.trim().replace(/\./g, '').replace(/,/g, ''); // Xóa dấu chấm phân cách ngàn cũ nếu có
            let val = parseFloat(rawText);
            
            if (!isNaN(val)) {
                // Nếu nhập < 1000000, giả sử người dùng nhập nghìn đồng -> nhân 1000
                // Ví dụ: 1200 -> 1.200.000
                // Tuy nhiên cần cẩn thận nếu user sửa lại số lớn.
                // Logic đơn giản: Nếu số nhập vào < 100,000 (ví dụ đơn giá ko thể là 1200 đồng), thì nhân 1000.
                // Thường cửa nhôm kính > 1tr/m2.
                
                // Giả định cứng theo yêu cầu: "nhập 1200 -> 1.200.000"
                // Check if looks like a short number
                if (val < 100000) {
                    val = val * 1000;
                }

                cell.innerText = val.toLocaleString('vi-VN');
                updateTotal(row);
            }

    // Cột Thành Tiền (Index 5) - Cập nhật tổng nếu người dùng sửa trực tiếp
    if (cellIndex === 5) {
        // Format lại số tiền hiển thị cho đẹp, sau đó tính tổng
        let rawText = cell.innerText.trim().replace(/\./g, '').replace(/,/g, ''); 
        let val = parseFloat(rawText);
        if (!isNaN(val)) {
             cell.innerText = val.toLocaleString('vi-VN');
             updateGrandTotal();
        }
    }
    }
});

function formatDimension(val, rawStr) {
    // Giữ nguyên logic hiển thị dấu phẩy nếu số lẻ
    // Rule: >= 100 -> xmYY
    // Rule: < 100 -> YYcm
    
    if (val >= 100) {
        let m = Math.floor(val / 100);
        let cm = val % 100;
        // Xử lý số lẻ của cm, ví dụ 120.5 -> 1m20,5 ?? 
        // Yêu cầu: 330 -> 3m30. 120 -> 1m20.
        
        // Để đơn giản và đẹp:
        let cmStr = cm.toString();
        // Nếu cm là số nguyên và < 10, có cần thêm số 0 không?
        // Ví dụ 305 -> 3m5 hay 3m05? Thường là 3m05.
        if (Number.isInteger(cm) && cm < 10) cmStr = "0" + cm;
        
        // Nếu số lẻ, replace dot -> comma
        if (!Number.isInteger(cm)) {
                // 98.5 % 100 = 98.5 (nhưng logic này chỉ chạy khi >=100)
                // Ví dụ 150.5 -> 1m50.5
                cmStr = cm.toString().replace('.', ',');
                // Fix trường hợp .099999 due to float
                cmStr = parseFloat(cm.toFixed(2)).toString().replace('.', ',');
        }
        
        return `${m}m${cmStr}`;
    } else {
        // < 100 -> format 90,2cm
        let s = val.toString().replace('.', ',');
        return `${s}cm`;
    }
}

function updateTotal(row) {
    let areaCell = row.cells[3];
    let priceCell = row.cells[4];
    let totalCell = row.cells[5];

    if (!areaCell || !priceCell || !totalCell) return;

    // Parse Area: "1.68 m2" -> 1.68
    let areaText = areaCell.innerText.replace('m2', '').replace('m²', '').trim();
    // Đổi , thành . để parse
    let areaVal = parseFloat(areaText.replace(/\./g, '').replace(',', '.')); 

    // Parse Price: "1.200.000" -> 1200000
    let priceText = priceCell.innerText.trim().replace(/\./g, '');
    let priceVal = parseFloat(priceText);

    if (!isNaN(areaVal) && !isNaN(priceVal)) {
        let total = areaVal * priceVal;
        totalCell.innerText = total.toLocaleString('vi-VN');
        
        updateGrandTotal();
    }
}

function updateGrandTotal() {
    const tbody = document.querySelector('table tbody');
    let grandTotal = 0;
    
    Array.from(tbody.rows).forEach(row => {
            let cell = row.cells[5]; // Thành tiền
            if (cell) {
                let val = parseFloat(cell.innerText.replace(/\./g, ''));
                if (!isNaN(val)) grandTotal += val;
            }
    });
    
    // Tìm footer cell
    const tfootCell = document.querySelector('table tfoot tr td:last-child');
    if (tfootCell) {
        tfootCell.innerText = grandTotal.toLocaleString('vi-VN');
    }
}

// --- EXCEL EXPORT / IMPORT FUNCTIONS ---
function exportExcel() {
    // 1. Lấy thông tin Tên bảng và Khách hàng
    const titleVal = document.querySelector('h1').innerText.trim(); // BẢNG KHỐI LƯỢNG
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
    const fileName = `BKL_${safeCustName}_${dateStr}.xlsx`;

    // 3. Tạo dữ liệu Excel
    // Tạo sheet thủ công để chèn thêm header bên trên bảng
    // Dòng 1: Tên bảng (H1)
    // Dòng 2: Tên khách hàng (H2)
    // Dòng 3: Trống
    // Dòng 4: Bắt đầu bảng
    
    const ws = XLSX.utils.aoa_to_sheet([
        [titleVal],
        [subtitleVal],
        [''] // Dòng trống ngăn cách
    ]);
    
    // Append bảng HTML vào sheet, bắt đầu từ dòng 4 (A4)
    const table = document.querySelector("table");
    XLSX.utils.sheet_add_dom(ws, table, {origin: "A4"}); // A4 reference

    // (Optional) Merge cells cho tiêu đề đẹp hơn?
    // Giả sử bảng có 6 cột -> Merge A1:F1 và A2:F2
    if(!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({s:{r:0,c:0}, e:{r:0,c:5}}); // Merge Title
    ws['!merges'].push({s:{r:1,c:0}, e:{r:1,c:5}}); // Merge Subtitle

    // Căn giữa cho Tiêu đề (Style trong SheetJS bản community hạn chế, nhưng cứ để structure đúng là được)

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bảng Khối Lượng");

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

        // --- Logic mới: Tìm và điền Tên Khách Hàng ---
        // Quét 10 dòng đầu tiên để tìm chuỗi chứa "Kính gửi"
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i];
            if (!row || !row[0]) continue;
            
            const cellText = row[0].toString();
            // Kiểm tra từ khóa (case insensitive)
            if (cellText.toLowerCase().includes("kính gửi")) {
                // Tách lấy phần tên sau dấu hai chấm (nếu có)
                let custName = "";
                if (cellText.includes(":")) {
                    custName = cellText.split(":")[1].trim();
                } else {
                    // Nếu không có dấu :, thử replace cụm từ khóa
                    custName = cellText.replace(/kính gửi.*?(khách hàng)?/i, "").trim();
                }
                
                // Nếu lấy được tên (và không phải chuỗi rỗng hoàn toàn)
                if (custName) {
                    const nameEl = document.querySelector('.customer-name');
                    if (nameEl) nameEl.innerText = custName;
                }
                break; // Tìm thấy thì dừng
            }
        }
        // ---------------------------------------------
        
        // Tìm tbody để xóa và điền lại dữ liệu
        const tbody = document.querySelector('table tbody');
        
        // Logic lọc dữ liệu cải tiến:
        // 1. Tìm vị trí dòng tiêu đề (Header row)
        // 2. Chỉ lấy dữ liệu TỪ SAU dòng tiêu đề
        
        let headerRowIndex = -1;
        
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row) continue;
            const rowStr = row.join(" ").toLowerCase();
            // Nhận diện dòng tiêu đề qua các từ khóa
            if (rowStr.includes("stt") && (rowStr.includes("tên hàng") || rowStr.includes("ten hang"))) {
                headerRowIndex = i;
                break;
            }
        }
        
        let newRowsData = [];
        // Nếu tìm thấy header thì bắt đầu duyệt từ dòng kề sau
        // Nếu không (file raw), duyệt từ đầu (0)
        let startIndex = (headerRowIndex !== -1) ? headerRowIndex + 1 : 0;
        
        for (let i = startIndex; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Bỏ qua dòng trống
            if (!row || row.length === 0 || row.every(cell => !cell)) continue;
            
            const rowStr = row.join(" ").toLowerCase();
            
            // Bỏ qua dòng tổng cộng (thường ở cuối)
            if (rowStr.includes("tổng cộng") || rowStr.includes("tong cong")) continue;
            
            // Extra check: Nếu dòng này lại lặp lại header (do merge file?) -> bỏ qua
            if (rowStr.includes("stt") && (rowStr.includes("tên hàng") || rowStr.includes("ten hang"))) continue;

            newRowsData.push(row);
        }
        
        // Nếu có dữ liệu hợp lệ mới thì mới clear bảng cũ
        if (newRowsData.length > 0) {
            tbody.innerHTML = '';
            
            newRowsData.forEach((row, rowIndex) => {
                const tr = document.createElement('tr');
                
                // Đảm bảo tạo đủ 6 cột
                for (let i = 0; i < 6; i++) {
                    const td = document.createElement('td');
                    let cellContent = (row[i] !== undefined && row[i] !== null) ? row[i].toString() : "";
                    
                    // Format lại style giống addRow
                    td.style.height = '50px';
                    if (i === 1) {
                         td.className = 'text-left';
                         td.setAttribute('data-placeholder', 'Nhập tên hàng...');
                    }
                    else if (i === 2) {
                        td.setAttribute('data-placeholder', 'VD: 120x240');
                    }
                    else if (i >= 4) { // Đơn giá, Thành Tiền
                        td.className = 'text-right';
                        if (i === 4) td.setAttribute('data-placeholder', 'Nhập giá...');
                    } else if (i === 3) {
                        td.className = 'text-right';
                    }

                    // Riêng cột STT (i=0), nếu file excel không có hoặc sai, ta có thể tự đánh số lại
                    if (i === 0 && !cellContent) cellContent = (rowIndex + 1).toString();
                    
                    td.innerText = cellContent;
                    
                    // Nếu đang ở chế độ Edit Mode, phải set contentEditable
                    if (isEditMode) {
                        // Trừ cột 0 và 5
                        if (i !== 0 && i !== 5) td.contentEditable = "true";
                    }
                    
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            });
            
            updateGrandTotal();
            const btn = document.getElementById('excelInput');
            if(btn) btn.value = ""; // Reset input
            
            alert("Đã nhập dữ liệu từ Excel thành công!");
        } else {
            alert("Không tìm thấy dữ liệu hợp lệ trong file Excel!");
        }
        
        // Reset input để có thể chọn lại cùng file nếu muốn
        input.value = "";
    };
    reader.readAsArrayBuffer(file);
}

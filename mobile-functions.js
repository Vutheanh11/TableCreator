// Desktop Entry Form Functions
function formatDesktopDimension(input) {
    let dimensionText = input.value.trim();
    if (!dimensionText) return;
    
    // Auto-format dimension
    dimensionText = autoFormatDimension(dimensionText);
    input.value = dimensionText;
    
    // Calculate quantity from dimension
    const quantityInput = document.getElementById('desktopItemQuantity');
    if (!quantityInput.value.trim() || quantityInput.value === '0') {
        calculateDesktopQuantityFromDimension(dimensionText);
    }
    calculateDesktopTotal();
}

function calculateDesktopQuantityFromDimension(dimensionText) {
    const quantityInput = document.getElementById('desktopItemQuantity');
    if (!dimensionText) return;
    
    let result = 0;
    if (dimensionText.toLowerCase().includes('x')) {
        const parts = dimensionText.toLowerCase().split('x').map(p => p.trim());
        if (parts.length >= 2) {
            const num1 = parseDimensionToMeter(parts[0]);
            const num2 = parseDimensionToMeter(parts[1]);
            const area = num1 * num2;
            result = area * 100;
            quantityInput.value = formatResultDimension(result);
        }
    } else if (dimensionText.includes('+')) {
        const parts = dimensionText.split('+').map(p => p.trim());
        result = parts.reduce((sum, part) => sum + parseDimensionToCm(part), 0);
        quantityInput.value = formatResultDimension(result);
    } else {
        result = parseDimensionToCm(dimensionText);
        quantityInput.value = formatResultDimension(result);
    }
}

function handleDesktopQuantityInput(input) {
    const inputValue = input.value.trim();
    
    // Nếu là biểu thức tính toán (có dấu x hoặc +)
    if (inputValue.includes('x') || inputValue.includes('+')) {
        let result = 0;
        
        if (inputValue.toLowerCase().includes('x')) {
            // Phép nhân - tính diện tích
            const parts = inputValue.toLowerCase().split('x').map(p => p.trim());
            if (parts.length >= 2) {
                const num1 = parseDimensionToMeter(parts[0]);
                const num2 = parseDimensionToMeter(parts[1]);
                const area = num1 * num2;
                result = area * 100;
            }
        } else if (inputValue.includes('+')) {
            // Phép cộng
            const parts = inputValue.split('+').map(p => p.trim());
            result = parts.reduce((sum, part) => sum + parseDimensionToCm(part), 0);
        }
        
        // Format kết quả
        input.value = formatResultDimension(result);
    }
    
    // Tính tổng tiền
    calculateDesktopTotal();
}

function formatDesktopPrice(input) {
    let value = input.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    if (value) {
        let numValue = parseInt(value);
        if (numValue > 0 && numValue <= 9999) {
            numValue = numValue * 1000;
        }
        input.value = numValue.toLocaleString('de-DE');
    }
    calculateDesktopTotal();
    
    // Auto-submit when all fields are filled
    checkAndAutoSubmitDesktopForm();
}

function checkAndAutoSubmitDesktopForm() {
    const name = document.getElementById('desktopItemName').value.trim();
    const size = document.getElementById('desktopItemSize').value.trim();
    const quantity = document.getElementById('desktopItemQuantity').value.trim();
    const price = document.getElementById('desktopItemPrice').value.trim();
    
    // If all required fields are filled, auto-submit
    if (name && size && quantity && price) {
        setTimeout(() => {
            addDesktopEntry();
        }, 300); // Small delay to ensure calculations are complete
    }
}

function removeDesktopPriceFormat(input) {
    input.value = input.value.replace(/\./g, '');
}

function calculateDesktopTotal() {
    const quantityInput = document.getElementById('desktopItemQuantity');
    const priceInput = document.getElementById('desktopItemPrice');
    
    let quantity = 0;
    const quantityText = quantityInput.value.trim();
    
    if (quantityText.toLowerCase().includes('m') && !quantityText.toLowerCase().includes('cm')) {
        const parts = quantityText.toLowerCase().split('m');
        const meters = parseFloat(parts[0].replace(',', '.')) || 0;
        const cmsText = parts[1] ? parts[1].replace(',', '.') : '0';
        const cms = parseFloat(cmsText) || 0;
        quantity = meters + (cms / 100);
    } else if (quantityText.toLowerCase().includes('cm')) {
        const cm = parseFloat(quantityText.toLowerCase().replace('cm', '').replace(',', '.')) || 0;
        quantity = cm / 100;
    } else {
        const numberMatch = quantityText.match(/[\d.,]+/);
        if (numberMatch) {
            quantity = parseFloat(numberMatch[0].replace(',', '.'));
        }
    }
    
    const price = parseFloat(priceInput.value.replace(/\./g, '')) || 0;
    const total = quantity * price;
    document.getElementById('desktopItemTotal').textContent = total.toLocaleString('vi-VN');
}

function addDesktopEntry() {
    const name = document.getElementById('desktopItemName').value.trim();
    const size = document.getElementById('desktopItemSize').value.trim();
    const quantity = document.getElementById('desktopItemQuantity').value.trim();
    const price = document.getElementById('desktopItemPrice').value.replace(/\./g, '');
    
    // Add row to table
    addRow();
    const tbody = document.getElementById('tableBody');
    const lastRow = tbody.lastElementChild;
    
    if (lastRow) {
        const cells = lastRow.cells;
        
        if (cells[1] && cells[1].querySelector('textarea')) {
            cells[1].querySelector('textarea').value = name;
        }
        if (cells[2] && cells[2].querySelector('input')) {
            cells[2].querySelector('input').value = size;
        }
        if (cells[3] && cells[3].querySelector('input')) {
            cells[3].querySelector('input').value = quantity;
        }
        if (cells[4] && cells[4].querySelector('input')) {
            cells[4].querySelector('input').value = price;
        }
        
        // Trigger calculation for the row
        if (cells[3] && cells[3].querySelector('input')) {
            calculateRow(cells[3].querySelector('input'));
        }
    }
    
    // Clear form
    document.getElementById('desktopItemName').value = '';
    document.getElementById('desktopItemSize').value = '';
    document.getElementById('desktopItemQuantity').value = '';
    document.getElementById('desktopItemPrice').value = '';
    document.getElementById('desktopItemTotal').textContent = '0';
    
    // Focus back to name field
    document.getElementById('desktopItemName').focus();
    
    // Focus back to name field
    document.getElementById('desktopItemName').focus();
}

// Mobile Form Functions
function formatMobileNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value === '' || value === '0') {
        input.value = '0';
    } else {
        value = parseInt(value, 10).toString();
        input.value = value.replace(/(\d)(?=(\d{3})+$)/g, '$1.');
    }
    calculateMobileTotal();
}

function removeMobileFormat(input) {
    input.value = input.value.replace(/\./g, '');
}

function calculateMobileTotal() {
    const quantityInput = document.getElementById('mobileItemQuantity');
    const priceInput = document.getElementById('mobileItemPrice');
    
    // Parse quantity - handle formats like "9m40" (9.4), "3m96,5" (3.965), "89cm" (0.89)
    let quantity = 0;
    const quantityText = quantityInput.value.trim();
    
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
    
    const price = parseFloat(priceInput.value.replace(/\./g, '')) || 0;
    const total = quantity * price;
    document.getElementById('mobileItemTotal').textContent = total.toLocaleString('vi-VN');
}

// Format dimension on blur (same logic as desktop table)
function formatMobileDimensionOnBlur(input) {
    let dimensionText = input.value.trim();
    
    if (!dimensionText) {
        return;
    }
    
    // Auto-format dimension (120 x 90 → 1m20 x 90cm)
    dimensionText = autoFormatDimension(dimensionText);
    input.value = dimensionText;
    
    // Calculate quantity from dimension
    calculateMobileQuantityFromDimension(input);
}

function calculateMobileQuantityFromDimension(input) {
    const quantityInput = document.getElementById('mobileItemQuantity');
    const dimensionText = input.value.trim();
    
    if (!dimensionText) {
        return;
    }
    
    let result = 0;
    
    // Parse dimension expression
    if (dimensionText.toLowerCase().includes('x')) {
        // Multiplication - calculate area (m²)
        const parts = dimensionText.toLowerCase().split('x').map(p => p.trim());
        if (parts.length >= 2) {
            const num1 = parseDimensionToMeter(parts[0]);
            const num2 = parseDimensionToMeter(parts[1]);
            const area = num1 * num2;
            result = area * 100; // Convert to "cm" for formatting (3.96 m² = 396)
            quantityInput.value = formatResultDimension(result);
        }
    } else if (dimensionText.includes('+')) {
        // Addition
        const parts = dimensionText.split('+').map(p => p.trim());
        result = parts.reduce((sum, part) => sum + parseDimensionToCm(part), 0);
        quantityInput.value = formatResultDimension(result);
    } else {
        // Single value
        result = parseDimensionToCm(dimensionText);
        quantityInput.value = formatResultDimension(result);
    }
    
    calculateMobileTotal();
}

// Format price on blur (same as desktop: multiply by 1000 if < 10000)
function formatMobilePriceOnBlur(input) {
    let value = input.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    if (value) {
        let numValue = parseInt(value);
        // Multiply by 1000 if value is less than 10000
        // Example: 1200 => 1200000 => 1.200.000
        if (numValue > 0 && numValue <= 9999) {
            numValue = numValue * 1000;
        }
        // Format with dots as thousand separators
        input.value = numValue.toLocaleString('de-DE');
    }
    calculateMobileTotal();
}

function removeMobilePriceFormat(input) {
    input.value = input.value.replace(/\./g, '');
}

// Close form popup
function closeFormPopup() {
    const formContainer = document.getElementById('mobileFormContainer');
    const backdrop = document.getElementById('mobileFormBackdrop');
    const table = document.querySelector('.container table');
    const controls = document.querySelector('.calculation-controls');
    
    if (formContainer) formContainer.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
    if (table) table.style.display = 'table';
    if (controls) controls.style.display = 'flex';
    document.body.style.overflow = 'auto';
}

// Open form popup
function openFormPopup() {
    const formContainer = document.getElementById('mobileFormContainer');
    const backdrop = document.getElementById('mobileFormBackdrop');
    
    // Clear form for fresh start
    if (mobileEntries.length === 0) {
        clearMobileForm();
        currentMobileEntryIndex = -1;
        updateMobileEntryCounter();
    }
    
    if (formContainer) formContainer.style.display = 'block';
    if (backdrop) backdrop.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function updateMobileEntryCounter() {
    document.getElementById('currentEntryNumber').textContent = currentMobileEntryIndex + 2;
}

function saveMobileEntry() {
    const name = document.getElementById('mobileItemName').value.trim();
    const size = document.getElementById('mobileItemSize').value.trim();
    const quantity = document.getElementById('mobileItemQuantity').value.trim();
    const price = document.getElementById('mobileItemPrice').value.replace(/\./g, '');
    
    // Allow saving even with incomplete data
    const entry = {
        name: name,
        size: size,
        quantity: quantity,
        price: price
    };
    
    // Update existing entry or add new one based on current index
    if (currentMobileEntryIndex >= 0 && currentMobileEntryIndex < mobileEntries.length) {
        // Update existing entry at current index
        mobileEntries[currentMobileEntryIndex] = entry;
    } else {
        // Add new entry and update index
        mobileEntries.push(entry);
        currentMobileEntryIndex = mobileEntries.length - 1;
    }
    
    return true;
}

function clearMobileForm() {
    document.getElementById('mobileItemName').value = '';
    document.getElementById('mobileItemSize').value = '';
    document.getElementById('mobileItemQuantity').value = '0';
    document.getElementById('mobileItemPrice').value = '0';
    document.getElementById('mobileItemTotal').textContent = '0';
}

function loadMobileEntry(index) {
    if (index >= 0 && index < mobileEntries.length) {
        const entry = mobileEntries[index];
        document.getElementById('mobileItemName').value = entry.name;
        document.getElementById('mobileItemSize').value = entry.size;
        document.getElementById('mobileItemQuantity').value = entry.quantity;
        
        // Format price for display
        const priceNum = parseInt(entry.price);
        if (!isNaN(priceNum)) {
            document.getElementById('mobileItemPrice').value = priceNum.toLocaleString('de-DE');
        } else {
            document.getElementById('mobileItemPrice').value = entry.price;
        }
        
        calculateMobileTotal();
    }
}

function goNextEntry() {
    // Save current entry
    saveMobileEntry();
    
    // Move to next entry
    currentMobileEntryIndex++;
    clearMobileForm();
    updateMobileEntryCounter();
    document.getElementById('backBtn').disabled = false;
}

function goBackEntry() {
    // Check if we can go back (must have saved at least one entry)
    if (mobileEntries.length === 0 || currentMobileEntryIndex <= 0) {
        return; // Can't go back if no entries or already at first
    }
    
    // Save current entry before going back
    saveMobileEntry();
    
    // Move to previous entry
    currentMobileEntryIndex--;
    loadMobileEntry(currentMobileEntryIndex);
    updateMobileEntryCounter();
    
    // Update back button state
    if (currentMobileEntryIndex === 0) {
        document.getElementById('backBtn').disabled = true;
    }
}

function finishEntry() {
    // Always save current entry before finishing
    saveMobileEntry();
    
    console.log('Mobile entries before adding to table:', mobileEntries);
    
    // Add all entries to table (append, don't clear existing rows)
    const tbody = document.getElementById('tableBody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }
    
    // Only add entries if there are any
    if (mobileEntries.length > 0) {
        mobileEntries.forEach((entry, index) => {
            console.log(`Adding entry ${index}:`, entry);
            addRow();
            const lastRow = tbody.lastElementChild;
            if (!lastRow) {
                console.error('Failed to add row');
                return;
            }
            
            const cells = lastRow.cells;
            
            // Set item name (column 1)
            if (cells[1] && cells[1].querySelector('textarea')) {
                cells[1].querySelector('textarea').value = entry.name || '';
            }
            // Set size (column 2)
            if (cells[2] && cells[2].querySelector('input')) {
                cells[2].querySelector('input').value = entry.size || '';
            }
            // Set quantity (column 3)
            if (cells[3] && cells[3].querySelector('input')) {
                cells[3].querySelector('input').value = entry.quantity || '';
            }
            // Set price (column 4)
            if (cells[4] && cells[4].querySelector('input')) {
                cells[4].querySelector('input').value = entry.price || '';
            }
            
            calculateTotal(lastRow);
        });
        
        calculateGrandTotal();
    }
    
    // Clear mobile entries array after adding to table
    mobileEntries = [];
    currentMobileEntryIndex = -1;
    clearMobileForm();
    
    // Hide form and backdrop, show summary
    document.querySelector('.mobile-form-container').style.display = 'none';
    document.getElementById('mobileFormBackdrop').style.display = 'none';
    document.getElementById('mobileSummary').style.display = 'block';
    document.body.style.overflow = 'auto';
    
    // Update summary
    const rowCount = tbody.querySelectorAll('tr').length;
    document.getElementById('summaryItemCount').textContent = rowCount;
    const grandTotalElement = document.getElementById('grandTotal');
    if (grandTotalElement) {
        document.getElementById('summaryGrandTotal').textContent = grandTotalElement.textContent;
    }
}

function backToForm() {
    document.getElementById('mobileSummary').style.display = 'none';
    document.querySelector('.mobile-form-container').style.display = 'block';
    
    if (mobileEntries.length > 0) {
        currentMobileEntryIndex = mobileEntries.length - 1;
        loadMobileEntry(currentMobileEntryIndex);
        updateMobileEntryCounter();
    }
}

function viewFullTable() {
    document.getElementById('mobileSummary').style.display = 'none';
    document.getElementById('mobileFormBackdrop').style.display = 'none';
    document.querySelector('.container table').style.display = 'table';
    document.querySelector('.calculation-controls').style.display = 'flex';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    isMobileFormMode = false;
}

// View table from form (saves current entry first)
function viewTableFromForm() {
    // Save current entry if there's any data
    if (document.getElementById('mobileItemName').value.trim()) {
        saveMobileEntry();
    }
    
    // Add all entries to table (append, don't clear existing rows)
    const tbody = document.getElementById('tableBody');
    if (tbody && mobileEntries.length > 0) {
        mobileEntries.forEach(entry => {
            addRow();
            const lastRow = tbody.lastElementChild;
            if (!lastRow) return;
            
            const cells = lastRow.cells;
            
            if (cells[1] && cells[1].querySelector('textarea')) {
                cells[1].querySelector('textarea').value = entry.name || '';
            }
            if (cells[2] && cells[2].querySelector('input')) {
                cells[2].querySelector('input').value = entry.size || '';
            }
            if (cells[3] && cells[3].querySelector('input')) {
                cells[3].querySelector('input').value = entry.quantity || '';
            }
            if (cells[4] && cells[4].querySelector('input')) {
                cells[4].querySelector('input').value = entry.price || '';
            }
            
            calculateTotal(lastRow);
        });
        
        calculateGrandTotal();
    }
    
    // Clear mobile entries array after adding to table
    mobileEntries = [];
    currentMobileEntryIndex = -1;
    clearMobileForm();
    
    // Show table, hide form
    document.querySelector('.mobile-form-container').style.display = 'none';
    document.getElementById('mobileFormBackdrop').style.display = 'none';
    document.querySelector('.container table').style.display = 'table';
    document.querySelector('.calculation-controls').style.display = 'flex';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

function syncVATValue(input) {
    document.getElementById('vatValue').value = input.value;
    updateTotals();
}

function syncDiscountValue(input) {
    document.getElementById('discountValue').value = input.value;
    updateTotals();
}

function syncDiscountType(select) {
    document.getElementById('discountType').value = select.value;
    updateTotals();
}

// Mobile-triggered toggle functions
function toggleVATFromMobile() {
    const mobileCheckbox = document.getElementById('mobileSummaryVAT');
    const desktopCheckbox = document.getElementById('enableVAT');
    desktopCheckbox.checked = mobileCheckbox.checked;
    toggleVAT();
}

function toggleDiscountFromMobile() {
    const mobileCheckbox = document.getElementById('mobileSummaryDiscount');
    const desktopCheckbox = document.getElementById('enableDiscount');
    desktopCheckbox.checked = mobileCheckbox.checked;
    toggleDiscount();
}

function togglePaidFromMobile() {
    const mobileCheckbox = document.getElementById('mobileSummaryPaid');
    const desktopCheckbox = document.getElementById('enablePaid');
    desktopCheckbox.checked = mobileCheckbox.checked;
    togglePaid();
}

// Initialize mobile form on load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial state for back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.disabled = true;
    }
    
    // Sync initial checkbox states from desktop to mobile
    const desktopVAT = document.getElementById('enableVAT');
    const mobileVAT = document.getElementById('mobileSummaryVAT');
    if (desktopVAT && mobileVAT) {
        mobileVAT.checked = desktopVAT.checked;
    }
    
    const desktopDiscount = document.getElementById('enableDiscount');
    const mobileDiscount = document.getElementById('mobileSummaryDiscount');
    if (desktopDiscount && mobileDiscount) {
        mobileDiscount.checked = desktopDiscount.checked;
    }
    
    const desktopPaid = document.getElementById('enablePaid');
    const mobilePaid = document.getElementById('mobileSummaryPaid');
    if (desktopPaid && mobilePaid) {
        mobilePaid.checked = desktopPaid.checked;
    }
});

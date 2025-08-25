document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const modal = document.getElementById('calculatorModal');
    const fabContainer = document.getElementById('calculatorFabContainer');

    if (!modal || !fabContainer) return;

    const closeModalBtn = modal.querySelector('.close-modal');
    const calculateMediaBtn = document.getElementById('calculateMediaBtn');
    const shapeSelector = document.getElementById('calculatorShapeSelector');
    const calculatorTitle = document.getElementById('calculatorTitle');
    const calculatorBody = document.getElementById('calculatorBody');
    const unitSelector = document.getElementById('calculatorUnit');

    // --- State Variables ---
    let currentShape = '';
    let unitMultiplier = 1.0; // Default to mm
    let unitSuffix = 'mm';

    // --- Event Listeners ---
    calculateMediaBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fabContainer.classList.toggle('active');
    });

    shapeSelector.addEventListener('change', handleShapeChange);
    closeModalBtn.addEventListener('click', closeCalculatorModal);
    
    document.addEventListener('click', (e) => {
        if (!fabContainer.contains(e.target)) {
            fabContainer.classList.remove('active');
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeCalculatorModal();
        }
    });
    
    unitSelector.addEventListener('change', handleUnitChange);

    // --- Core Functions ---
    function openCalculatorModal() {
        modal.style.display = 'block';
        document.body.classList.add('no-scroll');
    }

    function closeCalculatorModal() {
        modal.style.display = 'none';
        document.body.classList.remove('no-scroll');
        shapeSelector.value = ''; // Reset the selector on close
    }

    function handleShapeChange() {
        currentShape = shapeSelector.value;
        if (currentShape) {
            calculatorTitle.textContent = `${currentShape.charAt(0).toUpperCase() + currentShape.slice(1)} Tank Calculator`;
            renderCalculatorBody(currentShape);
            openCalculatorModal();
            fabContainer.classList.remove('active'); // Hide selector after opening modal
        }
    }

    function handleUnitChange() {
        const selectedUnit = unitSelector.value;
        switch (selectedUnit) {
            case 'cm': unitMultiplier = 10.0; unitSuffix = 'cm'; break;
            case 'm': unitMultiplier = 1000.0; unitSuffix = 'm'; break;
            case 'in': unitMultiplier = 25.4; unitSuffix = 'in'; break;
            default: unitMultiplier = 1.0; unitSuffix = 'mm'; break;
        }
        renderCalculatorBody(currentShape);
    }

    function renderCalculatorBody(shape) {
        let inputsHTML = '';
        switch (shape) {
            case 'cylindrical':
                inputsHTML = `
                    <div class="form-group">
                        <label for="calc-input-type">Input Type</label>
                        <select id="calc-input-type" class="calc-input">
                            <option value="diameter">Diameter</option>
                            <option value="radius">Radius</option>
                            <option value="circumference">Circumference</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label id="calc-main-label" for="calc-main-input">Tank Diameter (${unitSuffix})</label>
                        <input type="number" id="calc-main-input" class="calc-input" placeholder="Enter diameter in ${unitSuffix}">
                    </div>
                `;
                break;
            case 'cube':
                inputsHTML = `
                    <div class="form-group">
                        <label for="calc-side">Side of Cube (${unitSuffix})</label>
                        <input type="number" id="calc-side" class="calc-input" placeholder="Enter side in ${unitSuffix}">
                    </div>
                `;
                break;
            case 'cuboid':
                inputsHTML = `
                    <div class="form-group">
                        <label for="calc-length">Tank Length (${unitSuffix})</label>
                        <input type="number" id="calc-length" class="calc-input" placeholder="Enter length in ${unitSuffix}">
                    </div>
                    <div class="form-group">
                        <label for="calc-width">Tank Width (${unitSuffix})</label>
                        <input type="number" id="calc-width" class="calc-input" placeholder="Enter width in ${unitSuffix}">
                    </div>
                `;
                break;
        }

        calculatorBody.innerHTML = `
            ${inputsHTML}
            <div class="form-group">
                <label for="calc-height">Total Tank Height (${unitSuffix})</label>
                <input type="number" id="calc-height" class="calc-input" placeholder="Enter total height in ${unitSuffix}">
            </div>
            <div class="form-group">
                <label for="calc-percentage">Filling Percentage</label>
                <select id="calc-percentage" class="calc-input">
                    <option value="100">100%</option><option value="90">90%</option><option value="80">80%</option>
                    <option value="70">70%</option><option value="60">60%</option><option value="50">50%</option>
                </select>
            </div>
            <div class="form-group">
                <label for="calc-density-type">Media Type</label>
                <select id="calc-density-type" class="calc-input">
                    <option value="">Select Media</option>
                    <option value="1.6">Sand Media (1.6 g/cm³)</option>
                    <option value="0.7">Activated Carbon (0.7 g/cm³)</option>
                    <option value="manual">Manual Input</option>
                </select>
            </div>
            <div class="form-group">
                <label for="calc-density">Media Specific Gravity (g/cm³)</label>
                <input type="number" id="calc-density" class="calc-input" placeholder="Select media type or enter manually" disabled>
            </div>
            <div class="calc-actions">
                <button id="calc-calculate-btn" class="btn-solid">Calculate</button>
                <button id="calc-reset-btn" class="btn-outline">Reset</button>
            </div>
            <div id="calc-results" class="calc-results">
                <p>Volume: <span id="calc-volume-result">0.00</span> Liters</p>
                <p>Media Weight: <span id="calc-weight-result">0</span> kg</p>
            </div>
        `;
        attachCalculatorEventListeners();
    }

    function attachCalculatorEventListeners() {
        if (currentShape === 'cylindrical') {
            document.getElementById('calc-input-type').addEventListener('change', (e) => {
                const label = document.getElementById('calc-main-label');
                const input = document.getElementById('calc-main-input');
                const type = e.target.value;
                const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
                label.textContent = `Tank ${typeCapitalized} (${unitSuffix})`;
                input.placeholder = `Enter ${type} in ${unitSuffix}`;
            });
        }

        document.getElementById('calc-density-type').addEventListener('change', (e) => {
            const densityInput = document.getElementById('calc-density');
            if (e.target.value === 'manual') {
                densityInput.disabled = false;
                densityInput.value = '';
                densityInput.focus();
            } else {
                densityInput.disabled = true;
                densityInput.value = e.target.value;
            }
        });

        document.getElementById('calc-calculate-btn').addEventListener('click', calculate);
        document.getElementById('calc-reset-btn').addEventListener('click', resetCalculator);
    }

    function calculate() {
        const height = parseFloat(document.getElementById('calc-height').value);
        const percentage = parseFloat(document.getElementById('calc-percentage').value);
        const density = parseFloat(document.getElementById('calc-density').value);

        if (isNaN(height) || isNaN(percentage) || isNaN(density)) {
            alert('Please fill in all required fields with valid numbers.');
            return;
        }

        const fillingHeight = height * (percentage / 100);
        let rawVolumeMM3 = 0;

        try {
            switch (currentShape) {
                case 'cylindrical':
                    const inputType = document.getElementById('calc-input-type').value;
                    const mainInput = parseFloat(document.getElementById('calc-main-input').value);
                    if (isNaN(mainInput)) throw new Error('Invalid input for cylindrical tank.');
                    let radiusMM = 0;
                    if (inputType === 'diameter') { radiusMM = (mainInput * unitMultiplier) / 2; } 
                    else if (inputType === 'radius') { radiusMM = mainInput * unitMultiplier; } 
                    else { radiusMM = (mainInput * unitMultiplier) / (2 * Math.PI); }
                    rawVolumeMM3 = Math.PI * Math.pow(radiusMM, 2) * (fillingHeight * unitMultiplier);
                    break;
                case 'cube':
                    const side = parseFloat(document.getElementById('calc-side').value);
                    if (isNaN(side)) throw new Error('Invalid input for cube side.');
                    rawVolumeMM3 = Math.pow(side * unitMultiplier, 2) * (fillingHeight * unitMultiplier);
                    break;
                case 'cuboid':
                    const length = parseFloat(document.getElementById('calc-length').value);
                    const width = parseFloat(document.getElementById('calc-width').value);
                    if (isNaN(length) || isNaN(width)) throw new Error('Invalid input for cuboid dimensions.');
                    rawVolumeMM3 = (length * unitMultiplier) * (width * unitMultiplier) * (fillingHeight * unitMultiplier);
                    break;
            }

            const volumeInLiters = rawVolumeMM3 / 1000000; // 1 liter = 1,000,000 mm³
            const mediaWeightKg = volumeInLiters * density;

            document.getElementById('calc-volume-result').textContent = volumeInLiters.toFixed(2);
            document.getElementById('calc-weight-result').textContent = Math.round(mediaWeightKg);

        } catch (error) {
            alert(error.message);
        }
    }

    function resetCalculator() {
        const inputs = calculatorBody.querySelectorAll('input');
        const selects = calculatorBody.querySelectorAll('select');
        inputs.forEach(input => input.value = '');
        selects.forEach(select => select.selectedIndex = 0);
        document.getElementById('calc-density').disabled = true;
        document.getElementById('calc-volume-result').textContent = '0.00';
        document.getElementById('calc-weight-result').textContent = '0';
    }
});
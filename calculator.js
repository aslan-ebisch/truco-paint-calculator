// ==========================================
// CONSTANTS (matching iOS app exactly)
// ==========================================

const EstimateConstants = {
    laborRate: 37.0,              // $/hr
    profitMultiplier: 2.4,
    paintCostMultiplier: 1.5,     // multiplier for paint cost calculation
    superPaintPrice: 68.0,        // $/gal
    durationPaintPrice: 87.0,     // $/gal
    emeraldPaintPrice: 93.0,      // $/gal
    deckStainPrice: 63.0,         // $/gal
    standardStainPrice: 45.0,     // $/gal
    premiumStainPrice: 65.0,      // $/gal
    twoCoatLaborMultiplier: 1.8,
    twoCoatPaintMultiplier: 1.5
};

// Production Rates
const ProductionRates = {
    exterior: {
        sprayed: { hours: 200, gallons: 250 },      // sq ft/hr, sq ft/gal
        rolled: { hours: 125, gallons: 325 },
        trim: { hours: 40, gallons: 325 },          // LF/hr, LF/gal
        facia: { hours: 40, gallons: 400 },
        eaves: { hours: 100, gallons: 250 }
    },
    interior: {
        walls: { hours: 150, gallons: 375 },        // sq ft/hr, sq ft/gal
        ceiling: { hours: 150, gallons: 375 },
        trim: { hours: 25, gallons: 325 },          // LF/hr, LF/gal
        doors: { hours: 1, sqftPerDoor: 20 }        // hr/door
    },
    deck: {
        sprayed: { hours: 300, gallons: 250 },
        rolled: { hours: 200, gallons: 250 },
        simpleRail: { hours: 20, gallons: 45 },
        complexRail: { hours: 10, gallons: 25 },
        stairs: { hours: 8, gallons: 25 }           // stairs/hr, stairs/gal
    },
    fence: {
        sprayed: { hours: 400, gallons: 300 },
        rolled: { hours: 200, gallons: 300 }
    }
};

// ==========================================
// STATE
// ==========================================

let currentType = null;
let isColorChange = false;
let previousScreen = 'type-selection';

// Exterior data (4 sides)
let exteriorSides = [
    { name: 'North', sprayed: 0, rolled: 0, trim: 0, facia: 0, eaves: 0, prep: 0, story: 1 },
    { name: 'East', sprayed: 0, rolled: 0, trim: 0, facia: 0, eaves: 0, prep: 0, story: 1 },
    { name: 'South', sprayed: 0, rolled: 0, trim: 0, facia: 0, eaves: 0, prep: 0, story: 1 },
    { name: 'West', sprayed: 0, rolled: 0, trim: 0, facia: 0, eaves: 0, prep: 0, story: 1 }
];
let currentSideIndex = 0;

// Interior data (rooms)
let interiorRooms = [
    { name: 'Room 1', walls: 0, ceiling: 0, trim: 0, doors: 0, repair: 0, height: 1 }
];
let currentRoomIndex = 0;

// Results
let currentResults = {
    hours: 0,
    gallons: 0,
    options: [],
    selectedOption: null
};

// ==========================================
// NAVIGATION
// ==========================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function goBack(screenId) {
    showScreen(screenId);
}

function goBackFromResults() {
    if (currentType === 'exterior') {
        showScreen('exterior-input');
    } else if (currentType === 'interior') {
        showScreen('interior-input');
    } else if (currentType === 'deck') {
        showScreen('deck-input');
    } else if (currentType === 'fence') {
        showScreen('fence-input');
    }
}

function selectType(type) {
    currentType = type;

    if (type === 'exterior' || type === 'interior') {
        showScreen('color-change-screen');
    } else if (type === 'deck') {
        showScreen('deck-input');
    } else if (type === 'fence') {
        showScreen('fence-input');
    }
}

function setColorChange(value) {
    isColorChange = value;

    if (currentType === 'exterior') {
        showScreen('exterior-input');
        resetExteriorData();
    } else if (currentType === 'interior') {
        showScreen('interior-input');
        resetInteriorData();
    }
}

// ==========================================
// EXTERIOR
// ==========================================

function resetExteriorData() {
    exteriorSides = [
        { name: 'North', sprayed: 0, rolled: 0, trim: 0, facia: 0, eaves: 0, prep: 0, story: 1 },
        { name: 'East', sprayed: 0, rolled: 0, trim: 0, facia: 0, eaves: 0, prep: 0, story: 1 },
        { name: 'South', sprayed: 0, rolled: 0, trim: 0, facia: 0, eaves: 0, prep: 0, story: 1 },
        { name: 'West', sprayed: 0, rolled: 0, trim: 0, facia: 0, eaves: 0, prep: 0, story: 1 }
    ];
    currentSideIndex = 0;
    loadExteriorSide();
    updateExteriorTotals();
}

function switchSide(index) {
    saveCurrentSide();
    currentSideIndex = index;
    loadExteriorSide();

    document.querySelectorAll('#exterior-input .tab').forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });
}

function saveCurrentSide() {
    const side = exteriorSides[currentSideIndex];
    side.sprayed = parseFloat(document.getElementById('ext-sprayed').value) || 0;
    side.rolled = parseFloat(document.getElementById('ext-rolled').value) || 0;
    side.trim = parseFloat(document.getElementById('ext-trim').value) || 0;
    side.facia = parseFloat(document.getElementById('ext-facia').value) || 0;
    side.eaves = parseFloat(document.getElementById('ext-eaves').value) || 0;
    side.prep = parseFloat(document.getElementById('ext-prep').value) || 0;
    side.story = parseFloat(document.getElementById('ext-story').value) || 1;
}

function loadExteriorSide() {
    const side = exteriorSides[currentSideIndex];
    document.getElementById('ext-sprayed').value = side.sprayed;
    document.getElementById('ext-rolled').value = side.rolled;
    document.getElementById('ext-trim').value = side.trim;
    document.getElementById('ext-facia').value = side.facia;
    document.getElementById('ext-eaves').value = side.eaves;
    document.getElementById('ext-prep').value = side.prep;
    document.getElementById('ext-story').value = side.story;
}

function updateExteriorSide() {
    saveCurrentSide();
    updateExteriorTotals();
}

function calculateExteriorSideHours(side) {
    const rates = ProductionRates.exterior;
    const sprayedHours = side.sprayed / rates.sprayed.hours;
    const rolledHours = side.rolled / rates.rolled.hours;
    const trimHours = side.trim / rates.trim.hours;
    const faciaHours = side.facia / rates.facia.hours;
    const eavesHours = side.eaves / rates.eaves.hours;
    const baseHours = sprayedHours + rolledHours + trimHours + faciaHours + eavesHours + side.prep;
    return baseHours * side.story;
}

function calculateExteriorSideGallons(side) {
    const rates = ProductionRates.exterior;
    const sprayedGal = side.sprayed / rates.sprayed.gallons;
    const rolledGal = side.rolled / rates.rolled.gallons;
    const trimGal = side.trim / rates.trim.gallons;
    const faciaGal = side.facia / rates.facia.gallons;
    const eavesGal = side.eaves / rates.eaves.gallons;
    return sprayedGal + rolledGal + trimGal + faciaGal + eavesGal;
}

function updateExteriorTotals() {
    let totalHours = 0;
    let totalGallons = 0;

    exteriorSides.forEach(side => {
        totalHours += calculateExteriorSideHours(side);
        totalGallons += calculateExteriorSideGallons(side);
    });

    document.getElementById('ext-total-hours').textContent = totalHours.toFixed(2);
    document.getElementById('ext-total-gallons').textContent = totalGallons.toFixed(2);
}

function calculateExterior() {
    saveCurrentSide();

    let totalHours = 0;
    let totalGallons = 0;

    exteriorSides.forEach(side => {
        totalHours += calculateExteriorSideHours(side);
        totalGallons += calculateExteriorSideGallons(side);
    });

    const options = calculateExteriorInteriorPrices(totalHours, totalGallons, isColorChange);
    showResults(options, totalHours, totalGallons);
}

// ==========================================
// INTERIOR
// ==========================================

function resetInteriorData() {
    interiorRooms = [
        { name: 'Room 1', walls: 0, ceiling: 0, trim: 0, doors: 0, repair: 0, height: 1 }
    ];
    currentRoomIndex = 0;
    updateRoomTabs();
    loadInteriorRoom();
    updateInteriorTotals();
}

function updateRoomTabs() {
    const tabsContainer = document.getElementById('room-tabs');
    tabsContainer.innerHTML = '';

    interiorRooms.forEach((room, i) => {
        const tab = document.createElement('button');
        tab.className = `tab ${i === currentRoomIndex ? 'active' : ''}`;
        tab.textContent = room.name;
        tab.onclick = () => switchRoom(i);
        tabsContainer.appendChild(tab);
    });

    const addTab = document.createElement('button');
    addTab.className = 'tab add-tab';
    addTab.textContent = '+';
    addTab.onclick = addRoom;
    tabsContainer.appendChild(addTab);
}

function addRoom() {
    saveCurrentRoom();
    const newRoom = {
        name: `Room ${interiorRooms.length + 1}`,
        walls: 0, ceiling: 0, trim: 0, doors: 0, repair: 0, height: 1
    };
    interiorRooms.push(newRoom);
    currentRoomIndex = interiorRooms.length - 1;
    updateRoomTabs();
    loadInteriorRoom();
}

function switchRoom(index) {
    saveCurrentRoom();
    currentRoomIndex = index;
    loadInteriorRoom();
    updateRoomTabs();
}

function saveCurrentRoom() {
    const room = interiorRooms[currentRoomIndex];
    room.walls = parseFloat(document.getElementById('int-walls').value) || 0;
    room.ceiling = parseFloat(document.getElementById('int-ceiling').value) || 0;
    room.trim = parseFloat(document.getElementById('int-trim').value) || 0;
    room.doors = parseFloat(document.getElementById('int-doors').value) || 0;
    room.repair = parseFloat(document.getElementById('int-repair').value) || 0;
    room.height = parseFloat(document.getElementById('int-height').value) || 1;
}

function loadInteriorRoom() {
    const room = interiorRooms[currentRoomIndex];
    document.getElementById('int-walls').value = room.walls;
    document.getElementById('int-ceiling').value = room.ceiling;
    document.getElementById('int-trim').value = room.trim;
    document.getElementById('int-doors').value = room.doors;
    document.getElementById('int-repair').value = room.repair;
    document.getElementById('int-height').value = room.height;
}

function updateInteriorRoom() {
    saveCurrentRoom();
    updateInteriorTotals();
}

function calculateInteriorRoomHours(room) {
    const rates = ProductionRates.interior;
    const wallHours = room.walls / rates.walls.hours;
    const ceilingHours = room.ceiling / rates.ceiling.hours;
    const trimHours = room.trim / rates.trim.hours;
    const doorHours = room.doors * rates.doors.hours;
    const baseHours = wallHours + ceilingHours + trimHours + doorHours + room.repair;
    return baseHours * room.height;
}

function calculateInteriorRoomGallons(room) {
    const rates = ProductionRates.interior;
    const wallGal = room.walls / rates.walls.gallons;
    const ceilingGal = room.ceiling / rates.ceiling.gallons;
    const trimGal = room.trim / rates.trim.gallons;
    const doorGal = (room.doors * rates.doors.sqftPerDoor) / rates.walls.gallons;
    return wallGal + ceilingGal + trimGal + doorGal;
}

function updateInteriorTotals() {
    let totalHours = 0;
    let totalGallons = 0;

    interiorRooms.forEach(room => {
        totalHours += calculateInteriorRoomHours(room);
        totalGallons += calculateInteriorRoomGallons(room);
    });

    document.getElementById('int-total-hours').textContent = totalHours.toFixed(2);
    document.getElementById('int-total-gallons').textContent = totalGallons.toFixed(2);
}

function calculateInterior() {
    saveCurrentRoom();

    let totalHours = 0;
    let totalGallons = 0;

    interiorRooms.forEach(room => {
        totalHours += calculateInteriorRoomHours(room);
        totalGallons += calculateInteriorRoomGallons(room);
    });

    const options = calculateExteriorInteriorPrices(totalHours, totalGallons, isColorChange);
    showResults(options, totalHours, totalGallons);
}

// ==========================================
// DECK (Stain Only)
// ==========================================

function updateDeckTotals() {
    const sprayed = parseFloat(document.getElementById('deck-sprayed').value) || 0;
    const rolled = parseFloat(document.getElementById('deck-rolled').value) || 0;
    const simpleRail = parseFloat(document.getElementById('deck-simple-rail').value) || 0;
    const complexRail = parseFloat(document.getElementById('deck-complex-rail').value) || 0;
    const stairs = parseFloat(document.getElementById('deck-stairs').value) || 0;
    const prep = parseFloat(document.getElementById('deck-prep').value) || 0;

    const rates = ProductionRates.deck;

    const hours = (sprayed / rates.sprayed.hours) +
                  (rolled / rates.rolled.hours) +
                  (simpleRail / rates.simpleRail.hours) +
                  (complexRail / rates.complexRail.hours) +
                  (stairs / rates.stairs.hours) +
                  prep;

    const gallons = (sprayed / rates.sprayed.gallons) +
                    (rolled / rates.rolled.gallons) +
                    (simpleRail / rates.simpleRail.gallons) +
                    (complexRail / rates.complexRail.gallons) +
                    (stairs / rates.stairs.gallons);

    document.getElementById('deck-total-hours').textContent = hours.toFixed(2);
    document.getElementById('deck-total-gallons').textContent = gallons.toFixed(2);
}

function calculateDeck() {
    const sprayed = parseFloat(document.getElementById('deck-sprayed').value) || 0;
    const rolled = parseFloat(document.getElementById('deck-rolled').value) || 0;
    const simpleRail = parseFloat(document.getElementById('deck-simple-rail').value) || 0;
    const complexRail = parseFloat(document.getElementById('deck-complex-rail').value) || 0;
    const stairs = parseFloat(document.getElementById('deck-stairs').value) || 0;
    const prep = parseFloat(document.getElementById('deck-prep').value) || 0;

    const rates = ProductionRates.deck;

    const hours = (sprayed / rates.sprayed.hours) +
                  (rolled / rates.rolled.hours) +
                  (simpleRail / rates.simpleRail.hours) +
                  (complexRail / rates.complexRail.hours) +
                  (stairs / rates.stairs.hours) +
                  prep;

    const gallons = (sprayed / rates.sprayed.gallons) +
                    (rolled / rates.rolled.gallons) +
                    (simpleRail / rates.simpleRail.gallons) +
                    (complexRail / rates.complexRail.gallons) +
                    (stairs / rates.stairs.gallons);

    const options = calculateDeckStainPrices(hours, gallons);
    showResults(options, hours, gallons, '1 COAT (all surfaces)');
}

// ==========================================
// FENCE (Stain Only)
// ==========================================

function updateFenceTotals() {
    const sprayed = parseFloat(document.getElementById('fence-sprayed').value) || 0;
    const rolled = parseFloat(document.getElementById('fence-rolled').value) || 0;
    const sides = parseFloat(document.getElementById('fence-sides').value) || 1;
    const opacity = parseFloat(document.getElementById('fence-opacity').value) || 1;
    const prep = parseFloat(document.getElementById('fence-prep').value) || 0;

    const rates = ProductionRates.fence;

    const baseHours = (sprayed / rates.sprayed.hours) +
                      (rolled / rates.rolled.hours) +
                      prep;
    const hours = baseHours * sides * opacity;

    const baseGallons = (sprayed / rates.sprayed.gallons) +
                        (rolled / rates.rolled.gallons);
    const gallons = baseGallons * sides;

    document.getElementById('fence-total-hours').textContent = hours.toFixed(2);
    document.getElementById('fence-total-gallons').textContent = gallons.toFixed(2);
}

function calculateFence() {
    const sprayed = parseFloat(document.getElementById('fence-sprayed').value) || 0;
    const rolled = parseFloat(document.getElementById('fence-rolled').value) || 0;
    const sides = parseFloat(document.getElementById('fence-sides').value) || 1;
    const opacity = parseFloat(document.getElementById('fence-opacity').value) || 1;
    const prep = parseFloat(document.getElementById('fence-prep').value) || 0;

    const rates = ProductionRates.fence;

    const baseHours = (sprayed / rates.sprayed.hours) +
                      (rolled / rates.rolled.hours) +
                      prep;
    const hours = baseHours * sides * opacity;

    const baseGallons = (sprayed / rates.sprayed.gallons) +
                        (rolled / rates.rolled.gallons);
    const gallons = baseGallons * sides;

    const sidesDesc = sides === 1 ? 'One Side' : 'Both Sides';
    const opacityDesc = opacity === 1 ? 'Clear' : opacity === 1.2 ? 'Semi-Transparent' : 'Solid';

    const options = calculateFenceStainPrices(hours, gallons, sidesDesc, opacityDesc);
    showResults(options, hours, gallons);
}

// ==========================================
// PRICE CALCULATIONS
// ==========================================

function calculateExteriorInteriorPrices(hours, gallons, isColorChange) {
    const c = EstimateConstants;
    const options = [];

    if (!isColorChange) {
        // 1 Coat Super
        const oneCoatSuperPrice = (hours * c.laborRate + gallons * c.superPaintPrice * c.paintCostMultiplier) * c.profitMultiplier;
        options.push({
            name: '1 Coat Super',
            coatDescription: '1 COAT',
            price: oneCoatSuperPrice,
            hours: hours,
            gallons: gallons
        });

        // 1 Coat Duration
        const oneCoatDurationPrice = (hours * c.laborRate + gallons * c.durationPaintPrice * c.paintCostMultiplier) * c.profitMultiplier;
        options.push({
            name: '1 Coat Duration',
            coatDescription: '1 COAT',
            price: oneCoatDurationPrice,
            hours: hours,
            gallons: gallons
        });

        // 1 Coat Emerald
        const oneCoatEmeraldPrice = (hours * c.laborRate + gallons * c.emeraldPaintPrice * c.paintCostMultiplier) * c.profitMultiplier;
        options.push({
            name: '1 Coat Emerald',
            coatDescription: '1 COAT',
            price: oneCoatEmeraldPrice,
            hours: hours,
            gallons: gallons
        });
    }

    // 2 Coat calculations
    const twoCoatHours = hours * c.twoCoatLaborMultiplier;
    const twoCoatGallons = gallons * c.twoCoatPaintMultiplier;

    // 2 Coat Super
    const twoCoatSuperPrice = (twoCoatHours * c.laborRate + twoCoatGallons * c.superPaintPrice * c.paintCostMultiplier) * c.profitMultiplier;
    options.push({
        name: '2 Coat Super',
        coatDescription: isColorChange ? '2 COAT (color change)' : '2 COAT',
        price: twoCoatSuperPrice,
        hours: twoCoatHours,
        gallons: twoCoatGallons
    });

    // 2 Coat Duration
    const twoCoatDurationPrice = (twoCoatHours * c.laborRate + twoCoatGallons * c.durationPaintPrice * c.paintCostMultiplier) * c.profitMultiplier;
    options.push({
        name: '2 Coat Duration',
        coatDescription: isColorChange ? '2 COAT (color change)' : '2 COAT',
        price: twoCoatDurationPrice,
        hours: twoCoatHours,
        gallons: twoCoatGallons
    });

    // 2 Coat Emerald
    const twoCoatEmeraldPrice = (twoCoatHours * c.laborRate + twoCoatGallons * c.emeraldPaintPrice * c.paintCostMultiplier) * c.profitMultiplier;
    options.push({
        name: '2 Coat Emerald',
        coatDescription: isColorChange ? '2 COAT (color change)' : '2 COAT',
        price: twoCoatEmeraldPrice,
        hours: twoCoatHours,
        gallons: twoCoatGallons
    });

    return options;
}

function calculateDeckStainPrices(hours, gallons) {
    const c = EstimateConstants;

    const stainPrice = (hours * c.laborRate + gallons * c.deckStainPrice * c.paintCostMultiplier) * c.profitMultiplier;

    return [{
        name: 'Stain',
        coatDescription: '1 COAT (all surfaces)',
        price: stainPrice,
        hours: hours,
        gallons: gallons
    }];
}

function calculateFenceStainPrices(hours, gallons, sidesDesc, opacityDesc) {
    const c = EstimateConstants;

    const stainPrice = (hours * c.laborRate + gallons * c.deckStainPrice * c.paintCostMultiplier) * c.profitMultiplier;

    return [{
        name: 'Stain',
        coatDescription: `1 COAT - ${sidesDesc} - ${opacityDesc}`,
        price: stainPrice,
        hours: hours,
        gallons: gallons
    }];
}

// ==========================================
// RESULTS
// ==========================================

function showResults(options, hours, gallons, coatDesc) {
    currentResults = {
        hours: hours,
        gallons: gallons,
        options: options,
        selectedOption: options[0]
    };

    // Set coat description
    const coatDescEl = document.getElementById('coat-desc');
    coatDescEl.textContent = coatDesc || options[0]?.coatDescription || '';

    // Render price options
    const container = document.getElementById('price-options');
    container.innerHTML = '';

    options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = `price-option ${i === 0 ? 'selected' : ''}`;
        div.innerHTML = `
            <span class="name">${opt.name}</span>
            <span class="price">$${Math.round(opt.price).toLocaleString()}</span>
        `;
        div.onclick = () => selectOption(i);
        container.appendChild(div);
    });

    // Update summary
    updateResultsSummary();

    // Clear custom price
    document.getElementById('custom-price').value = '';

    showScreen('results-screen');
}

function selectOption(index) {
    currentResults.selectedOption = currentResults.options[index];

    document.querySelectorAll('.price-option').forEach((el, i) => {
        el.classList.toggle('selected', i === index);
    });

    document.getElementById('custom-price').value = '';
    updateResultsSummary();
}

function updateResultsSummary() {
    const opt = currentResults.selectedOption;
    const customPrice = parseFloat(document.getElementById('custom-price').value);

    const price = customPrice || opt.price;

    document.getElementById('selected-price').textContent = `$${Math.round(price).toLocaleString()}`;
    document.getElementById('selected-hours').textContent = opt.hours.toFixed(2);
    document.getElementById('selected-gallons').textContent = opt.gallons.toFixed(2);
}

// Custom price input handler
document.addEventListener('DOMContentLoaded', () => {
    const customPriceInput = document.getElementById('custom-price');
    if (customPriceInput) {
        customPriceInput.addEventListener('input', () => {
            // Deselect all options when custom price is entered
            if (customPriceInput.value) {
                document.querySelectorAll('.price-option').forEach(el => {
                    el.classList.remove('selected');
                });
            }
            updateResultsSummary();
        });
    }
});


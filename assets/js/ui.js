// assets/js/ui.js

import { gameData, realWorldAircraft, techLevelRestrictions, engineSuperchargerCombos, designPenalties } from './data.js';
import { updateCalculations, calculatePerformanceAtAltitude, calculateRateOfClimb, setCurrentSelections, findItemAcrossCategories, getCurrentSelections } from './calculations.js';
import { templateManager, stateManager } from './managers.js';

let currentStep = 1;
let isLockedByProduction = false;

// Função para criar o evento de atualização
function dispatchDesignUpdate() {
    document.body.dispatchEvent(new CustomEvent('design-update'));
}

function createChoiceButtons(containerId, hiddenSelectId, dataObject, formatter) {
    const container = document.getElementById(containerId);
    const hiddenSelect = document.getElementById(hiddenSelectId);
    if (!container || !hiddenSelect) return;

    container.innerHTML = ''; 
    hiddenSelect.innerHTML = ''; 

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione...';
    hiddenSelect.appendChild(defaultOption);

    Object.entries(dataObject).forEach(([key, data]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = data.name;
        hiddenSelect.appendChild(option);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-btn p-3 border rounded-lg hover:bg-blue-50 transition-colors text-left bg-white border-gray-300';
        button.dataset.value = key;
        button.innerHTML = formatter(key, data);
        
        button.addEventListener('click', () => {
            if (isLockedByProduction && ['aircraft_type', 'structure_type', 'wing_type'].includes(hiddenSelectId)) {
                alert("Design estrutural está travado devido à produção iniciada.");
                return;
            }
            hiddenSelect.value = key;
            
            container.querySelectorAll('.choice-btn').forEach(btn => {
                btn.classList.remove('selected', 'bg-blue-100', 'border-blue-500');
            });
            button.classList.add('selected', 'bg-blue-100', 'border-blue-500');
            
            if (hiddenSelectId === 'aircraft_type') {
                populatePayloadStations();
            }
            dispatchDesignUpdate();
        });
        container.appendChild(button);
    });
}

function formatAircraftTypeButton(key, data) {
    return `<div class="font-bold text-gray-800">${data.name}</div><div class="text-xs text-gray-600 mt-1">${data.description}</div>`;
}

function formatStructureTypeButton(key, data) {
    return `<div class="font-bold text-gray-800">${data.name}</div><div class="text-xs text-gray-600 mt-1">${data.description}</div><div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs"><span class="${data.cost_mod < 1 ? 'text-green-600' : 'text-red-600'}">Custo: ${data.cost_mod}x</span><span class="${data.weight_mod < 1 ? 'text-green-600' : 'text-red-600'}">Peso: ${data.weight_mod}x</span><span class="${data.reliability_mod > 1 ? 'text-green-600' : 'text-red-600'}">Confiab.: ${data.reliability_mod}x</span></div>`;
}

function formatWingTypeButton(key, data) {
    return `<div class="font-bold text-gray-800">${data.name}</div><div class="text-xs text-gray-600 mt-1">${data.description}</div><div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs"><span class="${data.maneuverability_mod > 1 ? 'text-green-600' : 'text-red-600'}">Manobra: ${data.maneuverability_mod}x</span><span class="${data.drag_mod < 1 ? 'text-green-600' : 'text-red-600'}">Arrasto: ${data.drag_mod}x</span></div>`;
}

export function initializeChoiceButtons() {
    createChoiceButtons('aircraft_type_selection', 'aircraft_type', gameData.components.aircraft_types, formatAircraftTypeButton);
    createChoiceButtons('structure_type_selection', 'structure_type', gameData.components.structure_materials, formatStructureTypeButton);
    createChoiceButtons('wing_type_selection', 'wing_type', gameData.components.wing_types, formatWingTypeButton);
}

function populateEquipmentListInUI(elementId, items, className = 'text-gray-700') {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';
    if (items && items.length > 0) {
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = `py-1 text-xs ${className}`;
            div.textContent = `• ${item}`;
            container.appendChild(div);
        });
    } else {
        container.innerHTML = '<div class="text-gray-500 text-xs">Nenhum</div>';
    }
}

export function updateUI(performance) {
    if (!performance) {
        const idsToClear = ['display_name', 'display_type', 'display_doctrine', 'unit_cost', 'base_unit_cost', 'learning_curve_discount_display', 'total_production_cost', 'total_metal_cost', 'total_weight', 'total_power', 'speed_max_sl', 'speed_max_alt', 'rate_of_climb', 'service_ceiling', 'max_range', 'turn_time', 'main_armament', 'reliability_display', 'country_production_capacity', 'producible_units', 'country_metal_balance', 'rated_altitude', 'manifold_pressure', 'suggested_propeller', 'suggested_cooling'];
        idsToClear.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = id.includes('cost') || id.includes('weight') || id.includes('power') ? '0' : 'N/A';
        });
        document.getElementById('cg_indicator').style.left = '50%';
        document.getElementById('stress_bar').style.width = '0%';
        document.getElementById('stress_bar_label').textContent = '0%';
        populateEquipmentListInUI('required_features_summary', []);
        return;
    }

    const { inputs, baseUnitCost, finalUnitCost, learningDiscount, combatWeight, totalEnginePower, finalSpeedKmhSL, finalSpeedKmhAlt, rate_of_climb_ms, finalServiceCeiling, finalRangeKm, turn_time_s, finalReliability, countryData, typeData, superchargerData, finalCg, currentStress, stressLimit, requiredFeatures, offensiveArmamentTexts } = performance;

    const formatNumber = (num) => num ? num.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '0';
    
    document.getElementById('display_name').textContent = inputs.aircraftName || 'Sem nome';
    document.getElementById('display_type').textContent = typeData.name || '-';
    document.getElementById('display_doctrine').textContent = gameData.doctrines[inputs.selectedAirDoctrine]?.name || '-';
    
    document.getElementById('base_unit_cost').textContent = `£ ${formatNumber(baseUnitCost)}`;
    document.getElementById('learning_curve_discount_display').textContent = `${(learningDiscount * 100).toFixed(1)}%`;
    document.getElementById('unit_cost').textContent = `£ ${formatNumber(finalUnitCost)}`;
    document.getElementById('total_production_cost').textContent = `£ ${formatNumber(finalUnitCost * inputs.quantity)}`;
    
    document.getElementById('total_weight').textContent = `${formatNumber(combatWeight)} kg`;
    document.getElementById('total_power').textContent = `${formatNumber(totalEnginePower)} hp`;
    
    document.getElementById('speed_max_sl').textContent = `${formatNumber(finalSpeedKmhSL)} km/h`;
    document.getElementById('speed_max_alt').textContent = `${formatNumber(finalSpeedKmhAlt)} km/h`;
    document.getElementById('rate_of_climb').textContent = `${rate_of_climb_ms.toFixed(1)} m/s`;
    document.getElementById('service_ceiling').textContent = `${formatNumber(finalServiceCeiling)} m`;
    document.getElementById('max_range').textContent = `${formatNumber(finalRangeKm)} km`;
    document.getElementById('turn_time').textContent = `${turn_time_s.toFixed(1)} s`;
    document.getElementById('reliability_display').textContent = `${finalReliability.toFixed(1)}%`;
    document.getElementById('main_armament').textContent = offensiveArmamentTexts.join(', ') || 'N/A';

    // Country Data in Summary
    if (countryData) {
        document.getElementById('country_production_capacity').textContent = formatNumber(countryData.production_capacity);
        const producibleUnits = finalUnitCost > 0 ? Math.floor(countryData.production_capacity / finalUnitCost) : 0;
        document.getElementById('producible_units').textContent = formatNumber(producibleUnits);
        document.getElementById('country_metal_balance').textContent = formatNumber(countryData.metal_balance);
    }

    // CG Meter
    const cgPercentage = (finalCg + 1) * 50;
    document.getElementById('cg_indicator').style.left = `calc(${Math.max(0, Math.min(100, cgPercentage))}% - 2px)`;

    // Stress Meter
    const stressPercentage = Math.min(100, (currentStress / stressLimit) * 100);
    const stressBar = document.getElementById('stress_bar');
    stressBar.style.width = `${stressPercentage}%`;
    stressBar.style.backgroundColor = stressPercentage > 85 ? '#dc2626' : (stressPercentage > 60 ? '#f59e0b' : '#16a34a');
    document.getElementById('stress_bar_label').textContent = `${stressPercentage.toFixed(0)}%`;

    // Engine Info
    if (superchargerData) {
        document.getElementById('rated_altitude').textContent = `${superchargerData.characteristics.rated_altitude_m} m`;
        document.getElementById('manifold_pressure').textContent = `${superchargerData.characteristics.manifold_pressure_ata} ATA`;
    }

    populateEquipmentListInUI('required_features_summary', requiredFeatures, 'text-red-600');
    updateStatusAndWarnings(performance);
}

export function toggleStep(step) {
    const content = document.getElementById(`step_${step}_content`);
    const icon = document.getElementById(`step_${step}_icon`);
    if (!content || !icon) return;

    const isOpening = content.classList.contains('hidden');
    document.querySelectorAll('.step-card .p-6').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.step-card i').forEach(i => i.classList.remove('rotate-180'));

    if (isOpening) {
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
        currentStep = step;
    }
}

export function generateSheet() {
    const performanceData = updateCalculations();
    if (performanceData) {
        localStorage.setItem('aircraftSheetData', JSON.stringify(performanceData));
        window.open('ficha.html', '_blank');
    } else {
        alert('🔥 Erro: Preencha os campos obrigatórios para gerar a ficha.');
    }
}

export function generatePerformanceGraphData(performanceData) {
    const { combatWeight, totalEnginePower, propData, aero, superchargerData, finalServiceCeiling } = performanceData;
    const data = [];
    const step = 1000;
    for (let h = 0; h <= 15000; h += step) {
        if (h > finalServiceCeiling + step) break;
        const currentAlt = Math.min(h, finalServiceCeiling);
        const roc = calculateRateOfClimb(currentAlt, combatWeight, totalEnginePower, propData, aero, superchargerData);
        if (roc < 0.1 && h > 0) {
             data.push({ altitude: currentAlt, speed: 0, roc: 0 });
             break;
        }
        const perfPoint = calculatePerformanceAtAltitude(currentAlt, combatWeight, totalEnginePower, propData, aero, superchargerData);
        let cappedSpeed = Math.min(perfPoint.speed_kmh * aero.speed_mod, aero.limits.max_speed);
        data.push({ altitude: currentAlt, speed: cappedSpeed, roc });
    }
    return data;
}

export function updateStatusAndWarnings(performance) {
    const statusContainer = document.getElementById('status-container');
    if (!statusContainer) return;
    statusContainer.innerHTML = ''; 

    const { finalReliability, typeData, finalSpeedKmhAlt, finalRangeKm, payloadStationStatus, finalCg, currentStress, stressLimit } = performance;
    let warnings = [];

    if (finalReliability < 70) warnings.push({ type: 'error', text: `🔥 Confiabilidade (${finalReliability.toFixed(1)}%) muito baixa!` });
    if (finalSpeedKmhAlt < typeData.limits.min_speed) warnings.push({ type: 'warning', text: `⚠️ Velocidade abaixo do esperado para um ${typeData.name}.` });
    if (finalRangeKm > typeData.limits.max_range * 1.1) warnings.push({ type: 'warning', text: `⚠️ Alcance acima do esperado para um ${typeData.name}.` });
    if (Math.abs(finalCg - typeData.base_cg) > 0.5) warnings.push({ type: 'warning', text: `⚠️ CG instável, afetando manobrabilidade.`});
    if (currentStress > stressLimit) warnings.push({ type: 'error', text: `🔥 Fadiga estrutural excedida! Reforços adicionados.`});

    payloadStationStatus.forEach(s => {
        if (s.status === 'exceeded') {
            warnings.push({ type: 'error', text: `🔥 ${s.message}`});
        }
    });

    if (warnings.length === 0) {
        warnings.push({ type: 'ok', text: '✅ Design pronto para os céus!' });
    }
    warnings.forEach(warning => {
        const statusEl = document.createElement('div');
        statusEl.className = `p-3 rounded-lg text-center text-sm font-medium status-${warning.type}`;
        statusEl.textContent = warning.text;
        statusContainer.appendChild(statusEl);
    });
}

export function populateWingDropdowns() {
    const wingShapeSelect = document.getElementById('wing_shape');
    const currentTechLevel = gameData.currentCountryTechLevel || 0;

    if (wingShapeSelect) {
        wingShapeSelect.innerHTML = '<option value="">Selecione o Formato...</option>';
        Object.entries(gameData.components.wing_shapes).forEach(([key, shape]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = shape.name;
            if (shape.tech_level_required && currentTechLevel < shape.tech_level_required) {
                option.disabled = true;
                option.textContent += ` (Requer Tec. ${shape.tech_level_required}+)`;
            }
            wingShapeSelect.appendChild(option);
        });
    }
}

export function applyTechLevelRestrictions(techLevel) {
    gameData.currentCountryTechLevel = techLevel;
    populateWingDropdowns();
    populateEngineTypeSelection();
    setCurrentSelections(null, null);
    document.getElementById('engine-selected-info').classList.add('hidden');
    document.getElementById('supercharger-step').classList.add('opacity-50', 'pointer-events-none');
    document.getElementById('supercharger-selected-info').classList.add('hidden');
    document.getElementById('performance-sliders-step').classList.add('opacity-50', 'pointer-events-none');
    dispatchDesignUpdate();
}

export function populateEngineTypeSelection() {
    const engineSelectionDiv = document.getElementById('engine-type-selection');
    if (!engineSelectionDiv) return;
    engineSelectionDiv.innerHTML = '';
    const currentTechLevel = gameData.currentCountryTechLevel || 0;

    Object.entries(gameData.components.engineTypes).forEach(([key, engine]) => {
        const isDisabled = engine.tech_level_required > currentTechLevel;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `engine-choice-btn p-3 border rounded-lg hover:bg-blue-50 transition-colors text-left bg-white border-gray-300 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
        button.dataset.engine = key;
        button.disabled = isDisabled;
        button.innerHTML = `<div class="font-bold text-gray-800">${engine.name}</div><div class="text-xs text-gray-600 mt-1">${engine.best_for}</div> ${isDisabled ? `<div class="text-red-500 text-xs mt-1">Tec. ${engine.tech_level_required}+</div>` : ''}`;
        button.addEventListener('click', () => selectEngineType(key));
        engineSelectionDiv.appendChild(button);
    });
}

function selectEngineType(engineKey) {
    if (isLockedByProduction) {
        alert("Design do motor está travado devido à produção iniciada.");
        return;
    }
    setCurrentSelections(engineKey, null);
    const engine = gameData.components.engineTypes[engineKey];

    document.querySelectorAll('.engine-choice-btn').forEach(btn => btn.classList.remove('bg-blue-100', 'border-blue-500'));
    document.querySelector(`[data-engine="${engineKey}"]`).classList.add('bg-blue-100', 'border-blue-500');
    
    // Mostra o painel de informações do motor
    const infoDiv = document.getElementById('engine-selected-info');
    document.getElementById('selected_engine_name').textContent = engine.name;
    document.getElementById('selected_engine_description').textContent = engine.description;
    infoDiv.classList.remove('hidden');

    document.getElementById('supercharger-step').classList.remove('opacity-50', 'pointer-events-none');
    populateSuperchargerSelection();
    
    document.getElementById('performance-sliders-step').classList.add('opacity-50', 'pointer-events-none');
    dispatchDesignUpdate();
}

export function populateSuperchargerSelection() {
    const superchargerSelectionDiv = document.getElementById('supercharger-selection');
    if (!superchargerSelectionDiv) return;
    superchargerSelectionDiv.innerHTML = '';
    const currentTechLevel = gameData.currentCountryTechLevel || 0;
    const { selectedEngineType } = getCurrentSelections();

    Object.entries(gameData.components.superchargerTypes).forEach(([key, supercharger]) => {
        const isDisabled = supercharger.tech_level_required > currentTechLevel;
        const comboLimits = engineSuperchargerCombos.calculateLimits(selectedEngineType, key);
        const isBlockedByCombo = comboLimits.special?.blocked;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `supercharger-choice-btn p-3 border rounded-lg hover:bg-blue-50 transition-colors text-left bg-white border-gray-300 ${isDisabled || isBlockedByCombo ? 'opacity-50 cursor-not-allowed' : ''}`;
        button.dataset.supercharger = key;
        button.disabled = isDisabled || isBlockedByCombo;
        button.innerHTML = `<div class="font-bold text-gray-800">${supercharger.name}</div><div class="text-xs text-gray-600 mt-1">${supercharger.best_for}</div>`;
        button.addEventListener('click', () => selectSuperchargerType(key));
        superchargerSelectionDiv.appendChild(button);
    });
}

function selectSuperchargerType(superchargerKey) {
    const { selectedEngineType } = getCurrentSelections();
    const supercharger = gameData.components.superchargerTypes[superchargerKey];
    setCurrentSelections(selectedEngineType, superchargerKey);

    document.querySelectorAll('.supercharger-choice-btn').forEach(btn => btn.classList.remove('bg-blue-100', 'border-blue-500'));
    document.querySelector(`[data-supercharger="${superchargerKey}"]`).classList.add('bg-blue-100', 'border-blue-500');
    
    const infoDiv = document.getElementById('supercharger-selected-info');
    document.getElementById('selected_supercharger_name').textContent = supercharger.name;
    document.getElementById('selected_supercharger_description').textContent = supercharger.description;
    infoDiv.classList.remove('hidden');

    const comboLimits = engineSuperchargerCombos.calculateLimits(selectedEngineType, superchargerKey);
    document.getElementById('performance-sliders-step').classList.remove('opacity-50', 'pointer-events-none');
    updatePerformanceSliders(comboLimits);
    dispatchDesignUpdate();
}

export function updatePerformanceSliders(limits) {
    const speedSlider = document.getElementById('target-speed');
    const rangeSlider = document.getElementById('target-range');
    speedSlider.min = limits.speed.min;
    speedSlider.max = limits.speed.max;
    speedSlider.value = Math.round((limits.speed.min + limits.speed.max) / 2);
    speedSlider.disabled = false;
    rangeSlider.min = limits.range.min;
    rangeSlider.max = limits.range.max;
    rangeSlider.value = Math.round((limits.range.min + limits.range.max) / 2);
    rangeSlider.disabled = false;
    document.getElementById('speed-min').textContent = `Min: ${limits.speed.min}`;
    document.getElementById('speed-max').textContent = `Max: ${limits.speed.max}`;
    document.getElementById('range-min').textContent = `Min: ${limits.range.min}`;
    document.getElementById('range-max').textContent = `Max: ${limits.range.max}`;
    
    updateDesignConsequences();
}

export function updateDesignConsequences() {
    document.getElementById('speed-value').textContent = `${document.getElementById('target-speed').value} km/h`;
    document.getElementById('range-value').textContent = `${document.getElementById('target-range').value} km`;
    dispatchDesignUpdate();
}

export function populatePayloadStations() {
    const container = document.getElementById('payload_stations_container');
    const aircraftTypeKey = document.getElementById('aircraft_type').value;
    const aircraftType = gameData.components.aircraft_types[aircraftTypeKey];
    if (!container || !aircraftType || !aircraftType.payload_stations) {
        container.innerHTML = '<p class="text-gray-600">Selecione um tipo de aeronave para ver as estações de carga.</p>';
        return;
    }

    container.innerHTML = '<h4 class="text-lg font-semibold text-gray-800 mb-3">📦 Estações de Carga (Payload)</h4>';
    aircraftType.payload_stations.forEach(station => {
        const div = document.createElement('div');
        div.className = 'p-3 bg-gray-50 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-4 items-end';
        
        let optionsHtml = '<option value="empty">Vazio</option>';
        Object.entries(gameData.components.armaments).forEach(([armKey, arm]) => {
            if (station.allowed_types.includes(arm.type)) {
                optionsHtml += `<option value="${armKey}">${arm.name} (${arm.weight} kg)</option>`;
            }
        });

        div.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700">${station.name} (Max: ${station.max_weight_kg} kg)</label>
                <select data-station="${station.id}" class="armament-select w-full mt-1 p-2 border border-gray-300 rounded-lg">
                    ${optionsHtml}
                </select>
            </div>
            <div>
                 <label class="block text-sm font-medium text-gray-700">Quantidade</label>
                <input type="number" value="0" min="0" max="${station.max_units}" data-station-qty="${station.id}" class="armament-qty w-full mt-1 p-2 border border-gray-300 rounded-lg">
            </div>
        `;
        container.appendChild(div);
    });
}

export function setProductionLock(isLocked) {
    isLockedByProduction = isLocked;
    const lockedIds = ['aircraft_type_selection', 'structure_type_selection', 'wing_type_selection', 'engine-type-selection'];
    lockedIds.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.querySelectorAll('button').forEach(btn => {
                btn.disabled = isLocked;
                if(isLocked) btn.classList.add('opacity-60', 'cursor-not-allowed');
                else btn.classList.remove('opacity-60', 'cursor-not-allowed');
            });
        }
    });
}

export async function updateProgress() {
    const { getCurrentSelections } = await import('./calculations.js');
    const { selectedEngineType, selectedSuperchargerType } = getCurrentSelections();
    
    const requiredFields = ['aircraft_name', 'country_doctrine', 'air_doctrine', 'aircraft_type', 'wing_shape'];
    let completedFields = 0;
    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (field && field.value && field.value !== '' && field.value !== 'loading') completedFields++;
    });

    if (selectedEngineType) completedFields++;
    if (selectedSuperchargerType) completedFields++;

    const totalFields = requiredFields.length + 2;
    const progress = (completedFields / totalFields) * 100;

    const progressBar = document.getElementById('progress_bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

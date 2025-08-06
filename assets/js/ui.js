// assets/js/ui.js

import { gameData, realWorldAircraft, techLevelRestrictions, engineSuperchargerCombos, designPointsSystem, designPenalties } from './data.js'; // Importa gameData e realWorldAircraft
import { updateCalculations, calculatePerformanceAtAltitude, calculateRateOfClimb, setCurrentSelections } from './calculations.js'; // Importa updateCalculations e funções de cálculo
import { templateManager, stateManager } from './managers.js'; // Importa managers

let currentStep = 1;

/**
 * Função genérica para criar botões de escolha a partir de um objeto de dados.
 * @param {string} containerId - O ID do elemento div que conterá os botões.
 * @param {string} hiddenSelectId - O ID do elemento <select> oculto que armazena o valor.
 * @param {object} dataObject - O objeto de dados (ex: gameData.components.aircraft_types).
 * @param {function} formatter - Uma função que recebe a chave e o objeto de dados e retorna o HTML interno do botão.
 */
function createChoiceButtons(containerId, hiddenSelectId, dataObject, formatter) {
    const container = document.getElementById(containerId);
    const hiddenSelect = document.getElementById(hiddenSelectId);
    if (!container || !hiddenSelect) return;

    container.innerHTML = ''; // Limpa o container
    hiddenSelect.innerHTML = ''; // Limpa o select oculto

    // Adiciona uma opção padrão vazia ao select oculto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione...';
    hiddenSelect.appendChild(defaultOption);

    Object.entries(dataObject).forEach(([key, data]) => {
        // Popula o select oculto
        const option = document.createElement('option');
        option.value = key;
        option.textContent = data.name;
        hiddenSelect.appendChild(option);

        // Cria o botão
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-btn p-3 border rounded-lg hover:bg-blue-50 transition-colors text-left bg-white border-gray-300';
        button.dataset.value = key;
        button.innerHTML = formatter(key, data);
        
        button.addEventListener('click', () => {
            // Atualiza o valor do select oculto
            hiddenSelect.value = key;
            
            // Atualiza o estilo dos botões
            container.querySelectorAll('.choice-btn').forEach(btn => {
                btn.classList.remove('selected', 'bg-blue-100', 'border-blue-500');
                btn.classList.add('bg-white', 'border-gray-300');
            });
            button.classList.add('selected', 'bg-blue-100', 'border-blue-500');
            
            // Dispara o cálculo
            updateCalculations();
        });

        container.appendChild(button);
    });
}

/**
 * Formata o conteúdo HTML para os botões de Tipo de Aeronave.
 * @param {string} key - A chave do tipo de aeronave.
 * @param {object} data - O objeto de dados do tipo de aeronave.
 * @returns {string} - O HTML interno para o botão.
 */
function formatAircraftTypeButton(key, data) {
    return `
        <div class="font-bold text-gray-800">${data.name}</div>
        <div class="text-xs text-gray-600 mt-1">${data.description}</div>
    `;
}

/**
 * Formata o conteúdo HTML para os botões de Material da Estrutura.
 * @param {string} key - A chave do material.
 * @param {object} data - O objeto de dados do material.
 * @returns {string} - O HTML interno para o botão.
 */
function formatStructureTypeButton(key, data) {
    return `
        <div class="font-bold text-gray-800">${data.name}</div>
        <div class="text-xs text-gray-600 mt-1">${data.description}</div>
        <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
            <span class="${data.cost_mod < 1 ? 'text-green-600' : 'text-red-600'}">Custo: ${data.cost_mod}x</span>
            <span class="${data.weight_mod < 1 ? 'text-green-600' : 'text-red-600'}">Peso: ${data.weight_mod}x</span>
            <span class="${data.reliability_mod > 1 ? 'text-green-600' : 'text-red-600'}">Confiab.: ${data.reliability_mod}x</span>
        </div>
    `;
}

/**
 * Formata o conteúdo HTML para os botões de Tipo de Asa.
 * @param {string} key - A chave do tipo de asa.
 * @param {object} data - O objeto de dados do tipo de asa.
 * @returns {string} - O HTML interno para o botão.
 */
function formatWingTypeButton(key, data) {
    return `
        <div class="font-bold text-gray-800">${data.name}</div>
        <div class="text-xs text-gray-600 mt-1">${data.description}</div>
         <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
            <span class="${data.maneuverability_mod > 1 ? 'text-green-600' : 'text-red-600'}">Manobra: ${data.maneuverability_mod}x</span>
            <span class="${data.drag_mod < 1 ? 'text-green-600' : 'text-red-600'}">Arrasto: ${data.drag_mod}x</span>
        </div>
    `;
}


/**
 * Inicializa todos os seletores de botão.
 */
export function initializeChoiceButtons() {
    createChoiceButtons('aircraft_type_selection', 'aircraft_type', gameData.components.aircraft_types, formatAircraftTypeButton);
    createChoiceButtons('structure_type_selection', 'structure_type', gameData.components.structure_materials, formatStructureTypeButton);
    createChoiceButtons('wing_type_selection', 'wing_type', gameData.components.wing_types, formatWingTypeButton);
}


// Função auxiliar para preencher as listas de equipamentos
function populateEquipmentListInUI(elementId, items) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = ''; // Limpa os itens anteriores
    if (items && items.length > 0 && items.some(item => item !== undefined)) {
        items.filter(item => item !== undefined).forEach(item => {
            const div = document.createElement('div');
            div.className = 'py-1 text-xs text-gray-700';
            div.textContent = `• ${item}`;
            container.appendChild(div);
        });
    } else {
        const div = document.createElement('div');
        div.className = 'text-gray-500 text-xs';
        div.textContent = 'Nenhum';
        container.appendChild(div);
    }
}

/**
 * Atualiza os elementos da interface do usuário com os dados de performance calculados.
 * @param {object|null} performance - Objeto contendo os dados de performance, ou null para limpar a UI.
 */
export function updateUI(performance) {
    if (!performance) {
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = "Selecione o tipo de aeronave e um motor com potência válida para começar.";
        // Limpa todos os valores de exibição quando não há dados de performance
        const displayElements = ['display_name', 'display_type', 'display_doctrine', 'unit_cost', 'total_production_cost',
                                 'total_metal_cost', 'total_weight', 'total_power', 'speed_max_sl', 'speed_max_alt',
                                 'rate_of_climb', 'service_ceiling', 'max_range', 'turn_time', 'main_armament',
                                 'reliability_display', 'country_production_capacity', 'producible_units', 'country_metal_balance',
                                 'display_country_tech_civil', 'display_country_air_tech', 'display_country_urbanization', 'display_country_cost_reduction',
                                 'suggested_propeller', 'suggested_cooling', 'suggested_fuel_feed', 'speed-value', 'range-value', 'max-altitude',
                                 'speed-min', 'speed-max', 'range-min', 'range-max', 'engine_type_display', 'supercharger_type_display'];
        displayElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'display_name') el.textContent = 'Sem nome';
                else if (['display_type', 'display_doctrine', 'display_country_tech_civil', 'display_country_air_tech', 'display_country_urbanization', 'display_country_cost_reduction'].includes(id)) el.textContent = 'N/A';
                else if (id === 'main_armament') el.textContent = 'Desarmado';
                else if (['suggested_propeller', 'suggested_cooling', 'suggested_fuel_feed'].includes(id)) el.textContent = '---';
                else if (['speed-value', 'range-value', 'max-altitude', 'speed-min', 'speed-max', 'range-min', 'range-max'].includes(id)) el.textContent = '---';
                else if (['engine_type_display', 'supercharger_type_display'].includes(id)) el.textContent = '-';
                else el.textContent = '0';
            }
        });
        const metalStatusEl = document.getElementById('metal_balance_status');
        if (metalStatusEl) {
            metalStatusEl.textContent = '';
            metalStatusEl.className = 'text-xs font-medium mt-1 text-center';
        }

        // Limpar também as listas de equipamentos no resumo
        populateEquipmentListInUI('summary_wing_features', null);
        populateEquipmentListInUI('summary_engine_enhancements', null);
        populateEquipmentListInUI('summary_protection', null);
        populateEquipmentListInUI('summary_cockpit_comfort', null);
        populateEquipmentListInUI('summary_advanced_avionics', null);
        populateEquipmentListInUI('summary_equipment', null);
        populateEquipmentListInUI('summary_maintainability_features', null);

        // Resetar o Design Wizard
        document.getElementById('engine-selected-info').classList.add('hidden');
        document.getElementById('supercharger-step').classList.add('opacity-50', 'pointer-events-none');
        document.getElementById('supercharger-selected-info').classList.add('hidden');
        document.getElementById('combo-warning').classList.add('hidden');
        document.getElementById('performance-sliders-step').classList.add('opacity-50', 'pointer-events-none');
        document.getElementById('target-speed').disabled = true;
        document.getElementById('target-range').disabled = true;
        
        // Limpa os checkboxes de melhorias do motor
        const engineEnhancementsContainer = document.querySelector('#engine_enhancements_checkboxes .grid');
        if (engineEnhancementsContainer) engineEnhancementsContainer.innerHTML = '';

        return;
    }
    const { inputs, adjustedUnitCost, baseMetalCost, combatWeight, totalEnginePower, finalSpeedKmhSL, finalSpeedKmhAlt, rate_of_climb_ms, finalServiceCeiling, finalRangeKm, turn_time_s, finalReliability, offensiveArmamentTexts, defensiveArmamentTexts, countryData, typeData, countryCostReduction, suggestedPropeller, suggestedCooling, suggestedFuelFeed } = performance;

    // Novo objeto com valores formatados
    const formattedElements = {
        'display_name': inputs.aircraftName,
        'display_type': typeData.name,
        'display_doctrine': gameData.doctrines[inputs.selectedAirDoctrine]?.name || '-',
        'unit_cost': `£ ${adjustedUnitCost.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        'total_production_cost': `£ ${(adjustedUnitCost * inputs.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        'total_metal_cost': (baseMetalCost * inputs.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        'total_weight': `${Math.round(combatWeight).toLocaleString('pt-BR')} kg`,
        'total_power': `${Math.round(totalEnginePower).toLocaleString('pt-BR')} hp`,
        'speed_max_sl': `${Math.round(finalSpeedKmhSL).toLocaleString('pt-BR')} km/h`,
        'speed_max_alt': `${Math.round(finalSpeedKmhAlt).toLocaleString('pt-BR')} km/h`,
        'rate_of_climb': `${rate_of_climb_ms.toFixed(1)} m/s`,
        'service_ceiling': `${Math.round(finalServiceCeiling).toLocaleString('pt-BR')} m`,
        'max_range': `${Math.round(finalRangeKm).toLocaleString('pt-BR')} km`,
        'turn_time': `${turn_time_s.toFixed(1)} s`,
        'main_armament': offensiveArmamentTexts.length > 0 ? offensiveArmamentTexts.join(', ') : "Desarmado",
        'reliability_display': `${finalReliability.toFixed(1)}%`,
        'suggested_propeller': suggestedPropeller.name,
        'suggested_cooling': suggestedCooling.name,
        'suggested_fuel_feed': suggestedFuelFeed.name,
        'speed-value': `${inputs.targetSpeed} km/h`,
        'range-value': `${inputs.targetRange} km`,
        'max-altitude': `${Math.round(finalServiceCeiling).toLocaleString('pt-BR')} metros`,
        'engine_type_display': gameData.components.engineTypes[inputs.selectedEngineType]?.name || '-',
        'supercharger_type_display': gameData.components.superchargerTypes[inputs.selectedSuperchargerType]?.name || '-'
    };
    Object.entries(formattedElements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });

    if (countryData) {
        let countryProductionCapacity = countryData.production_capacity * (1 + ((inputs.productionQualitySliderValue / 100) * 0.25) - (((100 - inputs.productionQualitySliderValue) / 100) * 0.10));
        document.getElementById('country_production_capacity').textContent = Math.round(countryProductionCapacity).toLocaleString('pt-BR');

        const producibleUnits = adjustedUnitCost > 0 ? Math.floor(countryProductionCapacity / adjustedUnitCost) : 'N/A';
        document.getElementById('producible_units').textContent = typeof producibleUnits === 'number' ? producibleUnits.toLocaleString('pt-BR') : producibleUnits;

        document.getElementById('country_metal_balance').textContent = Math.round(countryData.metal_balance).toLocaleString('pt-BR');
        const totalMetalCost = baseMetalCost * inputs.quantity;
        const metalStatusEl = document.getElementById('metal_balance_status');
        if (metalStatusEl) {
            metalStatusEl.textContent = totalMetalCost > countryData.metal_balance ? '⚠️ Saldo de metais insuficiente!' : '✅ Saldo de metais suficiente.';
            metalStatusEl.className = `text-xs font-medium mt-1 text-center ${totalMetalCost > countryData.metal_balance ? 'text-red-600' : 'text-green-600'}`;
        }

        const displayCountryTechCivil = document.getElementById('display_country_tech_civil');
        if (displayCountryTechCivil) {
            displayCountryTechCivil.textContent = Math.round(countryData.tech_civil).toLocaleString('pt-BR');
        }
        const displayCountryAirTech = document.getElementById('display_country_air_tech');
        if (displayCountryAirTech) {
            displayCountryAirTech.textContent = Math.round(countryData.tech_level_air).toLocaleString('pt-BR');
        }
        const displayCountryUrbanization = document.getElementById('display_country_urbanization');
        if (displayCountryUrbanization) {
            displayCountryUrbanization.textContent = Math.round(countryData.urbanization).toLocaleString('pt-BR');
        }
        const displayCountryCostReduction = document.getElementById('display_country_cost_reduction');
        if (displayCountryCostReduction) {
            displayCountryCostReduction.textContent = `${(countryCostReduction * 100).toFixed(1)}%`;
        }
    }
    updateStatusAndWarnings(performance);

    populateEquipmentListInUI('summary_wing_features', inputs.checkboxes.wing_features.map(id => gameData.components.wing_features[id]?.name));
    populateEquipmentListInUI('summary_engine_enhancements', inputs.checkboxes.engine_enhancements.map(id => gameData.components.engine_enhancements[id]?.name));
    populateEquipmentListInUI('summary_protection', inputs.checkboxes.protection.map(id => gameData.components.protection[id]?.name));
    populateEquipmentListInUI('summary_cockpit_comfort', inputs.checkboxes.cockpit_comfort.map(id => gameData.components.cockpit_comfort[id]?.name));
    populateEquipmentListInUI('summary_advanced_avionics', inputs.checkboxes.advanced_avionics.map(id => gameData.components.advanced_avionics[id]?.name));
    populateEquipmentListInUI('summary_equipment', inputs.checkboxes.equipment.map(id => gameData.components.equipment[id]?.name));
    populateEquipmentListInUI('summary_maintainability_features', inputs.checkboxes.maintainability_features.map(id => gameData.components.maintainability_features[id]?.name));

    const armamentLimitsNote = document.getElementById('armament_limits_note');
    if (performance.armamentLimitExceeded && armamentLimitsNote) {
        armamentLimitsNote.classList.remove('hidden');
    } else if (armamentLimitsNote) {
        armamentLimitsNote.classList.add('hidden');
    }
}

/**
 * Alterna a visibilidade de uma seção (passo) do formulário.
 * @param {number} step - O número do passo a ser alternado.
 */
export function toggleStep(step) {
    const content = document.getElementById(`step_${step}_content`);
    const icon = document.getElementById(`step_${step}_icon`);
    const card = document.getElementById(`step_${step}`);
    if (!content || !icon || !card) return;

    if (content.classList.contains('hidden')) {
        for (let i = 1; i <= 5; i++) {
            const otherContent = document.getElementById(`step_${i}_content`);
            const otherIcon = document.getElementById(`step_${i}_icon`);
            const otherCard = document.getElementById(`step_${i}`);
            if (otherContent && otherIcon && otherCard) {
                if (i !== step) {
                    otherContent.classList.add('hidden');
                    otherIcon.classList.remove('rotate-180');
                    otherCard.classList.remove('active');
                }
            }
        }
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
        card.classList.add('active');
        currentStep = step;
    } else {
        content.classList.add('hidden');
        icon.classList.remove('rotate-180');
        card.classList.remove('active');
    }
}

/**
 * Atualiza a barra de progresso com base nos campos obrigatórios preenchidos.
 */
export async function updateProgress() {
    const { getCurrentSelections } = await import('./calculations.js');
    const { selectedEngineType, selectedSuperchargerType } = getCurrentSelections();
    
    const requiredFields = ['aircraft_name', 'country_doctrine', 'air_doctrine', 'aircraft_type', 'wing_position', 'wing_shape'];
    let completedFields = 0;
    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (field && field.value && field.value !== '' && field.value !== 'loading') completedFields++;
    });

    if (selectedEngineType) completedFields++;
    if (selectedSuperchargerType) completedFields++;

    const progressBar = document.getElementById('progress_bar');
    if (progressBar) {
        progressBar.style.width = `${(completedFields / (requiredFields.length + 2)) * 100}%`;
    }
}

/**
 * Gera a ficha da aeronave e a abre em uma nova aba.
 */
export function generateSheet() {
    const performanceData = updateCalculations();
    if (performanceData) {
        const aircraftImage = document.getElementById('aircraft_image');
        if (aircraftImage) {
            performanceData.aircraftImageSrc = aircraftImage.src;
        }

        performanceData.performanceGraphData = generatePerformanceGraphData(performanceData);
        localStorage.setItem('aircraftSheetData', JSON.stringify(performanceData));
        localStorage.setItem('realWorldAircraftData', JSON.stringify(realWorldAircraft));
        window.open('ficha.html', '_blank');
    } else {
        console.error("Não foi possível gerar a ficha: dados da aeronave são inválidos.");
        const statusContainer = document.getElementById('status-container');
        if (statusContainer) {
            statusContainer.innerHTML = '';
            const errorEl = document.createElement('div');
            errorEl.className = 'p-3 rounded-lg text-center text-sm font-medium status-error text-red-600';
            errorEl.textContent = '🔥 Erro: Preencha os campos obrigatórios para gerar a ficha.';
            statusContainer.appendChild(errorEl);
        }
    }
}

/**
 * Gera dados para o gráfico de performance (velocidade e taxa de subida vs. altitude).
 * @param {object} performanceData - Os dados de performance calculados da aeronave.
 * @returns {Array<object>} - Um array de objetos com altitude, velocidade e RoC.
 */
export function generatePerformanceGraphData(performanceData) {
    const { combatWeight, totalEnginePower, propData, aero, superchargerData, finalServiceCeiling, typeData } = performanceData;
    const data = [];
    for (let h = 0; h <= 15000; h += 1000) {
        let currentAlt = h;
        if (h > finalServiceCeiling && finalServiceCeiling > 0) {
            currentAlt = finalServiceCeiling;
        }
        const perfPoint = calculatePerformanceAtAltitude(currentAlt, combatWeight, totalEnginePower, propData, aero, superchargerData);
        let cappedSpeed = perfPoint.speed_kmh * aero.speed_mod;
        if (typeData.limits && cappedSpeed > typeData.limits.max_speed) {
            cappedSpeed = typeData.limits.max_speed;
        }
        data.push({
            altitude: currentAlt,
            speed: h > finalServiceCeiling && finalServiceCeiling > 0 ? 0 : cappedSpeed,
            roc: h > finalServiceCeiling && finalServiceCeiling > 0 ? 0 : calculateRateOfClimb(currentAlt, combatWeight, totalEnginePower, propData, aero, superchargerData)
        });
        if (h >= finalServiceCeiling && finalServiceCeiling > 0) {
            if (data[data.length -1].altitude !== finalServiceCeiling) {
                data.push({
                    altitude: finalServiceCeiling,
                    speed: Math.min(calculatePerformanceAtAltitude(finalServiceCeiling, combatWeight, totalEnginePower, propData, aero, superchargerData).speed_kmh * aero.speed_mod, typeData.limits.max_speed),
                    roc: 0
                });
            }
            break;
        }
    }
    return data;
}

/**
 * Função auxiliar para encontrar um item de componente em diferentes categorias em gameData.components.
 * @param {string} id - O ID do componente a ser encontrado.
 * @returns {object|null} - O objeto do componente se encontrado, caso contrário null.
 */
export function findItemAcrossCategories(id) {
    for (const categoryKey in gameData.components) {
        if (gameData.components[categoryKey][id]) {
            return gameData.components[categoryKey][id];
        }
    }
    return null;
}

/**
 * Atualiza a área de status e exibe avisos ou mensagens de sucesso.
 * @param {object} performance - O objeto de performance da aeronave.
 */
export function updateStatusAndWarnings(performance) {
    const statusContainer = document.getElementById('status-container');
    if (!statusContainer) return;

    statusContainer.innerHTML = ''; // Limpa mensagens anteriores
    let warnings = [];
    const { totalEnginePower, combatWeight, wingLoading, finalReliability, typeData, rawSpeedKmhAlt, rawRangeKm, armamentLimitExceeded } = performance;
    const powerToWeightRatio = (totalEnginePower * 745.7) / (combatWeight * gameData.constants.standard_gravity_ms2);

    if (powerToWeightRatio < 0.25 && typeData.name.includes('Caça')) warnings.push({ type: 'error', text: '🔥 Relação peso/potência crítica! Aeronave com performance muito baixa.' });
    else if (powerToWeightRatio < 0.35 && typeData.name.includes('Caça')) warnings.push({ type: 'warning', text: '⚠️ Relação peso/potência baixa. Aumente a potência ou reduza o peso.' });
    if (wingLoading > 200 && typeData.name.includes('Caça')) warnings.push({ type: 'warning', text: '⚠️ Carga alar alta, prejudicando a manobrabilidade em baixa velocidade.' });
    if (wingLoading > 250) warnings.push({ type: 'warning', text: '⚠️ Carga alar muito alta, resultando em altas velocidades de estol.' });
    if (finalReliability < 70) warnings.push({ type: 'error', text: '🔥 Confiabilidade baixa: Propenso a falhas críticas!' });
    if (typeData.limits) {
        if (rawSpeedKmhAlt < typeData.limits.min_speed) warnings.push({ type: 'warning', text: `⚠️ Velocidade abaixo do esperado para um ${typeData.name} (${Math.round(rawSpeedKmhAlt)} km/h).` });
        if (rawSpeedKmhAlt > typeData.limits.max_speed) warnings.push({ type: 'warning', text: `⚠️ Velocidade acima do esperado para um ${typeData.name}. (Calculado: ${Math.round(rawSpeedKmhAlt)} km/h, Limitado a: ${typeData.limits.max_speed} km/h)` });
        if (rawRangeKm / gameData.constants.range_balance_factor > typeData.limits.max_range) warnings.push({ type: 'warning', text: `⚠️ Alcance acima do esperado para um ${typeData.name}. (Calculado: ${Math.round(rawRangeKm / gameData.constants.range_balance_factor)} km, Limitado a: ${typeData.limits.max_range} km)` });
    }
    if (armamentLimitExceeded) {
        warnings.push({ type: 'warning', text: '⚠️ Armamento selecionado excede os limites da configuração de asa. Alguns armamentos foram removidos.' });
    }

    if (warnings.length === 0) {
        warnings.push({ type: 'ok', text: '✅ Design pronto para os céus! Clique no ícone de relatório para gerar a ficha.' });
    }
    warnings.forEach(warning => {
        const statusEl = document.createElement('div');
        statusEl.className = `p-3 rounded-lg text-center text-sm font-medium status-${warning.type}`;
        statusEl.textContent = warning.text;
        statusContainer.appendChild(statusEl);
    });
}

/**
 * Cria e adiciona o menu de templates flutuante à página.
 * @param {TemplateManager} templateManagerInstance - Instância do TemplateManager.
 */
export function createTemplateMenu(templateManagerInstance) {
    const menuContainer = document.createElement('div');
    menuContainer.className = 'fixed top-4 right-4 z-40';
    menuContainer.innerHTML = `
        <button id="template-menu-btn" class="bg-purple-500 text-white p-3 rounded-full shadow-lg hover:bg-purple-600 transition-colors">
            <i class="fas fa-magic"></i>
        </button>
        <div id="template-menu" class="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg min-w-48 hidden">
            <div class="p-3 border-b border-gray-200">
                <h3 class="font-semibold text-gray-800">🎯 Templates</h3>
            </div>
            <div class="p-2">
                ${templateManagerInstance.getAllTemplates().map(t => `
                    <button data-template-id="${t.id}" class="w-full text-left p-2 hover:bg-gray-100 rounded text-sm template-apply-btn">
                        <div class="font-medium">${t.name}</div>
                        <div class="text-xs text-gray-600">${t.description}</div>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(menuContainer);

    const btn = document.getElementById('template-menu-btn');
    const menu = document.getElementById('template-menu');
    if (btn && menu) {
        btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!menuContainer.contains(e.target)) menu.classList.add('hidden'); });

        document.querySelectorAll('.template-apply-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const templateId = e.currentTarget.dataset.templateId;
                templateManagerInstance.applyTemplate(templateId);
                menu.classList.add('hidden');
            });
        });
    }
}

/**
 * Cria e adiciona os botões de desfazer/refazer flutuantes à página.
 * @param {StateManager} stateManagerInstance - Instância do StateManager.
 * @param {KeyboardManager} keyboardManagerInstance - Instância do KeyboardManager.
 */
export function createUndoRedoButtons(stateManagerInstance, keyboardManagerInstance) {
    const container = document.createElement('div');
    container.className = 'fixed bottom-4 left-4 flex flex-col gap-2 z-40';
    container.innerHTML = `
        <button id="undo-btn" class="bg-gray-700 text-white w-10 h-10 rounded-full shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            <i class="fas fa-undo"></i>
        </button>
        <button id="redo-btn" class="bg-gray-700 text-white w-10 h-10 rounded-full shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            <i class="fas fa-redo"></i>
        </button>
    `;
    document.body.appendChild(container);

    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn && redoBtn) {
        undoBtn.onclick = () => keyboardManagerInstance.undo();
        redoBtn.onclick = () => keyboardManagerInstance.redo();
        stateManagerInstance.addListener((manager) => {
            undoBtn.disabled = !manager.canUndo();
            redoBtn.disabled = !manager.canRedo();
        });
    }
}

/**
 * Popula os dropdowns de Posição da Asa e Formato da Asa.
 * Aplica as restrições de tecnologia.
 */
export function populateWingDropdowns() {
    const wingPositionSelect = document.getElementById('wing_position');
    const wingShapeSelect = document.getElementById('wing_shape');
    const currentTechLevel = gameData.currentCountryTechLevel || 0;

    if (wingPositionSelect) {
        wingPositionSelect.innerHTML = '<option value="">Selecione a Posição...</option>';
        const sortedPositions = Object.keys(gameData.components.wing_positions).sort((a, b) => {
            const wingType = document.getElementById('wing_type')?.value;
            if (wingType === 'biplane') {
                if (a === 'biplane_wing_pos') return -1;
                if (b === 'biplane_wing_pos') return 1;
            }
            return gameData.components.wing_positions[a].name.localeCompare(gameData.components.wing_positions[b].name);
        });

        sortedPositions.forEach(key => {
            const position = gameData.components.wing_positions[key];
            const option = document.createElement('option');
            option.value = key;
            option.textContent = position.name;
            if (position.tech_level_required && currentTechLevel < position.tech_level_required) {
                option.disabled = true;
                option.textContent += ` (Requer Tec. ${position.tech_level_required}+)`;
            }
            wingPositionSelect.appendChild(option);
        });
        wingPositionSelect.addEventListener('change', updateWingPositionInfo);
    }

    if (wingShapeSelect) {
        wingShapeSelect.innerHTML = '<option value="">Selecione o Formato...</option>';
        const sortedShapes = Object.keys(gameData.components.wing_shapes).sort((a, b) =>
            gameData.components.wing_shapes[a].name.localeCompare(gameData.components.wing_shapes[b].name)
        );
        sortedShapes.forEach(key => {
            const shape = gameData.components.wing_shapes[key];
            const option = document.createElement('option');
            option.value = key;
            option.textContent = shape.name;
            if (shape.tech_level_required && currentTechLevel < shape.tech_level_required) {
                option.disabled = true;
                option.textContent += ` (Requer Tec. ${shape.tech_level_required}+)`;
            }
            wingShapeSelect.appendChild(option);
        });
        wingShapeSelect.addEventListener('change', updateWingShapeInfo);
    }
}

/**
 * Atualiza as informações de descrição e imagem para a Posição da Asa selecionada.
 */
function updateWingPositionInfo() {
    const select = document.getElementById('wing_position');
    const infoDiv = document.getElementById('wing_position_info');
    const img = document.getElementById('wing_position_img');
    const desc = document.getElementById('wing_position_description');
    const selectedKey = select.value;

    if (selectedKey && gameData.components.wing_positions[selectedKey]) {
        const data = gameData.components.wing_positions[selectedKey];
        img.src = data.svg_url;
        desc.textContent = data.description;
        infoDiv.classList.remove('hidden');
    } else {
        infoDiv.classList.add('hidden');
        img.src = '';
        desc.textContent = '';
    }
    updateCalculations();
}

/**
 * Atualiza as informações de descrição e imagem para o Formato da Asa selecionado.
 */
function updateWingShapeInfo() {
    const select = document.getElementById('wing_shape');
    const infoDiv = document.getElementById('wing_shape_info');
    const img = document.getElementById('wing_shape_img');
    const desc = document.getElementById('wing_shape_description');
    const selectedKey = select.value;

    if (selectedKey && gameData.components.wing_shapes[selectedKey]) {
        const data = gameData.components.wing_shapes[selectedKey];
        img.src = data.svg_url;
        desc.textContent = data.description;
        infoDiv.classList.remove('hidden');
    } else {
        infoDiv.classList.add('hidden');
        img.src = '';
        desc.textContent = '';
    }
    updateCalculations();
}

/**
 * Popula os dropdowns e checkboxes com base no nível de tecnologia do país.
 * @param {number} techLevel - O nível de tecnologia aeronáutica do país.
 */
export function applyTechLevelRestrictions(techLevel) {
    gameData.currentCountryTechLevel = techLevel;

    let currentTier = null;
    for (const tierKey in techLevelRestrictions) {
        const tier = techLevelRestrictions[tierKey];
        if (techLevel >= tier.min_tech) {
            if (!currentTier || tier.min_tech > currentTier.min_tech) {
                currentTier = tier;
            }
        }
    }
    if (!currentTier) {
        currentTier = techLevelRestrictions.tier_primitive;
    }

    populateWingDropdowns();

    document.querySelectorAll('select, input[type="checkbox"]').forEach(element => {
        const componentId = element.id;
        const componentData = findItemAcrossCategories(componentId);

        element.disabled = false;
        if (element.closest('.checkbox-row')) {
            element.closest('.checkbox-row').classList.remove('hidden');
        } else if (element.tagName === 'OPTION') {
            element.disabled = false;
            element.textContent = element.dataset.originalText || element.textContent.replace(/ \(Requer Tec\. \d+\+\)/g, '');
        }

        if (currentTier.blocked_components.includes(componentId)) {
            if (element.tagName === 'SELECT') {
                element.disabled = true;
                element.value = '';
                if (element.options.length > 0) element.value = element.options[0].value;
            } else if (element.type === 'checkbox') {
                element.checked = false;
                element.disabled = true;
                if (element.closest('.checkbox-row')) {
                    element.closest('.checkbox-row').classList.add('hidden');
                }
            }
        }

        if (componentData && componentData.tech_level_required !== undefined) {
            if (techLevel < componentData.tech_level_required) {
                if (element.tagName === 'SELECT') {
                    Array.from(element.options).forEach(option => {
                        if (option.value === componentId) {
                            option.disabled = true;
                            option.dataset.originalText = option.textContent;
                            option.textContent += ` (Requer Tec. ${componentData.tech_level_required}+)`;
                        }
                    });
                } else if (element.type === 'checkbox') {
                    element.checked = false;
                    element.disabled = true;
                    if (element.closest('.checkbox-row')) {
                        element.closest('.checkbox-row').classList.add('hidden');
                    }
                }
            }
        }
    });

    const wingTypeSelect = document.getElementById('wing_type');
    if (wingTypeSelect) {
        if (currentTier.forced_wing_type === 'biplane_wing_pos') {
            wingTypeSelect.value = 'biplane';
            wingTypeSelect.disabled = true;
        } else {
            wingTypeSelect.disabled = false;
        }
    }

    const wingPositionSelect = document.getElementById('wing_position');
    if (wingPositionSelect) {
        if (document.getElementById('wing_type')?.value === 'biplane') {
            wingPositionSelect.value = 'biplane_wing_pos';
            wingPositionSelect.disabled = true;
            updateWingPositionInfo();
        } else {
            wingPositionSelect.disabled = false;
            if (wingPositionSelect.value === 'biplane_wing_pos') {
                wingPositionSelect.value = '';
                updateWingPositionInfo();
            }
        }
    }

    populateEngineTypeSelection();
    setCurrentSelections(null, null);
    document.getElementById('engine-selected-info').classList.add('hidden');
    document.getElementById('supercharger-step').classList.add('opacity-50', 'pointer-events-none');
    document.getElementById('supercharger-selected-info').classList.add('hidden');
    document.getElementById('combo-warning').classList.add('hidden');
    document.getElementById('performance-sliders-step').classList.add('opacity-50', 'pointer-events-none');
    document.getElementById('target-speed').disabled = true;
    document.getElementById('target-range').disabled = true;
    document.getElementById('target-speed').value = 0;
    document.getElementById('target-range').value = 0;
    updateUI(null);

    updateCalculations();
}

/**
 * Popula a seleção de tipos de motor no Passo 3.
 */
export function populateEngineTypeSelection() {
    const engineSelectionDiv = document.getElementById('engine-type-selection');
    if (!engineSelectionDiv) return;

    engineSelectionDiv.innerHTML = '';
    const currentTechLevel = gameData.currentCountryTechLevel || 0;
    const countryName = document.getElementById('country_doctrine')?.value;

    Object.entries(gameData.components.engineTypes).forEach(([key, engine]) => {
        const isDisabled = engine.tech_level_required && currentTechLevel < engine.tech_level_required;
        const isBlockedByTier = techLevelRestrictions.tier_basic.blocked_engines?.includes(key) && currentTechLevel < techLevelRestrictions.tier_basic.min_tech;
        const isNationSpecificBlocked = engine.nation_specific && !engine.nation_specific.includes(countryName);

        if (isDisabled || isBlockedByTier || isNationSpecificBlocked) {
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `engine-choice-btn p-3 border rounded-lg hover:bg-blue-50 transition-colors text-left bg-white border-gray-300`;
        button.dataset.engine = key;
        button.innerHTML = `
            <div class="font-bold text-gray-800">${engine.name}</div>
            <div class="text-xs text-gray-600 mt-1">${engine.best_for}</div>
            <div class="flex flex-wrap gap-2 mt-2">
                ${engine.characteristics.max_speed_bonus ? '<span class="text-green-600 text-xs flex items-center"><i class="fas fa-arrow-up mr-1"></i>Velocidade</span>' : ''}
                ${engine.characteristics.acceleration_bonus ? '<span class="text-blue-600 text-xs flex items-center"><i class="fas fa-rocket mr-1"></i>Aceleração</span>' : ''}
                ${engine.characteristics.reliability_bonus ? '<span class="text-purple-600 text-xs flex items-center"><i class="fas fa-check-circle mr-1"></i>Confiável</span>' : ''}
                ${engine.characteristics.drag_penalty ? '<span class="text-red-600 text-xs flex items-center"><i class="fas fa-wind mr-1"></i>-Arrasto</span>' : ''}
                ${engine.characteristics.fuel_efficiency && engine.characteristics.fuel_efficiency > 1 ? '<span class="text-green-600 text-xs flex items-center"><i class="fas fa-gas-pump mr-1"></i>+Eficiência</span>' : ''}
                ${engine.characteristics.fuel_efficiency && engine.characteristics.fuel_efficiency < 1 ? '<span class="text-red-600 text-xs flex items-center"><i class="fas fa-gas-pump mr-1"></i>-Eficiência</span>' : ''}
            </div>
        `;
        button.addEventListener('click', () => selectEngineType(key));
        engineSelectionDiv.appendChild(button);
    });
}

/**
 * Seleciona um tipo de motor e atualiza a UI.
 * @param {string} engineKey - A chave do tipo de motor selecionado.
 */
function selectEngineType(engineKey) {
    setCurrentSelections(engineKey, null);
    const engine = gameData.components.engineTypes[engineKey];

    document.querySelectorAll('.engine-choice-btn').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'border-blue-500');
        btn.classList.add('bg-white', 'border-gray-300');
    });
    const selectedButton = document.querySelector(`[data-engine="${engineKey}"]`);
    if (selectedButton) {
        selectedButton.classList.remove('bg-white', 'border-gray-300');
        selectedButton.classList.add('bg-blue-100', 'border-blue-500');
    }

    document.getElementById('selected_engine_name').textContent = engine.name;
    document.getElementById('selected_engine_description').textContent = engine.description;
    const charContainer = document.getElementById('selected_engine_characteristics');
    charContainer.innerHTML = '';
    Object.entries(engine.characteristics).forEach(([charKey, value]) => {
        let text = '';
        let colorClass = 'text-gray-700';
        if (typeof value === 'number' && value !== 1.0) {
            if (charKey.includes('bonus') || charKey.includes('reduction') || (charKey.includes('efficiency') && value > 1)) {
                text = `+${((value - 1) * 100).toFixed(0)}% ${charKey.replace(/_bonus|_reduction/g, '')}`;
                colorClass = 'text-green-600';
            } else if (charKey.includes('penalty') || charKey.includes('terrible') || charKey.includes('difficulty') || (charKey.includes('consumption') && value > 1)) {
                text = `${((value - 1) * 100).toFixed(0)}% ${charKey.replace(/_penalty|_terrible|_difficulty|_horror/g, '')}`;
                colorClass = 'text-red-600';
            } else {
                text = `${charKey}: ${value}`;
            }
        } else if (typeof value === 'boolean') {
            text = value ? charKey.replace(/_/g, ' ') : '';
            colorClass = 'text-blue-600';
        } else if (typeof value === 'string') {
            text = `${charKey}: ${value}`;
        }
        if (text) {
            const span = document.createElement('span');
            span.className = `text-xs p-1 rounded-full ${colorClass} bg-opacity-20`;
            span.textContent = text;
            charContainer.appendChild(span);
        }
    });
    document.getElementById('engine-selected-info').classList.remove('hidden');

    document.getElementById('supercharger-step').classList.remove('opacity-50', 'pointer-events-none');
    populateSuperchargerSelection();
    
    setCurrentSelections(engineKey, null);
    document.getElementById('supercharger-selected-info').classList.add('hidden');
    document.getElementById('combo-warning').classList.add('hidden');
    document.getElementById('performance-sliders-step').classList.add('opacity-50', 'pointer-events-none');
    document.getElementById('target-speed').disabled = true;
    document.getElementById('target-range').disabled = true;

    updateCalculations();
    updateProgress();
}

/**
 * Popula a seleção de tipos de sobrealimentador no Passo 3.
 */
export async function populateSuperchargerSelection() {
    const superchargerSelectionDiv = document.getElementById('supercharger-selection');
    if (!superchargerSelectionDiv) return;

    superchargerSelectionDiv.innerHTML = '';
    const currentTechLevel = gameData.currentCountryTechLevel || 0;
    const countryName = document.getElementById('country_doctrine')?.value;
    
    const { getCurrentSelections } = await import('./calculations.js');
    const { selectedEngineType } = getCurrentSelections();

    Object.entries(gameData.components.superchargerTypes).forEach(([key, supercharger]) => {
        const isDisabled = supercharger.tech_level_required && currentTechLevel < supercharger.tech_level_required;
        const isNationSpecificBlocked = supercharger.nation_specific && !supercharger.nation_specific.includes(countryName);

        const comboLimits = engineSuperchargerCombos.calculateLimits(selectedEngineType, key);
        const isBlockedByCombo = comboLimits.special?.blocked;

        if (isDisabled || isNationSpecificBlocked) {
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `supercharger-choice-btn p-3 border rounded-lg hover:bg-blue-50 transition-colors text-left bg-white border-gray-300 ${isBlockedByCombo ? 'opacity-50 cursor-not-allowed' : ''}`;
        button.dataset.supercharger = key;
        button.disabled = isBlockedByCombo;
        button.innerHTML = `
            <div class="font-bold text-gray-800">${supercharger.name}</div>
            <div class="text-xs text-gray-600 mt-1">${supercharger.best_for}</div>
            <div class="flex flex-wrap gap-2 mt-2">
                ${supercharger.characteristics.power_modifier && supercharger.characteristics.power_modifier > 1 ? '<span class="text-green-600 text-xs flex items-center"><i class="fas fa-arrow-up mr-1"></i>Potência</span>' : ''}
                ${supercharger.characteristics.altitude_limit ? `<span class="text-blue-600 text-xs flex items-center"><i class="fas fa-mountain mr-1"></i>${supercharger.characteristics.altitude_limit / 1000}km Teto</span>` : ''}
                ${supercharger.characteristics.reliability_modifier && supercharger.characteristics.reliability_modifier < 1 ? '<span class="text-red-600 text-xs flex items-center"><i class="fas fa-exclamation-triangle mr-1"></i>-Confiável</span>' : ''}
                ${supercharger.characteristics.weight && supercharger.characteristics.weight > 0 ? `<span class="text-orange-600 text-xs flex items-center"><i class="fas fa-weight-hanging mr-1"></i>+${supercharger.characteristics.weight}kg</span>` : ''}
            </div>
            ${isBlockedByCombo ? `<div class="text-red-500 text-xs mt-1">Incompatível com ${gameData.components.engineTypes[selectedEngineType]?.name}</div>` : ''}
        `;
        button.addEventListener('click', () => selectSuperchargerType(key));
        superchargerSelectionDiv.appendChild(button);
    });
}

/**
 * Seleciona um tipo de sobrealimentador e atualiza a UI.
 * @param {string} superchargerKey - A chave do tipo de sobrealimentador selecionado.
 */
async function selectSuperchargerType(superchargerKey) {
    const { getCurrentSelections } = await import('./calculations.js');
    const { selectedEngineType } = getCurrentSelections();
    
    setCurrentSelections(selectedEngineType, superchargerKey);
    const supercharger = gameData.components.superchargerTypes[superchargerKey];

    document.querySelectorAll('.supercharger-choice-btn').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'border-blue-500');
        btn.classList.add('bg-white', 'border-gray-300');
    });
    const selectedButton = document.querySelector(`[data-supercharger="${superchargerKey}"]`);
    if (selectedButton) {
        selectedButton.classList.remove('bg-white', 'border-gray-300');
        selectedButton.classList.add('bg-blue-100', 'border-blue-500');
    }

    document.getElementById('selected_supercharger_name').textContent = supercharger.name;
    document.getElementById('selected_supercharger_description').textContent = supercharger.description;
    const charContainer = document.getElementById('selected_supercharger_characteristics');
    charContainer.innerHTML = '';
    Object.entries(supercharger.characteristics).forEach(([charKey, value]) => {
        let text = '';
        let colorClass = 'text-gray-700';
        if (typeof value === 'number' && value !== 1.0) {
            if (charKey.includes('bonus') || (charKey.includes('modifier') && value > 1)) {
                text = `+${((value - 1) * 100).toFixed(0)}% ${charKey.replace(/_bonus|_modifier/g, '')}`;
                colorClass = 'text-green-600';
            } else if (charKey.includes('penalty') || charKey.includes('issue') || (charKey.includes('modifier') && value < 1)) {
                text = `${((1 - value) * 100).toFixed(0)}% ${charKey.replace(/_penalty|_issue/g, '')}`;
                colorClass = 'text-red-600';
            } else {
                text = `${charKey}: ${value}`;
            }
        } else if (typeof value === 'boolean') {
            text = value ? charKey.replace(/_/g, ' ') : '';
            colorClass = 'text-blue-600';
        } else if (typeof value === 'string') {
            text = `${charKey}: ${value}`;
        }
        if (text) {
            const span = document.createElement('span');
            span.className = `text-xs p-1 rounded-full ${colorClass} bg-opacity-20`;
            span.textContent = text;
            charContainer.appendChild(span);
        }
    });
    document.getElementById('supercharger-selected-info').classList.remove('hidden');

    const comboLimits = engineSuperchargerCombos.calculateLimits(selectedEngineType, superchargerKey);
    const comboWarningEl = document.getElementById('combo-warning');
    if (comboLimits.special?.blocked) {
        comboWarningEl.textContent = `🚫 ${comboLimits.special.reason}`;
        comboWarningEl.classList.remove('hidden');
        document.getElementById('performance-sliders-step').classList.add('opacity-50', 'pointer-events-none');
        document.getElementById('target-speed').disabled = true;
        document.getElementById('target-range').disabled = true;
    } else {
        comboWarningEl.classList.add('hidden');
        document.getElementById('performance-sliders-step').classList.remove('opacity-50', 'pointer-events-none');
        updatePerformanceSliders(comboLimits);
    }

    updateCalculations();
    updateProgress();
}

/**
 * Atualiza os limites e valores dos sliders de performance.
 * @param {object} limits - Objeto com os limites de velocidade e alcance.
 */
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

    document.getElementById('speed-min').textContent = `Min: ${limits.speed.min} km/h`;
    document.getElementById('speed-max').textContent = `Max: ${limits.speed.max} km/h`;
    document.getElementById('range-min').textContent = `Min: ${limits.range.min} km`;
    document.getElementById('range-max').textContent = `Max: ${limits.range.max} km`;
    document.getElementById('max-altitude').textContent = `${limits.altitude} metros`;

    speedSlider.oninput = updateDesignConsequences;
    rangeSlider.oninput = updateDesignConsequences;

    updateDesignConsequences();
    populateEngineEnhancementsCheckboxes();
}

/**
 * Atualiza as consequências do design com base nos valores dos sliders.
 */
export function updateDesignConsequences() {
    const targetSpeed = parseInt(document.getElementById('target-speed').value);
    const targetRange = parseInt(document.getElementById('target-range').value);

    document.getElementById('speed-value').textContent = `${targetSpeed} km/h`;
    document.getElementById('range-value').textContent = `${targetRange} km`;

    const speedConsequencesEl = document.getElementById('speed-consequences');
    const rangeConsequencesEl = document.getElementById('range-consequences');

    let speedConsequences = [];
    let rangeConsequences = [];

    const speedPenaltyTierKey = Object.keys(designPenalties.speedPenalties)
        .filter(key => parseInt(key) <= targetSpeed)
        .sort((a, b) => parseInt(b) - parseInt(a))[0];

    if (speedPenaltyTierKey) {
        const penalties = designPenalties.speedPenalties[speedPenaltyTierKey];
        if (penalties.turn_rate_penalty < 1) speedConsequences.push(`Manobrabilidade: ${((1 - penalties.turn_rate_penalty) * 100).toFixed(0)}% pior`);
        if (penalties.climb_rate_penalty < 1) speedConsequences.push(`Taxa de Subida: ${((1 - penalties.climb_rate_penalty) * 100).toFixed(0)}% pior`);
        if (penalties.structural_stress && penalties.structural_stress !== "normal") speedConsequences.push(`Estresse Estrutural: ${penalties.structural_stress}`);
        if (penalties.maintenance_multiplier && penalties.maintenance_multiplier > 1) speedConsequences.push(`Custo Manutenção: ${((penalties.maintenance_multiplier - 1) * 100).toFixed(0)}% maior`);
        if (penalties.accident_risk) speedConsequences.push(`Risco de Acidente: ${penalties.accident_risk}`);
    }

    if (targetSpeed < 450) {
        speedConsequences.push("✅ Motor simples e confiável (+20% confiabilidade)");
        speedConsequences.push("✅ Custo de produção reduzido em 30%");
    }

    const rangePenaltyTierKey = Object.keys(designPenalties.rangePenalties)
        .filter(key => parseInt(key) <= targetRange)
        .sort((a, b) => parseInt(b) - parseInt(a))[0];

    if (rangePenaltyTierKey) {
        const penalties = designPenalties.rangePenalties[rangePenaltyTierKey];
        if (penalties.weight_penalty > 1) rangeConsequences.push(`Peso: ${((penalties.weight_penalty - 1) * 100).toFixed(0)}% maior`);
        if (penalties.maneuverability_penalty < 1) rangeConsequences.push(`Manobrabilidade: ${((1 - penalties.maneuverability_penalty) * 100).toFixed(0)}% pior`);
    }

    speedConsequencesEl.innerHTML = speedConsequences.length > 0 ? speedConsequences.map(c => `<span>${c}</span>`).join('<br>') : '<span>Nenhuma consequência notável.</span>';
    rangeConsequencesEl.innerHTML = rangeConsequences.length > 0 ? rangeConsequences.map(c => `<span>${c}</span>`).join('<br>') : '<span>Nenhuma consequência notável.</span>';

    updateCalculations();
}

/**
 * Popula os checkboxes de melhorias do motor com base no tipo de motor selecionado.
 */
function populateEngineEnhancementsCheckboxes() {
    const container = document.querySelector('#engine_enhancements_checkboxes .grid');
    if (!container) return;

    container.innerHTML = '';
    const currentTechLevel = gameData.currentCountryTechLevel || 0;

    Object.entries(gameData.components.engine_enhancements).forEach(([key, enhancement]) => {
        const isDisabledByTech = enhancement.tech_level_required && currentTechLevel < enhancement.tech_level_required;
        const isBlockedByTier = techLevelRestrictions.tier_basic.blocked_components?.includes(key) && currentTechLevel < techLevelRestrictions.tier_basic.min_tech;

        const div = document.createElement('div');
        div.className = 'checkbox-row';
        div.innerHTML = `
            <input type="checkbox" id="${key}" class="w-4 h-4 text-orange-600" ${isDisabledByTech || isBlockedByTier ? 'disabled' : ''}>
            <label for="${key}" class="text-sm">${enhancement.name} ${isDisabledByTech ? `(Requer Tec. ${enhancement.tech_level_required}+)` : ''}</label>
        `;
        container.appendChild(div);

        div.querySelector('input[type="checkbox"]').addEventListener('change', updateCalculations);
    });
}

/**
 * Popula os dropdowns e checkboxes com base no nível de tecnologia do país.
 * Esta função é chamada ao carregar a página e ao mudar o país.
 */
export function populateTechRestrictedFields(techLevel) {
    gameData.currentCountryTechLevel = techLevel;

    let currentTier = null;
    for (const tierKey in techLevelRestrictions) {
        const tier = techLevelRestrictions[tierKey];
        if (techLevel >= tier.min_tech) {
            if (!currentTier || tier.min_tech > currentTier.min_tech) {
                currentTier = tier;
            }
        }
    }
    if (!currentTier) {
        currentTier = techLevelRestrictions.tier_primitive;
    }

    populateWingDropdowns();

    document.querySelectorAll('select, input[type="checkbox"]').forEach(element => {
        const componentId = element.id;
        const componentData = findItemAcrossCategories(componentId);

        element.disabled = false;
        if (element.closest('.checkbox-row')) {
            element.closest('.checkbox-row').classList.remove('hidden');
        } else if (element.tagName === 'OPTION') {
            element.disabled = false;
            element.textContent = element.dataset.originalText || element.textContent.replace(/ \(Requer Tec\. \d+\+\)/g, '');
        }

        if (currentTier.blocked_components.includes(componentId)) {
            if (element.tagName === 'SELECT') {
                element.disabled = true;
                element.value = '';
                if (element.options.length > 0) element.value = element.options[0].value;
            } else if (element.type === 'checkbox') {
                element.checked = false;
                element.disabled = true;
                if (element.closest('.checkbox-row')) {
                    element.closest('.checkbox-row').classList.add('hidden');
                }
            }
        }

        if (componentData && componentData.tech_level_required !== undefined) {
            if (techLevel < componentData.tech_level_required) {
                if (element.tagName === 'SELECT') {
                    Array.from(element.options).forEach(option => {
                        if (option.value === componentId) {
                            option.disabled = true;
                            option.dataset.originalText = option.textContent;
                            option.textContent += ` (Requer Tec. ${componentData.tech_level_required}+)`;
                        }
                    });
                } else if (element.type === 'checkbox') {
                    element.checked = false;
                    element.disabled = true;
                    if (element.closest('.checkbox-row')) {
                        element.closest('.checkbox-row').classList.add('hidden');
                    }
                }
            }
        }
    });

    const wingTypeSelect = document.getElementById('wing_type');
    if (wingTypeSelect) {
        if (currentTier.forced_wing_type === 'biplane_wing_pos') {
            wingTypeSelect.value = 'biplane';
            wingTypeSelect.disabled = true;
        } else {
            wingTypeSelect.disabled = false;
        }
    }

    const wingPositionSelect = document.getElementById('wing_position');
    if (wingPositionSelect) {
        if (document.getElementById('wing_type')?.value === 'biplane') {
            wingPositionSelect.value = 'biplane_wing_pos';
            wingPositionSelect.disabled = true;
            updateWingPositionInfo();
        } else {
            wingPositionSelect.disabled = false;
            if (wingPositionSelect.value === 'biplane_wing_pos') {
                wingPositionSelect.value = '';
                updateWingPositionInfo();
            }
        }
    }

    populateEngineTypeSelection();
    setCurrentSelections(null, null);
    document.getElementById('engine-selected-info').classList.add('hidden');
    document.getElementById('supercharger-step').classList.add('opacity-50', 'pointer-events-none');
    document.getElementById('supercharger-selected-info').classList.add('hidden');
    document.getElementById('combo-warning').classList.add('hidden');
    document.getElementById('performance-sliders-step').classList.add('opacity-50', 'pointer-events-none');
    document.getElementById('target-speed').disabled = true;
    document.getElementById('target-range').disabled = true;
    document.getElementById('target-speed').value = 0;
    document.getElementById('target-range').value = 0;
    updateUI(null);

    updateCalculations();
}

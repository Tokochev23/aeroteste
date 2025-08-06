// assets/js/calculations.js

import { gameData, techLevelRestrictions, engineSuperchargerCombos, performanceTradeoffs, designPenalties } from './data.js';
import { updateUI, updateProgress, updateStatusAndWarnings } from './ui.js';
import { stateManager, autoSaveManager } from './managers.js';

// Variáveis de seleção - serão atualizadas pela UI
let selectedEngineType = null;
let selectedSuperchargerType = null;

// Função para atualizar as seleções (será chamada pela UI)
export function updateEngineSelections(engineType, superchargerType) {
    selectedEngineType = engineType;
    selectedSuperchargerType = superchargerType;
}

// Função para obter as seleções atuais (acesso seguro)
export function getCurrentSelections() {
    return { selectedEngineType, selectedSuperchargerType };
}

// Função para definir as seleções externamente (para uso pelo UI)
export function setCurrentSelections(engineType, superchargerType) {
    selectedEngineType = engineType;
    selectedSuperchargerType = superchargerType;
}

// --- FUNÇÕES DE CÁLCULO AERODINÂMICO E DE PERFORMANCE ---

/**
 * Calcula as propriedades do ar (densidade, temperatura, pressão) em uma dada altitude.
 * Utiliza o modelo da Atmosfera Padrão Internacional (ISA).
 * @param {number} altitude_m - Altitude em metros.
 * @returns {object} - Objeto contendo densidade (kg/m^3), temperatura (K) e pressão (Pa).
 */
export function getAirPropertiesAtAltitude(h_m) {
    const h = Math.max(0, h_m); // Altitude não pode ser negativa
    const T0 = gameData.constants.temp_sea_level_k;
    const P0 = gameData.constants.pressure_sea_level_pa;
    const L = gameData.constants.temp_lapse_rate_k_per_m;
    const R = gameData.constants.gas_constant_air_specific;
    const g = gameData.constants.standard_gravity_ms2;

    const T = Math.max(216.65, T0 - L * h); // Temperatura em Kelvin, limitada na tropopausa
    const P = P0 * Math.pow((T / T0), g / (L * R));
    const rho = P / (R * T);

    return { temperature: T, pressure: P, density: rho };
}

/**
 * Calcula a potência do motor em uma dada altitude, considerando os efeitos do supercharger e diminishing returns.
 * @param {number} basePower - Potência do motor ao nível do mar (HP).
 * @param {number} h - Altitude em metros.
 * @param {object} superchargerData - Dados do supercharger.
 * @returns {number} - Potência do motor ajustada em HP.
 */
export function calculateEnginePowerAtAltitude(basePower, h, superchargerData) {
    let currentPower = 0;
    if (!superchargerData || superchargerData.name === "Aspiração Natural") {
        const currentAltProps = getAirPropertiesAtAltitude(h);
        const densityRatio = currentAltProps.density / gameData.constants.density_sea_level_kg_m3;
        currentPower = basePower * densityRatio;
    } else if (superchargerData.characteristics?.optimal_altitude && h <= superchargerData.characteristics.optimal_altitude) {
        currentPower = basePower * (superchargerData.characteristics.power_modifier || 1.0);
    } else if (superchargerData.characteristics?.optimal_altitudes) {
        // Para superchargers com múltiplas altitudes ótimas
        const optimalAlt = superchargerData.characteristics.optimal_altitudes.reduce((prev, curr) =>
            Math.abs(curr - h) < Math.abs(prev - h) ? curr : prev
        );
        if (h <= optimalAlt) {
            currentPower = basePower * (superchargerData.characteristics.power_modifier || 1.0);
        } else {
            const optimalAltProps = getAirPropertiesAtAltitude(optimalAlt);
            const currentAltProps = getAirPropertiesAtAltitude(h);
            const densityRatio = currentAltProps.density / optimalAltProps.density;
            currentPower = basePower * (superchargerData.characteristics.power_modifier || 1.0) * densityRatio;
        }
    } else {
        // Fallback para superchargers com apenas altitude limite
        const altitudeLimit = superchargerData.characteristics?.altitude_limit || 3000;
        const ratedAltProps = getAirPropertiesAtAltitude(altitudeLimit);
        const currentAltProps = getAirPropertiesAtAltitude(h);
        const densityRatio = currentAltProps.density / ratedAltProps.density;
        currentPower = basePower * (superchargerData.characteristics?.power_modifier || 1.0) * densityRatio;
    }

    // Aplica o diminishing return de potência acima de 1000 HP
    const threshold = 1000;
    if (currentPower > threshold) {
        const excess = currentPower - threshold;
        const penaltyFactor = 1 - Math.pow(excess / threshold, 2) * 0.25;
        currentPower = threshold + excess * Math.max(0, penaltyFactor);
    }
    
    return currentPower;
}

/**
 * Calcula a performance da aeronave em uma dada altitude (velocidade, arrasto, empuxo).
 * @param {number} h - Altitude em metros.
 * @param {number} combatWeight - Peso total da aeronave em kg.
 * @param {number} totalEnginePower - Potência total do motor em HP.
 * @param {object} propData - Dados da hélice (eficiência).
 * @param {object} aero - Dados aerodinâmicos (wing_area_m2, cd_0, aspect_ratio, oswald_efficiency, drag_mod, power_mod, typeKey).
 * @param {object} superchargerData - Dados do supercharger (rated_altitude_m).
 * @returns {object} - Objeto contendo velocidade (m/s, km/h), arrasto (N) e empuxo (N).
 */
export function calculatePerformanceAtAltitude(h, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const airProps = getAirPropertiesAtAltitude(h);
    const powerAtAltitude = calculateEnginePowerAtAltitude(totalEnginePower, h, superchargerData) * aero.power_mod;
    const powerWatts = powerAtAltitude * 745.7; // Converte HP para Watts

    let v_ms = 150; // Chute inicial para velocidade em m/s
    let best_v_ms = v_ms;
    let min_diff = Infinity;

    for (let current_v = 50; current_v <= 350; current_v += 1) {
        const CL = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * current_v * current_v * aero.wing_area_m2);
        const CDi = (CL * CL) / (Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
        
        let speed_kmh_current = current_v * 3.6;
        let additional_drag_coefficient = 0;
        let drag_mod_final = aero.drag_mod;

        // Lógica de cálculo por tipo de aeronave
        switch(aero.typeKey) {
            case 'light_fighter':
            case 'heavy_fighter':
            case 'naval_fighter':
                if (speed_kmh_current > 500) {
                    const overRatio = (speed_kmh_current - 500) / 100;
                    additional_drag_coefficient += 0.005 * Math.pow(overRatio, 2);
                }
                break;
            case 'cas':
            case 'naval_cas':
                if (h > 3000) {
                    drag_mod_final *= 1.15; // Penalidade de arrasto em altitude
                }
                break;
            case 'tactical_bomber':
            case 'strategic_bomber':
            case 'naval_bomber':
                const dragFromWeight = (combatWeight / 15000); // Exemplo de penalidade de peso
                drag_mod_final *= (1 + dragFromWeight);
                break;
            case 'seaplane':
                drag_mod_final *= 1.15; // 15% mais arrasto
                break;
            case 'zeppelin':
                speed_kmh_current = 130;
                drag_mod_final *= 5.0; // Arrasto muito alto
                break;
        }

        // Penalidade de compressibilidade mais forte
        const speed_penalty_factor = Math.pow(Math.max(0, speed_kmh_current - 400) / 200, 2);
        additional_drag_coefficient += 0.012 * speed_penalty_factor;

        const CD = aero.cd_0 * drag_mod_final + CDi + additional_drag_coefficient;
        const current_drag_force = 0.5 * airProps.density * current_v * current_v * aero.wing_area_m2 * CD;
        const current_thrust_force = (powerWatts * propData.efficiency) / Math.max(current_v, 1);

        const diff = Math.abs(current_thrust_force - current_drag_force);

        if (diff < min_diff) {
            min_diff = diff;
            best_v_ms = current_v;
        }
    }
    let v_ms_final = best_v_ms;
    
    // Recalcular com a melhor velocidade para os valores finais
    const CL_final = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * v_ms_final * v_ms_final * aero.wing_area_m2);
    const CDi_final = (CL_final * CL_final) / (Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
    let speed_kmh_final = v_ms_final * 3.6;
    const speed_penalty_factor_final = Math.pow(Math.max(0, speed_kmh_final - 400) / 200, 2);
    const additional_drag_coefficient_final = 0.012 * speed_penalty_factor_final;

    const CD_final = aero.cd_0 * aero.drag_mod + CDi_final + additional_drag_coefficient_final;
    const dragForce_final = 0.5 * airProps.density * v_ms_final * v_ms_final * aero.wing_area_m2 * CD_final;
    const thrust_final = (powerWatts * propData.efficiency) / Math.max(v_ms_final, 30);
    
    // Soft Cap de Velocidade
    const maxSpd = aero.limits?.max_speed;
    if (maxSpd && speed_kmh_final > maxSpd * 0.9) {
        const overRatio = speed_kmh_final / maxSpd - 0.9;
        speed_kmh_final *= 1 - (overRatio * 0.5);
    }
    
    return { speed_kmh: speed_kmh_final, roc_ms: 0, v_ms: v_ms_final, drag_newtons: dragForce_final, thrust_newtons: thrust_final };
}

/**
 * Calcula a taxa de subida (RoC) em uma dada altitude.
 * @param {number} h - Altitude em metros.
 * @param {number} combatWeight - Peso total da aeronave em kg.
 * @param {number} totalEnginePower - Potência total do motor em HP.
 * @param {object} propData - Dados da hélice (eficiência).
 * @param {object} aero - Dados aerodinâmicos (wing_area_m2, cd_0, aspect_ratio, oswald_efficiency, drag_mod, power_mod).
 * @param {object} superchargerData - Dados do supercharger (rated_altitude_m).
 * @returns {number} - Taxa de subida em m/s.
 */
export function calculateRateOfClimb(h, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const airProps = getAirPropertiesAtAltitude(h);
    const powerAtAltitude = calculateEnginePowerAtAltitude(totalEnginePower, h, superchargerData) * aero.power_mod;
    const powerWatts = powerAtAltitude * 745.7;

    const climbSpeed_ms = 80; // Velocidade de subida ótima, pode ser refinada

    const thrust = (powerWatts * propData.efficiency) / Math.max(climbSpeed_ms, 1);

    const CL_climb = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * climbSpeed_ms * climbSpeed_ms * aero.wing_area_m2);
    const CDi_climb = (CL_climb * CL_climb) / (Math.PI * aero.aspect_ratio * aero.oswald_efficiency);

    // Aplicar a mesma penalidade de arrasto dependente da velocidade para a subida
    const speed_kmh_climb = climbSpeed_ms * 3.6;
    const speed_penalty_factor_climb = Math.pow(Math.max(0, speed_kmh_climb - 400) / 200, 2);
    const additional_drag_coefficient_climb = 0.012 * speed_penalty_factor_climb;

    const CD_climb = aero.cd_0 * aero.drag_mod + CDi_climb + additional_drag_coefficient_climb;
    const dragForce_climb = 0.5 * airProps.density * climbSpeed_ms * climbSpeed_ms * aero.wing_area_m2 * CD_climb;

    const excessPower = (thrust * climbSpeed_ms) - (dragForce_climb * climbSpeed_ms);
    const rateOfClimb = excessPower / (combatWeight * gameData.constants.standard_gravity_ms2);

    return Math.max(0, rateOfClimb);
}

/**
 * Função auxiliar para encontrar um item de componente em diferentes categorias em gameData.components.
 * Isso é útil porque os IDs dos checkboxes podem não mapear diretamente para suas chaves de categoria de nível superior.
 * @param {string} id - O ID do componente a ser encontrado.
 * @returns {object|null} - O objeto do componente se encontrado, caso contrário null.
 */
export function findItemAcrossCategories(id) {
    if (!gameData?.components) return null;
    
    for (const categoryKey in gameData.components) {
        if (gameData.components[categoryKey] && gameData.components[categoryKey][id]) {
            return gameData.components[categoryKey][id];
        }
    }
    return null;
}

/**
 * Coleta os inputs do formulário, calcula todas as estatísticas da aeronave
 * e atualiza a interface do usuário.
 * @returns {object|null} - Objeto com todos os dados de performance calculados, ou null se houver validação falha.
 */
export function updateCalculations() {
    try {
        // Verificação se gameData está disponível
        if (!gameData?.components) {
            console.log('gameData não está disponível ainda, pulando cálculos...');
            return null;
        }

        // --- COLETAR INPUTS ---
        const inputs = {
            aircraftName: document.getElementById('aircraft_name')?.value || 'Aeronave Sem Nome',
            quantity: parseInt(document.getElementById('quantity')?.value) || 1,
            selectedCountryName: document.getElementById('country_doctrine')?.value,
            selectedAirDoctrine: document.getElementById('air_doctrine')?.value,
            aircraftType: document.getElementById('aircraft_type')?.value,
            structureType: document.getElementById('structure_type')?.value,
            wingType: document.getElementById('wing_type')?.value,
            wingPosition: document.getElementById('wing_position')?.value,
            wingShape: document.getElementById('wing_shape')?.value,
            landingGearType: document.getElementById('landing_gear_type')?.value,
            targetSpeed: parseInt(document.getElementById('target-speed')?.value) || 0,
            targetRange: parseInt(document.getElementById('target-range')?.value) || 0,
            numCrewmen: parseInt(document.getElementById('num_crewmen')?.value) || 1,
            productionQualitySliderValue: parseInt(document.getElementById('production_quality_slider')?.value) || 50,
            defensiveTurretType: document.getElementById('defensive_turret_type')?.value,
            // Acesso direto às seleções locais
            selectedEngineType: selectedEngineType,
            selectedSuperchargerType: selectedSuperchargerType,
            checkboxes: {
                wing_features: Array.from(document.querySelectorAll('#wing_features_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                engine_enhancements: Array.from(document.querySelectorAll('#engine_enhancements_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                protection: Array.from(document.querySelectorAll('#protection_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                cockpit_comfort: Array.from(document.querySelectorAll('#cockpit_comfort_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                advanced_avionics: Array.from(document.querySelectorAll('#advanced_avionics_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                equipment: Array.from(document.querySelectorAll('#equipment_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                maintainability_features: Array.from(document.querySelectorAll('#maintainability_features_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
            },
            armaments: {
                offensive: Array.from(document.querySelectorAll('#offensive_armaments input[type="number"]')).map(i => ({ id: i.id, qty: parseInt(i.value) || 0 })),
                defensive: Array.from(document.querySelectorAll('#defensive_armaments input[type="number"]')).map(i => ({ id: i.id, qty: parseInt(i.value) || 0 }))
            }
        };

        // --- VALIDAÇÃO E CONFIGURAÇÃO DE DADOS ---
        const typeData = gameData.components.aircraft_types?.[inputs.aircraftType];
        const structureData = gameData.components.structure_materials?.[inputs.structureType];
        const wingData = gameData.components.wing_types?.[inputs.wingType];
        const wingPositionData = gameData.components.wing_positions?.[inputs.wingPosition];
        const wingShapeData = gameData.components.wing_shapes?.[inputs.wingShape];
        const landingGearData = gameData.components.landing_gear_types?.[inputs.landingGearType];
        const doctrineData = gameData.doctrines?.[inputs.selectedAirDoctrine];

        // Verificação segura das seleções de motor e supercharger
        if (!selectedEngineType || !selectedSuperchargerType) {
            console.log('Tipo de motor ou supercharger não selecionado, limpando UI...');
            updateUI(null);
            updateProgress();
            return null;
        }

        const engineData = gameData.components.engineTypes?.[selectedEngineType];
        const superchargerData = gameData.components.superchargerTypes?.[selectedSuperchargerType];

        // Validação inicial para componentes essenciais
        if (!typeData || !structureData || !wingData || !engineData || !superchargerData) {
            console.log('Dados essenciais faltando, limpando UI...');
            updateUI(null);
            updateProgress();
            return null;
        }

        // Se chegou até aqui mas targetSpeed ou targetRange são 0, também limpa
        if (inputs.targetSpeed <= 0 || inputs.targetRange <= 0) {
            console.log('Velocidade ou alcance alvo não definidos, limpando UI...');
            updateUI(null);
            updateProgress();
            return null;
        }

        // --- INFERÊNCIA DE COMPONENTES DE MOTOR E PROPULSÃO ---
        // Calcula os requisitos de motor com base na velocidade alvo
        const engineRequirements = performanceTradeoffs?.calculateEngineRequirements?.(inputs.targetSpeed, inputs.aircraftType) || {
            power_needed_hp: 500,
            number_of_engines: 1,
            engine_weight_penalty: 1.0,
            fuel_consumption_mult: 1.0,
            reliability_penalty: 1.0,
            cost_multiplier: 1.0,
            propeller_type: 'metal_3'
        };

        let totalEnginePower = engineRequirements.power_needed_hp * engineRequirements.number_of_engines;
        let numEngines = engineRequirements.number_of_engines;

        // Sugere hélice, refrigeração e alimentação de combustível
        const suggestedPropeller = gameData.components.propellers?.[engineRequirements.propeller_type] || gameData.components.propellers?.metal_3;
        const suggestedCooling = (selectedEngineType === 'v_inline' || selectedEngineType === 'x_configuration') ? 
            gameData.components.cooling_systems?.liquid : gameData.components.cooling_systems?.air;
        const suggestedFuelFeed = (gameData.currentCountryTechLevel >= (gameData.components.fuel_feeds?.injection?.tech_level_required || 60)) ? 
            gameData.components.fuel_feeds?.injection : gameData.components.fuel_feeds?.carburetor;

        const propData = suggestedPropeller;
        const coolingData = suggestedCooling;
        const fuelFeedData = suggestedFuelFeed;

        // Verificações de segurança
        if (!propData || !coolingData || !fuelFeedData) {
            console.warn('Dados de componentes sugeridos faltando');
            updateUI(null);
            return null;
        }

        // --- CALCULAR ESTATÍSTICAS BASE E MODIFICADORES ---
        let baseUnitCost = typeData.cost || 0;
        let baseMetalCost = typeData.metal_cost || 0;
        let totalEmptyWeight = typeData.weight || 0;
        let reliabilityModifier = typeData.reliability_base || 0.9;
        let aero = {
            wing_area_m2: typeData.wing_area_m2 || 20,
            cl_max: typeData.cl_max || 1.5,
            cd_0: typeData.cd_0 || 0.03,
            aspect_ratio: typeData.aspect_ratio || 6.0,
            oswald_efficiency: typeData.oswald_efficiency || 0.8,
            maneuverability_mod: typeData.maneuverability_base || 1.0,
            drag_mod: 1.0, power_mod: 1.0, range_mod: 1.0, ceiling_mod: 1.0, speed_mod: 1.0,
            typeKey: inputs.aircraftType,
            limits: typeData.limits
        };

        // Aplica modificadores de doutrina
        if (doctrineData) {
            baseUnitCost *= (doctrineData.cost_modifier || 1.0);
            reliabilityModifier *= (doctrineData.reliability_modifier || 1.0);
            totalEmptyWeight *= (doctrineData.weight_penalty || 1.0);
            if (doctrineData.performance_bonus) {
                aero.speed_mod *= doctrineData.performance_bonus.speed || 1.0;
                aero.maneuverability_mod *= doctrineData.performance_bonus.maneuverability || 1.0;
                aero.range_mod *= doctrineData.performance_bonus.range || 1.0;
                aero.ceiling_mod *= doctrineData.performance_bonus.service_ceiling || 1.0;
            }
        }

        // Aplica modificadores de estrutura
        baseUnitCost *= structureData.cost_mod || 1.0;
        totalEmptyWeight *= structureData.weight_mod || 1.0;
        reliabilityModifier *= structureData.reliability_mod || 1.0;

        // Aplica modificadores de tipo de asa
        baseUnitCost *= wingData.cost_mod || 1.0;
        totalEmptyWeight *= wingData.weight_mod || 1.0;
        aero.drag_mod *= wingData.drag_mod || 1.0;
        aero.cl_max *= wingData.cl_max_mod || 1.0;
        aero.cd_0 *= wingData.cd_0_mod || 1.0;
        aero.aspect_ratio *= wingData.aspect_ratio_mod || 1.0;
        aero.maneuverability_mod *= wingData.maneuverability_mod || 1.0;
        reliabilityModifier *= wingData.reliability_mod || 1.0;

        // Aplica modificadores de posição da asa (se disponível)
        if (wingPositionData) {
            baseUnitCost *= wingPositionData.cost_mod || 1.0;
            totalEmptyWeight *= wingPositionData.structure_weight_mod || 1.0;
            reliabilityModifier *= wingPositionData.reliability_mod || 1.0;
            aero.drag_mod *= wingPositionData.drag_mod || 1.0;
            aero.maneuverability_mod *= wingPositionData.turn_mod || 1.0;
        }

        // Aplica modificadores de formato da asa (se disponível)
        if (wingShapeData) {
            baseUnitCost *= wingShapeData.cost_mod || 1.0;
            totalEmptyWeight *= wingShapeData.weight_mod || 1.0;
            reliabilityModifier *= wingShapeData.reliability_mod || 1.0;
            aero.drag_mod *= wingShapeData.drag_mod || 1.0;
            aero.maneuverability_mod *= wingShapeData.turn_mod || 1.0;
        }

        // Aplica modificadores de trem de pouso
        if (landingGearData) {
            baseUnitCost += landingGearData.cost || 0;
            totalEmptyWeight += landingGearData.weight || 0;
            baseMetalCost += landingGearData.metal_cost || 0;
            aero.drag_mod *= landingGearData.drag_mod || 1.0;
            reliabilityModifier *= landingGearData.reliability_mod || 1.0;
        }

        // Aplica modificadores de motor
        if (engineData.characteristics) {
            aero.drag_mod *= (engineData.characteristics.frontal_area_tiny || 1.0) * 
                            (engineData.characteristics.drag_penalty || 1.0) * 
                            (engineData.characteristics.drag_reduction || 1.0);
        }

        // Custos e pesos de motor e propulsão
        baseUnitCost += (engineData.cost || 0) * numEngines;
        baseUnitCost += (engineRequirements.cost_multiplier - 1) * baseUnitCost;
        baseMetalCost += (engineData.metal_cost || 0) * numEngines;
        totalEmptyWeight += (engineData.weight || 0) * numEngines;
        totalEmptyWeight *= engineRequirements.engine_weight_penalty;
        reliabilityModifier *= Math.pow(engineData.characteristics?.reliability_bonus || 1.0, numEngines);
        reliabilityModifier *= Math.pow(engineData.characteristics?.reliability_penalty || 1.0, numEngines);
        reliabilityModifier *= engineRequirements.reliability_penalty;

        // Aplica modificadores de hélice
        baseUnitCost += propData.cost * numEngines;
        totalEmptyWeight += propData.weight * numEngines;
        baseMetalCost += propData.metal_cost * numEngines;
        reliabilityModifier *= Math.pow(propData.reliability_mod, numEngines);

        // Aplica modificadores de outros sistemas
        [coolingData, fuelFeedData, superchargerData].forEach(data => {
            if (data) {
                baseUnitCost += (data.cost || 0) * numEngines;
                totalEmptyWeight += (data.weight || 0) * numEngines;
                reliabilityModifier *= Math.pow(data.reliability_mod || 1.0, numEngines);
                aero.drag_mod *= data.drag_mod || 1.0;
                aero.power_mod *= data.performance_mod || data.characteristics?.power_modifier || 1.0;
                reliabilityModifier *= (data.characteristics?.reliability_bonus || 1.0);
                reliabilityModifier *= (data.characteristics?.reliability_modifier || 1.0);
            }
        });

        // Aplica penalidades de design
        if (designPenalties?.speedPenalties) {
            const speedPenaltyTier = Object.keys(designPenalties.speedPenalties)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .find(tier => inputs.targetSpeed <= parseInt(tier));
            if (speedPenaltyTier) {
                const penalties = designPenalties.speedPenalties[speedPenaltyTier];
                aero.maneuverability_mod *= (penalties.turn_rate_penalty || 1.0);
                aero.ceiling_mod *= (penalties.climb_rate_penalty || 1.0);
                reliabilityModifier *= (penalties.reliability_penalty || 1.0);
                baseUnitCost *= (penalties.maintenance_multiplier || 1.0);
            }
        }

        if (designPenalties?.rangePenalties) {
            const rangePenaltyTier = Object.keys(designPenalties.rangePenalties)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .find(tier => inputs.targetRange <= parseInt(tier));
            if (rangePenaltyTier) {
                const penalties = designPenalties.rangePenalties[rangePenaltyTier];
                totalEmptyWeight *= (penalties.weight_penalty || 1.0);
                aero.maneuverability_mod *= (penalties.maneuverability_penalty || 1.0);
            }
        }

        // Processa componentes de checkboxes
        for (const categoryKey in inputs.checkboxes) {
            inputs.checkboxes[categoryKey].forEach(id => {
                const item = findItemAcrossCategories(id);
                if (item) {
                    baseUnitCost += item.cost || 0;
                    totalEmptyWeight += item.weight || 0;
                    baseMetalCost += item.metal_cost || 0;
                    reliabilityModifier *= item.reliability_mod || 1.0;
                    aero.maneuverability_mod *= item.maneuverability_mod || 1.0;
                    aero.range_mod *= item.range_mod || 1.0;
                    aero.ceiling_mod *= item.ceiling_mod || 1.0;
                    aero.speed_mod *= item.speed_mod || 1.0;
                    aero.drag_mod *= item.drag_mod || 1.0;
                    aero.cl_max *= item.cl_max_mod || 1.0;
                }
            });
        }

        // Processa armamentos
        let armamentWeight = 0, armamentCost = 0, armamentMetalCost = 0;
        let offensiveArmamentTexts = [];
        let armamentLimitExceeded = false;

        inputs.armaments.offensive.forEach(arm => {
            if (arm.qty > 0) {
                const armData = gameData.components.armaments?.[arm.id];
                if (armData) {
                    let maxAllowed = Infinity;
                    
                    // Aplica limites de armamento se disponíveis
                    if (wingPositionData?.armament_limits?.[arm.id] !== undefined) {
                        maxAllowed = Math.min(maxAllowed, wingPositionData.armament_limits[arm.id]);
                    }
                    if (wingShapeData?.armament_limits?.[arm.id] !== undefined) {
                        maxAllowed = Math.min(maxAllowed, wingShapeData.armament_limits[arm.id]);
                    }

                    let finalQty = Math.min(arm.qty, maxAllowed);
                    if (finalQty < arm.qty) {
                        armamentLimitExceeded = true;
                    }

                    if (finalQty > 0) {
                        armamentCost += armData.cost * finalQty;
                        armamentWeight += armData.weight * finalQty;
                        armamentMetalCost += armData.metal_cost * finalQty;
                        offensiveArmamentTexts.push(`${finalQty}x ${armData.name}`);
                    }
                }
            }
        });

        baseUnitCost += armamentCost;
        baseMetalCost += armamentMetalCost;

        // Processa armamentos defensivos
        let defensiveArmamentTexts = [];
        const turretData = gameData.components.defensive_armaments?.[inputs.defensiveTurretType];
        if (turretData && inputs.defensiveTurretType !== "none_turret") {
            baseUnitCost += turretData.cost || 0;
            totalEmptyWeight += turretData.weight || 0;
            baseMetalCost += turretData.metal_cost || 0;
            reliabilityModifier *= turretData.reliability_mod || 1.0;
            
            inputs.armaments.defensive.forEach(arm => {
                if (arm.qty > 0) {
                    const defArmData = gameData.components.defensive_armaments?.[arm.id];
                    if (defArmData) {
                        baseUnitCost += defArmData.cost * arm.qty;
                        totalEmptyWeight += defArmData.weight * arm.qty;
                        baseMetalCost += defArmData.metal_cost * arm.qty;
                        defensiveArmamentTexts.push(`${arm.qty}x ${defArmData.name.replace(' (Defensiva)', '')}`);
                    }
                }
            });
        }

        // --- PESO FINAL E CUSTO ---
        const fuelCapacity = gameData.constants.base_fuel_capacity_liters * (totalEmptyWeight / 2000) * Math.sqrt(numEngines);
        const fuelWeight = fuelCapacity * gameData.constants.fuel_weight_per_liter;
        const combatWeight = totalEmptyWeight + armamentWeight + (inputs.numCrewmen * gameData.constants.crew_weight_kg) + fuelWeight;

        // Slider de qualidade/produção
        const qualityBias = (100 - inputs.productionQualitySliderValue) / 100;
        const productionBias = inputs.productionQualitySliderValue / 100;

        baseUnitCost *= (1 + (qualityBias * 0.20) - (productionBias * 0.20));
        reliabilityModifier *= 1.20; // Bônus base de 20%
        reliabilityModifier *= (1 + (qualityBias * 0.15) - (productionBias * 0.15));

        // Redução de custo do país
        const countryData = gameData.countries?.[inputs.selectedCountryName];
        let countryCostReduction = 0;
        if (countryData) {
            const civilTechReduction = (countryData.tech_civil / gameData.constants.max_tech_civil_level) * gameData.constants.country_cost_reduction_factor;
            const urbanizationReduction = (countryData.urbanization / gameData.constants.max_urbanization_level) * gameData.constants.urbanization_cost_reduction_factor;
            countryCostReduction = Math.min(0.75, civilTechReduction + urbanizationReduction);
        }
        const finalUnitCost = baseUnitCost * (1 - countryCostReduction);

        // --- CÁLCULOS DE PERFORMANCE ---
        const optimalAltitudeForPerformance = superchargerData.characteristics?.optimal_altitude || 
                                             superchargerData.characteristics?.altitude_limit || 0;

        const perfSL = calculatePerformanceAtAltitude(0, combatWeight, totalEnginePower, propData, aero, superchargerData);
        const perfAlt = calculatePerformanceAtAltitude(optimalAltitudeForPerformance, combatWeight, totalEnginePower, propData, aero, superchargerData);

        let rawSpeedKmhSL = perfSL.speed_kmh * aero.speed_mod;
        let rawSpeedKmhAlt = perfAlt.speed_kmh * aero.speed_mod;
        
        const bsfc_kg_per_watt_s = (engineData.characteristics?.bsfc_g_per_kwh || 300) / 1000 / 3.6e6;
        const optimal_CL = Math.sqrt(aero.cd_0 * Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
        const optimal_CD = aero.cd_0 * 2;
        const L_D_ratio = optimal_CD > 0 ? optimal_CL / optimal_CD : 10;
        const range_m = (propData.efficiency / (gameData.constants.standard_gravity_ms2 * bsfc_kg_per_watt_s)) * L_D_ratio * Math.log(combatWeight / (combatWeight - fuelWeight));
        let rawRangeKm = (range_m / 1000) * aero.range_mod;

        const rate_of_climb_ms = calculateRateOfClimb(0, combatWeight, totalEnginePower, propData, aero, superchargerData);

        // --- APLICAR LIMITES DE PERFORMANCE ---
        let finalSpeedKmhSL = Math.min(rawSpeedKmhSL, inputs.targetSpeed);
        let finalSpeedKmhAlt = Math.min(rawSpeedKmhAlt, inputs.targetSpeed);
        let finalRangeKm = Math.min(rawRangeKm / gameData.constants.range_balance_factor, inputs.targetRange);

        if (typeData.limits) {
            finalSpeedKmhAlt = Math.min(finalSpeedKmhAlt, typeData.limits.max_speed);
            finalSpeedKmhSL = Math.min(finalSpeedKmhSL, typeData.limits.max_speed);
            finalRangeKm = Math.min(finalRangeKm, typeData.limits.max_range);
        }

        // Teto de Serviço
        let serviceCeiling = 0;
        const maxCeilingCalcAltitude = superchargerData.characteristics?.altitude_limit || 15000;
        for (let h = 0; h <= maxCeilingCalcAltitude; h += 250) {
            const currentROC = calculateRateOfClimb(h, combatWeight, totalEnginePower, propData, aero, superchargerData);
            if (currentROC < gameData.constants.min_roc_for_ceiling) {
                serviceCeiling = h;
                break;
            }
            if (h >= maxCeilingCalcAltitude) serviceCeiling = maxCeilingCalcAltitude;
        }
        let finalServiceCeiling = serviceCeiling * aero.ceiling_mod;
        
        // Limita o teto baseado em sistemas de cabine
        if (!inputs.checkboxes.cockpit_comfort.includes('pressurized_cabin') && finalServiceCeiling > 10000) {
            finalServiceCeiling = 10000;
        }
        if (!inputs.checkboxes.cockpit_comfort.includes('oxygen_system') && finalServiceCeiling > 5000) {
            finalServiceCeiling = 5000;
        }

        // Manobrabilidade
        const wingLoading = combatWeight / aero.wing_area_m2;
        const v_turn = perfAlt.v_ms * 0.8;
        const max_load_factor = Math.min(gameData.constants.turn_g_force, 
            (0.5 * getAirPropertiesAtAltitude(2000).density * v_turn * v_turn * aero.cl_max) / wingLoading);
        const turn_radius = (v_turn * v_turn) / 
            (gameData.constants.standard_gravity_ms2 * Math.sqrt(Math.max(0.01, max_load_factor * max_load_factor - 1)));
        let turn_time_s = (2 * Math.PI * turn_radius) / v_turn;
        turn_time_s /= aero.maneuverability_mod;
        turn_time_s = Math.max(12, Math.min(60, turn_time_s));

        const finalReliability = Math.max(5, Math.min(100, 100 * reliabilityModifier));

        // --- ATUALIZAÇÃO DA UI ---
        const calculatedPerformance = {
            inputs, adjustedUnitCost: finalUnitCost, baseMetalCost, combatWeight, totalEnginePower,
            finalSpeedKmhSL, finalSpeedKmhAlt, rate_of_climb_ms, finalServiceCeiling, finalRangeKm, turn_time_s,
            finalReliability, offensiveArmamentTexts, defensiveArmamentTexts, armamentLimitExceeded,
            countryData, wingLoading, typeData, rawSpeedKmhAlt, rawRangeKm, superchargerData, aero, propData,
            countryCostReduction: countryCostReduction,
            suggestedPropeller: suggestedPropeller,
            suggestedCooling: suggestedCooling,
            suggestedFuelFeed: suggestedFuelFeed
        };

        updateUI(calculatedPerformance);

        // Salva o estado para undo/redo (com verificação de segurança)
        if (stateManager && typeof stateManager.saveState === 'function') {
            try {
                stateManager.saveState(inputs);
            } catch (error) {
                console.warn('Erro ao salvar estado:', error);
            }
        }

        return calculatedPerformance;

    } catch (error) {
        console.error('Erro em updateCalculations:', error);
        updateUI(null);
        return null;
    }
}

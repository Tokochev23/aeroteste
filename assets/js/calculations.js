// assets/js/calculations.js

import { gameData, techLevelRestrictions, engineSuperchargerCombos, designPenalties, learningCurve } from './data.js';
import { updateUI, updateProgress, updateStatusAndWarnings } from './ui.js';
import { stateManager } from './managers.js';

// --- CACHING ---
const airPropertiesCache = new Map();
const enginePowerCache = new Map();

// Variáveis de seleção - serão atualizadas pela UI
let selectedEngineType = null;
let selectedSuperchargerType = null;

export function getCurrentSelections() {
    return { selectedEngineType, selectedSuperchargerType };
}

export function setCurrentSelections(engineType, superchargerType) {
    selectedEngineType = engineType;
    selectedSuperchargerType = superchargerType;
}

// --- FUNÇÕES DE CÁLCULO AERODINÂMICO E DE PERFORMANCE ---

/**
 * Calcula as propriedades do ar (densidade, temperatura, pressão) em uma dada altitude.
 * Utiliza o modelo da Atmosfera Padrão Internacional (ISA) e cache para otimização.
 * @param {number} altitude_m - Altitude em metros.
 * @returns {object} - Objeto contendo densidade (kg/m^3), temperatura (K) e pressão (Pa).
 */
export function getAirPropertiesAtAltitude(h_m) {
    const h_rounded = Math.round(h_m / 100) * 100; // Cache por incrementos de 100m
    if (airPropertiesCache.has(h_rounded)) {
        return airPropertiesCache.get(h_rounded);
    }

    const h = Math.max(0, h_m);
    const T0 = gameData.constants.temp_sea_level_k;
    const P0 = gameData.constants.pressure_sea_level_pa;
    const L = gameData.constants.temp_lapse_rate_k_per_m;
    const R = gameData.constants.gas_constant_air_specific;
    const g = gameData.constants.standard_gravity_ms2;

    const T = Math.max(216.65, T0 - L * h);
    const P = P0 * Math.pow((T / T0), g / (L * R));
    const rho = P / (R * T);
    
    const properties = { temperature: T, pressure: P, density: rho };
    airPropertiesCache.set(h_rounded, properties);
    return properties;
}

/**
 * Calcula a potência do motor em uma dada altitude, considerando os efeitos do supercharger.
 * @param {number} basePower - Potência do motor ao nível do mar (HP).
 * @param {number} h - Altitude em metros.
 * @param {object} superchargerData - Dados do supercharger.
 * @returns {number} - Potência do motor ajustada em HP.
 */
export function calculateEnginePowerAtAltitude(basePower, h, superchargerData) {
    const cacheKey = `${basePower}-${h}-${superchargerData.name}`;
    if (enginePowerCache.has(cacheKey)) {
        return enginePowerCache.get(cacheKey);
    }

    let currentPower = 0;
    const ratedAltitude = superchargerData.characteristics.rated_altitude_m;
    const manifoldPressure = superchargerData.characteristics.manifold_pressure_ata;

    if (h <= ratedAltitude) {
        // Abaixo da altitude nominal, a pressão de admissão é mantida
        currentPower = basePower * manifoldPressure;
    } else {
        // Acima da altitude nominal, a potência cai com a densidade do ar
        const ratedAltProps = getAirPropertiesAtAltitude(ratedAltitude);
        const currentAltProps = getAirPropertiesAtAltitude(h);
        const densityRatio = currentAltProps.density / ratedAltProps.density;
        currentPower = basePower * manifoldPressure * densityRatio;
    }
    
    enginePowerCache.set(cacheKey, currentPower);
    return currentPower;
}

/**
 * Encontra a velocidade máxima onde Empuxo = Arrasto usando busca binária.
 * @param {number} h - Altitude em metros.
 * @param {number} combatWeight - Peso em kg.
 * @param {number} totalEnginePower - Potência em HP.
 * @param {object} propData - Dados da hélice.
 * @param {object} aero - Dados aerodinâmicos.
 * @param {object} superchargerData - Dados do supercharger.
 * @returns {number} - Velocidade máxima em m/s.
 */
function findMaxSpeed(h, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const airProps = getAirPropertiesAtAltitude(h);
    const powerAtAltitude = calculateEnginePowerAtAltitude(totalEnginePower, h, superchargerData) * aero.power_mod;
    const powerWatts = powerAtAltitude * 745.7;

    let low = 30; // m/s
    let high = 350; // m/s
    let v_ms = 150;

    for(let i = 0; i < 10; i++) { // 10 iterações são suficientes para boa precisão
        v_ms = (low + high) / 2;
        if (v_ms <= 0) break;

        const CL = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * v_ms * v_ms * aero.wing_area_m2);
        const CDi = (CL * CL) / (Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
        
        let additional_drag_coefficient = 0;
        let drag_mod_final = aero.drag_mod;
        const speed_kmh_current = v_ms * 3.6;

        // Lógica de arrasto para bombardeiros
        if (aero.typeKey.includes('bomber')) {
             if (speed_kmh_current > 400) {
                // Penalidade de arrasto suavizada para bombardeiros
                const overRatio = (speed_kmh_current - 400) / 100;
                additional_drag_coefficient += 0.003 * Math.pow(overRatio, 1.8); 
             }
        } else {
            // Penalidade de compressibilidade para outros
            if (speed_kmh_current > 500) {
                const overRatio = (speed_kmh_current - 500) / 100;
                additional_drag_coefficient += 0.005 * Math.pow(overRatio, 2);
            }
        }

        const CD = (aero.cd_0 + CDi + additional_drag_coefficient) * drag_mod_final;
        const dragForce = 0.5 * airProps.density * v_ms * v_ms * aero.wing_area_m2 * CD;
        const thrustForce = (powerWatts * propData.efficiency) / v_ms;

        if (thrustForce > dragForce) {
            low = v_ms;
        } else {
            high = v_ms;
        }
    }
    return low; // Retorna o limite inferior da busca
}


/**
 * Calcula a performance da aeronave em uma dada altitude.
 * @param {number} h - Altitude em metros.
 * @param {number} combatWeight - Peso total da aeronave em kg.
 * @param {number} totalEnginePower - Potência total do motor em HP.
 * @param {object} propData - Dados da hélice (eficiência).
 * @param {object} aero - Dados aerodinâmicos.
 * @param {object} superchargerData - Dados do supercharger.
 * @returns {object} - Objeto contendo velocidade (m/s, km/h).
 */
export function calculatePerformanceAtAltitude(h, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const v_ms_final = findMaxSpeed(h, combatWeight, totalEnginePower, propData, aero, superchargerData);
    let speed_kmh_final = v_ms_final * 3.6;

    const maxSpd = aero.limits?.max_speed;
    if (maxSpd && speed_kmh_final > maxSpd * 0.9) {
        const overRatio = speed_kmh_final / maxSpd - 0.9;
        speed_kmh_final *= 1 - (overRatio * 0.5);
    }
    
    return { speed_kmh: speed_kmh_final, v_ms: v_ms_final };
}

/**
 * Calcula a taxa de subida (RoC) em uma dada altitude.
 * @param {number} h - Altitude em metros.
 * @param {number} combatWeight - Peso total da aeronave em kg.
 * @param {number} totalEnginePower - Potência total do motor em HP.
 * @param {object} propData - Dados da hélice.
 * @param {object} aero - Dados aerodinâmicos.
 * @param {object} superchargerData - Dados do supercharger.
 * @returns {number} - Taxa de subida em m/s.
 */
export function calculateRateOfClimb(h, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const airProps = getAirPropertiesAtAltitude(h);
    const powerAtAltitude = calculateEnginePowerAtAltitude(totalEnginePower, h, superchargerData) * aero.power_mod;
    const powerWatts = powerAtAltitude * 745.7;

    const climbSpeed_ms = 80;

    const thrust = (powerWatts * propData.efficiency) / Math.max(climbSpeed_ms, 1);

    const CL_climb = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * climbSpeed_ms * climbSpeed_ms * aero.wing_area_m2);
    const CDi_climb = (CL_climb * CL_climb) / (Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
    
    const CD_climb = (aero.cd_0 + CDi_climb) * aero.drag_mod;
    const dragForce_climb = 0.5 * airProps.density * climbSpeed_ms * climbSpeed_ms * aero.wing_area_m2 * CD_climb;

    const excessPower = (thrust * climbSpeed_ms) - (dragForce_climb * climbSpeed_ms);
    const rateOfClimb = excessPower / (combatWeight * gameData.constants.standard_gravity_ms2);

    return Math.max(0, rateOfClimb);
}

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
        if (!gameData?.components) return null;

        // --- COLETAR INPUTS ---
        const inputs = {
            aircraftName: document.getElementById('aircraft_name')?.value || 'Aeronave Sem Nome',
            quantity: parseInt(document.getElementById('quantity')?.value) || 1,
            production_turns: parseInt(document.getElementById('production_turns')?.value) || 0,
            selectedCountryName: document.getElementById('country_doctrine')?.value,
            selectedAirDoctrine: document.getElementById('air_doctrine')?.value,
            aircraftType: document.getElementById('aircraft_type')?.value,
            structureType: document.getElementById('structure_type')?.value,
            wingType: document.getElementById('wing_type')?.value,
            wingShape: document.getElementById('wing_shape')?.value,
            landingGearType: document.getElementById('landing_gear_type')?.value,
            targetSpeed: parseInt(document.getElementById('target-speed')?.value) || 0,
            targetRange: parseInt(document.getElementById('target-range')?.value) || 0,
            numCrewmen: parseInt(document.getElementById('num_crewmen')?.value) || 1,
            productionQualitySliderValue: parseInt(document.getElementById('production_quality_slider')?.value) || 50,
            defensiveTurretType: document.getElementById('defensive_turret_type')?.value,
            selectedEngineType: selectedEngineType,
            selectedSuperchargerType: selectedSuperchargerType,
            checkboxes: {
                wing_features: Array.from(document.querySelectorAll('#wing_features_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                engine_enhancements: Array.from(document.querySelectorAll('#engine_enhancements_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                protection: Array.from(document.querySelectorAll('#protection_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                cockpit_comfort: Array.from(document.querySelectorAll('#cockpit_comfort_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                advanced_avionics: Array.from(document.querySelectorAll('#advanced_avionics_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
                equipment: Array.from(document.querySelectorAll('#equipment_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
            },
            payload: Array.from(document.querySelectorAll('#payload_stations_container .armament-select')).map(s => ({ stationId: s.dataset.station, armamentId: s.value }))
        };

        // --- VALIDAÇÃO E CONFIGURAÇÃO DE DADOS ---
        const typeData = gameData.components.aircraft_types?.[inputs.aircraftType];
        const structureData = gameData.components.structure_materials?.[inputs.structureType];
        const wingData = gameData.components.wing_types?.[inputs.wingType];
        const wingShapeData = gameData.components.wing_shapes?.[inputs.wingShape];
        const landingGearData = gameData.components.landing_gear_types?.[inputs.landingGearType];
        const doctrineData = gameData.doctrines?.[inputs.selectedAirDoctrine];
        const engineData = gameData.components.engineTypes?.[selectedEngineType];
        const superchargerData = gameData.components.superchargerTypes?.[selectedSuperchargerType];

        if (!typeData || !structureData || !wingData || !engineData || !superchargerData || inputs.targetSpeed <= 0) {
            updateUI(null);
            updateProgress();
            return null;
        }
        
        // --- CÁLCULOS BASE ---
        let baseUnitCost = typeData.cost || 0;
        let baseMetalCost = typeData.metal_cost || 0;
        let totalEmptyWeight = typeData.weight || 0;
        let reliabilityModifier = typeData.reliability_base || 0.9;
        let aero = {
            wing_area_m2: typeData.wing_area_m2, cl_max: typeData.cl_max, cd_0: typeData.cd_0, aspect_ratio: typeData.aspect_ratio, oswald_efficiency: typeData.oswald_efficiency,
            maneuverability_mod: typeData.maneuverability_base, drag_mod: 1.0, power_mod: 1.0, range_mod: 1.0, ceiling_mod: 1.0, speed_mod: 1.0,
            typeKey: inputs.aircraftType, limits: typeData.limits
        };

        // Modificadores de componentes
        [structureData, wingData, wingShapeData, landingGearData, doctrineData].forEach(data => {
            if(data) {
                baseUnitCost *= (data.cost_modifier || 1.0);
                totalEmptyWeight *= (data.weight_mod || data.weight_penalty || 1.0);
                reliabilityModifier *= (data.reliability_modifier || 1.0);
                aero.drag_mod *= (data.drag_mod || 1.0);
                aero.maneuverability_mod *= (data.turn_mod || data.maneuverability_mod || 1.0);
                if(data.performance_bonus) {
                    aero.speed_mod *= data.performance_bonus.speed || 1.0;
                    aero.maneuverability_mod *= data.performance_bonus.maneuverability || 1.0;
                    aero.range_mod *= data.performance_bonus.range || 1.0;
                    aero.ceiling_mod *= data.performance_bonus.service_ceiling || 1.0;
                }
            }
        });
        baseUnitCost += landingGearData?.cost || 0;
        totalEmptyWeight += landingGearData?.weight || 0;
        baseMetalCost += landingGearData?.metal_cost || 0;
        
        // --- MOTOR E PROPULSÃO ---
        const comboLimits = engineSuperchargerCombos.calculateLimits(selectedEngineType, selectedSuperchargerType);
        const totalEnginePower = 1000; // Placeholder, a potência real é calculada em altitude
        const numEngines = 1; // Simplificado por enquanto
        const propData = gameData.components.propellers.adjustable;
        
        // --- EQUIPAMENTOS E ARMAMENTOS (PAYLOAD) ---
        let payloadWeight = 0;
        let payloadCost = 0;
        let payloadMetalCost = 0;
        let totalCgMoment = typeData.base_cg * totalEmptyWeight;
        let payloadStationStatus = [];

        typeData.payload_stations.forEach(station => {
            const selectedArmamentId = inputs.payload.find(p => p.stationId === station.id)?.armamentId;
            if (selectedArmamentId && selectedArmamentId !== 'empty') {
                const armData = gameData.components.armaments[selectedArmamentId];
                payloadWeight += armData.weight;
                payloadCost += armData.cost;
                payloadMetalCost += armData.metal_cost;
                totalCgMoment += armData.weight * station.cg_position;
                
                if (armData.weight > station.max_weight_kg) {
                    payloadStationStatus.push({ station: station.name, status: 'exceeded', message: `Estação ${station.name} excede o limite de peso!` });
                } else {
                    payloadStationStatus.push({ station: station.name, status: 'ok' });
                }
            }
        });

        // Checkboxes e equipamentos
        let requiredFeatures = new Set();
        Object.values(designPenalties.rangePenalties).forEach(p => {
            if (inputs.targetRange >= p.threshold) {
                p.required_features.forEach(f => requiredFeatures.add(f));
            }
        });
        
        requiredFeatures.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && !checkbox.checked) checkbox.checked = true;
        });

        for (const categoryKey in inputs.checkboxes) {
            inputs.checkboxes[categoryKey].forEach(id => {
                const item = findItemAcrossCategories(id);
                if (item) {
                    payloadCost += item.cost || 0;
                    payloadWeight += item.weight || 0;
                    payloadMetalCost += item.metal_cost || 0;
                    reliabilityModifier *= item.reliability_mod || 1.0;
                    Object.keys(aero).forEach(key => {
                        if(key.endsWith('_mod') && item[key]) aero[key] *= item[key];
                    });
                }
            });
        }
        
        // --- PESO FINAL, CUSTO E CG ---
        const fuelCapacity = gameData.constants.base_fuel_capacity_liters * (totalEmptyWeight / 2000);
        const fuelWeight = fuelCapacity * gameData.constants.fuel_weight_per_liter;
        const combatWeight = totalEmptyWeight + payloadWeight + (inputs.numCrewmen * gameData.constants.crew_weight_kg) + fuelWeight;
        const finalCg = totalCgMoment / combatWeight;

        baseUnitCost += payloadCost;
        baseMetalCost += payloadMetalCost;

        // --- FADIGA ESTRUTURAL ---
        const turn_g_force = Math.min(gameData.constants.turn_g_force, (0.5 * getAirPropertiesAtAltitude(2000).density * Math.pow(80, 2) * aero.cl_max) / (combatWeight / aero.wing_area_m2));
        let currentStress = (turn_g_force * typeData.stress_per_g) + (inputs.targetSpeed * typeData.stress_per_speed_kmh);
        const stressLimit = structureData.structural_stress_limit;
        let needsReinforcement = currentStress > stressLimit;
        if (needsReinforcement) {
            const reinforcement = gameData.components.equipment.structural_reinforcement;
            baseUnitCost += reinforcement.cost;
            totalEmptyWeight += reinforcement.weight; // Adiciona ao peso base
            baseMetalCost += reinforcement.metal_cost;
            aero.maneuverability_mod *= reinforcement.maneuverability_mod;
        }

        // --- CUSTO FINAL E CURVA DE APRENDIZAGEM ---
        const learningCurveData = learningCurve.find(l => inputs.production_turns >= l.turns) || learningCurve[0];
        const learningDiscount = learningCurveData.discount;
        let finalUnitCost = baseUnitCost * (1 - learningDiscount);

        // --- CÁLCULOS DE PERFORMANCE ---
        const perfSL = calculatePerformanceAtAltitude(0, combatWeight, totalEnginePower, propData, aero, superchargerData);
        const perfAlt = calculatePerformanceAtAltitude(comboLimits.rated_altitude, combatWeight, totalEnginePower, propData, aero, superchargerData);
        let finalSpeedKmhAlt = Math.min(perfAlt.speed_kmh * aero.speed_mod, inputs.targetSpeed, typeData.limits.max_speed);
        const rate_of_climb_ms = calculateRateOfClimb(0, combatWeight, totalEnginePower, propData, aero, superchargerData);
        let serviceCeiling = 0;
        for (let h = 0; h <= 15000; h += 250) {
            if (calculateRateOfClimb(h, combatWeight, totalEnginePower, propData, aero, superchargerData) < gameData.constants.min_roc_for_ceiling) {
                serviceCeiling = h;
                break;
            }
        }
        
        // Manobrabilidade (agora afetada pelo CG)
        const cgPenalty = 1 + Math.abs(finalCg - typeData.base_cg) * 0.5; // 50% de penalidade por desvio
        let turn_time_s = (2 * Math.PI * 500) / perfAlt.v_ms; // Simplificado
        turn_time_s /= aero.maneuverability_mod;
        turn_time_s *= cgPenalty;
        turn_time_s = Math.max(12, Math.min(60, turn_time_s));

        const finalReliability = Math.max(5, Math.min(100, 100 * reliabilityModifier));
        
        // --- ATUALIZAÇÃO DA UI ---
        const calculatedPerformance = {
            inputs, baseUnitCost, finalUnitCost, learningDiscount, baseMetalCost, combatWeight, totalEnginePower,
            finalSpeedKmhSL: Math.min(perfSL.speed_kmh * aero.speed_mod, inputs.targetSpeed, typeData.limits.max_speed),
            finalSpeedKmhAlt, rate_of_climb_ms, finalServiceCeiling: serviceCeiling * aero.ceiling_mod,
            finalRangeKm: Math.min(inputs.targetRange, typeData.limits.max_range), turn_time_s, finalReliability,
            countryData: gameData.countries?.[inputs.selectedCountryName], typeData, superchargerData,
            finalCg, currentStress, stressLimit, payloadStationStatus,
            requiredFeatures: Array.from(requiredFeatures).map(id => findItemAcrossCategories(id)?.name).filter(Boolean)
        };

        updateUI(calculatedPerformance);
        if (stateManager) stateManager.saveState(inputs);
        return calculatedPerformance;

    } catch (error) {
        console.error('Erro em updateCalculations:', error);
        updateUI(null);
        return null;
    }
}

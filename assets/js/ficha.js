// assets/js/ficha.js

document.addEventListener('DOMContentLoaded', () => {
    const dataString = localStorage.getItem('aircraftSheetData');
    if (!dataString) {
        document.body.innerHTML = '<h1 class="text-white text-center p-10">Erro: Nenhum dado de aeronave encontrado. Por favor, gere a ficha novamente.</h1>';
        return;
    }

    const data = JSON.parse(dataString);
    populateFicha(data);
    createPerformanceChart(data.performanceGraphData);
    setupEventListeners();
});

function populateFicha(data) {
    const { inputs, finalUnitCost, finalSpeedKmhAlt, totalEnginePower, finalReliability, combatWeight, rate_of_climb_ms, finalServiceCeiling, finalRangeKm, turn_time_s, offensiveArmamentTexts, defensiveArmamentTexts, typeData, structureData, wingData, wingShapeData, engineData, superchargerData, propData, coolingData, landingGearData } = data;

    const formatNumber = (num) => num.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

    document.getElementById('aircraft_name').textContent = inputs.aircraftName;
    document.getElementById('aircraft_subtitle').textContent = `${typeData.name} - ${gameData.doctrines[inputs.selectedAirDoctrine]?.name || ''}`;
    
    // Quick Stats
    document.getElementById('unit_cost').textContent = `£ ${formatNumber(finalUnitCost)}`;
    document.getElementById('max_speed').textContent = `${formatNumber(finalSpeedKmhAlt)} km/h`;
    document.getElementById('total_power').textContent = `${formatNumber(totalEnginePower)} HP`;
    document.getElementById('reliability').textContent = `${finalReliability.toFixed(1)}%`;

    // Full Stats
    document.getElementById('total_weight').textContent = `${formatNumber(combatWeight)} kg`;
    document.getElementById('rate_of_climb').textContent = `${rate_of_climb_ms.toFixed(1)} m/s`;
    document.getElementById('service_ceiling').textContent = `${formatNumber(finalServiceCeiling)} m`;
    document.getElementById('max_range').textContent = `${formatNumber(finalRangeKm)} km`;
    document.getElementById('turn_time').textContent = `${turn_time_s.toFixed(1)}s`;
    document.getElementById('num_crewmen').textContent = inputs.numCrewmen;

    // Armaments
    document.getElementById('offensive_armament').textContent = offensiveArmamentTexts.join(', ') || 'Nenhum';
    // document.getElementById('defensive_armament').textContent = defensiveArmamentTexts.join(', ') || 'Nenhum';

    // Design Details
    document.getElementById('structure_type').textContent = structureData?.name || '-';
    document.getElementById('wing_type').textContent = wingData?.name || '-';
    document.getElementById('wing_shape').textContent = wingShapeData?.name || '-';
    document.getElementById('engine_type_display').textContent = engineData?.name || '-';
    document.getElementById('supercharger_type_display').textContent = superchargerData?.name || '-';
    document.getElementById('propeller_type_display').textContent = propData?.name || '-';
    document.getElementById('cooling_system_display').textContent = coolingData?.name || '-';
    document.getElementById('landing_gear_type').textContent = landingGearData?.name || '-';

    // Equipment Lists
    const equipmentMap = {
        protection: 'protection',
        cockpit_comfort: 'cockpit_comfort',
        advanced_avionics: 'advanced_avionics',
        equipment: 'equipment'
    };
    Object.entries(equipmentMap).forEach(([key, elementId]) => {
        const items = inputs.checkboxes[key].map(id => findItemAcrossCategories(id)?.name).filter(Boolean);
        populateEquipmentList(elementId, items);
    });
}

function populateEquipmentList(elementId, items) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';
    if (items && items.length > 0) {
        items.forEach(item => {
            const div = document.createElement('div');
            div.textContent = `• ${item}`;
            container.appendChild(div);
        });
    } else {
        container.innerHTML = '<span>Nenhum</span>';
    }
}

function createPerformanceChart(graphData) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    if (!ctx || !graphData) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: graphData.map(d => d.altitude / 1000), // Altitude in km
            datasets: [
                {
                    label: 'Velocidade Máxima (km/h)',
                    data: graphData.map(d => d.speed),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    yAxisID: 'y',
                },
                {
                    label: 'Taxa de Subida (m/s)',
                    data: graphData.map(d => d.roc),
                    borderColor: 'rgb(22, 163, 74)',
                    backgroundColor: 'rgba(22, 163, 74, 0.5)',
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    title: { display: true, text: 'Altitude (km)' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Velocidade (km/h)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Subida (m/s)' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function setupEventListeners() {
    document.getElementById('save-as-png-btn').addEventListener('click', () => {
        const ficha = document.getElementById('ficha_container');
        html2canvas(ficha, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'ficha_aeronave.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
}

// Helper function needed for ficha.js
function findItemAcrossCategories(id) {
    const dataString = localStorage.getItem('aircraftSheetData');
    if (!dataString) return null;
    const data = JSON.parse(dataString);
    // This is a simplified version, assuming gameData is not available here
    // A more robust solution would pass all gameData into localStorage as well
    // For now, we'll just return a formatted name
    return { name: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
}

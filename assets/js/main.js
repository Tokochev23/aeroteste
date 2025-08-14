// assets/js/main.js

import { loadGameDataFromSheets, gameData } from './data.js';
import { updateCalculations } from './calculations.js';
import { 
    toggleStep, generateSheet, initializeChoiceButtons, populateWingDropdowns, 
    applyTechLevelRestrictions, populateEngineTypeSelection, setProductionLock 
} from './ui.js';
import { debounce, stateManager, templateManager, initializeManagers } from './managers.js';

const debouncedUpdateCalculations = debounce(updateCalculations, 250);
let isAppInitialized = false;

window.onload = async function() {
    try {
        await loadGameDataFromSheets();
        window.gameData = gameData;
        
        setupBasicUI();
        initializeManagers();
        attachEventListeners();
        
        // Trigger initial calculation after everything is set up
        setTimeout(() => {
            isAppInitialized = true;
            console.log("Application Initialized. Performing first calculation.");
            handleCountryChange({ target: document.getElementById('country_doctrine') });
        }, 100);

    } catch (error) {
        console.error('Erro durante a inicialização da aplicação:', error);
        showInitializationError(error);
    }
};

function setupBasicUI() {
    toggleStep(1);
    initializeChoiceButtons();
    populateWingDropdowns();
}

function attachEventListeners() {
    document.querySelectorAll('input, select').forEach(element => {
        if (['aircraft_name', 'quantity'].includes(element.id)) {
            element.addEventListener('input', updateCalculations);
        } else {
            element.addEventListener('input', debouncedUpdateCalculations);
        }
        element.addEventListener('change', updateCalculations);
    });

    document.querySelectorAll('.step-header').forEach(header => {
        header.addEventListener('click', (event) => toggleStep(parseInt(event.currentTarget.dataset.step)));
    });

    document.getElementById('generate-sheet-icon')?.addEventListener('click', generateSheet);
    document.getElementById('country_doctrine')?.addEventListener('change', handleCountryChange);
    document.getElementById('production_turns')?.addEventListener('change', handleProductionTurnChange);
}

function handleCountryChange(event) {
    if (!isAppInitialized && event.target.value === 'loading') return;
    const countryName = event.target.value;
    if (countryName && gameData.countries?.[countryName]) {
        const countryData = gameData.countries[countryName];
        const techLevel = countryData.tech_level_air || 0;
        applyTechLevelRestrictions(techLevel);
        document.getElementById('country_bonus_note').textContent = `Nível Aeronáutico: ${techLevel} | Capacidade: ${countryData.production_capacity?.toLocaleString('pt-BR') || 'N/A'}`;
    }
    updateCalculations();
}

function handleProductionTurnChange(event) {
    const turns = parseInt(event.target.value) || 0;
    setProductionLock(turns > 0);
    updateCalculations();
}

function showInitializationError(error) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'fixed top-5 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50';
    errorContainer.innerHTML = `
        <strong class="font-bold">Erro na Inicialização!</strong>
        <span class="block sm:inline">Houve um problema ao carregar os dados. Tente recarregar a página.</span>
        <p class="text-xs mt-2">Detalhe: ${error.message}</p>
    `;
    document.body.appendChild(errorContainer);
}

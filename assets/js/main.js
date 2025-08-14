// assets/js/main.js

import { loadGameDataFromSheets, gameData } from './data.js';
import { updateCalculations } from './calculations.js';
import { 
    toggleStep, generateSheet, initializeChoiceButtons, populateWingDropdowns, 
    applyTechLevelRestrictions, setProductionLock, updateUI, updateProgress
} from './ui.js';
import { debounce, stateManager, templateManager, initializeManagers } from './managers.js';

let isAppInitialized = false;

// Função "maestro" que calcula e depois atualiza a UI
function performUpdateAndRefreshUI() {
    if (!isAppInitialized) return;
    const performanceData = updateCalculations();
    updateUI(performanceData); // updateUI pode lidar com 'null' se os cálculos falharem
    updateProgress();
}

const debouncedPerformUpdate = debounce(performUpdateAndRefreshUI, 250);

window.onload = async function() {
    try {
        await loadGameDataFromSheets();
        window.gameData = gameData;
        
        setupBasicUI();
        initializeManagers();
        attachEventListeners();
        
        // Trigger inicialização
        setTimeout(() => {
            isAppInitialized = true;
            console.log("Application Initialized. Performing first setup.");
            // Simula um evento de 'change' para carregar as restrições de tecnologia iniciais
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
    // Delegação de eventos para performance
    const formContainer = document.querySelector('.lg\\:col-span-2');
    if (formContainer) {
        formContainer.addEventListener('input', (event) => {
            if (event.target.matches('input, select')) {
                debouncedPerformUpdate();
            }
        });
        formContainer.addEventListener('change', (event) => {
             if (event.target.matches('input, select')) {
                performUpdateAndRefreshUI();
            }
        });
    }

    document.querySelectorAll('.step-header').forEach(header => {
        header.addEventListener('click', (event) => toggleStep(parseInt(event.currentTarget.dataset.step)));
    });

    document.getElementById('generate-sheet-icon')?.addEventListener('click', generateSheet);
    document.getElementById('country_doctrine')?.addEventListener('change', handleCountryChange);
    document.getElementById('production_turns')?.addEventListener('change', handleProductionTurnChange);
}

function handleCountryChange(event) {
    const countryName = event.target.value;
    if (countryName && gameData.countries?.[countryName]) {
        const countryData = gameData.countries[countryName];
        const techLevel = countryData.tech_level_air || 0;
        applyTechLevelRestrictions(techLevel);
        document.getElementById('country_bonus_note').textContent = `Nível Aeronáutico: ${techLevel} | Capacidade: ${countryData.production_capacity?.toLocaleString('pt-BR') || 'N/A'}`;
    }
    performUpdateAndRefreshUI();
}

function handleProductionTurnChange(event) {
    const turns = parseInt(event.target.value) || 0;
    setProductionLock(turns > 0);
    performUpdateAndRefreshUI();
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

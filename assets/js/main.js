// assets/js/main.js

import { loadGameDataFromSheets, gameData } from './data.js'; // Importa gameData também
import { updateCalculations } from './calculations.js';
import { toggleStep, generateSheet, createTemplateMenu, createUndoRedoButtons, populateWingDropdowns, populateTechRestrictedFields, populateEngineTypeSelection, populateSuperchargerSelection, updatePerformanceSliders, updateDesignConsequences } from './ui.js';
import { debounce, stateManager, templateManager, autoSaveManager, keyboardManager } from './managers.js';

const debouncedUpdateCalculations = debounce(updateCalculations, 250);

window.onload = function() {
    // Carrega os dados das planilhas e então inicializa a UI
    loadGameDataFromSheets().then(() => {
        // Abre o primeiro passo do formulário por padrão
        toggleStep(1);

        // Adiciona listener para o dropdown de país para aplicar restrições de tecnologia
        const countryDropdown = document.getElementById('country_doctrine');
        if (countryDropdown) {
            countryDropdown.addEventListener('change', () => {
                const selectedCountryName = countryDropdown.value;
                const countryData = gameData.countries[selectedCountryName];
                if (countryData) {
                    populateTechRestrictedFields(countryData.tech_level_air);
                }
                updateCalculations();
            });
        }

        // Popula os dropdowns de asa e aplica as restrições iniciais com base no país padrão/selecionado
        const initialCountryData = gameData.countries[countryDropdown?.value || "Genérico / Padrão"];
        if (initialCountryData) {
            populateTechRestrictedFields(initialCountryData.tech_level_air);
        } else {
            populateTechRestrictedFields(0); // Fallback para nível de tecnologia 0 se nenhum país for selecionado
        }
        
        // Realiza os cálculos iniciais após os dados serem carregados e restaurados do autosave
        updateCalculations();
        // Salva o estado inicial para que o undo/redo funcione desde o começo
        stateManager.saveState(autoSaveManager.getCurrentFormData());
    });

    // Cria os botões de templates e undo/redo
    createTemplateMenu(templateManager);
    createUndoRedoButtons(stateManager, keyboardManager);

    // Anexa event listeners a todos os campos de input e selects relevantes
    // Agora, a maioria dos listeners do Passo 3 será gerenciada pelas funções de UI específicas
    document.querySelectorAll('input, select').forEach(element => {
        // Exclui 'aircraft_name', 'quantity', e os novos sliders do design wizard do debounce para uma atualização mais imediata
        // Os sliders de target-speed e target-range são tratados por updateDesignConsequences em ui.js
        // Os botões de motor/supercharger são tratados por selectEngineType/selectSuperchargerType em ui.js
        if (element.id !== 'aircraft_name' && element.id !== 'quantity' &&
            element.id !== 'target-speed' && element.id !== 'target-range' &&
            !element.classList.contains('engine-choice-btn') && !element.classList.contains('supercharger-choice-btn')) {
            element.addEventListener('input', debouncedUpdateCalculations);
            element.addEventListener('change', debouncedUpdateCalculations); // Para selects
        } else {
            // Para 'aircraft_name' e 'quantity', atualiza imediatamente (sem debounce)
            element.addEventListener('input', updateCalculations);
            element.addEventListener('change', updateCalculations);
        }
    });

    // Anexa event listeners aos cabeçalhos dos passos
    document.querySelectorAll('.step-header').forEach(header => {
        header.addEventListener('click', (event) => {
            const step = parseInt(event.currentTarget.dataset.step);
            toggleStep(step);
        });
    });

    // Event listener para o ícone de gerar ficha
    const generateSheetIcon = document.getElementById('generate-sheet-icon');
    if (generateSheetIcon) {
        generateSheetIcon.addEventListener('click', generateSheet);
    }
};

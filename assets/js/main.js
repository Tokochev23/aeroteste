// assets/js/main.js

import { loadGameDataFromSheets, gameData } from './data.js';
import { updateCalculations } from './calculations.js';
import { toggleStep, generateSheet, createTemplateMenu, createUndoRedoButtons, populateWingDropdowns, applyTechLevelRestrictions, populateEngineTypeSelection } from './ui.js';
import { debounce, stateManager, templateManager, initializeManagers } from './managers.js';

const debouncedUpdateCalculations = debounce(updateCalculations, 250);

// Flag para indicar se a aplicação foi totalmente inicializada
let isAppInitialized = false;

window.onload = async function() {
    try {
        console.log('Iniciando carregamento da aplicação...');
        
        // 1. Primeiro carrega os dados das planilhas
        console.log('Carregando dados das planilhas...');
        await loadGameDataFromSheets();
        
        // Expõe gameData globalmente para acesso por outras partes do código
        window.gameData = gameData;
        
        // 2. Configura a UI básica
        console.log('Configurando UI básica...');
        setupBasicUI();
        
        // 3. Inicializa os managers (incluindo auto-save)
        console.log('Inicializando managers...');
        initializeManagers();
        
        // 4. Cria elementos da UI que dependem dos managers
        console.log('Criando elementos da UI...');
        createUIElements();
        
        // 5. Anexa event listeners
        console.log('Anexando event listeners...');
        await attachEventListeners();
        
        // 6. Configurações finais
        console.log('Configurações finais...');
        await finalSetup();
        
        // 7. Marca como inicializado
        isAppInitialized = true;
        console.log('Aplicação inicializada com sucesso!');
        
    } catch (error) {
        console.error('Erro durante a inicialização da aplicação:', error);
        // Mostra uma mensagem de erro para o usuário
        showInitializationError(error);
    }
};

/**
 * Configura a UI básica que não depende de dados externos
 */
function setupBasicUI() {
    // Abre o primeiro passo do formulário por padrão
    toggleStep(1);
    
    // Configura os dropdowns básicos se os dados estiverem disponíveis
    try {
        populateWingDropdowns();
    } catch (error) {
        console.warn('Erro ao popular dropdowns de asa:', error);
    }
}

/**
 * Cria elementos da UI que dependem dos managers
 */
function createUIElements() {
    try {
        createTemplateMenu(templateManager);
        createUndoRedoButtons(stateManager, 
            // Passa uma referência que será resolvida quando keyboardManager estiver disponível
            { 
                undo: () => window.keyboardManager?.undo(), 
                redo: () => window.keyboardManager?.redo() 
            }
        );
    } catch (error) {
        console.warn('Erro ao criar elementos da UI:', error);
    }
}

/**
 * Anexa todos os event listeners
 */
async function attachEventListeners() {
    try {
        // Event listeners para campos de input e selects
        document.querySelectorAll('input, select').forEach(element => {
            // Campos que precisam de atualização imediata
            if (['aircraft_name', 'quantity'].includes(element.id)) {
                element.addEventListener('input', safeUpdateCalculations);
                element.addEventListener('change', safeUpdateCalculations);
            } else {
                // Outros campos usam debounce para melhor performance
                element.addEventListener('input', debouncedUpdateCalculations);
                element.addEventListener('change', debouncedUpdateCalculations);
            }
        });

        // Event listeners para cabeçalhos dos passos
        document.querySelectorAll('.step-header').forEach(header => {
            header.addEventListener('click', (event) => {
                const step = parseInt(event.currentTarget.dataset.step);
                if (!isNaN(step)) {
                    toggleStep(step);
                }
            });
        });

        // Event listener para o ícone de gerar ficha
        const generateSheetIcon = document.getElementById('generate-sheet-icon');
        if (generateSheetIcon) {
            generateSheetIcon.addEventListener('click', safeGenerateSheet);
        }

        // Event listener para mudanças de país (aplica restrições de tecnologia)
        const countrySelect = document.getElementById('country_doctrine');
        if (countrySelect) {
            countrySelect.addEventListener('change', handleCountryChange);
        }

        // Event listeners para tipo de asa (força compatibilidade biplano)
        const wingTypeSelect = document.getElementById('wing_type');
        if (wingTypeSelect) {
            wingTypeSelect.addEventListener('change', handleWingTypeChange);
        }

    } catch (error) {
        console.error('Erro ao anexar event listeners:', error);
    }
}

/**
 * Configurações finais da aplicação
 */
async function finalSetup() {
    try {
        // Realiza os cálculos iniciais se possível
        setTimeout(() => {
            safeUpdateCalculations();
        }, 200);
        
        // Salva o estado inicial para undo/redo
        setTimeout(async () => {
            if (window.autoSaveManager?.isInitialized) {
                const formData = window.autoSaveManager.getCurrentFormData();
                stateManager.saveState(formData);
            }
            // Atualiza o progresso inicial
            await safeUpdateProgress();
        }, 500);
        
    } catch (error) {
        console.warn('Erro nas configurações finais:', error);
    }
}

/**
 * Wrapper seguro para updateCalculations
 */
function safeUpdateCalculations() {
    if (!isAppInitialized) {
        console.log('Aplicação ainda não foi inicializada, pulando cálculos...');
        return;
    }
    
    try {
        updateCalculations();
    } catch (error) {
        console.warn('Erro ao atualizar cálculos:', error);
        // Não quebra a aplicação, apenas loga o erro
    }
}

/**
 * Wrapper seguro para updateProgress (agora async)
 */
async function safeUpdateProgress() {
    if (!isAppInitialized) {
        console.log('Aplicação ainda não foi inicializada, pulando atualização de progresso...');
        return;
    }
    
    try {
        const { updateProgress } = await import('./ui.js');
        await updateProgress();
    } catch (error) {
        console.warn('Erro ao atualizar progresso:', error);
        // Não quebra a aplicação, apenas loga o erro
    }
}

/**
 * Wrapper seguro para generateSheet
 */
function safeGenerateSheet() {
    try {
        generateSheet();
    } catch (error) {
        console.error('Erro ao gerar ficha:', error);
        alert('Erro ao gerar ficha. Verifique se todos os campos obrigatórios estão preenchidos.');
    }
}

/**
 * Manipula mudanças de país
 */
async function handleCountryChange(event) {
    try {
        const countryName = event.target.value;
        if (countryName && window.gameData?.countries?.[countryName]) {
            const countryData = window.gameData.countries[countryName];
            const techLevel = countryData.tech_level_air || 0;
            
            // Aplica restrições de tecnologia
            applyTechLevelRestrictions(techLevel);
            
            // Atualiza nota de bônus do país
            const countryBonusNote = document.getElementById('country_bonus_note');
            if (countryBonusNote) {
                countryBonusNote.textContent = `Nível Aeronáutico: ${techLevel} | Capacidade: ${countryData.production_capacity?.toLocaleString('pt-BR') || 'N/A'}`;
            }
        }
        
        safeUpdateCalculations();
        await safeUpdateProgress();
    } catch (error) {
        console.warn('Erro ao processar mudança de país:', error);
    }
}

/**
 * Manipula mudanças de tipo de asa
 */
async function handleWingTypeChange(event) {
    try {
        const wingType = event.target.value;
        const wingPositionSelect = document.getElementById('wing_position');
        
        if (wingType === 'biplane' && wingPositionSelect) {
            // Se biplano, força a posição para 'biplane_wing_pos'
            wingPositionSelect.value = 'biplane_wing_pos';
            wingPositionSelect.disabled = true;
        } else if (wingPositionSelect) {
            // Se não for biplano, habilita a seleção
            wingPositionSelect.disabled = false;
            if (wingPositionSelect.value === 'biplane_wing_pos') {
                wingPositionSelect.value = '';
            }
        }
        
        safeUpdateCalculations();
        await safeUpdateProgress();
    } catch (error) {
        console.warn('Erro ao processar mudança de tipo de asa:', error);
    }
}

/**
 * Mostra erro de inicialização para o usuário
 */
function showInitializationError(error) {
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #fee2e2;
        color: #991b1b;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #fecaca;
        z-index: 1000;
        max-width: 500px;
        text-align: center;
    `;
    errorContainer.innerHTML = `
        <h3>❌ Erro na Inicialização</h3>
        <p>Houve um problema ao carregar a aplicação. Tente recarregar a página.</p>
        <p><small>Erro técnico: ${error.message}</small></p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #991b1b; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Recarregar Página
        </button>
    `;
    document.body.appendChild(errorContainer);
}

// Exponha algumas funções globalmente para debug/acesso via console
window.safeUpdateCalculations = safeUpdateCalculations;
window.safeUpdateProgress = safeUpdateProgress;
window.isAppInitialized = () => isAppInitialized;

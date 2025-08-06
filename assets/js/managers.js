// assets/js/managers.js

import { updateCalculations } from './calculations.js';
import { updateUI } from './ui.js';

// --- FUNÇÕES DE UTILIDADE ---
/**
 * Implementa uma função debounce para limitar a frequência de execução de uma função.
 * Útil para eventos como 'input' em campos de texto, evitando chamadas excessivas.
 * @param {function} func - A função a ser executada.
 * @param {number} wait - O tempo de espera em milissegundos antes de executar a função.
 * @returns {function} - A função debounced.
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- GERENCIAMENTO DE ESTADO (UNDO/REDO) ---
/**
 * Gerencia o histórico de estados da aplicação para funcionalidades de desfazer/refazer.
 */
export class StateManager {
    constructor(maxHistory = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = maxHistory;
        this.listeners = [];
    }

    /**
     * Salva o estado atual da aplicação no histórico.
     * @param {object} state - O objeto de estado a ser salvo.
     */
    saveState(state) {
        // Limpa o histórico "à frente" se um novo estado for salvo após um 'undo'
        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(JSON.parse(JSON.stringify(state))); // Salva uma cópia profunda do estado
        this.currentIndex++;
        // Limita o tamanho do histórico
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.currentIndex--;
        }
        this.notifyListeners();
    }

    /**
     * Verifica se a operação de desfazer é possível.
     * @returns {boolean} - True se puder desfazer, false caso contrário.
     */
    canUndo() { return this.currentIndex > 0; }

    /**
     * Verifica se a operação de refazer é possível.
     * @returns {boolean} - True se puder refazer, false caso contrário.
     */
    canRedo() { return this.currentIndex < this.history.length - 1; }

    /**
     * Desfaz a última alteração de estado.
     * @returns {object|null} - O estado anterior ou null se não for possível desfazer.
     */
    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            this.notifyListeners();
            return this.getCurrentState();
        }
        return null;
    }

    /**
     * Refaz a última alteração de estado desfeita.
     * @returns {object|null} - O próximo estado ou null se não for possível refazer.
     */
    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            this.notifyListeners();
            return this.getCurrentState();
        }
        return null;
    }

    /**
     * Obtém o estado atual do histórico.
     * @returns {object|null} - O estado atual ou null se o histórico estiver vazio.
     */
    getCurrentState() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return JSON.parse(JSON.stringify(this.history[this.currentIndex])); // Retorna uma cópia profunda
        }
        return null;
    }

    /**
     * Adiciona um callback para ser notificado sobre mudanças no estado.
     * @param {function} callback - A função de callback.
     */
    addListener(callback) { this.listeners.push(callback); }

    /**
     * Notifica todos os listeners sobre uma mudança no estado.
     */
    notifyListeners() { this.listeners.forEach(callback => callback(this)); }
}

// --- SISTEMA DE TEMPLATES ---
/**
 * Gerencia os templates de configuração de aeronaves.
 */
export class TemplateManager {
    constructor() {
        this.templates = {
            'fighter_light': {
                name: 'Caça Leve Padrão',
                description: 'Configuração balanceada para agilidade.',
                config: { aircraft_type: 'light_fighter', wing_position: 'low_wing', wing_shape: 'elliptical', mg_50: 2, cannon_20: 2, enclosed_cockpit: true, radio_hf: true, pilot_armor: true }
            },
            'fighter_heavy': {
                name: 'Caça Pesado/Interceptor',
                description: 'Configuração para interceptação de bombardeiros.',
                config: { aircraft_type: 'heavy_fighter', wing_position: 'mid_wing', wing_shape: 'tapered', mg_50: 4, cannon_20: 2, pilot_armor: true, engine_armor: true, enclosed_cockpit: true, oxygen_system: true, radio_hf: true }
            },
            'bomber_tactical': {
                name: 'Bombardeiro Tático',
                description: 'Configuração para bombardeio médio.',
                config: { aircraft_type: 'tactical_bomber', wing_position: 'shoulder_wing', wing_shape: 'constant_chord', bomb_250: 4, bomb_100: 8, defensive_turret_type: 'powered_turret', defensive_mg_50: 2, pilot_armor: true, self_sealing_tanks: true, enclosed_cockpit: true, oxygen_system: true, radio_hf: true, basic_bomb_sight: true }
            },
            'cas_ground': {
                name: 'Apoio Aéreo Próximo',
                description: 'Configuração para CAS resistente.',
                config: { aircraft_type: 'cas', wing_position: 'high_wing', wing_shape: 'constant_chord', cannon_37: 1, bomb_100: 6, rockets: 8, pilot_armor: true, engine_armor: true, self_sealing_tanks: true, enclosed_cockpit: true, radio_hf: true, dive_brakes: true }
            }
        };
    }

    /**
     * Obtém um template específico pelo seu ID.
     * @param {string} id - O ID do template.
     * @returns {object|undefined} - O objeto do template ou undefined se não for encontrado.
     */
    getTemplate(id) { return this.templates[id]; }

    /**
     * Obtém todos os templates disponíveis.
     * @returns {Array<object>} - Um array de todos os templates.
     */
    getAllTemplates() { return Object.keys(this.templates).map(id => ({ id, ...this.templates[id] })); }

    /**
     * Aplica um template à interface de usuário e recalcula as estatísticas.
     * @param {string} templateId - O ID do template a ser aplicado.
     * @returns {boolean} - True se o template foi aplicado com sucesso, false caso contrário.
     */
    applyTemplate(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) return false;

        // Resetar todos os inputs para seus valores padrão antes de aplicar o template
        document.querySelectorAll('input[type="number"], select').forEach(el => {
            // Exclui campos que não devem ser resetados pelos templates (ex: quantidade, doutrinas, slider de qualidade)
            if(!['quantity', 'country_doctrine', 'air_doctrine', 'production_quality_slider'].includes(el.id)) {
                el.value = el.tagName === 'SELECT' ? el.options[0].value : 0;
            }
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);

        // Aplica os valores do template aos elementos da UI
        Object.entries(template.config).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') element.checked = Boolean(value);
                else element.value = value;
            }
        });
        
        // Só chama updateCalculations se estiver disponível (evita erro de inicialização)
        if (typeof updateCalculations === 'function') {
            try {
                updateCalculations();
            } catch (error) {
                console.warn('Erro ao atualizar cálculos após aplicar template:', error);
            }
        }
        
        return true;
    }
}

// --- SISTEMA DE AUTO-SALVAMENTO ---
/**
 * Gerencia o auto-salvamento do estado do formulário no localStorage.
 */
export class AutoSaveManager {
    constructor(saveInterval = 5000) {
        this.saveInterval = saveInterval;
        this.lastSaveData = null;
        this.saveTimer = null;
        this.isInitialized = false; // Flag para controlar se foi inicializado
    }

    /**
     * Inicializa o auto-salvamento. Deve ser chamado após todas as dependências estarem prontas.
     */
    init() {
        if (this.isInitialized) return; // Previne dupla inicialização
        
        this.loadAutoSave();
        this.startAutoSave();
        this.isInitialized = true;
    }

    /**
     * Inicia o timer de auto-salvamento.
     */
    startAutoSave() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
        }
        this.saveTimer = setInterval(() => this.autoSave(), this.saveInterval);
    }

    /**
     * Para o auto-salvamento.
     */
    stopAutoSave() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
            this.saveTimer = null;
        }
    }

    /**
     * Obtém os dados atuais do formulário.
     * @returns {object} - Um objeto contendo os IDs e valores de todos os inputs.
     */
    getCurrentFormData() {
        const data = {};
        try {
            document.querySelectorAll('input, select').forEach(element => {
                if (element.id) {
                    if (element.type === 'checkbox') data[element.id] = element.checked;
                    else data[element.id] = element.value;
                }
            });
        } catch (error) {
            console.warn('Erro ao obter dados do formulário:', error);
        }
        return data;
    }

    /**
     * Salva os dados do formulário no localStorage se houver mudanças.
     */
    autoSave() {
        if (!this.isInitialized) return; // Não salva se não foi inicializado
        
        try {
            const currentData = this.getCurrentFormData();
            const dataString = JSON.stringify(currentData);
            if (dataString !== this.lastSaveData) {
                localStorage.setItem('aircraft_autosave', dataString);
                this.lastSaveData = dataString;
            }
        } catch (error) {
            console.warn('Erro durante auto-salvamento:', error);
        }
    }

    /**
     * Carrega os dados salvos automaticamente do localStorage.
     */
    loadAutoSave() {
        const saved = localStorage.getItem('aircraft_autosave');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.restoreFormData(data);
            } catch (e) {
                console.error("Erro ao parsear dados de auto-salvamento:", e);
                localStorage.removeItem('aircraft_autosave'); // Limpa dados corrompidos
            }
        }
    }

    /**
     * Restaura os dados do formulário a partir de um objeto de dados.
     * @param {object} data - O objeto de dados a ser restaurado.
     */
    restoreFormData(data) {
        try {
            Object.entries(data).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    if (element.type === 'checkbox') element.checked = Boolean(value);
                    else element.value = value;
                }
            });
            
            // Só tenta recalcular se updateCalculations estiver disponível e seguro de chamar
            if (typeof updateCalculations === 'function') {
                // Adiciona um pequeno delay para garantir que tudo esteja inicializado
                setTimeout(() => {
                    try {
                        updateCalculations();
                    } catch (error) {
                        console.warn('Erro ao recalcular após restaurar dados:', error);
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Erro ao restaurar dados do formulário:', error);
        }
    }

    /**
     * Limpa os dados de auto-salvamento.
     */
    clearAutoSave() {
        localStorage.removeItem('aircraft_autosave');
        this.lastSaveData = null;
    }
}

// --- ATALHOS DE TECLADO ---
/**
 * Gerencia os atalhos de teclado para desfazer/refazer e gerar ficha.
 */
export class KeyboardManager {
    constructor(stateManagerInstance, autoSaveManagerInstance) {
        this.stateManager = stateManagerInstance;
        this.autoSaveManager = autoSaveManagerInstance;
        this.setupKeyboardListeners();
    }

    /**
     * Configura os listeners de teclado.
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            // Só processa se não estiver em um campo de input
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                if (e.ctrlKey && e.key.toLowerCase() === 'z') { 
                    e.preventDefault(); 
                    this.undo(); 
                }
                if (e.ctrlKey && e.key.toLowerCase() === 'y') { 
                    e.preventDefault(); 
                    this.redo(); 
                }
                if (e.ctrlKey && e.key.toLowerCase() === 'g') { 
                    e.preventDefault(); 
                    // generateSheet seria chamado via UI, não aqui
                }
            }
        });
    }

    /**
     * Chama a função de desfazer do StateManager e restaura o formulário.
     */
    undo() {
        try {
            const prevState = this.stateManager.undo();
            if (prevState && this.autoSaveManager.isInitialized) {
                this.autoSaveManager.restoreFormData(prevState);
            }
        } catch (error) {
            console.warn('Erro ao desfazer:', error);
        }
    }

    /**
     * Chama a função de refazer do StateManager e restaura o formulário.
     */
    redo() {
        try {
            const nextState = this.stateManager.redo();
            if (nextState && this.autoSaveManager.isInitialized) {
                this.autoSaveManager.restoreFormData(nextState);
            }
        } catch (error) {
            console.warn('Erro ao refazer:', error);
        }
    }
}

// --- INSTÂNCIAS GLOBAIS ---
// REMOVIDAS daqui - serão criadas e inicializadas em main.js na ordem correta
export const stateManager = new StateManager();
export const templateManager = new TemplateManager();

// AutoSaveManager e KeyboardManager serão criados em main.js após a inicialização completa
export let autoSaveManager = null;
export let keyboardManager = null;

/**
 * Inicializa os managers que dependem de outras partes da aplicação.
 * Deve ser chamado após todas as dependências estarem prontas.
 */
export function initializeManagers() {
    if (!autoSaveManager) {
        autoSaveManager = new AutoSaveManager();
    }
    if (!keyboardManager) {
        keyboardManager = new KeyboardManager(stateManager, autoSaveManager);
    }
    
    // Inicializa o AutoSaveManager apenas agora
    autoSaveManager.init();
}

// assets/js/managers.js

import { updateCalculations } from './calculations.js';
import { updateUI } from './ui.js';

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

export class StateManager {
    constructor(maxHistory = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = maxHistory;
        this.listeners = [];
    }

    saveState(state) {
        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(JSON.parse(JSON.stringify(state)));
        this.currentIndex++;
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.currentIndex--;
        }
        this.notifyListeners();
    }

    canUndo() { return this.currentIndex > 0; }
    canRedo() { return this.currentIndex < this.history.length - 1; }

    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            this.notifyListeners();
            return this.getCurrentState();
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            this.notifyListeners();
            return this.getCurrentState();
        }
        return null;
    }

    getCurrentState() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
        }
        return null;
    }

    addListener(callback) { this.listeners.push(callback); }
    notifyListeners() { this.listeners.forEach(callback => callback(this)); }
}

export class TemplateManager {
    constructor() {
        this.templates = {
            'fighter_light': {
                name: 'Caça Leve Padrão',
                description: 'Configuração balanceada para agilidade.',
                config: { aircraft_type: 'light_fighter', wing_shape: 'elliptical', 'payload_station_fuselage_gun': 'cannon_20', 'payload_station_wing_gun_l': 'mg_50', 'payload_station_wing_gun_r': 'mg_50', enclosed_cockpit: true, radio_hf: true, pilot_armor: true }
            },
            'bomber_tactical': {
                name: 'Bombardeiro Tático',
                description: 'Configuração para bombardeio médio.',
                config: { aircraft_type: 'tactical_bomber', wing_shape: 'constant_chord', 'payload_station_bomb_bay': 'bomb_250', defensive_turret_type: 'powered_turret', defensive_mg_50: 2, pilot_armor: true, self_sealing_tanks: true, enclosed_cockpit: true, oxygen_system: true, radio_hf: true, basic_bomb_sight: true }
            },
        };
    }

    getTemplate(id) { return this.templates[id]; }
    getAllTemplates() { return Object.keys(this.templates).map(id => ({ id, ...this.templates[id] })); }

    applyTemplate(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) return false;

        document.querySelectorAll('input[type="number"], select').forEach(el => {
            if(!['quantity', 'country_doctrine', 'air_doctrine', 'production_quality_slider', 'production_turns'].includes(el.id)) {
                el.value = el.tagName === 'SELECT' ? (el.options[0]?.value || '') : 0;
            }
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);

        Object.entries(template.config).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') element.checked = Boolean(value);
                else element.value = value;
            }
        });
        
        if (typeof updateCalculations === 'function') {
            updateCalculations();
        }
        
        return true;
    }
}

export class AutoSaveManager {
    constructor(saveInterval = 5000) {
        this.saveInterval = saveInterval;
        this.lastSaveData = null;
        this.saveTimer = null;
    }

    init() {
        this.loadAutoSave();
        this.startAutoSave();
    }

    startAutoSave() {
        if (this.saveTimer) clearInterval(this.saveTimer);
        this.saveTimer = setInterval(() => this.autoSave(), this.saveInterval);
    }

    getCurrentFormData() {
        const data = {};
        document.querySelectorAll('input, select').forEach(element => {
            if (element.id) {
                if (element.type === 'checkbox') data[element.id] = element.checked;
                else data[element.id] = element.value;
            }
        });
        return data;
    }

    autoSave() {
        const currentData = this.getCurrentFormData();
        const dataString = JSON.stringify(currentData);
        if (dataString !== this.lastSaveData) {
            localStorage.setItem('aircraft_autosave', dataString);
            this.lastSaveData = dataString;
        }
    }

    loadAutoSave() {
        const saved = localStorage.getItem('aircraft_autosave');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.restoreFormData(data);
            } catch (e) {
                console.error("Erro ao parsear dados de auto-salvamento:", e);
                localStorage.removeItem('aircraft_autosave');
            }
        }
    }

    restoreFormData(data) {
        Object.entries(data).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') element.checked = Boolean(value);
                else element.value = value;
            }
        });
        if (typeof updateCalculations === 'function') {
            setTimeout(() => updateCalculations(), 100);
        }
    }
}

export const stateManager = new StateManager();
export const templateManager = new TemplateManager();
export let autoSaveManager = null;

export function initializeManagers() {
    if (!autoSaveManager) {
        autoSaveManager = new AutoSaveManager();
        autoSaveManager.init();
    }
}

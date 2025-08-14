// assets/js/data.js

// --- CONFIGURAÇÃO DA PLANILHA DO GOOGLE SHEETS ---
export const COUNTRY_STATS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=0&single=true&output=csv';
export const METAIS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=1505649898&single=true&output=csv';
export const AERONAVES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=565684512&single=true&output=csv';

// --- DADOS DO JOGO ---
export const gameData = {
    countries: {}, // Será preenchido dinamicamente
    doctrines: {
        air_superiority: { name: "Superioridade Aérea", description: "Foco em caças de alta performance para dominar os céus. Prioriza velocidade, manobrabilidade e poder de fogo ar-ar.", cost_modifier: 1.15, performance_bonus: { speed: 1.05, maneuverability: 1.10, rate_of_climb: 1.05 }, reliability_modifier: 0.95 },
        strategic_bombing: { name: "Bombardeio Estratégico", description: "Doutrina centrada em bombardeiros pesados de longo alcance para destruir a indústria e a moral inimiga.", cost_modifier: 1.20, performance_bonus: { range: 1.20, service_ceiling: 1.10 }, maneuverability_penalty: 0.85 },
        ground_support: { name: "Apoio Tático", description: "Uso de aeronaves para atacar alvos no campo de batalha. Prioriza robustez, capacidade de carga e operação em baixa altitude.", cost_modifier: 1.0, reliability_modifier: 1.10, armor_effectiveness_modifier: 1.10, speed_penalty: 0.90 },
        fleet_defense: { name: "Defesa de Frota", description: "Caças e bombardeiros baseados em porta-aviões. Requerem construção robusta, bom alcance e asas dobráveis.", cost_modifier: 1.25, reliability_modifier: 1.05, performance_bonus: { range: 1.10 }, weight_penalty: 1.05 }
    },
    components: {
        aircraft_types: {
            light_fighter: { 
                name: "Caça Leve", cost: 40000, weight: 1500, metal_cost: 2000, crew: 1, wing_area_m2: 18, cl_max: 1.6, cd_0: 0.025, aspect_ratio: 6.0, oswald_efficiency: 0.8, reliability_base: 0.95, maneuverability_base: 1.15, 
                limits: { min_speed: 450, max_speed: 750, min_range: 600, max_range: 2000 }, 
                description: "Ágil e rápido, ideal para dogfights. Geralmente levemente armado e blindado.",
                stress_per_g: 15, stress_per_speed_kmh: 0.08, base_cg: 0,
                payload_stations: [
                    { id: 'fuselage_gun', name: 'Fuselagem (Canhão)', max_weight_kg: 200, cg_position: -0.5, allowed_types: ['gun'] },
                    { id: 'wing_gun_l', name: 'Asa Esq. (Metralhadora)', max_weight_kg: 100, cg_position: -0.2, allowed_types: ['gun'] },
                    { id: 'wing_gun_r', name: 'Asa Dir. (Metralhadora)', max_weight_kg: 100, cg_position: -0.2, allowed_types: ['gun'] },
                    { id: 'centerline_hardpoint', name: 'Ponto Central', max_weight_kg: 250, cg_position: 0, allowed_types: ['bomb', 'recon', 'fuel'] }
                ]
            },
            heavy_fighter: { 
                name: "Caça Pesado/Interceptor", cost: 75000, weight: 3500, metal_cost: 4000, crew: 2, wing_area_m2: 25, cl_max: 1.5, cd_0: 0.030, aspect_ratio: 6.5, oswald_efficiency: 0.78, reliability_base: 0.90, maneuverability_base: 0.9, 
                limits: { min_speed: 480, max_speed: 720, min_range: 1000, max_range: 2500 }, 
                description: "Armamento pesado e boa performance em altitude para interceptar bombardeiros. Menos ágil que caças leves.",
                stress_per_g: 20, stress_per_speed_kmh: 0.1, base_cg: 0.1,
                payload_stations: [
                    { id: 'nose_guns', name: 'Nariz (Canhões)', max_weight_kg: 400, cg_position: -1, allowed_types: ['gun'] },
                    { id: 'wing_guns', name: 'Asas (Canhões)', max_weight_kg: 250, cg_position: -0.3, allowed_types: ['gun'] },
                    { id: 'wing_hardpoints', name: 'Asas (Bombas/Foguetes)', max_weight_kg: 500, cg_position: 0.1, allowed_types: ['bomb', 'rocket', 'fuel'] }
                ]
            },
            cas: { 
                name: "Apoio Aéreo Próximo (CAS)", cost: 65000, weight: 3000, metal_cost: 3200, crew: 1, wing_area_m2: 28, cl_max: 1.7, cd_0: 0.038, aspect_ratio: 5.8, oswald_efficiency: 0.75, reliability_base: 0.98, maneuverability_base: 0.95, 
                limits: { min_speed: 350, max_speed: 550, min_range: 500, max_range: 1500 }, 
                description: "Robusto e bem armado para atacar alvos terrestres. Geralmente mais lento e blindado.",
                stress_per_g: 25, stress_per_speed_kmh: 0.06, base_cg: 0.2,
                 payload_stations: [
                    { id: 'centerline_cannon', name: 'Canhão Central', max_weight_kg: 700, cg_position: -0.2, allowed_types: ['gun'] },
                    { id: 'inner_wing_hardpoints', name: 'Asas (Interno)', max_weight_kg: 1000, cg_position: 0, allowed_types: ['bomb', 'rocket'] },
                    { id: 'outer_wing_hardpoints', name: 'Asas (Externo)', max_weight_kg: 500, cg_position: 0.2, allowed_types: ['bomb', 'rocket', 'gun_pod'] }
                ]
            },
            tactical_bomber: { 
                name: "Bombardeiro Tático", cost: 120000, weight: 5000, metal_cost: 6000, crew: 4, wing_area_m2: 50, cl_max: 1.4, cd_0: 0.033, aspect_ratio: 7.0, oswald_efficiency: 0.82, reliability_base: 0.92, maneuverability_base: 0.7, 
                limits: { min_speed: 400, max_speed: 600, min_range: 1200, max_range: 3000 }, 
                description: "Velocidade e alcance para atacar alvos táticos atrás das linhas inimigas. Carga de bombas moderada.",
                stress_per_g: 30, stress_per_speed_kmh: 0.05, base_cg: 0.3,
                payload_stations: [
                    { id: 'bomb_bay', name: 'Baía de Bombas', max_weight_kg: 2000, cg_position: 0, allowed_types: ['bomb'] },
                    { id: 'wing_hardpoints', name: 'Asas (Carga Externa)', max_weight_kg: 1000, cg_position: 0.1, allowed_types: ['bomb', 'torpedo', 'fuel'] }
                ]
            },
            strategic_bomber: { 
                name: "Bombardeiro Estratégico", cost: 250000, weight: 12000, metal_cost: 10000, crew: 7, wing_area_m2: 100, cl_max: 1.5, cd_0: 0.030, aspect_ratio: 8.5, oswald_efficiency: 0.85, reliability_base: 0.88, maneuverability_base: 0.5, 
                limits: { min_speed: 380, max_speed: 580, min_range: 3000, max_range: 6000 }, 
                description: "Longo alcance e grande capacidade de bombas para missões estratégicas profundas em território inimigo.",
                stress_per_g: 40, stress_per_speed_kmh: 0.04, base_cg: 0.5,
                payload_stations: [
                    { id: 'fwd_bomb_bay', name: 'Baía de Bombas (Frente)', max_weight_kg: 4000, cg_position: -0.2, allowed_types: ['bomb'] },
                    { id: 'aft_bomb_bay', name: 'Baía de Bombas (Atrás)', max_weight_kg: 4000, cg_position: 0.8, allowed_types: ['bomb'] }
                ]
            },
        },
        structure_materials: {
            wood_fabric: { name: "Madeira e Tecido", cost_mod: 0.7, weight_mod: 0.8, reliability_mod: 0.9, armor_mod: 0.7, tech_level_required: 0, description: "Leve e barato, mas frágil e vulnerável a fogo.", structural_stress_limit: 80 },
            wood_metal: { name: "Madeira e Metal", cost_mod: 1.0, weight_mod: 1.0, reliability_mod: 1.0, armor_mod: 1.0, tech_level_required: 30, description: "Estrutura de metal com superfícies de madeira/tecido. Bom equilíbrio.", structural_stress_limit: 100 },
            all_metal: { name: "Metal Completo", cost_mod: 1.4, weight_mod: 1.2, reliability_mod: 1.05, armor_mod: 1.2, tech_level_required: 50, description: "Estrutura totalmente metálica. Robusto, mas mais pesado que designs posteriores.", structural_stress_limit: 150 },
            duralumin: { name: "Duralumínio (Monocoque)", cost_mod: 1.6, weight_mod: 1.05, reliability_mod: 1.1, armor_mod: 1.3, tech_level_required: 70, description: "Construção de ponta com pele de alumínio tensionada. Leve e forte.", structural_stress_limit: 200 },
        },
        wing_types: {
            biplane: { name: "Biplane", cost_mod: 1.0, weight_mod: 1.1, drag_mod: 1.2, cl_max_mod: 1.1, cd_0_mod: 1.05, aspect_ratio_mod: 0.8, maneuverability_mod: 1.1, reliability_mod: 1.05, tech_level_required: 0, description: "Good lift at low speeds, strong structure, but high drag. Common in older designs." },
            monoplane_cantilever: { name: "Cantilever Monoplane", cost_mod: 1.2, weight_mod: 1.0, drag_mod: 0.9, cl_max_mod: 1.0, cd_0_mod: 0.9, aspect_ratio_mod: 1.0, reliability_mod: 1.0, tech_level_required: 40, description: "Clean design, lower drag, but initially heavier structure. Standard for modern aircraft." },
        },
        wing_shapes: {
            elliptical: {
                name: "Elliptical Wing",
                description: "Ideal lift distribution, like on the Spitfire. Excellent aerodynamic efficiency and maneuverability, but complex to manufacture.",
                turn_mod: 1.1, drag_mod: 0.92, cost_mod: 1.3,
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Wing_elliptical.svg", tech_level_required: 70
            },
            tapered: {
                name: "Tapered Wing",
                description: "Reduces weight at the tips, common in modern fighters. Good balance of performance and cost.",
                turn_mod: 1.05, drag_mod: 0.95, cost_mod: 1.1,
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Wing_tapered.svg", tech_level_required: 50
            },
            constant_chord: {
                name: "Constant Chord",
                description: "Uniform width, simple to manufacture. Common in trainers and transports. Less efficient at high speed.",
                turn_mod: 0.95, drag_mod: 1.05, cost_mod: 0.9,
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Wing_constant.svg", tech_level_required: 0
            },
            gull_wing: {
                name: "Gull Wing",
                description: "Downward bend allows for shorter landing gear and a larger propeller. Famous on the Stuka.",
                turn_mod: 0.9, stability_mod: 1.05, landing_gear_weight_mod: 0.85,
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Monoplane_gull.svg", tech_level_required: 40
            },
            inverted_gull: {
                name: "Inverted Gull Wing",
                description: "Upward bend at the center. Allows for a larger propeller and better downward visibility. Famous on the Corsair.",
                turn_mod: 1.02, propeller_clearance_bonus: true,
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Monoplane_inverted_gull.svg", tech_level_required: 60
            }
        },
        wing_features: {
            flaps: { name: "Flaps", cost: 5000, weight: 40, metal_cost: 50, reliability_mod: 0.98, cl_max_mod: 1.15, drag_mod: 1.02, tech_level_required: 40, description: "Aumentam a sustentação em baixas velocidades para pousos e decolagens mais curtos." },
            slats: { name: "Slats", cost: 8000, weight: 30, metal_cost: 60, reliability_mod: 0.97, cl_max_mod: 1.1, maneuverability_mod: 1.05, tech_level_required: 60, description: "Melhoram o controle em ângulos de ataque elevados, prevenindo estol." },
            folding_wings: { name: "Asas Dobráveis (Naval)", cost: 12000, weight: 150, metal_cost: 100, reliability_mod: 0.95, tech_level_required: 30, description: "Permitem que a aeronave ocupe menos espaço em porta-aviões." },
        },
        landing_gear_types: {
            fixed_gear: { name: "Fixo", cost: 0, weight: 0, drag_mod: 1.1, reliability_mod: 1.0, tech_level_required: 0, description: "Simples, leve e robusto, mas gera arrasto constante." },
            retractable_gear: { name: "Retrátil", cost: 22500, weight: 150, metal_cost: 300, drag_mod: 1.0, reliability_mod: 0.97, tech_level_required: 50, description: "Trem de pouso que se retrai para dentro da fuselagem, reduzindo o arrasto em voo." },
            skis: { name: "Esquis", cost: 5000, weight: 80, metal_cost: 100, drag_mod: 1.12, reliability_mod: 1.0, tech_level_required: 0, description: "Permite operações em superfícies nevadas ou geladas." },
            floats: { name: "Flutuadores", cost: 15000, weight: 300, metal_cost: 200, drag_mod: 1.20, reliability_mod: 1.0, tech_level_required: 0, description: "Permite pousos e decolagens na água." }
        },
        engineTypes: {
            radial: {
                name: "Motor Radial",
                description: "Cilindros em estrela. Confiável e poderoso. Melhor para caças robustos, aviões de ataque ao solo.",
                characteristics: { reliability_bonus: 1.20, drag_penalty: 1.15, bsfc_g_per_kwh: 310 },
                tech_level_required: 30, cost: 25000, weight: 500, metal_cost: 2000
            },
            v_inline: {
                name: "Motor em V / Em Linha",
                description: "Cilindros em V ou linha. Aerodinâmico e eficiente em alta velocidade. Melhor para caças de alta velocidade.",
                characteristics: { max_speed_bonus: 1.12, drag_reduction: 0.85, reliability_penalty: 0.85, bsfc_g_per_kwh: 290 },
                tech_level_required: 50, cost: 35000, weight: 600, metal_cost: 2500
            }
        },
        propellers: {
            wood_2: { name: "Madeira 2 pás", cost: 1000, weight: 30, metal_cost: 20, efficiency: 0.75, reliability_mod: 1.05, tech_level_required: 0 },
            wood_3: { name: "Madeira 3 pás", cost: 1800, weight: 45, metal_cost: 30, efficiency: 0.80, reliability_mod: 1.0, tech_level_required: 0 },
            metal_2: { name: "Metal 2 pás", cost: 2500, weight: 60, metal_cost: 200, efficiency: 0.82, reliability_mod: 1.0, tech_level_required: 30 },
            metal_3: { name: "Metal 3 pás", cost: 4000, weight: 90, metal_cost: 300, efficiency: 0.88, reliability_mod: 0.98, tech_level_required: 50 },
            adjustable: { name: "Passo Variável/Vel. Constante", cost: 15000, weight: 120, metal_cost: 500, efficiency: 0.95, reliability_mod: 0.90, tech_level_required: 70 }
        },
        cooling_systems: {
            air: { name: "Refrigeração a Ar", cost: 0, weight: 0, reliability_mod: 1.05, drag_mod: 1.0, tech_level_required: 0 },
            liquid: { name: "Refrigeração Líquida", cost: 5000, weight: 100, reliability_mod: 0.95, drag_mod: 0.85, tech_level_required: 40 }
        },
        superchargerTypes: {
            none: {
                name: "Aspiração Natural", description: "Sem sobrealimentação. Simples e confiável, mas perde potência com altitude.",
                characteristics: { speed_range: { min: 250, max: 450 }, rated_altitude_m: 0, manifold_pressure_ata: 1.0, power_modifier: 1.0, reliability_bonus: 1.15, cost_modifier: 0.8, weight: 0, fuel_efficiency: 1.1 },
                tech_level_required: 0, best_for: "Aviões de baixa altitude, treino, economia", cost: 0, weight: 0, metal_cost: 0
            },
            single_stage_single_speed: {
                name: "Supercharger 1 Estágio/1 Velocidade", description: "Sobrealimentador básico, otimizado para uma altitude específica.",
                characteristics: { speed_range: { min: 350, max: 550 }, rated_altitude_m: 4000, manifold_pressure_ata: 1.3, power_modifier: 1.15, reliability_modifier: 1.0, cost_modifier: 1.2, weight: 40, fuel_efficiency: 0.95 },
                tech_level_required: 40, best_for: "Caças padrão, altitude média", cost: 8000, weight: 50, metal_cost: 100
            },
            single_stage_two_speed: {
                name: "Supercharger 1 Estágio/2 Velocidades", description: "Pode alternar entre baixa e alta altitude. Versátil.",
                characteristics: { speed_range: { min: 380, max: 620 }, rated_altitude_m: 6500, manifold_pressure_ata: 1.4, power_modifier: 1.20, reliability_modifier: 0.95, cost_modifier: 1.5, weight: 60, fuel_efficiency: 0.92 },
                tech_level_required: 60, best_for: "Caças versáteis", cost: 15000, weight: 70, metal_cost: 200
            },
            two_stage_two_speed: {
                name: "Supercharger 2 Estágios/2 Velocidades", description: "Sistema complexo para alta altitude. Excelente performance acima de 6000m.",
                characteristics: { speed_range: { min: 400, max: 700 }, rated_altitude_m: 9000, manifold_pressure_ata: 1.6, power_modifier: 1.30, reliability_modifier: 0.85, cost_modifier: 2.0, weight: 110, fuel_efficiency: 0.88 },
                tech_level_required: 70, best_for: "Interceptadores de alta altitude", cost: 20000, weight: 90, metal_cost: 300
            },
            turbocharger: {
                name: "Turbocompressor", description: "Usa gases de escape. Mantém potência em altitudes extremas.",
                characteristics: { speed_range: { min: 420, max: 750 }, rated_altitude_m: 12000, manifold_pressure_ata: 1.8, power_modifier: 1.35, reliability_modifier: 0.75, cost_modifier: 3.0, weight: 180, fuel_efficiency: 0.85 },
                tech_level_required: 80, best_for: "Bombardeiros de alta altitude", cost: 30000, weight: 150, metal_cost: 500
            }
        },
        engine_enhancements: {
            ducted_radiators: { name: "Radiadores Dutados", cost: 10000, weight: 30, metal_cost: 80, drag_mod: 0.97, reliability_mod: 0.98, tech_level_required: 60, description: "Reduz o arrasto em comparação com radiadores externos." },
            intercoolers: { name: "Intercoolers", cost: 8000, weight: 25, metal_cost: 70, power_mod: 1.03, reliability_mod: 0.95, tech_level_required: 50, description: "Resfria o ar comprimido, aumentando a potência do motor." }
        },
        armaments: {
            mg_30: { name: "Metralhadora .30", cost: 4500, weight: 12, metal_cost: 100, tech_level_required: 0, type: 'gun', cg_impact: 0.1 },
            mg_50: { name: "Metralhadora .50", cost: 11250, weight: 20, metal_cost: 250, tech_level_required: 40, type: 'gun', cg_impact: 0.15 },
            cannon_20: { name: "Canhão 20mm", cost: 15000, weight: 100, metal_cost: 400, tech_level_required: 50, type: 'gun', cg_impact: 0.2 },
            cannon_30: { name: "Canhão 30mm", cost: 37500, weight: 400, metal_cost: 800, tech_level_required: 70, type: 'gun', cg_impact: 0.3 },
            cannon_37: { name: "Canhão 37mm", cost: 60000, weight: 550, metal_cost: 1200, tech_level_required: 80, type: 'gun', cg_impact: 0.4 },
            cannon_at_40: { name: "Canhão Anti-Tanque 40mm", cost: 75000, weight: 650, metal_cost: 1500, tech_level_required: 85, type: 'gun', cg_impact: 0.5 },
            bomb_50: { name: "Bombas 50kg", cost: 1500, weight: 50, metal_cost: 50, tech_level_required: 0, type: 'bomb', cg_impact: 0.05 },
            bomb_100: { name: "Bombas 100kg", cost: 3000, weight: 100, metal_cost: 100, tech_level_required: 0, type: 'bomb', cg_impact: 0.1 },
            bomb_250: { name: "Bombas 250kg", cost: 7500, weight: 250, metal_cost: 250, tech_level_required: 30, type: 'bomb', cg_impact: 0.25 },
            bomb_500: { name: "Bombas 500kg", cost: 15000, weight: 500, metal_cost: 500, tech_level_required: 50, type: 'bomb', cg_impact: 0.5 },
            bomb_1000: { name: "Bombas 1000kg", cost: 30000, weight: 1000, metal_cost: 1000, tech_level_required: 70, type: 'bomb', cg_impact: 1.0 },
            torpedo: { name: "Torpedo Naval", cost: 75000, weight: 800, metal_cost: 2000, tech_level_required: 60, type: 'torpedo', cg_impact: 0.8 },
            incendiary: { name: "Bombas Incendiárias", cost: 5000, weight: 75, metal_cost: 150, tech_level_required: 40, type: 'bomb', cg_impact: 0.08 },
            rockets: { name: "Foguetes Ar-Terra", cost: 9000, weight: 25, metal_cost: 200, tech_level_required: 60, type: 'rocket', cg_impact: 0.03 },
        },
        defensive_armaments: {
            none_turret: { name: "Nenhum", cost: 0, weight: 0, metal_cost: 0, reliability_mod: 1.0, defensive_firepower_mod: 0, tech_level_required: 0 },
            manned_turret: { name: "Torreta Tripulada (Manual)", cost: 20000, weight: 150, metal_cost: 300, reliability_mod: 0.95, defensive_firepower_mod: 0.8, tech_level_required: 0 },
            powered_turret: { name: "Torreta Motorizada", cost: 50000, weight: 300, metal_cost: 600, reliability_mod: 0.85, defensive_firepower_mod: 1.2, tech_level_required: 50 },
            remote_turret: { name: "Torreta Remota", cost: 100000, weight: 250, metal_cost: 800, reliability_mod: 0.70, defensive_firepower_mod: 1.5, tech_level_required: 80 },
            defensive_mg_30: { name: "Metralhadora .30 (Defensiva)", cost: 4500, weight: 12, metal_cost: 100, firepower: 1, tech_level_required: 0 },
            defensive_mg_50: { name: "Metralhadora .50 (Defensiva)", cost: 11250, weight: 20, metal_cost: 250, firepower: 2, tech_level_required: 40 },
            defensive_cannon_20: { name: "Canhão 20mm (Defensiva)", cost: 15000, weight: 100, metal_cost: 400, firepower: 5, tech_level_required: 50 },
        },
        protection: {
            pilot_armor: { name: "Blindagem do Piloto", cost: 15000, weight: 250, metal_cost: 400, reliability_mod: 1.0, tech_level_required: 30 },
            engine_armor: { name: "Blindagem do Motor", cost: 15000, weight: 250, metal_cost: 400, reliability_mod: 1.0, tech_level_required: 40 },
            tank_armor: { name: "Blindagem dos Tanques", cost: 18000, weight: 180, metal_cost: 300, reliability_mod: 1.0, tech_level_required: 50 },
            self_sealing_tanks: { name: "Tanques Auto-Selantes", cost: 22500, weight: 45, metal_cost: 100, reliability_mod: 1.15, tech_level_required: 60 },
        },
        cockpit_comfort: {
            enclosed_cockpit: { name: "Cabine Fechada", cost: 3000, weight: 10, metal_cost: 30, drag_mod: 0.98, reliability_mod: 1.01, tech_level_required: 20 },
            heated_cockpit: { name: "Cabine Aquecida", cost: 2000, weight: 5, metal_cost: 20, reliability_mod: 1.02, tech_level_required: 40 },
            oxygen_system: { name: "Sistema de Oxigênio", cost: 4000, weight: 15, metal_cost: 40, ceiling_mod: 1.2, reliability_mod: 1.01, tech_level_required: 50 },
            pressurized_cabin: { name: "Cabine Pressurizada", cost: 25000, weight: 60, metal_cost: 120, ceiling_mod: 1.4, reliability_mod: 0.90, tech_level_required: 80 },
            basic_autopilot: { name: "Piloto Automático Básico", cost: 15000, weight: 40, metal_cost: 100, range_mod: 1.05, reliability_mod: 1.03, tech_level_required: 60 },
            ejection_seat: { name: "Assento Ejetável (Exp.)", cost: 150000, weight: 378, metal_cost: 500, reliability_mod: 0.7, tech_level_required: 90 }
        },
        advanced_avionics: {
            radio_direction_finder: { name: "Rádio Direção (RDF)", cost: 10000, weight: 25, metal_cost: 80, reliability_mod: 1.0, tech_level_required: 30 },
            blind_flying_instruments: { name: "Instrumentos de Voo por Instrumentos", cost: 18000, weight: 30, metal_cost: 120, reliability_mod: 1.02, tech_level_required: 50 },
            nav_instruments: { name: "Instrumentos de Navegação", cost: 15000, weight: 50, metal_cost: 100, reliability_mod: 1.0, tech_level_required: 40 },
            gyro_compass: { name: "Bússola Giroscópica", cost: 30000, weight: 80, metal_cost: 150, reliability_mod: 1.0, tech_level_required: 60 },
            basic_bomb_sight: { name: "Mira de Bombardeio (Básica)", cost: 7000, weight: 15, metal_cost: 60, reliability_mod: 1.0, tech_level_required: 20 },
            advanced_bomb_sight: { name: "Mira de Bombardeio (Avançada)", cost: 25000, weight: 40, metal_cost: 180, reliability_mod: 0.95, tech_level_required: 70 },
            camera_equipment: { name: "Equipamento de Câmera (Recon)", cost: 12000, weight: 60, metal_cost: 90, reliability_mod: 1.0, tech_level_required: 30 },
            early_radar: { name: "Radar Inicial (Experimental)", cost: 150000, weight: 200, metal_cost: 500, reliability_mod: 0.5, speed_mod: 0.95, tech_level_required: 90 }
        },
        equipment: {
            parachute: { name: "Paraquedas", cost: 7500, weight: 15, metal_cost: 10, reliability_mod: 1.0, tech_level_required: 0 },
            fire_extinguisher: { name: "Sistema Anti-Incêndio", cost: 45000, weight: 75, metal_cost: 150, reliability_mod: 1.1, tech_level_required: 60 },
            radio_hf: { name: "Rádio HF", cost: 22500, weight: 100, metal_cost: 200, reliability_mod: 1.0, tech_level_required: 30 },
            gun_synchronizer: { name: "Sincronizador de Metralhadoras", cost: 60000, weight: 50, metal_cost: 100, reliability_mod: 0.98, tech_level_required: 50 },
            dive_brakes: { name: "Freios de Mergulho", cost: 8000, weight: 50, metal_cost: 100, reliability_mod: 1.0, tech_level_required: 40 },
            sirens: { name: "Sirenes Psicológicas", cost: 2000, weight: 10, metal_cost: 20, reliability_mod: 1.0, tech_level_required: 0 },
            jato: { name: "Foguetes Auxiliares (JATO)", cost: 30000, weight: 120, metal_cost: 200, reliability_mod: 0.90, tech_level_required: 70 },
            extra_fuel_tanks: { name: "Tanques de Combustíveis Extras (Fixos)", cost: 8000, weight: 40, metal_cost: 150, range_mod: 1.4, maneuverability_mod: 0.9, reliability_mod: 0.98, tech_level_required: 40 },
            drop_tanks: { name: "Tanques de Combustíveis Descartáveis", cost: 12000, weight: 20, metal_cost: 200, range_mod: 1.8, reliability_mod: 0.95, tech_level_required: 60 },
            advanced_control_surfaces: { name: "Superfícies de Controle Avançadas", cost: 40000, weight: 50, metal_cost: 300, maneuverability_mod: 1.25, reliability_mod: 0.90, tech_level_required: 70 },
            arresting_hook: { name: "Gancho de Arresto", cost: 5000, weight: 20, metal_cost: 50, reliability_mod: 1.0, tech_level_required: 0 },
            smoke_generators: { name: "Geradores de Fumaça", cost: 3000, weight: 50, metal_cost: 30, reliability_mod: 1.0, tech_level_required: 0 },
            structural_reinforcement: { name: "Reforços Estruturais", cost: 25000, weight: 300, metal_cost: 500, reliability_mod: 1.02, maneuverability_mod: 0.9, description: "Adicionado para lidar com alta fadiga estrutural." }
        }
    },
    constants: {
        standard_gravity_ms2: 9.80665,
        gas_constant_air_specific: 287.0528,
        temp_lapse_rate_k_per_m: 0.0065,
        temp_sea_level_k: 288.15,
        pressure_sea_level_pa: 101325,
        density_sea_level_kg_m3: 1.225,
        turn_g_force: 4.5,
        base_fuel_capacity_liters: 380,
        range_balance_factor: 1.7,
        country_cost_reduction_factor: 0.25,
        urbanization_cost_reduction_factor: 0.20,
        max_tech_civil_level: 150,
        max_urbanization_level: 80,
        min_roc_for_ceiling: 0.5,
        fuel_weight_per_liter: 0.72,
        crew_weight_kg: 90
    }
};

export const learningCurve = [
    { turns: 0, discount: 0.0, locked: false },
    { turns: 1, discount: 0.05, locked: true },
    { turns: 2, discount: 0.09, locked: true },
    { turns: 3, discount: 0.13, locked: true },
    { turns: 5, discount: 0.20, locked: true },
    { turns: 8, discount: 0.28, locked: true },
    { turns: 12, discount: 0.35, locked: true },
    { turns: 20, discount: 0.50, locked: true },
];

export const engineSuperchargerCombos = {
    calculateLimits: (engineTypeKey, superchargerTypeKey) => {
        const engine = gameData.components.engineTypes[engineTypeKey];
        const supercharger = gameData.components.superchargerTypes[superchargerTypeKey];

        if (!engine || !supercharger) {
            return { speed: { min: 0, max: 0 }, range: { min: 0, max: 0 }, altitude: 0, special: { blocked: true, reason: "Selecione um tipo de motor e sobrealimentador válidos." } };
        }

        let minSpeed = supercharger.characteristics.speed_range.min;
        let maxSpeed = supercharger.characteristics.speed_range.max;
        let minRange = 500; 
        let maxRange = 2500;

        maxSpeed *= (engine.characteristics.max_speed_bonus || 1.0);
        
        minRange *= (engine.characteristics.fuel_efficiency || 1.0);
        maxRange *= (engine.characteristics.fuel_efficiency || 1.0);

        minRange *= (supercharger.characteristics.fuel_efficiency || 1.0);
        maxRange *= (supercharger.characteristics.fuel_efficiency || 1.0);

        let rated_altitude = supercharger.characteristics.rated_altitude_m;
        let manifold_pressure = supercharger.characteristics.manifold_pressure_ata;
        let special = {};

        const comboKey = `${engineTypeKey}+${superchargerTypeKey}`;
        switch (comboKey) {
            case "v_inline+two_stage_two_speed":
                maxSpeed *= 1.1; 
                special.description = "Combinação clássica de caça de alta performance.";
                break;
            case "radial+turbocharger":
                maxSpeed *= 0.95; 
                special.reliability = 0.9;
                special.description = "Poderoso mas pode ser problemático devido ao arrasto adicional.";
                break;
        }
        
        if (minSpeed > maxSpeed) minSpeed = maxSpeed * 0.8; 
        if (minRange > maxRange) minRange = maxRange * 0.8;

        return {
            speed: { min: Math.round(minSpeed), max: Math.round(maxSpeed) },
            range: { min: Math.round(minRange), max: Math.round(maxRange) },
            rated_altitude: rated_altitude,
            manifold_pressure: manifold_pressure,
            special: special
        };
    }
};

export const designPenalties = {
    speedPenalties: {
        600: { required_features: ["advanced_control_surfaces"] },
        700: { required_features: ["advanced_control_surfaces", "duralumin"] },
        800: { required_features: ["advanced_control_surfaces", "duralumin", "pressurized_cabin"] }
    },
    rangePenalties: {
        2000: { required_features: ["extra_fuel_tanks"] },
        3000: { required_features: ["extra_fuel_tanks", "drop_tanks"] },
        4000: { required_features: ["extra_fuel_tanks", "drop_tanks", "basic_autopilot"] },
        5000: { required_features: ["extra_fuel_tanks", "drop_tanks", "basic_autopilot", "nav_instruments"] }
    }
};

// --- DADOS DE AERONAVES REAIS ---
export const realWorldAircraft = [
    { id: 'bf109e3', name: 'Messerschmitt Bf 109 E-3', image_url: 'https://lh3.googleusercontent.com/d/1nvIkjIeZtmgpJXAZajyeqDBicQlAWNFj' },
    { id: 'bf109g6', name: 'Messerschmitt Bf 109 G-6', image_url: 'https://lh3.googleusercontent.com/d/1cbSlGQcEtXrD1hIK_FBX7kUB9N6cVTef' },
    { id: 'p51d', name: 'North American P-51D Mustang', image_url: 'https://lh3.googleusercontent.com/d/1wa1nl1SoQX_5XG5ea-1RQGpTbFuY5w-0' },
    { id: 'spitfire', name: 'Supermarine Spitfire Mk I', image_url: 'https://lh3.googleusercontent.com/d/15J2DmLBCLXzWeo8cOsstqwpYECKIrk3U' },
];

// --- FUNÇÕES DE CARREGAMENTO E PARSE DE DADOS ---
export function cleanAndParseFloat(value) {
    if (typeof value !== 'string') return parseFloat(value) || 0;
    const cleanedValue = value.trim().replace('£', '').replace(/\./g, '').replace(',', '.').replace('%', '');
    return parseFloat(cleanedValue) || 0;
}

export async function parseCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao carregar CSV de ${url}: ${response.statusText}`);
        const csvText = await response.text();
        const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length < 1) return [];
        const robustSplit = (str) => {
            return str.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => {
                let value = v.trim();
                if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
                return value.replace(/""/g, '"');
            });
        };
        const headers = robustSplit(lines[0].trim());
        return lines.slice(1).map(line => {
            const values = robustSplit(line.trim());
            let row = {};
            headers.forEach((header, i) => { row[header] = values[i] || ''; });
            return row;
        });
    } catch (error) {
        console.error(`Erro na requisição de rede para ${url}:`, error);
        throw error;
    }
}

export async function loadGameDataFromSheets() {
    const countryDropdown = document.getElementById('country_doctrine');
    if (countryDropdown) {
        countryDropdown.innerHTML = '<option value="loading">Carregando dados...</option>';
        countryDropdown.disabled = true;
    }
    try {
        const [countryStatsRaw, aeronavesRaw, metaisRaw] = await Promise.all([
            parseCSV(COUNTRY_STATS_URL),
            parseCSV(AERONAVES_URL),
            parseCSV(METAIS_URL)
        ]);
        const tempCountries = {};
        countryStatsRaw.forEach(row => {
            const countryName = row['País'];
            if (countryName) {
                tempCountries[countryName] = {
                    tech_civil: cleanAndParseFloat(row['Tec']),
                    urbanization: cleanAndParseFloat(row['Urbanização']),
                    tech_level_air: cleanAndParseFloat(row['Aeronáutica']),
                    production_capacity: 0,
                    metal_balance: 0
                };
            }
        });
        aeronavesRaw.forEach(row => {
            const countryName = row['País'];
            if (tempCountries[countryName]) {
                tempCountries[countryName].production_capacity = cleanAndParseFloat(row['Capacidade de produção']);
            }
        });
        metaisRaw.forEach(row => {
            const countryName = row['País'];
            if (tempCountries[countryName]) {
                tempCountries[countryName].metal_balance = cleanAndParseFloat(row['Saldo']);
            }
        });
        tempCountries["Genérico / Padrão"] = { production_capacity: 100000000, metal_balance: 5000000, tech_level_air: 50, tech_civil: 50, urbanization: 50 };
        gameData.countries = tempCountries;
        populateCountryDropdown();
        if (countryDropdown) countryDropdown.disabled = false;
    } catch (error) {
        console.error("Erro fatal ao carregar dados das planilhas:", error);
        if (countryDropdown) {
            countryDropdown.innerHTML = '<option value="error">Erro ao carregar</option>';
        }
        gameData.countries = { "Genérico / Padrão": { production_capacity: 100000000, metal_balance: 5000000, tech_level_air: 50, tech_civil: 50, urbanization: 50 } };
        populateCountryDropdown();
    }
}

export function populateCountryDropdown() {
    const dropdown = document.getElementById('country_doctrine');
    if (!dropdown) return;
    dropdown.innerHTML = '';
    const sortedCountries = Object.keys(gameData.countries).sort();
    sortedCountries.forEach(countryName => {
        const option = document.createElement('option');
        option.value = countryName;
        option.textContent = countryName;
        dropdown.appendChild(option);
    });
    if (gameData.countries["Genérico / Padrão"]) {
        dropdown.value = "Genérico / Padrão";
    }
}

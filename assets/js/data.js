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
            light_fighter: { name: "Caça Leve", cost: 40000, weight: 1500, metal_cost: 2000, crew: 1, wing_area_m2: 18, cl_max: 1.6, cd_0: 0.025, aspect_ratio: 6.0, oswald_efficiency: 0.8, reliability_base: 0.95, maneuverability_base: 1.15, limits: { min_speed: 450, max_speed: 750, min_range: 600, max_range: 2000 }, description: "Ágil e rápido, ideal para dogfights. Geralmente levemente armado e blindado." },
            heavy_fighter: { name: "Caça Pesado/Interceptor", cost: 75000, weight: 3500, metal_cost: 4000, crew: 2, wing_area_m2: 25, cl_max: 1.5, cd_0: 0.030, aspect_ratio: 6.5, oswald_efficiency: 0.78, reliability_base: 0.90, maneuverability_base: 0.9, limits: { min_speed: 480, max_speed: 720, min_range: 1000, max_range: 2500 }, description: "Armamento pesado e boa performance em altitude para interceptar bombardeiros. Menos ágil que caças leves." },
            cas: { name: "Apoio Aéreo Próximo (CAS)", cost: 65000, weight: 3000, metal_cost: 3200, crew: 1, wing_area_m2: 28, cl_max: 1.7, cd_0: 0.038, aspect_ratio: 5.8, oswald_efficiency: 0.75, reliability_base: 0.98, maneuverability_base: 0.95, limits: { min_speed: 350, max_speed: 550, min_range: 500, max_range: 1500 }, description: "Robusto e bem armado para atacar alvos terrestres. Geralmente mais lento e blindado." },
            tactical_bomber: { name: "Bombardeiro Tático", cost: 120000, weight: 5000, metal_cost: 6000, crew: 4, wing_area_m2: 50, cl_max: 1.4, cd_0: 0.033, aspect_ratio: 7.0, oswald_efficiency: 0.82, reliability_base: 0.92, maneuverability_base: 0.7, limits: { min_speed: 400, max_speed: 600, min_range: 1200, max_range: 3000 }, description: "Velocidade e alcance para atacar alvos táticos atrás das linhas inimigas. Carga de bombas moderada." },
            strategic_bomber: { name: "Bombardeiro Estratégico", cost: 250000, weight: 12000, metal_cost: 10000, crew: 7, wing_area_m2: 100, cl_max: 1.5, cd_0: 0.030, aspect_ratio: 8.5, oswald_efficiency: 0.85, reliability_base: 0.88, maneuverability_base: 0.5, limits: { min_speed: 380, max_speed: 580, min_range: 3000, max_range: 6000 }, description: "Longo alcance e grande capacidade de bombas para missões estratégicas profundas em território inimigo." },
            zeppelin: { name: "Zeppelin", cost: 500000, weight: 50000, metal_cost: 15000, crew: 20, wing_area_m2: 500, cl_max: 0.8, cd_0: 0.020, aspect_ratio: 1.0, oswald_efficiency: 0.7, reliability_base: 0.90, maneuverability_base: 0.1, limits: { min_speed: 80, max_speed: 150, min_range: 5000, max_range: 15000 }, description: "Dirigível gigante para bombardeio ou reconhecimento. Lento e vulnerável, mas com alcance e carga imensos." },
            naval_fighter: { name: "Caça Naval", cost: 60000, weight: 2200, metal_cost: 2800, crew: 1, wing_area_m2: 22, cl_max: 1.65, cd_0: 0.028, aspect_ratio: 5.5, oswald_efficiency: 0.78, reliability_base: 0.93, maneuverability_base: 1.0, limits: { min_speed: 420, max_speed: 680, min_range: 800, max_range: 2200 }, description: "Caça adaptado para operações em porta-aviões, com estrutura reforçada e geralmente asas dobráveis." },
            naval_cas: { name: "CAS Naval", cost: 90000, weight: 4000, metal_cost: 4500, crew: 2, wing_area_m2: 35, cl_max: 1.75, cd_0: 0.040, aspect_ratio: 5.2, oswald_efficiency: 0.72, reliability_base: 0.96, maneuverability_base: 0.85, limits: { min_speed: 320, max_speed: 520, min_range: 700, max_range: 1800 }, description: "Aeronave de ataque naval, incluindo bombardeiros de mergulho e torpedeiros." },
            naval_bomber: { name: "Bombardeiro Naval", cost: 150000, weight: 6000, metal_cost: 7000, crew: 4, wing_area_m2: 60, cl_max: 1.5, cd_0: 0.035, aspect_ratio: 7.5, oswald_efficiency: 0.8, reliability_base: 0.90, maneuverability_base: 0.6, limits: { min_speed: 380, max_speed: 550, min_range: 2000, max_range: 4000 }, description: "Bombardeiro médio/pesado adaptado para operações navais, geralmente baseado em terra." },
            naval_recon: { name: "Reconhecimento Naval", cost: 45000, weight: 2000, metal_cost: 2000, crew: 2, wing_area_m2: 25, cl_max: 1.4, cd_0: 0.027, aspect_ratio: 8.0, oswald_efficiency: 0.85, reliability_base: 0.97, maneuverability_base: 0.8, limits: { min_speed: 250, max_speed: 450, min_range: 1500, max_range: 5000 }, description: "Aeronave de longo alcance para patrulha marítima e reconhecimento." },
            transport: { name: "Transporte", cost: 100000, weight: 8000, metal_cost: 5000, crew: 4, wing_area_m2: 80, cl_max: 1.8, cd_0: 0.042, aspect_ratio: 7.0, oswald_efficiency: 0.75, reliability_base: 0.95, maneuverability_base: 0.4, limits: { min_speed: 200, max_speed: 400, min_range: 1000, max_range: 3500 }, description: "Projetado para transportar tropas ou carga. Lento e vulnerável, com pouca ou nenhuma capacidade de combate." },
            seaplane: { name: "Hidroavião", cost: 55000, weight: 2500, metal_cost: 2500, crew: 3, wing_area_m2: 30, cl_max: 1.5, cd_0: 0.048, aspect_ratio: 6.0, oswald_efficiency: 0.7, reliability_base: 0.94, maneuverability_base: 0.75, limits: { min_speed: 220, max_speed: 420, min_range: 800, max_range: 2500 }, description: "Capaz de pousar e decolar da água. Usado para reconhecimento, patrulha e resgate." },
        },
        structure_materials: {
            wood_fabric: { name: "Madeira e Tecido", cost_mod: 0.7, weight_mod: 0.8, reliability_mod: 0.9, armor_mod: 0.7, tech_level_required: 0, description: "Leve e barato, mas frágil e vulnerável a fogo. Comum em designs mais antigos ou leves." },
            wood_metal: { name: "Madeira e Metal", cost_mod: 1.0, weight_mod: 1.0, reliability_mod: 1.0, armor_mod: 1.0, tech_level_required: 30, description: "Estrutura de metal com superfícies de madeira/tecido. Bom equilíbrio entre custo e durabilidade." },
            all_metal: { name: "Metal Completo", cost_mod: 1.4, weight_mod: 1.2, reliability_mod: 1.05, armor_mod: 1.2, tech_level_required: 50, description: "Estrutura totalmente metálica (sem estresse de pele). Robusto, mas mais pesado que designs posteriores." },
            duralumin: { name: "Duralumínio (Monocoque)", cost_mod: 1.6, weight_mod: 1.05, reliability_mod: 1.1, armor_mod: 1.3, tech_level_required: 70, description: "Construção de ponta com pele de alumínio tensionada. Leve, forte e aerodinâmico, mas caro e complexo de produzir." },
        },
        wing_types: {
            biplane: { name: "Biplano", cost_mod: 1.0, weight_mod: 1.1, drag_mod: 1.2, cl_max_mod: 1.1, cd_0_mod: 1.05, aspect_ratio_mod: 0.8, maneuverability_mod: 1.1, reliability_mod: 1.05, tech_level_required: 0, description: "Boa sustentação em baixas velocidades, estrutura forte, mas alto arrasto. Comum em designs mais antigos." },
            monoplane_cantilever: { name: "Monoplano Cantilever", cost_mod: 1.2, weight_mod: 1.0, drag_mod: 0.9, cl_max_mod: 1.0, cd_0_mod: 0.9, aspect_ratio_mod: 1.0, reliability_mod: 1.0, tech_level_required: 40, description: "Design limpo, menor arrasto, mas estrutura inicialmente mais pesada. Padrão para aeronaves modernas." },
            delta_wing: { name: "Asa Delta (Experimental)", cost_mod: 1.8, weight_mod: 1.05, drag_mod: 0.8, cl_max_mod: 0.9, cd_0_mod: 0.85, aspect_ratio_mod: 0.5, speed_mod: 1.1, maneuverability_mod: 0.8, reliability_mod: 0.85, tech_level_required: 90, description: "Alto desempenho em velocidade, bom para curvas de alta G em alta velocidade, mas péssimo manuseio em baixa velocidade. Tecnologia muito experimental para o período." }
        },
        // NOVOS: Posição da Asa
        wing_positions: {
            low_wing: {
                name: "Asa Baixa",
                description: "Asa montada na parte inferior da fuselagem. Melhor visibilidade superior, ideal para caças. Pode limitar o tamanho de bombas e canhões no centro.",
                turn_mod: 1.15,
                stability_mod: 0.95,
                ground_clearance_penalty: true, // Implica limitações de armamento grande
                bomb_capacity_mod: 0.8,
                armament_limits: { cannon_30: 2, cannon_37: 1, cannon_at_40: 0, bomb_250: 4, bomb_500: 2, bomb_1000: 0, torpedo: 0 },
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Monoplane_low.svg/200px-Monoplane_low.svg.png",
                tech_level_required: 40
            },
            mid_wing: {
                name: "Asa Média",
                description: "Asa atravessa o meio da fuselagem. Excelente para acrobacia e manobrabilidade. Pode dificultar a instalação de armamento na barriga.",
                turn_mod: 1.20,
                stability_mod: 0.90,
                structure_weight_mod: 1.1, // Aumenta peso estrutural devido ao reforço na fuselagem
                armament_limits: { cannon_30: 4, cannon_37: 2, cannon_at_40: 1, bomb_250: 6, bomb_500: 3, bomb_1000: 1, torpedo: 0 },
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Monoplane_mid.svg/200px-Monoplane_mid.svg.png",
                tech_level_required: 50
            },
            shoulder_wing: {
                name: "Asa no Ombro",
                description: "Asa montada no topo da fuselagem. Bom compromisso entre estabilidade e visibilidade. Boa para carga externa.",
                turn_mod: 1.0,
                stability_mod: 1.0,
                cargo_capacity_mod: 1.1,
                armament_limits: { cannon_30: 4, cannon_37: 2, cannon_at_40: 1, bomb_250: 8, bomb_500: 4, bomb_1000: 2, torpedo: 1 },
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Monoplane_shoulder.svg/200px-Monoplane_shoulder.svg.png",
                tech_level_required: 30
            },
            high_wing: {
                name: "Asa Alta",
                description: "Asa acima da fuselagem. Muito estável, ótima visibilidade inferior, ideal para observação e transporte. Excelente para carga de bombas.",
                turn_mod: 0.85,
                stability_mod: 1.15,
                bomb_capacity_mod: 1.2,
                stall_recovery_mod: 1.1,
                armament_limits: { cannon_30: 2, cannon_37: 1, cannon_at_40: 1, bomb_250: 10, bomb_500: 5, bomb_1000: 2, torpedo: 1 },
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Monoplane_high.svg/200px-Monoplane_high.svg.png",
                tech_level_required: 20
            },
            parasol: {
                name: "Asa Parasol",
                description: "Asa suspensa acima da fuselagem. Máxima visibilidade, comum em aviões de observação. Geralmente para aeronaves mais leves.",
                turn_mod: 0.75,
                stability_mod: 1.2,
                drag_mod: 1.15, // Maior arrasto devido aos suportes
                visibility_bonus: true,
                armament_limits: { mg_30: 4, mg_50: 2, cannon_20: 0, cannon_30: 0, bomb_50: 4, bomb_100: 2, bomb_250: 0, torpedo: 0 },
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Monoplane_parasol.svg/200px-Monoplane_parasol.svg.png",
                tech_level_required: 10
            },
            biplane_wing_pos: { // Para biplanos, a "posição" é inerente
                name: "Biplano",
                description: "Duas asas para maior sustentação. Excelente manobrabilidade em baixa velocidade, mas alto arrasto.",
                turn_mod: 1.3,
                stability_mod: 1.0,
                drag_mod: 1.2,
                armament_limits: { mg_30: 8, mg_50: 4, cannon_20: 2, cannon_30: 0, bomb_50: 8, bomb_100: 4, bomb_250: 0, torpedo: 0 },
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Biplane_wire.svg/200px-Biplane_wire.svg.png",
                tech_level_required: 0
            }
        },
        // NOVOS: Formato da Asa
        wing_shapes: {
            elliptical: {
                name: "Asa Elíptica",
                description: "Distribuição ideal de sustentação, como no Spitfire. Excelente eficiência aerodinâmica e manobrabilidade, mas complexa de fabricar.",
                turn_mod: 1.1,
                drag_mod: 0.92,
                cost_mod: 1.3,
                manufacturing_complexity: "high",
                armament_limits: { cannon_30: 2, cannon_37: 1, cannon_at_40: 0 }, // Pode ter limites em armamento muito grande devido ao formato
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Wing_elliptical.svg/200px-Wing_elliptical.svg.png",
                tech_level_required: 70
            },
            tapered: {
                name: "Asa Afilada",
                description: "Reduz peso nas pontas, comum em caças modernos. Bom equilíbrio de performance e custo.",
                turn_mod: 1.05,
                drag_mod: 0.95,
                cost_mod: 1.1,
                armament_limits: { cannon_30: 4, cannon_37: 2, cannon_at_40: 1 },
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Wing_tapered.svg/200px-Wing_tapered.svg.png",
                tech_level_required: 50
            },
            constant_chord: {
                name: "Corda Constante",
                description: "Largura uniforme, simples de fabricar. Comum em aviões de treinamento e transporte. Menos eficiente em alta velocidade.",
                turn_mod: 0.95,
                drag_mod: 1.05,
                cost_mod: 0.9,
                manufacturing_complexity: "low",
                armament_limits: { cannon_30: 2, cannon_37: 1, cannon_at_40: 1 },
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Wing_constant.svg/200px-Wing_constant.svg.png",
                tech_level_required: 0
            },
            gull_wing: {
                name: "Asa Gaivota",
                description: "Dobra para baixo, permite trem de pouso mais curto e hélice maior. Famosa no Stuka. Pode ter impacto na visibilidade.",
                turn_mod: 0.9,
                stability_mod: 1.05,
                landing_gear_weight_mod: 0.85,
                armament_limits: { bomb_500: 4, bomb_1000: 2, torpedo: 1 }, // Boa para bombas grandes
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Monoplane_gull.svg/200px-Monoplane_gull.svg.png",
                tech_level_required: 40
            },
            inverted_gull: {
                name: "Gaivota Invertida",
                description: "Dobra para cima no centro. Permite hélice maior e melhor visibilidade para baixo. Famosa no Corsair.",
                turn_mod: 1.02,
                propeller_clearance_bonus: true,
                carrier_ops_bonus: true,
                armament_limits: { cannon_30: 4, cannon_37: 2, cannon_at_40: 1 },
                svg_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Monoplane_inverted_gull.svg/200px-Monoplane_inverted_gull.svg.png",
                tech_level_required: 60
            }
        },
        landing_gear_types: {
            fixed_gear: { name: "Fixo", cost: 0, weight: 0, drag_mod: 1.1, reliability_mod: 1.0, tech_level_required: 0, description: "Simples, leve e robusto, mas gera arrasto constante." },
            retractable_gear: { name: "Retrátil", cost: 22500, weight: 150, metal_cost: 300, drag_mod: 1.0, reliability_mod: 0.97, tech_level_required: 50, description: "Trem de pouso que se retrai para dentro da fuselagem, reduzindo o arrasto em voo. Mais complexo e pesado." },
            skis: { name: "Esquis", cost: 5000, weight: 80, metal_cost: 100, drag_mod: 1.12, reliability_mod: 1.0, tech_level_required: 0, description: "Permite operações em superfícies nevadas ou geladas. Aumenta o arrasto." },
            floats: { name: "Flutuadores", cost: 15000, weight: 300, metal_cost: 200, drag_mod: 1.20, reliability_mod: 1.0, tech_level_required: 0, description: "Permite pousos e decolagens na água. Aumenta significativamente o peso e o arrasto." }
        },
        // NOVOS: Tipos de Motor
        engineTypes: {
            radial: {
                name: "Motor Radial",
                description: "Cilindros em estrela ao redor do eixo. Confiável e poderoso. Melhor para caças robustos, aviões de ataque ao solo, operações em condições difíceis.",
                characteristics: {
                    acceleration_bonus: 1.15,
                    reliability_bonus: 1.20,
                    maintenance_cost: 0.8,
                    cold_weather_performance: 1.1,
                    damage_resistance: 1.25,
                    drag_penalty: 1.15,
                    visibility_penalty: 0.85,
                    max_speed_modifier: 0.92,
                    fuel_efficiency: 0.90,
                    bsfc_g_per_kwh: 310 // Specific fuel consumption
                },
                min_power: 200, max_power: 2200, // Range de potência para este tipo
                tech_level_required: 30,
                famous_examples: "Fw 190, P-47 Thunderbolt, Zero",
                cost: 25000, // Base cost for this engine type
                weight: 500, // Base weight
                metal_cost: 2000 // Base metal cost
            },
            v_inline: {
                name: "Motor em V / Em Linha",
                description: "Cilindros em V ou linha. Aerodinâmico e eficiente em alta velocidade. Melhor para caças de alta velocidade, interceptadores de altitude, aviões de corrida.",
                characteristics: {
                    max_speed_bonus: 1.12,
                    high_altitude_performance: 1.15,
                    drag_reduction: 0.85,
                    visibility_bonus: 1.10,
                    fuel_efficiency: 1.05,
                    acceleration_penalty: 0.92,
                    reliability_penalty: 0.85,
                    maintenance_cost: 1.3,
                    vulnerability_to_damage: 1.4,
                    cold_start_difficulty: 1.5,
                    bsfc_g_per_kwh: 290
                },
                min_power: 300, max_power: 2000,
                tech_level_required: 50,
                famous_examples: "Spitfire, Bf 109, P-51 Mustang",
                cost: 35000,
                weight: 600,
                metal_cost: 2500
            },
            rotary: {
                name: "Motor Rotativo",
                description: "Motor inteiro gira com a hélice. Tecnologia da WWI, leve mas problemático. Melhor para aviões de treino baratos, países sem tecnologia, nostalgia.",
                characteristics: {
                    weight_reduction: 0.60,
                    turn_rate_bonus: 1.25,
                    cooling_natural: true,
                    cost_reduction: 0.5,
                    max_power_limit: 250,
                    gyroscopic_effect: 2.0,
                    max_speed_penalty: 0.75,
                    reliability_terrible: 0.50,
                    fuel_consumption_horror: 2.0,
                    oil_consumption: "extreme",
                    bsfc_g_per_kwh: 350
                },
                min_power: 80, max_power: 250,
                tech_level_required: 0,
                obsolete_after: 1925,
                famous_examples: "Sopwith Camel, Fokker Dr.I",
                cost: 10000,
                weight: 150,
                metal_cost: 800
            },
            twin_row_radial: {
                name: "Radial Dupla Estrela",
                description: "Duas fileiras de cilindros radiais. Máxima potência bruta. Melhor para bombardeiros, caças pesados, aviões que precisam de MUITA potência.",
                characteristics: {
                    raw_power_bonus: 1.30,
                    acceleration_bonus: 1.20,
                    climb_rate_bonus: 1.25,
                    intimidation_factor: 1.5,
                    weight_penalty: 1.40,
                    drag_penalty: 1.25,
                    fuel_consumption: 1.35,
                    complexity_penalty: 1.5,
                    bsfc_g_per_kwh: 285
                },
                min_power: 1000, max_power: 3000,
                tech_level_required: 60,
                famous_examples: "B-29, Corsair, Sea Fury",
                cost: 45000,
                weight: 800,
                metal_cost: 3500
            },
            x_configuration: {
                name: "Motor em X (Experimental)",
                description: "Configuração em X, compacto mas complexo. Tecnologia experimental. Melhor para protótipos, países ricos querendo inovar, apostas arriscadas.",
                characteristics: {
                    power_density: 1.35,
                    frontal_area_tiny: 0.75,
                    unique_sound: true,
                    reliability_nightmare: 0.40,
                    maintenance_cost: 3.0,
                    production_cost: 2.5,
                    spare_parts_rare: true,
                    bsfc_g_per_kwh: 280
                },
                min_power: 1500, max_power: 2500,
                tech_level_required: 80,
                famous_examples: "Rolls-Royce Vulture (falhou)",
                cost: 80000,
                weight: 1200,
                metal_cost: 6000
            }
        },
        propellers: {
            wood_2: { name: "Madeira 2 pás", cost: 1000, weight: 30, metal_cost: 20, efficiency: 0.75, reliability_mod: 1.05, tech_level_required: 0, description: "Simples e leve. Ineficiente em altas velocidades e altitudes." },
            wood_3: { name: "Madeira 3 pás", cost: 1800, weight: 45, metal_cost: 30, efficiency: 0.80, reliability_mod: 1.0, tech_level_required: 0, description: "Melhor tração para decolagem e subida que a de 2 pás." },
            metal_2: { name: "Metal 2 pás", cost: 2500, weight: 60, metal_cost: 200, efficiency: 0.82, reliability_mod: 1.0, tech_level_required: 30, description: "Mais durável que a de madeira, permite perfis de pá mais finos e eficientes." },
            metal_3: { name: "Metal 3 pás", cost: 4000, weight: 90, metal_cost: 300, efficiency: 0.88, reliability_mod: 0.98, tech_level_required: 50, description: "Bom desempenho geral, padrão para muitos caças de meio de período." },
            adjustable: { name: "Passo Variável/Vel. Constante", cost: 15000, weight: 120, metal_cost: 500, efficiency: 0.95, reliability_mod: 0.90, tech_level_required: 70, description: "Permite ao piloto otimizar a performance em diferentes regimes de voo. Complexo e caro, com menor confiabilidade inicial." }
        },
        cooling_systems: {
            air: { name: "Refrigeração a Ar", cost: 0, weight: 0, reliability_mod: 1.05, drag_mod: 1.0, tech_level_required: 0, description: "Simples e robusto, inerente a motores radiais. Menos eficiente e gera mais arrasto." },
            liquid: { name: "Refrigeração Líquida", cost: 5000, weight: 100, reliability_mod: 0.95, drag_mod: 0.85, tech_level_required: 40, description: "Permite motores mais finos e aerodinâmicos (em linha). O sistema é pesado e vulnerável a danos de combate." }
        },
        fuel_feeds: {
            carburetor: { name: "Carburador", cost: 0, weight: 0, reliability_mod: 1.0, performance_mod: 1.0, tech_level_required: 0, description: "Simples e barato. Propenso a congelamento e falha em manobras G negativas." },
            injection: { name: "Injeção de Combustível", cost: 12000, weight: 20, reliability_mod: 1.05, performance_mod: 1.07, tech_level_required: 60, description: "Fornece combustível de forma precisa e confiável em qualquer atitude de voo. Aumenta a performance, mas é uma tecnologia cara e avançada." }
        },
        // NOVOS: Tipos de Sobrealimentador
        superchargerTypes: {
            none: {
                name: "Aspiração Natural",
                description: "Sem sobrealimentação. Simples e confiável, mas perde potência com altitude.",
                characteristics: {
                    speed_range: { min: 250, max: 450 },
                    altitude_limit: 3000,
                    power_modifier: 1.0,
                    reliability_bonus: 1.15,
                    cost_modifier: 0.8,
                    weight: 0,
                    fuel_efficiency: 1.1
                },
                tech_level_required: 0,
                best_for: "Aviões de baixa altitude, treino, economia",
                cost: 0, weight: 0, metal_cost: 0
            },
            single_stage_single_speed: {
                name: "Supercharger 1 Estágio/1 Velocidade",
                description: "Sobrealimentador básico, otimizado para uma altitude específica.",
                characteristics: {
                    speed_range: { min: 350, max: 550 },
                    optimal_altitude: 3500,
                    altitude_limit: 6000,
                    power_modifier: 1.15,
                    reliability_modifier: 1.0,
                    cost_modifier: 1.2,
                    weight: 40,
                    fuel_efficiency: 0.95
                },
                tech_level_required: 40,
                best_for: "Caças padrão, altitude média",
                cost: 8000, weight: 50, metal_cost: 100
            },
            single_stage_two_speed: {
                name: "Supercharger 1 Estágio/2 Velocidades",
                description: "Pode alternar entre baixa e alta altitude. Versátil.",
                characteristics: {
                    speed_range: { min: 380, max: 620 },
                    optimal_altitudes: [2000, 5500],
                    altitude_limit: 7000,
                    power_modifier: 1.20,
                    reliability_modifier: 0.95,
                    cost_modifier: 1.5,
                    weight: 60,
                    switching_mechanism: true,
                    fuel_efficiency: 0.92
                },
                tech_level_required: 60,
                best_for: "Caças versáteis, patrulha em várias altitudes",
                cost: 15000, weight: 70, metal_cost: 200
            },
            two_stage_two_speed: {
                name: "Supercharger 2 Estágios/2 Velocidades",
                description: "Sistema complexo para alta altitude. Excelente performance acima de 6000m.",
                characteristics: {
                    speed_range: { min: 400, max: 700 },
                    optimal_altitudes: [3000, 8000],
                    altitude_limit: 10000,
                    power_modifier: 1.30,
                    reliability_modifier: 0.85,
                    cost_modifier: 2.0,
                    weight: 110,
                    complexity: "high",
                    fuel_efficiency: 0.88,
                    requires_intercooler: true
                },
                tech_level_required: 70,
                best_for: "Interceptadores de alta altitude, escoltas de bombardeiros",
                cost: 20000, weight: 90, metal_cost: 300
            },
            turbocharger: {
                name: "Turbocompressor",
                description: "Usa gases de escape. Mantém potência em altitudes extremas, mas complexo e pesado.",
                characteristics: {
                    speed_range: { min: 420, max: 750 },
                    altitude_limit: 12000,
                    power_modifier: 1.35,
                    reliability_modifier: 0.75,
                    cost_modifier: 3.0,
                    weight: 180,
                    heat_generation: "extreme",
                    fuel_efficiency: 0.85,
                    lag_issue: true,
                    requires_wastegate: true
                },
                tech_level_required: 80,
                best_for: "Bombardeiros de alta altitude, recordes de velocidade",
                cost: 30000, weight: 150, metal_cost: 500
            },
            mechanically_coupled_turbo: {
                name: "Turbo-Compound",
                description: "Combina turbo com acoplamento mecânico. Recupera energia dos gases de escape.",
                characteristics: {
                    speed_range: { min: 380, max: 650 },
                    altitude_limit: 9000,
                    power_modifier: 1.40,
                    fuel_efficiency: 1.15,
                    reliability_modifier: 0.65,
                    cost_modifier: 4.0,
                    weight: 220,
                    complexity: "extreme",
                    vibration_issues: true
                },
                tech_level_required: 85,
                best_for: "Aviões de longo alcance, quando economia importa mais que simplicidade",
                cost: 40000, weight: 200, metal_cost: 700
            },
            water_methanol_injection: {
                name: "Injeção de Água-Metanol + Supercharger",
                description: "Boost temporário de emergência. Aumenta potência por tempo limitado.",
                characteristics: {
                    speed_range: { min: 400, max: 680 },
                    altitude_limit: 7000,
                    power_modifier: 1.25,
                    emergency_power: 1.50,
                    emergency_duration: 5,
                    reliability_modifier: 0.80,
                    cost_modifier: 2.5,
                    weight: 95,
                    consumable_required: true,
                    engine_wear: "high"
                },
                tech_level_required: 75,
                best_for: "Caças que precisam de boost em dogfights, interceptação de emergência",
                cost: 25000, weight: 80, metal_cost: 300
            },
            nitrous_oxide: {
                name: "Sistema de Óxido Nitroso (GM-1)",
                description: "Injeção de N2O para altitude extrema. Tecnologia alemã experimental.",
                characteristics: {
                    speed_range: { min: 450, max: 720 },
                    altitude_limit: 11000,
                    power_modifier: 1.20,
                    high_altitude_boost: 1.45,
                    reliability_modifier: 0.70,
                    cost_modifier: 3.5,
                    weight: 120,
                    consumable_required: true,
                    operational_hazard: "high",
                    cold_weather_issue: true
                },
                tech_level_required: 85,
                nation_specific: ["Alemanha", "Japão"],
                best_for: "Interceptadores de alta altitude desesperados",
                cost: 35000, weight: 100, metal_cost: 400
            }
        },
        engine_enhancements: {
            ducted_radiators: { name: "Radiadores Dutados", cost: 10000, weight: 30, metal_cost: 80, drag_mod: 0.97, reliability_mod: 0.98, tech_level_required: 60, description: "Radiadores integrados na fuselagem ou asas, reduzindo significativamente o arrasto em comparação com radiadores externos. Aumenta a complexidade." },
            intercoolers: { name: "Intercoolers", cost: 8000, weight: 25, metal_cost: 70, power_mod: 1.03, reliability_mod: 0.95, tech_level_required: 50, description: "Resfria o ar comprimido pelo superalimentador, aumentando a densidade do ar e a potência do motor, mas adiciona complexidade e pontos de falha." }
        },
        armaments: {
            mg_30: { name: "Metralhadora .30", cost: 4500, weight: 12, metal_cost: 100, tech_level_required: 0 },
            mg_50: { name: "Metralhadora .50", cost: 11250, weight: 20, metal_cost: 250, tech_level_required: 40 },
            cannon_20: { name: "Canhão 20mm", cost: 15000, weight: 100, metal_cost: 400, tech_level_required: 50 },
            cannon_30: { name: "Canhão 30mm", cost: 37500, weight: 400, metal_cost: 800, tech_level_required: 70 },
            cannon_37: { name: "Canhão 37mm", cost: 60000, weight: 550, metal_cost: 1200, tech_level_required: 80 },
            cannon_at_40: { name: "Canhão Anti-Tanque 40mm", cost: 75000, weight: 650, metal_cost: 1500, tech_level_required: 85 },
            bomb_50: { name: "Bombas 50kg", cost: 1500, weight: 50, metal_cost: 50, tech_level_required: 0 },
            bomb_100: { name: "Bombas 100kg", cost: 3000, weight: 100, metal_cost: 100, tech_level_required: 0 },
            bomb_250: { name: "Bombas 250kg", cost: 7500, weight: 250, metal_cost: 250, tech_level_required: 30 },
            bomb_500: { name: "Bombas 500kg", cost: 15000, weight: 500, metal_cost: 500, tech_level_required: 50 },
            bomb_1000: { name: "Bombas 1000kg", cost: 30000, weight: 1000, metal_cost: 1000, tech_level_required: 70 },
            torpedo: { name: "Torpedo Naval", cost: 75000, weight: 800, metal_cost: 2000, tech_level_required: 60 },
            incendiary: { name: "Bombas Incendiárias", cost: 5000, weight: 75, metal_cost: 150, tech_level_required: 40 },
            rockets: { name: "Foguetes Ar-Terra", cost: 9000, weight: 25, metal_cost: 200, tech_level_required: 60 },
        },
        defensive_armaments: {
            none_turret: { name: "Nenhum", cost: 0, weight: 0, metal_cost: 0, reliability_mod: 1.0, defensive_firepower_mod: 0, tech_level_required: 0, description: "Nenhuma torre defensiva." },
            manned_turret: { name: "Torreta Tripulada (Manual)", cost: 20000, weight: 150, metal_cost: 300, reliability_mod: 0.95, defensive_firepower_mod: 0.8, tech_level_required: 0, description: "Torreta operada manualmente por um artilheiro. Campo de fogo limitado e vulnerável." },
            powered_turret: { name: "Torreta Motorizada (Hidráulica/Elétrica)", cost: 50000, weight: 300, metal_cost: 600, reliability_mod: 0.85, defensive_firepower_mod: 1.2, tech_level_required: 50, description: "Torreta com assistência hidráulica ou elétrica para movimentação, permitindo maior campo de fogo e resposta mais rápida. Mais complexa." },
            remote_turret: { name: "Torreta Remota", cost: 100000, weight: 250, metal_cost: 800, reliability_mod: 0.70, defensive_firepower_mod: 1.5, tech_level_required: 80, description: "Torreta controlada remotamente de dentro da aeronave, protegendo o artilheiro e oferecendo excelente campo de fogo. Extremamente avançada e não confiável no período." },
            defensive_mg_30: { name: "Metralhadora .30 (Defensiva)", cost: 4500, weight: 12, metal_cost: 100, firepower: 1, tech_level_required: 0 },
            defensive_mg_50: { name: "Metralhadora .50 (Defensiva)", cost: 11250, weight: 20, metal_cost: 250, firepower: 2, tech_level_required: 40 },
            defensive_cannon_20: { name: "Canhão 20mm (Defensiva)", cost: 15000, weight: 100, metal_cost: 400, firepower: 5, tech_level_required: 50 },
        },
        protection: {
            pilot_armor: { name: "Blindagem do Piloto", cost: 15000, weight: 250, metal_cost: 400, reliability_mod: 1.0, tech_level_required: 30, description: "Proteção para o piloto contra fogo inimigo." },
            engine_armor: { name: "Blindagem do Motor", cost: 15000, weight: 250, metal_cost: 400, reliability_mod: 1.0, tech_level_required: 40, description: "Proteção para o motor, aumentando a chance de sobreviver a acertos." },
            tank_armor: { name: "Blindagem dos Tanques", cost: 18000, weight: 180, metal_cost: 300, reliability_mod: 1.0, tech_level_required: 50, description: "Proteção para os tanques de combustível, reduzindo o risco de incêndio ou vazamento." },
            self_sealing_tanks: { name: "Tanques Auto-Selantes", cost: 22500, weight: 45, metal_cost: 100, reliability_mod: 1.15, tech_level_required: 60, description: "Tanques que se selam automaticamente após serem perfurados, prevenindo vazamentos e incêndios. Aumenta a confiabilidade." },
        },
        cockpit_comfort: {
            enclosed_cockpit: { name: "Cabine Fechada", cost: 3000, weight: 10, metal_cost: 30, drag_mod: 0.98, reliability_mod: 1.01, tech_level_required: 20, description: "Melhora o conforto da tripulação, reduz o arrasto aerodinâmico e aumenta ligeiramente a confiabilidade devido à proteção dos instrumentos." },
            heated_cockpit: { name: "Cabine Aquecida", cost: 2000, weight: 5, metal_cost: 20, reliability_mod: 1.02, tech_level_required: 40, description: "Aumenta o conforto da tripulação em voos de alta altitude ou em climas frios, melhorando a performance e a confiabilidade da tripulação." },
            oxygen_system: { name: "Sistema de Oxigênio", cost: 4000, weight: 15, metal_cost: 40, ceiling_mod: 1.2, reliability_mod: 1.01, tech_level_required: 50, description: "Permite operações seguras em altitudes elevadas por períodos prolongados, essencial para o bem-estar da tripulação e confiabilidade em altitude." },
            pressurized_cabin: { name: "Cabine Pressurizada", cost: 25000, weight: 60, metal_cost: 120, ceiling_mod: 1.4, reliability_mod: 0.90, tech_level_required: 80, description: "Permite voos confortáveis em altitudes muito elevadas, mas é um sistema complexo e com menor confiabilidade." },
            basic_autopilot: { name: "Piloto Automático Básico", cost: 15000, weight: 40, metal_cost: 100, range_mod: 1.05, reliability_mod: 1.03, tech_level_required: 60, description: "Sistema básico que ajuda a manter o curso e a altitude, reduzindo a fatiga do piloto em voos longos e melhorando a confiabilidade em missões estendidas." },
            ejection_seat: { name: "Assento Ejetável (Exp.)", cost: 150000, weight: 378, metal_cost: 500, reliability_mod: 0.7, tech_level_required: 90, description: "Tecnologia experimental para ejetar o piloto em emergências. Extremamente caro e não confiável no período." }
        },
        advanced_avionics: {
            radio_direction_finder: { name: "Rádio Direção (RDF)", cost: 10000, weight: 25, metal_cost: 80, reliability_mod: 1.0, tech_level_required: 30, description: "Auxilia na navegação, permitindo que a aeronave encontre estações de rádio." },
            blind_flying_instruments: { name: "Instrumentos de Voo por Instrumentos", cost: 18000, weight: 30, metal_cost: 120, reliability_mod: 1.02, tech_level_required: 50, description: "Conjunto completo de instrumentos que permite voo em condições de baixa visibilidade (nevoeiro, noite), aumentando a segurança e confiabilidade em condições adversas." },
            nav_instruments: { name: "Instrumentos de Navegação", cost: 15000, weight: 50, metal_cost: 100, reliability_mod: 1.0, tech_level_required: 40, description: "Instrumentos adicionais para navegação precisa." },
            gyro_compass: { name: "Bússola Giroscópica", cost: 30000, weight: 80, metal_cost: 150, reliability_mod: 1.0, tech_level_required: 60, description: "Bússola mais precisa e estável que a magnética, especialmente em manobras." },
            basic_bomb_sight: { name: "Mira de Bombardeio (Básica)", cost: 7000, weight: 15, metal_cost: 60, reliability_mod: 1.0, tech_level_required: 20, description: "Mira simples para bombardeio, melhora a precisão em alvos maiores." },
            advanced_bomb_sight: { name: "Mira de Bombardeio (Avançada)", cost: 25000, weight: 40, metal_cost: 180, reliability_mod: 0.95, tech_level_required: 70, description: "Mira giroscópica avançada, aumenta significativamente a precisão de bombardeio. Mais complexa e menos confiável que a básica." },
            camera_equipment: { name: "Equipamento de Câmera (Recon)", cost: 12000, weight: 60, metal_cost: 90, reliability_mod: 1.0, tech_level_required: 30, description: "Câmeras de alta resolução para missões de reconhecimento fotográfico." },
            early_radar: { name: "Radar Inicial (Experimental)", cost: 150000, weight: 200, metal_cost: 500, reliability_mod: 0.5, speed_mod: 0.95, tech_level_required: 90, description: "Tecnologia extremamente experimental e não confiável. Permite detecção de aeronaves inimigas à noite ou em mau tempo, mas é pesado, gera arrasto e falha frequentemente." }
        },
        equipment: {
            parachute: { name: "Paraquedas", cost: 7500, weight: 15, metal_cost: 10, reliability_mod: 1.0, tech_level_required: 0, description: "Equipamento de segurança para a tripulação." },
            fire_extinguisher: { name: "Sistema Anti-Incêndio", cost: 45000, weight: 75, metal_cost: 150, reliability_mod: 1.1, tech_level_required: 60, description: "Sistema automático para combater incêndios a bordo, aumentando a confiabilidade e a segurança." },
            radio_hf: { name: "Rádio HF", cost: 22500, weight: 100, metal_cost: 200, reliability_mod: 1.0, tech_level_required: 30, description: "Rádio de alta frequência para comunicação de longo alcance." },
            gun_synchronizer: { name: "Sincronizador de Metralhadoras", cost: 60000, weight: 50, metal_cost: 100, reliability_mod: 0.98, tech_level_required: 50, description: "Permite atirar através do arco da hélice sem atingi-la. Essencial para caças com armamento frontal, mas pode falhar." },
            dive_brakes: { name: "Freios de Mergulho", cost: 8000, weight: 50, metal_cost: 100, reliability_mod: 1.0, tech_level_required: 40, description: "Superfícies que se estendem para controlar a velocidade em mergulhos íngremes." },
            sirens: { name: "Sirenes Psicológicas", cost: 2000, weight: 10, metal_cost: 20, reliability_mod: 1.0, tech_level_required: 0, description: "Sirenes montadas na aeronave para efeito psicológico sobre o inimigo." },
            jato: { name: "Foguetes Auxiliares (JATO)", cost: 30000, weight: 120, metal_cost: 200, reliability_mod: 0.90, tech_level_required: 70, description: "Foguetes de curta duração para auxiliar na decolagem, especialmente com carga pesada. Uso único e pode ser perigoso." },
            extra_fuel_tanks: { name: "Tanques de Combustíveis Extras (Fixos)", cost: 8000, weight: 40, metal_cost: 150, range_mod: 1.4, maneuverability_mod: 0.9, reliability_mod: 0.98, tech_level_required: 40, description: "Aumenta o alcance com tanques internos maiores, mas o peso extra permanente prejudica a agilidade e adiciona pontos de falha." },
            drop_tanks: { name: "Tanques de Combustíveis Descartáveis", cost: 12000, weight: 20, metal_cost: 200, range_mod: 1.8, reliability_mod: 0.95, tech_level_required: 60, description: "Aumenta drasticamente o alcance. Os tanques são descartados antes do combate, não afetando a performance. Impede o uso de bombas ou foguetes e adiciona complexidade." },
            advanced_control_surfaces: { name: "Superfícies de Controle Avançadas", cost: 40000, weight: 50, metal_cost: 300, maneuverability_mod: 1.25, reliability_mod: 0.90, tech_level_required: 70, description: "Ailerons e profundores otimizados que permitem taxas de rolagem e curvas mais rápidas, ao custo de estabilidade e maior complexidade, impactando a confiabilidade." },
            arresting_hook: { name: "Gancho de Arresto", cost: 5000, weight: 20, metal_cost: 50, reliability_mod: 1.0, tech_level_required: 0, description: "Gancho retrátil para pousos em porta-aviões, essencial para aeronaves navais." },
            smoke_generators: { name: "Geradores de Fumaça", cost: 3000, weight: 50, metal_cost: 30, reliability_mod: 1.0, tech_level_required: 0, description: "Equipamento para criar cortinas de fumaça para ocultação ou sinalização durante o voo." },
            standardized_parts: { name: "Peças Padronizadas", cost: 10000, weight: 0, metal_cost: 50, reliability_mod: 1.08, tech_level_required: 30, description: "Uso de peças e componentes padronizados que facilitam a manutenção e aumentam a confiabilidade geral da aeronave." }
        },
        maintainability_features: {
            standardized_parts: { name: "Peças Padronizadas", cost: 10000, weight: 0, metal_cost: 50, reliability_mod: 1.08, tech_level_required: 30, description: "Uso de peças e componentes padronizados que facilitam a manutenção e aumentam a confiabilidade geral da aeronave." }
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

// NOVO: Restrições de Nível Tecnológico
export const techLevelRestrictions = {
    tier_advanced: { // 90+
        min_tech: 90,
        name: "Tecnologia Avançada",
        blocked_components: [], // Nenhum bloqueado, 'all' significa que todos os outros são permitidos
        max_engine_power: 3000,
        description: "Acesso total a todas as tecnologias"
    },
    tier_modern: { // 70-89
        min_tech: 70,
        name: "Tecnologia Moderna",
        blocked_components: ['duralumin', 'ejection_seat', 'early_radar', 'pressurized_cabin', 'delta_wing', 'turbocharger', 'mechanically_coupled_turbo', 'water_methanol_injection', 'nitrous_oxide', 'cannon_30', 'cannon_37', 'cannon_at_40', 'bomb_1000', 'remote_turret'],
        max_engine_power: 2000,
        description: "Tecnologia moderna mas sem acesso aos desenvolvimentos mais avançados"
    },
    tier_basic: { // 50-69
        min_tech: 50,
        name: "Tecnologia Básica",
        blocked_components: ['duralumin', 'ejection_seat', 'early_radar', 'pressurized_cabin', 'delta_wing', 'turbocharger', 'mechanically_coupled_turbo', 'water_methanol_injection', 'nitrous_oxide', 'cannon_30', 'cannon_37', 'cannon_at_40', 'bomb_1000', 'remote_turret', 'swept_wings', 'injection', 'adjustable', 'two_stage_two_speed', 'twin_row_radial', 'x_configuration', 'metal_3', 'powered_turret', 'tank_armor', 'self_sealing_tanks', 'basic_autopilot', 'advanced_bomb_sight', 'jato', 'drop_tanks', 'advanced_control_surfaces'],
        max_engine_power: 1200,
        blocked_engines: ['v24', 'radial_18', 'twin_row_radial', 'x_configuration'], // Motores específicos
        description: "Limitado a designs simples e confiáveis"
    },
    tier_primitive: { // <50
        min_tech: 0,
        name: "Tecnologia Primitiva",
        blocked_components: ['duralumin', 'ejection_seat', 'early_radar', 'pressurized_cabin', 'delta_wing', 'turbocharger', 'mechanically_coupled_turbo', 'water_methanol_injection', 'nitrous_oxide', 'cannon_30', 'cannon_37', 'cannon_at_40', 'bomb_1000', 'remote_turret', 'swept_wings', 'injection', 'adjustable', 'two_stage_two_speed', 'twin_row_radial', 'x_configuration', 'metal_3', 'powered_turret', 'tank_armor', 'self_sealing_tanks', 'basic_autopilot', 'advanced_bomb_sight', 'jato', 'drop_tanks', 'advanced_control_surfaces', 'all_metal', 'wood_metal', 'monoplane_cantilever', 'retractable_gear', 'mg_50', 'cannon_20', 'bomb_250', 'bomb_500', 'torpedo', 'incendiary', 'rockets', 'pilot_armor', 'engine_armor', 'heated_cockpit', 'oxygen_system', 'radio_direction_finder', 'blind_flying_instruments', 'nav_instruments', 'gyro_compass', 'fire_extinguisher', 'radio_hf', 'gun_synchronizer', 'dive_brakes', 'extra_fuel_tanks', 'standardized_parts'],
        max_engine_power: 500,
        allowed_engines: ['rotary', 'radial'], // Usar os tipos gerais de motor
        forced_wing_type: 'biplane_wing_pos', // Força a posição de asa biplano
        description: "Limitado a designs da era da Grande Guerra"
    }
};

// NOVO: Combinações Motor + Sobrealimentador
export const engineSuperchargerCombos = {
    calculateLimits: (engineTypeKey, superchargerTypeKey) => {
        const engine = gameData.components.engineTypes[engineTypeKey];
        const supercharger = gameData.components.superchargerTypes[superchargerTypeKey];

        if (!engine || !supercharger) {
            return { speed: { min: 0, max: 0 }, range: { min: 0, max: 0 }, altitude: 0, special: { blocked: true, reason: "Selecione um tipo de motor e sobrealimentador válidos." } };
        }

        // Base ranges from supercharger
        let minSpeed = supercharger.characteristics.speed_range.min;
        let maxSpeed = supercharger.characteristics.speed_range.max;
        let minRange = 500; // Base range
        let maxRange = 2500; // Base range

        // Apply engine characteristics to speed and range
        maxSpeed *= (engine.characteristics.max_speed_bonus || 1.0);
        maxSpeed *= (engine.characteristics.max_speed_penalty || 1.0);
        minSpeed *= (engine.characteristics.max_speed_penalty || 1.0); // Penalidade também afeta o mínimo

        minRange *= (engine.characteristics.fuel_efficiency || 1.0);
        maxRange *= (engine.characteristics.fuel_efficiency || 1.0);

        // Apply supercharger characteristics to speed and range
        minRange *= (supercharger.characteristics.fuel_efficiency || 1.0);
        maxRange *= (supercharger.characteristics.fuel_efficiency || 1.0);

        let altitude = supercharger.characteristics.altitude_limit;
        let special = {};

        // Special combinations (synergies/blocks)
        const comboKey = `${engineTypeKey}+${superchargerTypeKey}`;
        switch (comboKey) {
            case "v_inline+two_stage_two_speed":
                maxSpeed *= 1.1; // V12 + 2-stage = excelente
                special.description = "Combinação clássica de caça de alta performance.";
                break;
            case "radial+turbocharger":
                maxSpeed *= 0.95; // Radial + turbo = mais arrasto
                special.reliability = 0.9;
                special.description = "Poderoso mas pode ser problemático devido ao arrasto adicional.";
                break;
            case "rotary+turbocharger":
                special = { blocked: true, reason: "Motor rotativo não suporta turbocompressor. Escolha outro sobrealimentador." };
                break;
            case "twin_row_radial+water_methanol_injection":
                special.emergency_power_boost = 2000; // Potência absurda temporária!
                special.description = "Combinação de potência bruta máxima com boost de emergência.";
                break;
            case "rotary+single_stage_single_speed":
            case "rotary+single_stage_two_speed":
            case "rotary+two_stage_two_speed":
            case "rotary+mechanically_coupled_turbo":
            case "rotary+water_methanol_injection":
            case "rotary+nitrous_oxide":
                special = { blocked: true, reason: "Motor rotativo é incompatível com a maioria dos sobrealimentadores avançados. Escolha 'Aspiração Natural'." };
                break;
            case "x_configuration+none":
                special.description = "Motor Experimental em X sem sobrealimentação. Potencial não totalmente aproveitado.";
                break;
            case "x_configuration+water_methanol_injection":
                special.description = "Combinação de alto risco e alta recompensa para protótipos de velocidade.";
                break;
        }

        // Apply explicit tech requirements for combinations if any
        if (engine.tech_level_required > 0 && supercharger.tech_level_required > 0) {
            const requiredTech = Math.max(engine.tech_level_required, supercharger.tech_level_required);
            if (gameData.currentCountryTechLevel < requiredTech) {
                special = { blocked: true, reason: `Esta combinação requer Nível de Tecnologia Aeronáutica ${requiredTech} (Seu país: ${gameData.currentCountryTechLevel}).` };
            }
        }
        
        // Ensure min speed is not higher than max speed after mods
        if (minSpeed > maxSpeed) minSpeed = maxSpeed * 0.8; 
        if (minRange > maxRange) minRange = maxRange * 0.8;

        return {
            speed: { min: Math.round(minSpeed), max: Math.round(maxSpeed) },
            range: { min: Math.round(minRange), max: Math.round(maxRange) },
            altitude: altitude,
            special: special
        };
    }
};

// NOVO: Sistema de Pontos de Design
export const designPointsSystem = {
    calculateBudget: (countryData) => {
        const baseBudget = 100;
        const techBonus = (countryData.tech_level_air || 0) * 0.5;
        const civilBonus = (countryData.tech_civil || 0) * 0.3;
        return Math.round(baseBudget + techBonus + civilBonus);
    },
    // Custos em pontos para cada característica
    costs: {
        speed: {
            300: 0,
            400: 10,
            500: 25,
            600: 45,
            700: 70,
            800: 100,
            900: 150, // Adicionado para permitir velocidades mais altas
            1000: 220 // Extremamente caro
        },
        range: {
            500: 0,
            1000: 15,
            2000: 35,
            3000: 60,
            4000: 90,
            5000: 130, // Adicionado
            6000: 180 // Extremamente caro
        },
        maneuverability: { // Estes serão mais sobre a "filosofia de design"
            poor: -20,
            average: 0,
            good: 20,
            excellent: 50
        },
        armament: { // Estes serão mais sobre a "filosofia de design"
            light: 0,
            medium: 15,
            heavy: 35,
            very_heavy: 60
        }
    }
};

// NOVO: Trade-offs de Performance (para determinar requisitos de motor)
export const performanceTradeoffs = {
    calculateEngineRequirements: (targetSpeed, aircraftType) => {
        let power_needed_hp = 0;
        let num_engines = 1;
        let engine_weight_penalty = 1.0;
        let fuel_consumption_mult = 1.0;
        let reliability_penalty = 1.0;
        let cost_multiplier = 1.0;
        let propeller_type = 'metal_3'; // Default propeller

        // Base power needed based on target speed (simplified curve)
        if (targetSpeed <= 400) {
            power_needed_hp = 400;
            propeller_type = 'wood_3';
        } else if (targetSpeed <= 500) {
            power_needed_hp = 600;
            propeller_type = 'metal_2';
        } else if (targetSpeed <= 600) {
            power_needed_hp = 1000;
            propeller_type = 'metal_3';
        } else if (targetSpeed <= 700) {
            power_needed_hp = 1500;
            propeller_type = 'adjustable';
        } else if (targetSpeed <= 800) {
            power_needed_hp = 2200;
            propeller_type = 'adjustable';
        } else { // > 800 km/h
            const excess = targetSpeed - 800;
            power_needed_hp = 2200 + Math.pow(excess, 1.5) * 5; // Exponential increase
            propeller_type = 'adjustable';
        }

        // Adjustments based on aircraft type (simplified)
        switch (aircraftType) {
            case 'heavy_fighter':
            case 'cas':
            case 'naval_cas':
            case 'tactical_bomber':
            case 'strategic_bomber':
            case 'naval_bomber':
            case 'transport':
            case 'seaplane':
            case 'zeppelin':
                power_needed_hp *= 1.2; // Heavier types need more power
                break;
        }

        // Engine count and penalties based on total power needed
        if (power_needed_hp > 1500 && power_needed_hp <= 3000) {
            num_engines = 2;
            engine_weight_penalty = 1.3;
            fuel_consumption_mult = 1.1;
            reliability_penalty = 0.9;
            cost_multiplier = 1.2;
        } else if (power_needed_hp > 3000 && power_needed_hp <= 5000) {
            num_engines = 3;
            engine_weight_penalty = 1.5;
            fuel_consumption_mult = 1.2;
            reliability_penalty = 0.8;
            cost_multiplier = 1.5;
        } else if (power_needed_hp > 5000) {
            num_engines = 4;
            engine_weight_penalty = 1.8;
            fuel_consumption_mult = 1.3;
            reliability_penalty = 0.7;
            cost_multiplier = 2.0;
        }

        return {
            power_needed_hp: power_needed_hp,
            number_of_engines: num_engines,
            engine_weight_penalty: engine_weight_penalty,
            fuel_consumption_mult: fuel_consumption_mult,
            reliability_penalty: reliability_penalty,
            cost_multiplier: cost_multiplier,
            propeller_type: propeller_type
        };
    }
};

// NOVO: Penalidades Progressivas de Design
export const designPenalties = {
    speedPenalties: {
        300: { turn_rate_penalty: 1.2, climb_rate_penalty: 1.1, structural_stress: "low", required_features: [] },
        400: { turn_rate_penalty: 1.1, climb_rate_penalty: 1.05, structural_stress: "normal", required_features: [] },
        500: { turn_rate_penalty: 1.0, climb_rate_penalty: 1.0, structural_stress: "normal", required_features: [] },
        600: {
            turn_rate_penalty: 0.85,
            climb_rate_penalty: 0.95,
            structural_stress: "high",
            required_features: ["advanced_control_surfaces", "strengthened_frame"] // 'strengthened_frame' é um placeholder, ajustar se não existir
        },
        700: {
            turn_rate_penalty: 0.70,
            climb_rate_penalty: 0.85,
            structural_stress: "extreme",
            required_features: ["advanced_control_surfaces", "strengthened_frame", "duralumin"],
            maintenance_multiplier: 2.0
        },
        800: {
            turn_rate_penalty: 0.50,
            climb_rate_penalty: 0.75,
            structural_stress: "prototype",
            required_features: ["advanced_control_surfaces", "duralumin", "pressurized_cabin"], // Exemplo de 'all_advanced'
            maintenance_multiplier: 4.0,
            accident_risk: "high"
        }
    },
    rangePenalties: {
        500: { weight_penalty: 1.0, maneuverability_penalty: 1.0 },
        1000: { weight_penalty: 1.05, maneuverability_penalty: 0.98 },
        2000: { weight_penalty: 1.15, maneuverability_penalty: 0.95, required_features: ["extra_fuel_tanks"] },
        3000: { weight_penalty: 1.25, maneuverability_penalty: 0.90, required_features: ["extra_fuel_tanks", "drop_tanks"] },
        4000: { weight_penalty: 1.35, maneuverability_penalty: 0.85, required_features: ["extra_fuel_tanks", "drop_tanks", "basic_autopilot"] },
        5000: { weight_penalty: 1.50, maneuverability_penalty: 0.80, required_features: ["extra_fuel_tanks", "drop_tanks", "basic_autopilot", "nav_instruments"] }
    }
};

// NOVO: Templates de "Sweet Spots"
export const efficientDesigns = {
    "Caça Leve Econômico": {
        speed: 480,
        range: 800,
        engineType: 'radial',
        superchargerType: 'none',
        description: "Design eficiente e barato, ideal para produção em massa",
        efficiency_rating: "A+"
    },
    "Interceptador de Alta Altitude": {
        speed: 650,
        range: 600,
        engineType: 'v_inline',
        superchargerType: 'two_stage_two_speed',
        description: "Especializado, caro mas efetivo em seu papel",
        efficiency_rating: "B+"
    },
    "Multi-Role Fighter": {
        speed: 550,
        range: 1200,
        engineType: 'v_inline',
        superchargerType: 'single_stage_two_speed',
        description: "Versátil mas sem excelência em nada específico",
        efficiency_rating: "B"
    },
    "Bombardeiro de Longo Alcance": {
        speed: 400,
        range: 3500,
        engineType: 'twin_row_radial',
        superchargerType: 'turbocharger',
        description: "Focado em alcance e carga, sacrificando velocidade e agilidade.",
        efficiency_rating: "C+"
    }
};


// --- DADOS DE AERONAVES REAIS ---
export const realWorldAircraft = [
    { id: 'bf109e3', name: 'Messerschmitt Bf 109 E-3', image_url: 'https://lh3.googleusercontent.com/d/1nvIkjIeZtmgpJXAZajyeqDBicQlAWNFj' },
    { id: 'bf109g6', name: 'Messerschmitt Bf 109 G-6', image_url: 'https://lh3.googleusercontent.com/d/1cbSlGQcEtXrD1hIK_FBX7kUB9N6cVTef' },
    { id: 'd520', name: 'Dewoitine D.520', image_url: 'https://lh3.googleusercontent.com/d/1xVChn5gbXSzdQ_3-VFvZZ48yY3iPeGzr' },
    { id: 'fw190a8', name: 'Focke-Wulf Fw 190 A-8', image_url: 'https://lh3.googleusercontent.com/d/14Il4G9wpTsIrmin2PNgNj_RezZEEj1Ps' },
    { id: 'hurricane', name: 'Hawker Hurricane Mk.IIC', image_url: 'https://lh3.googleusercontent.com/d/16YD7iFd_b0nTt-bky4f7aCBqHqEXTzuS' },
    { id: 'i16', name: 'Polikarpov I-16', image_url: 'https://lh3.googleusercontent.com/d/1VAClb1ppQoWfu7AeWfqJY4I985STUnyo' },
    { id: 'iar80', name: 'IAR 80', image_url: 'https://lh3.googleusercontent.com/d/19-pueHMabuaWUFDqeUQe9AJdRKYFUNmY' },
    { id: 'ki43', name: 'Nakajima Ki-43 Hayabusa', image_url: 'https://lh3.googleusercontent.com/d/1y2YdNFQcUxST_-tBWYeTRClfi1ad7GP4' },
    { id: 'ki61', name: 'Kawasaki Ki-61 Hien', image_url: 'https://lh3.googleusercontent.com/d/1C4iuS2GHgy9TX5r5jgrWbtkJazbyMMas' },
    { id: 'lagg3', name: 'Lavochkin LaGG-3', image_url: 'https://lh3.googleusercontent.com/d/1NLhY87GwVDJ0bWI66u1xqGIM5OicyoVQ' },
    { id: 'p40', name: 'Curtiss P-40 Warhawk', image_url: 'https://lh3.googleusercontent.com/d/1cQpmeh-eR7YQLZFw1qNMHBxp76UTbcFF' },
    { id: 'p47', name: 'Republic P-47 Thunderbolt', image_url: 'https://lh3.googleusercontent.com/d/1b4NNln8WHlsjElg20B8lxbnUeXzcOXPY' },
    { id: 'p51d', name: 'North American P-51D Mustang', image_url: 'https://lh3.googleusercontent.com/d/1wa1nl1SoQX_5XG5ea-1RQGpTbFuY5w-0' },
    { id: 'spitfire', name: 'Supermarine Spitfire Mk I', image_url: 'https://lh3.googleusercontent.com/d/15J2DmLBCLXzWeo8cOsstqwpYECKIrk3U' },
    { id: 'yak3', name: 'Yakovlev Yak-3', image_url: 'https://lh3.googleusercontent.com/d/1NbMiOees0x2LSuzzeqo0lYUa4Erg_gYB' },
    { id: 'other', name: 'Yakovlev Yak-3 (alt)', image_url: 'https://lh3.googleusercontent.com/d/1hcPeyJkleEbn0oqDgKGykVWl47n9NDdF' }
];

// --- FUNÇÕES DE CARREGAMENTO E PARSE DE DADOS ---
/**
 * Limpa e converte um valor para float.
 * Remove caracteres de moeda, pontos de milhar e vírgulas decimais.
 * @param {string|number} value - O valor a ser limpo e convertido.
 * @returns {number} - O valor numérico limpo.
 */
export function cleanAndParseFloat(value) {
    if (typeof value !== 'string') return parseFloat(value) || 0;
    const cleanedValue = value.trim().replace('£', '').replace(/\./g, '').replace(',', '.').replace('%', '');
    return parseFloat(cleanedValue) || 0;
}

/**
 * Faz o parse de um CSV a partir de uma URL.
 * @param {string} url - A URL do arquivo CSV.
 * @returns {Promise<Array<object>>} - Uma promessa que resolve para um array de objetos, onde cada objeto é uma linha do CSV.
 */
export async function parseCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao carregar CSV de ${url}: ${response.statusText}`);
        const csvText = await response.text();

        const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length < 1) return [];

        // Função para dividir linhas CSV de forma robusta, lidando com vírgulas dentro de aspas
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

/**
 * Carrega os dados do jogo (países, capacidades) a partir das planilhas do Google Sheets.
 */
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

        // Adiciona um país genérico/padrão para fallback
        tempCountries["Genérico / Padrão"] = { production_capacity: 100000000, metal_balance: 5000000, tech_level_air: 50, tech_civil: 50, urbanization: 50 };

        gameData.countries = tempCountries;
        populateCountryDropdown();
        if (countryDropdown) countryDropdown.disabled = false;

    } catch (error) {
        console.error("Erro fatal ao carregar dados das planilhas:", error);
        if (countryDropdown) {
            countryDropdown.innerHTML = '<option value="error">Erro ao carregar</option>';
            countryDropdown.disabled = false;
        }
        // Fallback para dados genéricos em caso de falha no carregamento
        gameData.countries = { "Genérico / Padrão": { production_capacity: 100000000, metal_balance: 5000000, tech_level_air: 50, tech_civil: 50, urbanization: 50 } };
        populateCountryDropdown();
    }
}

/**
 * Popula o dropdown de seleção de país com os dados carregados.
 */
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
    // Seleciona o país genérico/padrão por default se existir
    if (gameData.countries["Genérico / Padrão"]) {
        dropdown.value = "Genérico / Padrão";
    }
}

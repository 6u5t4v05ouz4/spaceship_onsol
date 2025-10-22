-- =====================================================
-- SPACE CRYPTO MINER - DADOS INICIAIS E CONFIGURAÇÕES
-- =====================================================
-- Versão: 1.0
-- Data: Janeiro 2025
-- Descrição: Dados iniciais para o funcionamento do jogo
-- =====================================================

-- =====================================================
-- 1. TIPOS DE RECURSOS
-- =====================================================

-- Metais
INSERT INTO resource_types (name, category, rarity, weight_per_unit, description, icon_url) VALUES
('Ferro', 'Metal', 'Comum', 1, 'Metal básico usado em reparos e construções simples', '/assets/icons/iron.png'),
('Cobre', 'Metal', 'Comum', 1, 'Metal condutor usado em sistemas elétricos', '/assets/icons/copper.png'),
('Alumínio', 'Metal', 'Incomum', 1, 'Metal leve usado em estruturas avançadas', '/assets/icons/aluminum.png'),
('Titânio', 'Metal', 'Raro', 2, 'Metal resistente usado em equipamentos militares', '/assets/icons/titanium.png'),
('Platina', 'Metal', 'Épico', 3, 'Metal precioso usado em tecnologia avançada', '/assets/icons/platinum.png'),
('Cristal de Energia', 'Metal', 'Lendário', 5, 'Cristal que armazena energia pura', '/assets/icons/energy_crystal.png');

-- Combustível
INSERT INTO resource_types (name, category, rarity, weight_per_unit, description, icon_url) VALUES
('Hidrogênio', 'Combustível', 'Comum', 1, 'Combustível básico para naves pequenas', '/assets/icons/hydrogen.png'),
('Deutério', 'Combustível', 'Incomum', 2, 'Combustível eficiente para naves médias', '/assets/icons/deuterium.png'),
('Antimatéria', 'Combustível', 'Raro', 3, 'Combustível de alta energia para naves grandes', '/assets/icons/antimatter.png'),
('Cristal de Poder', 'Combustível', 'Épico', 5, 'Cristal que gera energia infinita', '/assets/icons/power_crystal.png');

-- Oxigênio
INSERT INTO resource_types (name, category, rarity, weight_per_unit, description, icon_url) VALUES
('Oxigênio Líquido', 'Oxigênio', 'Comum', 1, 'Oxigênio purificado para respiração', '/assets/icons/liquid_oxygen.png'),
('Oxigênio Comprimido', 'Oxigênio', 'Incomum', 2, 'Oxigênio altamente comprimido', '/assets/icons/compressed_oxygen.png'),
('Cristal de Ar', 'Oxigênio', 'Raro', 3, 'Cristal que gera oxigênio continuamente', '/assets/icons/air_crystal.png');

-- Projéteis
INSERT INTO resource_types (name, category, rarity, weight_per_unit, description, icon_url) VALUES
('Mísseis Básicos', 'Projétil', 'Comum', 2, 'Mísseis simples para combate básico', '/assets/icons/basic_missiles.png'),
('Mísseis Guiados', 'Projétil', 'Incomum', 3, 'Mísseis com sistema de guiamento', '/assets/icons/guided_missiles.png'),
('Mísseis Energéticos', 'Projétil', 'Raro', 4, 'Mísseis que causam dano energético', '/assets/icons/energy_missiles.png'),
('Torpedos de Plasma', 'Projétil', 'Épico', 6, 'Torpedos de plasma de alta destruição', '/assets/icons/plasma_torpedoes.png');

-- Recursos Especiais (PvP)
INSERT INTO resource_types (name, category, rarity, weight_per_unit, description, icon_url) VALUES
('Cristal Espacial', 'Especial', 'Mítico', 10, 'Cristal raro encontrado apenas em áreas PvP', '/assets/icons/space_crystal.png'),
('Essência Estelar', 'Especial', 'Mítico', 15, 'Essência pura de estrelas distantes', '/assets/icons/stellar_essence.png'),
('Fragmento de Realidade', 'Especial', 'Mítico', 20, 'Fragmento de realidade alterada', '/assets/icons/reality_fragment.png');

-- =====================================================
-- 2. TIPOS DE EQUIPAMENTOS
-- =====================================================

-- Armas
INSERT INTO equipment_types (name, category, rarity, combat_damage_modifier, description, image_url, craft_cost_tokens) VALUES
('Canhão Laser', 'Arma', 'Comum', 50, 'Arma básica de energia', '/assets/equipment/laser_cannon.png', 100),
('Canhão de Plasma', 'Arma', 'Incomum', 100, 'Arma de plasma mais poderosa', '/assets/equipment/plasma_cannon.png', 250),
('Torpedeiro Quântico', 'Arma', 'Raro', 200, 'Sistema de torpedos quânticos', '/assets/equipment/quantum_torpedo.png', 500),
('Canhão de Antimatéria', 'Arma', 'Épico', 400, 'Arma devastadora de antimatéria', '/assets/equipment/antimatter_cannon.png', 1000),
('Destruidor Estelar', 'Arma', 'Lendário', 800, 'Arma lendária de destruição total', '/assets/equipment/stellar_destroyer.png', 2500);

-- Escudos
INSERT INTO equipment_types (name, category, rarity, shield_modifier, description, image_url, craft_cost_tokens) VALUES
('Escudo Energético', 'Escudo', 'Comum', 50, 'Escudo básico de energia', '/assets/equipment/energy_shield.png', 100),
('Escudo de Plasma', 'Escudo', 'Incomum', 100, 'Escudo de plasma mais resistente', '/assets/equipment/plasma_shield.png', 250),
('Escudo Quântico', 'Escudo', 'Raro', 200, 'Escudo quântico avançado', '/assets/equipment/quantum_shield.png', 500),
('Escudo de Antimatéria', 'Escudo', 'Épico', 400, 'Escudo de antimatéria super resistente', '/assets/equipment/antimatter_shield.png', 1000),
('Escudo Estelar', 'Escudo', 'Lendário', 800, 'Escudo lendário de proteção total', '/assets/equipment/stellar_shield.png', 2500);

-- Motores
INSERT INTO equipment_types (name, category, rarity, speed_modifier, fuel_efficiency_modifier, description, image_url, craft_cost_tokens) VALUES
('Motor Iônico', 'Motor', 'Comum', 25, 10, 'Motor básico de íons', '/assets/equipment/ion_engine.png', 100),
('Motor de Plasma', 'Motor', 'Incomum', 50, 20, 'Motor de plasma mais eficiente', '/assets/equipment/plasma_engine.png', 250),
('Motor Quântico', 'Motor', 'Raro', 100, 40, 'Motor quântico de alta velocidade', '/assets/equipment/quantum_engine.png', 500),
('Motor de Antimatéria', 'Motor', 'Épico', 200, 80, 'Motor de antimatéria super eficiente', '/assets/equipment/antimatter_engine.png', 1000),
('Motor Estelar', 'Motor', 'Lendário', 400, 160, 'Motor lendário de velocidade máxima', '/assets/equipment/stellar_engine.png', 2500);

-- Sensores
INSERT INTO equipment_types (name, category, rarity, mining_efficiency_modifier, description, image_url, craft_cost_tokens) VALUES
('Sensor Básico', 'Sensor', 'Comum', 25, 'Sensor básico de detecção', '/assets/equipment/basic_sensor.png', 100),
('Sensor Avançado', 'Sensor', 'Incomum', 50, 'Sensor avançado de alta precisão', '/assets/equipment/advanced_sensor.png', 250),
('Sensor Quântico', 'Sensor', 'Raro', 100, 'Sensor quântico de detecção total', '/assets/equipment/quantum_sensor.png', 500),
('Sensor de Antimatéria', 'Sensor', 'Épico', 200, 'Sensor de antimatéria super sensível', '/assets/equipment/antimatter_sensor.png', 1000),
('Sensor Estelar', 'Sensor', 'Lendário', 400, 'Sensor lendário de detecção universal', '/assets/equipment/stellar_sensor.png', 2500);

-- Sistemas de Carga
INSERT INTO equipment_types (name, category, rarity, cargo_modifier, description, image_url, craft_cost_tokens) VALUES
('Compartimento Básico', 'Carga', 'Comum', 25, 'Compartimento básico de carga', '/assets/equipment/basic_cargo.png', 100),
('Compartimento Expandido', 'Carga', 'Incomum', 50, 'Compartimento expandido de carga', '/assets/equipment/expanded_cargo.png', 250),
('Compartimento Quântico', 'Carga', 'Raro', 100, 'Compartimento quântico de alta capacidade', '/assets/equipment/quantum_cargo.png', 500),
('Compartimento de Antimatéria', 'Carga', 'Épico', 200, 'Compartimento de antimatéria super espaçoso', '/assets/equipment/antimatter_cargo.png', 1000),
('Compartimento Estelar', 'Carga', 'Lendário', 400, 'Compartimento lendário de capacidade infinita', '/assets/equipment/stellar_cargo.png', 2500);

-- Sistemas de Sobrevivência
INSERT INTO equipment_types (name, category, rarity, oxygen_efficiency_modifier, description, image_url, craft_cost_tokens) VALUES
('Gerador de Oxigênio', 'Sobrevivência', 'Comum', 25, 'Gerador básico de oxigênio', '/assets/equipment/oxygen_generator.png', 100),
('Purificador Avançado', 'Sobrevivência', 'Incomum', 50, 'Purificador avançado de ar', '/assets/equipment/advanced_purifier.png', 250),
('Sistema Quântico', 'Sobrevivência', 'Raro', 100, 'Sistema quântico de suporte vital', '/assets/equipment/quantum_life_support.png', 500),
('Sistema de Antimatéria', 'Sobrevivência', 'Épico', 200, 'Sistema de antimatéria de suporte vital', '/assets/equipment/antimatter_life_support.png', 1000),
('Sistema Estelar', 'Sobrevivência', 'Lendário', 400, 'Sistema lendário de suporte vital eterno', '/assets/equipment/stellar_life_support.png', 2500);

-- =====================================================
-- 3. TRIPULANTES DISPONÍVEIS
-- =====================================================

-- Pilotos
INSERT INTO crew_members (name, specialization, rarity, speed_bonus, description, image_url, hire_cost_tokens) VALUES
('Piloto Novato', 'Piloto', 'Comum', 10, 'Piloto iniciante com habilidades básicas', '/assets/crew/novice_pilot.png', 50),
('Piloto Experiente', 'Piloto', 'Incomum', 25, 'Piloto experiente com habilidades avançadas', '/assets/crew/experienced_pilot.png', 150),
('Piloto Elite', 'Piloto', 'Raro', 50, 'Piloto elite com habilidades excepcionais', '/assets/crew/elite_pilot.png', 400),
('Piloto Lendário', 'Piloto', 'Épico', 100, 'Piloto lendário com habilidades míticas', '/assets/crew/legendary_pilot.png', 1000),
('Piloto Estelar', 'Piloto', 'Lendário', 200, 'Piloto estelar com habilidades divinas', '/assets/crew/stellar_pilot.png', 2500);

-- Engenheiros
INSERT INTO crew_members (name, specialization, rarity, fuel_efficiency_bonus, shield_bonus, description, image_url, hire_cost_tokens) VALUES
('Engenheiro Júnior', 'Engenheiro', 'Comum', 10, 5, 'Engenheiro júnior com conhecimentos básicos', '/assets/crew/junior_engineer.png', 50),
('Engenheiro Sênior', 'Engenheiro', 'Incomum', 25, 15, 'Engenheiro sênior com conhecimentos avançados', '/assets/crew/senior_engineer.png', 150),
('Engenheiro Chefe', 'Engenheiro', 'Raro', 50, 30, 'Engenheiro chefe com conhecimentos excepcionais', '/assets/crew/chief_engineer.png', 400),
('Engenheiro Mestre', 'Engenheiro', 'Épico', 100, 60, 'Engenheiro mestre com conhecimentos míticos', '/assets/crew/master_engineer.png', 1000),
('Engenheiro Estelar', 'Engenheiro', 'Lendário', 200, 120, 'Engenheiro estelar com conhecimentos divinos', '/assets/crew/stellar_engineer.png', 2500);

-- Navegadores
INSERT INTO crew_members (name, specialization, rarity, mining_bonus, description, image_url, hire_cost_tokens) VALUES
('Navegador Iniciante', 'Navegador', 'Comum', 10, 'Navegador iniciante com habilidades básicas', '/assets/crew/beginner_navigator.png', 50),
('Navegador Experiente', 'Navegador', 'Incomum', 25, 'Navegador experiente com habilidades avançadas', '/assets/crew/experienced_navigator.png', 150),
('Navegador Elite', 'Navegador', 'Raro', 50, 'Navegador elite com habilidades excepcionais', '/assets/crew/elite_navigator.png', 400),
('Navegador Lendário', 'Navegador', 'Épico', 100, 'Navegador lendário com habilidades míticas', '/assets/crew/legendary_navigator.png', 1000),
('Navegador Estelar', 'Navegador', 'Lendário', 200, 'Navegador estelar com habilidades divinas', '/assets/crew/stellar_navigator.png', 2500);

-- Médicos
INSERT INTO crew_members (name, specialization, rarity, oxygen_efficiency_bonus, description, image_url, hire_cost_tokens) VALUES
('Médico Júnior', 'Médico', 'Comum', 10, 'Médico júnior com conhecimentos básicos', '/assets/crew/junior_doctor.png', 50),
('Médico Sênior', 'Médico', 'Incomum', 25, 'Médico sênior com conhecimentos avançados', '/assets/crew/senior_doctor.png', 150),
('Médico Chefe', 'Médico', 'Raro', 50, 'Médico chefe com conhecimentos excepcionais', '/assets/crew/chief_doctor.png', 400),
('Médico Mestre', 'Médico', 'Épico', 100, 'Médico mestre com conhecimentos míticos', '/assets/crew/master_doctor.png', 1000),
('Médico Estelar', 'Médico', 'Lendário', 200, 'Médico estelar com conhecimentos divinos', '/assets/crew/stellar_doctor.png', 2500);

-- Mercadores
INSERT INTO crew_members (name, specialization, rarity, cargo_bonus, description, image_url, hire_cost_tokens) VALUES
('Mercador Iniciante', 'Mercador', 'Comum', 10, 'Mercador iniciante com habilidades básicas', '/assets/crew/beginner_merchant.png', 50),
('Mercador Experiente', 'Mercador', 'Incomum', 25, 'Mercador experiente com habilidades avançadas', '/assets/crew/experienced_merchant.png', 150),
('Mercador Elite', 'Mercador', 'Raro', 50, 'Mercador elite com habilidades excepcionais', '/assets/crew/elite_merchant.png', 400),
('Mercador Lendário', 'Mercador', 'Épico', 100, 'Mercador lendário com habilidades míticas', '/assets/crew/legendary_merchant.png', 1000),
('Mercador Estelar', 'Mercador', 'Lendário', 200, 'Mercador estelar com habilidades divinas', '/assets/crew/stellar_merchant.png', 2500);

-- =====================================================
-- 4. RECEITAS DE CRAFT
-- =====================================================

-- Receitas de Armas
INSERT INTO craft_recipes (result_item_type, result_item_id, result_quantity, required_resources, required_tokens, name, description, difficulty_level, craft_time_seconds) VALUES
('equipment', (SELECT id FROM equipment_types WHERE name = 'Canhão Laser'), 1, '{"Ferro": 10, "Cobre": 5}', 100, 'Craft Canhão Laser', 'Cria um canhão laser básico', 1, 60),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Canhão de Plasma'), 1, '{"Alumínio": 15, "Cobre": 10, "Hidrogênio": 5}', 250, 'Craft Canhão de Plasma', 'Cria um canhão de plasma avançado', 2, 120),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Torpedeiro Quântico'), 1, '{"Titânio": 20, "Alumínio": 15, "Deutério": 10}', 500, 'Craft Torpedeiro Quântico', 'Cria um torpedeiro quântico', 3, 180),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Canhão de Antimatéria'), 1, '{"Platina": 25, "Titânio": 20, "Antimatéria": 15}', 1000, 'Craft Canhão de Antimatéria', 'Cria um canhão de antimatéria', 4, 300),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Destruidor Estelar'), 1, '{"Cristal de Energia": 30, "Platina": 25, "Cristal de Poder": 20}', 2500, 'Craft Destruidor Estelar', 'Cria um destruidor estelar lendário', 5, 600);

-- Receitas de Escudos
INSERT INTO craft_recipes (result_item_type, result_item_id, result_quantity, required_resources, required_tokens, name, description, difficulty_level, craft_time_seconds) VALUES
('equipment', (SELECT id FROM equipment_types WHERE name = 'Escudo Energético'), 1, '{"Ferro": 8, "Cobre": 12}', 100, 'Craft Escudo Energético', 'Cria um escudo energético básico', 1, 60),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Escudo de Plasma'), 1, '{"Alumínio": 12, "Cobre": 8, "Hidrogênio": 8}', 250, 'Craft Escudo de Plasma', 'Cria um escudo de plasma avançado', 2, 120),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Escudo Quântico'), 1, '{"Titânio": 18, "Alumínio": 12, "Deutério": 8}', 500, 'Craft Escudo Quântico', 'Cria um escudo quântico', 3, 180),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Escudo de Antimatéria'), 1, '{"Platina": 22, "Titânio": 18, "Antimatéria": 12}', 1000, 'Craft Escudo de Antimatéria', 'Cria um escudo de antimatéria', 4, 300),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Escudo Estelar'), 1, '{"Cristal de Energia": 28, "Platina": 22, "Cristal de Poder": 18}', 2500, 'Craft Escudo Estelar', 'Cria um escudo estelar lendário', 5, 600);

-- Receitas de Motores
INSERT INTO craft_recipes (result_item_type, result_item_id, result_quantity, required_resources, required_tokens, name, description, difficulty_level, craft_time_seconds) VALUES
('equipment', (SELECT id FROM equipment_types WHERE name = 'Motor Iônico'), 1, '{"Ferro": 6, "Cobre": 10, "Hidrogênio": 8}', 100, 'Craft Motor Iônico', 'Cria um motor iônico básico', 1, 60),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Motor de Plasma'), 1, '{"Alumínio": 10, "Cobre": 6, "Deutério": 10}', 250, 'Craft Motor de Plasma', 'Cria um motor de plasma avançado', 2, 120),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Motor Quântico'), 1, '{"Titânio": 15, "Alumínio": 10, "Antimatéria": 8}', 500, 'Craft Motor Quântico', 'Cria um motor quântico', 3, 180),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Motor de Antimatéria'), 1, '{"Platina": 20, "Titânio": 15, "Cristal de Poder": 10}', 1000, 'Craft Motor de Antimatéria', 'Cria um motor de antimatéria', 4, 300),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Motor Estelar'), 1, '{"Cristal de Energia": 25, "Platina": 20, "Cristal de Poder": 15}', 2500, 'Craft Motor Estelar', 'Cria um motor estelar lendário', 5, 600);

-- Receitas de Sensores
INSERT INTO craft_recipes (result_item_type, result_item_id, result_quantity, required_resources, required_tokens, name, description, difficulty_level, craft_time_seconds) VALUES
('equipment', (SELECT id FROM equipment_types WHERE name = 'Sensor Básico'), 1, '{"Ferro": 4, "Cobre": 8}', 100, 'Craft Sensor Básico', 'Cria um sensor básico', 1, 60),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Sensor Avançado'), 1, '{"Alumínio": 8, "Cobre": 4, "Hidrogênio": 6}', 250, 'Craft Sensor Avançado', 'Cria um sensor avançado', 2, 120),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Sensor Quântico'), 1, '{"Titânio": 12, "Alumínio": 8, "Deutério": 6}', 500, 'Craft Sensor Quântico', 'Cria um sensor quântico', 3, 180),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Sensor de Antimatéria'), 1, '{"Platina": 16, "Titânio": 12, "Antimatéria": 8}', 1000, 'Craft Sensor de Antimatéria', 'Cria um sensor de antimatéria', 4, 300),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Sensor Estelar'), 1, '{"Cristal de Energia": 20, "Platina": 16, "Cristal de Poder": 12}', 2500, 'Craft Sensor Estelar', 'Cria um sensor estelar lendário', 5, 600);

-- Receitas de Sistemas de Carga
INSERT INTO craft_recipes (result_item_type, result_item_id, result_quantity, required_resources, required_tokens, name, description, difficulty_level, craft_time_seconds) VALUES
('equipment', (SELECT id FROM equipment_types WHERE name = 'Compartimento Básico'), 1, '{"Ferro": 12, "Alumínio": 4}', 100, 'Craft Compartimento Básico', 'Cria um compartimento básico de carga', 1, 60),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Compartimento Expandido'), 1, '{"Alumínio": 8, "Titânio": 6, "Cobre": 4}', 250, 'Craft Compartimento Expandido', 'Cria um compartimento expandido de carga', 2, 120),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Compartimento Quântico'), 1, '{"Titânio": 10, "Platina": 8, "Alumínio": 6}', 500, 'Craft Compartimento Quântico', 'Cria um compartimento quântico de carga', 3, 180),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Compartimento de Antimatéria'), 1, '{"Platina": 14, "Cristal de Energia": 10, "Titânio": 8}', 1000, 'Craft Compartimento de Antimatéria', 'Cria um compartimento de antimatéria', 4, 300),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Compartimento Estelar'), 1, '{"Cristal de Energia": 18, "Cristal de Poder": 14, "Platina": 10}', 2500, 'Craft Compartimento Estelar', 'Cria um compartimento estelar lendário', 5, 600);

-- Receitas de Sistemas de Sobrevivência
INSERT INTO craft_recipes (result_item_type, result_item_id, result_quantity, required_resources, required_tokens, name, description, difficulty_level, craft_time_seconds) VALUES
('equipment', (SELECT id FROM equipment_types WHERE name = 'Gerador de Oxigênio'), 1, '{"Ferro": 6, "Cobre": 8, "Oxigênio Líquido": 10}', 100, 'Craft Gerador de Oxigênio', 'Cria um gerador básico de oxigênio', 1, 60),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Purificador Avançado'), 1, '{"Alumínio": 8, "Cobre": 4, "Oxigênio Comprimido": 12}', 250, 'Craft Purificador Avançado', 'Cria um purificador avançado de ar', 2, 120),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Sistema Quântico'), 1, '{"Titânio": 10, "Alumínio": 6, "Cristal de Ar": 8}', 500, 'Craft Sistema Quântico', 'Cria um sistema quântico de suporte vital', 3, 180),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Sistema de Antimatéria'), 1, '{"Platina": 12, "Titânio": 8, "Cristal de Ar": 10}', 1000, 'Craft Sistema de Antimatéria', 'Cria um sistema de antimatéria de suporte vital', 4, 300),
('equipment', (SELECT id FROM equipment_types WHERE name = 'Sistema Estelar'), 1, '{"Cristal de Energia": 16, "Platina": 12, "Cristal de Ar": 14}', 2500, 'Craft Sistema Estelar', 'Cria um sistema estelar de suporte vital eterno', 5, 600);

-- =====================================================
-- 5. ACHIEVEMENTS
-- =====================================================

-- Achievements de Exploração
INSERT INTO achievements (name, description, category, rarity, criteria, reward_tokens, reward_resources, icon_url) VALUES
('Primeiro Passo', 'Descubra seu primeiro planeta', 'Exploração', 'Comum', '{"planets_discovered": 1}', 50, '{"Ferro": 10}', '/assets/achievements/first_step.png'),
('Explorador Iniciante', 'Descubra 10 planetas', 'Exploração', 'Incomum', '{"planets_discovered": 10}', 150, '{"Alumínio": 20}', '/assets/achievements/beginner_explorer.png'),
('Explorador Experiente', 'Descubra 50 planetas', 'Exploração', 'Raro', '{"planets_discovered": 50}', 400, '{"Titânio": 30}', '/assets/achievements/experienced_explorer.png'),
('Explorador Elite', 'Descubra 100 planetas', 'Exploração', 'Épico', '{"planets_discovered": 100}', 1000, '{"Platina": 40}', '/assets/achievements/elite_explorer.png'),
('Explorador Lendário', 'Descubra 500 planetas', 'Exploração', 'Lendário', '{"planets_discovered": 500}', 2500, '{"Cristal de Energia": 50}', '/assets/achievements/legendary_explorer.png');

-- Achievements de Mineração
INSERT INTO achievements (name, description, category, rarity, criteria, reward_tokens, reward_resources, icon_url) VALUES
('Primeira Mineração', 'Complete sua primeira sessão de mineração', 'Mineração', 'Comum', '{"mining_sessions": 1}', 50, '{"Ferro": 15}', '/assets/achievements/first_mining.png'),
('Minerador Iniciante', 'Complete 25 sessões de mineração', 'Mineração', 'Incomum', '{"mining_sessions": 25}', 150, '{"Alumínio": 25}', '/assets/achievements/beginner_miner.png'),
('Minerador Experiente', 'Complete 100 sessões de mineração', 'Mineração', 'Raro', '{"mining_sessions": 100}', 400, '{"Titânio": 35}', '/assets/achievements/experienced_miner.png'),
('Minerador Elite', 'Complete 500 sessões de mineração', 'Mineração', 'Épico', '{"mining_sessions": 500}', 1000, '{"Platina": 45}', '/assets/achievements/elite_miner.png'),
('Minerador Lendário', 'Complete 1000 sessões de mineração', 'Mineração', 'Lendário', '{"mining_sessions": 1000}', 2500, '{"Cristal de Energia": 55}', '/assets/achievements/legendary_miner.png');

-- Achievements de Combate
INSERT INTO achievements (name, description, category, rarity, criteria, reward_tokens, reward_resources, icon_url) VALUES
('Primeiro Combate', 'Participe de seu primeiro combate PvP', 'Combate', 'Comum', '{"battles": 1}', 50, '{"Mísseis Básicos": 5}', '/assets/achievements/first_battle.png'),
('Guerreiro Iniciante', 'Vença 10 combates PvP', 'Combate', 'Incomum', '{"battles_won": 10}', 150, '{"Mísseis Guiados": 10}', '/assets/achievements/beginner_warrior.png'),
('Guerreiro Experiente', 'Vença 50 combates PvP', 'Combate', 'Raro', '{"battles_won": 50}', 400, '{"Mísseis Energéticos": 15}', '/assets/achievements/experienced_warrior.png'),
('Guerreiro Elite', 'Vença 200 combates PvP', 'Combate', 'Épico', '{"battles_won": 200}', 1000, '{"Torpedos de Plasma": 20}', '/assets/achievements/elite_warrior.png'),
('Guerreiro Lendário', 'Vença 500 combates PvP', 'Combate', 'Lendário', '{"battles_won": 500}', 2500, '{"Cristal Espacial": 25}', '/assets/achievements/legendary_warrior.png');

-- Achievements de Craft
INSERT INTO achievements (name, description, category, rarity, criteria, reward_tokens, reward_resources, icon_url) VALUES
('Primeiro Craft', 'Crie seu primeiro item', 'Craft', 'Comum', '{"items_crafted": 1}', 50, '{"Ferro": 20}', '/assets/achievements/first_craft.png'),
('Artífice Iniciante', 'Crie 25 itens', 'Craft', 'Incomum', '{"items_crafted": 25}', 150, '{"Alumínio": 30}', '/assets/achievements/beginner_crafter.png'),
('Artífice Experiente', 'Crie 100 itens', 'Craft', 'Raro', '{"items_crafted": 100}', 400, '{"Titânio": 40}', '/assets/achievements/experienced_crafter.png'),
('Artífice Elite', 'Crie 500 itens', 'Craft', 'Épico', '{"items_crafted": 500}', 1000, '{"Platina": 50}', '/assets/achievements/elite_crafter.png'),
('Artífice Lendário', 'Crie 1000 itens', 'Craft', 'Lendário', '{"items_crafted": 1000}', 2500, '{"Cristal de Energia": 60}', '/assets/achievements/legendary_crafter.png');

-- Achievements de Economia
INSERT INTO achievements (name, description, category, rarity, criteria, reward_tokens, reward_resources, icon_url) VALUES
('Primeiros Tokens', 'Ganhe seus primeiros 100 tokens', 'Economia', 'Comum', '{"tokens_earned": 100}', 50, '{"Ferro": 25}', '/assets/achievements/first_tokens.png'),
('Comerciante Iniciante', 'Ganhe 1000 tokens', 'Economia', 'Incomum', '{"tokens_earned": 1000}', 150, '{"Alumínio": 35}', '/assets/achievements/beginner_merchant.png'),
('Comerciante Experiente', 'Ganhe 10000 tokens', 'Economia', 'Raro', '{"tokens_earned": 10000}', 400, '{"Titânio": 45}', '/assets/achievements/experienced_merchant.png'),
('Comerciante Elite', 'Ganhe 100000 tokens', 'Economia', 'Épico', '{"tokens_earned": 100000}', 1000, '{"Platina": 55}', '/assets/achievements/elite_merchant.png'),
('Comerciante Lendário', 'Ganhe 1000000 tokens', 'Economia', 'Lendário', '{"tokens_earned": 1000000}', 2500, '{"Cristal de Energia": 65}', '/assets/achievements/legendary_merchant.png');

-- =====================================================
-- 6. PLANETAS INICIAIS (EXEMPLO)
-- =====================================================

-- Planetas comuns para começar
INSERT INTO discovered_planets (planet_id, name, planet_type, rarity, coordinate_x, coordinate_y, available_resources, mining_difficulty, description, image_url) VALUES
('planet_001', 'Terra Nova', 'Rochoso', 'Comum', 0, 0, '{"Ferro": 100, "Cobre": 50, "Hidrogênio": 75}', 3, 'Planeta rochoso com recursos básicos', '/assets/planets/rocky_planet_01.png'),
('planet_002', 'Aqua Prime', 'Gelado', 'Comum', 100, 0, '{"Oxigênio Líquido": 80, "Hidrogênio": 60, "Ferro": 40}', 4, 'Planeta gelado rico em oxigênio', '/assets/planets/icy_planet_01.png'),
('planet_003', 'Deserto Vermelho', 'Deserto', 'Incomum', 0, 100, '{"Alumínio": 70, "Cobre": 45, "Deutério": 30}', 5, 'Deserto vermelho com metais raros', '/assets/planets/desert_planet_01.png'),
('planet_004', 'Nebulosa Cristal', 'Cristalino', 'Raro', 100, 100, '{"Titânio": 50, "Cristal de Energia": 20, "Antimatéria": 15}', 7, 'Nebulosa cristalina com recursos avançados', '/assets/planets/crystal_planet_01.png'),
('planet_005', 'Vórtice Estelar', 'Gasoso', 'Épico', 200, 200, '{"Platina": 30, "Cristal de Poder": 15, "Essência Estelar": 10}', 9, 'Vórtice estelar com recursos épicos', '/assets/planets/gas_planet_01.png');

-- =====================================================
-- 7. CONFIGURAÇÕES DO SISTEMA
-- =====================================================

-- Inserir configurações padrão do sistema
INSERT INTO system_logs (log_level, component, message, data) VALUES
('INFO', 'system', 'Banco de dados inicializado', '{"version": "1.0", "date": "2025-01-01"}'),
('INFO', 'system', 'Dados iniciais carregados', '{"resources": 20, "equipment": 30, "crew": 25, "recipes": 30, "achievements": 25}');

-- =====================================================
-- FIM DOS DADOS INICIAIS
-- =====================================================

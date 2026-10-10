-- ==============================================================================
-- DME · DIVISÃO DE MONITORAMENTO ELETRÔNICO
-- MIGRATION: 20251008000002_seed_initial_data.sql
-- DESCRIÇÃO: Carga inicial de operadores e monitorados para o banco de dados DME
-- COMPATIBILIDADE: PostgreSQL 14+ / Supabase
-- ==============================================================================

-- 1. Operadores Oficiais do Sistema DME
INSERT INTO public.usuarios_operadores (id, nome, matricula, cargo, perfil_acesso, lotacao, email)
VALUES
    ('usr-001', 'Inspetor Rogério Medeiros', 'DME-8841', 'Supervisor Tático de Monitoramento', 'ADMIN', 'DME Central - Núcleo de Comando Operacional', 'rogerio.medeiros@dme.seguranca.gov.br'),
    ('usr-002', 'Policial Penal Carla Vasconcelos', 'DME-5120', 'Operadora de Monitoramento - Plantão Alpha', 'OPERADOR_PLANTAO', 'DME Central - Sala de Situação e Telemetria', 'carla.vasconcelos@dme.seguranca.gov.br'),
    ('usr-003', 'Agente Marcos Aurelio Dias', 'DME-3307', 'Analista de Inteligência e Recapturas', 'SUPERVISOR', 'DME - Núcleo de Fugas & Recaptura', 'marcos.dias@dme.seguranca.gov.br')
ON CONFLICT (matricula) DO NOTHING;

-- 2. Cadastro de Monitorados Iniciais (Carlos Eduardo e Mariana Duarte)
INSERT INTO public.individuos_monitorados (
    id,
    nome_completo,
    cpf,
    data_nascimento,
    genero,
    foto_url,
    perfil,
    status,
    numero_processo,
    vara_judicial,
    comarca,
    tipo_penal,
    resumo_tipificacao,
    numero_tornozeleira_ou_receptor,
    imei_dispositivo,
    raio_exclusao_metros,
    individuo_vinculado_id,
    nome_individuo_vinculado,
    data_primeira_entrada,
    endereco_residencial,
    cidade,
    estado,
    telefone_contato,
    contato_emergencia,
    observacoes_gerais
)
VALUES
    (
        'mon-001',
        'Carlos Eduardo Silveira Santos',
        '384.921.847-02',
        '1996-04-14',
        'MASCULINO',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        'AGRESSOR',
        'ATIVO',
        '0012489-32.2024.8.26.0100',
        '1ª Vara de Violência Doméstica e Familiar',
        'Comarca Central',
        'Art. 129, § 9º - Lesão Corporal (Violência Doméstica)',
        'Descumprimento de ordem de afastamento e agressão física no ambiente doméstico.',
        'TX-98421',
        '864291048291032',
        500,
        'mon-002',
        'Mariana Duarte Souza',
        '2024-02-10T09:30:00Z',
        'Rua das Palmeiras, 412, Bairro Alvorada',
        'São Paulo',
        'SP',
        '(11) 98412-4401',
        '(11) 97112-9988 (Mãe)',
        'Perímetro residencial fixado das 20h às 06h. Proibição absoluta de aproximação da vítima.'
    ),
    (
        'mon-002',
        'Mariana Duarte Souza',
        '419.823.110-85',
        '1998-08-22',
        'FEMININO',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
        'VITIMA_PROTEGIDA',
        'ATIVO',
        '0012489-32.2024.8.26.0100',
        '1ª Vara de Violência Doméstica e Familiar',
        'Comarca Central',
        'Vítima de Art. 129, § 9º c/c Lei Maria da Penha (Lei 11.340/06)',
        'Concessão de Unidade Portátil de Proteção à Vítima (Botão do Pânico e Alerta de Aproximação).',
        'RX-BOT-4019',
        '359102849182390',
        500,
        'mon-001',
        'Carlos Eduardo Silveira Santos',
        '2024-02-10T11:00:00Z',
        'Av. Brasil Central, 1205, Apto 42',
        'São Paulo',
        'SP',
        '(11) 99120-4491',
        '(11) 98841-2299 (Irmã - Juliana)',
        'Vítima orientada quanto ao acionamento do botão do pânico e perímetro de segurança de 500m.'
    ),
    (
        'mon-003',
        'Rodrigo Mendes Nogueira',
        '219.043.518-33',
        '1991-11-03',
        'MASCULINO',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        'MONITORADO_GERAL',
        'FORAGIDO',
        '0084321-19.2023.8.26.0050',
        '2ª Vara de Execuções Penais',
        'Comarca Central',
        'Art. 157, § 2º - Roubo Majorado',
        'Progressão de regime semiaberto com uso de tornozeleira eletrônica.',
        'TX-44109',
        '860192847162940',
        0,
        NULL,
        NULL,
        '2023-11-15T14:00:00Z',
        'Rua General Osório, 880, Zona Leste',
        'São Paulo',
        'SP',
        '(11) 97723-1100',
        '(11) 98112-0044 (Esposa)',
        'ALERTA: Violação deliberada de cinta detectada pela telemetria DME. Mandado de prisão expedido.'
    )
ON CONFLICT (cpf) DO NOTHING;

-- 3. Movimentações Iniciais
INSERT INTO public.movimentacoes (
    id,
    individuo_id,
    tipo,
    data_hora,
    motivo,
    motivo_detalhado,
    responsavel_operacional,
    numero_oficio_ou_mandado,
    observacoes
)
VALUES
    (
        'mov-101',
        'mon-001',
        'ENTRADA',
        '2024-02-10T09:30:00Z',
        'INSTALACAO_INICIAL',
        'Instalação de tornozeleira eletrônica em audiência de custódia com imposição de medidas protetivas.',
        'Agente Paulo Ferreira - Matr. 4921',
        'MAND-PROT-2024/091',
        'Dispositivo ativado com sinal GPS 100% calibrado.'
    ),
    (
        'mov-102',
        'mon-002',
        'ENTRADA',
        '2024-02-10T11:00:00Z',
        'MEDIDA_PROTETIVA_CONCEDIDA',
        'Entrega do receptor de alerta portátil à vítima e parametrização do raio de aproximação de 500m.',
        'Inspetora Camila Ramos - Matr. 5812',
        'DEC-JUD-2024/110',
        'Equipamento testado com simulação de proximidade com sucesso.'
    ),
    (
        'mov-103',
        'mon-003',
        'ENTRADA',
        '2023-11-15T14:00:00Z',
        'INSTALACAO_INICIAL',
        'Instalação para cumprimento de regime semiaberto harmonizado.',
        'Agente Roberto Cruz - Matr. 3190',
        'OF-VEP-8842/23',
        'Orientado sobre as regras de recolhimento noturno.'
    ),
    (
        'mov-104',
        'mon-003',
        'SAIDA',
        '2024-03-02T22:45:00Z',
        'FUGA_ROMPIMENTO',
        'Rompimento mecânico da cinta da tornozeleira eletrônica confirmado pela telemetria.',
        'Plantão Tático DME - Inspetor Medeiros',
        'ALERTA-DME-2024/048',
        'Comunicação imediata à Polícia Militar e inserção no BNMP.'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Registro de Fugas
INSERT INTO public.fugas (
    id,
    individuo_id,
    data_hora_fuga,
    local_fuga,
    coordenadas_aproximadas,
    circunstancias,
    status_fuga,
    mandado_prisao_numero,
    orgao_comunicado,
    observacoes
)
VALUES
    (
        'fuga-201',
        'mon-003',
        '2024-03-02T22:45:00Z',
        'Av. Marginal Tietê, próximo à Ponte das Bandeiras',
        '-23.51892, -46.62931',
        'Disparo de alarme de rompimento de cinta de fibra ótica. Última localização transmitida às 22h44min.',
        'FORAGIDO',
        'MAND-REC-2024-9921',
        ARRAY['Polícia Militar (COPOM)', 'Polícia Civil (DEIC)', 'Vara de Execuções Penais'],
        'Equipe de diligência encontrou o dispositivo danificado no canteiro central.'
    )
ON CONFLICT (id) DO NOTHING;

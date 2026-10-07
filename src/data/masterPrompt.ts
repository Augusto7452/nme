export const MASTER_PROMPT_TEXT = `## PROMPT MESTRE DE ENGENHARIA DE SOFTWARE
### SISTEMA INTEGRADO DE MONITORAMENTO ELETRÔNICO (CMEP / SIME)

Atue como Arquiteto de Software e Desenvolvedor Full-Stack Sênior especializado em sistemas judiciais, segurança pública e telemetria penitenciária. Sua missão é projetar e implementar um Sistema Completo de Monitoramento Eletrônico (Tornozeleira Eletrônica, Botão do Pânico e Central Integrada de Medidas Cautelares).

---

### 1. OBJETIVO GERAL DO SISTEMA
Construir uma aplicação robusta, segura e institucional para gestão operacional de monitoramento eletrônico de pessoas, garantindo conformidade com a Lei de Execução Penal (Lei 7.210/1984), Código de Processo Penal (Art. 319, IX) e Resolução nº 412/2021 do CNJ. O sistema deve registrar com precisão:
- Entradas e saídas de monitorados em geral;
- Entradas e saídas específicas de vítimas protegidas (botão do pânico / unidade receptora) e agressores vinculados (Lei Maria da Penha);
- Estratificação demográfica automática por Faixa Etária (18-24, 25-34, 35-49, 50-64, 65+ anos);
- Cadastro jurídico completo: Tipo Penal que está respondendo, Número do Processo (padrão CNJ), Vara, Comarca e Circunstâncias;
- Módulo tático de Registro de Fuga / Rompimento de Tornozeleira / Evasão: data e hora exatas da fuga, local/área da ocorrência, histórico de violações, status de recaptura e difusão de alerta para forças policiais;
- Captura e gerenciamento de Foto de Identificação Penal do monitorado em alta resolução.

---

### 2. REQUISITOS FUNCIONAIS DETALHADOS

#### MÓDULO 1: GESTÃO DE ENTRADAS E SAÍDAS (LIVRO ELETRÔNICO)
1. **Registro de Entrada**:
   - Data e hora precisas da instalação/ativação do dispositivo;
   - Tipo de entrada: Instalação Inicial, Medida Protetiva Concedida, Retorno por Recaptura, Transferência de Comarca, Substituição de Tornozeleira;
   - Número de série da tornozeleira (TX) ou receptor de vítima (RX), IMEI e operadora do chip de dados;
   - Identificação do agente/operador responsável pela instalação e número do ofício judicial/mandado.
2. **Registro de Saída**:
   - Data e hora precisas da desativação/desligamento;
   - Motivo da saída: Extinção de Pena, Revogação de Medida Cautelar, Fuga / Rompimento de Cinta, Transferência para outra unidade, Regressão de Regime (fechado), Desligamento Voluntário de Vítima, Óbito;
   - Emissão de Termo de Desligamento / Devolução de Equipamento com checklist do estado do aparelho.

#### MÓDULO 2: DISTINÇÃO ESTRUTURADA DE PERFIS (VÍTIMAS, AGRESSORES E MONITORADOS)
1. **Monitorado Geral**:
   - Preso provisório (cautelar Art. 319 CPP), condenado em regime semiaberto harmonizado ou prisão domiciliar.
2. **Par Agressor & Vítima Protegida (Lei Maria da Penha - Lei 11.340/2006)**:
   - Registro espelhado: vincular o agressor à ficha da vítima e vice-versa;
   - Definição do Raio de Exclusão em metros (ex: 500 metros) e zona de exclusão dinâmica;
   - Registro independente de entrada e saída tanto para a vítima (entrega do botão do pânico/app protetivo) quanto para o agressor (instalação da tornozeleira);
   - Notificações de proximidade e protocolo de acionamento imediato das viaturas da Patrulha Maria da Penha / Polícia Militar.

#### MÓDULO 3: CLASSIFICAÇÃO DEMOGRÁFICA E FAIXA ETÁRIA
1. Cálculo dinâmico e inalterável da idade a partir da Data de Nascimento;
2. Agrupamento obrigatório nas seguintes faixas etárias:
   - 18 a 24 anos (Jovens adultos);
   - 25 a 34 anos;
   - 35 a 49 anos;
   - 50 a 64 anos;
   - 65 anos ou mais (Idosos / Prisão domiciliar humanitária);
3. Dashboard estatístico com percentuais de monitorados, vítimas e agressores distribuídos por faixa etária, com filtros instantâneos.

#### MÓDULO 4: CADASTRO JURÍDICO (TIPO PENAL E NÚMERO DO PROCESSO)
1. **Tipo Penal**:
   - Seletor com tipificações do Código Penal Brasileiro e Legislação Extravagante (ex: Art. 121 - Homicídio; Art. 129, § 9º/13º - Lesão Corporal / Violência Doméstica; Art. 147 - Ameaça; Art. 155 - Furto; Art. 157 - Roubo; Art. 33 - Tráfico de Drogas; Art. 217-A - Estupro de Vulnerável; Art. 24-A - Descumprimento de Medida Protetiva; Art. 16 - Estatuto do Desarmamento; Art. 180 - Receptação);
   - Campo para detalhamento da imputação e resumo dos fatos.
2. **Processo Judicial**:
   - Campo com máscara oficial do CNJ: \`NNNNNNN-DD.AAAA.J.TR.OOOO\` (20 dígitos);
   - Vara Judicial de origem (ex: 1ª Vara de Execuções Criminais, 2ª Vara de Violência Doméstica);
   - Comarca e Estado (UF).

#### MÓDULO 5: GESTÃO TÁTICA DE FUGAS E EVASÕES
1. **Registro da Fuga**:
   - Data e hora exatas da ocorrência do alarme/rompimento;
   - **Local da Fuga**: Endereço completo, bairro, ponto de referência e/ou coordenadas GPS aproximadas da última posição válida emitida pelo modem;
   - **Circunstâncias**: Tipo de violação (corte de cinta de fibra ótica, descarga forçada de bateria, abertura do case, rompimento mecânico, evasão do perímetro de recolhimento);
   - **Status da Fuga**: Foragido Ativo, Recapturado, Em Diligência de Localização, Mandado de Prisão Expedido;
   - **Órgãos Comunicados**: Registro de acionamento do COPOM (190), Delegacia de Capturas (Polícia Civil) e Vara de Execuções.
2. **Ficha de Alerta de Fuga (Boletim de Difusão Rápida)**:
   - Geração de ficha pronta para impressão e envio aos policiais em campo contendo foto nítida do foragido, nome, CPF, número do processo, tipo penal, local onde rompeu a tornozeleira e data/hora da fuga.

#### MÓDULO 6: GESTÃO DA FOTO DO MONITORADO
1. Foto frontal tipo passaporte / identificação penal;
2. Suporte a upload de arquivo de imagem (JPEG, PNG, WebP) e suporte a captura direta via webcam;
3. Exibição da foto em destaque na listagem geral, no perfil individual e no alerta de fuga;
4. Respeito à LGPD e segurança da custódia visual dos registros.

---

### 3. ARQUITETURA TÉCNICA SUGERIDA
- **Frontend**: React 19 + TypeScript, Tailwind CSS, Lucide Icons, Motion (animações suaves);
- **Design System**: Modo escuro institucional (Slate 950 / Slate 900), hierarquia tipográfica com Plus Jakarta Sans e JetBrains Mono (para números de processo e códigos IMEI);
- **Persistência**: Local-first com LocalStorage para prototipação / offline ou Firestore / Cloud SQL para ambiente de produção;
- **Relatórios**: Suporte nativo a impressão limpa (@media print) para fichas de mandados, relatórios estatísticos e termos de entrega de tornozeleira.

---

Execute esta especificação criando interfaces elegantes, responsivas, sem dead clicks e com dados realistas prontos para uso operacional.`;

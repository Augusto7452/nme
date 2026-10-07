import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndividuoMonitorado, FaixaEtaria } from '../types/monitoring';
import {
  calcularIdade,
  obterFaixaEtaria,
  rotuloFaixaEtaria,
  formatarDataHora,
  formatarData,
  rotuloPerfil,
  rotuloStatus,
} from './ageUtils';

export function gerarRelatorioPDF(
  abaAtiva: 'todos' | 'movimentacoes' | 'vitimas_agressores' | 'fugas' | 'faixas_etarias' | 'prompt_mestre',
  individuos: IndividuoMonitorado[],
  filtrosInfo?: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const agora = new Date();
  const dataHoraEmissao = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(agora);

  // Helper para Cabeçalho Institucional
  const renderCabecalho = (titulo: string, subtitulo: string) => {
    // Faixa superior institucional
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 24, 'F');

    // Linha dourada/âmbar de destaque
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 23, 297, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('DME · DIVISÃO DE MONITORAMENTO ELETRÔNICO', 14, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('SECRETARIA DE ADMINISTRAÇÃO PENITENCIÁRIA & SEGURANÇA PÚBLICA · LEI 7.210/84 & RES. CNJ 412/21', 14, 16);

    // Data/hora e autenticador à direita
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240);
    doc.text(`Emissão: ${dataHoraEmissao}`, 283, 10, { align: 'right' });
    doc.text(`Ambiente: Sistema Integrado DME`, 283, 16, { align: 'right' });

    // Título do Relatório
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(titulo, 14, 33);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(subtitulo, 14, 38);

    if (filtrosInfo) {
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Filtros Aplicados: ${filtrosInfo}`, 14, 43);
    }
  };

  // Helper para Rodapé
  const renderRodape = () => {
    const totalPaginas = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.line(14, 198, 283, 198);
      doc.text(
        'Documento operacional e confidencial gerado pela Divisão de Monitoramento Eletrônico (DME). Uso restrito e oficial.',
        14,
        203
      );
      doc.text(`Página ${i} de ${totalPaginas}`, 283, 203, { align: 'right' });
    }
  };

  // 1. RELATÓRIO DE FUGAS & EVASÕES (se aba 'fugas')
  if (abaAtiva === 'fugas') {
    renderCabecalho(
      'RELATÓRIO OFICIAL DE EVASÕES & ROMPIMENTOS DE TORNOZELEIRA',
      'Relação de ocorrências de fuga, circunstâncias de rompimento e dados para mandado de recaptura'
    );

    const todasFugas = individuos.flatMap((ind) =>
      ind.fugas.map((fuga) => ({
        fuga,
        individuo: ind,
      }))
    );

    todasFugas.sort(
      (a, b) => new Date(b.fuga.dataHoraFuga).getTime() - new Date(a.fuga.dataHoraFuga).getTime()
    );

    const head = [
      ['Status', 'Foragido / Nome', 'CPF', 'Idade', 'Processo Judicial', 'Tipo Penal', 'Data da Fuga', 'Local da Fuga', 'Mandado Nº'],
    ];

    const body = todasFugas.map(({ fuga, individuo }) => {
      const idade = calcularIdade(individuo.dataNascimento);
      return [
        fuga.statusFuga,
        individuo.nomeCompleto,
        individuo.cpf,
        `${idade} anos`,
        individuo.numeroProcesso,
        individuo.tipoPenal,
        formatarDataHora(fuga.dataHoraFuga),
        fuga.localFuga,
        fuga.mandadoPrisaoNumero || 'PENDENTE',
      ];
    });

    autoTable(doc, {
      head,
      body,
      startY: 46,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
      },
      headStyles: {
        fillColor: [185, 28, 28], // red-700
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242], // red-50
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 24 },
        1: { cellWidth: 42, fontStyle: 'bold' },
        2: { cellWidth: 26 },
        3: { cellWidth: 16 },
        4: { cellWidth: 38 },
        5: { cellWidth: 42 },
        6: { cellWidth: 26 },
        7: { cellWidth: 40 },
        8: { cellWidth: 22 },
      },
    });

    renderRodape();
    doc.save(`relatorio-fugas-evasoes-dme-${Date.now()}.pdf`);
    return;
  }

  // 2. LIVRO DE ENTRADAS & SAÍDAS (se aba 'movimentacoes')
  if (abaAtiva === 'movimentacoes') {
    renderCabecalho(
      'LIVRO ELETRÔNICO DE REGISTRO DE ENTRADAS & SAÍDAS',
      'Histórico cronológico de ativações, acolhimentos, desativações, revogações e evasões'
    );

    const todasMovimentacoes = individuos.flatMap((ind) =>
      ind.movimentacoes.map((mov) => ({
        ...mov,
        individuo: ind,
      }))
    );

    todasMovimentacoes.sort(
      (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
    );

    const head = [
      ['Tipo', 'Data / Hora', 'Nome Completo', 'CPF', 'Perfil', 'Processo CNJ', 'Motivo Legal', 'Detalhamento dos Fatos', 'Responsável'],
    ];

    const body = todasMovimentacoes.map((m) => [
      m.tipo,
      formatarDataHora(m.dataHora),
      m.individuo.nomeCompleto,
      m.individuo.cpf,
      rotuloPerfil(m.individuo.perfil),
      m.individuo.numeroProcesso,
      m.motivo,
      m.motivoDetalhado,
      m.responsavelOperacional,
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 46,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
      },
      headStyles: {
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // slate-50
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 18 },
        1: { cellWidth: 26 },
        2: { cellWidth: 38, fontStyle: 'bold' },
        3: { cellWidth: 24 },
        4: { cellWidth: 28 },
        5: { cellWidth: 34 },
        6: { cellWidth: 32 },
        7: { cellWidth: 48 },
        8: { cellWidth: 28 },
      },
    });

    renderRodape();
    doc.save(`livro-entradas-saidas-dme-${Date.now()}.pdf`);
    return;
  }

  // 3. VÍTIMAS & AGRESSORES (se aba 'vitimas_agressores')
  if (abaAtiva === 'vitimas_agressores') {
    renderCabecalho(
      'RELATÓRIO DE MONITORAMENTO DE MEDIDAS PROTETIVAS & LEI MARIA DA PENHA',
      'Gestão integrada de vítimas protegidas (botão de pânico) e agressores com tornozeleira eletrônica'
    );

    const pares = individuos.filter(
      (i) => i.perfil === 'AGRESSOR' || i.perfil === 'VITIMA_PROTEGIDA'
    );

    const head = [
      ['Perfil', 'Nome Completo', 'CPF', 'Idade', 'Status', 'Processo Judicial', 'Tipo Penal Respondendo', 'Dispositivo / IMEI', 'Raio Exclusão', 'Par Vinculado'],
    ];

    const body = pares.map((ind) => {
      const idade = calcularIdade(ind.dataNascimento);
      return [
        ind.perfil === 'VITIMA_PROTEGIDA' ? 'VÍTIMA' : 'AGRESSOR',
        ind.nomeCompleto,
        ind.cpf,
        `${idade} anos`,
        ind.status,
        ind.numeroProcesso,
        ind.tipoPenal,
        `${ind.numeroTornozeleiraOuReceptor || 'N/A'}\n${ind.imeiDispositivo || ''}`,
        ind.raioExclusaoMetros ? `${ind.raioExclusaoMetros}m` : '—',
        ind.nomeIndividuoVinculado || 'Não vinculado',
      ];
    });

    autoTable(doc, {
      head,
      body,
      startY: 46,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
      },
      headStyles: {
        fillColor: [107, 33, 168], // purple-800
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [250, 245, 255], // purple-50
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 20 },
        1: { cellWidth: 38, fontStyle: 'bold' },
        2: { cellWidth: 24 },
        3: { cellWidth: 16 },
        4: { cellWidth: 18 },
        5: { cellWidth: 34 },
        6: { cellWidth: 44 },
        7: { cellWidth: 30 },
        8: { cellWidth: 18 },
        9: { cellWidth: 34 },
      },
    });

    renderRodape();
    doc.save(`relatorio-maria-da-penha-dme-${Date.now()}.pdf`);
    return;
  }

  // 4. DEMOGRÁFICO POR FAIXA ETÁRIA (se aba 'faixas_etarias')
  if (abaAtiva === 'faixas_etarias') {
    renderCabecalho(
      'RELATÓRIO ESTATÍSTICO DEMOGRÁFICO POR FAIXA ETÁRIA & TIPO PENAL',
      'Estratificação etária, distribuição de perfis criminais e tipificações no monitoramento eletrônico'
    );

    const faixas: FaixaEtaria[] = ['18_24', '25_34', '35_49', '50_64', '65_MAIS'];
    const totalGeral = individuos.length;

    const headResumo = [
      ['Faixa Etária', 'Qtd. Total', '% Proporção', 'Gerais', 'Agressores', 'Vítimas Protegidas', 'Foragidos'],
    ];

    const bodyResumo = faixas.map((f) => {
      const doGrupo = individuos.filter((i) => {
        const id = calcularIdade(i.dataNascimento);
        return obterFaixaEtaria(id) === f;
      });
      const vit = doGrupo.filter((i) => i.perfil === 'VITIMA_PROTEGIDA').length;
      const agr = doGrupo.filter((i) => i.perfil === 'AGRESSOR').length;
      const ger = doGrupo.filter((i) => i.perfil === 'MONITORADO_GERAL').length;
      const fug = doGrupo.filter((i) => i.status === 'FORAGIDO').length;
      const pct = totalGeral > 0 ? `${((doGrupo.length / totalGeral) * 100).toFixed(1)}%` : '0%';

      return [rotuloFaixaEtaria(f), doGrupo.length.toString(), pct, ger.toString(), agr.toString(), vit.toString(), fug.toString()];
    });

    autoTable(doc, {
      head: headResumo,
      body: bodyResumo,
      startY: 46,
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 2.5, halign: 'center' },
      headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
    });

    const startYLista = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Relação Nominal Estratificada por Faixa Etária:', 14, startYLista);

    const headNominal = [
      ['Nome Completo', 'CPF', 'Nascimento', 'Idade Calculada', 'Faixa Etária', 'Perfil', 'Tipo Penal', 'Status'],
    ];

    const bodyNominal = individuos.map((i) => {
      const idade = calcularIdade(i.dataNascimento);
      const faixa = obterFaixaEtaria(idade);
      return [
        i.nomeCompleto,
        i.cpf,
        formatarData(i.dataNascimento),
        `${idade} anos`,
        rotuloFaixaEtaria(faixa),
        rotuloPerfil(i.perfil),
        i.tipoPenal,
        i.status,
      ];
    });

    autoTable(doc, {
      head: headNominal,
      body: bodyNominal,
      startY: startYLista + 3,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    });

    renderRodape();
    doc.save(`relatorio-demografico-faixas-etarias-dme-${Date.now()}.pdf`);
    return;
  }

  // 5. RELATÓRIO GERAL DE MONITORADOS (aba 'todos' ou padrão)
  renderCabecalho(
    'RELATÓRIO GERAL DE PESSOAS EM MONITORAMENTO ELETRÔNICO',
    'Relação completa de monitorados ativos, equipamentos, tipificação penal e processos'
  );

  const head = [
    ['Nome Completo', 'CPF', 'Idade / Faixa', 'Perfil', 'Status', 'Processo Judicial (CNJ)', 'Vara / Comarca', 'Tipo Penal Respondendo', 'Tornozeleira / IMEI', 'Data Entrada'],
  ];

  const body = individuos.map((i) => {
    const idade = calcularIdade(i.dataNascimento);
    const faixa = rotuloFaixaEtaria(obterFaixaEtaria(idade));
    return [
      i.nomeCompleto,
      i.cpf,
      `${idade} anos\n(${faixa})`,
      rotuloPerfil(i.perfil),
      i.status,
      i.numeroProcesso,
      `${i.varaJudicial}\n${i.comarca}`,
      i.tipoPenal,
      `${i.numeroTornozeleiraOuReceptor || 'N/A'}\n${i.imeiDispositivo || ''}`,
      formatarDataHora(i.dataPrimeiraEntrada),
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: 46,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: 'bold' },
      1: { cellWidth: 24 },
      2: { cellWidth: 24 },
      3: { cellWidth: 26 },
      4: { cellWidth: 18, fontStyle: 'bold' },
      5: { cellWidth: 34 },
      6: { cellWidth: 28 },
      7: { cellWidth: 42 },
      8: { cellWidth: 24 },
      9: { cellWidth: 22 },
    },
  });

  renderRodape();
  doc.save(`relatorio-geral-monitorados-dme-${Date.now()}.pdf`);
}

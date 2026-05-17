/* ==============================================
   admin.js — Studio Ariet Passos
   Lógica do painel administrativo
   ============================================== */

// ============================================================
// 1. DADOS FICTÍCIOS
// Esses arrays simulam um banco de dados enquanto não temos
// um back-end. Futuramente serão substituídos por Firebase.
// ============================================================

const clientes = [
  { id: 1, nome: 'Ana Lima',       whatsapp: '48991110001', procedimento: 'Design de Sobrancelha' },
  { id: 2, nome: 'Beatriz Santos', whatsapp: '48991110002', procedimento: 'Limpeza de Pele'       },
  { id: 3, nome: 'Camila Ferreira',whatsapp: '48991110003', procedimento: 'Brow Lamination'       },
  { id: 4, nome: 'Daniela Costa',  whatsapp: '48991110004', procedimento: 'Hidratação Facial'     },
  { id: 5, nome: 'Eduarda Rocha',  whatsapp: '48991110005', procedimento: 'Micropigmentação'      },
];

const procedimentos = [
  { id: 1, nome: 'Design de Sobrancelha', duracao: '45 min', preco: 'R$ 80,00',  icon: '✦' },
  { id: 2, nome: 'Limpeza de Pele',       duracao: '90 min', preco: 'R$ 150,00', icon: '◎' },
  { id: 3, nome: 'Brow Lamination',       duracao: '60 min', preco: 'R$ 120,00', icon: '◇' },
  { id: 4, nome: 'Hidratação Facial',     duracao: '50 min', preco: 'R$ 100,00', icon: '✿' },
  { id: 5, nome: 'Micropigmentação',      duracao: '120 min',preco: 'R$ 350,00', icon: '◈' },
];

// Agendamentos de hoje (data simulada)
// Status possíveis: 'pendente' | 'confirmado' | 'finalizado' | 'cancelado'
const agendamentos = [
  { id: 1, horario: '09:00', clienteId: 2, procedimento: 'Limpeza de Pele',       status: 'confirmado', obs: '' },
  { id: 2, horario: '10:30', clienteId: 1, procedimento: 'Design de Sobrancelha', status: 'pendente',   obs: 'Prefere sobrancelha mais grossa' },
  { id: 3, horario: '13:00', clienteId: 4, procedimento: 'Hidratação Facial',     status: 'pendente',   obs: '' },
  { id: 4, horario: '14:30', clienteId: 3, procedimento: 'Brow Lamination',       status: 'confirmado', obs: '' },
  { id: 5, horario: '16:00', clienteId: 5, procedimento: 'Micropigmentação',      status: 'finalizado', obs: 'Retorno em 30 dias' },
];

// ============================================================
// 2. UTILITÁRIOS
// ============================================================

// Retorna o objeto do cliente pelo ID
function getCliente(id) {
  return clientes.find(c => c.id === id) || { nome: 'Desconhecida', whatsapp: '' };
}

// Retorna inicial do nome para o avatar
function getIniciais(nome) {
  return nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

// Formata número de WhatsApp para link wa.me
function linkWhatsApp(numero, mensagem) {
  const num = numero.replace(/\D/g, '');
  const msg = encodeURIComponent(mensagem || 'Olá! Estou confirmando seu horário no Studio Ariet Passos.');
  return `https://wa.me/55${num}?text=${msg}`;
}

// Monta o badge HTML de status
function badgeStatus(status) {
  return `<span class="badge badge-${status}">${capitalizar(status)}</span>`;
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// 3. RELÓGIO E DATA
// ============================================================

function atualizarRelogio() {
  const agora = new Date();

  // Horário no cabeçalho
  const headerTime = document.getElementById('header-time');
  if (headerTime) {
    headerTime.textContent = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // Data formatada na sidebar
  const sidebarDate = document.getElementById('sidebar-date');
  if (sidebarDate) {
    sidebarDate.textContent = agora.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long'
    });
  }

  // Data na agenda
  const agendaData = document.getElementById('agenda-data');
  if (agendaData) {
    agendaData.textContent = agora.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}

// ============================================================
// 4. DASHBOARD
// ============================================================

function renderDashboard() {
  // Conta agendamentos de hoje (todos os que temos no array)
  const total      = agendamentos.length;
  const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;

  // Próximo agendamento com status pendente ou confirmado
  const proximo = agendamentos.find(a => a.status !== 'finalizado' && a.status !== 'cancelado');

  document.getElementById('card-hoje').textContent       = total;
  document.getElementById('card-clientes').textContent   = clientes.length;
  document.getElementById('card-confirmados').textContent = confirmados;

  if (proximo) {
    document.getElementById('card-proximo').textContent      = proximo.horario;
    document.getElementById('card-proximo-nome').textContent = getCliente(proximo.clienteId).nome;
  }

  // Tabela do dashboard (todos os agendamentos)
  const tbody = document.getElementById('tabela-dashboard');
  tbody.innerHTML = '';

  agendamentos.forEach(ag => {
    const cliente = getCliente(ag.clienteId);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${ag.horario}</strong></td>
      <td>${cliente.nome}</td>
      <td>${ag.procedimento}</td>
      <td>${badgeStatus(ag.status)}</td>
      <td>
        <div class="action-btns">
          ${ag.status === 'pendente'   ? `<button class="btn-action btn-confirmar"  onclick="mudarStatus(${ag.id}, 'confirmado')">Confirmar</button>` : ''}
          ${ag.status !== 'finalizado' && ag.status !== 'cancelado'
            ? `<button class="btn-action btn-finalizar" onclick="mudarStatus(${ag.id}, 'finalizado')">Finalizar</button>
               <button class="btn-action btn-cancelar"  onclick="mudarStatus(${ag.id}, 'cancelado')">Cancelar</button>`
            : ''}
          <a class="btn-action btn-whatsapp"
             href="${linkWhatsApp(cliente.whatsapp)}"
             target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// 5. AGENDA
// ============================================================

function renderAgenda() {
  const lista = document.getElementById('agenda-list');
  lista.innerHTML = '';

  if (agendamentos.length === 0) {
    lista.innerHTML = '<p style="color:var(--texto-sub);padding:1rem 0;">Nenhum agendamento para hoje.</p>';
    return;
  }

  agendamentos.forEach(ag => {
    const cliente = getCliente(ag.clienteId);
    const item = document.createElement('div');
    item.className = 'agenda-item';
    item.innerHTML = `
      <div class="agenda-horario">${ag.horario}</div>
      <div class="agenda-info">
        <div class="agenda-cliente">${cliente.nome}</div>
        <div class="agenda-proc">${ag.procedimento}${ag.obs ? ` · <em>${ag.obs}</em>` : ''}</div>
      </div>
      ${badgeStatus(ag.status)}
      <div class="agenda-actions">
        ${ag.status === 'pendente'
          ? `<button class="btn-action btn-confirmar" onclick="mudarStatus(${ag.id},'confirmado');renderAgenda();">Confirmar</button>`
          : ''}
        ${ag.status !== 'finalizado' && ag.status !== 'cancelado'
          ? `<button class="btn-action btn-finalizar" onclick="mudarStatus(${ag.id},'finalizado');renderAgenda();">Finalizar</button>
             <button class="btn-action btn-cancelar"  onclick="mudarStatus(${ag.id},'cancelado');renderAgenda();">Cancelar</button>`
          : ''}
        <a class="btn-action btn-whatsapp"
           href="${linkWhatsApp(cliente.whatsapp)}"
           target="_blank" rel="noopener">WhatsApp ↗</a>
      </div>
    `;
    lista.appendChild(item);
  });
}

// ============================================================
// 6. CLIENTES
// ============================================================

function renderClientes() {
  const grid = document.getElementById('clientes-grid');
  grid.innerHTML = '';

  clientes.forEach(c => {
    const card = document.createElement('div');
    card.className = 'cliente-card';
    card.innerHTML = `
      <div class="cliente-avatar">${getIniciais(c.nome)}</div>
      <div class="cliente-nome">${c.nome}</div>
      <div class="cliente-wpp">📱 ${c.whatsapp}</div>
      <div class="cliente-proc">${c.procedimento}</div>
    `;
    grid.appendChild(card);
  });
}

// ============================================================
// 7. PROCEDIMENTOS
// ============================================================

function renderProcedimentos() {
  const grid = document.getElementById('procedimentos-grid');
  grid.innerHTML = '';

  procedimentos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'proc-card';
    card.innerHTML = `
      <span class="proc-icon">${p.icon}</span>
      <div class="proc-nome">${p.nome}</div>
      <div class="proc-duracao">${p.duracao}</div>
      <div class="proc-preco">${p.preco}</div>
    `;
    grid.appendChild(card);
  });
}

// ============================================================
// 8. FORMULÁRIO — NOVO AGENDAMENTO
// ============================================================

function preencherSelectProcedimentos() {
  const select = document.getElementById('form-procedimento');
  procedimentos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.nome;
    opt.textContent = `${p.nome} — ${p.preco}`;
    select.appendChild(opt);
  });
}

function setupFormulario() {
  // Definir data de hoje como padrão
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('form-data').value = hoje;

  document.getElementById('btn-salvar').addEventListener('click', salvarAgendamento);
  document.getElementById('btn-limpar').addEventListener('click', limparFormulario);
}

function salvarAgendamento() {
  const nome       = document.getElementById('form-nome').value.trim();
  const whatsapp   = document.getElementById('form-whatsapp').value.trim();
  const procedimento = document.getElementById('form-procedimento').value;
  const data       = document.getElementById('form-data').value;
  const horario    = document.getElementById('form-horario').value;
  const obs        = document.getElementById('form-obs').value.trim();
  const feedback   = document.getElementById('form-feedback');

  // Validação básica
  if (!nome || !whatsapp || !procedimento || !data || !horario) {
    feedback.textContent = 'Preencha todos os campos obrigatórios.';
    feedback.className   = 'form-feedback erro';
    return;
  }

  // Criar nova cliente (simulando cadastro)
  const novoId = clientes.length + 1;
  clientes.push({ id: novoId, nome, whatsapp, procedimento });

  // Criar novo agendamento
  agendamentos.push({
    id: agendamentos.length + 1,
    horario,
    clienteId: novoId,
    procedimento,
    status: 'pendente',
    obs,
  });

  feedback.textContent = `✓ Agendamento de ${nome} salvo com sucesso!`;
  feedback.className   = 'form-feedback';
  limparFormulario(true);

  // Re-renderizar as outras seções
  renderDashboard();
  renderClientes();
  renderAgenda();
}

function limparFormulario(manterFeedback = false) {
  document.getElementById('form-nome').value         = '';
  document.getElementById('form-whatsapp').value     = '';
  document.getElementById('form-procedimento').value = '';
  document.getElementById('form-horario').value      = '';
  document.getElementById('form-obs').value          = '';
  if (!manterFeedback) {
    document.getElementById('form-feedback').textContent = '';
  }
}

// ============================================================
// 9. ALTERAR STATUS DE UM AGENDAMENTO
// ============================================================

function mudarStatus(id, novoStatus) {
  const ag = agendamentos.find(a => a.id === id);
  if (ag) {
    ag.status = novoStatus;
    // Re-renderiza dashboard com dados atualizados
    renderDashboard();
  }
}

// ============================================================
// 10. NAVEGAÇÃO ENTRE SEÇÕES
// ============================================================

function setupNavegacao() {
  const navItems  = document.querySelectorAll('.nav-item');
  const sections  = document.querySelectorAll('.section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const alvo = item.dataset.section;

      // Atualiza botões da sidebar
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Mostra apenas a seção correspondente
      sections.forEach(sec => {
        sec.classList.toggle('active', sec.id === alvo);
      });

      // Fecha sidebar no mobile após clicar
      fecharSidebarMobile();
    });
  });
}

// ============================================================
// 11. MENU MOBILE (hamburguer)
// ============================================================

function setupMenuMobile() {
  const toggle  = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  // Cria overlay dinamicamente
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay.addEventListener('click', fecharSidebarMobile);
}

function fecharSidebarMobile() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar)  sidebar.classList.remove('open');
  if (overlay)  overlay.classList.remove('show');
}

// ============================================================
// 12. INICIALIZAÇÃO
// Chamada quando o DOM estiver pronto
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Relógio
  atualizarRelogio();
  setInterval(atualizarRelogio, 60000); // atualiza a cada minuto

  // Renderiza cada seção com os dados fictícios
  renderDashboard();
  renderAgenda();
  renderClientes();
  renderProcedimentos();

  // Prepara o formulário
  preencherSelectProcedimentos();
  setupFormulario();

  // Configura a navegação da sidebar
  setupNavegacao();

  // Configura o menu mobile
  setupMenuMobile();
});
(() => {
  'use strict';

  const STORAGE_KEY = 'oshisuke_lives_v1';
  const GROUP_COLOR_KEY = 'oshisuke_group_colors_v1';
  const FAVORITE_GROUPS_KEY = 'oshisuke_favorite_groups_v1';
  const FAVORITES_FILTER = '__favorites__';
  const COLOR_PALETTE = ['#ff5fa2', '#7c6cf0', '#2fb380', '#e8a53d', '#3ab0d8', '#e0507a', '#8c6cf0', '#4fb0a5'];
  const DOW = ['日', '月', '火', '水', '木', '金', '土'];
  const EVENTS_JSON_URL = './events.json';
  const PREFECTURES = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
    '岐阜県', '静岡県', '愛知県', '三重県',
    '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
  ];

  const $ = (sel) => document.querySelector(sel);

  const els = {
    list: $('#list'),
    emptyState: $('#emptyState'),
    nextLiveCard: $('#nextLiveCard'),
    nextLiveDays: $('#nextLiveDays'),
    nextLiveDetail: $('#nextLiveDetail'),
    tabs: $('#statusTabs'),
    filterbar: $('#filterbar'),
    searchToggleBtn: $('#searchToggleBtn'),
    searchInput: $('#searchInput'),
    groupChips: $('#groupChips'),
    addBtn: $('#addBtn'),
    modalOverlay: $('#modalOverlay'),
    modalTitle: $('#modalTitle'),
    closeModalBtn: $('#closeModalBtn'),
    form: $('#liveForm'),
    fId: $('#liveId'),
    fGroup: $('#fGroup'),
    fTitle: $('#fTitle'),
    fDate: $('#fDate'),
    fTime: $('#fTime'),
    fVenue: $('#fVenue'),
    fStatus: $('#fStatus'),
    fMemo: $('#fMemo'),
    groupList: $('#groupList'),
    deleteBtn: $('#deleteBtn'),
    discoverSearchInput: $('#discoverSearchInput'),
    discoverDateInput: $('#discoverDateInput'),
    discoverDateClearBtn: $('#discoverDateClearBtn'),
    discoverPrefSelect: $('#discoverPrefSelect'),
    discoverMeta: $('#discoverMeta'),
    discoverList: $('#discoverList'),
    discoverFavToggleBtn: $('#discoverFavToggleBtn'),
    discoverFavChips: $('#discoverFavChips'),
    bottomNav: $('#bottomNav'),
    homeScreen: $('#homeScreen'),
    searchScreen: $('#searchScreen'),
    otherScreen: $('#otherScreen'),
    favManageInput: $('#favManageInput'),
    favManageAddBtn: $('#favManageAddBtn'),
    favManageList: $('#favManageList'),
    favManageEmpty: $('#favManageEmpty'),
    spendingTotal: $('#spendingTotal'),
    spendingTicket: $('#spendingTicket'),
    spendingCheki: $('#spendingCheki'),
    spendingDrink: $('#spendingDrink'),
    spendingTransport: $('#spendingTransport'),
    spendingHotel: $('#spendingHotel'),
    spendingMonths: $('#spendingMonths'),
    viewToggle: $('#viewToggle'),
    calendarView: $('#calendarView'),
    calendarPrevBtn: $('#calendarPrevBtn'),
    calendarNextBtn: $('#calendarNextBtn'),
    calendarMonthLabel: $('#calendarMonthLabel'),
    calendarGrid: $('#calendarGrid'),
    calendarDayDetail: $('#calendarDayDetail'),
    fTicketState: $('#fTicketState'),
    fTicketNo: $('#fTicketNo'),
    fTicketSeller: $('#fTicketSeller'),
    fTicketTier: $('#fTicketTier'),
    fTicketPrice: $('#fTicketPrice'),
    fChekiPrice: $('#fChekiPrice'),
    fDrinkPrice: $('#fDrinkPrice'),
    fTripFrom: $('#fTripFrom'),
    fTripTo: $('#fTripTo'),
    fTripDep: $('#fTripDep'),
    fTripArr: $('#fTripArr'),
    fTripTransport: $('#fTripTransport'),
    fTripFare: $('#fTripFare'),
    fTripHotel: $('#fTripHotel'),
    fTripHotelFare: $('#fTripHotelFare'),
    packList: $('#packList'),
    packInput: $('#packInput'),
    packAddBtn: $('#packAddBtn'),
    tabCountUpcoming: $('#tabCountUpcoming'),
    tabCountGo: $('#tabCountGo'),
    tabCountAttended: $('#tabCountAttended'),
    monthNav: $('#monthNav'),
    monthNavLabel: $('#monthNavLabel'),
    monthNavPrevBtn: $('#monthNavPrevBtn'),
    monthNavNextBtn: $('#monthNavNextBtn'),
    monthNavCount: $('#monthNavCount'),
  };

  const TICKET_STATE_LABELS = ['未購入', '抽選中', '購入済', '発券済'];

  let state = {
    lives: loadLives(),
    activeTab: 'upcoming',
    activeGroup: null,
    query: '',
    favoriteGroups: loadFavoriteGroups(),
    viewMode: 'list',
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth() + 1,
    selectedDate: null,
    listYear: new Date().getFullYear(),
    listMonth: new Date().getMonth() + 1,
  };

  // Packing checklist for whichever live is currently open in the modal -
  // separate from state.lives until the form is actually saved.
  let editingPack = [];

  let discoverState = {
    events: null,   // null = not loaded yet
    error: null,
    loading: false,
  };

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function loadLives() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLives() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lives));
  }

  function loadFavoriteGroups() {
    try {
      const raw = JSON.parse(localStorage.getItem(FAVORITE_GROUPS_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }
  function saveFavoriteGroups() {
    localStorage.setItem(FAVORITE_GROUPS_KEY, JSON.stringify(state.favoriteGroups));
  }
  function isFavoriteGroup(name) {
    return state.favoriteGroups.includes(name);
  }
  function toggleFavoriteGroup(name) {
    name = (name || '').trim();
    if (!name) return;
    const idx = state.favoriteGroups.indexOf(name);
    if (idx >= 0) state.favoriteGroups.splice(idx, 1);
    else state.favoriteGroups.push(name);
    saveFavoriteGroups();
  }

  // Favorites are shared across the home, search, and other screens - keep
  // all three in sync whenever the list changes, regardless of which one
  // triggered the change.
  function onFavoritesChanged() {
    render();
    renderDiscoverFavChips();
    updateDiscoverFavToggle();
    renderFavManageList();
  }

  function liveSpendingByCategory(live) {
    return {
      ticket: live.ticketPrice || 0,
      cheki: live.chekiPrice || 0,
      drink: live.drinkPrice || 0,
      transport: (live.trip && live.trip.fare) || 0,
      hotel: (live.trip && live.trip.hotelFare) || 0,
    };
  }

  function renderSpendingSummary() {
    const yen = (n) => `¥${n.toLocaleString('ja-JP')}`;
    const totals = { ticket: 0, cheki: 0, drink: 0, transport: 0, hotel: 0 };
    const byMonth = {};

    state.lives.forEach((live) => {
      const cat = liveSpendingByCategory(live);
      Object.keys(totals).forEach((k) => { totals[k] += cat[k]; });

      const monthKey = (live.date || '').slice(0, 7);
      if (!monthKey) return;
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { ticket: 0, cheki: 0, drink: 0, transport: 0, hotel: 0 };
      }
      Object.keys(cat).forEach((k) => { byMonth[monthKey][k] += cat[k]; });
    });

    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    els.spendingTotal.textContent = yen(grandTotal);
    els.spendingTicket.textContent = yen(totals.ticket);
    els.spendingCheki.textContent = yen(totals.cheki);
    els.spendingDrink.textContent = yen(totals.drink);
    els.spendingTransport.textContent = yen(totals.transport);
    els.spendingHotel.textContent = yen(totals.hotel);

    const monthKeys = Object.keys(byMonth).sort().reverse();
    els.spendingMonths.innerHTML = '';
    if (monthKeys.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'spending-months-empty';
      empty.textContent = 'まだ記録がありません。';
      els.spendingMonths.appendChild(empty);
      return;
    }

    const LABELS = { ticket: 'チケット', cheki: 'チェキ', drink: 'ドリンク', transport: '交通費', hotel: '宿泊費' };
    monthKeys.forEach((key) => {
      const [y, m] = key.split('-');
      const cat = byMonth[key];
      const monthTotal = Object.values(cat).reduce((a, b) => a + b, 0);

      const card = document.createElement('div');
      card.className = 'spending-month-card';
      const lines = Object.keys(LABELS)
        .filter((k) => cat[k] > 0)
        .map((k) => `<span class="spending-month-line">${LABELS[k]} <b>${yen(cat[k])}</b></span>`)
        .join('');
      card.innerHTML = `
        <div class="spending-month-head">
          <span class="spending-month-label">${y}年${Number(m)}月</span>
          <span class="spending-month-total">${yen(monthTotal)}</span>
        </div>
        <div class="spending-month-lines">${lines}</div>
      `;
      els.spendingMonths.appendChild(card);
    });
  }

  function renderFavManageList() {
    els.favManageList.innerHTML = '';
    els.favManageEmpty.hidden = state.favoriteGroups.length !== 0;
    state.favoriteGroups.forEach((name) => {
      const row = document.createElement('div');
      row.className = 'fav-manage-item';
      const label = document.createElement('span');
      label.textContent = name;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'fav-manage-remove';
      remove.setAttribute('aria-label', `${name}をお気に入りから削除`);
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        toggleFavoriteGroup(name);
        onFavoritesChanged();
      });
      row.appendChild(label);
      row.appendChild(remove);
      els.favManageList.appendChild(row);
    });
  }

  function loadGroupColors() {
    try {
      return JSON.parse(localStorage.getItem(GROUP_COLOR_KEY)) || {};
    } catch (e) { return {}; }
  }
  function saveGroupColors(map) {
    localStorage.setItem(GROUP_COLOR_KEY, JSON.stringify(map));
  }
  function colorForGroup(group) {
    const map = loadGroupColors();
    if (map[group]) return map[group];
    const used = Object.values(map);
    const next = COLOR_PALETTE.find((c) => !used.includes(c)) ||
      COLOR_PALETTE[Object.keys(map).length % COLOR_PALETTE.length];
    map[group] = next;
    saveGroupColors(map);
    return next;
  }

  function allGroups() {
    return [...new Set(state.lives.map((l) => l.group))].sort();
  }

  function formatDateLabel(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dow = DOW[new Date(y, m - 1, d).getDay()];
    return { m, d, dow };
  }

  function monthLabel(dateStr) {
    const [y, m] = dateStr.split('-').map(Number);
    return `${y}年${m}月`;
  }

  function computeStatusBucket(live) {
    if (live.date < todayStr()) return live.status === 'go' ? 'attended' : 'done';
    return live.status; // go | interested | undecided
  }

  function statusLabel(bucket) {
    return { go: '参戦する', interested: '気になる', undecided: '未定', done: '終了', attended: '参戦済み' }[bucket] || bucket;
  }

  function renderGroupChips() {
    const groups = allGroups();
    els.groupChips.innerHTML = '';
    const allChip = document.createElement('button');
    allChip.className = 'chip' + (state.activeGroup === null ? ' active' : '');
    allChip.textContent = 'すべて';
    allChip.onclick = () => { state.activeGroup = null; resetListMonthToFirstMatch(); render(); };
    els.groupChips.appendChild(allChip);

    if (state.favoriteGroups.length) {
      const favChip = document.createElement('button');
      favChip.className = 'chip chip-favorite' + (state.activeGroup === FAVORITES_FILTER ? ' active' : '');
      favChip.textContent = '★ お気に入り';
      favChip.onclick = () => {
        state.activeGroup = state.activeGroup === FAVORITES_FILTER ? null : FAVORITES_FILTER;
        resetListMonthToFirstMatch();
        render();
      };
      els.groupChips.appendChild(favChip);
    }

    groups.forEach((g) => {
      const chip = document.createElement('button');
      chip.className = 'chip chip-group' + (state.activeGroup === g ? ' active' : '');

      const star = document.createElement('span');
      star.className = 'chip-star' + (isFavoriteGroup(g) ? ' is-favorite' : '');
      star.textContent = isFavoriteGroup(g) ? '★' : '☆';
      star.setAttribute('role', 'button');
      star.setAttribute('aria-label', 'お気に入り切替');
      star.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavoriteGroup(g);
        onFavoritesChanged();
      });
      chip.appendChild(star);
      chip.appendChild(document.createTextNode(g));
      chip.addEventListener('click', () => {
        state.activeGroup = state.activeGroup === g ? null : g;
        resetListMonthToFirstMatch();
        render();
      });
      els.groupChips.appendChild(chip);
    });
  }

  function updateGroupDatalist() {
    els.groupList.innerHTML = allGroups().map((g) => `<option value="${escapeHtml(g)}">`).join('');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function filteredLives() {
    const q = state.query.trim().toLowerCase();
    const isAttendedTab = state.activeTab === 'attended';
    const result = state.lives.filter((l) => {
      const bucket = computeStatusBucket(l);
      if (state.activeTab === 'upcoming' && (bucket === 'done' || bucket === 'attended')) return false;
      if (state.activeTab !== 'all' && state.activeTab !== 'upcoming' && bucket !== state.activeTab) return false;
      if (state.activeGroup === FAVORITES_FILTER) {
        if (!isFavoriteGroup(l.group)) return false;
      } else if (state.activeGroup && l.group !== state.activeGroup) return false;
      if (q) {
        const hay = `${l.group} ${l.title} ${l.venue}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    // History reads newest-first; every other tab reads soonest-first.
    result.sort((a, b) => isAttendedTab
      ? (b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''))
      : (a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '')));
    return result;
  }

  function monthFilteredLives() {
    return filteredLives().filter((l) => {
      const [y, m] = l.date.split('-').map(Number);
      return y === state.listYear && m === state.listMonth;
    });
  }

  function resetListMonthToFirstMatch() {
    const base = filteredLives();
    if (base.length) {
      const [y, m] = base[0].date.split('-').map(Number);
      state.listYear = y;
      state.listMonth = m;
    } else {
      const now = new Date();
      state.listYear = now.getFullYear();
      state.listMonth = now.getMonth() + 1;
    }
  }

  function computeTabCounts() {
    const q = state.query.trim().toLowerCase();
    const matches = (l) => {
      if (state.activeGroup === FAVORITES_FILTER) {
        if (!isFavoriteGroup(l.group)) return false;
      } else if (state.activeGroup && l.group !== state.activeGroup) return false;
      if (q) {
        const hay = `${l.group} ${l.title} ${l.venue}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    };
    let upcoming = 0, go = 0, attended = 0;
    state.lives.filter(matches).forEach((l) => {
      const bucket = computeStatusBucket(l);
      if (bucket !== 'done' && bucket !== 'attended') upcoming++;
      if (bucket === 'go') go++;
      if (bucket === 'attended') attended++;
    });
    els.tabCountUpcoming.textContent = upcoming;
    els.tabCountGo.textContent = go;
    els.tabCountAttended.textContent = attended;
  }

  function renderMonthNav() {
    els.monthNavLabel.textContent = `${state.listYear}/${pad(state.listMonth)}`;
    els.monthNavCount.textContent = `${monthFilteredLives().length}件`;
  }

  function renderNextLive() {
    const upcoming = state.lives
      .filter((l) => l.date >= todayStr() && l.status !== 'undecided')
      .sort((a, b) => a.date.localeCompare(b.date))[0]
      || state.lives.filter((l) => l.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date))[0];

    if (!upcoming) {
      els.nextLiveCard.hidden = true;
      return;
    }
    els.nextLiveCard.hidden = false;
    const today = new Date(todayStr());
    const target = new Date(upcoming.date);
    const diffDays = Math.round((target - today) / 86400000);
    els.nextLiveDays.textContent = diffDays <= 0 ? '本日' : diffDays;
    if (diffDays <= 0) els.nextLiveDays.nextElementSibling.style.display = 'none';
    else els.nextLiveDays.nextElementSibling.style.display = '';

    els.nextLiveDetail.innerHTML =
      `<strong>${escapeHtml(upcoming.group)}</strong> ${escapeHtml(upcoming.title || '')}<br>` +
      `${upcoming.date}${upcoming.time ? ' ' + upcoming.time : ''}${upcoming.venue ? ' ／ ' + escapeHtml(upcoming.venue) : ''}`;
  }

  function renderList() {
    const lives = monthFilteredLives();
    els.list.innerHTML = '';
    els.emptyState.hidden = lives.length !== 0;
    lives.forEach((live) => els.list.appendChild(renderCard(live)));
  }

  function daysUntil(dateStr) {
    const today = new Date(todayStr());
    const target = new Date(dateStr);
    return Math.round((target - today) / 86400000);
  }

  function ticketSummary(live) {
    const label = TICKET_STATE_LABELS[live.ticketState] || TICKET_STATE_LABELS[0];
    const parts = [label];
    if (live.ticketTier) parts.push(live.ticketTier);
    if (live.ticketNo) parts.push(live.ticketNo);
    return parts.join(' ');
  }

  function tripSummary(live) {
    const t = live.trip;
    if (!t) return '';
    return t.transport || [t.from, t.to].filter(Boolean).join('→');
  }

  function renderCard(live) {
    const { m, d, dow } = formatDateLabel(live.date);
    const bucket = computeStatusBucket(live);
    const isToday = live.date === todayStr();
    const diff = daysUntil(live.date);
    const trip = tripSummary(live);

    const card = document.createElement('div');
    card.className = 'card' + (isToday ? ' is-today' : '');
    card.style.setProperty('--group-color', colorForGroup(live.group));
    card.innerHTML = `
      <div class="card-date">
        <div class="dow">${dow}</div>
        <div class="day">${d}</div>
        <div class="days-until">${diff === 0 ? '本日' : diff > 0 ? `あと${diff}日` : ''}</div>
      </div>
      <div class="card-body">
        <div class="card-top">
          <span class="group-name" style="color:${colorForGroup(live.group)}">${escapeHtml(live.group)}</span>
          <span class="status-badge status-${bucket}">${statusLabel(bucket)}</span>
        </div>
        <div class="card-title">${escapeHtml(live.title || '(タイトル未設定)')}</div>
        <div class="card-meta">
          ${live.time ? `<span>${live.time}〜</span>` : ''}
          ${live.venue ? `<span>${escapeHtml(live.venue)}</span>` : ''}
        </div>
        <div class="card-tags">
          <span class="card-tag">TICKET・${escapeHtml(ticketSummary(live))}</span>
          ${trip ? `<span class="card-tag">TRIP・${escapeHtml(trip)}</span>` : ''}
        </div>
      </div>
    `;
    card.addEventListener('click', () => openModal(live));
    return card;
  }

  function renderHomeContent() {
    computeTabCounts();
    if (state.viewMode === 'calendar') {
      els.list.hidden = true;
      els.emptyState.hidden = true;
      els.calendarView.hidden = false;
      els.monthNav.hidden = true;
      renderCalendarView();
    } else {
      els.calendarView.hidden = true;
      els.list.hidden = false;
      els.monthNav.hidden = false;
      renderMonthNav();
      renderList();
    }
  }

  function renderCalendarView() {
    const byDate = {};
    filteredLives().forEach((l) => {
      (byDate[l.date] = byDate[l.date] || []).push(l);
    });

    const y = state.calendarYear;
    const m = state.calendarMonth;
    els.calendarMonthLabel.textContent = `${y}年${m}月`;

    const firstDow = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const today = todayStr();

    els.calendarGrid.innerHTML = '';
    for (let i = 0; i < firstDow; i++) {
      const padCell = document.createElement('div');
      padCell.className = 'calendar-cell calendar-cell-empty';
      els.calendarGrid.appendChild(padCell);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${pad(m)}-${pad(d)}`;
      const dayLives = byDate[dateStr] || [];
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'calendar-cell';
      if (dateStr === today) cell.classList.add('is-today');
      if (dateStr === state.selectedDate) cell.classList.add('is-selected');
      if (dayLives.length) cell.classList.add('has-events');
      const dots = dayLives.slice(0, 3)
        .map((l) => `<span class="calendar-dot" style="background:${colorForGroup(l.group)}"></span>`)
        .join('');
      cell.innerHTML = `<span class="calendar-cell-day">${d}</span><span class="calendar-cell-dots">${dots}</span>`;
      cell.addEventListener('click', () => {
        state.selectedDate = state.selectedDate === dateStr ? null : dateStr;
        renderCalendarView();
      });
      els.calendarGrid.appendChild(cell);
    }

    els.calendarDayDetail.innerHTML = '';
    if (!state.selectedDate) {
      const hint = document.createElement('p');
      hint.className = 'calendar-hint';
      hint.textContent = '日付をタップすると予定を表示します。';
      els.calendarDayDetail.appendChild(hint);
      return;
    }
    const selectedLives = (byDate[state.selectedDate] || [])
      .slice()
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    if (!selectedLives.length) {
      const hint = document.createElement('p');
      hint.className = 'calendar-hint';
      hint.textContent = 'この日の予定はありません。';
      els.calendarDayDetail.appendChild(hint);
      return;
    }
    selectedLives.forEach((live) => els.calendarDayDetail.appendChild(renderCard(live)));
  }

  function render() {
    renderGroupChips();
    updateGroupDatalist();
    renderNextLive();
    renderHomeContent();
  }

  els.viewToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-toggle-btn');
    if (!btn) return;
    state.viewMode = btn.dataset.view;
    els.viewToggle.querySelectorAll('.view-toggle-btn').forEach((b) => b.classList.toggle('active', b === btn));
    renderHomeContent();
  });
  els.calendarPrevBtn.addEventListener('click', () => {
    state.calendarMonth -= 1;
    if (state.calendarMonth < 1) { state.calendarMonth = 12; state.calendarYear -= 1; }
    state.selectedDate = null;
    renderCalendarView();
  });
  els.calendarNextBtn.addEventListener('click', () => {
    state.calendarMonth += 1;
    if (state.calendarMonth > 12) { state.calendarMonth = 1; state.calendarYear += 1; }
    state.selectedDate = null;
    renderCalendarView();
  });

  // Tabs
  els.tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    els.tabs.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeTab = btn.dataset.status;
    resetListMonthToFirstMatch();
    renderHomeContent();
  });

  els.monthNavPrevBtn.addEventListener('click', () => {
    state.listMonth -= 1;
    if (state.listMonth < 1) { state.listMonth = 12; state.listYear -= 1; }
    renderHomeContent();
  });
  els.monthNavNextBtn.addEventListener('click', () => {
    state.listMonth += 1;
    if (state.listMonth > 12) { state.listMonth = 1; state.listYear += 1; }
    renderHomeContent();
  });

  // Search toggle
  els.searchToggleBtn.addEventListener('click', () => {
    els.filterbar.hidden = !els.filterbar.hidden;
    if (!els.filterbar.hidden) els.searchInput.focus();
  });
  els.searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    renderHomeContent();
  });

  // Modal
  function renderPackList() {
    els.packList.innerHTML = '';
    editingPack.forEach((item, idx) => {
      const row = document.createElement('label');
      row.className = 'pack-item';
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = !!item.done;
      check.addEventListener('change', () => { item.done = check.checked; });
      const label = document.createElement('span');
      label.textContent = item.label;
      label.className = 'pack-item-label';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'pack-item-remove';
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        editingPack.splice(idx, 1);
        renderPackList();
      });
      row.appendChild(check);
      row.appendChild(label);
      row.appendChild(remove);
      els.packList.appendChild(row);
    });
  }

  function openModal(live) {
    els.form.reset();
    if (live) {
      els.modalTitle.textContent = 'ライブを編集';
      els.fId.value = live.id;
      els.fGroup.value = live.group;
      els.fTitle.value = live.title || '';
      els.fDate.value = live.date;
      els.fTime.value = live.time || '';
      els.fVenue.value = live.venue || '';
      els.fStatus.value = live.status;
      els.fMemo.value = live.memo || '';
      els.fTicketState.value = live.ticketState || 0;
      els.fTicketNo.value = live.ticketNo || '';
      els.fTicketSeller.value = live.ticketSeller || '';
      els.fTicketTier.value = live.ticketTier || '';
      els.fTicketPrice.value = live.ticketPrice || '';
      els.fChekiPrice.value = live.chekiPrice || '';
      els.fDrinkPrice.value = live.drinkPrice || '';
      const trip = live.trip || {};
      els.fTripFrom.value = trip.from || '';
      els.fTripTo.value = trip.to || '';
      els.fTripDep.value = trip.dep || '';
      els.fTripArr.value = trip.arr || '';
      els.fTripTransport.value = trip.transport || '';
      els.fTripFare.value = trip.fare || '';
      els.fTripHotel.value = trip.hotel || '';
      els.fTripHotelFare.value = trip.hotelFare || '';
      editingPack = (live.pack || []).map((p) => ({ ...p }));
      els.deleteBtn.hidden = false;
    } else {
      els.modalTitle.textContent = 'ライブを追加';
      els.fId.value = '';
      els.fDate.value = todayStr();
      els.fStatus.value = 'interested';
      els.fTicketState.value = 0;
      editingPack = [];
      els.deleteBtn.hidden = true;
    }
    renderPackList();
    updateGroupDatalist();
    els.modalOverlay.hidden = false;
  }

  function closeModal() {
    els.modalOverlay.hidden = true;
  }

  els.addBtn.addEventListener('click', () => openModal(null));
  els.closeModalBtn.addEventListener('click', closeModal);
  els.modalOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });

  els.packAddBtn.addEventListener('click', () => {
    const label = els.packInput.value.trim();
    if (!label) return;
    editingPack.push({ label, done: false });
    els.packInput.value = '';
    renderPackList();
  });
  els.packInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    els.packAddBtn.click();
  });

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = els.fId.value || uid();
    const live = {
      id,
      group: els.fGroup.value.trim(),
      title: els.fTitle.value.trim(),
      date: els.fDate.value,
      time: els.fTime.value,
      venue: els.fVenue.value.trim(),
      status: els.fStatus.value,
      memo: els.fMemo.value.trim(),
      ticketState: Number(els.fTicketState.value) || 0,
      ticketNo: els.fTicketNo.value.trim(),
      ticketSeller: els.fTicketSeller.value.trim(),
      ticketTier: els.fTicketTier.value.trim(),
      ticketPrice: Number(els.fTicketPrice.value) || 0,
      chekiPrice: Number(els.fChekiPrice.value) || 0,
      drinkPrice: Number(els.fDrinkPrice.value) || 0,
      trip: {
        from: els.fTripFrom.value.trim(),
        to: els.fTripTo.value.trim(),
        dep: els.fTripDep.value,
        arr: els.fTripArr.value,
        transport: els.fTripTransport.value.trim(),
        fare: Number(els.fTripFare.value) || 0,
        hotel: els.fTripHotel.value.trim(),
        hotelFare: Number(els.fTripHotelFare.value) || 0,
      },
      pack: editingPack.map((p) => ({ ...p })),
    };
    if (!live.group || !live.date) return;

    const idx = state.lives.findIndex((l) => l.id === id);
    if (idx >= 0) state.lives[idx] = live;
    else state.lives.push(live);

    saveLives();
    closeModal();
    resetListMonthToFirstMatch();
    render();
  });

  els.deleteBtn.addEventListener('click', () => {
    const id = els.fId.value;
    if (!id) return;
    if (!confirm('このライブ予定を削除しますか?')) return;
    state.lives = state.lives.filter((l) => l.id !== id);
    saveLives();
    closeModal();
    render();
  });

  // ---- Discover (search collected event data) ----

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchEventsJsonFrom(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function fetchEventsJson() {
    try {
      return await fetchEventsJsonFrom(EVENTS_JSON_URL);
    } catch (err) {
      await sleep(1200);
      return await fetchEventsJsonFrom(EVENTS_JSON_URL);
    }
  }

  async function loadDiscoveredEvents() {
    if (discoverState.events || discoverState.loading) return;
    discoverState.loading = true;
    discoverState.error = null;
    renderDiscoverList();
    try {
      const raw = await fetchEventsJson();
      const events = Object.entries(raw).map(([url, ev]) => ({ url, ...ev }));
      events.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      });
      discoverState.events = events;
    } catch (err) {
      discoverState.error = err;
    } finally {
      discoverState.loading = false;
      renderDiscoverList();
    }
  }

  function filteredDiscoverEvents() {
    if (!discoverState.events) return [];
    const q = els.discoverSearchInput.value.trim().toLowerCase();
    const dateFilter = els.discoverDateInput.value;
    const prefFilter = els.discoverPrefSelect.value;
    return discoverState.events.filter((ev) => {
      if (dateFilter && ev.date !== dateFilter) return false;
      if (prefFilter && ev.prefecture !== prefFilter) return false;
      if (!q) return true;
      const hay = `${ev.group || ''} ${ev.title || ''} ${ev.venue || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function updateDiscoverFavToggle() {
    const q = els.discoverSearchInput.value.trim();
    const active = !!q && isFavoriteGroup(q);
    els.discoverFavToggleBtn.textContent = active ? '★' : '☆';
    els.discoverFavToggleBtn.classList.toggle('is-favorite', active);
    els.discoverFavToggleBtn.disabled = !q;
  }

  function renderDiscoverFavChips() {
    els.discoverFavChips.innerHTML = '';
    state.favoriteGroups.forEach((name) => {
      const chip = document.createElement('span');
      chip.className = 'discover-fav-chip';

      const label = document.createElement('button');
      label.type = 'button';
      label.className = 'discover-fav-chip-label';
      label.textContent = name;
      label.addEventListener('click', () => {
        els.discoverSearchInput.value = name;
        updateDiscoverFavToggle();
        renderDiscoverList();
      });

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'discover-fav-chip-remove';
      remove.setAttribute('aria-label', `${name}をお気に入りから削除`);
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        toggleFavoriteGroup(name);
        onFavoritesChanged();
      });

      chip.appendChild(label);
      chip.appendChild(remove);
      els.discoverFavChips.appendChild(chip);
    });
  }

  function sourceLabel(ev) {
    // Show the actual ticket-selling site the link goes to, not the
    // watchlist entry that found it (liveidol.blog is an aggregator -
    // its entries' urls point at tiget/ticketdive/etc., which is the
    // more useful thing to show here).
    try {
      return new URL(ev.url).hostname.replace(/^www\./, '');
    } catch (err) {
      return ev.source || '';
    }
  }

  function renderDiscoverList() {
    els.discoverList.innerHTML = '';

    if (discoverState.loading) {
      els.discoverMeta.textContent = '読み込み中...';
      return;
    }
    if (discoverState.error) {
      els.discoverMeta.textContent = '取得に失敗しました。';
      const wrap = document.createElement('div');
      wrap.className = 'discover-error';
      const msg = document.createElement('p');
      msg.textContent = '通信環境を確認して、もう一度お試しください。';
      const retryBtn = document.createElement('button');
      retryBtn.type = 'button';
      retryBtn.className = 'discover-retry-btn';
      retryBtn.textContent = '再試行';
      retryBtn.addEventListener('click', () => {
        discoverState.error = null;
        discoverState.events = null;
        loadDiscoveredEvents();
      });
      wrap.appendChild(msg);
      wrap.appendChild(retryBtn);
      els.discoverList.appendChild(wrap);
      return;
    }
    if (!discoverState.events) return;

    const results = filteredDiscoverEvents();
    els.discoverMeta.textContent = `${discoverState.events.length}件中 ${results.length}件`;

    results.slice(0, 200).forEach((ev) => {
      const item = document.createElement('div');
      item.className = 'discover-item';
      item.innerHTML = `
        <div class="discover-item-main">
          <span class="discover-source">${escapeHtml(sourceLabel(ev))}</span>
          <div class="discover-group">${escapeHtml(ev.group || ev.title || '(不明)')}</div>
          <div class="discover-title">${escapeHtml(ev.title || '')}</div>
          <div class="discover-sub">${escapeHtml(ev.date || '日付不明')} ／ ${escapeHtml(ev.venue || '会場不明')}</div>
        </div>
        <div class="discover-actions">
          <button type="button" class="discover-add-btn">追加</button>
          <a class="discover-link" href="${escapeHtml(ev.url)}" target="_blank" rel="noopener">元ページ</a>
        </div>
      `;
      item.querySelector('.discover-add-btn').addEventListener('click', () => {
        openModal(null);
        els.fGroup.value = ev.group || ev.title || '';
        els.fTitle.value = ev.title || '';
        if (ev.date) els.fDate.value = ev.date;
        els.fVenue.value = ev.venue || '';
        els.fMemo.value = ev.url || '';
      });
      els.discoverList.appendChild(item);
    });
  }

  const SCREENS = { home: els.homeScreen, search: els.searchScreen, other: els.otherScreen };

  function switchScreen(name) {
    Object.entries(SCREENS).forEach(([key, el]) => { el.hidden = key !== name; });
    els.bottomNav.querySelectorAll('.bottombar-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.screen === name);
    });
    els.addBtn.hidden = name !== 'home';
    if (name === 'search') {
      els.discoverSearchInput.focus();
      renderDiscoverFavChips();
      updateDiscoverFavToggle();
      loadDiscoveredEvents();
    } else if (name === 'other') {
      renderFavManageList();
      renderSpendingSummary();
    }
  }

  PREFECTURES.forEach((pref) => {
    const opt = document.createElement('option');
    opt.value = pref;
    opt.textContent = pref;
    els.discoverPrefSelect.appendChild(opt);
  });

  els.bottomNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.bottombar-btn');
    if (!btn) return;
    switchScreen(btn.dataset.screen);
  });
  els.favManageAddBtn.addEventListener('click', () => {
    const name = els.favManageInput.value.trim();
    if (name && !isFavoriteGroup(name)) toggleFavoriteGroup(name);
    els.favManageInput.value = '';
    onFavoritesChanged();
  });
  els.favManageInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    els.favManageAddBtn.click();
  });
  els.discoverSearchInput.addEventListener('input', () => {
    updateDiscoverFavToggle();
    renderDiscoverList();
  });
  els.discoverFavToggleBtn.addEventListener('click', () => {
    toggleFavoriteGroup(els.discoverSearchInput.value.trim());
    onFavoritesChanged();
  });
  els.discoverDateInput.addEventListener('input', () => {
    els.discoverDateClearBtn.hidden = !els.discoverDateInput.value;
    renderDiscoverList();
  });
  els.discoverDateClearBtn.addEventListener('click', () => {
    els.discoverDateInput.value = '';
    els.discoverDateClearBtn.hidden = true;
    renderDiscoverList();
  });
  els.discoverPrefSelect.addEventListener('change', renderDiscoverList);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
    });
  }

  resetListMonthToFirstMatch();
  render();
})();

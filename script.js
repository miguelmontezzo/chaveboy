/* =============================================
   CHAVEBOY — script.js
   ============================================= */

/* ══════════════════════════════════════════════
   ★ CONFIGURAÇÃO GERAL
   ══════════════════════════════════════════════ */
const CONFIG = {
    footer:          "© 2025 ChaveBoy · INSERT COIN",
    loadingDuration: 1200,

    // Tutorial padrão (quando o jogo não tem vídeo próprio)
    defaultTutorialIos:            "",              // ID YouTube padrão para iPhone
    defaultTutorialAndroid:        "YK6kzaUJu_0",  // ID YouTube padrão para Android
    defaultTutorialAndroidIsShort: true,            // true = é um Short (proporção vertical)

    // Links de emulador — aparecem em TODAS as páginas
    emulators: {
        ios: {
            label: "DELTA — iPhone / iPad",
            url:   "https://apps.apple.com/us/app/delta-game-emulator/id1048524688",
            icon:  "🍎",
        },
        android: {
            label: "LEMUROID — Android",
            url:   "https://play.google.com/store/apps/details?id=com.swordfish.lemuroid&hl=pt_BR",
            icon:  "🤖",
        },
    },
};

/* ══════════════════════════════════════════════
   ★ JOGOS — adicione quantos quiser

   Campos:
     slug            — ID da URL (pode ter /, ex: "CHBV-PKM-02/20-OG")
     title           — Nome do jogo
     cover           — URL ou caminho da imagem (4:3)
     play            — Link "Jogar online"    ("" para ocultar)
     download        — Link "Baixar Jogo"     ("" para ocultar)
     tutorialIos     — YouTube video ID tutorial iPhone  ("" para ocultar)
     tutorialAndroid — YouTube video ID tutorial Android ("" para ocultar)
   ══════════════════════════════════════════════ */
const GAMES = [
    {
        slug:            "CHBV-PKM-02/20-OG",
        title:           "Pokémon Red Version",
        cover:           "https://i.ibb.co/Dg7GJdZB/cahveboy-02.jpg",
        download:        "https://drive.google.com/file/d/1ZZWYormsYwt5VfHJKZZ6GEeHY3KJbr-A/view?usp=sharing",
        deltaLink:       "delta://game/ea9bcae617fdf159b045185467ae58b2e4a48b9a",
        tutorialIos:     "",   // ID do vídeo YouTube para iPhone
        tutorialAndroid: "",   // ID do vídeo YouTube para Android (usa defaultTutorialAndroid se vazio)
    },
    {
        slug:            "CHBV-PKM-01/20-OG",
        title:           "Pokémon Yellow Version",
        cover:           "https://i.ibb.co/q38VfKFJ/chaveboy-01.jpg",
        download:        "https://drive.google.com/file/d/1ly7pXkRv7xXXiK_rVvrilv3ALWVqu1ei/view?usp=sharing",
        deltaLink:       "",   // Adicionar depois
        tutorialIos:     "",
        tutorialAndroid: "",
    },
    // Adicione mais jogos abaixo seguindo o mesmo formato
];

/* ══════════════════════════════════════════════
   SENHA DA BIBLIOTECA
   ══════════════════════════════════════════════ */
const PASSWORD   = '644835';
const UNLOCK_KEY = 'cb_unlocked';

function isUnlocked() { return localStorage.getItem(UNLOCK_KEY) === '1'; }
function unlock()      { localStorage.setItem(UNLOCK_KEY, '1'); }

/* ══════════════════════════════════════════════
   ENGINE
   ══════════════════════════════════════════════ */

// ── Helpers ──────────────────────────────────

function addRipple(el, e) {
    const rect = el.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.left = `${e.clientX - rect.left}px`;
    r.style.top  = `${e.clientY - rect.top}px`;
    el.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
}

function makeButton(text, url, className, icon) {
    if (!url) return null;
    const a = document.createElement('a');
    a.href      = url;
    a.className = `btn ${className}`;
    a.target    = '_blank';
    a.rel       = 'noopener noreferrer';
    a.innerHTML = `<span class="btn-icon">${icon}</span>${text}`;
    a.addEventListener('click', (e) => addRipple(a, e));
    return a;
}

function makeCover(game) {
    const div = document.createElement('div');
    div.className = 'game-cover';
    if (game.cover) {
        const img = document.createElement('img');
        img.src     = game.cover;
        img.alt     = game.title;
        img.loading = 'lazy';
        div.appendChild(img);
    } else {
        div.innerHTML = `
            <div class="cover-placeholder">
                <span class="placeholder-icon">🎮</span>
                <span class="placeholder-title">${game.title}</span>
            </div>`;
    }
    return div;
}

// ── Emulador + Tutorial combinados em tabs ───

function makeEmulatorSection(game) {
    const { ios, android } = CONFIG.emulators;

    const section = document.createElement('div');
    section.className = 'tutorial-section';

    const label = document.createElement('div');
    label.className = 'section-label-retro';
    label.textContent = 'EMULADOR & COMO JOGAR';
    section.appendChild(label);

    const tabs = document.createElement('div');
    tabs.className = 'tutorial-tabs';
    section.appendChild(tabs);

    const content = document.createElement('div');
    content.className = 'emu-content';
    section.appendChild(content);

    function switchTo(platform) {
        tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        tabs.querySelector(`[data-plat="${platform}"]`).classList.add('active');

        content.innerHTML = '';

        const emu     = platform === 'ios' ? ios : android;
        const videoId = platform === 'ios'
            ? (game.tutorialIos     || CONFIG.defaultTutorialIos)
            : (game.tutorialAndroid || CONFIG.defaultTutorialAndroid);
        const btnCls  = platform === 'ios' ? 'btn-emu-ios' : 'btn-emu-android';

        // Botão JOGAR — só iOS com deltaLink configurado
        if (platform === 'ios' && game.deltaLink) {
            const btnPlay = document.createElement('a');
            btnPlay.href      = game.deltaLink;
            btnPlay.className = 'btn btn-play';
            btnPlay.innerHTML = '<span class="btn-icon">▶</span>JOGAR NO DELTA';
            btnPlay.addEventListener('click', (e) => addRipple(btnPlay, e));
            content.appendChild(btnPlay);
        }

        // Botão baixar emulador
        const a = document.createElement('a');
        a.href      = emu.url;
        a.className = `btn ${btnCls}`;
        a.target    = '_blank';
        a.rel       = 'noopener noreferrer';
        a.innerHTML = `<span class="btn-icon">${emu.icon}</span>${emu.label}`;
        a.addEventListener('click', (e) => addRipple(a, e));
        content.appendChild(a);

        // Vídeo tutorial (se tiver)
        if (videoId) {
            const isShort = game.tutorialAndroidIsShort ||
                            (platform === 'android' && videoId === CONFIG.defaultTutorialAndroid && CONFIG.defaultTutorialAndroidIsShort);
            const embed = document.createElement('div');
            embed.className = isShort ? 'tutorial-embed tutorial-embed--short' : 'tutorial-embed';
            embed.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1"
                    title="Tutorial ${platform}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>`;
            content.appendChild(embed);
        }
    }

    // Tab iOS
    const iosBtn = document.createElement('button');
    iosBtn.className      = 'tab-btn';
    iosBtn.dataset.plat   = 'ios';
    iosBtn.innerHTML      = '🍎 iPhone';
    iosBtn.addEventListener('click', () => switchTo('ios'));
    tabs.appendChild(iosBtn);

    // Tab Android
    const andBtn = document.createElement('button');
    andBtn.className      = 'tab-btn';
    andBtn.dataset.plat   = 'android';
    andBtn.innerHTML      = '🤖 Android';
    andBtn.addEventListener('click', () => switchTo('android'));
    tabs.appendChild(andBtn);

    // Abre iPhone por padrão
    switchTo('ios');

    return section;
}

// ── View: Biblioteca ─────────────────────────

function renderLibrary() {
    document.getElementById('headerLibrary').style.display = '';
    document.getElementById('headerDetail').style.display  = 'none';
    document.getElementById('viewLibrary').style.display   = '';
    document.getElementById('viewDetail').style.display    = 'none';

    const grid = document.getElementById('viewLibrary');
    grid.innerHTML = '';

    GAMES.forEach((game, index) => {
        const a = document.createElement('a');
        a.className = 'game-card';
        a.href      = `?game=${encodeURIComponent(game.slug)}`;
        a.style.animationDelay = `${index * 0.06}s`;

        const cover = makeCover(game);
        const footer = document.createElement('div');
        footer.className = 'card-footer';
        footer.innerHTML = `
            <span class="card-game-title">${game.title}</span>
            <span class="card-cta">VER ▶</span>
        `;

        a.appendChild(cover);
        a.appendChild(footer);
        grid.appendChild(a);
    });
}

// ── View: Detalhe do jogo ────────────────────

function renderDetail(game) {
    document.getElementById('headerLibrary').style.display = 'none';
    document.getElementById('headerDetail').style.display  = '';
    document.getElementById('viewLibrary').style.display   = 'none';
    document.getElementById('viewDetail').style.display    = '';

    document.title = `${game.title} — ChaveBoy`;
    document.getElementById('detailTitle').textContent = game.title;

    // Capa
    const img = document.getElementById('detailCoverImg');
    img.src = game.cover || '';
    img.alt = game.title;

    const actions = document.getElementById('detailActions');
    actions.innerHTML = '';

    // Botão Baixar Jogo
    const btnDl = makeButton('BAIXAR JOGO', game.download, 'btn-download', '⬇');
    if (btnDl) actions.appendChild(btnDl);

    // Seção combinada: escolhe plataforma → mostra download + tutorial
    actions.appendChild(makeEmulatorSection(game));
}

// ── Tela de senha ────────────────────────────

function showPasswordScreen() {
    document.getElementById('pwScreen').style.display = 'flex';

    const input = document.getElementById('pwInput');
    const btn   = document.getElementById('pwBtn');
    const error = document.getElementById('pwError');
    const card  = document.getElementById('pwCard');

    setTimeout(() => input.focus(), 100);

    function attempt() {
        if (input.value === PASSWORD) {
            unlock();
            document.getElementById('pwScreen').style.display = 'none';
            renderLibrary();
        } else {
            input.classList.add('error');
            card.classList.remove('shake');
            void card.offsetWidth;
            card.classList.add('shake');
            error.textContent = 'SENHA INCORRETA';
            setTimeout(() => {
                input.classList.remove('error');
                error.textContent = '';
            }, 1800);
            input.value = '';
            input.focus();
        }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') attempt(); });
}

// ── Roteamento ───────────────────────────────

function route() {
    const raw  = new URLSearchParams(window.location.search).get('game');
    const slug = raw ? decodeURIComponent(raw) : null;

    if (slug) {
        const game = GAMES.find(g => g.slug === slug);
        if (game) renderDetail(game);
        else      renderLibrary();
    } else {
        if (isUnlocked()) renderLibrary();
        else              showPasswordScreen();
    }
}

// ── Loading ──────────────────────────────────

function startLoading() {
    const loading  = document.getElementById('loadingScreen');
    const mainPage = document.getElementById('mainPage');
    setTimeout(() => {
        loading.classList.add('hidden');
        mainPage.classList.add('visible');
    }, CONFIG.loadingDuration);
}

// ── Init ─────────────────────────────────────

function init() {
    document.getElementById('footerText').textContent = CONFIG.footer;
    route();
    startLoading();
}

document.addEventListener('DOMContentLoaded', init);

// ── Service Worker (offline) ─────────────────
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

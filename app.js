(() => {
  const defaults = {
    stretch: { name: 'تمدد غير متساوٍ', matrix: [2, 0, 0, 0.65] },
    shear: { name: 'قصّ مائل', matrix: [2, 1, 0, 1] },
    reflection: { name: 'انعكاس', matrix: [1, 0, 0, -1] },
    rotation: { name: 'دوران 30°', matrix: [Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6), Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)] }
  };
  const matrixInputs = ['m00', 'm01', 'm10', 'm11'].map(id => document.getElementById(id));
  const vxInput = document.getElementById('vx');
  const vyInput = document.getElementById('vy');
  const plot = document.getElementById('plot');
  const eigenResults = document.getElementById('eigen-results');
  const beforeValue = document.getElementById('before-value');
  const afterValue = document.getElementById('after-value');
  const vectorStatus = document.getElementById('vector-status');
  const palette = { background: '#fbfcfa', grid: '#e9eeea', axis: '#a8b3ac', text: '#849188', original: '#ee755b', transformed: '#3d8cbb', eigen: '#26725f', square: '#dbeae2', circle: '#91b6a2' };
  const origin = 260;
  const unit = 43;
  let activeExample = 'stretch';
  let currentLanguage = 'ar';
  let currentTheme = 'light';
  let lastQuizAnswer = null;
  const languageLabel = document.getElementById('language-label');
  const languageToggle = document.getElementById('language-toggle');
  const themeLabel = document.getElementById('theme-label');
  const themeIcon = document.getElementById('theme-icon');
  const themeToggle = document.getElementById('theme-toggle');
  const textTranslations = {
    'مختبر الاتجاهات الذاتية': 'Eigenvector Lab', 'الفكرة': 'The idea', 'المختبر': 'Interactive lab', 'اختبر نفسك': 'Test yourself',
    'الجبر الخطي، بصريًا': 'Linear algebra, visualized', 'بعض الاتجاهات': 'Some directions', 'لا': "don't", 'تتغيّر.': 'change.',
    'عندما تؤثّر مصفوفة في فضاء، تتبدّل معظم المتجهات. لكن هناك اتجاهات خاصة تبقى على خطّها — تلك هي': 'When a matrix acts on a space, most vectors change. But a few special directions stay on their line — those are',
    'المتجهات الذاتية.': 'eigenvectors.', 'جرّب التحويل بنفسك': 'Try the transformation', 'العلاقة التي نبحث عنها': 'The relationship we are looking for',
    'التحويل يغيّر الطول،': 'The transformation changes length,', 'لا الاتجاه.': 'not direction.', 'حرّك المصفوفة.': 'Move the matrix.',
    'راقب الاتجاه.': 'Watch the direction.', 'عدّل عناصر المصفوفة أو اختر مثالًا. الخط الأخضر يبيّن اتجاهًا ذاتيًا؛ والسهم الأزرق يبيّن ما يحدث بعد التحويل.': 'Edit the matrix entries or choose an example. The green line marks an eigenvector direction; the blue arrow shows what happens after the transformation.',
    'ابدأ بمثال': 'Start with an example', 'تمدد غير متساوٍ': 'Unequal stretch', 'قصّ مائل': 'Shear', 'انعكاس': 'Reflection', 'دوران 30°': '30° rotation',
    'مصفوفة التحويل': 'Transformation matrix', 'غيّر القيم وشاهد أثرها': 'Change the entries and see the effect', 'عنصر الصف الأول والعمود الأول': 'Row 1, column 1',
    'عنصر الصف الأول والعمود الثاني': 'Row 1, column 2', 'عنصر الصف الثاني والعمود الأول': 'Row 2, column 1', 'عنصر الصف الثاني والعمود الثاني': 'Row 2, column 2',
    'المتجه الذي نختبره': 'Vector under test', 'حرّك طرف المتجه أو أدخل مركباته': 'Adjust the vector or enter its components', 'المركبة السينية للمتجه': 'Vector x-component', 'المركبة الصادية للمتجه': 'Vector y-component',
    'الاتجاهات الذاتية للمصفوفة': 'Eigenvector directions of this matrix', 'القيمة الذاتية': 'Eigenvalue', 'تخبرنا بمقدار التمدّد أو الانكماش على الاتجاه الذاتي.': 'It tells us how much the eigenvector direction stretches or shrinks.',
    'المستوى الإحداثي': 'Coordinate plane', 'مباشر': 'Live', 'المتجه v': 'Vector v', 'صورته Av': 'Its image Av', 'اتجاه ذاتي': 'Eigenvector direction', 'قبل التحويل': 'Before transformation', 'بعد التحويل': 'After transformation',
    'الاتجاه تغيّر تحت هذا التحويل': "This transformation changes the vector's direction", 'جرّب بنفسك': 'Try it yourself',
    'في «التمدد غير المتساوي»، غيّر المتجه إلى': 'With “Unequal stretch,” set the vector to', '. هل بقي اتجاهه كما هو؟ ثم جرّب المتجه': '. Does its direction stay the same? Now try the vector',
    'انتقل إلى سؤال التحقق': 'Go to the quick check', 'ما الذي يحدث': 'What happens', 'هندسيًا؟': 'geometrically?', 'المصفوفة تحوّل': 'A matrix transforms',
    'كل مصفوفة': 'Every matrix', 'تمثّل تحويلًا خطيًا. فهي ترسل كل متجه': 'represents a linear transformation. It sends each vector', 'إلى متجه جديد': 'to a new vector',
    '، وقد يتغير اتجاهه وطوله.': ', which may change direction and length.', 'بعض الاتجاهات تبقى': 'Some directions stay fixed', 'إذا كان': 'If', 'مضاعفًا للمتجه': 'a scalar multiple of',
    '، فهذا يعني أن المتجهين على الخط نفسه. اتجاه': ', the two vectors lie on the same line. The direction of', 'محفوظ، ولذلك نسميه متجهًا ذاتيًا.': 'is preserved, so we call it an eigenvector.',
    'المضاعف هو λ': 'The multiplier is λ', 'العدد': 'The number', 'هو عامل القياس. إذا كان سالبًا، ينعكس الاتجاه. وإذا كان بين صفر وواحد، يقصر المتجه. وإذا زاد على واحد، يطول.': 'is the scale factor. A negative value reverses the direction. A value between zero and one shortens the vector; a value above one lengthens it.',
    'ملاحظة مهمة:': 'Important note:', 'الدوران وحده في المستوى بزاوية مثل 30° لا يملك متجهات ذاتية حقيقية غير صفرية؛ لأن كل اتجاه غير صفري يدور إلى اتجاه مختلف. أما الانعكاس أو التمدد فقد يحافظان على اتجاه أو أكثر.': 'A rotation in the plane by an angle such as 30° has no nonzero real eigenvectors: every nonzero direction turns to a different direction. A reflection or a stretch may preserve one or more directions.',
    'هل بقي الاتجاه؟': 'Does the direction stay fixed?', 'للمصفوفة': 'For the matrix', 'والمتجه': 'and vector', '، نحسب': ', we get', 'هل': 'Is',
    'متجه ذاتي؟ وإذا كان كذلك، فما قيمة': 'an eigenvector? If so, what is', '؟': '?', 'سؤال سريع': 'Quick check', 'اختر إجابة': 'Choose an answer',
    'نعم، و λ = 2': 'Yes, λ = 2', 'نعم، و λ = 3': 'Yes, λ = 3', 'لا، الاتجاه تغيّر': 'No, the direction changed', 'اختر إجابة لترى التفسير.': 'Choose an answer to see the explanation.',
    'تعلّم الجبر الخطي بالنظر والتجربة.': 'Learn linear algebra by seeing and experimenting.', 'إعداد:': 'Created by:'
  };
  const ariaTranslations = {
    'EigenLab الصفحة الرئيسية': 'EigenLab home', 'التنقل الرئيسي': 'Main navigation', 'التبديل إلى الإنجليزية': 'Switch to English', 'التبديل إلى العربية': 'Switch to Arabic',
    'تفعيل الوضع الليلي': 'Enable dark mode', 'تفعيل الوضع النهاري': 'Enable light mode', 'رسم توضيحي لمتجه قبل تحويله وبعده مع خط اتجاه ثابت': 'Illustration of a vector before and after a transformation, with a fixed direction',
    'اتجاه أخضر ثابت تحت تحويل المصفوفة': 'A fixed green direction under a matrix transformation', 'إعدادات التحويل': 'Transformation controls', 'عناصر المصفوفة': 'Matrix entries',
    'أمثلة جاهزة': 'Ready-made examples', 'خيارات الإجابة': 'Answer choices', 'المركبة السينية للمتجه': 'Vector x-component', 'المركبة الصادية للمتجه': 'Vector y-component',
    'رسم تفاعلي لتحويل المتجه والمستوى': 'Interactive plot of the vector and transformed plane'
  };
  const lightPalette = { background: '#fbfcfa', grid: '#e9eeea', axis: '#a8b3ac', text: '#849188', original: '#ee755b', transformed: '#3d8cbb', eigen: '#26725f', square: '#dbeae2', circle: '#91b6a2' };
  const darkPalette = { background: '#18241f', grid: '#2e3d36', axis: '#64766d', text: '#a7b5ad', original: '#ff927b', transformed: '#73bee9', eigen: '#83c8a7', square: '#244338', circle: '#6e9a84' };
  const translatedTextNodes = [];
  const translatedAriaNodes = [];
  const tr = (arabic, english) => currentLanguage === 'ar' ? arabic : english;

  const read = el => {
    const number = Number(el.value);
    return Number.isFinite(number) ? number : 0;
  };
  const fmt = (n, places = 2) => {
    const clean = Math.abs(n) < 0.0005 ? 0 : n;
    return clean.toFixed(places).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  };
  const point = (x, y) => `${fmt(origin + x * unit)},${fmt(origin - y * unit)}`;
  const dot = (x, y) => `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="2.2" fill="${palette.axis}"/>`;
  const line = (x1, y1, x2, y2, stroke, width, dash = '') => `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${stroke}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  const arrow = (vector, color, label, marker, opacity = 1) => {
    const mag = Math.hypot(vector[0], vector[1]);
    if (mag < 0.0001) return '';
    const factor = Math.min(1, 4.8 / mag);
    const x = vector[0] * factor;
    const y = vector[1] * factor;
    const [px, py] = point(x, y).split(',');
    const labelSide = x < -0.3 ? -16 : 11;
    const labelY = y < -0.3 ? 15 : -10;
    return `<line x1="${origin}" y1="${origin}" x2="${px}" y2="${py}" stroke="${color}" stroke-width="3.2" stroke-linecap="round" marker-end="url(#${marker})" opacity="${opacity}"/><text x="${fmt(Number(px) + labelSide)}" y="${fmt(Number(py) + labelY)}" fill="${color}" class="plot-label" text-anchor="middle">${label}</text>`;
  };
  const matrixAction = (matrix, vector) => [matrix[0] * vector[0] + matrix[1] * vector[1], matrix[2] * vector[0] + matrix[3] * vector[1]];

  function normalizedEigenvector(matrix, lambda) {
    const [a, b, c, d] = matrix;
    const rows = [[a - lambda, b], [c, d - lambda]];
    const row = Math.hypot(...rows[0]) >= Math.hypot(...rows[1]) ? rows[0] : rows[1];
    let vector = Math.hypot(...row) < 1e-9 ? [1, 0] : [row[1], -row[0]];
    const length = Math.hypot(...vector);
    vector = vector.map(value => value / length);
    if (vector[0] < -1e-8 || (Math.abs(vector[0]) < 1e-8 && vector[1] < 0)) vector = vector.map(value => -value);
    return vector;
  }

  function eigenSystem(matrix) {
    const [a, b, c, d] = matrix;
    const trace = a + d;
    const determinant = a * d - b * c;
    const discriminant = trace * trace - 4 * determinant;
    const tolerance = 1e-9 * Math.max(1, trace * trace, Math.abs(determinant));
    if (discriminant < -tolerance) return { values: [], allDirections: false, noReal: true };
    const root = Math.sqrt(Math.max(0, discriminant));
    const values = root < 1e-8
      ? [trace / 2]
      : [(trace + root) / 2, (trace - root) / 2];
    const scale = Math.max(1, Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d));
    const allDirections = values.length === 1 && Math.abs(a - d) < 1e-8 * scale && Math.abs(b) < 1e-8 * scale && Math.abs(c) < 1e-8 * scale;
    return { values, directions: allDirections ? [] : values.map(lambda => normalizedEigenvector(matrix, lambda)), allDirections, noReal: false };
  }

  function getCurrent() {
    const matrix = matrixInputs.map(read);
    const vector = [read(vxInput), read(vyInput)];
    return { matrix, vector, image: matrixAction(matrix, vector) };
  }

  function svgBase() {
    const parts = [`<defs>
      <marker id="arrow-original" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L9 4.5 L0 9 z" fill="${palette.original}"/></marker>
      <marker id="arrow-transformed" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L9 4.5 L0 9 z" fill="${palette.transformed}"/></marker>
      <clipPath id="plot-clip"><rect x="22" y="22" width="476" height="476" rx="2"/></clipPath>
      <style>.plot-label{font:italic 16px Georgia,serif}.axis-label{font:11px 'DM Mono',monospace;fill:${palette.text}}</style>
    </defs><rect class="plot-surface" x="18" y="18" width="484" height="484" rx="3" fill="${palette.background}"/>`];
    for (let i = -5; i <= 5; i++) {
      const x = origin + i * unit;
      const y = origin - i * unit;
      if (x >= 24 && x <= 496) parts.push(line(x, 24, x, 496, i === 0 ? palette.axis : palette.grid, i === 0 ? 1.4 : 0.8));
      if (y >= 24 && y <= 496) parts.push(line(24, y, 496, y, i === 0 ? palette.axis : palette.grid, i === 0 ? 1.4 : 0.8));
      if (i !== 0 && i % 2 === 0) {
        parts.push(`<text x="${x}" y="${origin + 16}" text-anchor="middle" class="axis-label">${i}</text>`);
        parts.push(`<text x="${origin - 10}" y="${y + 4}" text-anchor="end" class="axis-label">${i}</text>`);
      }
    }
    parts.push(`<path d="M493 256 L500 260 L493 264" fill="none" stroke="${palette.axis}" stroke-width="1.2"/><path d="M256 27 L260 20 L264 27" fill="none" stroke="${palette.axis}" stroke-width="1.2"/>`);
    parts.push(`<text x="481" y="278" class="axis-label">x</text><text x="270" y="39" class="axis-label">y</text>`);
    return parts;
  }

  function renderGeometry(matrix, vector, image, eigen) {
    const parts = svgBase();
    parts.push('<g clip-path="url(#plot-clip)">');

    const e1 = [matrix[0], matrix[2]];
    const e2 = [matrix[1], matrix[3]];
    const square = [[0,0], e1, [e1[0]+e2[0], e1[1]+e2[1]], e2].map(([x,y]) => point(x,y)).join(' ');
    parts.push(`<polygon points="${square}" fill="${palette.square}" fill-opacity=".58" stroke="#86aa97" stroke-width="1.3"/>`);

    const circlePoints = [];
    for (let i = 0; i <= 72; i++) {
      const t = (Math.PI * 2 * i) / 72;
      const x = Math.cos(t);
      const y = Math.sin(t);
      circlePoints.push(point(matrix[0]*x + matrix[1]*y, matrix[2]*x + matrix[3]*y));
    }
    parts.push(`<polyline points="${circlePoints.join(' ')}" fill="none" stroke="${palette.circle}" stroke-width="1.2" stroke-dasharray="3 4" opacity=".85"/>`);

    if (eigen.noReal) {
      parts.push(`<text x="260" y="83" text-anchor="middle" fill="#87938d" font-size="12">${tr('لا يوجد اتجاه ذاتي حقيقي لهذا الدوران', 'No real eigenvector direction for this rotation')}</text>`);
    } else if (eigen.allDirections) {
      [0, Math.PI / 6, Math.PI / 3, Math.PI / 2].forEach(angle => {
        const dx = Math.cos(angle) * unit * 5.7;
        const dy = Math.sin(angle) * unit * 5.7;
        parts.push(line(origin - dx, origin + dy, origin + dx, origin - dy, palette.eigen, 1.6, '6 5'));
      });
    } else {
      eigen.directions.forEach((direction, index) => {
        const x2 = origin + direction[0] * unit * 5.7;
        const y2 = origin - direction[1] * unit * 5.7;
        const x1 = origin - direction[0] * unit * 5.7;
        const y1 = origin + direction[1] * unit * 5.7;
        const opacity = index === 0 ? '.82' : '.55';
        parts.push(`<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${palette.eigen}" stroke-width="1.8" stroke-dasharray="6 5" opacity="${opacity}"/>`);
      });
    }

    parts.push(arrow(vector, palette.original, 'v', 'arrow-original'));
    parts.push(arrow(image, palette.transformed, 'Av', 'arrow-transformed'));
    parts.push('</g>');
    parts.push(dot(origin, origin));
    plot.innerHTML = parts.join('');
  }

  function renderEigen(matrix, eigen) {
    if (eigen.noReal) {
      eigenResults.innerHTML = `<div class="empty-eigen">${tr('هذا الدوران لا يملك قيمًا ذاتية حقيقية؛ لا يبقى أي اتجاه حقيقي على خطه بعد الدوران.', 'This rotation has no real eigenvalues; no real direction stays on its line.')}</div>`;
      return;
    }
    if (eigen.allDirections) {
      eigenResults.innerHTML = `<div class="eigen-card"><div><div class="eigen-main">λ = ${fmt(eigen.values[0])}</div><div class="eigen-direction">${tr('كل اتجاه غير صفري متجه ذاتي', 'Every nonzero direction is an eigenvector')}</div></div><div class="eigen-lambda">A = λI</div></div>`;
      return;
    }
    eigenResults.innerHTML = eigen.values.map((lambda, index) => {
      const v = eigen.directions[index];
      const effect = lambda < 0 ? tr('انعكاس', 'reflection') : lambda > 1.0001 ? tr('تمدد', 'stretch') : lambda < .9999 ? tr('انكماش', 'shrink') : tr('ثبات', 'unchanged');
      return `<div class="eigen-card"><div><div class="eigen-main">λ = ${fmt(lambda)}</div><div class="eigen-direction">${tr('اتجاه تقريبي:', 'Approx. direction:')} (${fmt(v[0])}, ${fmt(v[1])})</div></div><div class="eigen-lambda">${effect}</div></div>`;
    }).join('');
  }

  function render() {
    const { matrix, vector, image } = getCurrent();
    const eigen = eigenSystem(matrix);
    renderGeometry(matrix, vector, image, eigen);
    renderEigen(matrix, eigen);
    beforeValue.textContent = `v = (${fmt(read(vxInput), 2)}, ${fmt(read(vyInput), 2)})`;
    afterValue.textContent = `Av = (${fmt(image[0], 2)}, ${fmt(image[1], 2)})`;

    const normSq = vector[0] * vector[0] + vector[1] * vector[1];
    if (normSq < 1e-12) {
      vectorStatus.classList.remove('is-eigen');
      vectorStatus.textContent = tr('المتجه الصفري ليس متجهًا ذاتيًا؛ اختر متجهًا غير صفري.', 'The zero vector is not an eigenvector. Choose a nonzero vector.');
      return;
    }
    const factor = (vector[0] * image[0] + vector[1] * image[1]) / normSq;
    const residual = Math.hypot(image[0] - factor * vector[0], image[1] - factor * vector[1]);
    const isEigen = residual < 0.035 * Math.max(1e-6, Math.hypot(...image));
    vectorStatus.classList.toggle('is-eigen', isEigen);
    vectorStatus.textContent = isEigen
      ? tr(`نعم — هذا اتجاه ذاتي، ومعامل القياس λ ≈ ${fmt(factor)}`, `Yes — this is an eigenvector direction, with scale factor λ ≈ ${fmt(factor)}`)
      : tr('ليس اتجاهًا ذاتيًا هنا — تغيّر اتجاه المتجه', 'Not an eigenvector direction here — the vector changed direction');
  }

  function readPreference(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  }

  function savePreference(key, value) {
    try { localStorage.setItem(key, value); } catch { /* Preferences are optional. */ }
  }

  function cacheTranslations() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const key = node.nodeValue.trim();
      if (Object.prototype.hasOwnProperty.call(textTranslations, key)) translatedTextNodes.push({ node, original: node.nodeValue, key });
    }
    document.querySelectorAll('[aria-label]').forEach(element => {
      const key = element.getAttribute('aria-label');
      if (Object.prototype.hasOwnProperty.call(ariaTranslations, key)) translatedAriaNodes.push({ element, key });
    });
  }

  function updateThemeControls() {
    const dark = currentTheme === 'dark';
    themeIcon.textContent = dark ? '☀' : '☾';
    themeLabel.textContent = currentLanguage === 'ar' ? (dark ? 'نهاري' : 'ليلي') : (dark ? 'Light' : 'Dark');
    themeToggle.setAttribute('aria-label', currentLanguage === 'ar'
      ? (dark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي')
      : (dark ? 'Switch to light mode' : 'Switch to dark mode'));
  }

  function setLanguage(language, persist = true) {
    currentLanguage = language === 'en' ? 'en' : 'ar';
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.body.dataset.language = currentLanguage;
    translatedTextNodes.forEach(({ node, original, key }) => {
      const leading = original.match(/^\s*/)[0];
      const trailing = original.match(/\s*$/)[0];
      const value = currentLanguage === 'en' ? textTranslations[key] : key;
      node.nodeValue = `${leading}${value}${trailing}`;
    });
    translatedAriaNodes.forEach(({ element, key }) => element.setAttribute('aria-label', currentLanguage === 'en' ? ariaTranslations[key] : key));
    languageLabel.textContent = currentLanguage === 'ar' ? 'EN' : 'عربي';
    languageToggle.setAttribute('aria-label', currentLanguage === 'ar' ? 'التبديل إلى الإنجليزية' : 'التبديل إلى العربية');
    document.title = currentLanguage === 'ar' ? 'EigenLab — مختبر الاتجاهات الذاتية' : 'EigenLab — Eigenvector Lab';
    document.querySelector('meta[name="description"]').setAttribute('content', currentLanguage === 'ar'
      ? 'مختبر بصري تفاعلي لفهم المتجهات والقيم الذاتية من خلال التحويلات الهندسية.'
      : 'An interactive visual lab for learning eigenvectors and eigenvalues through geometric transformations.');
    plot.setAttribute('aria-label', currentLanguage === 'ar' ? 'رسم تفاعلي لتحويل المتجه والمستوى' : 'Interactive vector transformation plot');
    updateThemeControls();
    if (persist) savePreference('eigenlab-language', currentLanguage);
    render();
    if (lastQuizAnswer) feedback.textContent = explanations[lastQuizAnswer].text[currentLanguage];
  }

  function setTheme(theme, persist = true) {
    currentTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = currentTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', currentTheme === 'dark' ? '#18241f' : '#f5f6f2');
    Object.assign(palette, currentTheme === 'dark' ? darkPalette : lightPalette);
    updateThemeControls();
    if (persist) savePreference('eigenlab-theme', currentTheme);
    render();
  }

  cacheTranslations();
  languageToggle.addEventListener('click', () => setLanguage(currentLanguage === 'ar' ? 'en' : 'ar'));
  themeToggle.addEventListener('click', () => setTheme(currentTheme === 'dark' ? 'light' : 'dark'));

  matrixInputs.forEach(input => input.addEventListener('input', () => {
    document.querySelectorAll('.preset').forEach(button => button.classList.remove('active'));
    activeExample = null;
    render();
  }));
  [vxInput, vyInput].forEach(input => input.addEventListener('input', render));

  document.querySelectorAll('.preset').forEach(button => {
    button.addEventListener('click', () => {
      activeExample = button.dataset.example;
      const chosen = defaults[activeExample];
      matrixInputs.forEach((input, index) => { input.value = fmt(chosen.matrix[index], 2); });
      document.querySelectorAll('.preset').forEach(item => item.classList.toggle('active', item === button));
      render();
    });
  });

  const feedback = document.getElementById('quiz-feedback');
  const explanations = {
    two: { correct: false, text: { ar: 'قريب، لكن 2 لا يساوي المضاعف المطلوب: Av = (3, 3) = 3(1, 1)، لذا λ = 3.', en: 'Close, but 2 is not the multiplier: Av = (3, 3) = 3(1, 1), so λ = 3.' } },
    three: { correct: true, text: { ar: 'صحيح. Av = (3, 3) = 3(1, 1)، أي إن الاتجاه نفسه بقي، والمتجه تمدّد ثلاثة أضعاف.', en: 'Correct. Av = (3, 3) = 3(1, 1), so the direction stays fixed and the vector triples in length.' } },
    no: { correct: false, text: { ar: 'الاتجاه لم يتغير: (3, 3) هو ثلاثة أضعاف (1, 1). إذًا v متجه ذاتي، وλ = 3.', en: 'The direction did not change: (3, 3) is three times (1, 1). Thus v is an eigenvector and λ = 3.' } }
  };
  document.querySelectorAll('.quiz-option').forEach(button => {
    button.addEventListener('click', () => {
      lastQuizAnswer = button.dataset.answer;
      const answer = explanations[button.dataset.answer];
      document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected', 'wrong');
      });
      button.classList.add(answer.correct ? 'selected' : 'wrong');
      feedback.className = `quiz-feedback ${answer.correct ? 'correct' : 'incorrect'}`;
      feedback.textContent = answer.text[currentLanguage];
    });
  });

  setLanguage(readPreference('eigenlab-language', 'ar'), false);
  setTheme(readPreference('eigenlab-theme', 'light'), false);
})();

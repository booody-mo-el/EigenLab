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
  const palette = { grid: '#e9eeea', axis: '#a8b3ac', text: '#849188', original: '#ee755b', transformed: '#3d8cbb', eigen: '#26725f', square: '#dbeae2', circle: '#91b6a2' };
  const origin = 260;
  const unit = 43;
  let activeExample = 'stretch';

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
    let vector = [read(vxInput), read(vyInput)];
    if (Math.hypot(...vector) < 0.001) vector = [1, 0];
    return { matrix, vector, image: matrixAction(matrix, vector) };
  }

  function svgBase() {
    const parts = [`<defs>
      <marker id="arrow-original" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L9 4.5 L0 9 z" fill="${palette.original}"/></marker>
      <marker id="arrow-transformed" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L9 4.5 L0 9 z" fill="${palette.transformed}"/></marker>
      <clipPath id="plot-clip"><rect x="22" y="22" width="476" height="476" rx="2"/></clipPath>
      <style>.plot-label{font:italic 16px Georgia,serif}.axis-label{font:11px 'DM Mono',monospace;fill:${palette.text}}</style>
    </defs><rect x="18" y="18" width="484" height="484" rx="3" fill="#fbfcfa"/>`];
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
      parts.push(`<text x="260" y="83" text-anchor="middle" fill="#87938d" font-size="12">لا يوجد اتجاه ذاتي حقيقي لهذا الدوران</text>`);
    } else if (eigen.allDirections) {
      parts.push(`<line x1="95" y1="425" x2="425" y2="95" stroke="${palette.eigen}" stroke-width="1.6" stroke-dasharray="6 5" opacity=".42"/>`);
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
      eigenResults.innerHTML = '<div class="empty-eigen">هذا الدوران لا يملك قيمًا ذاتية حقيقية؛ لا يبقى أي اتجاه حقيقي على خطه بعد الدوران.</div>';
      return;
    }
    if (eigen.allDirections) {
      eigenResults.innerHTML = `<div class="eigen-card"><div><div class="eigen-main">λ = ${fmt(eigen.values[0])}</div><div class="eigen-direction">كل اتجاه غير صفري متجه ذاتي</div></div><div class="eigen-lambda">A = λI</div></div>`;
      return;
    }
    eigenResults.innerHTML = eigen.values.map((lambda, index) => {
      const v = eigen.directions[index];
      return `<div class="eigen-card"><div><div class="eigen-main">λ = ${fmt(lambda)}</div><div class="eigen-direction">اتجاه تقريبي: (${fmt(v[0])}, ${fmt(v[1])})</div></div><div class="eigen-lambda">${lambda < 0 ? 'انعكاس' : lambda > 1.0001 ? 'تمدد' : lambda < .9999 ? 'انكماش' : 'ثبات'}</div></div>`;
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
    const factor = (vector[0] * image[0] + vector[1] * image[1]) / normSq;
    const residual = Math.hypot(image[0] - factor * vector[0], image[1] - factor * vector[1]);
    const isEigen = residual < 0.035 * Math.max(1, Math.hypot(...image));
    vectorStatus.classList.toggle('is-eigen', isEigen);
    vectorStatus.textContent = isEigen
      ? `نعم — هذا اتجاه ذاتي، ومعامل القياس λ ≈ ${fmt(factor)}`
      : 'ليس اتجاهًا ذاتيًا هنا — تغيّر اتجاه المتجه';
  }

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
    two: { correct: false, text: 'قريب، لكن 2 لا يساوي المضاعف المطلوب: Av = (3, 3) = 3(1, 1)، لذا λ = 3.' },
    three: { correct: true, text: 'صحيح. Av = (3, 3) = 3(1, 1)، أي إن الاتجاه نفسه بقي، والمتجه تمدّد ثلاثة أضعاف.' },
    no: { correct: false, text: 'الاتجاه لم يتغير: (3, 3) هو ثلاثة أضعاف (1, 1). إذًا v متجه ذاتي، وλ = 3.' }
  };
  document.querySelectorAll('.quiz-option').forEach(button => {
    button.addEventListener('click', () => {
      const answer = explanations[button.dataset.answer];
      document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected', 'wrong');
      });
      button.classList.add(answer.correct ? 'selected' : 'wrong');
      feedback.className = `quiz-feedback ${answer.correct ? 'correct' : 'incorrect'}`;
      feedback.textContent = answer.text;
    });
  });

  render();
})();

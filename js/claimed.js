let catChart = null;

function buildCatChart(items) {
  const counts = {};
  items.forEach(it => { counts[it.category] = (counts[it.category] || 0) + 1; });
  const labels = Object.keys(counts);
  const values = Object.values(counts);
  const t = getChartTheme();

  const bgs = labels.map((_, i) => {
    const a = Math.max(0.78 - i * 0.14, 0.22);
    return `rgba(${t.barRgb}, ${a})`;
  });

  catChart = new Chart(document.getElementById('chart-cat'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: bgs,
        borderColor: t.accent,
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: t.text, font: { size: 11 } }, grid: { color: t.grid }, border: { color: t.axisBorder } },
        y: { ticks: { color: t.text, stepSize: 1 }, grid: { color: t.grid }, border: { color: t.axisBorder }, min: 0 }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function buildSummary(items) {
  const total = items.length;
  const completed = items.filter(i => i.status === 'completed').length;
  const pending = total - completed;
  const avgRating = items.length
    ? (items.reduce((s, i) => s + i.rating, 0) / items.length).toFixed(1)
    : '–';

  document.getElementById('summary-content').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
      <div style="display:flex;justify-content:space-between;">
        <span style="color:var(--text-muted);">Total claimed</span>
        <strong>${total}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:var(--text-muted);">Completed</span>
        <span style="color:var(--success-text);font-weight:600;">${completed}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:var(--text-muted);">Pending</span>
        <span style="color:var(--pending-text);font-weight:600;">${pending}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:var(--text-muted);">Avg. rating given</span>
        <span style="color:var(--star-fill);font-weight:600;">${avgRating} ★</span>
      </div>
    </div>
  `;
  document.getElementById('summary-card').style.display = '';
}

document.addEventListener('themeChanged', () => {
  if (!catChart) return;
  const t = getChartTheme();
  catChart.options.scales.x.ticks.color = t.text;
  catChart.options.scales.y.ticks.color = t.text;
  catChart.options.scales.x.grid.color = t.grid;
  catChart.options.scales.y.grid.color = t.grid;
  catChart.options.scales.x.border.color = t.axisBorder;
  catChart.options.scales.y.border.color = t.axisBorder;
  catChart.data.datasets[0].borderColor = t.accent;
  catChart.update('none');
});

document.addEventListener('DOMContentLoaded', function () {
  fetch('../data/mock-claimed.json')
    .then(r => r.json())
    .then(items => {
      const el = document.getElementById('claimed-list');
      if (!items.length) {
        el.innerHTML = `<div class="empty-state"><div class="empty-icon">🛍️</div><p>No claimed items yet.</p></div>`;
        return;
      }
      el.innerHTML = items.map(createClaimedRow).join('');
      buildCatChart(items);
      buildSummary(items);
      showToast('Claimed Items', `You have ${items.length} claimed items.`, 'info', 2500);
    })
    .catch(() => {
      document.getElementById('claimed-list').innerHTML =
        '<p style="color:var(--text-muted);">Could not load items.</p>';
      showToast('Error', 'Failed to load claimed items.', 'error');
    });
});

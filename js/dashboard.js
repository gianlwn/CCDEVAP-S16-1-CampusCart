const charts = {};

const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    if (!chart.config.options._centerText) return;
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const t = getChartTheme();
    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = t.text;
    ctx.font = 'bold 20px Segoe UI, sans-serif';
    ctx.fillText(total, cx, cy - 9);
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.fillStyle = t.text;
    ctx.globalAlpha = 0.55;
    ctx.fillText('reports', cx, cy + 10);
    ctx.restore();
  }
};
Chart.register(centerTextPlugin);

const CAT_COLORS = {
  'Electronics': 'rgba(18,124,112,0.85)',
  'Books': 'rgba(201,138,46,0.85)',
  'Lab Tools': 'rgba(14,74,68,0.85)',
  'Clothing': 'rgba(226,100,59,0.85)',
  'Others': 'rgba(122,144,141,0.85)',
};

const REPORT_COLORS = ['#127C70', '#C98A2E', '#E2643B'];

function buildCharts(data) {
  const t = getChartTheme();

  const ratings = data.sellerRatingHistory.map(d => d.rating);
  const maxR = Math.max(...ratings);
  const lastIdx = ratings.length - 1;
  const barColors = ratings.map((r, i) =>
    (i === lastIdx || r === maxR) ? '#0E4A44' : '#127C70'
  );

  charts.rating = new Chart(document.getElementById('chart-seller-rating'), {
    type: 'bar',
    data: {
      labels: data.sellerRatingHistory.map(d => d.month),
      datasets: [{
        label: 'Rating',
        data: ratings,
        backgroundColor: barColors,
        borderColor: barColors,
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0, max: 5,
          ticks: { color: t.text, stepSize: 1 },
          grid: { color: t.grid },
          border: { color: t.axisBorder }
        },
        x: {
          ticks: { color: t.text },
          grid: { color: 'transparent' },
          border: { color: t.axisBorder }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw} ★` } }
      }
    }
  });

  charts.categories = new Chart(document.getElementById('chart-categories'), {
    type: 'bar',
    data: {
      labels: data.itemsByCategory.map(d => d.category),
      datasets: [{
        label: 'Items',
        data: data.itemsByCategory.map(d => d.count),
        backgroundColor: data.itemsByCategory.map(d => CAT_COLORS[d.category] || 'rgba(122,144,141,0.85)'),
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: t.text, stepSize: 1 },
          grid: { color: t.grid },
          border: { color: t.axisBorder }
        },
        y: {
          ticks: { color: t.text },
          grid: { color: 'transparent' },
          border: { color: t.axisBorder }
        }
      },
      plugins: { legend: { display: false } }
    }
  });

  charts.reports = new Chart(document.getElementById('chart-reports'), {
    type: 'doughnut',
    _centerText: true,
    data: {
      labels: data.reportsOnListing.map(d => d.label),
      datasets: [{
        data: data.reportsOnListing.map(d => d.value),
        backgroundColor: REPORT_COLORS,
        borderColor: t.cardBg,
        borderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '64%',
      _centerText: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}` }
        }
      }
    }
  });

  const legend = document.getElementById('reports-legend');
  legend.innerHTML = data.reportsOnListing.map((d, i) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${REPORT_COLORS[i]}"></span>
      <span class="legend-label">${d.label}</span>
      <strong class="legend-val">${d.value}</strong>
    </div>
  `).join('');

  const soldData = data.itemsSoldMonthly;
  const lastSoldI = soldData.length - 1;
  const ptColors = soldData.map((_, i) => i === lastSoldI ? '#0E4A44' : '#127C70');
  const ptRadius = soldData.map((_, i) => i === lastSoldI ? 7 : 4);

  charts.sold = new Chart(document.getElementById('chart-sold'), {
    type: 'line',
    data: {
      labels: soldData.map(d => d.month),
      datasets: [{
        label: 'Items Sold',
        data: soldData.map(d => d.sold),
        borderColor: '#127C70',
        backgroundColor: 'rgba(18,124,112,0.08)',
        pointBackgroundColor: ptColors,
        pointBorderColor: ptColors,
        pointRadius: ptRadius,
        pointHoverRadius: 7,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          ticks: { color: t.text, stepSize: 1 },
          grid: { color: t.grid },
          border: { color: t.axisBorder }
        },
        x: {
          ticks: { color: t.text },
          grid: { color: 'transparent' },
          border: { color: t.axisBorder }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw} sold` } }
      }
    }
  });
}

function refreshChartTheme() {
  const t = getChartTheme();

  const gridConfig = {
    rating:     { x: 'transparent', y: t.grid },
    categories: { x: t.grid,        y: 'transparent' },
    sold:       { x: 'transparent', y: t.grid },
  };

  ['rating', 'categories', 'sold'].forEach(key => {
    const ch = charts[key];
    if (!ch) return;
    ch.options.scales.x.ticks.color = t.text;
    ch.options.scales.y.ticks.color = t.text;
    ch.options.scales.x.grid.color = gridConfig[key].x;
    ch.options.scales.y.grid.color = gridConfig[key].y;
    ch.options.scales.x.border.color = t.axisBorder;
    ch.options.scales.y.border.color = t.axisBorder;
    ch.update('none');
  });

  if (charts.reports) {
    charts.reports.data.datasets[0].borderColor = t.cardBg;
    charts.reports.update('none');
  }
}

document.addEventListener('themeChanged', refreshChartTheme);

document.addEventListener('DOMContentLoaded', function () {
  fetch('../data/mock-dashboard.json')
    .then(r => r.json())
    .then(data => {
      document.getElementById('kpi-total-listings').textContent = data.kpi.totalListings;
      document.getElementById('kpi-items-sold').textContent = data.kpi.itemsSold;
      document.getElementById('kpi-earnings').textContent = '₱' + data.kpi.totalEarnings.toLocaleString();
      document.getElementById('kpi-avg-rating').textContent = data.kpi.avgRating + ' ★';
      document.getElementById('kpi-open-reports').textContent = data.kpi.openReports;

      buildCharts(data);
    })
    .catch(() => showToast('Error', 'Could not load dashboard data.', 'error'));
});

    let allRatings = [];
    let distChart = null;
    let editingId = null;
    let pickedStar = 0;

    function renderAvg(items) {
      if (!items.length) return;
      const avg = items.reduce((s, i) => s + i.rating, 0) / items.length;
      const avgStr = avg.toFixed(1);
      const rounded = Math.round(avg);
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        stars += `<span class="star${i <= rounded ? ' filled' : ''}">★</span>`;
      }
      document.getElementById('avg-rating-display').innerHTML = `
        <div class="big-number">${avgStr}</div>
        <div class="stars-row">${stars}</div>
        <div class="count">${items.length} review${items.length !== 1 ? 's' : ''}</div>
      `;
    }

    function buildDistChart(items) {
      const t = getChartTheme();
      const dist = [0, 0, 0, 0, 0];
      items.forEach(i => dist[i.rating - 1]++);

      const DIST_COLORS = [
        'rgba(200,65,65,0.75)',
        'rgba(200,121,65,0.75)',
        'rgba(200,180,65,0.75)',
        'rgba(100,160,90,0.75)',
        'rgba(74,124,89,0.85)',
      ];

      if (distChart) distChart.destroy();

      distChart = new Chart(document.getElementById('chart-dist'), {
        type: 'bar',
        data: {
          labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
          datasets: [{
            data: dist,
            backgroundColor: DIST_COLORS,
            borderRadius: 5,
            borderWidth: 0,
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

    function renderList() {
      const el = document.getElementById('ratings-list');
      if (!allRatings.length) {
        el.innerHTML = `<div class="empty-state"><div class="empty-icon">⭐</div><p>No ratings yet.</p></div>`;
        return;
      }
      el.innerHTML = allRatings.map(createRatingsRow).join('');
    }

    function editRating(id) {
      editingId = id;
      const item = allRatings.find(r => r.id === id);
      if (!item) return;
      document.getElementById('modal-review').value = item.review || '';
      pickedStar = item.rating;
      _highlightStars(pickedStar);
      document.getElementById('edit-modal').style.display = 'flex';
    }

    function closeEdit() {
      document.getElementById('edit-modal').style.display = 'none';
      editingId = null;
    }

    function saveEdit() {
      if (!editingId) return;
      const item = allRatings.find(r => r.id === editingId);
      if (!item) return;
      item.rating = pickedStar || item.rating;
      item.review = document.getElementById('modal-review').value.trim() || item.review;
      closeEdit();
      renderList();
      renderAvg(allRatings);
      buildDistChart(allRatings);
      showToast('Updated', 'Your rating has been updated.', 'success');
    }

    function deleteRating(id) {
      showConfirm(
        'Remove this Rating?',
        'This will permanently remove the rating. This action cannot be undone.',
        () => {
          allRatings = allRatings.filter(r => r.id !== id);
          renderList();
          renderAvg(allRatings);
          buildDistChart(allRatings);
          showToast('Removed', 'Rating has been removed.', 'success');
        }
      );
    }

    function _highlightStars(val) {
      document.querySelectorAll('.modal-star').forEach(s => {
        const v = parseInt(s.dataset.val);
        s.style.color = v <= val ? 'var(--star-fill)' : 'var(--star-empty)';
      });
    }

    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('.modal-star').forEach(star => {
        star.addEventListener('mouseover', () => _highlightStars(parseInt(star.dataset.val)));
        star.addEventListener('mouseleave', () => _highlightStars(pickedStar));
        star.addEventListener('click', () => {
          pickedStar = parseInt(star.dataset.val);
          _highlightStars(pickedStar);
        });
      });

      document.getElementById('edit-modal').addEventListener('click', function (e) {
        if (e.target === this) closeEdit();
      });

      fetch('../data/mock-ratings.json')
        .then(r => r.json())
        .then(items => {
          allRatings = items;
          renderList();
          renderAvg(items);
          buildDistChart(items);
        })
        .catch(() => {
          document.getElementById('ratings-list').innerHTML =
            '<p style="color:var(--text-muted);">Could not load ratings.</p>';
          showToast('Error', 'Failed to load ratings.', 'error');
        });
    });

    document.addEventListener('themeChanged', () => {
      if (!distChart) return;
      const t = getChartTheme();
      distChart.options.scales.x.ticks.color = t.text;
      distChart.options.scales.y.ticks.color = t.text;
      distChart.options.scales.x.grid.color = t.grid;
      distChart.options.scales.y.grid.color = t.grid;
      distChart.options.scales.x.border.color = t.axisBorder;
      distChart.options.scales.y.border.color = t.axisBorder;
      distChart.update('none');
    });

    window.editRating = editRating;
    window.deleteRating = deleteRating;

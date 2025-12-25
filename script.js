const checkboxes = document.querySelectorAll('.surah-list input[type="checkbox"]');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
const themeBtn = document.getElementById('toggle-theme');

let pieChart, barChart;

// ===== PROGRESS =====
function updateProgress() {
  const total = checkboxes.length;
  const learned = Array.from(checkboxes).filter(cb => cb.checked).length;
  const percent = (learned / total) * 100;
  progressFill.style.width = percent + '%';
  progressText.textContent = `${learned} / ${total} sourates apprises`;
  updateCharts(learned, total - learned);
}

// ===== LOCALSTORAGE =====
function saveProgress() {
  checkboxes.forEach((cb, index) => {
    localStorage.setItem(`surah_${index}`, cb.checked);
  });
}

function loadProgress() {
  checkboxes.forEach((cb, index) => {
    const saved = localStorage.getItem(`surah_${index}`);
    if (saved === 'true') cb.checked = true;
  });
}

// ===== FILTRE & RECHERCHE =====
function applyFilter() {
  const filter = filterSelect.value;
  const search = searchInput.value.toLowerCase();
  checkboxes.forEach(cb => {
    const li = cb.closest('li');
    const text = li.textContent.toLowerCase();
    let visible = true;
    if (filter === 'learned' && !cb.checked) visible = false;
    if (filter === 'not-learned' && cb.checked) visible = false;
    if (!text.includes(search)) visible = false;
    li.style.display = visible ? 'flex' : 'none';
  });
}

// ===== GRAPHIQUES =====
function updateCharts(learned, notLearned) {
  const pieData = {labels:['Apprises','Non apprises'], datasets:[{data:[learned, notLearned], backgroundColor:['#ff6f61','#ddd']}]};
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById('pieChart'), {type:'pie', data: pieData});

  const barData = {labels:['Sourates'], datasets:[{label:'Apprises', data:[learned], backgroundColor:'#ff6f61'},{label:'Non apprises', data:[notLearned], backgroundColor:'#ddd'}]};
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById('barChart'), {type:'bar', data: barData, options:{scales:{y:{beginAtZero:true}}}});
}

// ===== EXPORT PDF / EXCEL =====
document.getElementById('export-pdf').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  checkboxes.forEach((cb, i) => {
    doc.text(`${i+1}. ${cb.closest('li').querySelector('a').textContent} - ${cb.checked ? '✅' : '❌'}`, 10, 10 + i*7);
  });
  doc.save('hafiz_tracker.pdf');
});

document.getElementById('export-excel').addEventListener('click', () => {
  const data = Array.from(checkboxes).map(cb => [cb.closest('li').querySelector('a').textContent, cb.checked ? 'Oui' : 'Non']);
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hafiz");
  XLSX.writeFile(wb, "hafiz_tracker.xlsx");
});

// ===== THEME =====
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

function loadTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark');
}

// ===== EVENTS =====
checkboxes.forEach(cb => cb.addEventListener('change', () => { updateProgress(); saveProgress(); }));
searchInput.addEventListener('input', applyFilter);
filterSelect.addEventListener('change', applyFilter);

// ===== INIT =====
window.addEventListener('load', () => {
  loadProgress();
  updateProgress();
  loadTheme();
  applyFilter();
});

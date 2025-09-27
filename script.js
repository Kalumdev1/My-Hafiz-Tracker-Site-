const checkboxes = document.querySelectorAll('.surah-list input[type="checkbox"]');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
const body = document.body;

let pieChart, barChart;

// ===== FONCTIONS =====
function updateProgress(){
  const total = checkboxes.length;
  const learned = Array.from(checkboxes).filter(cb => cb.checked).length;
  const percent = (learned/total)*100;
  progressFill.style.width = percent + '%';
  progressText.textContent = `${learned} / ${total} sourates apprises`;
  updateCharts(learned, total-learned);
}

function applyFilter(){
  const filter = filterSelect.value;
  checkboxes.forEach(cb => {
    const li = cb.closest('li');
    if(filter==='learned' && !cb.checked) li.style.display='none';
    else if(filter==='not-learned' && cb.checked) li.style.display='none';
    else li.style.display='flex';
  });
}

function applySearch(){
  const term = searchInput.value.toLowerCase();
  checkboxes.forEach(cb=>{
    const li = cb.closest('li');
    const text = li.querySelector('a').textContent.toLowerCase();
    li.style.display = text.includes(term)? 'flex':'none';
  });
}

// ===== EVENTS =====
checkboxes.forEach(cb => cb.addEventListener('change', ()=>{
  updateProgress();
  applyFilter();
}));

searchInput.addEventListener('input', applySearch);
filterSelect.addEventListener('change', applyFilter);

// ===== GRAPHIQUES =====
function updateCharts(learned, notLearned){
  const data = [learned, notLearned];
  const colors = ['#ff6f61', '#ddd'];

  if(!pieChart){
    const ctx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(ctx,{
      type:'pie',
      data:{labels:['Apprises','Non apprises'],datasets:[{data,backgroundColor:colors}]},
      options:{animation:{animateRotate:true,animateScale:true}}
    });
  } else {
    pieChart.data.datasets[0].data = data;
    pieChart.update();
  }

  if(!barChart){
    const ctx2 = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(ctx2,{
      type:'bar',
      data:{
        labels:['Sourates'],
        datasets:[
          {label:'Apprises',data:[learned],backgroundColor:'#ff6f61'},
          {label:'Non apprises',data:[notLearned],backgroundColor:'#ddd'}
        ]
      },
      options:{responsive:true,animation:{duration:800}}
    });
  } else {
    barChart.data.datasets[0].data=[learned];
    barChart.data.datasets[1].data=[notLearned];
    barChart.update();
  }
}

// ===== EXPORT PDF =====
document.getElementById('export-pdf').addEventListener('click', ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y=10;
  checkboxes.forEach((cb,i)=>{
    const li=cb.closest('li');
    doc.text(`${i+1}. ${li.querySelector('a').textContent} - ${cb.checked?'✅':'❌'}`,10,y);
    y+=10;
    if(y>280){doc.addPage();y=10;}
  });
  doc.save('hafiz_tracker.pdf');
});

// ===== EXPORT EXCEL =====
document.getElementById('export-excel').addEventListener('click', ()=>{
  const wb=XLSX.utils.book_new();
  const wsData=[['Sourate','Apprise']];
  checkboxes.forEach(cb=>{
    const li=cb.closest('li');
    wsData.push([li.querySelector('a').textContent,cb.checked?'Oui':'Non']);
  });
  const ws=XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb,ws,'Sourates');
  XLSX.writeFile(wb,'hafiz_tracker.xlsx');
});

// ===== MODE JOUR/NUIT =====
const toggleBtn=document.createElement('button');
toggleBtn.textContent='🌙 Jour/Nuit';
Object.assign(toggleBtn.style,{
  position:'fixed',bottom:'20px',right:'20px',padding:'12px 18px',
  border:'none',borderRadius:'10px',cursor:'pointer',background:'#ff6f61',
  color:'white',zIndex:'1000',transition:'all 0.3s'
});
document.body.appendChild(toggleBtn);
toggleBtn.addEventListener('click',()=>body.classList.toggle('dark'));

// ===== INITIALISATION =====
updateProgress();
updateCharts(0,checkboxes.length);

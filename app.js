// Simple app: stores entries in localStorage and draws a Chart.js chart
const LS_KEY = 'gitte_entries_v1'
let chart = null

function loadEntries(){
  const raw = localStorage.getItem(LS_KEY)
  return raw? JSON.parse(raw): []
}
function saveEntries(arr){
  localStorage.setItem(LS_KEY, JSON.stringify(arr))
}
function addEntry(percent, km){
  const entries = loadEntries()
  entries.push({t: Date.now(), percent: Number(percent), km: Number(km)})
  saveEntries(entries)
}
function clearEntries(){
  localStorage.removeItem(LS_KEY)
}

function showToast(text){
  const t = document.getElementById('toast')
  t.textContent = text
  t.classList.remove('hidden')
  setTimeout(()=> t.classList.add('hidden'), 1800)
}

function switchView(toChart){
  document.getElementById('home').classList.toggle('hidden', toChart)
  document.getElementById('chartView').classList.toggle('hidden', !toChart)
  if(toChart) renderChart()
}

function renderChart(){
  const entries = loadEntries()
  const labels = entries.map(e=> new Date(e.t).toLocaleString())
  const percents = entries.map(e=> e.percent)
  const kms = entries.map(e=> e.km)

  const ctx = document.getElementById('chartCanvas').getContext('2d')
  if(chart) chart.destroy()

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {label:'Batteri %', data: percents, borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.12)', tension:0.2, yAxisID:'percent'},
        {label:'KM', data: kms, borderColor: '#0ea5ff', backgroundColor: 'rgba(14,165,255,0.08)', tension:0.2, yAxisID:'km'}
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      scales: {
        percent: { type:'linear', position:'left', min:0, max:100, title:{display:true,text:'%'} },
        km: { type:'linear', position:'right', grid:{display:false}, title:{display:true,text:'KM'} }
      },
      plugins: { legend:{position:'bottom'} }
    }
  })

  // populate list
  const list = document.getElementById('entriesList')
  list.innerHTML = ''
  if(entries.length===0){ list.innerHTML = '<div class="entry">Ingen data endnu</div>' }
  entries.slice().reverse().forEach(e=>{
    const d = document.createElement('div'); d.className='entry'
    d.innerHTML = `<div>${new Date(e.t).toLocaleString()}</div><div>${e.percent}% — ${e.km} KM</div>`
    list.appendChild(d)
  })
}

// events
window.addEventListener('DOMContentLoaded', ()=>{
  const percentInput = document.getElementById('percentInput')
  const kmInput = document.getElementById('kmInput')
  document.getElementById('saveBtn').addEventListener('click', ()=>{
    const p = percentInput.value.trim(); const k = kmInput.value.trim()
    if(p==='' || k===''){ showToast('Udfyld begge felter'); return }
    if(Number(p)<0 || Number(p)>100){ showToast('% skal være 0-100'); return }
    addEntry(p,k)
    percentInput.value=''
    kmInput.value=''
    showToast('Gemte punkt')
  })

  document.getElementById('showChartBtn').addEventListener('click', ()=> switchView(true))
  document.getElementById('backBtn').addEventListener('click', ()=> switchView(false))
  document.getElementById('clearBtn').addEventListener('click', ()=>{
    if(!confirm('Slet alle gemte punkter?')) return
    clearEntries(); renderChart(); showToast('Slettet')
  })

  // initial placeholder sample if no data - optional
  if(loadEntries().length===0){
    // don't auto-add sample, leave empty so your mother can add real data
  }
})

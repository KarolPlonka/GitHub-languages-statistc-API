google.charts.load('current', {'packages':['corechart']});

const input = document.getElementById('post')
const Btn = document.getElementById('send')
const error_div = document.getElementById('error_field')
const chart_div = document.getElementById('piechart')



Btn.addEventListener('click', buttonClick)
input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      buttonClick(e)
    }
  })

async function buttonClick(e) {
    e.preventDefault()
    
    const res = await fetch("user/" + input.value,
    {
        method: 'GET'
    })

    if (res.ok){
        var data = await res.json()
        data = data['lang_stats']
    
        var dataArray = Object.keys(data).map((key) => [key, Math.round(data[key] * 100)])
        dataArray.unshift(['Language', 'usage'])
    
        var dataTableData = google.visualization.arrayToDataTable(dataArray)
        var options = {'title':'Language use', 'width':800, 'height':400}
    
        var chart = new google.visualization.PieChart(document.getElementById('piechart'))

        error_div.innerHTML = ""
        chart.draw(dataTableData, options)
    }

    else if(res.status == 404){
        error_div.innerHTML = "<i>User not found</i>"
        chart_div.innerHTML = ""
    }

}

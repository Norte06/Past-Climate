const Ny = 41;
const Nm = 12;
const years = Array.from(new Array(Ny)).map((v,i) => 1981 + i);
const months = Array.from(new Array(Nm)).map((v,i) => 1 + i);

const years5 = ['1984-06','1989-06','1994-06','1999-06','2004-06','2009-06','2014-06','2019-06'];
const Ny5 = years5.length;
const data_url = "https://raw.githubusercontent.com/Norte06/Past-Climate/master/data/ERA5/"
// const data_url = "../data/ERA5/"

const config_graph = {
  responsive: true,
  displayModeBar: false,
}

function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; });
}
function average(arr) {
  return arr.reduce((prev, current) =>
      prev+current
  ) / arr.length;
};
function calc_climatology(data,N){
  let clim = new Array();
  for(let i = 0; i < N; i++){
    const j = i * 12;
    clim.push(average(data.slice(j,j+12)));
  }
  return clim;
};
function calc_climatology_5year(data,N){
  let clim = new Array();
  for(let i = 1; i <= N; i++){
    const j = i * 60;
    clim.push(average(data.slice(j,j+60)));
  }
  return clim;
};

const data_fname = data_url + 'temp_monthly_1981-2021_0p1deg_japan.csv';

Plotly.d3.csv(data_fname, function(err,rows){
  const row_keys = Object.keys(rows[0]);
  const N = row_keys.length;
  // const all_months = row_keys.slice(1,N);

  //////////////////////////////////////////////
  // Draw Map
  //////////////////////////////////////////////

  function plot_map(chosenMonth){
    let temp_Data = unpack(rows,chosenMonth);
    let geojson_url = data_url + "grid_geometry_0p1deg_japan.geojson";
    const data_map = [{
      type: "choroplethmapbox",
      geojson: geojson_url,
      locations: unpack(rows,'fips'),
      z: temp_Data,
      zmax: 30,
      zmin: -15,
      colorscale: "Portland",
      hovertemplate: '気温: %{z:.1f}˚C<extra></extra>',
      marker: {line:{width:0}, opacity:0.6},
      colorbar: {y:0, yanchor:"bottom",
        title:{text: "月平均気温[˚C]", side: "right", font:{size:16}}
      },
    }];
    const mapbox_style = "mapbox://styles/notica06/cknd84i1t0dl517o7e7ask0b7";
    const layout_map = {
      mapbox: {
        style: mapbox_style, 
        center: {lon: 134.5, lat: 35.5}, 
        zoom: 3.8
      },
      margin: {l:30,r:30,t:45,b:10},
      title: {
        font: {size: 18},
        text: "月平均気温",
        y: 0.98,
      },
    };
    const myToken = "pk.eyJ1Ijoibm90aWNhMDYiLCJhIjoiY2tzb3VvcGl5MTJkaDJycDdqcmZ2MGd1bSJ9.T_3eHSj2H0kby2G8I3cAWQ";
    const config_map = {
      mapboxAccessToken: myToken,
      responsive: true,
      displayModeBar: false,
    };
    Plotly.newPlot('plot_map', data_map, layout_map, config_map);
    // console.log(chosenMonth);
  };

  //////////////////////////////////////////////
  // Draw Warming Strips (Heatmap)
  //////////////////////////////////////////////

  function plotWarmingStrips(ind) {
    const pointdata = Object.values(rows[ind]);
    const Nt = pointdata.length-1;
    const timeseries = pointdata.slice(0,Nt).map(Number);
    const clim_1year = calc_climatology(timeseries,Ny);
    const y_con = new Array(Ny).fill(1);

    const data_graph = [{
      x: years,
      y: y_con,
      z: clim_1year,
      type: 'heatmap',
      colorscale: [
        ['0.0', 'rgb(49,54,149)'],
        ['0.11111111', 'rgb(69,117,180)'],
        ['0.22222222', 'rgb(116,173,209)'],
        ['0.33333333', 'rgb(171,217,233)'],
        ['0.44444444', 'rgb(224,243,248)'],
        ['0.55555556', 'rgb(254,224,144)'],
        ['0.66666667', 'rgb(253,174,97)'],
        ['0.77777778', 'rgb(244,109,67)'],
        ['0.88888889', 'rgb(215,48,39)'],
        ['1.0', 'rgb(165,0,38)']
      ],
      showscale: false,
      hoverinfo: 'x+z',
      hovertemplate: '%{x}年 %{z:.1f}˚C<extra></extra>',
    }];
    const layout_graph = {
      title: {
        text: 'Warming Stripe',
        y: 0.95,
      },
      xaxis: {
        type: 'date',
        tickformat: '%Y',
        dtick: 'M60',
      },
      yaxis: {
        visible: false,
      },
      showlegend: false,
      font: {size: 12},
      margin: {l:30,r:30,t:25,b:30},
    };
    Plotly.newPlot('plot_temp_stripe', data_graph, layout_graph, config_graph);
  }

  //////////////////////////////////////////////
  // Draw Yearly Line Graph
  //////////////////////////////////////////////

  function plot_temp_yearly(ind) {
    const pointdata = Object.values(rows[ind]);
    const Nt = pointdata.length-1;

    const timeseries = pointdata.slice(0,Nt).map(Number);
    const clim_1year = calc_climatology(timeseries,Ny);
    const clim_5year = calc_climatology_5year(timeseries,Ny5);

    const data_graph = [{
      x: years,
      y: clim_1year,
      marker:{color:'forestgreen'},
      name: '年平均',
      hovertemplate: '%{y:.1f}˚C',
    },{
      x: years5,
      y: clim_5year,
      marker:{color:'darkorange'},
      name: '5年平均',
      hovertemplate: '%{y:.1f}˚C',
    }];
    const layout_graph = {
      title: {
        text: '年平均気温',
        y: 0.9,
      },
      xaxis: {
        title: {text:'年',standoff:10},
        type: 'date',
        tickformat: '%Y',
        dtick: 'M60',
        standoff: 10,
      },
      yaxis: {
        title: {text:'気温[˚C]',standoff:8},
      },
      showlegend: false,
      font: {size: 12},
      margin: {l:60,r:60,t:50,b:50},
    };
    Plotly.newPlot('plot_temp_yearly', data_graph, layout_graph, config_graph);
  };

  //////////////////////////////////////////////
  // Draw Monethly Line Graph
  //////////////////////////////////////////////

  function plot_temp_monthly(ind) {
    const pointdata = Object.values(rows[ind]);
    const Nt = pointdata.length-1;
    const timeseries = pointdata.slice(0,Nt).map(Number);

    const monthly_ave = new Array();
    for (let i = 0; i < Nm; i++){
      let endpt = i + (Ny - 1) * Nm + 1;
      let tmp_arr = new Array();
      for (let j = i; j < endpt; j+=Nm){
        let k = 0;
        tmp_arr.push(timeseries[j]);
        k += 1;
      }
      monthly_ave.push(average(tmp_arr));
    }

    const data_graph = [
    {
      x: months,
      y: monthly_ave,
      line: {color: "rgb(231,107,243)"}, 
      mode: "lines",
      hovertemplate: '%{y:.1f}˚C<extra></extra>',
    }];
    const layout_graph = {
      title: {
        text: '月平均気温',
        y: 0.9,
      },
      xaxis: {
        title: {text:'月',standoff:10},
        dtick: 1,
      },
      yaxis: {
        title: {text:'気温[˚C]',standoff:8},
      },
      showlegend: false,
      font: {size: 12},
      margin: {l:60,r:60,t:50,b:50},
    };
    Plotly.newPlot('plot_temp_monthly', data_graph, layout_graph, config_graph);
  }

  function clicked_loc(lon,lat){
    const loc_str = '東経:' + lon.toFixed(2) + ', 北緯:' + lat.toFixed(2);
    document.getElementById("location_str").textContent=loc_str;
  }

  function mapClick() {
    myPlot.on('plotly_click', function(selected_point){
      let pt = selected_point.points[0]
      console.log(pt);
      clicked_loc(pt.ct[0],pt.ct[1]);
      plot_temp_yearly(pt.pointIndex);
      plot_temp_monthly(pt.pointIndex);
      plotWarmingStrips(pt.pointIndex);
    });
  }

  //////////////////////////////////////////////
  // Implement Functions
  //////////////////////////////////////////////

  const id_1st = 2707;  // 北緯34.99, 東経135.79
  plot_map('202101');
  clicked_loc(135.79,34.99);
  plot_temp_yearly(id_1st);
  plot_temp_monthly(id_1st);
  plotWarmingStrips(id_1st);

  let myPlot = document.getElementById('plot_map');
  mapClick();


  function assignOptions(textArray, selector) {
    for (let i = 0; i < textArray.length;  i++) {
        let currentOption = document.createElement('option');
        currentOption.text = textArray[i];
        selector.appendChild(currentOption);
    }
  }
  function updateDate(){
    let year_str = String(yearSelector.value);
    let month_str = ('0' + monthSelector.value).slice(-2);
    let date_str = year_str + month_str;
    console.log(date_str);
    plot_map(date_str);
    mapClick();
  }

  let yearSelector = document.getElementById('select_year');
  let monthSelector = document.getElementById('select_month');

  assignOptions(years, yearSelector);
  assignOptions(months, monthSelector);
  yearSelector.options[Ny-1].selected = true;
  monthSelector.options[0].selected = true;

  yearSelector.addEventListener('change', updateDate, false);
  monthSelector.addEventListener('change', updateDate, false);

});


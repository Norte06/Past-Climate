
const years5 = ['1983-06','1988-06','1993-06','1998-06','2003-06','2008-06','2013-06','2018-06'];
const years = Array.from(new Array(40)).map((v,i) => 1981 + i);
const months = Array.from(new Array(12)).map((v,i) => i + 1);
const Ny5 = years5.length;
const Ny = years.length;
const Nm = 12;

const data_fname = '../../Data/temp_monthly_1981-2020_0p1deg_japan.csv';

Plotly.d3.csv(data_fname, function(err,rows){
  function unpack(rows, key) {
    return rows.map(function(row) { return row[key]; });
  }

  function average(arr) {
    return arr.reduce((prev, current) =>
        prev+current
    ) / arr.length;
  };

  function std(arr,ave){
    return Math.sqrt(arr.map((current) => {
      const diff = current - ave;
      return diff ** 2;
    }).reduce((prev,current) => 
      prev+current
    ) / arr.length)
  };

  function sum_arr(arr1,arr2,op) {
    let arr = new Array();
    if (op == 'p') {
      for (let i = 0; i < arr1.length; i++){
        arr.push(arr1[i]+arr2[i]);
      }
    } else if (op == 'm') {
      for (let i = 0; i < arr1.length; i++){
        arr.push(arr1[i]-arr2[i]);
      }
    }
    return arr;
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
    for(let i = 0; i < N; i++){
      const j = i * 60;
      clim.push(average(data.slice(j,j+60)));
    }
    return clim;
  };

  function setMap(){
    var data_map = [{
      type: "choroplethmapbox",
      geojson: "../../GeoData/grid_geometry_0p1deg_japan.geojson",
      locations: unpack(rows,'fips'),
      z: unpack(rows,'2020-01'),
      colorscale: "Portland",
      hovertemplate: '気温: %{z:.1f}˚C<extra></extra>',
      marker: {line:{width:0}, opacity:0.6},
      colorbar: {y:0, yanchor:"bottom",
        title:{text: "月平均気温[˚C]", side: "right", font:{size:16}}
      },
    }];
  
    var mapbox_style = "mapbox://styles/notica06/cknd84i1t0dl517o7e7ask0b7";
    var layout_map = {
      mapbox: {
        style: mapbox_style, 
        center: {lon: 134.5, lat: 35.5}, 
        zoom: 3.8},
        margin: {l:40,r:40,t:60,b:60},
    };
  
    var myToken = "pk.eyJ1Ijoibm90aWNhMDYiLCJhIjoiY2tnZG5lbG9kMHE4MjJ1bXdlZ2Y3OGFoZiJ9.JyR6mvaJ5qeQTzN1dcsn5A";
    var config_map = {
      mapboxAccessToken: myToken,
      responsive: true,
      displayModeBar: false,
    };
  
    Plotly.newPlot('myMap', data_map, layout_map, config_map);
  };

  function setGraph_yearly(ind,lon,lat) {
    const pointdata = Object.values(rows[ind]);
    const Nt = pointdata.length;
    const loc_str = '経度:' + lon.toFixed(2) + ', 緯度:' + lat.toFixed(2);

    const timeseries = pointdata.slice(1,Nt).map(Number);
    const clim_1year = calc_climatology(timeseries,Ny);
    const clim_5year = calc_climatology_5year(timeseries,Ny5);

    var data_graph1 = [{
      x: years,
      y: clim_1year,
      marker:{color:'royalblue'},
    },{
      x: years5,
      y: clim_5year,
      marker:{color:'darkorange'},
    }]
  
    var layout_graph1 = {
      title: loc_str,
      xaxis: {
        title: '年',
        type: 'date',
        tickformat: '%Y',
        dtick: 'M60',
      },
      yaxis: {
        title: '気温[˚C]',
      },
      showlegend: false,
      font: {size: 12},
      margin: {l:60,r:60,t:60,b:60},
    };
  
    var config_graph = {
      responsive: true,
      displayModeBar: false,
    }
  
    Plotly.newPlot('myGraph1', data_graph1, layout_graph1, config_graph);
  };

  function setGraph_monthly(ind) {
    const pointdata = Object.values(rows[ind]);
    const Nt = pointdata.length;
    const timeseries = pointdata.slice(1,Nt).map(Number);

    const monthly_ave = new Array();
    const monthly_std = new Array();
    for (let i = 0; i < Nm; i++){
      let endpt = i + (Ny - 1) * Nm + 1;
      let tmp_arr = new Array();
      for (let j = i; j < endpt; j+=Nm){
        let k = 0;
        tmp_arr.push(timeseries[j]);
        k += 1;
      }
      monthly_ave.push(average(tmp_arr));
      monthly_std.push(std(tmp_arr,monthly_ave[i]));
    }

    const month_erb_arr = months.concat(months.slice().reverse());
    const monthly_erb_up = sum_arr(monthly_ave,monthly_std,'p');
    const monthly_erb_dn = sum_arr(monthly_ave,monthly_std,'m');

    var data_graph2 = [
      {
      x: month_erb_arr,
      y: monthly_erb_up.concat(monthly_erb_dn.slice().reverse()),
      fill: "toself",
      fillcolor: "rgba(231,107,243,0.2)", 
      line: {color: "transparent"},
    },
    {
      x: months,
      y: monthly_ave,
      line: {color: "rgb(231,107,243)"}, 
      mode: "lines", 
    }]

    var layout_graph2 = {
      title: '月平均気温',
      xaxis: {
        title: '月',
        dtick: 1,
      },
      yaxis: {
        title: '気温[˚C]',
      },
      showlegend: false,
      font: {size: 12},
      margin: {l:60,r:60,t:60,b:60},
    };
  
    var config_graph = {
      responsive: true,
      displayModeBar: false,
    }
  
    Plotly.newPlot('myGraph2', data_graph2, layout_graph2, config_graph);
  }

  setMap();
  setGraph_yearly(2259,139.79,35.69);
  setGraph_monthly(2259);
  let myPlot = document.getElementById('myMap');

  myPlot.on('plotly_click', function(selected_point){
    let pt = selected_point.points[0]
    setGraph_yearly(pt.pointIndex, pt.ct[0], pt.ct[1]);
    setGraph_monthly(pt.pointIndex);
  });

});


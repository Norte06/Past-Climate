const Ny = 41;
const Nm = 12;
const years = Array.from(new Array(Ny)).map((v,i) => 1981 + i);
const months = Array.from(new Array(Nm)).map((v,i) => 1 + i);

const years5 = ["1984","1989","1994","1999","2004","2009","2014","2019"];
const Ny5 = years5.length;

// const data_url = "https://raw.githubusercontent.com/Norte06/Past-Climate/master/data/JMA/"
const data_url = "../data/JMA/"
var loc_name = "Kyoto";
var loc_name_jp = "京都";
var fname_yearly = data_url + loc_name + "_yearly.csv"
var fname_monthly = data_url + loc_name + "_monthly.csv"

function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; });
}
function average(arr) {
  return arr.reduce((prev, current) =>
      prev+current
  ) / arr.length;
};
function calc_climatology_5year(data,N){
  let clim = new Array();
  for(let i = 0; i < N; i++){
    const j = i * 5;
    clim.push(average(data.slice(j,j+5)));
  }
  return clim;
};


const loc_data = data_url + "Locations.csv";
Plotly.d3.csv(loc_data, function(err,rows){
  function plot_map(){
    const data_map = [{
      type: "scattermapbox",
      text: unpack(rows,'Place'),
      lon: unpack(rows,'lon'),
      lat: unpack(rows,'lat'),
      marker: { color: "#FFB11B", size: 7 },
      hoverinfo: 'text'
    }];
    const mapbox_style = "mapbox://styles/notica06/cknd84i1t0dl517o7e7ask0b7";
    const layout_map = {
      mapbox: {
        style: mapbox_style, 
        center: {lon: 139, lat: 35.5}, 
        zoom: 3.2,
      },
      title: {
        font: {size: 18},
        text: "地点をクリックして下さい",
        y: 0.97,
      },
      margin: {l:30,r:30,t:40,b:20},
    };
    const myToken = "pk.eyJ1Ijoibm90aWNhMDYiLCJhIjoiY2tzb3VvcGl5MTJkaDJycDdqcmZ2MGd1bSJ9.T_3eHSj2H0kby2G8I3cAWQ";
    const config_map = {
      mapboxAccessToken: myToken,
      responsive: true,
      displayModeBar: false,
    };
    Plotly.newPlot("plot_map", data_map, layout_map, config_map);
  };

  plot_map();


  function plot_yearly_graphs(fname) {
    Plotly.d3.csv(fname, function(err,rows1){
      function plot_temp_stripe() {
        let rows_data = unpack(rows1,"temp_ave");
        const temp_ave = rows_data.slice(0,Ny).map(Number);
        const y_con = new Array(Ny).fill(1);
        const data_graph = [{
          x: years,
          y: y_con,
          z: temp_ave,
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
        }]
        const layout_graph = {
          title: {
            text: "Warming Stripe",
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
          font: {size: 11},
          margin: {l:30,r:30,t:25,b:20},
        };
        const config_graph = {
          responsive: true,
          displayModeBar: false,
        }
        Plotly.newPlot('plot_temp_stripe', data_graph, layout_graph, config_graph);
      };

      function plot_temp_yearly() {
        let rows_data = unpack(rows1,"temp_ave");
        const temp_ave = rows_data.slice(0,Ny).map(Number);
        const temp_5year = calc_climatology_5year(temp_ave,Ny5);
        const data_graph = [{
          x: years,
          y: temp_ave,
          marker:{color:"forestgreen"},
          name: "年平均",
          hovertemplate: "%{y:.1f}˚C",
        },{
          x: years5,
          y: temp_5year,
          marker:{color:"darkorange"},
          name: "5年平均",
          hovertemplate: "%{y:.1f}˚C",
        }]
        const layout_graph = {
          title: {
            font: {size: 15},
            text: "年平均気温",
            y: 0.9,
          },
          xaxis: {
            title: {text:"年",standoff:10},
            type: "date",
            tickformat: "%Y",
            dtick: "M60",
            standoff: 10,
          },
          yaxis: {
            title: {text:"気温[˚C]",standoff:8},
          },
          showlegend: false,
          font: {size: 12},
          margin: {l:50,r:40,t:40,b:35},
        };
        const config_graph = {
          responsive: true,
          displayModeBar: false,
        }
        Plotly.newPlot("plot_temp_yearly", data_graph, layout_graph, config_graph);
      };

      function plot_temp30days_yearly() {
        let rows_data = unpack(rows1,'temp30_days');
        const temp30_days = rows_data.slice(0,Ny).map(Number);
        const data_graph = [{
          x: years,
          y: temp30_days,
          marker:{color:'forestgreen'},
          name: '年あたり日数',
          hovertemplate: '%{y:d}日',
        }]
        const layout_graph = {
          title: {
            font: {size: 15},
            text: '日最高気温30˚C以上の日数',
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
            title: {text:'日数',standoff:8},
          },
          showlegend: false,
          font: {size: 12},
          margin: {l:50,r:40,t:40,b:35},
        };
        const config_graph = {
          responsive: true,
          displayModeBar: false,
        }
        Plotly.newPlot('plot_temp30days_yearly', data_graph, layout_graph, config_graph);
      };
    
      function plot_prep_yearly() {
        let rows_data = unpack(rows1,"precipitation");
        const prep_ave = rows_data.slice(0,Ny).map(Number);
        const data_graph = [{
          x: years,
          y: prep_ave,
          marker:{color:"mediumblue"},
          name: "年合計",
          hovertemplate: "%{y:.1f}mm",
        }]
        const layout_graph = {
          title: {
            font: {size: 15},
            text: "年総降水量",
            y: 0.9,
          },
          xaxis: {
            title: {text:"年",standoff:10},
            type: "date",
            tickformat: "%Y",
            standoff: 10,
          },
          yaxis: {
            title: {text:"降水量[mm]",standoff:8},
          },
          showlegend: false,
          font: {size: 12},
          margin: {l:55,r:40,t:40,b:40},
        };
        const config_graph = {
          responsive: true,
          displayModeBar: false,
        }
        Plotly.newPlot("plot_prep_yearly", data_graph, layout_graph, config_graph);
      };

      function plot_rain50days_yearly() {
        let rows_data = unpack(rows1,'rain50_days');
        const prep_ave = rows_data.slice(0,Ny).map(Number);
        const data_graph = [{
          x: years,
          y: prep_ave,
          marker:{color:'mediumblue'},
          name: '年あたり日数',
          hovertemplate: '%{y:d}日',
        }]
        const layout_graph = {
          title: {
            font: {size: 15},
            text: '日降水量50mm以上の日数',
            y: 0.9,
          },
          xaxis: {
            title: {text:'年',standoff:10},
            type: 'date',
            tickformat: '%Y',
            standoff: 10,
          },
          yaxis: {
            title: {text:'日数',standoff:8},
          },
          showlegend: false,
          font: {size: 12},
          margin: {l:60,r:60,t:45,b:45},
        };
        const config_graph = {
          responsive: true,
          displayModeBar: false,
        }
        Plotly.newPlot('plot_rain50days_yearly', data_graph, layout_graph, config_graph);
      };
    
      function plot_wind_yearly() {
        let rows_data = unpack(rows1,"wind");
        const wind_ave = rows_data.slice(0,Ny).map(Number);
        const data_graph = [{
          x: years,
          y: wind_ave,
          marker:{color:"orangered"},
          name: "年平均",
          hovertemplate: "%{y:.1f}m/s",
        }]
        const layout_graph = {
          title: {
            font: {size: 15},
            text: "年平均風速",
            y: 0.9,
          },
          xaxis: {
            title: {text:"年",standoff:10},
            type: "date",
            tickformat: "%Y",
            standoff: 10,
          },
          yaxis: {
            title: {text:"風速[m/s]",standoff:8},
          },
          showlegend: false,
          font: {size: 12},
          margin: {l:50,r:40,t:40,b:40},
        };
        const config_graph = {
          responsive: true,
          displayModeBar: false,
        }
        Plotly.newPlot("plot_wind_yearly", data_graph, layout_graph, config_graph);
      };

      function plot_snow_yearly() {
        let rows_data = unpack(rows1,'snow');
        const wind_ave = rows_data.slice(0,Ny).map(Number);
        const data_graph = [{
          x: years,
          y: wind_ave,
          marker:{color:'deepskyblue'},
          name: '年合計',
          hovertemplate: '%{y:d}cm',
        }]
        const layout_graph = {
          title: {
            font: {size: 15},
            text: '年総降雪量',
            y: 0.9,
          },
          xaxis: {
            title: {text:'年',standoff:10},
            type: 'date',
            tickformat: '%Y',
            standoff: 10,
          },
          yaxis: {
            title: {text:'降雪量[cm]',standoff:8},
          },
          showlegend: false,
          font: {size: 12},
          margin: {l:60,r:60,t:45,b:45},
        };
        const config_graph = {
          responsive: true,
          displayModeBar: false,
        }
        Plotly.newPlot('plot_snow_yearly', data_graph, layout_graph, config_graph);
      };
    
      plot_temp_stripe();
      plot_temp_yearly();
      plot_temp30days_yearly();
      plot_prep_yearly();
      plot_rain50days_yearly();
      plot_wind_yearly();
      plot_snow_yearly();
    });
  };

  function plot_monthly_graph(fname) {
    Plotly.d3.csv(fname, function(err,rows1){
      let rows_data1 = unpack(rows1,'temp_ave');
      const temp_ave = rows_data1.slice(0,Nm).map(Number);
      let rows_data2 = unpack(rows1,'temp_max');
      const temp_max = rows_data2.slice(0,Nm).map(Number);
      let rows_data3 = unpack(rows1,'temp_min');
      const temp_min = rows_data3.slice(0,Nm).map(Number);

      function plot_temp_monthly() {
        const data_graph = [
          {
            x: months,
            y: temp_ave,
            marker:{color:'forestgreen'},
            name: '平均気温',
            hovertemplate: '%{y:.1f}˚C',
          },
          {
            x: months,
            y: temp_max,
            marker:{color:'deeppink'},
            name: '最高気温',
            hovertemplate: '%{y:.1f}˚C',
          },
          {
            x: months,
            y: temp_min,
            marker:{color:'royalblue'},
            name: '最低気温',
            hovertemplate: '%{y:.1f}˚C',
          }
        ]
        const layout_graph = {
          title: {
            font: {size: 15},
            text: '月ごとの平均・最高・最低気温',
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
          margin: {l:50,r:40,t:40,b:35},
        };
        const config_graph = {
          responsive: true,
          displayModeBar: false,
        }
        Plotly.newPlot('plot_temp_monthly', data_graph, layout_graph, config_graph);
      }
      plot_temp_monthly();
    });
  };

  function clicked_loc(loc){
    const loc_str = '現在の選択地点：' + loc;
    document.getElementById("location_str").textContent=loc_str;
  }

  clicked_loc(loc_name_jp);
  plot_yearly_graphs(fname_yearly);
  plot_monthly_graph(fname_monthly);

  let el_plot_map = document.getElementById("plot_map");
  el_plot_map.on("plotly_click", function(selected_point){
    let pt = selected_point.points[0];
    let pt_id = pt.pointIndex;
    let loc_list = unpack(rows,"Name");
    let locjp_list = unpack(rows,"Place");
    loc_name = loc_list.slice(pt_id,pt_id+1).toString();
    loc_name_jp = locjp_list.slice(pt_id,pt_id+1).toString();

    fname_yearly = data_url + loc_name + "_yearly.csv"
    fname_monthly = data_url + loc_name + "_monthly.csv"
    // console.log(loc_name_jp);
    // console.log(fname_yearly);

    clicked_loc(loc_name_jp);
    plot_yearly_graphs(fname_yearly,loc_name_jp);
    plot_monthly_graph(fname_monthly,loc_name_jp);
  });

});


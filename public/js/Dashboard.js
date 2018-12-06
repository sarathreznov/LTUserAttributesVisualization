queue()
    .defer(d3.csv, "../LTFinalDatasetVer3.csv")
    .await(onloadcalls);
		
var xscale;
var myData;
var max=0;
var ndx;
var all;
var usrSelectedLoanStatus;
var dataset;
var labeltotalcount;
var labelnetamount;

var svg1=null;
var svg2=null;
var svg3=null;
var svg4=null;
function onloadcalls(error, data){
	
dataset = data;

	
  
		
var dddata = ["All","Accepted", "Rejected"];
var select1 = d3.select("#menuselect")
  .append('select')
  	.attr('class','select')
	.on('change',onchange);

var options = select1
  .selectAll('option')
	.data(dddata).enter()
	.append('option')
		.text(function (d) { return d; });

	
/*
d3.select("#hbc1")
  .append("input")
    .attr("class", "SearchBar")
    .attr("id", "search")
    .attr("type", "text")
    .attr("placeholder", "Enter Questioner_Id to Search...");
// functionality 
 d3.select("#search")
      .on("keyup", function() { // filter according to key pressed  	  
		var searched_data = dataset,
            text = this.value.trim();
			filterdata(searched_data,text);
			//alert("sdfsdfsdf");
			
	  });*/
		
	
		
	labeltotalcount = d3.select("#total-projects").append('label');
	labelnetamount = d3.select("#total-amt").append('label');
	sumtotalcount();
	
	plotFirstScatterPlot(dataset);
	plotSecondScatterPlot(dataset);
	plotThirdChart(dataset);
	plotFourthChart(dataset);
	//loadBarChartVertical();
	
	loadverticalbarchart();
	loadHBarchart();
	loadtabulardata(dataset,"January");
	//alert("DATA LOAD COMPLETED!!");
}


function sumtotalcount(){
	console.log(usrSelectedLoanStatus);
  var formatComma = d3.format(".4f");
  
	if(usrSelectedLoanStatus == "Accepted"){
		var fd1 = dataset.filter(function(d){return d.Status_offerstatuschange == '1';});
		var totalcount = fd1.length;
		labeltotalcount.text(totalcount);
		var totalSum = d3.sum(fd1.map(function(d){ return d.Loan_Amount}));		
		var converted=formatComma(totalSum/1000000);
		
		labelnetamount.text(converted +" M");
	}
	else if(usrSelectedLoanStatus == "Rejected"){
		var fd1 = dataset.filter(function(d){return d.Status_offerstatuschange != '1';});
		var totalcount = fd1.length;
		labeltotalcount.text(totalcount);
		var totalSum = d3.sum(fd1.map(function(d){ return d.Loan_Amount}));		
		var converted=formatComma(totalSum/1000000);
		
		labelnetamount.text(converted +" M");
	}		
	else 
	{		
		var fd1 = dataset.filter(function(d){return d.Status_offerstatuschange;});
		var totalcount = fd1.length;
		labeltotalcount.text(totalcount);
		var totalSum = d3.sum(fd1.map(function(d){ return d.Loan_Amount}));		
		var converted=formatComma(totalSum/1000000);
		
		labelnetamount.text(converted +" M");

	} 
};


function onchange() {
	 usrSelectedLoanStatus = d3.select('select').property('value');
			console.log("usrSelectedLoanStatus called from the button");
			sumtotalcount();
			loadHBarchart();
			loadtabulardata(dataset,"January");
			loadverticalbarchart();
			//alert("DATA LOAD COMPLETED!!");

};

function nestData(myData){
myData=d3.nest().key(function(d){ return d.Loan_Type}).rollup(function(v){ return v.length})
.entries(myData)
myData.sort(function(a,b){
return a.value-b.value
})
return myData;
}

	function filterdata(searched_data,inputtext){
		console.log("insdie the filterdataset");
		var searchResults = searched_data.map(function(r) {
          var regex = new RegExp(inputtext);
          if (regex.test(r.Questioner_Id)) { // if there are any results
            return regex.exec(r.Questioner_Id)[0]; // return them to searchResults
          } 
        })
	    
	    // filter blank entries from searchResults
        searchResults = searchResults.filter(function(r){ 
          return r != undefined;
        })
        
        // filter dataset with searchResults
        searched_data = searchResults.map(function(r) {
           return dataset.filter(function(p) {
            return p.Questioner_Id.indexOf(r) != -1;
          })
        })
		
searched_data = [].concat.apply([], searched_data)
console.log(searched_data.length);
loadtabulardata(searched_data);
	}
		

function loadHBarchart() {
	
	var mydata;
	
	if(usrSelectedLoanStatus == "Accepted"){
		console.log("loadHBarchart-Accepted");
			myData = nestData(dataset.filter(function(d){return d.Status_offerstatuschange == '1';}));
	}
	else if(usrSelectedLoanStatus == "Rejected"){
		console.log("loadHBarchart-Rejected");
			myData = nestData(dataset.filter(function(d){return d.Status_offerstatuschange != '1';}));
	}		
	else 
	{		console.log("loadHBarchart-ALL");
			myData = nestData(dataset);
	} 
	
		myarr = []; 
		loantype =[];
		for(i=0;i < myData.length; i++){
			my = myData[i].key;
			myarr.push(my);
		}
		
		max=d3.max(myData,function(d){
			return parseInt(d.value)
		})
		

	d3.select("#svghbarchart").remove();

	
var tooltip = d3.select("body").append("div").attr("class", "toolTip");
  	
var svghbarchart = d3.select("#hbc").append("svg").attr("id","svghbarchart");

		var width=600;
		var height=550;
		
d3.select("#svghbarchart").attr("width",width);
d3.select("#svghbarchart").attr("height",height);


		var  margin = {top: 10, right: 10, bottom: 10, left: 150},
		width = +d3.select("#svghbarchart").attr("width") - margin.left - margin.right,
		height = +d3.select("#svghbarchart").attr("height") - margin.top - margin.bottom;
  
  
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleBand().range([height, 0]);

d3.select("#svghbarchart").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


x.domain([0, max]);
y.domain(myarr).padding(0.1);


   d3.select("#svghbarchart").select("g").append("g")
        .attr("class", "x axis")
       	.attr("transform", "translate(0," + height + ")")
      	.call(d3.axisBottom(x).ticks(5).tickSizeInner([-height]));

    d3.select("#svghbarchart").select("g").append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));
  
			d3.select("#svghbarchart").select("g").selectAll(".bar")
        .data(myData)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth()).transition()
			.duration(200)
			.delay(function (d, i) {
				return i * 50;
			})
		.attr("y", function(d) { return y(d.key); })
		.attr("width", function(d) { return x(d.value); });
		
		d3.select("#svghbarchart").select("g").selectAll(".bar").on("mousemove", function(d){
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html((d.key) + "<br>"  + (d.value));
        }).on("mouseout", function(d){ tooltip.style("display", "none");});
		
		d3.select("#svghbarchart").select("g").selectAll(".bar").style("fill", "steelblue");
				
	};
	
		
function loadtabulardata(localdata,month){
	console.log("loadtabulardata");
	var svg;
	var indata;
	
	if(usrSelectedLoanStatus == "Accepted"){
		indata = localdata.filter(function(d){return d.Status_offerstatuschange == '1' && d.OfferMonth==month;});
	}
	else if(usrSelectedLoanStatus == "Rejected"){
		indata = localdata.filter(function(d){return d.Status_offerstatuschange != '1' && d.OfferMonth==month;});
	}		
	else 
	{		
		indata = localdata.filter(function(d){return d.OfferMonth==month;});
	} 
	
console.log(indata.length);
var dataDivide = [];
if ( indata.length > 200){
	var i, chunk = 200; 
    for (i=0; i<chunk; i++)          
    {
         dataDivide.push(indata[i]);
    }
} else {
	dataDivide=indata;	
}

console.log(dataDivide.length);


d3.select("table").remove();

	
 svg = d3.select("body").append("svg")
	.attr("height", 1)
	.attr("width", 1);

var table = d3.select("#hbc1")
	.append("table")
	.attr("class", "table table-condensed table-striped"),
	thead = table.append("thead"),
	tbody = table.append("tbody");
	
	var columns=["Questioner_Id", "Quotes_Id", "OfferMonth", "Status",  "Status_offerstatuschange",  "APR_Percentage", "Amortization_Type","Fixed_Rate_Period_Months", "Has_Prepayment_Penalty", "Is_FHA_Loan", "Is_Jumbo_Loan", "Is_VA_Loan","Loan_Amount", "Loan_Term_Months", "Loan_Type"];
	
	var header = thead.append("tr")
		.selectAll("th")
		.data(columns)
		.enter()
		.append("th")
			.text(function(d){ return d;});

	var rows = tbody.selectAll("tr")
		.data(dataDivide)
		.enter()
		.append("tr")
		.on("mouseover", function(d){
			d3.select(this)
				.style("background-color", "orange");
		})
		.on("mouseout", function(d){
			d3.select(this)
				.style("background-color","transparent");
		});

	var cells = rows.selectAll("td")
		.data(function(row){
			return columns.map(function(d, i){
				return {i: d, value: row[d]};
			});
		})
		.enter()
		.append("td")
		.html(function(d){ return d.value;});
		

		
		
    }
	
	


dc.redrawAll();
dc.renderAll();



function plotFourthChart(dataset1){
		//				d3.csv("./"+FileName).then(function(data)
          //    {
						myDataFourth=dataset1;
						//console.log(myData[0])
						/*myData=myData.filter(function(d){
							return d.Count>0;
						})*/
						//Accepted
						myVarData1=myDataFourth.filter(function(d){
							if(parseInt(d.Status_offerstatuschange)==1)
							{
									return d;
							}
								
						})
						//console.log(myVarData1)
						//Fixed
						myVarData1=myVarData1.filter(function(d){
							if(d.Amortization_Type==1)
							{
									return d;
							}
								
						})
						/*myFixData=myData.filter(function(d){
							return d.Amortization_Type==1;
						})
						*/myVarData1=nestDataScatterPlot(myVarData1);
						min=d3.min(myVarData1,function(d){
								return parseInt(d.value);
						})
						max=d3.max(myVarData1,function(d){
								return parseInt(d.value);
						})
						//console.log(min)
						//console.log(max)
						////console.log(myData)
						/*for(var i=0;i<600;i++){
							miniDataSet.push(myData[i])
						}*/
						
						//myFixData=nestData(myFixData);
						//.entries(data)
						//console.log(myVarData1)
						
						drawScatterPlotFourth(myVarData1);
					/*	//console.log(d3.min(function(d){
							return d.PercentageCount;
						}));*/
				//});
			
			}
			
			function drawScatterPlotFourth(myData){
				width=600
			height=window.innerHeight;
			svgWidth=width;
			svgHeight=height;
			width=parseInt(width/2);
			height=400
			//console.log("myHeight is"+height)
			var xScale;
			var yScale;
			var xAxis;
			var yAxis;
	width=document.getElementById("sc1").getBoundingClientRect().width;
				height=document.getElementById("sc1").getBoundingClientRect().width
	
	padding=40;
	
				 xScale=d3.scaleLinear().domain([3,7])
				.range([padding,width-padding]);
				
				
				  //yScale=d3.scaleLog().domain([0.1,max])
				  //.range([height-padding,padding])
				  yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				 xAxis=d3.axisBottom().scale(xScale) 
				 yAxis=d3.axisLeft().scale(yScale)//.ticks(5,"00").tickSize(6,0)//.tickValues([5000,10000,15000,20000,25000,30000])
				 if(svg4==null)
				 {
				   svg4=d3.select("#sc4").append("svg").attr("width",width).attr("height",height)//.style('position', 'absolute')
				  //.attr("transform","translate("+(width-padding)+","+(height-padding)+")")
				  
				  svg4.selectAll("circle")
				  .data(myData)
				  //.data(miniDataSet)
				  .enter()
				  .append("circle")
				  .attr("cx",function(d){
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2) //92120a
				  .style("fill", function(d) { return "#92120a";})
				  .append("title")
				  .text(function(d){
					return "Key is "+d.key+" Value is "+d.value;
				  })
				  //yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				  yAxis=d3.axisLeft().scale(yScale)
				  svg4.append("g").attr("class","x axis").attr("transform","translate(0,"+(height-padding)+")").call(xAxis);
				  svg4.append("g").attr("class","y axis").attr("transform","translate("+ padding +",0)").call(yAxis);
				 }
				 else{
					 bars=svg4.selectAll("circle").data(myData)
						bars.exit().remove();
						bars.enter().append("circle")
						/*.attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#e29655";})*/
				  .merge(bars)
					.transition()
					.duration(1000)
						.attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#92120a";})
				  yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				  yAxis=d3.axisLeft().scale(yScale).ticks(5)
					svg4.select(".yaxis").transition().call(yAxis)
				 }
				 /* svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height+padding)
          .tickFormat("")
      )
	  svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width+padding)
          .tickFormat("")
      )*/
				  //console.log("done")
			//	  plotSecondChart(FileName);
			}
		
function plotSecondScatterPlot(dataset1)
{
	
						myDataSecond=dataset1;
						////console.log(myData[0])
						/*myData=myData.filter(function(d){
							return d.Count>0;
						})*/
						
						//Rejected or abandoned
						//Fixed
						myDataSecond1=myDataSecond.filter(function(d){
							if((parseInt(d.Status_offerstatuschange)==0) || (parseInt(d.Status_offerstatuschange)==2))
							{
									return d;
							}
								
						})
						//console.log(myDataSecond)
						myDataSecond2=myDataSecond1.filter(function(d){
							if(d.Amortization_Type==1)
							{
									return d;
							}
								
						})
						/*myFixData=myData.filter(function(d){
							return d.Amortization_Type==1;
						})
						*/
						
						//console.log(myData)
						/*for(var i=0;i<600;i++){
							miniDataSet.push(myData[i])
						}*/
						myFixData=nestDataScatterPlot(myDataSecond2);
						min=d3.min(myFixData,function(d){
								return parseInt(d.value);
						})
						max=d3.max(myFixData,function(d){
								return parseInt(d.value);
						})
						console.log(min)
						//console.log(max)
						//myFixData=nestData(myFixData);
						//.entries(data)
						//console.log(myFixData)
						
						drawScatterPlotSecond(myFixData);
}
function drawScatterPlotSecond(myData){
	width=600
			height=window.innerHeight;
			svgWidth=width;
			svgHeight=height;
			width=parseInt(width/2);
			height=400
			//console.log("myHeight is"+height)
			var xScale;
			var yScale;
			var xAxis;
			var yAxis;
	width=document.getElementById("sc2").getBoundingClientRect().width;
				height=document.getElementById("sc2").getBoundingClientRect().width;
	//height=300;
	padding=40;
			xScale=d3.scaleLinear().domain([0.0,11.0])
				.range([padding,width-padding]);
				
				
				  yScale=d3.scaleLog().domain([0.1,max])
				  .range([height-padding,padding])
				 xAxis=d3.axisBottom().scale(xScale) 
				 yAxis=d3.axisLeft().scale(yScale)//.ticks(5,"00").tickSize(6,0)//.tickValues([5000,10000,15000,20000,25000,30000])
				 // var svg=d3.select("body").append("svg").attr("width",width).attr("height",height).style('position', 'absolute')
				  //.attr("transform","translate("+(width-padding)+",0)")
				  if(svg2==null)
				  {
				  svg2=d3.select("#sc2").append("svg").attr("id","SecondScatterPlot").attr("width",width).attr("height",height);
				/*  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 30)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Amortization type is Fixed")*/
				  svg2.selectAll("circle")
				  .data(myData)
				  //.data(miniDataSet)
				  .enter()
				  .append("circle")
				  .attr("cx",function(d){
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#869a56";})
				  .append("title")
				  .text(function(d){
					return "Key is "+d.key+" Value is "+d.value;
				  })
				  yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				  yAxis=d3.axisLeft().scale(yScale).ticks(5)//.tickFormat(d3.format(".0s"));

				  svg2.append("g").attr("class","x axis").attr("transform","translate(0,"+(height-padding)+")").call(xAxis);
				  svg2.append("g").attr("class","yaxis").attr("transform","translate("+ (padding) +",0)").call(yAxis);
				  }
				  else
				  {
					  bars=svg2.selectAll("circle").data(myData)
						bars.exit().remove();
						bars.enter().append("circle")
						/*.attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#e29655";})*/
				  .merge(bars)
					.transition()
					.duration(750)
						.attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#869a56";})
				  yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				  yAxis=d3.axisLeft().scale(yScale).ticks(5)
					svg2.select(".yaxis").transition().call(yAxis)
				  }
				/*  svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height+padding)
          .tickFormat("")
      )
	  svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width+padding)
          .tickFormat("")
      )*/
				  //console.log("done")
			//plotThirdChart(FileName)
			}
 function plotThirdChart(dataset1){
						//d3.csv("./"+FileName).then(function(data)
              //{
						myDataThird=dataset1;
						//console.log(myData[0])
						/*myData=myData.filter(function(d){
							return d.Count>0;
						})*/
						//Accepted
						myFixData1=myDataThird.filter(function(d){
							if(parseInt(d.Status_offerstatuschange)==1)
							{
									return d;
							}
								
						})
						//Variable
						//console.log(myDataThird)
						myFixData1=myFixData1.filter(function(d){
							if(d.Amortization_Type==0)
							{
									return d;
							}
								
						})
						/*myFixData=myData.filter(function(d){
							return d.Amortization_Type==1;
						})
						*/
						myFixData1=nestDataScatterPlot(myFixData1);
						min=d3.min(myFixData1,function(d){
								return parseInt(d.value);
						})
						max=d3.max(myFixData1,function(d){
								return parseInt(d.value);
						})
						//console.log(min)
						//console.log(max)
						////console.log(myData)
						/*for(var i=0;i<600;i++){
							miniDataSet.push(myData[i])
						}*/
						
						//myFixData=nestData(myFixData);
						//.entries(data)
						//console.log(myFixData1)
						
						drawScatterPlotThird(myFixData1);
					/*	//console.log(d3.min(function(d){
							return d.PercentageCount;
						}));*/
				//});
			
			}
			function drawScatterPlotThird(myData){
				width=600
			height=window.innerHeight;
			svgWidth=width;
			svgHeight=height;
			width=parseInt(width/2);
			height=400
			//console.log("myHeight is"+height)
			var xScale;
			var yScale;
			var xAxis;
			var yAxis;
	width=document.getElementById("sc1").getBoundingClientRect().width;
				height=document.getElementById("sc1").getBoundingClientRect().width;
	//height=300;
	padding=40;
	
				 xScale=d3.scaleLinear().domain([3,7])
				.range([padding,width-padding]);
				
				
				  //yScale=d3.scaleLog().domain([0.1,max])
				  //.range([height-padding,padding])
				  yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				 xAxis=d3.axisBottom().scale(xScale) 
				 yAxis=d3.axisLeft().scale(yScale)//.ticks(5,"00").tickSize(6,0)//.tickValues([5000,10000,15000,20000,25000,30000])
				  //var svg=d3.select("body").append("svg").attr("width",width).attr("height",height).style('position', 'absolute')
				  //.attr("transform","translate(0,"+(height-padding)+")")
				  if(svg3==null)
				  {
				  svg3=d3.select("#sc3").append("svg").attr("id","ThirdScatterPlot").attr("width",width).attr("height",height);
				  svg3.selectAll("circle")
				  .data(myData)
				  //.data(miniDataSet)
				  .enter()
				  .append("circle")
				  .attr("cx",function(d){
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#927caf";})
				  .append("title")
				  .text(function(d){
					return "Key is "+d.key+" Value is "+d.value;
				  })
				  yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				  yAxis=d3.axisLeft().scale(yScale)
				  svg3.append("g").attr("class","x axis").attr("transform","translate(0,"+(height-padding)+")").call(xAxis);
				  svg3.append("g").attr("class","y axis").attr("transform","translate("+ padding +",0)").call(yAxis);
				  }
				  else{
					  bars=svg3.selectAll("circle").data(myData)
						bars.exit().remove();
						bars.enter().append("circle")
						/*.attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#e29655";})*/
				  .merge(bars)
					.transition()
					.duration(1000)
						.attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#927caf";})
					svg3.select(".y").transition().call(yAxis)
				  }/* svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height+padding)
          .tickFormat("")
      )
	  svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width+padding)
          .tickFormat("")
      )*/
				  //console.log("done")
			//	  plotSecondChart(FileName);
		//	plotFourthChart(FileName)
			}
function plotFirstScatterPlot(dataset1)
            {
              //d3.csv("./"+FileName).then(function(data)
              width=document.getElementById("sc1").getBoundingClientRect().width
			//height=window.innerHeight;
			//svgWidth=width;
			//svgHeight=height;
			//width=parseInt(width/2);
			height=document.getElementById("sc1").getBoundingClientRect().height
			//console.log("My Height is"+height)
			var xScale;
			var yScale;
			var xAxis;
			var yAxis;
			 padding=40;
						myData=null;
						myData=dataset1;
						
						//console.log("this is first scatterplot");
						//console.log(myData)
						//Abandoned or rejected
						//Variable
						myData1=myData.filter(function(d){
							if((parseInt(d.Status_offerstatuschange)==0) || (parseInt(d.Status_offerstatuschange)==2))
							{
									return d;
							}
								
						})
						//console.log(myData)
						myData2=myData1.filter(function(d){
							if(d.Amortization_Type==0)
							{
									return d;
							}
								
						})
						
						
						
						//
						////console.log(myData)
						/*for(var i=0;i<600;i++){
							miniDataSet.push(myData[i])
						}*/
						myVarData=nestDataScatterPlot(myData2);
						min=d3.min(myVarData,function(d){
								return parseInt(d.value);
						})
						max=d3.max(myVarData,function(d){
								return parseInt(d.value);
						})
						//myFixData=nestData(myFixData);
						//.entries(data)
						////console.log(myVarData)
						//console.log("Dataset")
						//console.log(max)
						drawScatterPlotFirst(myVarData);
					/*	//console.log(d3.min(function(d){
							return d.PercentageCount;
						}));*/
						
						////console.log(myVarData)
						
				
			}
			function nestDataScatterPlot(myData){
				myData=d3.nest().key(function(d){ return d.APR_Percentage}).rollup(function(v){ return v.length})
						.entries(myData)
						myData.sort(function(a,b){
							return a.key-b.key;
						})
						return myData;
			}
				function make_x_gridlines() {		
				return xAxis;
			}
			function make_y_gridlines() {		
			return yAxis;
			}

			function drawScatterPlotFirst(myData){
				
				width=document.getElementById("sc1").getBoundingClientRect().width;
				height=document.getElementById("sc1").getBoundingClientRect().width;
				//console.log("My height is "+height)
				 	//if(svg1==null)
					//{
						xScale=d3.scaleLinear().domain([3,7])
				.range([padding,width-padding]);
				
				//console.log("scatter"+max);
				  //yScale=d3.scaleLog().domain([0.1,max])
				  //.range([height-padding,padding])
				  yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				 xAxis=d3.axisBottom().scale(xScale) 
				 yAxis=d3.axisLeft().scale(yScale).ticks(5)//.ticks(5,"00").tickSize(6,0)//.tickValues([5000,10000,15000,20000,25000,30000])
				if(svg1==null)
				{
				   svg1=d3.select("#sc1").append("svg").attr("id","FirstScatterPlot").attr("width",width).attr("height",height);
				  //.style('position', 'absolute')
				  //.attr("transform","translate(40,"+()+")");
		/*		  svg.append("text")
        .attr("x", (width))             
        .attr("y", padding)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Amortization type is Variable")
			*/	  
				  svg1.selectAll("circle")
				  .data(myData)
				  //.data(miniDataSet)
				  .enter()
				  //.transition()
				  .append("circle")
				  .attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#e29655";})
				  .append("title")
				  .text(function(d){
					return "Key is "+d.key+" Value is "+d.value;
				  })
				  yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				  yAxis=d3.axisLeft().scale(yScale)
				  
				  svg1.append("g").attr("class","x axis").attr("transform","translate(0,"+(height-padding)+")").call(xAxis);
				  svg1.append("g").attr("class","y axis").attr("transform","translate("+ padding +",0)").call(yAxis);
					}
					else{
						bars=svg1.selectAll("circle").data(myData)
						bars.exit().remove();
						bars.enter().append("circle")
						/*.attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#e29655";})*/
				  .merge(bars)
					.transition()
					.duration(750)
						.attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#e29655";})
					svg1.select(".y").transition().call(yAxis)
					}
								  
					//}
					//else{
						/*		xScale=d3.scaleLinear().domain([3,7])
				.range([padding,width-padding]);
				
				
				  //yScale=d3.scaleLog().domain([0.1,max])
				  //.range([height-padding,padding])
				  yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				 xAxis=d3.axisBottom().scale(xScale) 
				 yAxis=d3.axisLeft().scale(yScale).ticks(5)//.ticks(5,"00").tickSize(6,0)//.tickValues([5000,10000,15000,20000,25000,30000])
				
						console.log("this is in event")
						console.log(myData)
						svg1.selectAll("circle")
				  .data(myData)
				  //.data(miniDataSet)
				  .transition()
				  //.transition()
				  //.append("circle")
				  .attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#e29655";})
				  
				  
				   svg1.select("x axis")
                            .transition()
                            //.duration(1000)
                            .call(xAxis);

                        // Update Y Axis
                        svg1.select("y axis")
                            .transition()
                            //.duration(100)
                            .call(yAxis);
					//}
				  /*.append("title")
				  .text(function(d){
					return "Key is "+d.key+" Value is "+d.value;
				  })*/
					
				  //svg.append("g")			
      //.attr("class", "grid")
      //.attr("transform", "translate(0," + height + ")")
      //.call(make_x_gridlines()
        //  .tickSize(-height+padding)
          //.tickFormat("")
      ///)
	  //svg.append("g")			
      //.attr("class", "grid")
      //.call(make_y_gridlines()
        //  .tickSize(-width+padding)
          //.tickFormat("")
      //)
				  console.log("done")
		//		  plotSecondChart(FileName);
			}
			
		   function filterDataForScatterPlot(status,month)
			{
			filterDataSet=dataset;
			filterDataSet1=filterDataSet.filter(function(d){
							if(d.OfferMonth==month)
							{
									return d;
							}
								
						});
						if(status=="Accepted"){
							
							status=1;
							plotThirdChart(filterDataSet1);
						plotFourthChart(filterDataSet1);

						}
						else if(status=="Rejected"){
							status=0;
							plotFirstScatterPlot(filterDataSet1);
						plotSecondScatterPlot(filterDataSet1);
						}
						else{
							status=3;
							/*svg1=null;
							svg2=null;
							svg3=null;
							svg4=null;*/
						plotThirdChart(dataset);
						plotFourthChart(dataset);
						plotFirstScatterPlot(dataset);
						plotSecondScatterPlot(dataset);
						}
						console.log("This is filterdataset1")
						//console.log(filterDataSet1);
						//d3.select("#sc3").select("svg").remove();
						/*var svg=d3.select("#sc1").transition();
						width=document.getElementById("sc1").getBoundingClientRect().width;
				height=document.getElementById("sc1").getBoundingClientRect().width;
				/*max=d3.max(,function(d){
								return parseInt(d.value);
						})*/
					/*	xScale=d3.scaleLinear().domain([3,7])
				.range([padding,width-padding]);
				yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
				
				
				
				
				
				

				svg1.selectAll("circle")
				  .data(filterDataSet1)
				  //.data(miniDataSet)
				  //.transition()
				  .attr("cx",function(d){
					  
					return xScale(d.key)
				  })
				  .attr("cy",function(d){
						return yScale(d.value)
				  })
				  .attr("r",2)
				  .style("fill", function(d) { return "#e29655";})
				  
				  //yScale=d3.scaleLog().domain([0.1,max])
				  //.range([height-padding,padding])
				  
				  */
						
						
												
						
				}
      function loadBarChartVertical(){
		var myMasterData;
      var myBarData;
      //var myChorData;
      var margin_bar = {top: 10, right: 10, bottom: 40, left: 140};
      var svgWidth_bar = 9500
      var svgHeight_bar = 7000
      var gWidth_bar = svgWidth_bar - margin_bar.left - margin_bar.right;
      var gHeight_bar = svgHeight_bar - margin_bar.top - margin_bar.bottom;
	  var width=500;
	  var height=500;
      var margin_chor = {top: 10, right: 10, bottom: 40, left: 140};
	  var padding=40;
	  var max=0;
	  var min=0;
	  var myBarData2;
	  var myBarData3=[];
	  var myBarData4 = [];
	  var myBarData5 = [];
	  var colors;
      function loadData()
      {
        //d3.csv("LTFinalDatasetVer3.csv")
          //.then(function(data)
          //{
			//console.log(data)
            myMasterData = dataset;
					  
					  
            generateBarData(myMasterData)
//console.log(myBarData)		
max=calculateMax(myBarData)
myBarData.sort(function (a, b) {return a.key - b.key;})
//console.log(myBarData)	

myBarData2=[];
		myBarData2[0]=myBarData[2];
		myBarData2[1]=myBarData[4];
		myBarData2[2]=myBarData[8];
		myBarData2[3]=myBarData[7];
		myBarData2[4]=myBarData[5];
		myBarData2[5]=myBarData[1];
		myBarData2[6]=myBarData[6];
		myBarData2[7]=myBarData[0];
		myBarData2[8]=myBarData[3];
		
		//console.log(myBarData2)
		
		
            //createBarChart(myBarData);
            //generateChorData(myMasterData, null)
            //showMap(myChorData)
status1(myBarData2,1)			
	function status1(myBarData,status){
			max=0;
				
			
			for(var i=0;i<9;i++)
				{
					//console.log()
					//for(j=0;j<myBarData2[i].values.length;j++){
					
					
					myBarData2[i].values=nestData(myBarData[i].values)
					
						/*myBarData3.push(myBarData[i].values[status].value);
					myBarData4=nestData(myBarData2[i].values)
					myBarData5.push(myBarData4[i][status].value[0].value)*/
					//console.log(myBarData2[i].values[status].value[status].value)
					//myBarData5.push(myBarData2[i].values[status].value[status].value)
					
				}
				for(var i=0;i<9;i++){
					console.log(myBarData2[i].values[status].value[0].value);
					myBarData5.push(myBarData2[i].values[status].value[0].value)
				}
				for(var i=0;i<9;i++){
					if(max<myBarData2[i].values[status].value[0].value)
					max=myBarData2[i].values[status].value[0].value;
					console.log(max);
					//myBarData5.push(myBarData2[i].values[status].value[0].value)
					
				}
				
			if(status == 0){
			//console.log("colors")
			colors = "red"}
			else{
			colors ="green"}
				generateBarChart(myBarData5,status)
				}
          //}
        //);
      }
	  
      function generateBarChart(myBarData2,status)
	  {
			var svg=d3.select("#date-chart").append("svg").attr("width",width).attr("height",height)
			
			
			yScale=d3.scaleLinear().domain([0,max]).range([height-padding,padding])
			//xScale=d3.scaleLinear().domain([0,9]).range([0,width-padding+])
			var months=["January","February","March","April","May","June","July","August","September"]
			xScale=d3.scaleBand().domain(d3.range(myBarData2.length)).range([padding,width])
			svg.selectAll("rect").data(myBarData2).enter().append("rect").attr("x",function(d,i){
				/*if(i==0)
				return i*((width/9))+padding;
				else
				return i*((width/9))+15;
				//return i*((width/9))+10*/
				console.log(d)
				//console.log(xScale(d))
				return xScale(i)
			})
			.attr("y",function(d){
				return yScale(d)
			})
			.attr("width",width/9-padding)
			.attr("height",function(d,i){
			
					console.log()
					var yscaleD=(height-padding)-yScale(d)
					
					
					return yscaleD
				//return yScale(d.values[0].value)
				
			})
			.attr("fill",colors)
			.on("click",function(d,i){
				console.log("You clicked on bar chart with count"+d+" and month"+months[i]+" with status as"+status);
				filterDataForScatterPlot(status,months[i]);
			})
			.append("title")
			.text(function(d){
				return d;
			})
			
			//yScale1=d3.scaleLinear().domain([0,max+20000]).range([height-padding,padding])
			var yAxis=d3.axisLeft().scale(yScale).ticks(5)//.tickFormat(d3.format(".0s"))
			xScale1=d3.scaleBand().domain(months).range([padding,width])
			var xAxis=d3.axisBottom().scale(xScale1)
			

          svg.append("g").attr("transform","translate("+(padding)+",0)").call(yAxis)
		  svg.append("g").attr("transform","translate(-17,"+(height-padding)+")").call(xAxis)
			
	  }
	  function nestData(myData){
				myData=d3.nest().key(function(d){ return d.key}).rollup(function(v){ return v})
						.entries(myData)
						myData.sort(function(a,b){
							return a.key-b.key
						})
						return myData;
			}
	  function calculateMax(myData)
	  {
				
				var max=0;
				var i=0;
				var j=0;
				for(i=0;i<9;i++)
				{
					console.log()
					for(j=0;j<myData[i].values.length;j++)
					{
						//console.log(max)
						//console.log(myData[i].values[j].value)
							if(max < myData[i].values[j].value)
							{
									
									max=myData[i].values[j].value
									//console.log(max)
							}
							
					}
				}
				return max;
	  }
	  
	  
	  function calculateMin(myData)
	  {
				
				var min=0;
				var i=0;
				var j=0;
				for(i=0;i<9;i++)
				{
					console.log()
					for(j=0;j<myData[i].values.length;j++)
					{
						
						console.log(myData[i].values[j].value)
							if(min > myData[i].values[j].value)
							{
									
									min=myData[i].values[j].value
									//console.log(max)
							}
							
					}
				}
				return min;
	  }
      function generateBarData(masterData) {
       // console.log(state + "  State Bar Chart \n")
        //if(state === 'all' || state === 'All' || state === null){
           
			myBarData = d3.nest()
                      .key(function(d) { 
						
					  return d.OfferMonth;})
					  .key(function(d){
						return d.Status_offerstatuschange;
					  })
                      .rollup(function(d) {
							//countObj[d.OfferMonth]++;
                        return d.length;
                      })
                      .entries(myMasterData)
					  //console.log((myBarData[0]).values)
					  var obj={key:"0",value:0}
					  myBarData[4].values[2]=obj;
					  myBarData[7].values[2]=obj;
					  myBarData[8].values[2]=obj;
			console.log(myBarData)
      }
		//loadData();
	  }
      
	  function loadverticalbarchart(){
	
//Original data
			var fd1;
			var months=["January","February","March","April","May","June","July","August","September"]
			var datasetimple;
			myarr= []; 

		var myData;
		
	if(usrSelectedLoanStatus == "Accepted"){
		console.log("loadHBarchart-Accepted");
			myData = dataset.filter(function(d){return d.Status_offerstatuschange == '1';});
	}
	else if(usrSelectedLoanStatus == "Rejected"){
		console.log("loadHBarchart-Rejected");
			myData = dataset.filter(function(d){return d.Status_offerstatuschange != '1';});
	}		
	else 
	{		console.log("loadHBarchart-ALL");
			myData = dataset;
	} 
	
	data=myData;
	
		
		for(i=0;i < months.length; i++){
		monthvalue = months[i];
		fd1 = data.filter(function(d){return d.Status_offerstatuschange == '1' && d.OfferMonth == monthvalue ;});
		fd0 = data.filter(function(d){return d.Status_offerstatuschange == '0' && d.OfferMonth == monthvalue ;});
		fd2 = data.filter(function(d){return d.Status_offerstatuschange == '2' && d.OfferMonth == monthvalue ;});
			var my = '{accepted:'+fd1.length+',rejected:'+fd0.length+'}';
			var objectdf={accepted:fd1.length,rejected:fd0.length,abandoned:fd0.length};
			myarr.push(objectdf);
		}
		
		console.log("$%$%$%%$%$%$%$$%$%$");
		console.log(myarr);

			//Set up stack method
			var stack = d3.stack()
						  .keys([ "accepted", "rejected","abandoned" ])
						  .order(d3.stackOrderDescending);  // <-- Flipped stacking order
			//Data, stacked
			var series = stack(myarr);
			
			
			
				
var w=600;
var h=550;
			
	
	d3.select("#svgvbarchart").remove();

		//Create SVG element
		var svg = d3.select("#date-chart").append("svg").attr("id","svgvbarchart")
							.attr("width", w)
							.attr("height", h);
							
							
				var  margin = {top: 10, right: 20, bottom: 20, left: 35},
		w = +svg.attr("width") - margin.left - margin.right,
		h = +svg.attr("height") - margin.top - margin.bottom;
   
 	//Set up scales
			var xScale = d3.scaleBand()
				.domain(d3.range(myarr.length))
				.range([margin.left, w])
				.paddingInner(0.05);
		
			var yScale = d3.scaleLinear()
				.domain([0,				
					d3.max(myarr, function(d) {
						return d.accepted + d.rejected + d.abandoned;
					})
				])
				.range([h, 0]);  // <-- Flipped vertical scale
				
		
var transform = svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
				
var xScale1 = d3.scaleBand()
				.domain(months)
				.range([margin.left, w])
				.paddingInner(0.05);
				
var yScale1 = d3.scaleLinear()
				.domain([0,				
					d3.max(myarr, function(d) {
						return d.accepted + d.rejected + d.abandoned;
					})
				])
				.range([h, 0]); 
				
	
				
		//Easy colors accessible via a 10-step ordinal scale
			var colors = d3.scaleOrdinal(d3.schemeCategory10);
	
				// Add a group for each row of data
			var groups = svg.selectAll("g")
				.data(series)
				.enter()
				.append("g")
				.style("fill", function(d, i) {
					return colors(i);
				});

		
		
							
				
				// Add a rect for each data value
			var rects = groups.selectAll("rect")
				.data(function(d) { return d; })
				.enter()
				.append("rect")
				.attr("x", function(d, i) {
					return xScale(i);
				})
				.attr("y", function(d) {
					return yScale(d[1]);  // <-- Changed y value
				})
				.attr("height", function(d) {
					return yScale(d[0]) - yScale(d[1]); // <-- Changed height value
				}).on("click",function(d,i){
				console.log("You clicked on bar chart with count"+d+" and month"+months[i]+" with status as"+usrSelectedLoanStatus);
				filterDataForScatterPlot(usrSelectedLoanStatus,months[i]);
				loadtabulardata(dataset,months[i]);
			})
			.attr("width", xScale.bandwidth());
				
			
      /*   .transition()
			.duration(200)
			.delay(function (d, i) {
				return i * 130;
				})
				
			d3.select("#svgvbarchart").select("g").selectAll("rect")
				;
		
 				/*.transition()
			.duration(200)
			.delay(function (d, i) {
				return i * 280;
			})*/
			
			
	var xaxis = svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + h + ")")
      	.call(d3.axisBottom(xScale1).ticks(9).tickSizeInner([0]));
		
		var yaxis= svg.append("g")
				.attr("transform", "translate("+ margin.left + ",0)")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale1));
	
}
	  
	  
	  
	  
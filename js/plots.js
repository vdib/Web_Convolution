
//Author: ANTHONY OMIUNU


// Global Variables
var signalArray1 =[];   	// graph 1 Y-axis values for signal 1 (function 1)
var signalArray2 =[];   	// graph 2 Y-axis values for signal 2 (function 2)
var signalArray3 =[];   	// graph 3 Y-axis values from convolution or correlation result
var samplePoints =[];   	// X-axis values for signals 1 & 2
var sliderSamplePoints = []; // slider dependent sample points 
var samplePeriod = 1 / 128; // 128 samples per unit on the X-axis 
var resultPoints =[];   	 // X-axis values for signals 3
var widthSignal1;  			// width of function 1 gotten from text box 
var widthSignal2;   		// width of function 2 gotten from text box 
var shiftSignal1;   		// shift of function 1 along the X-axis gotten from text box 
var shiftSignal2;   		// shift of function 2 along the X-axis gotten from text box 
var convoCorr = -1; 		// 0 for convolution and 1 for correlation
var s; 			// slider variable
var pnt;		// moving red point 
var pntArrow2;
var pntArrow1;
var pntArrow3;
var multiplier; // zoom factor
var sliderSnapWidth  = 0.05; // slider step
var sliderLeftCoord;    // X, Y coordinate of left border of slider
var sliderRightCoord;	// X, Y coordinate of right border of slider
var overlap;

// Results from convolution and correlation need to be scaled down 
// by a factor of the sampling frequency = 1 / samplePeriod
// Made it so you have to pass the array to be scaled - the function has to be able to work
// with different convolution output arrays, not just one. - AU
function scaleResult(sigAr){
	var signal1 = document.getElementById("functionList1").value;
	var signal2 = document.getElementById("functionList2").value;
	if(signal1 != "6" && signal2 != "6") {
		for(i=0; i < sigAr.length; ++i){
			sigAr[i] = sigAr[i] * samplePeriod * multiplier;
		}
	}
}

// Generate Graphs 1&2 X-axis array
function generateSamplePoints(leftBound, rightBound){
	
	var x = 0;
	multiplier = rightBound / 4;
	samplePoints.length = Math.round((2*rightBound - 2*leftBound) / multiplier /samplePeriod);
	t = 2*leftBound;
	for (x = 0; x < samplePoints.length; x++ ) {
        samplePoints[x] = t;
        t = t + samplePeriod*multiplier;
       
    }
	
}

// Generate Graph 3 X-axis array
function generateResultPoints(pointAr, resAr){
    var N = resAr.length;
    var t_range = N * samplePeriod * multiplier; // get the required range of the X-axis
    var t_out = [];
    var t_start = -1*t_range/2, t_end = t_range/2; // define the starting and ending point for the X-axis
    
    for(t = t_start ; t < t_end;){
        t_out.push(t);
        t = t + samplePeriod * multiplier;
    }
    // pointAr = t_out; // JavaScript is pass by value :(
	for (i = 0; i < t_out.length; i++) { // TODO: fix this part, it's too lame
		pointAr[i] = t_out[i];
	}
}

// This function is called when the visualization tab is opened
// It plots the rect() and tri() functions with default settings
function start(brd,brd2){
	brd1 = brd;
	//document.getElementById("slideCheckBox").disabled = true;
	document.getElementById("slideCheckBox").style.backgroundColor = '#ff0000';
	s = brd.create('slider',[[1,1.5],[3,1.5],[0,0,6]], {name:'s',snapWidth:0.05});
    graph1 = brd.create('curve',[[0],[0]], {
									        name:'s1',
									        strokeColor: 'green'
									        //fillColor: 'green', fillOpacity: 1
									     }); 
    graph2 = brd.create('Curve',[[0],[0]], {
    										name:'s2',
    										strokeColor: 'blue',
    											strokeWidth: 1.7
        									
        										}); 
    graph3 = brd2.create('curve',[[0],[0]], {strokeWidth:1.7, fillColor: 'red', fillOpacity: 0.5});
    //overlap = brd.create('curve', [[],[]], {fillColor: 'blue', fillOpacity: 0.4});
    pnt = brd2.create('point',[100,0], {name: ''});
    pntArrow2 = brd.create('point',[100,0.95], {name: '', face:'^', fillColor: 'blue', strokeColor: 'blue', size: 4 }); 
    pntArrow1 = brd.create('point',[100,0.95], {name: '', face:'^', fillColor: 'green', strokeColor: 'green', size: 4 }); 
    pntArrow3 = brd.create('point',[100,0.95], {name: '', face:'^', fillColor: 'blue', strokeColor: 'blue', size: 4 }); 

    sliderLeftCoord = [1,1.5];
    sliderRightCoord = [3,1.5];
    
    graph1.updateDataArray = function(){ 
        var yAxisValues;
        widthSignal1 = parseFloat(document.getElementById("F1_width").value); // get width from textbox
        shiftSignal1 = parseFloat(document.getElementById("F1_shift").value); // get shift from textbox
        
        yAxisValues = rect(samplePoints,widthSignal1, shiftSignal1); 
        this.dataX = samplePoints; // x axis values for graph 1 on the upper board
        this.dataY = yAxisValues;  // y axis values for graph 1 on the upper board
        signalArray1 = yAxisValues; // send values for convolution or correlation
        //console.log(samplePoints);
        //console.log(signalArray1);

    };
    
    graph2.updateDataArray = function(){
        var yAxisValues;
        widthSignal2 = parseFloat(document.getElementById("F2_width").value); // get width from textbox
        shiftSignal2 = parseFloat(document.getElementById("F2_shift").value); // get shift from textbox
        
        yAxisValues = tri(samplePoints, widthSignal2, shiftSignal2);
        this.dataX = samplePoints; // x axis values for graph 2 on the upper board
        this.dataY = yAxisValues;  // y axis values for graph 2 on the upper board
        signalArray2 = yAxisValues; // send values for convolution or correlation

    };

    brd.update(); // refresh the upper board with latest data
    
    //pntArrow.moveTo([shiftSignal2, 0.95]);  
}

// Replot function 1 graph on upper board if user makes 
// changes to the specification of function 1
function plot1(brd){
	pntArrow1.moveTo([100,0]);
    
	cancelGraphicalView();
    var signal = document.getElementById("functionList1").value; // get the position value of the function plot

    var widthTextObj = document.getElementById("F1_width");
    var shiftTextObj = document.getElementById("F1_shift");
    widthTextObj.disabled = false;
    
    if(widthTextObj.value == '' && signal != "5"){  // if a value is required but none is provided 
        alert('Width field for function 1 cannot be empty');
        widthTextObj.value = ''+ widthSignal1+''; // put the previous value in the text box
    
    }
    else if(widthTextObj.value <= 0){ // width must be greater than 0
    	alert('Width field for function 1 must be greater than 0');
        widthTextObj.value = ''+ widthSignal1+''; // put the previous value in the text box
    }    
    
    else{
        widthSignal1 = parseFloat(document.getElementById("F1_width").value);
    }

    if(shiftTextObj.value == ''){ 
        alert('shift field for function 1 cannot be empty');
        shiftTextObj.value = ''+shiftSignal1+''; // put the previous value in the text box
    }
    else{
        shiftSignal1 = parseFloat(document.getElementById("F1_shift").value);
    }

    //change the Y attribute of the graph to match new user specification 
    graph1.updateDataArray = function(){ 
        var yAxisValues;
            if (signal == "1"){
                yAxisValues = rect(samplePoints, widthSignal1, shiftSignal1);
                pntArrow1.moveTo([100,0]);//resetArrows();
            }
            else if (signal == "2"){
                yAxisValues = tri(samplePoints, widthSignal1, shiftSignal1);
                pntArrow1.moveTo([100,0]);//resetArrows();
            }
            else if (signal == "3"){
               yAxisValues = gaussian(samplePoints, widthSignal1, shiftSignal1);
               pntArrow1.moveTo([100,0]);//resetArrows();
            }
            else if (signal == "4"){
            	
               yAxisValues = sinc(samplePoints, widthSignal1, shiftSignal1);
               pntArrow1.moveTo([100,0]);//resetArrows();
           }
           else if (signal == "5"){
               widthTextObj.disabled = true;
               yAxisValues = step(samplePoints, shiftSignal1);
               pntArrow1.moveTo([100,0]);//resetArrows();
           }
           else if (signal == "6"){
        	   //resetArrows();
        	   widthTextObj.disabled = true;
               yAxisValues = dirac(samplePoints, shiftSignal1);              
               pntArrow1.moveTo([shiftSignal1, 0.95]);
           } 
		   else if (signal == "7") {
			   yAxisValues = udfValues;              
			   pntArrow1.moveTo([100,0]);
			   // console.log("Updated UDF array");
		   };

        this.dataX = samplePoints;  // X axis values for graph 2 on the upper board
        this.dataY = yAxisValues;   // Y axis values for graph 2 on the upper board
        signalArray1 = yAxisValues; // save values for convolution or correlation in global
    };
    
    brd.update();
    
    pnt.moveTo([100,0]); // take red point out of sight
	
    // console.log(pntArrow1.X());
    plot2(brd);
    
 }

// Replot function 2 graph on upper board if user makes 
// changes to the specification of function 2
function plot2(brd){
	pntArrow2.moveTo([100,0]);
	cancelGraphicalView();
    var signal = document.getElementById("functionList2").value; // get the position value of the function plot

    var widthTextObj = document.getElementById("F2_width"); 
    var shiftTextObj = document.getElementById("F2_shift");
    widthTextObj.disabled = false;
 

    if(widthTextObj.value == '' && signal != "5"){      // if a value is required but none is provided 
        alert('Width field for function 2 cannot be empty');
        widthTextObj.value = ''+ widthSignal2+''; // put the previous value in the text box
    }
    else if(widthTextObj.value <= 0){  // width must be greater than 0
    	alert('Width field for function 2 must be greater than 0');
        widthTextObj.value = ''+ widthSignal1+''; // put the previous value in the text box
    }    
    else{
        widthSignal2 = parseFloat(document.getElementById("F2_width").value);
    }

    if(shiftTextObj.value == ''){
        alert('shift field for function 2 cannot be empty');
        shiftTextObj.value = ''+shiftSignal2+'';
    }
    else{
        shiftSignal2 = parseFloat(document.getElementById("F2_shift").value);
    }

    //change the Y attribute of the graph to match new user specification
    graph2.updateDataArray = function(){ 
        var yAxisValues;
        	
            if (signal == "1"){
                yAxisValues = tri(samplePoints,  widthSignal2,  shiftSignal2);// 
                pntArrow2.moveTo([100,0]);//resetArrows();
            }
            else if (signal == "2"){
                yAxisValues = rect(samplePoints, widthSignal2, shiftSignal2);
                pntArrow2.moveTo([100,0]);//resetArrows();
            }
            else if (signal == "3"){
               yAxisValues = gaussian(samplePoints, widthSignal2, shiftSignal2);
               pntArrow2.moveTo([100,0]);//resetArrows();
            }
            else if (signal == "4"){
               yAxisValues = sinc(samplePoints, widthSignal2, shiftSignal2);
               pntArrow2.moveTo([100,0]);//resetArrows();
           }
           else if (signal == "5"){
        	   
               widthTextObj.disabled = true;
               yAxisValues = step(samplePoints, shiftSignal2);
               pntArrow2.moveTo([100,0]);//resetArrows();
           }
           else if (signal == "6"){
        	    
        	    widthTextObj.disabled = true;
                yAxisValues = dirac(samplePoints, shiftSignal2);//  widthSignal2, 
                pntArrow2.moveTo([shiftSignal2, 0.95]);
            };

        this.dataX = samplePoints;
        this.dataY = yAxisValues;
        signalArray2 = yAxisValues; // send values for convolution or correlation
    };

    brd.update();
    
    pnt.moveTo([100,0]); // take red point out of sight
	
	console.log("Plotted successfully");
}

function resetArrows(){
	pntArrow1.moveTo([100,0]);
    pntArrow2.moveTo([100,0]);
    pntArrow3.moveTo([100,0]);
}
// Gets and plots the convolution values for the selected functions
function doConvo(brd2){
	cancelGraphicalView();
	convoCorr = 0;
	var signal1 = document.getElementById("functionList1").value;
	var signal2 = document.getElementById("functionList2").value;
     graph3.updateDataArray = function(){ 
        signalArray3 = conv(signalArray1, signalArray2);
        scaleResult(signalArray3);
        
        generateResultPoints(resultPoints, signalArray3); 	// X-axis points for graph 3
        this.dataX = resultPoints;  // X axis values for graph 2 on the upper board
        this.dataY = signalArray3;  // Y axis values for graph 2 on the upper board
		// console.log(resultPoints);
		// console.log(signalArray3);
        
    };
    brd2.update();
    
    pnt.moveTo([100,0]); // take red point out of sight
    
    plot2(brd);
	console.log("Did convolution");
    return false;
}

// Gets and plots the correlation values for the selected functions
function doCorrelation(brd2){
	cancelGraphicalView();
	convoCorr = 1;
	var signal1 = document.getElementById("functionList1").value;
	var signal2 = document.getElementById("functionList2").value;
	
    graph3.updateDataArray = function(){ 
        
        signalArray3 = xcorr(signalArray1 , signalArray2);
        scaleResult(signalArray3);
        
        generateResultPoints(resultPoints, signalArray3); // X-axis points for graph 3
        this.dataX = resultPoints;
        this.dataY = signalArray3;
        
    };
    
    brd2.update();
    
    pnt.moveTo([100,0]);
    
    plot2(brd);
	console.log("Did correlation");
	return false;
}

function reDrawSignal2(){
	var arrayIndex;
	var checkBox = document.getElementById("slideCheckBox");
	document.getElementById("sliderParagraph").classList.toggle('greyed');
	if(checkBox.checked == true){		
		resizeBoard(); 		
		graph2.updateDataArray = function(){
			
			var signal = document.getElementById("functionList2").value;
			Q = shiftSignal2 - s.Value();
			if (convoCorr == 0){ // convolution
				if(signal == "6") {var xVal = s.Value() - (shiftSignal2); 
											  //console.log(xVal);
											  pntArrow2.moveTo([xVal, 0.95]); }
				for (x = 0; x < samplePoints.length; x++ ) {
					sliderSamplePoints[x] =  samplePoints[x] - Q - (shiftSignal2);
					
				}
			}
			else{ // Correlation
				if(signal == "6") {var xVal = s.Value() + (shiftSignal2); 
				  							  pntArrow2.moveTo([xVal, 0.95]); }
				for (x = 0; x < samplePoints.length; x++ ) {
					sliderSamplePoints[x] =  samplePoints[x] - Q + (shiftSignal2);
				}
			}
			
			
			if (s.Value() == s._smin){ // slider at lowest value
	    		arrayIndex = 1536; // size of convolution array divided 2 minus 512
	    	}
	    	else if (s.Value() == s._smax){ // slider at highest value
	    		arrayIndex = 2560; // size of convolution array divided 2 plus 512
	    	}
	    	else 
	    	{
	    		maxNumberOfIntervals = (s._smax - s._smin) / sliderSnapWidth;
	    		currNumberOfIntervals = (s.Value() - s._smin) / sliderSnapWidth;
	    		intervalSize = (1024 / maxNumberOfIntervals);
	    		arrayIndex = Math.floor(intervalSize * currNumberOfIntervals) + 1536;
	    	}	
	    	
			this.dataX = sliderSamplePoints;
			this.dataY = signalArray2;
			
			pnt.moveTo([s.Value(), signalArray3[arrayIndex]]);
			
		};
		
		brd.update();
	}
	else{
		//document.getElementById("sliderParagraph").classList.toggle('greyed');
		plot2(brd);
	}
}

// resize the board to ensure that function graphs 1 and 2 do not overlap
function resizeBoard(){
    //console.log(leftBound);
	var x = 0;
	var coords = brd.getBoundingBox();
	currentLeftBound = coords[0];

	// value that ensures that function 2 does not overlap function 1
	maxStartingPoint = shiftSignal1 - (widthSignal1/2 + widthSignal2/2 + 2);
	
	
	//zoom out until the 2 functions do not overlap
	while(maxStartingPoint < currentLeftBound){ 
		
		brd.zoomOut();
		coords = brd.getBoundingBox();
		currentLeftBound = coords[0];
		
	}
	
	s.setMax(-1*currentLeftBound); // set slider upper limit
	s.setMin(currentLeftBound);	   // set slider lower limit
	
	// updateUdfSliderLimits(brd); // udf slider
}

// adjust slider size and position based on zoom factor
function adjustSlider(){
	
	if (currentCoordinateArray[2] < previousCoordinateArray[2]){ // zoom in
		var yCoord = 0.7826 * (currentCoordinateArray[1] - currentCoordinateArray[3]) + currentCoordinateArray[3];
	// set new slider coordinates
		sliderLeftCoord[0] = sliderLeftCoord[0]/1.25;
		sliderLeftCoord[1] = yCoord;
		sliderRightCoord[0] = sliderRightCoord[0] / 1.25;
		sliderRightCoord[1] = yCoord;
		console.log(currentCoordinateArray[1] +' '+ sliderRightCoord[1]);
	//-------------------------------------------------------
	
	// Update slider slider position
		s.baseline.point1.setPosition(JXG.COORDS_BY_USER,[sliderLeftCoord[0],sliderLeftCoord[1]] );
		s.baseline.point2.setPosition(JXG.COORDS_BY_USER,[sliderRightCoord[0],sliderRightCoord[1]] );
	}
	else if (currentCoordinateArray[2] > previousCoordinateArray[2]){ // zoom out
		var yCoord = 0.7826 * (currentCoordinateArray[1] - currentCoordinateArray[3]) + currentCoordinateArray[3];
	// set new slider coordinates
		sliderLeftCoord[0] = sliderLeftCoord[0] * 1.25;
		sliderLeftCoord[1] = yCoord;
		sliderRightCoord[0] = sliderRightCoord[0] * 1.25;
		sliderRightCoord[1] = yCoord;
		
	// ------------------------------------------------------
	
	// Update slider slider position
		s.baseline.point1.setPosition(JXG.COORDS_BY_USER,[sliderLeftCoord[0],sliderLeftCoord[1]] );
		s.baseline.point2.setPosition(JXG.COORDS_BY_USER,[sliderRightCoord[0],sliderRightCoord[1]] );
	}
	else{}
	brd.fullUpdate();
} 

function cancelGraphicalView(){
	document.getElementById("sliderParagraph").classList.remove('greyed');
	document.getElementById("slideCheckBox").checked = false;	
}

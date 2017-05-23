/**
 * Muse Headband Data Stream
 * @author Noel Colon
 * @description Live data stream of Muse headband brainwaves using web sockets.
 * @version 0.1.0 
 */

// UDP WebSocket Port
var p = new osc.WebSocketPort({
    url: `ws://${location.hostname}:${location.port}`
});

p.on('open', function(){
    console.log('Opened WebSocket URL: ', p.options.url);
});

var sensors = document.getElementById('sensors'),
    binary = document.getElementById('binary'),
    eeg = document.getElementById('eeg'),
    wavelengths = document.getElementById('wavelengths');


// Smoothie charts default options
var chartOptions = {
    minValue: 750,
    maxValue: 950,
    strokeStyle: 'rgb(125, 0, 0)',
    fillStyle: 'rgb(60, 0, 0)',
    lineWidth: 1,
    millisPerLine: 150,
    verticalSections: 7,
    labels: {
        fillStyle: 'rgb(255, 255, 255)',
        fontSize: 15,
        fontFamily: 'sans-serif',
        precision: 2
    }
};

// Titles for charts
var renderOverride = function(title){
    SmoothieChart.prototype.render.call(this);

    var canvas = this.canvas;
    var eegContext = canvas.getContext('2d');

    eegContext.textAlign = 'left';
    eegContext.font = '15px PT Sans Caption'
    eegContext.fillStyle = 'white';
    eegContext.fillText(title, 10, 20);
}

// Smoothie charts
var eegChart = new SmoothieChart(chartOptions);
eegChart.render = renderOverride.bind(eegChart, 'EEG Chart');

chartOptions.minValue = -2;
chartOptions.maxValue = 2;

var wavelengthsChart = new SmoothieChart(chartOptions);
wavelengthsChart.render = renderOverride.bind(wavelengthsChart, 'Wavelengths Chart');

// chartOptions.minValue = -2;
// chartOptions.maxValue = 2;

var binaryChart = new SmoothieChart(chartOptions);
binaryChart.render = renderOverride.bind(binaryChart, 'Binary Chart');


// Stream charts to canvas elements
eegChart.streamTo(eeg);
wavelengthsChart.streamTo(wavelengths);
binaryChart.streamTo(binary);

// Setup time series instances for charts
// Left Ear
var tp9 = new TimeSeries(),
// Left forehead
    af7 = new TimeSeries(),
// Right forehead
    af8 = new TimeSeries(),
// Right ear
    tp10 = new TimeSeries(),
// Right auxiliary (MU-02 model only, not entirely sure what this is)
    auxr = new TimeSeries(),
// Binary series
    bin = new TimeSeries(),
// Wavelength series
    del = new TimeSeries(),
    the = new TimeSeries(),
    alp = new TimeSeries(),
    bet = new TimeSeries(),
    gam = new TimeSeries();

// Frequency colors
var dc = 'rgb(255, 0, 0)',
    tc = 'rgb(255, 0, 255)',
    ac = 'rgb(0, 225, 255)',
    bc = 'rgb(66, 244, 80)',
    gc = 'rgb(255, 255, 0)';

// Sensor elements
var leftEar = document.getElementById('leftEar'),
    leftForehead = document.getElementById('leftForehead'),
    middle = document.getElementById('middle'),
    rightForehead = document.getElementById('rightForehead'),
    rightEar = document.getElementById('rightEar');

function onMessageCallback(msg){
    // Incoming Muse Data
    // console.log(msg);

    var addr = msg.address,
        eeg = addr.match(/eeg/g),
        elements = addr.match(/elements/g),
        delta = addr.match(/delta/g),
        theta = addr.match(/theta/g),
        alpha = addr.match(/alpha/g),
        beta = addr.match(/beta/g),
        gamma = addr.match(/gamma/g),
        forehead = addr.match(/touching_forehead/g),
        horseshoe = addr.match(/horseshoe/g);

    // EEG (Active neural stream in microvolts)
    if(eeg){
        if(msg.args[0] >= 800 && msg.args[0] <= 900){
            tp9.append(new Date().getTime(), msg.args[0]);
        } else if(msg.args[1] >= 800 && msg.args[1] <= 900){
            af7.append(new Date().getTime(), msg.args[1]);
        } else if(msg.args[2] >= 800 && msg.args[2] <= 900){
            af8.append(new Date().getTime(), msg.args[2]);
        } else if(msg.args[3] >= 800 && msg.args[3] <= 900){
            tp10.append(new Date().getTime(), msg.args[3]);
        }
    };

    // Binary
    if(elements && gamma){
        if((msg.args[0] > 0) && (msg.args[1] > 0)){
            bin.append(new Date().getTime(), 1);
        } else if((msg.args[2] > 0) && (msg.args[3] > 0)){
            bin.append(new Date().getTime(), -1);
        } else {
            bin.append(new Date().getTime(), 0);
        };
    };

    // Sensors
    // 1 = good, 2 = ok, >=3 bad

    function analyzeSensorContact(element, contact){
        switch(contact){
            case 1:
                return element.style.fill = 'green';
            case 2:
                return element.style.fill = 'yellow';
            default:
                return element.style.fill = 'red';
        }
    };

    var sensorMap = [leftEar, leftForehead, rightForehead, rightEar];

    if(forehead){
        analyzeSensorContact(middle, msg.args[0]);
    } else if(horseshoe){
        var sensors = msg.args;

        for(var i = 0; i < sensors.length; i++){
            analyzeSensorContact(sensorMap[i], sensors[i]);
        };
    };

    // Wavelengths
    if(elements){
        var data = msg.args;
        var avg = 0, mean;

        for(var i = 0; i < data.length; i++){
            avg += data[i];
        };

        mean = (avg / data.length);

        if(delta){
            del.append(new Date().getTime(), mean);
        } else if(theta){
            the.append(new Date().getTime(), mean);
        } else if(alpha){
            alp.append(new Date().getTime(), mean);
        } else if(beta){
            bet.append(new Date().getTime(), mean);
        } else if(gamma){
            gam.append(new Date().getTime(), mean);
        };
    };
};

p.on('message', onMessageCallback);

// Chart Configuration
var lineWidth = 1;
var eegTimeSeries = [tp9, af7, af8, tp10];
var wavelenthsTimeSeries = [del, the, alp, bet, gam];
var colors = [dc, tc, ac, bc];

// EEG
for(var i = 0; i < eegTimeSeries.length; i++){
    eegChart.addTimeSeries(eegTimeSeries[i], {
        strokeStyle: colors[i],
        lineWidth: lineWidth
    });
};

// Binary
binaryChart.addTimeSeries(bin, {
    strokeStyle: '#F5F5DC',
    lineWidth: 2
});

// Wavelengths
for(var i = 0; i < wavelenthsTimeSeries.length; i++){
    wavelengthsChart.addTimeSeries(wavelenthsTimeSeries[i], {
        strokeStyle: colors[i] || gc,
        lineWidth: lineWidth
    });
};

p.open();
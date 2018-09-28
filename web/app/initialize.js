document.addEventListener('DOMContentLoaded', function () {
  // do your setup here

  var websocket = require('websocket-stream');
  var ws = websocket('ws://localhost:3000/live', {
    perMessageDeflate: false
  });

  var init;
  var audioCache;

  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  var soundController = {};
  soundController.speakerContext = audioContext;
  soundController.nextTime = 0;
  init = false;
  audioCache = [];

  ws.on('connected', function () {
    console.log('Connected!');
  });

  ws.on('data', function (data) {
    // console.log(data);
    var s_array = new Int16Array(data.buffer);
    var array = new Float32Array(s_array.length);
    for (var i in s_array) {
      array[i] = s_array[i] / 32668.0;
    }

    var buffer = soundController.speakerContext.createBuffer(1, array.length, 16000);
    buffer.copyToChannel(array, 0);

    var source = soundController.speakerContext.createBufferSource();
    source.buffer = buffer;
    // source.connect(soundController.speakerContext.destination);
    audioCache.push(source);
    // make sure we put at least 5 chunks in the buffer before starting
    if ((init === true) || ((init === false) && (audioCache.length > 0))) {
      init = true;
      soundController.playCache(audioCache);
    }
  });

  soundController.playCache = function (cache) {
    // while (cache.length) {
    if (cache.length) {
      $('.playbtn').prop('disabled', false);
      var source = cache.shift();
      // source.buffer = buffer;
      if (soundController.nextTime == 0) {
        // add a delay of 0.05 seconds
        soundController.nextTime = soundController.speakerContext.currentTime + 0.05;
      }

      source.connect(soundController.speakerContext.destination);
      source.connect(soundController.analyser);
      jsNode.connect(soundController.speakerContext.destination);
      soundController.analyser.connect(jsNode);

      source.start(soundController.nextTime);
      // schedule buffers to be played consecutively
      soundController.nextTime += source.buffer.duration;

      soundController.playCache(cache);
    }
  };

  // var volumeBars = {
  //   mono: document.getElementById("monoFill")
  // };

  soundController.analyser = soundController.speakerContext.createAnalyser();
  soundController.analyser.smoothingTimeConstant = 0.7;
  soundController.analyser.fftSize = 256;

  jsNode = soundController.speakerContext.createScriptProcessor(2048, 1, 1);
  jsNode.onaudioprocess = function () {
    var array = new Uint8Array(soundController.analyser.frequencyBinCount);
    soundController.analyser.getByteFrequencyData(array);
    // $('#monoFill').transition({scale:Math.average(array)})
    console.log(Math.average(array)/6)

    $('#monoFill').css('transform','scale('+Math.log10(Math.average(array)/12) + ')');
    // $('#monoFill').css('width',(Math.average(array) * 10) + '%');

    // volumeBars.mono.style.height = Math.average(array) * 4 + "px";
  }

  Math.average = function (arguments) {
    var numbers;
    if (arguments[0] instanceof Array) {
      numbers = arguments[0];
    }
    else if (typeof arguments[0] == "number") {
      numbers = arguments;
    }
    var sum = 0;
    var average = 0;
    for (var i = 0; i < numbers.length; i++) {
      sum += numbers[i];
    }
    average = sum / numbers.length;
    return average;
  }

  var playbtn = $('#playbtn');
  playbtn.on('click', () => {
    console.log('click');
    //TODO:
    playCache(audioCache);
    
  });

  $('#serverinfo').text(window.location.href);

  console.log('Initialized app');
});

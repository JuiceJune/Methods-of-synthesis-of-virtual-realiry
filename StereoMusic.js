let context,
    src,
    highpassFilter,
    spatialAudio,
    audio = null;

function presetAudio() {
    audio = document.getElementById('muslo');

    audio.addEventListener('play', () => {
        if (!context) {
            context = new AudioContext();
            src = context.createMediaElementSource(audio);
            spatialAudio = context.createPanner();
            highpassFilter = context.createBiquadFilter();

            src.connect(spatialAudio);
            spatialAudio.connect(highpassFilter);
            highpassFilter.connect(context.destination);

            highpassFilter.type = 'highpass';
            highpassFilter.Q.value = 0.75;
            highpassFilter.frequency.value = 1000;
            // highpassFilter.gain.value = 1; not used in highpass filter
            context.resume();
        }
    })


    audio.addEventListener('pause', () => {
        console.log('pause');
        context.resume();
    })
}

function initAudio() {
    let stateControl = document.getElementById('stateControl');
    stateControl.addEventListener('change', function () {
        if (stateControl.checked) {
            spatialAudio.disconnect();
            spatialAudio.connect(highpassFilter);
            highpassFilter.connect(context.destination);
        } else {
            spatialAudio.disconnect();
            spatialAudio.connect(context.destination);
        }
    });
    audio.play();
}
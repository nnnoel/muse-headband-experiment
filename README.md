# Muse Headband Experiment
### Author: Noel Colon
Brain sensing headband used to model positive and negative emotional patterns.
> Requires [Muse headband](http://www.choosemuse.com/) and the [Muse Monitor](https://play.google.com/store/apps/details?id=com.sonicPenguins.museMonitor&hl=en) android app

Any OSC data emitting server that's compatible with Muse should be able to work as an alternative to Muse Monitor.

### Introduction
Muse is a brain sensing headband used for measuring brain states in meditation. Muse's API provides feedback for muscle movements, absolute band powers (Alpha, Beta, Theta, etc), raw EEG and FFT data (Fast Fourier Transform), and much more.

### Purpose
To gather positive and negative emotional feedback using the Muse API.
Over web sockets, this web app is designed to graph a live stream data and intelligently distinguish positive and negative emotions by emulating a data model described in the [e-Avatar Muse Mood Software](http://www.brainm.com/software/muse/MOOD%20MANUAL.pdf) manual (also included in repo).

### Instructions
* Match your OSC server to the IP specified from the node server
* Emit data from the headband ([Howto](http://www.musemonitor.com/Technical_Manual.php#help_streaming) with Muse Monitor)
* Open up a web browser and navigate to the address provided by the node server.
> Ensure the headband is making complete contact with skin for good signal quality
### Installation
* Having the latest version of Node is recommended
* Providing ports for `PORT` and `UDPPort` are optional
 
1. ```npm install```
2. ``` PORT=8475 UDPPort=5001 node server ```

Credits to [@colinbdclark](https://github.com/colinbdclark/) for exemplifying [osc.js](https://github.com/colinbdclark/osc.js/) browser and server compatibility.
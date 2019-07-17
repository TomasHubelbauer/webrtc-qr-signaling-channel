# WebRTC QR Signaling Channel

[**LIVE**](https://tomashubelbauer.github.io/webrtc-qr-signaling-channel)

- Start the application using `npx https-localhost`
- Find out what the network URL of your laptop is (check `npx serve .` to find it)
- Open the application on your laptop at the network URL
- Allow access to the webcam on your laptop (used to scan the code on the phone)
- Wait for the QR code to load and scan it using your phone's built in QR scanner
- Allow access to the webcam on your phone (not used, required for WebRTC ICE)
- Wait for the QR code on your phone to load and show it to your laptop webcam
- Watch both codes disappear as the connection is established between the devices

On iOS, the Camera app is capable of scanning QR codes by default and you can
also pin a control to the Control Centre called *Scan QR Code* which opens it.

On Android, the Camera app scans QR codes if the *Google Lens Suggestion* option
is enabled in the Camera app settings.

## To-Do

Handle errors: camera permission not granted, WebRTC errors…

Figure out why *ICE failed, add a TURN server and see about:webrtc for more
details* happens even though I am able to successfully establish the connection.

Add more handlers to the peer connection and the data channel and add UI which
shows the states of both.

Demonstrate the functionality by implementing a local storage syncing mechanism
on top of the data channel peer connection.

Parse out important bits from the SDP either way and display only that in the
codes so that they are easier to scan on both ends.

Add a UI button for joining without using the phone QR scanner flow in case of
connecting two laptops/phones or not having a QR scanner on the phone. This will
just need to add another bit of data to the code - if it is another offer or an
answer and based on it switch the flows. (Because by default both would show an
offer and the one which notices each other first should display an answer for
the other to then notice.)

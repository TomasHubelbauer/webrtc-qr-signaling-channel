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

Handle more states: user media handlers, peer connection handlers…

Figure out why *ICE failed, add a TURN server and see about:webrtc for more
details* happens even though I am able to successfully establish the connection.

Add UI which shows the states of the peer connection and the data channel.

Demonstrate the functionality by implementing a local storage syncing mechanism
on top of the data channel peer connection. Send only diffs instead of the full
data with each change and on the other end patch the existing content with the
change. Also probably add version number and ensure the current messags one is
one larger than the last one so we didn't miss messages. If it is the same we
have a conflict and need to present resolution UI.

Parse out important bits from the SDP either way and display only that in the
codes so that they are easier to scan on both ends.

Add a UI button for joining without using the phone QR scanner flow in case of
connecting two laptops/phones or not having a QR scanner on the phone. This will
just need to add another bit of data to the code - if it is another offer or an
answer and based on it switch the flows. (Because by default both would show an
offer and the one which notices each other first should display an answer for
the other to then notice.)

Add a read-receipt style message to acknoweledge reception of a message on the
other side.

Research options of keeping the application alive while the device gets locked
(maybe using a service worker? maybe there is a JS API for this?) and/or how to
reconnect a peer connection that got interrupted by the lock (can reuse the same
SDP?).

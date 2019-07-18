window.addEventListener('load', async () => {
  const streamVideo = document.getElementById('streamVideo');
  const codeSvg = document.getElementById('codeSvg');
  const shareTextArea = document.getElementById('shareTextArea');

  const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
  if (location.search) {
    /* Answer */

    // This is needed by Safari to gather candidates even for data-channel-only peer connections :-( https://stackoverflow.com/a/53914556/2715716
    await navigator.mediaDevices.getUserMedia({ video: true });

    const sdp = atob(location.search.substring('?'.length));
    await peerConnection.setRemoteDescription({ sdp, type: 'offer' });
    await peerConnection.setLocalDescription(await peerConnection.createAnswer());
    peerConnection.addEventListener('icecandidate', event => render(peerConnection.localDescription.sdp, event.candidate === null));
    peerConnection.addEventListener('datachannel', event => {
      streamVideo.remove();
      codeSvg.remove();
      event.channel.addEventListener('open', () => {
        document.body.append(document.createTextNode('Answerer connected. '));
        event.channel.send('hi, this is answerer');

        shareTextArea.disabled = false;
        shareTextArea.addEventListener('input', () => event.channel.send(shareTextArea.value));
      });

      event.channel.addEventListener('message', event => shareTextArea.value = event.data);
      event.channel.addEventListener('close', () => document.body.append(document.createTextNode('Answerer disconnected. ')));
      event.channel.addEventListener('error', () => document.body.append(document.createTextNode('Answerer errored. ')));
    });
  } else {
    /* Offer */

    const dataChannel = peerConnection.createDataChannel('webrtc-qr-signaling-channel');
    await peerConnection.setLocalDescription(await peerConnection.createOffer());
    peerConnection.addEventListener('icecandidate', async event => {
      const final = event.candidate === null;
      render(location.origin + location.pathname + '?' + btoa(peerConnection.localDescription.sdp), final);
      if (final) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamVideo.srcObject = mediaStream;
        await streamVideo.play();
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = streamVideo.videoWidth;
        frameCanvas.height = streamVideo.videoHeight;
        const context = frameCanvas.getContext('2d');
        void async function scan() {
          context.drawImage(streamVideo, 0, 0);
          const { data, width, height } = context.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
          const code = jsQR(data, width, height);
          if (code && code.data) {
            mediaStream.getTracks().forEach(track => track.stop());
            streamVideo.remove();
            codeSvg.remove();

            const sdp = code.data;
            await peerConnection.setRemoteDescription({ sdp, type: 'answer' });
            return;
          }

          window.requestAnimationFrame(scan);
        }()
      }
    });

    dataChannel.addEventListener('open', () => {
      document.body.append(document.createTextNode('Offerer connected. '));
      dataChannel.send('hi, this is offerer');

      shareTextArea.disabled = false;
      shareTextArea.addEventListener('input', () => dataChannel.send(shareTextArea.value));
    });

    dataChannel.addEventListener('message', event => shareTextArea.value = event.data);
    dataChannel.addEventListener('close', () => document.body.append(document.createTextNode('Offerer disconnected. ')));
    dataChannel.addEventListener('error', () => document.body.append(document.createTextNode('Offerer errored. ')));
  }

  function render(code, final) {
    const qr = qrcode(0, 'L');
    qr.addData(code, 'Byte');
    qr.make();

    const moduleCount = qr.getModuleCount();
    const fragment = document.createDocumentFragment();
    for (let y = 0; y < moduleCount; y++) {
      for (let x = 0; x < moduleCount; x++) {
        if (!qr.isDark(x, y)) {
          continue;
        }

        // Set attribute must be used with SVG namespace tags
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', 1);
        rect.setAttribute('height', 1);
        fragment.append(rect);
      }
    }

    // Set attribute must be used with SVG namespace tags
    codeSvg.setAttribute('width', moduleCount);
    codeSvg.setAttribute('height', moduleCount);
    codeSvg.setAttribute('viewBox', `0 0 ${moduleCount} ${moduleCount}`);
    codeSvg.setAttribute('class', final ? 'final' : '');

    codeSvg.innerHTML = '';
    codeSvg.append(fragment);
  }
});

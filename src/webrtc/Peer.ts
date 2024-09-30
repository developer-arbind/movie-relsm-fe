class Peer {
  public peer: RTCPeerConnection | null = null;
  public BYNARY_TYPE_CHANNEL = "arraybuffer";
  public channel: RTCDataChannel | null = null;
  public MAXIMUM_SIZE_DATA_TO_SEND = 65535;
  public BUFFER_THRESHOLD = 65535;
  public LAST_DATA_OF_FILE = "LDOF7";
  public paused: boolean = false;
  public queue: Array<string | ArrayBuffer> = [];
  constructor() {
    if (!this.peer) {
      this.makePeer();
    }
  }
  async makePeer() {
    console.log("how many times it is comming??");
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }
  createDataChannel() {
    if (!this.peer) return;
    const channelLabel = "peer-to-peer";
    this.channel = this.peer.createDataChannel(channelLabel);
    this.channel.binaryType = this.BYNARY_TYPE_CHANNEL as BinaryType;
    console.log("data channel is created!: ", this.channel);
  }

  send(data: string | ArrayBuffer) {
    this.queue.push(data);
    if (this.paused) {
      return;
    }
    this.shiftQueue();
  }

  shiftQueue() {
    console.log("when shift queue working!");
    this.paused = false;
    let message = this.queue.shift();

    if (!this.channel) return;
    while (message) {
      if (
        this.channel.bufferedAmount &&
        this.channel.bufferedAmount > this.BUFFER_THRESHOLD
      ) {
        this.paused = true;
        this.queue.unshift(message);

        const listener = () => {
          if (!this.channel) return;
          this.channel.removeEventListener("bufferedamountlow", listener);
          this.shiftQueue();
        };
        this.channel.addEventListener("bufferedamountlow", listener);
        return;
      }

      try {
        this.channel.send(message as unknown as ArrayBufferView);
        message = this.queue.shift();
      } catch (error: any) {
        throw new Error(
          `Error to send the next data: ${error.name} ${error.message}`
        );
      }
    }
  }

  transferFile(fileToShare: Blob | null) {
    if (!fileToShare) return;
    if (!this.channel) return;
    console.log("do it's comming here?");
    this.channel.onopen = async () => {
      const arrayBuffer = await fileToShare.arrayBuffer();
      console.log("is connection established: ", arrayBuffer);
      try {
        this.send(
          JSON.stringify({
            totalByte: arrayBuffer.byteLength,
            dataSize: this.MAXIMUM_SIZE_DATA_TO_SEND,
          })
        );

        for (
          let index = 0;
          index < arrayBuffer.byteLength;
          index += this.MAXIMUM_SIZE_DATA_TO_SEND
        ) {
          this.send(
            arrayBuffer.slice(index, index + this.MAXIMUM_SIZE_DATA_TO_SEND)
          );
        }
        this.send(this.LAST_DATA_OF_FILE);
      } catch (error) {
        console.error("error sending big file", error);
      }
    };

    return true;
  }
   async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
  async connectRemoteOffer(offer: any) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(answer));
      return answer;
    }
  }
  async setRemoteDescription(ans: any) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }
}

export default Peer;

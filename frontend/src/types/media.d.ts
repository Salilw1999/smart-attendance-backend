interface MediaProvider extends MediaSource {
  getTracks(): MediaStreamTrack[];
}

declare global {
  interface MediaStream {
    getTracks(): MediaStreamTrack[];
  }
}
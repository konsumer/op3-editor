// this is the glue between UI and sound-engine
// this could be streaming, but I just inject the rendered wave into an audio-element

import OPL from '@malvineous/opl'


const upload = document.getElementById('upload_file')
const downloadWAV = document.getElementById('download_wav')
const audio = document.getElementById('audio')

// this converts IMF/WLF file (as ArrayBuffer/Uint8Array/Buffer/etc) to raw WAV bytes
async function loadImfAudio(bytes, wlf=false) {
  const imf = new Uint8Array(bytes)
  const tempoInHz = wlf ? 700 : 560
  const opl = await OPL.create()
  const samplesPerTick = Math.round(opl.sampleRate / tempoInHz)
  const wavDataOut = []
  let lenIMF = imf.length
  let p = 0
  if (imf[0] || imf[1]) {
    lenIMF = imf[0] | (imf[1] << 8)
    p = 2
  }
  let samplesWritten = 0
  while (p < lenIMF) {
    const reg = imf[p + 0]
    const val = imf[p + 1]
    const delay = imf[p + 2] | (imf[p + 3] << 8)
    opl.write(reg, val)
    if (delay) {
      let lenGen = delay * samplesPerTick
      while (lenGen > 0) {
        const lenNow = Math.max(2, Math.min(512, lenGen))
        wavDataOut.push(...opl.generate(lenNow))
        samplesWritten += lenNow
        lenGen -= lenNow
      }
    }
    p += 4
  }
  const lenData = samplesWritten * 4
  const lenRIFF = lenData + 36
  const a = new ArrayBuffer(44 + lenData)
  const u = new Uint8Array(a)
  const v = new DataView(a)
  u.set(wavDataOut, 44)
  v.setUint32(0, 0x52494646); // RIFF
  v.setUint32(4, lenRIFF, true);
  v.setUint32(8, 0x57415645); // WAVE
  v.setUint32(12, 0x666d7420); // fmt_
  v.setUint32(16, 16, true); // fmt chunk length
  v.setUint16(20, 1, true); // 1=PCM
  v.setUint16(22, 2, true); // stereo
  v.setUint32(24, opl.sampleRate, true);
  v.setUint32(28, opl.sampleRate * opl.channelCount * 2, true);
  v.setUint16(32, opl.channelCount * 2, true); // block align
  v.setUint16(34, 16, true); // bits per sample
  v.setUint32(36, 0x64617461); // data
  v.setUint32(40, lenData, true); // data chunk length
  return u
}

async function bytesToImf(imfbytes) {
  if (audio.src){
    URL.revokeObjectURL(audio.src)
  }
  const bytes = await loadImfAudio(imfbytes)
  const blob = new Blob([bytes], { 'type' : 'audio/wav; codecs=0' })
  audio.src=URL.createObjectURL(blob)
  downloadWAV.href=audio.src
}

upload.addEventListener('change', async e => {
  if (audio.src){
    URL.revokeObjectURL(audio.src)
  }
  await bytesToImf(await e.target.files[0].arrayBuffer())
  audio.play()
})


// preload a demo
bytesToImf(await fetch('presets/demo.imf').then(r => r.arrayBuffer()))




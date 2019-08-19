const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");
const greenScreenSelector = document.querySelector(".rgb");

let filter = "";

function getVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(err => {
      console.error(`Oh boy...`, err);
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    let pixels = ctx.getImageData(0, 0, width, height);

    switch (filter) {
      case "red":
        pixels = redEffect(pixels);
        ctx.globalAlpha = 1;
        greenScreenSelector.classList.add("hidden");
        break;

      case "green":
        pixels = greenEffect(pixels);
        ctx.globalAlpha = 1;
        greenScreenSelector.classList.add("hidden");
        break;

      case "blue":
        pixels = blueEffect(pixels);
        ctx.globalAlpha = 1;
        greenScreenSelector.classList.add("hidden");
        break;

      case "ghost":
        pixels = rgbSplit(pixels);
        ctx.globalAlpha = 0.1;
        greenScreenSelector.classList.add("hidden");
        break;

      case "green-screen":
        pixels = greenScreen(pixels);
        ctx.globalAlpha = 1;
        ctx.putImageData(pixels, 0, 0);
        greenScreenSelector.classList.remove("hidden");
        break;

      default:
        pixels = pixels;
        ctx.globalAlpha = 1;
        greenScreenSelector.classList.add("hidden");
        break;
    }
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  snap.currentTime = 0;
  snap.play();

  const data = canvas.toDataURL("image/jpeg");
  const link = document.createElement("a");
  link.href = data;
  link.setAttribute("download", "handsome");
  link.innerHTML = `<img src=${data} alt='Handsome Person'/>`;
  strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100; //red
    pixels.data[i + 1] = pixels.data[i + 1] - 50; //green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
  }
  return pixels;
}

function greenEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] - 200; //red
    pixels.data[i + 1] = pixels.data[i + 1] + 100; //green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
  }
  return pixels;
}
function blueEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] * 0.5; //red
    pixels.data[i + 1] = pixels.data[i + 1] - 50; //green
    pixels.data[i + 2] = pixels.data[i + 2] + 80; //blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; //red
    pixels.data[i + 100] = pixels.data[i + 1]; //green
    pixels.data[i - 200] = pixels.data[i + 2]; //blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll(".rgb input").forEach(input => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 2];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

function setFilter(filterSet) {
    filter = filterSet;
    return filter
}

getVideo();

video.addEventListener("canplay", paintToCanvas);

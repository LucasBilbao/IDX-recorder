const button = document.querySelector('[data-starter]');
const copier = document.querySelector('[data-copier]');
const stopper = document.querySelector('[data-stopper]');
const p = document.querySelector('[data-bpm]');
let char = null;

button.addEventListener('click', () => {
  console.clear();
  setupConsoleGraphExample(100, 400);
  connect({ onChange: printHeartRate }).catch(console.error);
});

copier.addEventListener('click', () => {
  navigator.clipboard.writeText(p.innerText);
});

stopper.addEventListener('click', () => {
  disconnect();
});

async function connect(props) {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ['heart_rate'] }],
    acceptAllDevices: false,
  });
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService('heart_rate');
  char = await service.getCharacteristic('heart_rate_measurement');
  char.oncharacteristicvaluechanged = props.onChange;
  char.startNotifications();
  return char;
}

async function disconnect(props) {
  char.oncharacteristicvaluechanged = null;
}
let hrData = new Array(200).fill(10);

function printHeartRate(event) {
  const heartRate = event.target.value.getInt8(1);
  const prev = hrData[hrData.length - 1];
  hrData[hrData.length] = heartRate;
  hrData = hrData.slice(-200);
  let arrow = '';
  if (heartRate !== prev) arrow = heartRate > prev ? '⬆' : '⬇';
  console.clear();
  console.graph(hrData);
  console.log(
    `%c\n💚 ${heartRate} ${arrow}`,
    'font-size: 24px;',
    '\n\n(To disconnect, refresh or close tab)\n\n'
  );

  if (heartRate === prev) {
    return;
  }
  p.innerText = `${p.innerText}BPM: ${heartRate} | Time: ${Date()};\n`;
}

function setupConsoleGraphExample(height, width) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = height;
  canvas.width = width;
  context.fillStyle = '#fff';
  window.console.graph = (data) => {
    const n = data.length;
    const units = Math.floor(width / n);
    width = units * n;
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < n; ++i) {
      context.fillRect(i * units, 0, units, 100 - data[i] / 2);
    }
    console.log(
      '%c ',
      `font-size: 0; padding-left: ${width}px; padding-bottom: ${height}px;
       background: url("${canvas.toDataURL()}"), -webkit-linear-gradient(#eee, #888);`
    );
  };
}

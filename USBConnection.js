var PARASITE_VENDOR_ID = 1204; //0x04b4;
var PARASITE_PRODUCT_ID = 8213; //0x2015;
var DEVICE_INFO = {"vendorId": PARASITE_VENDOR_ID, "productId": PARASITE_PRODUCT_ID};
var parasiteDevice;
var permissionObj = {permissions: [{'usbDevices': [DEVICE_INFO] }]};
var requestButton = document.getElementById("requestPermission");


var transfer = {
  direction: 'in',
  endpoint: 1,
  length: 6
};

var onEvent = function(usbEvent) {
    
    if (usbEvent.resultCode) {
      console.log("Error: " + usbEvent.error);
      return;
    }

    var dv = new DataView(usbEvent.data);
    var knobState = {
      _ledStatus: dv.getUint8(4),
      buttonState: dv.getUint8(0),
      knobDisplacement: dv.getInt8(1),
      ledBrightness: dv.getUint8(3),
      pulseEnabled: (dv.getUint8(4) & 1) == 1,
      pulseWhileAsleep: (dv.getUint8(4) & 4) == 4,
      pulseSpeed: null,
      pulseStyle: null,
      ledMultiplier: dv.getUint8(5)
    };

    //chrome.usb.interruptTransfer(parasiteDevice, transfer, onEvent);
};


var gotPermission = function(result) {
    console.log('App was granted the "usbDevices" permission.');
    chrome.usb.findDevices( DEVICE_INFO,
      function(devices) {
        if (!devices || !devices.length) {
          console.log('device not found');
          return;
        }
        console.log('Found device: ' + devices[0].handle);
        parasiteDevice = devices[0];
        chrome.usb.interruptTransfer(parasiteDevice, transfer, onEvent);
    });
  };


requestButton.addEventListener('click', function() {
  chrome.permissions.request( permissionObj, function(result) {
    if (result) {
      gotPermission();
    } else {
      console.log('App was not granted the "usbDevices" permission.');
      console.log(chrome.runtime.lastError);
    }
  });
});




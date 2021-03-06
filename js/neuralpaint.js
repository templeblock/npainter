"use strict";

// settings of nnet:
var networkSize = 16; // 16 neurons in each layer
var nHidden = 8;
var nOut = 3; // r, g, b layers

var G;
var modl;
var width, height;
var imageData;

var nonlinfn; //Non linearity function
var strokestrength; //stroke strength
/*stroke strength value vaires from 1 to 10 (1e-1 to 1 e-10)
*/
var initModel = function () {

  importScripts("recurrent.js");

  G = new R.Graph(false, strokestrength);
  var model = [];
  var i;

  var randomSize = 1.0;
  // define the model below:
  model.w_in = R.RandMat(networkSize, 3, 0, randomSize); // x, y, and bias

  for (i = 0; i < nHidden; i++) {
    model['w_' + i] = R.RandMat(networkSize, networkSize, 0, randomSize);
  }

  model.w_out = R.RandMat(nOut, networkSize, 0, randomSize); // output layer
  console.log(model);
  return model;
};

var forwardNetwork = function (G, model, x_, y_) {
  // x_, y_ is a normal javascript float, will be converted to a mat object below
  // G is a graph to amend ops to
  var x = new R.Mat(3, 1); // input
  var i;
  x.set(0, 0, x_);
  x.set(1, 0, y_);
  x.set(2, 0, 1); // bias.
  var out;

  //Forward based on non linearity function
  switch (nonlinfn) {
    case "tanh":
      out = G.tanh(G.mul(model.w_in, x));

      for (i = 0; i < nHidden; i++) {
        out = G.tanh(G.mul(model['w_' + i], out));
      }
      break;
    case "tanhabs":
      out = G.tanh_abs(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.tanh_abs(G.mul(model['w_' + i], out));
      }
      break;
    case "logfn":
      out = G.logfn(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.logfn(G.mul(model['w_' + i], out));
      }
      break;
    case "logfnex":
      out = G.logfnex(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.logfnex(G.mul(model['w_' + i], out));
      }
      break;
    case "squar":
      out = G.squar(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.squar(G.mul(model['w_' + i], out));
      }
      break;
    case "inv":
      out = G.inv(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.inv(G.mul(model['w_' + i], out));
      }
      break;
    case "xlogxsq":
      out = G.xlogxsq(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.xlogxsq(G.mul(model['w_' + i], out));
      }
      break;
    case "invxlogx":
      out = G.invxlogx(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.invxlogx(G.mul(model['w_' + i], out));
      }
      break;
    case "logx1":
      out = G.logx1(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.logx1(G.mul(model['w_' + i], out));
      }
      break;
    case "logxp1":
      out = G.logxp1(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.logxp1(G.mul(model['w_' + i], out));
      }
      break;
    case "tanhlog":
      out = G.tanhlog(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.tanhlog(G.mul(model['w_' + i], out));
      }
      break;
    case "invlogxp1":
      out = G.invlogxp1(G.mul(model.w_in, x));
      for (i = 0; i < nHidden; i++) {
        out = G.invlogxp1(G.mul(model['w_' + i], out));
      }
      break;
    default:
      console.log(nonlinfn + " This non linearity function not implemented yet.");
  }
  out = G.sigmoid(G.mul(model.w_out, out));
  return out;
};
function getColorAt(model, x, y) {
  // function that returns a color given coordintes (x, y)
  // (x, y) are scaled to -0.5 -> 0.5 for image recognition later
  // but it can be behond the +/- 0.5 for generation above and beyond
  // recognition limits
  var r, g, b;
  var out = forwardNetwork(G, model, x, y);

  r = out.w[0] * 255.0;
  g = out.w[1] * 255.0;
  b = out.w[2] * 255.0;
  if (r > 255 || g > 255 || b > 255) {
    console.log("out of range");
  }

  return [r, g, b];
}

function setPixel(imgData, x, y, r, g, b, a) {
  
  var index = (x + y * imageData.width) * 4;
  imgData.data[index + 0] = r;
  imgData.data[index + 1] = g;
  imgData.data[index + 2] = b;
  imgData.data[index + 3] = a;

}
function neuralPaint(height, width, nnlinfn) {
 
  nonlinfn = nnlinfn;
  modl = initModel();
  //console.log(width);
 // console.log(height);
  var t0 = Date.now();

  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      //scale x and y in range  -0.5 to 0.5 
      var rgb = getColorAt(modl, x / width - 0.5, y / height - 0.5);
      setPixel(imageData, x, y, rgb[0], rgb[1], rgb[2], 255);

    }
    var prog=Math.round((y/height)*100);
    postMessage({ status: "image", imagedata: imageData,progress: prog});
  }
  var t1 = Date.now();
  var elTime = (t1 - t0) / 1000;
  postMessage({ status: "finished", etime: elTime });
}

onmessage = function (event) {

  switch (event.data.op) {
    case "start":
      //get the data from app.js
      imageData = event.data.imgdata;
      networkSize = event.data.netsz;
      nonlinfn = event.data.nlfun;
      nHidden = event.data.hidsz;
      strokestrength = event.data.strokestrength;
      //Start neural painting
      neuralPaint(event.data.h, event.data.w, nonlinfn);
      break;0
    case "stop":
      break;
  }

}

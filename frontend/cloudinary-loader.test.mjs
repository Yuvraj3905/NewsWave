import assert from 'node:assert/strict';
import loader from './cloudinary-loader.js';

const cl = 'https://res.cloudinary.com/dfqrnqcvl/image/upload/fl_relative,g_center,l_newswave:logo,o_40,w_0.3,x_0,y_0/v1788769436/newswave/Screenshot%202026-09-07%20121017?_a=BAMAPqWQ0';

assert.equal(
  loader({ src: cl, width: 256, quality: 75 }),
  'https://res.cloudinary.com/dfqrnqcvl/image/upload/w_256,q_75,f_auto/fl_relative,g_center,l_newswave:logo,o_40,w_0.3,x_0,y_0/v1788769436/newswave/Screenshot%202026-09-07%20121017?_a=BAMAPqWQ0'
);
// default quality
assert.match(loader({ src: cl, width: 640 }), /\/upload\/w_640,q_75,f_auto\//);
// non-Cloudinary passes through untouched
const u = 'https://images.unsplash.com/photo-1?ixlib=rb-4.0';
assert.equal(loader({ src: u, width: 256, quality: 75 }), u);
assert.equal(loader({ src: '/logo.png', width: 64 }), '/logo.png');
console.log('ok');

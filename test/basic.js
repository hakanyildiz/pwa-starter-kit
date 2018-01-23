/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

const puppeteer = require('puppeteer');
const expect = require('chai').expect;
var fs = require('fs');

const appUrl = 'http://127.0.0.1:4444';

// it('the app looks right with the eyeballs', function() {
//   (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//
//     const dir = `${process.cwd()}/test/screenshots`;
//     if (!fs.existsSync(dir)){
//         fs.mkdirSync(dir);
//     }
//
//     // See that each route loads correctly.
//     await page.goto(`${appUrl}`);
//     await page.screenshot({path: `${dir}/index.png`});
//
//     for (let i = 1; i <= 3; i++) {
//       await page.goto(`${appUrl}/view${i}`);
//       await page.screenshot({path: `${dir}/view${i}.png`});
//     }
//
//     await browser.close();
//   })();
// });

// Shadow DOM helpers.
const getShadowRootChildProp = (el, childSelector, prop) => {
  return el.shadowRoot.querySelector(childSelector)[prop];
};
const doShadowRootClick = (el, childSelector) => {
  return el.shadowRoot.querySelector(childSelector).click();
};

async function testNavigation(page, href, linkText) {
  const selector = `a[name="${href}"]`;
  const shadowSelector = `a[name="${href}"]`;

  // Does the link say the right thing?
  const myApp = await page.$('my-app');
  const myText = await page.evaluate(getShadowRootChildProp, myApp, selector, 'textContent');
  expect(await myText).equal(linkText);

  // Does the click take you to the right page?
  await page.evaluate(doShadowRootClick, myApp, selector);
  const newUrl = await page.evaluate('window.location.href')
  expect(newUrl).equal(`${appUrl}/${href}`);
}

it('the page selector switches pages', function(done) {
  (async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.goto(`${appUrl}`);
    await page.waitForSelector('my-app', {visible: true});

    await testNavigation(page, 'view2', 'View Two');
    await testNavigation(page, 'view3', 'View Three');
    await testNavigation(page, 'view1', 'View One');

    done();
    await browser.close();
  })();
});

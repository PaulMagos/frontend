/**
 * Copyright 2020 Google LLC.
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Config} from './configs';

const markColor = '#3366CC';
const gridColor = '#ccc';
const defaultFont = 'IBM Plex Sans,system-ui,-apple-system,BlinkMacSystemFont,".sfnstext-regular",sans-serif';
const viewbg = '#fffafa';

const paletteColor1 = '#118DFF';
const paletteColor2 = '#12239E';
const paletteColor3 = '#E66C37';
const paletteColor4 = '#6B007B';
const paletteColor5 = '#E044A7';
const paletteColor6 = '#744EC2';
const paletteColor7 = '#D9B300';
const paletteColor8 = '#D64550';
const divergentColorMax = paletteColor1;
const divergentColorMin = '#DEEFFF';
const divergentPalette = [divergentColorMin, divergentColorMax];
const ordinalPalette = [
  divergentColorMin,
  '#c7e4ff',
  '#b0d9ff',
  '#9aceff',
  '#83c3ff',
  '#6cb9ff',
  '#55aeff',
  '#3fa3ff',
  '#2898ff',
  divergentColorMax,
];

const googlechartsTheme: Config = {
  arc: {fill: markColor},
  area: {fill: markColor},
  path: {stroke: markColor},
  rect: {fill: markColor},
  shape: {stroke: markColor},
  symbol: {stroke: markColor},
  circle: {fill: markColor},
  background: '#fff',
  view: {
    fill: viewbg,
    stroke: viewbg,
  },
  padding: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  },
  style: {
    'guide-label': {
      font: defaultFont,
      fontSize: 14,
    },
    'guide-title': {
      font: defaultFont,
      fontSize: 14,
    },
    'group-title': {
      font: defaultFont,
      fontSize: 14,
    },
  },
  axisBand: {
    grid: false,
    tickExtra: true,
  },
  title: {
    font: defaultFont,
    fontSize: 14,
    fontWeight: 'bold',
    dy: -3,
    anchor: 'start',
  },
  axis: {
    gridColor: gridColor,
    tickColor: gridColor,
    domain: true,
    grid: true,
  },
  range: {
    category: [
      paletteColor1,
      paletteColor2,
      paletteColor3,
      paletteColor4,
      paletteColor5,
      paletteColor6,
      paletteColor7,
      paletteColor8,
    ],
    diverging: divergentPalette,
    heatmap: divergentPalette,
    ordinal: ordinalPalette,
  },
};

export default googlechartsTheme;

import React, { useEffect, useId, useMemo, useRef } from 'react';
import './PatrickAvatar.css';

// Patrick dessiné en vectoriel (trait feutre + aplats crayon), en pièces pilotables par props.
// Le dessin source vient du prototype public/__proto/patrick-avatar.html ; la barbe est un tracé figé.
// Identifiants SVG suffixés par instance (__UID__) pour pouvoir afficher plusieurs Patrick sur une page.
const TEMPLATE = `<defs>
<filter id="__UID__-felt" x="-10%" y="-10%" width="120%" height="120%">
<feTurbulence id="__UID__-felt-noise" type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="__UID__-crayon" x="-5%" y="-5%" width="110%" height="110%">
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" result="grain"/>
<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.35" result="mask"/>
<feComposite in="SourceGraphic" in2="mask" operator="in" result="tex"/>
<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" seed="4" result="wob"/>
<feDisplacementMap in="tex" in2="wob" scale="4" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<pattern id="__UID__-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
<line x1="0" y1="0" x2="0" y2="4" stroke="#fff" stroke-width="1.2" opacity="0.28"/>
</pattern>
<path id="__UID__-p-hoodie" d="M28 250 C32 214 56 196 84 189 C96 186 103 185 106 189 L134 189 C137 185 144 186 156 189 C184 196 208 214 212 250 Z"/>
<path id="__UID__-p-hood" d="M84 189 C91 176 104 179 106 190 C112 201 128 201 134 190 C136 179 149 176 156 189 C151 202 140 208 120 208 C100 208 89 202 84 189 Z"/>
<path id="__UID__-p-face" d="M90 92 C89 120 92 146 102 161 C108 169 114 173 120 173 C126 173 132 169 138 161 C148 146 151 120 150 92 Z"/>
<path id="__UID__-p-dome" d="M88 80 C85 44 155 44 152 80 Z"/>
<path id="__UID__-p-cuff" d="M85 79 C100 72 140 72 155 79 L156 97 C140 92 100 92 84 97 Z"/>
<path id="__UID__-p-beard" d="M91 122 C92 146 102 164 120 169 C138 164 148 146 149 122 C143 136 133 141 126 139.5 C122 138.5 118 138.5 114 139.5 C107 141 97 136 91 122 Z"/>
<path id="__UID__-p-stache" d="M107 138 C113 133 127 133 133 138 C127 142 113 142 107 138 Z"/>
<clipPath id="__UID__-clip-dome"><use href="#__UID__-p-dome"/></clipPath>
</defs>
<g class="patrick">
<g class="paint" filter="url(#__UID__-crayon)" transform="translate(1.4 1)">
<use href="#__UID__-p-hoodie" fill="var(--pa-hoodie)"/>
<use href="#__UID__-p-hood" fill="var(--pa-hoodie)" style="filter:brightness(0.92)"/>
<g transform="translate(120 183) scale(1.22) translate(-120 -175)"><g class="head-paint head">
<use href="#__UID__-p-beard" fill="#000" opacity="0.07"/>
<g class="bonnet">
<use href="#__UID__-p-dome" fill="var(--pa-dome)"/>
<g clip-path="url(#__UID__-clip-dome)" fill="none" stroke="var(--pa-band)" stroke-linecap="round" opacity="0.85">
<path d="M86 70 C100 66 112 72 126 67 S146 64 156 68" stroke-width="5"/>
<path d="M92 58 C104 55 118 60 132 56" stroke-width="4"/>
<path d="M110 76 C122 73 136 77 150 74" stroke-width="3.5"/>
<path d="M118 50 C126 48 134 50 140 49" stroke-width="3"/>
</g>
<use href="#__UID__-p-cuff" fill="var(--pa-band)"/>
</g>
<path data-expr="content victoire" d="M112 147 Q120 151 128 147 L127 150 Q120 153 113 150 Z" fill="#fff"/>
<path data-expr="focus" d="M152 84 q-4 6 0 8 q4 -2 0 -8 Z M88 82 q-4 6 0 8 q4 -2 0 -8 Z" fill="#9fd3f5"/>
</g></g>
</g>
<g class="paint-hatch" transform="translate(1.4 1)">
<use href="#__UID__-p-hoodie" fill="url(#__UID__-hatch)"/>
</g>
<g class="ink" filter="url(#__UID__-felt)">
<use href="#__UID__-p-hoodie" class="line"/>
<use href="#__UID__-p-hood" class="line"/>
<path class="line" d="M110 201 C109 211 110 219 108 227 M130 201 C131 211 130 219 132 227"/>
<circle class="line" cx="108" cy="229" r="1.8"/><circle class="line" cx="132" cy="229" r="1.8"/>
<path class="line thin" d="M60 214 C64 226 66 236 66 250 M180 214 C176 226 174 236 174 250"/>
<text  x="120" y="244" text-anchor="middle" font-family="Patrick Hand, cursive" font-size="15" fill="#2b2b2b" letter-spacing="1">__TEXT__</text>
<path class="line" d="M105 171 L104.5 189 M135 171 L135.5 189"/>
<g transform="translate(120 183) scale(1.22) translate(-120 -175)"><g class="head">
<path class="line" d="M90 110 C81 105 79 125 90 129 M86 115 C84 118 85 122 88 123"/>
<path class="line" d="M150 110 C159 105 161 125 150 129 M154 115 C156 118 155 122 152 123"/>
<use href="#__UID__-p-face" class="line" fill="#fdfaf4"/>
<g class="stubble"><path d="M126.5 145.1l-1.0 2.5M99.2 149.5l1.2 2.4M143.4 146.4l-0.2 3.0M100.6 148.0l0.2 2.6M119.2 165.3l0.4 2.3M123.6 153.4l0.5 2.6M101.4 137.0l0.0 3.0M131.6 158.8l-0.9 1.5M148.3 127.7l0.0 1.6M111.1 147.0l0.0 3.1M121.3 166.0l1.0 3.1M115.8 152.4l0.5 2.5M108.7 160.8l0.7 2.2M115.6 150.5l0.4 1.7M133.4 159.2l0.2 2.3M143.3 140.7l0.5 2.8M146.1 131.7l-1.0 2.2M133.2 159.7l0.1 2.1M113.3 144.3l0.4 2.7M145.3 138.3l-0.8 2.5M123.0 153.0l0.4 2.1M118.8 141.3l-0.5 3.1M139.9 144.6l0.2 3.0M121.6 167.1l-0.9 2.2M112.9 150.6l-0.8 2.3M92.4 129.5l0.9 2.6M126.4 139.7l-0.1 3.0M131.6 139.6l-1.3 2.3M97.7 140.5l1.1 1.3M129.5 160.7l-1.5 2.6M117.8 159.6l0.7 1.9M106.6 144.7l0.3 2.8M121.1 144.8l0.0 2.4M122.0 150.7l-0.4 2.3M115.5 148.1l1.2 2.7M123.1 165.1l-0.1 1.9M131.0 157.4l-0.6 3.1M141.3 150.1l0.0 3.1M121.2 168.2l-1.1 2.5M124.4 165.4l0.3 2.4M136.0 150.8l-0.9 2.4M107.8 155.4l-0.0 3.0M122.1 166.9l-0.4 3.0M128.4 163.2l-0.9 2.6M131.2 143.6l-0.2 2.6M133.9 149.0l0.5 1.8M105.3 159.2l1.1 2.8M144.8 139.3l0.2 2.6M103.3 146.9l0.8 1.9M134.1 149.1l-0.4 2.5M141.8 139.1l-0.6 1.5M138.3 148.3l0.2 1.7M137.4 144.2l-1.5 2.5M123.3 157.8l0.6 2.8M130.2 153.8l-0.3 1.9M108.9 159.9l-0.2 2.0M143.2 145.5l0.0 2.7M101.5 146.4l0.6 2.6M119.0 157.8l1.0 3.0M141.1 139.4l0.0 2.5M136.8 145.0l-0.4 2.0M143.1 140.4l-0.4 2.0M123.1 147.0l-0.1 2.4M116.8 152.3l1.3 2.5M99.7 140.7l0.1 3.1M105.9 154.6l-0.5 2.3M119.7 144.8l0.1 2.8M141.3 146.8l0.6 3.0M119.2 158.2l-0.1 2.6M98.0 141.0l0.1 1.7M96.8 133.4l0.4 2.2M114.2 164.4l-0.2 1.6M104.3 153.2l-0.4 2.3M117.7 149.6l-0.8 1.7M129.2 164.5l-0.1 2.6M141.4 141.9l-0.6 1.8M131.5 159.7l-0.5 2.5M91.9 125.4l-0.1 1.6M114.0 166.3l0.4 1.9M135.5 156.5l0.6 2.6M125.1 143.2l-0.3 2.3M115.6 153.4l0.5 2.6M132.4 139.2l-1.2 2.1M146.7 133.1l-0.0 2.1M129.7 153.8l-1.1 1.7M120.8 141.8l0.5 2.0M108.2 148.6l0.6 2.3M99.3 151.9l-0.3 2.7M116.4 155.3l0.2 2.6M130.3 155.0l-0.1 1.9M105.8 154.8l0.7 2.1M127.4 146.2l-0.6 1.6M100.8 139.4l-0.3 3.0M127.2 162.1l-1.1 2.0M122.2 149.3l-0.4 3.2M121.7 157.8l-0.1 3.1M112.8 159.4l0.1 2.3M108.8 140.8l0.7 2.6M103.3 153.0l0.5 2.4M134.6 152.0l-0.3 3.2M102.2 144.0l1.1 1.5M109.7 162.9l0.2 2.3M134.5 144.6l-0.1 2.8M106.7 152.7l0.7 1.7M142.0 141.2l0.3 3.1M116.9 143.4l1.0 2.0M118.8 142.4l1.4 2.9M96.0 130.6l0.3 2.9M144.8 133.8l-1.1 2.2M131.0 155.4l0.6 2.6M102.5 149.4l0.6 1.7M122.8 153.6l-0.5 2.5M131.8 154.9l-0.2 2.9M102.4 143.8l1.7 2.6M126.8 154.1l-0.3 2.3M113.9 139.7l0.4 2.8M129.6 156.3l-1.3 2.7M119.1 163.6l0.8 2.2M129.8 142.4l0.5 3.2M143.4 135.2l-0.8 2.8M110.0 160.5l0.8 3.1M135.4 145.8l-0.0 2.1M134.9 150.8l-0.3 2.1M129.1 153.1l0.2 2.9M130.6 147.0l-0.0 2.6M114.3 143.0l0.7 2.6M129.2 164.3l-0.5 3.2M126.1 148.5l0.1 3.0M99.1 141.5l-0.4 2.4M140.8 140.4l-0.1 1.7M104.2 154.5l0.1 2.1M128.1 155.1l-0.3 3.1M141.4 133.6l0.3 3.0M113.1 151.7l-0.6 2.2M111.5 149.9l1.0 1.8M124.3 149.8l0.4 1.7M144.2 136.0l-0.3 3.2M112.7 162.2l0.9 2.4M117.5 153.2l0.4 2.4M118.4 147.4l-0.2 2.0M122.0 162.3l0.3 1.6M138.7 146.7l0.0 2.6M123.9 149.5l-1.1 3.0M139.6 145.9l0.2 2.1M127.9 160.9l-1.0 3.0M119.6 168.1l-1.0 2.6M142.7 140.3l0.0 1.7M120.4 154.8l0.6 3.1M107.2 148.9l0.1 3.2M112.0 151.2l1.1 1.9M102.4 138.6l1.2 2.2M132.5 160.3l0.2 2.0M124.0 166.0l0.3 3.1M127.4 141.6l0.6 2.6M143.9 131.2l0.2 1.7M113.4 147.8l0.6 2.4M132.1 146.5l-0.4 3.2M118.8 142.6l0.4 2.4M119.7 161.6l0.5 1.6M114.7 155.5l1.0 3.0M140.8 148.9l-0.7 2.0M130.0 152.0l0.2 2.4M102.5 140.8l0.4 1.8M119.7 138.9l0.5 2.1M115.6 166.2l-0.2 2.4M123.9 142.8l-0.7 2.4M119.6 166.2l-0.2 2.2M119.0 150.7l0.5 2.5M143.9 137.6l-0.7 3.2M146.8 133.1l0.1 1.7M118.9 164.5l-0.6 2.9M123.4 153.7l-1.1 2.4M92.9 136.1l0.8 2.2M118.2 141.1l1.2 3.0M134.6 160.1l-0.1 2.0M113.9 162.3l0.8 1.7M117.6 143.6l0.2 1.8M148.1 130.0l-1.4 1.7M113.5 142.3l0.5 2.4M139.2 148.8l0.5 2.8M118.0 156.6l-0.6 3.0M115.6 148.7l-1.0 2.7M134.2 151.4l0.4 1.8M117.8 145.3l0.5 2.0M115.4 150.1l-0.3 3.1M114.0 161.7l0.1 2.3M107.6 152.0l-0.1 1.9M111.8 161.9l0.8 2.0M132.6 145.7l-0.0 1.8M127.8 153.7l-0.8 2.7M118.6 158.8l1.1 2.8M126.7 163.2l-0.4 2.5M130.5 141.9l0.0 1.9M135.0 154.4l-0.5 2.7M111.1 155.7l0.7 1.6M97.1 139.6l-0.0 1.8M104.2 151.0l0.5 3.2M130.9 158.5l-0.1 2.6M123.3 157.4l-0.1 2.9M131.6 160.2l-0.6 2.2M131.5 160.7l-0.5 1.8M145.6 135.1l-0.7 2.0M105.8 149.9l0.9 1.6M135.8 144.9l-0.0 1.7M126.5 157.2l-0.5 1.8M127.3 165.2l0.7 2.8M111.4 153.6l0.5 1.7M118.9 143.0l-0.4 2.3M138.8 150.3l-1.5 2.2M116.1 150.6l0.2 2.1M120.7 139.1l-0.7 1.9M131.2 154.6l-1.1 2.0M101.4 140.5l1.1 2.6M139.0 147.5l-1.1 1.7M129.8 158.7l-0.2 2.2M95.3 142.0l0.2 1.7M136.2 157.5l-0.3 2.4M95.4 142.3l1.4 2.8M91.8 129.6l1.8 2.6M142.7 134.0l0.2 1.6M130.9 158.1l-0.4 2.6M123.5 151.1l0.6 1.9M95.9 137.7l1.1 1.7M113.4 157.3l-0.2 2.4M100.5 147.4l0.9 2.2M130.7 148.5l0.2 2.7M112.8 145.1l0.7 1.6M100.3 144.7l1.8 2.7M96.4 134.2l0.2 2.7M111.0 147.7l1.2 2.7M96.1 136.4l1.2 2.3M102.4 138.7l1.3 2.8M116.2 166.7l-0.3 2.6M127.1 158.7l-1.5 2.7M145.9 132.6l-1.5 1.6M132.1 145.1l0.4 3.0M118.8 151.3l0.1 1.9M98.0 145.5l1.5 2.1M96.8 133.2l1.2 1.7M101.8 154.8l1.1 2.3M113.8 161.9l-0.6 1.6M117.5 147.0l-1.2 3.0M136.5 151.2l0.2 3.0M139.3 142.2l-1.0 2.3M122.4 161.1l0.7 1.6M145.3 141.5l-0.2 2.9M128.4 146.5l0.2 1.8M140.0 149.5l-1.3 3.0M136.8 151.1l-0.1 3.1M137.9 149.0l-0.9 2.5M98.9 146.3l0.7 1.6M120.7 138.9l-0.3 2.5M128.6 146.7l-0.0 1.7M119.0 160.1l-0.1 3.2M141.9 150.7l-1.6 2.3M104.3 156.6l0.4 2.7M117.8 167.9l0.1 1.9M128.6 158.2l-0.8 3.0M127.1 140.7l-0.1 1.9M143.1 141.4l-1.0 1.4M145.0 132.9l0.3 2.4M126.3 150.0l-1.1 3.0M108.4 150.1l1.6 2.7M138.7 153.7l-1.5 2.1M97.7 140.1l1.1 1.9M119.7 156.1l0.6 2.0M97.5 137.5l-0.1 2.4M110.7 154.2l0.1 3.2M124.3 165.8l-0.0 2.5M138.7 136.2l-1.0 1.8M127.1 140.4l-0.9 3.0M132.3 157.3l0.3 2.7M94.3 137.0l0.4 2.7M112.9 159.1l-0.3 1.7M110.4 152.3l1.4 2.3M123.8 165.2l0.1 1.8M140.8 140.6l-0.5 2.0M126.1 142.2l1.0 2.7M134.8 156.6l-0.7 2.0M104.2 138.3l1.4 2.6M114.7 164.3l1.3 2.9M135.8 153.3l-0.1 2.6M133.8 152.0l-1.0 2.0M95.8 142.5l1.4 2.5M120.2 162.0l-0.3 1.8M109.4 156.2l1.0 2.2M123.2 160.2l0.3 1.6M130.5 143.7l-0.1 2.1M114.7 152.6l0.9 2.3M99.9 141.8l0.0 1.9M100.2 146.8l0.9 1.8M125.5 143.6l-0.9 2.4M133.4 160.2l0.3 2.7M145.0 142.7l-1.2 1.7M111.8 146.1l0.2 2.5M110.9 160.0l1.0 2.0M113.8 156.9l1.2 2.4M110.9 151.7l1.1 2.2M115.9 165.7l1.0 2.0M102.7 137.1l1.5 2.2M116.7 149.4l1.0 2.8M96.7 135.9l0.6 2.4M117.2 166.6l-0.1 3.2M106.7 151.7l0.1 1.9M109.1 140.6l-0.1 1.7M146.2 135.5l-0.4 1.7M123.3 162.5l0.2 3.1M107.1 150.9l-0.6 2.7M143.3 139.9l-0.3 1.7M131.0 156.8l0.1 2.6M131.5 162.0l0.9 2.8M103.7 158.4l0.8 2.4M114.4 142.3l0.1 2.1M122.1 163.1l0.6 1.7M137.2 143.1l-0.3 3.2M95.0 137.8l0.1 1.9M122.9 149.0l0.8 2.6M147.5 133.9l-2.0 2.0M129.7 156.1l-1.1 2.2M110.2 156.4l1.2 2.2M96.2 138.4l0.2 2.2M127.3 157.1l-0.6 1.8M127.1 166.1l-1.5 2.8M131.0 148.9l-0.8 2.3M94.4 128.6l0.6 3.2M101.9 138.4l0.6 2.7M122.8 161.1l0.0 2.7M136.7 150.9l-0.2 2.7M144.1 136.7l-1.5 2.8M117.1 149.6l-0.7 3.1M131.3 148.4l-0.1 3.0M135.5 153.8l-0.4 1.6M144.8 132.1l-0.2 3.0M110.8 158.3l1.1 3.0M101.1 147.8l0.4 2.9M127.8 143.8l-0.4 2.1M95.5 131.2l1.0 2.2M104.0 144.7l0.3 2.5M143.5 138.5l0.2 2.1M117.4 146.3l-0.7 2.5M147.5 127.5l0.0 1.7M121.0 161.8l0.3 3.2M107.4 140.6l1.3 2.1M120.5 167.4l-0.2 2.1M131.0 148.1l0.3 2.9M135.5 147.4l-1.2 2.6M124.2 164.7l-0.4 2.3M140.0 153.4l-0.8 2.1M134.5 139.0l-0.2 2.2M100.1 144.1l0.6 1.7M121.6 146.6l-0.3 1.6M137.4 139.6l-1.4 2.4M104.1 153.0l0.7 2.0M117.9 147.3l-0.9 3.0M128.2 149.4l-0.6 2.3M146.4 134.0l-1.3 1.4M130.2 146.0l-0.3 2.3M117.8 142.4l0.5 1.7M101.1 152.4l-0.4 2.1M105.6 159.5l-0.7 2.6M112.5 142.1l0.4 1.8M127.2 152.9l-0.4 2.2M129.3 149.5l-1.1 2.0M146.9 127.5l-0.2 2.3M138.2 147.0l-0.5 2.1M113.9 139.6l0.7 2.8M137.0 147.4l-0.6 2.5M141.9 143.7l-0.6 2.8M114.0 143.6l0.1 2.5M113.5 142.9l0.8 2.8M95.1 137.0l1.1 1.6M108.6 142.5l1.4 2.5M113.6 165.9l0.9 1.7M129.2 147.8l-0.5 2.1M143.4 144.8l-1.3 1.5M129.9 163.7l-0.5 3.0M124.6 140.9l-0.0 2.7M111.2 141.4l0.7 2.8M103.9 143.5l0.5 2.4M101.3 137.0l0.9 1.5M126.7 138.3l0.1 2.1M118.7 135.7l-0.2 2.0M131.1 136.8l-0.0 1.7M123.1 140.1l-1.0 2.2M119.0 139.8l0.4 2.6M112.9 139.8l1.1 2.0M124.0 137.5l0.5 1.6M124.2 137.9l-0.7 2.7M126.6 135.6l0.4 1.6M122.0 137.8l0.1 1.5M114.6 135.0l-0.5 1.8M116.7 140.4l-0.6 1.8M125.4 136.1l-0.5 1.9M122.3 134.5l-0.8 2.4M117.9 134.9l1.1 2.3M127.5 138.7l-0.8 2.3M120.5 139.6l0.2 2.7M108.7 138.8l-0.3 1.5M120.4 135.7l0.4 1.4M122.3 138.5l0.3 2.4M111.6 136.6l0.1 2.2M121.4 134.8l0.7 1.6M128.0 139.0l-0.9 2.3M124.8 137.6l0.4 2.0M127.4 137.1l-0.6 2.2M125.2 138.2l-0.5 2.2M122.5 139.9l0.7 2.8M111.7 139.8l0.3 1.4M122.5 136.8l-0.5 1.7M113.8 136.2l-0.3 2.0M116.4 138.1l-0.4 1.7M117.0 138.1l-0.4 2.1M127.5 139.1l-1.1 2.3M125.5 135.7l-0.4 2.5M126.8 139.4l0.0 1.6M108.3 138.7l0.8 2.3M115.1 136.6l0.3 1.9M123.0 137.3l-0.9 2.2M130.8 137.3l-0.6 2.6M115.3 140.2l0.7 2.0M112.4 138.1l0.4 2.3M120.6 140.7l-0.3 1.9M116.2 137.4l-0.7 2.4M122.6 135.2l0.7 2.4M131.6 137.8l-1.0 1.9M116.9 134.6l0.8 1.8M117.9 138.5l0.7 2.5M117.3 137.9l-0.1 1.8M130.4 138.9l0.4 1.4M124.5 138.8l0.4 2.4M129.0 135.8l0.5 2.1M125.7 138.8l-0.5 1.7M128.5 137.1l0.2 2.8M129.4 137.1l-0.4 2.3M122.3 138.0l-0.3 1.8"/></g>
<g data-expr="content">
<path class="line" d="M107.5 145 Q120 164 132.5 145 Q120 149 107.5 145 Z" fill="#2a1916"/>
<path d="M110 146 Q120 150 130 146 L129 149.5 Q120 153.5 111 149.5 Z" fill="#fff"/>
<ellipse cx="120" cy="157" rx="5.5" ry="2.6" fill="#d0604f"/>
</g>
<path data-expr="focus" class="line" d="M112 151 Q120 147 128 151"/>
<ellipse data-expr="surpris" class="line" cx="120" cy="152" rx="5" ry="6.5" fill="#2a1916"/>
<g data-expr="victoire">
<path class="line" d="M107 145 Q120 167 133 145 Q120 149 107 145 Z" fill="#2a1916"/>
<path d="M109.5 146 Q120 150 130.5 146 L129.5 149 Q120 153 110.5 149 Z" fill="#fff"/>
<ellipse cx="120" cy="157" rx="6" ry="3" fill="#d0604f"/>
</g>
<path class="line" d="M122 104 L116 127 Q118 131.5 126 129.5"/>
<g class="eyes" data-expr="content focus surpris">
<circle cx="106" cy="112" r="2.5" fill="var(--pa-ink)"/>
<circle cx="134" cy="112" r="2.5" fill="var(--pa-ink)"/>
</g>
<g data-expr="victoire"><path class="line" d="M101 113 Q106 108 111 113 M129 113 Q134 108 139 113"/></g>
<g class="lunettes-vue">
<g class="frame-rect"><rect class="line" x="94" y="103.5" width="23" height="16.5" rx="3.5"/><rect class="line" x="123" y="103.5" width="23" height="16.5" rx="3.5"/></g>
<g class="frame-round"><circle class="line" cx="105.5" cy="112" r="10.5"/><circle class="line" cx="134.5" cy="112" r="10.5"/></g>
<path class="line" d="M117 110 Q120 107.5 123 110 M94 108 L89 111 M146 108 L151 111"/>
</g>
<g class="lunettes-soleil">
<path class="line" d="M92 103 H118 V111 Q118 122 105 122 Q92 122 92 111 Z" fill="#1d1d1d"/>
<path class="line" d="M122 103 H148 V111 Q148 122 135 122 Q122 122 122 111 Z" fill="#1d1d1d"/>
<path class="line" d="M118 106 H122 M92 106 L88 108 M148 106 L152 108"/>
<path d="M97 107 L103 107" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
</g>
<g class="brow" data-expr="content"><path d="M96 99 Q105 95.5 114 97.5 M126 97.5 Q135 95.5 144 99"/></g>
<g class="brow" data-expr="focus"><path d="M97 95 Q106 97 115 101.5 M125 101.5 Q134 97 143 95"/></g>
<g class="brow" data-expr="surpris"><path d="M96 95 Q105 89 114 93 M126 93 Q135 89 144 95"/></g>
<g class="brow" data-expr="victoire"><path d="M96 98 Q105 93 114 96 M126 96 Q135 93 144 98"/></g>
<g data-expr="focus"><path class="line" d="M163 86 q-5 7 0 9 q5 -2 0 -9 Z M76 84 q-5 7 0 9 q5 -2 0 -9 Z M168 104 q-4 5 0 7 q4 -2 0 -7 Z"/></g>
<g class="bonnet">
<use href="#__UID__-p-dome" class="line"/>
<use href="#__UID__-p-cuff" class="line"/>
<path class="line thin" d="M90 77 V95 M95 76 V94 M100 75 V93 M105 74.5 V92.5 M110 74 V92 M115 74 V92 M120 74 V92 M125 74 V92 M130 74 V92 M135 74.5 V92.5 M140 75 V93 M145 76 V94 M150 77 V95"/>
</g>
<g class="casque">
<path class="line" d="M86 120 C76 34 164 34 154 120"/>
<path class="line thin" d="M82 118 C70 26 170 26 158 118"/>
<ellipse class="line" cx="83" cy="121" rx="11" ry="16.5" fill="#1d1d1d"/>
<ellipse class="line" cx="157" cy="121" rx="11" ry="16.5" fill="#1d1d1d"/>
<path d="M78 112 Q76 120 78 128 M152 112 Q150 120 152 128" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.6"/>
</g>
</g></g>
</g>
</g>`;

const escapeText = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * @param expression 'content' | 'focus' | 'surpris' | 'victoire'
 * @param bpm        si fourni, Patrick hoche la tête au tempo
 * @param boil       trait "vivant" (le contour tremble comme un dessin animé fait main)
 */
const PatrickAvatar = ({
  expression = 'content',
  casque = true,
  bonnet = true,
  shades = false,
  frame = 'rect',
  hoodieText = 'COACH',
  hoodieColor,
  bpm,
  boil = false,
  size = 240,
  viewBox = '0 0 240 250', // ex. '46 10 148 190' pour cadrer sur la tête
  label = 'Patrick',
  className = '',
  style = {},
}) => {
  const uid = useId().replace(/:/g, '');
  const ref = useRef(null);
  const html = useMemo(
    () => TEMPLATE.replaceAll('__UID__', uid).replace('__TEXT__', escapeText(hoodieText.toUpperCase())),
    [uid, hoodieText],
  );

  useEffect(() => {
    if (!boil || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const noise = ref.current?.querySelector(`#${uid}-felt-noise`);
    if (!noise) return undefined;
    let seed = 3;
    const id = setInterval(() => { seed = (seed % 5) + 1; noise.setAttribute('seed', seed); }, 140);
    return () => clearInterval(id);
  }, [boil, uid]);

  return (
    <svg
      ref={ref}
      className={`pa-root ${className}`}
      viewBox={viewBox}
      width={size}
      height={typeof size === 'number' ? (size * Number(viewBox.split(' ')[3])) / Number(viewBox.split(' ')[2]) : undefined}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      data-expr={expression}
      data-frame={frame}
      data-casque={casque ? '' : undefined}
      data-bonnet={bonnet ? '' : undefined}
      data-shades={shades ? '' : undefined}
      data-bob={bpm ? '' : undefined}
      style={{ ...(hoodieColor ? { '--pa-hoodie': hoodieColor } : {}), ...(bpm ? { '--pa-bpm': bpm } : {}), ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default PatrickAvatar;

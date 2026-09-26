export function getSiteAdsScript() {
  return `
<script>
(function () {
  'use strict';

  if (window.__VIX_AD_SYSTEM__) return;
  window.__VIX_AD_SYSTEM__ = true;

  const HOST = 'https://toleranceteaminadequate.com/';

  function createBox(className) {
    const el = document.createElement('div');
    el.className = className;
    return el;
  }

  function runBanner(box, key, width, height) {
    if (!box) return;

    const options = document.createElement('script');

    options.text = \`
      atOptions = {
        'key' : '\${key}',
        'format' : 'iframe',
        'height' : \${height},
        'width' : \${width},
        'params' : {}
      };
    \`;

    const loader = document.createElement('script');

    loader.src = HOST + key + '/invoke.js';

    box.appendChild(options);

    setTimeout(function () {
      box.appendChild(loader);
    }, 20);
  }

  function runNative(box) {
    if (!box) return;

    const container = document.createElement('div');

    container.id =
      'container-e9a7ebb5b4ccad1a0f4057850ab50885';

    box.appendChild(container);

    const script = document.createElement('script');

    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    script.src =
      HOST +
      'e9a7ebb5b4ccad1a0f4057850ab50885/invoke.js';

    setTimeout(function () {
      box.appendChild(script);
    }, 50);
  }

  function hasKey(key) {
    return document.documentElement.innerHTML.indexOf(key) !== -1;
  }

  function insertAfter(newEl, target) {
    if (!target || !target.parentNode) return;

    target.parentNode.insertBefore(
      newEl,
      target.nextSibling
    );
  }

  function startAds() {

    /* =========================================
       1. TOP RESPONSIVE BANNER
       ========================================= */

    if (
      !hasKey('09d84e44afaa5e3c051baecc7e938408') &&
      !hasKey('ea0c551c70dff7d0eaa582b5e7e48185') &&
      !hasKey('9811cc42403575f9dd8e4dcdde62d5fb')
    ) {

      const top = createBox('vix-top-ad');

      const navbar =
        document.querySelector('.navbar-container');

      if (navbar) {
        insertAfter(top, navbar);
      } else {
        document.body.insertBefore(
          top,
          document.body.firstChild
        );
      }

      const width = window.innerWidth;

      if (width < 700) {

        runBanner(
          top,
          '09d84e44afaa5e3c051baecc7e938408',
          320,
          50
        );

      } else if (width < 1100) {

        runBanner(
          top,
          'ea0c551c70dff7d0eaa582b5e7e48185',
          468,
          60
        );

      } else {

        runBanner(
          top,
          '9811cc42403575f9dd8e4dcdde62d5fb',
          728,
          90
        );
      }
    }


    /* =========================================
       2. NATIVE BANNER
       ========================================= */

    if (
      !hasKey(
        'e9a7ebb5b4ccad1a0f4057850ab50885'
      )
    ) {

      const nativeBox =
        createBox('vix-native-ad');

      const main =
        document.querySelector('main');

      if (main && main.firstElementChild) {

        insertAfter(
          nativeBox,
          main.firstElementChild
        );

      } else {

        const navbar =
          document.querySelector(
            '.navbar-container'
          );

        if (navbar) {
          insertAfter(
            nativeBox,
            navbar
          );
        } else {
          document.body.appendChild(
            nativeBox
          );
        }
      }

      runNative(nativeBox);
    }


    /* =========================================
       3. 300x250
       ========================================= */

    if (
      !hasKey(
        '2800610326ebafc17c30013f7a1096e5'
      )
    ) {

      const square =
        createBox('vix-square-ad');

      const main =
        document.querySelector('main');

      if (main) {
        main.appendChild(square);
      } else {
        document.body.appendChild(square);
      }

      runBanner(
        square,
        '2800610326ebafc17c30013f7a1096e5',
        300,
        250
      );
    }


    /* =========================================
       4. DESKTOP SIDE AD
       ========================================= */

    if (
      !hasKey(
        '4a7ac21e7da2b90676125bb44a4e04a0'
      ) &&
      !hasKey(
        'e83579d17388656c4773bc62268c78eb'
      )
    ) {

      const width =
        window.innerWidth;

      if (width >= 1700) {

        const side =
          createBox('vix-side-ad');

        document.body.appendChild(side);

        runBanner(
          side,
          '4a7ac21e7da2b90676125bb44a4e04a0',
          160,
          600
        );

      } else if (width >= 1500) {

        const side =
          createBox('vix-side-ad');

        document.body.appendChild(side);

        runBanner(
          side,
          'e83579d17388656c4773bc62268c78eb',
          160,
          300
        );
      }
    }


    /* =========================================
       5. SOCIAL BAR
       ========================================= */

    if (
      !document.querySelector(
        'script[src*="6a9c5ac03c309d25864dd0e4fb44207f"]'
      )
    ) {

      const social =
        document.createElement('script');

      social.src =
        HOST +
        '6a/9c/5a/6a9c5ac03c309d25864dd0e4fb44207f.js';

      social.async = true;

      document.body.appendChild(social);
    }
  }


  /* =========================================
     STYLES
     ========================================= */

  const style =
    document.createElement('style');

  style.textContent = \`

    .vix-top-ad {
      width: 100%;
      min-height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 8px auto 15px;
      overflow: hidden;
      text-align: center;
    }

    .vix-native-ad {
      width: 100%;
      min-height: 90px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 18px auto;
      overflow: hidden;
    }

    .vix-square-ad {
      width: 100%;
      min-height: 250px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 25px auto;
      overflow: hidden;
    }

    .vix-side-ad {
      position: fixed;
      top: 180px;
      right: max(
        10px,
        calc((100vw - 1100px) / 2 - 180px)
      );
      width: 160px;
      z-index: 999;
      text-align: center;
    }

    @media (max-width: 1499px) {
      .vix-side-ad {
        display: none;
      }
    }

    @media (max-width: 699px) {

      .vix-top-ad {
        min-height: 50px;
      }

      .vix-top-ad iframe {
        max-width: 100%;
      }

      .vix-side-ad {
        display: none;
      }
    }

  \`;

  document.head.appendChild(style);


  /* Wait until Astro page DOM is ready */

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      startAds
    );

  } else {

    startAds();

  }

})();
</script>
`;
}

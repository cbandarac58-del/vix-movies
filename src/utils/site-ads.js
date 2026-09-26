export function getSiteAdsScript() {
  return `
<script>
(function () {
  'use strict';

  if (window.__VIX_GLOBAL_ADS_LOADED) return;
  window.__VIX_GLOBAL_ADS_LOADED = true;

  const AD_HOST = 'https://toleranceteaminadequate.com/';

  const ADS = {
    banner320: {
      key: '09d84e44afaa5e3c051baecc7e938408',
      width: 320,
      height: 50
    },

    banner468: {
      key: 'ea0c551c70dff7d0eaa582b5e7e48185',
      width: 468,
      height: 60
    },

    banner728: {
      key: '9811cc42403575f9dd8e4dcdde62d5fb',
      width: 728,
      height: 90
    },

    native: {
      key: 'e9a7ebb5b4ccad1a0f4057850ab50885'
    },

    square: {
      key: '2800610326ebafc17c30013f7a1096e5',
      width: 300,
      height: 250
    },

    side300: {
      key: 'e83579d17388656c4773bc62268c78eb',
      width: 160,
      height: 300
    },

    side600: {
      key: '4a7ac21e7da2b90676125bb44a4e04a0',
      width: 160,
      height: 600
    }
  };

  function loadBanner(slot, ad) {
    if (!slot || slot.dataset.loaded === '1') return;

    slot.dataset.loaded = '1';

    const config = document.createElement('script');
    config.textContent =
      "atOptions = {" +
      "'key' : '" + ad.key + "'," +
      "'format' : 'iframe'," +
      "'height' : " + ad.height + "," +
      "'width' : " + ad.width + "," +
      "'params' : {}" +
      "};";

    const loader = document.createElement('script');
    loader.src = AD_HOST + ad.key + '/invoke.js';
    loader.async = false;

    slot.appendChild(config);
    slot.appendChild(loader);
  }

  function loadNative(slot) {
    if (!slot || slot.dataset.loaded === '1') return;

    slot.dataset.loaded = '1';

    const container = document.createElement('div');
    container.id = 'container-e9a7ebb5b4ccad1a0f4057850ab50885';

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = AD_HOST + 'e9a7ebb5b4ccad1a0f4057850ab50885/invoke.js';

    slot.appendChild(script);
    slot.appendChild(container);
  }

  function makeSlot(className) {
    const div = document.createElement('div');
    div.className = className;
    return div;
  }

  function hasAd(key) {
    return document.documentElement.innerHTML.indexOf(key) !== -1;
  }

  function insertAfter(el, target) {
    if (!el || !target || !target.parentNode) return;
    target.parentNode.insertBefore(el, target.nextSibling);
  }

  function initAds() {

    /*
     * TOP RESPONSIVE BANNER
     * Navbar ekata passe
     */
    if (
      !hasAd(ADS.banner320.key) &&
      !hasAd(ADS.banner468.key) &&
      !hasAd(ADS.banner728.key)
    ) {
      const navbar = document.querySelector('.navbar-container');

      const top = makeSlot('vix-ad-top');

      if (navbar) {
        insertAfter(top, navbar);
      } else {
        document.body.insertBefore(top, document.body.firstChild);
      }

      function loadResponsiveBanner() {
        const w = window.innerWidth;

        if (w < 700) {
          loadBanner(top, ADS.banner320);
        } else if (w < 1100) {
          loadBanner(top, ADS.banner468);
        } else {
          loadBanner(top, ADS.banner728);
        }
      }

      loadResponsiveBanner();
    }

    /*
     * NATIVE BANNER
     * Main content eke uda
     */
    if (!hasAd(ADS.native.key)) {
      const native = makeSlot('vix-ad-native');

      const main = document.querySelector('main');

      if (main) {
        const first = main.firstElementChild;

        if (first) {
          insertAfter(native, first);
        } else {
          main.insertBefore(native, main.firstChild);
        }
      } else {
        const navbar = document.querySelector('.navbar-container');

        if (navbar) {
          insertAfter(native, navbar);
        } else {
          document.body.appendChild(native);
        }
      }

      loadNative(native);
    }

    /*
     * 300x250
     * Main content eke pahala
     */
    if (!hasAd(ADS.square.key)) {
      const square = makeSlot('vix-ad-square');

      const main = document.querySelector('main');

      if (main) {
        main.appendChild(square);
      } else {
        document.body.appendChild(square);
      }

      loadBanner(square, ADS.square);
    }

    /*
     * DESKTOP SIDE AD
     *
     * 1500px+  -> 160x300
     * 1700px+  -> 160x600
     */
    if (
      !hasAd(ADS.side300.key) &&
      !hasAd(ADS.side600.key)
    ) {
      const width = window.innerWidth;

      if (width >= 1500) {
        const side = makeSlot('vix-ad-side');

        document.body.appendChild(side);

        if (width >= 1700) {
          loadBanner(side, ADS.side600);
        } else {
          loadBanner(side, ADS.side300);
        }
      }
    }

    /*
     * SOCIAL BAR / GLOBAL SCRIPT
     */
    if (
      !document.querySelector(
        'script[src*="6a9c5ac03c309d25864dd0e4fb44207f"]'
      )
    ) {
      const social = document.createElement('script');

      social.src =
        AD_HOST +
        '6a/9c/5a/6a9c5ac03c309d25864dd0e4fb44207f.js';

      social.async = true;

      document.body.appendChild(social);
    }
  }

  function addStyles() {
    if (document.getElementById('vix-global-ad-styles')) return;

    const style = document.createElement('style');
    style.id = 'vix-global-ad-styles';

    style.textContent = \`
      .vix-ad-top {
        width: 100%;
        min-height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 8px auto 14px;
        overflow: hidden;
        text-align: center;
      }

      .vix-ad-native {
        width: 100%;
        max-width: 100%;
        min-height: 90px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 18px auto;
        overflow: hidden;
      }

      .vix-ad-square {
        width: 100%;
        min-height: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 24px auto;
        overflow: hidden;
        text-align: center;
      }

      .vix-ad-side {
        position: fixed;
        top: 180px;
        right: max(10px, calc((100vw - 1100px) / 2 - 180px));
        width: 160px;
        z-index: 50;
        text-align: center;
      }

      @media (max-width: 699px) {
        .vix-ad-top iframe {
          max-width: 100%;
        }

        .vix-ad-side {
          display: none;
        }
      }

      @media (max-width: 1499px) {
        .vix-ad-side {
          display: none;
        }
      }

      @media (max-width: 360px) {
        .vix-ad-top {
          transform: scale(0.95);
          transform-origin: center;
        }
      }
    \`;

    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      addStyles();
      initAds();
    });
  } else {
    addStyles();
    initAds();
  }

})();
</script>
`;
}

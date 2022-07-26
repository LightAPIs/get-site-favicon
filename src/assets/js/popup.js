'use strict';

(function () {
  const i18n = key => chrome.i18n.getMessage(key);
  document.getElementById('url_input_label').textContent = i18n('urlInputLabel');
  document.getElementById('res_input_label').textContent = i18n('resInputLabel');
  document.getElementById('image_label').textContent = i18n('imageEm');
  const urlRun = document.getElementById('url_run');
  const resCopy = document.getElementById('res_copy');
  const donwloadBtn = document.getElementById('download_btn');
  const resP = document.getElementById('res_p');
  const resImage = document.getElementById('res_image');
  urlRun.textContent = i18n('urlRunValue');
  resCopy.textContent = i18n('resCopyValue');
  donwloadBtn.textContent = i18n('donwloadBtn');
  let imageUrl = '';
  const imageSizeHandler = function (imgDom, data, pDom) {
    if (imgDom.naturalWidth && imgDom.naturalHeight) {
      if (imgDom.naturalWidth > data.width || imgDom.naturalHeight > data.height) {
        pDom.textContent = `( ${imgDom.naturalWidth} x ${imgDom.naturalHeight} )`;
      }
    }
  };
  urlRun.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('res_input').value = '';
    resImage.style.display = 'none';
    donwloadBtn.style.display = 'none';
    resP.textContent = '';
    imageUrl = '';
    if (window.getFavicon) {
      const urlValue = document.getElementById('url_input').value;
      if (urlValue) {
        resP.textContent = i18n('loading');
        window.getFavicon
          .detectIcon(urlValue)
          .then(res => {
            if (res && res.url) {
              document.getElementById('res_input').value = res.url;
              resImage.src = res.url;
              resImage.style.display = 'inline';
              donwloadBtn.style.display = 'block';
              resP.textContent = `( ${res.width} x ${res.height} )`;
              imageUrl = res.url;
              if (resImage.complete) {
                imageSizeHandler(resImage, res, resP);
              } else {
                resImage.onload = () => {
                  imageSizeHandler(resImage, res, resP);
                };
              }
            } else {
              resP.textContent = i18n('loadError');
            }
          })
          .catch(e => {
            console.error(e);
            resP.textContent = i18n('loadError');
          });
      }
    } else {
      resP.textContent = i18n('internalError');
    }
  });
  document.getElementById('url_input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      urlRun.click();
    }
  });
  const clipboard = new ClipboardJS('.copy_btn');
  clipboard.on('success', _e => {
    resCopy.style.color = '#feb22b';
    setTimeout(() => {
      resCopy.style.color = '#fff';
    }, 3000);
  });
  clipboard.on('error', _e => {
    resCopy.style.color = '#800000';
    setTimeout(() => {
      resCopy.style.color = '#fff';
    }, 3000);
  });
  donwloadBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (imageUrl) {
      chrome.downloads.download(
        {
          url: imageUrl,
        },
        () => {
          if (!chrome.runtime.lastError) {
            donwloadBtn.style.color = '#feb22b';
            setTimeout(() => {
              donwloadBtn.style.color = '#fff';
            }, 3000);
          } else {
            donwloadBtn.style.color = '#800000';
            setTimeout(() => {
              donwloadBtn.style.color = '#fff';
            }, 3000);
          }
        }
      );
    }
  });
  chrome.tabs.query(
    {
      active: true,
      lastFocusedWindow: true,
    },
    tabs => {
      if (!chrome.runtime.lastError && tabs && tabs.length > 0) {
        const tabUrl = tabs[0].url;
        const urlInput = document.getElementById('url_input');
        if (tabUrl && tabUrl.indexOf('http') === 0) {
          urlInput.value = tabUrl;
        }
        urlInput.focus();
        urlInput.select();
      }
    }
  );
})();

'use strict';

(function () {
  const i18n = key => chrome.i18n.getMessage(key);
  document.getElementById('url_input_label').textContent = i18n('urlInputLabel');
  document.getElementById('res_input_label').textContent = i18n('resInputLabel');
  document.getElementById('image_label').textContent = i18n('imageEm');
  const urlRun = document.getElementById('url_run');
  const imageBq = document.getElementById('image_blockquote');
  const resCopy = document.getElementById('res_copy');
  const donwloadBtn = document.getElementById('download_btn');
  urlRun.textContent = i18n('urlRunValue');
  resCopy.textContent = i18n('resCopyValue');
  donwloadBtn.textContent = i18n('donwloadBtn');
  let imageUrl = '';
  urlRun.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('res_input').value = '';
    imageBq.innerHTML = `<p></p>`;
    donwloadBtn.style.display = 'none';
    imageUrl = '';
    if (window.getFavicon) {
      const urlValue = document.getElementById('url_input').value;
      if (urlValue) {
        imageBq.innerHTML = `<p>${i18n('loading')}</p>`;
        window.getFavicon
          .detectIcon(urlValue)
          .then(res => {
            if (res && res.url) {
              document.getElementById('res_input').value = res.url;
              imageBq.innerHTML = `<img src="${res.url}" class="res_image" /><p class="image_size">( ${res.width} x ${res.height} )</p>`;
              donwloadBtn.style.display = 'block';
              imageUrl = res.url;
            } else {
              imageBq.innerHTML = `<p>${i18n('loadError')}</p>`;
            }
          })
          .catch(e => {
            console.error(e);
            imageBq.innerHTML = `<p>${i18n('loadError')}</p>`;
          });
      }
    } else {
      imageBq.innerHTML = `<p>${i18n('internalError')}</p>`;
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

const apiKey = "AIzaSyCIRqzCzmi3JW4GTOeCJ8_CP8JNVA2SFP4";
const rootFolderId = "1d23LyALKxJkTIzMMTJhMHa6coccWU7rH";

const gallery = document.getElementById("gallery");
const backButton = document.getElementById("back-button");
const lightbox = document.getElementById("lightbox");

// ================= ЗАГРУЗКА КОРНЯ =================
async function loadFolderContents(folderId) {
  gallery.innerHTML = "<p style='text-align:center;color:#777;'>Загрузка...</p>";

  try {
    const folderQuery = encodeURIComponent(
      `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    );

    const mediaQuery = encodeURIComponent(
      `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false`
    );

    const folderUrl = `https://www.googleapis.com/drive/v3/files?key=${apiKey}&q=${folderQuery}&fields=files(id,name)&pageSize=200`;
    const mediaUrl  = `https://www.googleapis.com/drive/v3/files?key=${apiKey}&q=${mediaQuery}&fields=files(id,name,mimeType)&pageSize=500`;

    const [folderRes, mediaRes] = await Promise.all([
      fetch(folderUrl),
      fetch(mediaUrl)
    ]);

    const folderData = await folderRes.json();
    const mediaData  = await mediaRes.json();

    gallery.innerHTML = "";

    // ================= ПАПКИ =================
    if (folderData.files?.length) {
      for (const folder of folderData.files) {
        const div = document.createElement("div");
        div.className = "folder";
        div.style.backgroundImage = `url('img/main-photo.jpg')`;
        div.innerHTML = `<span>${folder.name}</span>`;
        div.onclick = () => {
          window.location.href = `folder.html?folder=${folder.id}`;
        };
        gallery.appendChild(div);
      }
    }

    // ================= ФОТО + ВИДЕО =================
    if (mediaData.files?.length) {
      mediaData.files.forEach(file => {

        // ---- ФОТО ----
        if (file.mimeType.startsWith("image/")) {
          const img = document.createElement("img");
          const src = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;

          img.src = src;
          img.alt = file.name || "";

          img.onclick = () => {
            lightbox.innerHTML = `<img src="${src}">`;
            lightbox.style.display = "flex";
          };

          gallery.appendChild(img);
        }

        // ---- ВИДЕО (iframe) ----
        if (file.mimeType.startsWith("video/")) {
          const videoPreview = document.createElement("div");
          videoPreview.className = "video-preview";
          videoPreview.style.backgroundImage =
            `url('https://drive.google.com/thumbnail?id=${file.id}&sz=w1000')`;

          videoPreview.innerHTML = `<span class="play-icon">▶</span>`;

          videoPreview.onclick = () => {
            lightbox.innerHTML = `
              <iframe 
                src="https://drive.google.com/file/d/${file.id}/preview"
                allow="autoplay"
                allowfullscreen>
              </iframe>
            `;
            lightbox.style.display = "flex";
          };

          gallery.appendChild(videoPreview);
        }
      });
    }

    if (
      (!folderData.files || folderData.files.length === 0) &&
      (!mediaData.files || mediaData.files.length === 0)
    ) {
      gallery.innerHTML = "<p style='text-align:center;color:#777;'>Папка пуста</p>";
    }

  } catch (err) {
    gallery.innerHTML = `<p style="color:red;text-align:center;">Ошибка: ${err.message}</p>`;
  }
}

// ================= ЛАЙТБОКС =================
lightbox.addEventListener("click", (e) => {
  if (e.target.tagName !== "IMG" && e.target.tagName !== "IFRAME") {
    lightbox.style.display = "none";
    lightbox.innerHTML = "";
  }
});

// ================= СТАРТ =================
loadFolderContents(rootFolderId);

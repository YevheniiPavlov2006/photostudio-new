const apiKey = "AIzaSyCIRqzCzmi3JW4GTOeCJ8_CP8JNVA2SFP4";

const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");

const params = new URLSearchParams(window.location.search);
const folderId = params.get("folder");

// ================= ЗАГРУЗКА ФОТО + ВИДЕО =================
async function loadMedia(folderId) {
  const query = encodeURIComponent(
    `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false`
  );

  gallery.innerHTML = "<p style='text-align:center;color:#777;'>Загрузка...</p>";

  try {
    const url = `https://www.googleapis.com/drive/v3/files?key=${apiKey}&q=${query}&fields=files(id,name,mimeType)&pageSize=300`;
    const res = await fetch(url);
    const data = await res.json();

    gallery.innerHTML = "";

    if (!data.files?.length) {
      gallery.innerHTML = "<p style='text-align:center;color:#777;'>Нет файлов</p>";
      return;
    }

    data.files.forEach(file => {

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

      // ---- ВИДЕО ----
      if (file.mimeType.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = `https://drive.google.com/uc?export=preview&id=${file.id}`;
        video.controls = true;
        video.muted = true;
        video.playsInline = true;

        video.onclick = () => {
          lightbox.innerHTML = `
            <video src="https://drive.google.com/uc?export=preview&id=${file.id}" controls autoplay></video>
          `;
          lightbox.style.display = "flex";
        };

        gallery.appendChild(video);
      }
    });

  } catch (e) {
    gallery.innerHTML = `<p style="color:red;">Ошибка: ${e.message}</p>`;
  }
}

// ================= ЛАЙТБОКС =================
lightbox.addEventListener("click", (e) => {
  if (e.target.tagName !== "IMG" && e.target.tagName !== "VIDEO") {
    lightbox.style.display = "none";
    lightbox.innerHTML = "";
  }
});

loadMedia(folderId);

const apiKey = "AIzaSyCIRqzCzmi3JW4GTOeCJ8_CP8JNVA2SFP4";

const gallery = document.getElementById("gallery");
const urlParams = new URLSearchParams(window.location.search);
const folderId = urlParams.get("folder");

// === Загружаем только изображения ===
async function loadImages(folderId) {
  const query = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed=false`);

  gallery.innerHTML = "<p style='text-align:center;color:#777;'>Загрузка...</p>";

  try {
    const imageUrl = `https://www.googleapis.com/drive/v3/files?key=${apiKey}&q=${query}&fields=files(id,name)&pageSize=300`;
    const imageRes = await fetch(imageUrl);
    const imageData = await imageRes.json();

    gallery.innerHTML = "";

    if (!imageData.files.length) {
      gallery.innerHTML = "<p style='text-align:center;color:#777;'>Нет фото</p>";
      return;
    }

    imageData.files.forEach(file => {
      const img = document.createElement("img");
      img.src = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;
      img.alt = file.name;

      img.onclick = () => {
        const lightbox = document.getElementById("lightbox");
        lightbox.style.display = "flex";
        lightbox.querySelector("img").src = img.src;
      };

      gallery.appendChild(img);
    });

  } catch (e) {
    gallery.innerHTML = `<p style='color:red;'>Ошибка загрузки: ${e.message}</p>`;
  }
}

loadImages(folderId);

// Закрытие лайтбокса
document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target.tagName !== "IMG") {
    e.currentTarget.style.display = "none";
  }
});

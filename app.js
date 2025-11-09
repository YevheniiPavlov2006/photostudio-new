const apiKey = "AIzaSyCIRqzCzmi3JW4GTOeCJ8_CP8JNVA2SFP4";
const rootFolderId = "1d23LyALKxJkTIzMMTJhMHa6coccWU7rH";

const gallery = document.getElementById("gallery");
const backButton = document.getElementById("back-button");
let folderHistory = [rootFolderId]; // история навигации

// === Загрузка содержимого папки (папки + фото) ===
async function loadFolderContents(folderId) {
  gallery.innerHTML = "<p style='text-align:center;color:#777;'>Загрузка...</p>";

  try {
    // --- Формируем и кодируем запросы корректно ---
    const folderQuery = encodeURIComponent(`'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const imageQuery  = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed=false`);

    // Получаем подпапки
    const folderUrl = `https://www.googleapis.com/drive/v3/files?key=${apiKey}&q=${folderQuery}&fields=files(id,name)&pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true`;
    const folderRes = await fetch(folderUrl);
    const folderData = await folderRes.json();

    // Получаем изображения
    const imageUrl = `https://www.googleapis.com/drive/v3/files?key=${apiKey}&q=${imageQuery}&fields=files(id,name)&pageSize=500&supportsAllDrives=true&includeItemsFromAllDrives=true`;
    const imageRes = await fetch(imageUrl);
    const imageData = await imageRes.json();

    // Проверка ошибок от API
    if (folderData.error || imageData.error) {
      gallery.innerHTML = `<p style='color:red;text-align:center;'>Ошибка: ${folderData.error?.message || imageData.error?.message}</p>`;
      return;
    }

    gallery.innerHTML = "";

    // --- Добавляем папки (сначала) ---
    if (folderData.files?.length) {
      folderData.files.forEach(folder => {
        const div = document.createElement("div");
        div.className = "folder";
        div.innerHTML = `
          <span>${folder.name}</span>
        `;
        div.addEventListener("click", () => {
          folderHistory.push(folder.id);
          loadFolderContents(folder.id);
          backButton.style.display = "block";
        });
        gallery.appendChild(div);
      });
    }

    // --- Затем добавляем изображения ---
    if (imageData.files?.length) {
      imageData.files.forEach(file => {
        const img = document.createElement("img");
        const imageUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;
        img.src = imageUrl;
        img.alt = file.name || "";
        img.addEventListener("click", (e) => {
          e.stopPropagation();
          const lightbox = document.getElementById("lightbox");
          lightbox.style.display = "flex";
          lightbox.querySelector("img").src = imageUrl;
        });
        gallery.appendChild(img);
      });
    }

    // --- Если ничего нет ---
    if ((!folderData.files || folderData.files.length === 0) && (!imageData.files || imageData.files.length === 0)) {
      gallery.innerHTML = "<p style='text-align:center;color:#777;'>Папка пуста</p>";
    }

    // Отображение / скрытие кнопки "Назад"
    backButton.style.display = folderHistory.length > 1 ? "block" : "none";
  } catch (err) {
    gallery.innerHTML = `<p style='color:red;text-align:center;'>Ошибка загрузки: ${err.message}</p>`;
  }
}

// === Кнопка Назад ===
backButton.addEventListener("click", () => {
  if (folderHistory.length > 1) {
    folderHistory.pop(); // удаляем текущую папку
    const prevFolderId = folderHistory[folderHistory.length - 1];
    loadFolderContents(prevFolderId);
    backButton.style.display = prevFolderId === rootFolderId ? "none" : "block";
  }
});

// === Закрытие лайтбокса (клик вне изображения) ===
document.getElementById("lightbox").addEventListener("click", (e) => {
  // если клик пришёл по изображению — игнорируем (позволяет нажать на само изображение без закрытия)
  if (e.target.tagName.toLowerCase() === 'img') return;
  document.getElementById("lightbox").style.display = "none";
});

// === Первая загрузка ===
loadFolderContents(rootFolderId);

// === Автообновление каждые 30 секунд (только на уровне корня) ===
setInterval(() => {
  if (folderHistory.length === 1) {
    loadFolderContents(rootFolderId);
  }
}, 30000);

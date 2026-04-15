
  const API_BASE_URL = "http://localhost:5000/api";
  const urlParams = new URLSearchParams(window.location.search);
  const currentActivity = urlParams.get("type") || "GyanManthan";

  const activityMeta = {
    'GyanManthan': { tag: 'Annual Educational Fair', quote: '"The world is but a canvas to our imagination and innovation!"' },
    'Spardha': { tag: 'Annual Sports Fair', quote: '"Wondered what\\'s the best part of the game? The opportunity to play!"' },
    'Prayas': { tag: 'Annual Cultural-Cum-Charity Festival', quote: '"Art is an effort to create, beside the real world, a more humane world."' },
    'Extra': { tag: 'Activity Gallery', quote: '' }
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.title = currentActivity + " | Literacy Mission";
    const titleEl = document.getElementById("activity-main-title");
    const tagEl = document.getElementById("activity-tagline");
    const quoteEl = document.getElementById("activity-quote");

    const meta = activityMeta[currentActivity] || activityMeta['Extra'];
    
    if (tagEl) tagEl.textContent = meta.tag;
    if (quoteEl) quoteEl.textContent = meta.quote;
    if (titleEl) {
      titleEl.textContent = currentActivity === "Extra" ? "EXTRA CURRICULARS" : currentActivity.toUpperCase();
    }

    fetchGlobalConfig();
    fetchActivityData(currentActivity);
  });

  async function fetchGlobalConfig() {
    try {
      const res = await fetch(API_BASE_URL + "/global");
      if (!res.ok) return;
      const config = await res.json();
      
      if (config.contactEmail) {
        const footEmail = document.getElementById("footer-email");
        if (footEmail) {
          footEmail.textContent = config.contactEmail;
          footEmail.href = "mailto:" + config.contactEmail;
        }
      }

      if (config.socialLinks) {
        populateSocials("nav-social", config.socialLinks);
        populateSocials("footer-social-links", config.socialLinks);
      }
    } catch (err) { }
  }

  function populateSocials(containerId, links) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const icons = { instagram: "◉", twitter: "𝕏", x: "𝕏", facebook: "f", linkedin: "in" };
    for (const [platform, url] of Object.entries(links)) {
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.textContent = icons[platform.toLowerCase()] || platform.charAt(0).toUpperCase();
        a.target = "_blank";
        container.appendChild(a);
      }
    }
  }

  async function fetchActivityData(activityName) {
    const feed = document.getElementById("activity-feed");
    try {
      const res = await fetch(API_BASE_URL + "/activities");
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || []);
      
      const filtered = list.filter(a => a.activityName === activityName).sort((a,b) => b.year - a.year);
      
      feed.innerHTML = "";
      if(filtered.length === 0) {
        feed.innerHTML = '<div style="text-align:center; padding:100px; color:#aaa;">More updates incoming!</div>';
        return;
      }
      
      filtered.forEach(item => {
        const section = document.createElement("div");
        section.style.marginBottom = "60px";
        
        const header = document.createElement("h2");
        header.style.fontFamily = "Playfair Display, serif";
        header.style.fontSize = "32px";
        header.style.marginBottom = "20px";
        const tags = (item.tags || []).join(", ");
        header.innerHTML = item.year + ' <span style="font-size:12px; font-family: \'DM Sans\', sans-serif; color:var(--green); letter-spacing:1px; text-transform:uppercase;">' + tags + '</span>';
        section.appendChild(header);

        if (item.images && item.images.length > 0) {
          const grid = document.createElement("div");
          grid.style.display = "grid";
          grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(280px, 1fr))";
          grid.style.gap = "20px";
          
          item.images.forEach(imgData => {
            const img = document.createElement("img");
            img.src = imgData.imageUrl;
            img.alt = imgData.altText || "";
            img.style.width = "100%";
            img.style.height = "240px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "12px";
            img.style.background = "var(--green-bg)";
            grid.appendChild(img);
          });
          section.appendChild(grid);
        } else {
          const noImg = document.createElement("p");
          noImg.style.color = "#888";
          noImg.textContent = "No images available for this year.";
          section.appendChild(noImg);
        }
        
        feed.appendChild(section);
      });
    } catch(err) {
      feed.innerHTML = '<div style="text-align:center; padding:100px; color:red;">Failed to load content.</div>';
    }
  }

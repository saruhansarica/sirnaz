document.addEventListener('DOMContentLoaded', () => {
  let menuData = [];
  let settingsData = {
    taxNoticeTr: "Fiyatlarımıza tüm vergiler dahildir.",
    taxNoticeEn: "All taxes are included in our prices.",
    priceUpdateDate: "21.07.2026"
  };
  let currentLang = localStorage.getItem('sirnaz_lang') || 'tr';
  
  // DOM Elements
  const splash = document.getElementById('splash');
  const btnEnter = document.getElementById('btn-enter');
  const splashVideo = document.getElementById('splash-video');
  
  const categoryNav = document.getElementById('category-nav');
  const menuContainer = document.getElementById('menu-sections-container');
  const searchInput = document.getElementById('search-input');
  const btnLang = document.getElementById('btn-lang');
  
  const footerResLabel = document.getElementById('footer-res-label');
  const footerCopyText = document.getElementById('footer-copy-text');
  
  const detailModal = document.getElementById('detail-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalImg = document.getElementById('modal-img');
  const modalImageContainer = document.getElementById('modal-image-container');
  const modalBadge = document.getElementById('modal-badge');
  const modalTitle = document.getElementById('modal-title');
  const modalPrice = document.getElementById('modal-price');
  const modalDesc = document.getElementById('modal-desc');
  const modalIngredients = document.getElementById('modal-ingredients');
  const modalIngredientsContainer = document.getElementById('modal-ingredients-container');
  const modalAllergens = document.getElementById('modal-allergens');
  const modalAllergensContainer = document.getElementById('modal-allergens-container');
  const modalPairing = document.getElementById('modal-pairing');
  const modalPairingContainer = document.getElementById('modal-pairing-container');

  // Advanced attributes DOM elements
  const modalWeight = document.getElementById('modal-weight');
  const modalPorkText = document.getElementById('modal-pork-text');
  const modalNutritionContainer = document.getElementById('modal-nutrition-container');
  const btnToggleNutrition = document.getElementById('btn-toggle-nutrition');
  const modalNutritionCal = document.getElementById('modal-nutrition-cal');
  const modalNutritionProt = document.getElementById('modal-nutrition-prot');
  const modalNutritionCarbs = document.getElementById('modal-nutrition-carbs');
  const modalNutritionFat = document.getElementById('modal-nutrition-fat');

  // Static Translations Dictionary
  const uiTranslations = {
    tr: {
      btnEnter: "Menüyü Gör",
      searchPlaceholder: "Lezzet arayın (örn. Kebap, Meze, Humus...)",
      footerReservation: "Rezervasyon & Sipariş:",
      footerCopyright: "© 2026 Şirnaz Restaurant. Tüm hakları saklıdır.",
      modalIngredients: "İçindekiler",
      modalAllergens: "Alerjen Uyarısı",
      modalPairing: "Uyumlu İçecek Önerisi",
      loadingText: "Yükleniyor...",
      langBtnText: "EN",
      porkWarning: "Domuz yağı ve türevleri içermez.",
      nutritionTitle: "Besin Değerleri",
      nutritionCal: "Kalori",
      nutritionProt: "Protein",
      nutritionCarbs: "Karbonhidrat",
      nutritionFat: "Yağ"
    },
    en: {
      btnEnter: "See Menu",
      searchPlaceholder: "Search flavors (e.g. Kebab, Starter, Hummus...)",
      footerReservation: "Reservation & Ordering:",
      footerCopyright: "© 2026 Şirnaz Restaurant. All rights reserved.",
      modalIngredients: "Ingredients",
      modalAllergens: "Allergen Warning",
      modalPairing: "Beverage Pairing",
      loadingText: "Loading...",
      langBtnText: "TR",
      porkWarning: "Does not contain lard or pork derivatives.",
      nutritionTitle: "Nutrition Facts",
      nutritionCal: "Calories",
      nutritionProt: "Protein",
      nutritionCarbs: "Carbohydrates",
      nutritionFat: "Fat"
    }
  };

  // Ensure video plays smoothly
  if (splashVideo) {
    splashVideo.play().catch(err => {
      console.log("Auto-play was prevented. Showing fallback gradient.", err);
    });
  }

  // ==========================================
  // Splash Screen Hide Action
  // ==========================================
  btnEnter.addEventListener('click', () => {
    splash.classList.add('hidden');
    // Enable scroll after entering
    document.body.style.overflow = 'auto';
  });

  // Prevent scrolling while splash screen is active
  document.body.style.overflow = 'hidden';

  // ==========================================
  // Language Manager
  // ==========================================
  const updateLanguageUI = () => {
    const translation = uiTranslations[currentLang];
    
    // Set document lang attribute
    document.documentElement.lang = currentLang;
    
    // Update Static Elements
    btnEnter.textContent = translation.btnEnter;
    btnLang.textContent = translation.langBtnText;
    searchInput.placeholder = translation.searchPlaceholder;
    footerResLabel.textContent = translation.footerReservation;
    footerCopyText.textContent = translation.footerCopyright;
    
    // Update Modal Static Titles
    document.querySelector('#modal-ingredients-container h3').textContent = translation.modalIngredients;
    document.querySelector('#modal-allergens-container h3').textContent = translation.modalAllergens;
    document.querySelector('#modal-pairing-container h3').textContent = translation.modalPairing;
    
    document.getElementById('modal-nutrition-title').textContent = translation.nutritionTitle;
    document.getElementById('modal-lbl-cal').textContent = translation.nutritionCal;
    document.getElementById('modal-lbl-prot').textContent = translation.nutritionProt;
    document.getElementById('modal-lbl-carbs').textContent = translation.nutritionCarbs;
    document.getElementById('modal-lbl-fat').textContent = translation.nutritionFat;
    
    // Update footer pricing/tax notice settings
    renderFooterSettings();
  };

  const renderFooterSettings = () => {
    const taxNoticeEl = document.getElementById('footer-tax-notice');
    const priceUpdateEl = document.getElementById('footer-price-update');
    
    if (taxNoticeEl && priceUpdateEl) {
      taxNoticeEl.textContent = currentLang === 'tr' ? settingsData.taxNoticeTr : settingsData.taxNoticeEn;
      priceUpdateEl.textContent = currentLang === 'tr' 
        ? `Fiyat Değişim Tarihi: ${settingsData.priceUpdateDate}` 
        : `Price Revision Date: ${settingsData.priceUpdateDate}`;
    }
  };

  // Toggle Language Handler
  btnLang.addEventListener('click', () => {
    currentLang = currentLang === 'tr' ? 'en' : 'tr';
    localStorage.setItem('sirnaz_lang', currentLang);
    
    updateLanguageUI();
    renderCategoryNav();
    renderMenuSections();
    setupScrollAnimationsFallback();
    setupActiveCategoryObserver();
    
    // Reset search input value when toggling language
    searchInput.value = '';
  });

  // ==========================================
  // Fetch & Render Menu
  // ==========================================
  const loadMenu = async () => {
    try {
      updateLanguageUI(); // Set initial static UI translation
      
      // Fetch settings first
      try {
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
          settingsData = await settingsResponse.json();
          renderFooterSettings();
        }
      } catch (settingsErr) {
        console.error('Error loading settings:', settingsErr);
      }
      
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Menu could not be loaded.');
      menuData = await response.json();
      
      renderCategoryNav();
      renderMenuSections();
      setupScrollAnimationsFallback();
      setupActiveCategoryObserver();
    } catch (error) {
      console.error('Error loading menu:', error);
      categoryNav.innerHTML = `<span style="color: var(--color-red); font-size: 0.8rem; padding: 10px;">${uiTranslations[currentLang].loadingText}</span>`;
    }
  };

  // Render Category Horizontal Navigation bar
  const renderCategoryNav = () => {
    categoryNav.innerHTML = '';
    
    menuData.forEach((category, index) => {
      const btn = document.createElement('button');
      btn.className = `category-btn ${index === 0 ? 'active' : ''}`;
      btn.dataset.id = category.id;
      btn.textContent = category.name[currentLang] || category.name.tr;
      
      btn.addEventListener('click', () => {
        // Highlight active btn
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Scroll to target section
        const section = document.getElementById(category.id);
        if (section) {
          const yOffset = -145; // sticky header + category bar height offset
          const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
      
      categoryNav.appendChild(btn);
    });
  };

  // ==========================================
  // Image Fallback Mapper
  // ==========================================
  const categoryFallbackImages = {
    'corbalar': '/images/soup_traditional.webp',
    'baslangiclar': '/images/meze_hummus.webp',
    'salatalar': '/images/salad_traditional.webp',
    'sirnaz-spesiyalleri': '/images/steak_ribeye.webp',
    'kebaplar': '/images/kebab_adana.webp',
    'pide-ve-lahmacunlar': '/images/kebab_adana.webp',
    'tatlilar': '/images/dessert_katmer.webp',
    'alkolsuz-icecekler': '/images/meze_platter.webp',
    'bira': '/images/meze_platter.webp',
    'rakilar': '/images/meze_platter.webp',
    'saraplar': '/images/meze_platter.webp'
  };

  const getItemImage = (item, categoryId) => {
    if (item.image) return item.image;
    return categoryFallbackImages[categoryId] || '/images/kebab_adana.webp';
  };

  // Render Menu items divided by category sections
  const renderMenuSections = () => {
    menuContainer.innerHTML = '';
    
    menuData.forEach(category => {
      const section = document.createElement('section');
      section.className = 'menu-section';
      section.id = category.id;
      
      // Section Header
      const header = document.createElement('div');
      header.className = 'section-header';
      const title = document.createElement('h2');
      title.className = 'section-title';
      title.textContent = category.name[currentLang] || category.name.tr;
      header.appendChild(title);
      section.appendChild(header);
      
      // Menu Items Grid
      const grid = document.createElement('div');
      grid.className = 'menu-grid';
      
      category.items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'menu-item reveal-on-scroll';
        itemCard.dataset.itemId = item.id;
        
        // Setup item name & description based on active language
        const itemName = item.name[currentLang] || item.name.tr;
        const itemDescription = item.description[currentLang] || item.description.tr;
        const itemBadge = item.badge ? (item.badge[currentLang] || item.badge.tr) : null;
        
        // Determine image URL
        const itemImage = getItemImage(item, category.id);
        
        const imageHTML = `
          <div class="menu-item-image-wrapper">
            ${itemBadge ? `<span class="menu-item-badge">${itemBadge}</span>` : ''}
            <img src="${itemImage}" alt="${itemName}" class="menu-item-image" loading="lazy">
          </div>
        `;
        
        itemCard.innerHTML = `
          ${imageHTML}
          <div class="menu-item-content">
            <div class="menu-item-header">
              <h3 class="menu-item-title">${itemName}</h3>
              <span class="menu-item-price">${item.price} ₺</span>
            </div>
            <p class="menu-item-description">${itemDescription}</p>
          </div>
        `;
        
        // Open Modal on Card Click
        itemCard.addEventListener('click', () => {
          openDetailModal(item, category.id);
        });
        
        grid.appendChild(itemCard);
      });
      
      section.appendChild(grid);
      menuContainer.appendChild(section);
    });
  };

  // ==========================================
  // Search Functionality (Bilingual Support)
  // ==========================================
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    document.querySelectorAll('.menu-section').forEach(section => {
      const categoryId = section.id;
      const category = menuData.find(c => c.id === categoryId);
      let visibleCount = 0;
      
      section.querySelectorAll('.menu-item').forEach(card => {
        const itemId = card.dataset.itemId;
        const item = category.items.find(i => i.id === itemId);
        
        const itemName = (item.name[currentLang] || item.name.tr).toLowerCase();
        const itemDesc = (item.description[currentLang] || item.description.tr).toLowerCase();
        const itemIngredients = (item.details?.ingredients?.[currentLang] || item.details?.ingredients?.tr || '').toLowerCase();
        
        const matchesName = itemName.includes(query);
        const matchesDesc = itemDesc.includes(query);
        const matchesIngredients = itemIngredients.includes(query);
        
        if (matchesName || matchesDesc || matchesIngredients) {
          card.style.display = 'flex';
          visibleCount++;
          card.classList.add('revealed');
        } else {
          card.style.display = 'none';
        }
      });
      
      // Hide entire section if no items are visible
      if (visibleCount === 0 && query !== '') {
        section.style.display = 'none';
        const navBtn = document.querySelector(`.category-btn[data-id="${categoryId}"]`);
        if (navBtn) navBtn.style.display = 'none';
      } else {
        section.style.display = 'block';
        const navBtn = document.querySelector(`.category-btn[data-id="${categoryId}"]`);
        if (navBtn) navBtn.style.display = 'block';
      }
    });
  });

  // ==========================================
  // Modal Interactions
  // ==========================================
  const openDetailModal = (item, categoryId) => {
    const itemName = item.name[currentLang] || item.name.tr;
    const itemDescription = item.description[currentLang] || item.description.tr;
    const itemBadge = item.badge ? (item.badge[currentLang] || item.badge.tr) : null;
    
    // Image setup
    const itemImage = getItemImage(item, categoryId);
    modalImg.src = itemImage;
    modalImg.alt = itemName;
    modalImageContainer.style.display = 'block';
    
    // Badge setup
    if (itemBadge) {
      modalBadge.textContent = itemBadge;
      modalBadge.style.display = 'inline-block';
    } else {
      modalBadge.style.display = 'none';
    }

    // Weight/Grammage setup
    if (item.details?.weight) {
      modalWeight.textContent = item.details.weight;
      modalWeight.style.display = 'inline-block';
    } else {
      modalWeight.style.display = 'none';
    }

    // Pork-free safety banner setup (always true)
    modalPorkText.textContent = uiTranslations[currentLang].porkWarning;
    
    // Core details
    modalTitle.textContent = itemName;
    modalPrice.textContent = `${item.price} ₺`;
    modalDesc.textContent = itemDescription;
    
    // Ingredients
    const ingredientsText = item.details?.ingredients?.[currentLang] || item.details?.ingredients?.tr;
    if (ingredientsText) {
      modalIngredients.textContent = ingredientsText;
      modalIngredientsContainer.style.display = 'block';
    } else {
      modalIngredientsContainer.style.display = 'none';
    }
    
    // Allergens
    const allergensText = item.details?.allergens?.[currentLang] || item.details?.allergens?.tr;
    if (allergensText) {
      modalAllergens.textContent = allergensText;
      modalAllergensContainer.style.display = 'block';
    } else {
      modalAllergensContainer.style.display = 'none';
    }
    
    // Sommelier / Pairing recommendation
    const pairingText = item.details?.pairing?.[currentLang] || item.details?.pairing?.tr;
    if (pairingText) {
      modalPairing.textContent = pairingText;
      modalPairingContainer.style.display = 'block';
    } else {
      modalPairingContainer.style.display = 'none';
    }

    // Nutrition values setup
    const calories = item.details?.nutrition?.calories;
    const protein = item.details?.nutrition?.protein;
    const carbs = item.details?.nutrition?.carbs;
    const fat = item.details?.nutrition?.fat;

    if (calories || protein || carbs || fat) {
      modalNutritionCal.textContent = calories || '-';
      modalNutritionProt.textContent = protein || '-';
      modalNutritionCarbs.textContent = carbs || '-';
      modalNutritionFat.textContent = fat || '-';
      modalNutritionContainer.style.display = 'block';
      modalNutritionContainer.classList.remove('active'); // Collapse by default when modal opens
    } else {
      modalNutritionContainer.style.display = 'none';
    }
    
    // Open modal
    detailModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  };

  const closeDetailModal = () => {
    detailModal.classList.remove('active');
    
    // Re-enable scroll only if splash is not visible
    if (splash.classList.contains('hidden')) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  };

  btnCloseModal.addEventListener('click', closeDetailModal);

  if (btnToggleNutrition) {
    btnToggleNutrition.addEventListener('click', () => {
      modalNutritionContainer.classList.toggle('active');
    });
  }
  
  // Close modal when tapping overlay background outside card
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      closeDetailModal();
    }
  });

  // ==========================================
  // Scroll Driven Animations - JS Fallback
  // ==========================================
  const setupScrollAnimationsFallback = () => {
    if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
      });
    } else {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        el.classList.add('revealed');
      });
    }
  };

  // ==========================================
  // Active Category Highlight on Scroll
  // ==========================================
  const setupActiveCategoryObserver = () => {
    const sections = document.querySelectorAll('.menu-section');
    const navButtons = document.querySelectorAll('.category-btn');
    
    const observerOptions = {
      root: null,
      rootMargin: '-150px 0px -60% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          
          navButtons.forEach(btn => {
            if (btn.dataset.id === id) {
              btn.classList.add('active');
              btn.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
              });
            } else {
              btn.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);
    
    sections.forEach(section => {
      observer.observe(section);
    });
  };

  // Start loading
  loadMenu();
});

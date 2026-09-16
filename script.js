/* =====================================================================
   PORTFOLIO SCRIPT
   - Animasi background "neural network" (titik-titik terhubung)
   - Navbar: efek saat scroll + menu mobile
   - Slider sertifikat: geser dengan drag mouse, swipe jari,
     tombol kiri/kanan, atau klik titik indikator
   ✏️ File ini biasanya TIDAK perlu diubah, kecuali Anda ingin
      mengubah jumlah titik animasi atau perilaku slider.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------------------
     1. ANIMASI NEURAL NETWORK DI BACKGROUND
     --------------------------------------------------------------- */
  const canvas = document.getElementById("neural-bg");

  if (canvas) {
    const ctx = canvas.getContext("2d");

    let width, height, nodes;
    // ✏️ Ubah angka ini untuk menambah/mengurangi jumlah titik (node)
    const NODE_COUNT = 60;
    const MAX_DISTANCE = 150; // jarak maksimum antar titik agar terhubung garis

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Gerakkan setiap titik
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      // Gambar garis penghubung antar titik yang berdekatan
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DISTANCE) {
            const opacity = 1 - dist / MAX_DISTANCE;
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity * 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Gambar titik
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 212, 255, 0.7)";
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    // Jika pengguna meminta animasi minimal, hentikan animasi berat ini
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    resize();
    createNodes();
    if (!prefersReducedMotion) {
      draw();
    }

    window.addEventListener("resize", () => {
      resize();
      createNodes();
    });
  }

  /* ---------------------------------------------------------------
     2. NAVBAR: efek saat scroll
     --------------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        navbar.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
      } else {
        navbar.style.boxShadow = "none";
      }
    });
  }

  /* ---------------------------------------------------------------
     3. MENU MOBILE (burger button)
     --------------------------------------------------------------- */
  const burger = document.getElementById("burger");
  const links = document.querySelector(".navbar__links");

  if (burger && links) {
    burger.addEventListener("click", () => {
      const isOpen = links.classList.toggle("navbar__links--open");
      burger.setAttribute("aria-expanded", isOpen);
    });

    // Tutup menu mobile setiap kali salah satu link diklik
    document.querySelectorAll(".navbar__links a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("navbar__links--open");
      });
    });
  }

  /* ---------------------------------------------------------------
     4. SLIDER SERTIFIKAT
     Bisa digeser dengan:
     - Drag mouse (klik tahan lalu seret)
     - Swipe jari di HP/tablet
     - Tombol panah kiri/kanan (prevBtn / nextBtn)
     - Klik titik indikator di bawah slider
     --------------------------------------------------------------- */
  const container = document.getElementById("sliderContainer");
  const track = document.getElementById("sliderTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const indicators = document.getElementById("indicators");

  // Jalankan slider HANYA jika semua elemen yang diperlukan ada di halaman.
  // Ini mencegah error yang bisa menghentikan seluruh script.js (termasuk
  // animasi background) jika section sertifikat tidak ada / id berubah.
  if (container && track && indicators) {
    const cards = Array.from(track.querySelectorAll(".cert-card"));
    let currentIndex = 0;
    let cardsPerView = 1;
    let totalSlides = 1;

    // ===== HITUNG JUMLAH KARTU YANG TAMPIL PER LAYAR =====
    function getCardsPerView() {
      if (window.innerWidth < 480) return 1;
      if (window.innerWidth < 768) return 2;
      return 3;
    }

    // ===== JARAK ANTAR KARTU (lebar kartu + gap) =====
    function getStep() {
      if (!cards[0]) return 0;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }

    // ===== BUAT TITIK INDIKATOR =====
    function buildIndicators() {
      indicators.innerHTML = "";
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        dot.classList.add("dot");
        dot.setAttribute("aria-label", `Ke slide ${i + 1}`);
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(i));
        indicators.appendChild(dot);
      }
    }

    function updateActiveDot() {
      indicators.querySelectorAll(".dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
      });
    }

    // ===== PERGI KE SLIDE TERTENTU =====
    function goToSlide(index) {
      if (index < 0) index = 0;
      if (index >= totalSlides) index = totalSlides - 1;
      currentIndex = index;

      const step = getStep();
      container.scrollTo({
        left: currentIndex * cardsPerView * step,
        behavior: "smooth",
      });
      updateActiveDot();
    }

    // ===== SETUP ULANG (dipanggil saat load & resize) =====
    function setup() {
      cardsPerView = getCardsPerView();
      totalSlides = Math.max(1, Math.ceil(cards.length / cardsPerView));
      if (currentIndex >= totalSlides) currentIndex = totalSlides - 1;
      buildIndicators();
      updateActiveDot();
    }

    // ===== TOMBOL PREV / NEXT =====
    if (prevBtn) {
      prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));
    }

    // ===== SINKRONKAN INDIKATOR SAAT USER SCROLL/DRAG MANUAL =====
    let scrollTimeout;
    container.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const step = getStep();
        if (step > 0) {
          const newIndex = Math.round(container.scrollLeft / (cardsPerView * step));
          currentIndex = Math.min(Math.max(newIndex, 0), totalSlides - 1);
          updateActiveDot();
        }
      }, 80);
    });

    // ===== DRAG DENGAN MOUSE (klik tahan lalu seret seperti carousel) =====
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    container.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.pageX;
      startScrollLeft = container.scrollLeft;
      container.style.scrollBehavior = "auto";
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const delta = e.pageX - startX;
      container.scrollLeft = startScrollLeft - delta;
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      container.style.scrollBehavior = "smooth";
    });

    // Swipe jari (touch) sudah didukung otomatis oleh CSS
    // "overflow-x: auto" + "scroll-snap" pada perangkat sentuh,
    // tidak perlu JS tambahan untuk itu.

    // ===== RESPONSIVE: hitung ulang saat ukuran layar berubah =====
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setup, 200);
    });

    // ===== INISIALISASI =====
    setup();
  }

});

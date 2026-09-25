/* ============================================================
   shared-header.js - v6.0
   يضمن أن العنصر الذي يُعدّل هو نفسه في DOM
   + دمج Google Analytics (GA4)
   + تتبع الأحداث المخصصة
   ============================================================ */

(function () {
  'use strict';

  if (window.__SHARED_HEADER_LOADED__) {
    console.warn('⚠️ shared-header.js محمّل مسبقًا');
    return;
  }
  window.__SHARED_HEADER_LOADED__ = true;

  console.log('🚀 shared-header.js v6.0');

  /* ============================================
     📊 Google Analytics (GA4)
     يُحمَّل مرة واحدة فقط في كل الصفحات
  ============================================ */
  (function loadGoogleAnalytics() {
    const GA_ID = 'G-FQHY1BE7EE';

    // تحميل مكتبة Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // تهيئة dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_ID, {
      send_page_view: true,
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    console.log('📊 Google Analytics loaded:', GA_ID);
  })();

  /* ============================================
     🎯 دالة تتبع الأحداث المخصصة
     استخدمها في أي مكان: window.trackEvent('event_name', {...})
  ============================================ */
  window.trackEvent = function (eventName, params = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
      console.log('📊 Event tracked:', eventName, params);
    }
  };

  /* ============================================
     📄 تتبع تحميل كل صفحة (تلقائي)
  ============================================ */
  document.addEventListener('DOMContentLoaded', function () {
    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    window.trackEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pageName
    });
  });

  /* ============================================
     HTML الهيدر + السايدبار
  ============================================ */
  const headerHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <aside class="sidebar-menu" id="sidebarMenu">
      <div class="sidebar-header">
        <div class="brand">
          <i class="fas fa-flask"></i>
          <span>معمل ميدلاب</span>
        </div>
        <button class="sidebar-close" id="sidebarCloseBtn" aria-label="إغلاق" type="button">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <a href="index.html"><i class="fas fa-home"></i><span>الرئيسية</span></a>
        <a href="index.html#services"><i class="fas fa-flask"></i><span>خدماتنا</span></a>
        <a href="appointment.html"><i class="fas fa-calendar-check"></i><span>حجز فحص</span></a>
        <a href="sample-receive.html"><i class="fas fa-file-medical"></i><span>استلام نتيجة</span></a>
        <a href="contact.html"><i class="fas fa-headset"></i><span>خدمة العملاء</span></a>
        <a href="product.html"><i class="fas fa-question-circle"></i><span>إرشادات</span></a>
      </nav>

      <div class="sidebar-footer">© 2026 معمل ميدلاب</div>
    </aside>

    <header class="mobile-header" role="banner">
      <div class="container">
        <button class="menu-toggle" aria-label="فتح/إغلاق القائمة" id="menuToggle" type="button">
          <i class="fas fa-bars" aria-hidden="true"></i>
        </button>

        <div class="header-brand">
          <div class="logo-wrapper">
            <img src="images/logo.png" alt="شعار معمل ميدلاب" class="header-logo">
          </div>
          <h1 class="site-title">معمل ميدلاب</h1>
        </div>

        <nav class="desktop-nav" aria-label="القائمة الرئيسية">
          <ul>
            <li><a href="index.html"><i class="fas fa-home"></i> الرئيسية</a></li>
            <li><a href="index.html#services"><i class="fas fa-flask"></i> خدماتنا</a></li>
            <li><a href="sample-receive.html"><i class="fas fa-file-medical"></i> استلام نتيجة</a></li>
            <li><a href="appointment.html"><i class="fas fa-calendar-check"></i> حجز فحص</a></li>
            <li><a href="contact.html"><i class="fas fa-headset"></i> خدمة العملاء</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <section class="quick-services" aria-label="روابط سريعة">
      <div class="container">
        <div class="quick-service">
          <a href="appointment.html"><i class="fa fa-calendar-check"></i><span>حجز فحص</span></a>
        </div>
        <div class="quick-service">
          <a href="sample-receive.html"><i class="fas fa-file-medical"></i><span>استلام نتيجة</span></a>
        </div>
        <div class="quick-service">
          <a href="contact.html"><i class="fas fa-phone-volume"></i><span>اتصل بنا</span></a>
        </div>
        <div class="quick-service">
          <a href="https://maps.google.com?q=مدينة السادس من اكتوبر الجيزه مصر" target="_blank" rel="noopener">
            <i class="fas fa-map-marker-alt"></i><span>الموقع</span>
          </a>
        </div>
        <div class="quick-service">
          <a href="product.html"><i class="fas fa-question-circle"></i><span>ارشادات</span></a>
        </div>
      </div>
    </section>
  `;

  /* ============================================
     حقن HTML
  ============================================ */
  function injectHeader() {
    if (document.getElementById('site-header')) {
      console.log('ℹ️ الهيدر موجود مسبقًا');
      return;
    }

    const container = document.createElement('div');
    container.id = 'site-header';
    document.body.insertBefore(container, document.body.firstChild);
    container.innerHTML = headerHTML;

    console.log('✅ تم حقن الهيدر');
  }

  /* ============================================
     فتح/إغلاق السايدبار
  ============================================ */
  function openSidebar() {
    const sm = document.getElementById('sidebarMenu');
    const so = document.getElementById('sidebarOverlay');
    if (sm) sm.classList.add('active');
    if (so) so.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('📂 فتح - className:', sm ? sm.className : 'null');
  }

  function closeSidebar() {
    const sm = document.getElementById('sidebarMenu');
    const so = document.getElementById('sidebarOverlay');
    if (sm) sm.classList.remove('active');
    if (so) so.classList.remove('active');
    document.body.style.overflow = '';
    console.log('📁 إغلاق');
  }

  function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    if (!menuToggle) {
      console.warn('⚠️ menuToggle غير موجود');
      return;
    }

    // ربط الحدث مباشرة (بدون cloneNode)
    menuToggle.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🖱️ ضغط على الزر');

      const sm = document.getElementById('sidebarMenu');
      if (!sm) return;

      if (sm.classList.contains('active')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    };

    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    if (sidebarCloseBtn) {
      sidebarCloseBtn.onclick = function (e) {
        e.preventDefault();
        closeSidebar();
      };
    }

    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
      sidebarOverlay.onclick = closeSidebar;
    }

    document.querySelectorAll('.sidebar-nav a').forEach(function (link) {
      link.addEventListener('click', closeSidebar);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const sm = document.getElementById('sidebarMenu');
        if (sm && sm.classList.contains('active')) {
          closeSidebar();
        }
      }
    });

    console.log('✅ السايدبار جاهز');
  }

  /* ============================================
     تفعيل الرابط الحالي
  ============================================ */
  function markActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-nav a, .desktop-nav a').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;
      const cleanHref = href.split('#')[0].split('?')[0];
      if (cleanHref === currentPage) {
        link.classList.add('active');
      }
    });
  }

  /* ============================================
     التهيئة النهائية
  ============================================ */
  function init() {
    injectHeader();
    initSidebar();
    markActiveLink();
    console.log('🎉 الموقع جاهز');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
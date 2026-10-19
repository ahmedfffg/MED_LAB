// js/appointment.js
(function () {
    'use strict';

    /* ============================================
       SUPABASE CLIENT
    ============================================ */
    const SUPABASE_URL = 'https://rlkqifdteyccagpdtdmu.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_XibO6Ri8DLKHG-rUEp4Bnw_bDzm67Xf';

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('✅ Supabase client created:', typeof supabaseClient.from === 'function');

    /* ============================================
       INIT FUNCTION
    ============================================ */
    function initAppointmentSystem() {
        console.log('🚀 Initializing appointment system...');

        const $ = id => document.getElementById(id);

        /* ============================================
           ELEMENTS - MODE SELECTOR
        ============================================ */
        const modeNewPatientBtn = $('mode-new-patient');
        const modeReturningPatientBtn = $('mode-returning-patient');
        const newPatientSection = $('new-patient-section');
        const returningPatientSection = $('returning-patient-section');

        /* ============================================
           ELEMENTS - NEW PATIENT
        ============================================ */
        const searchInput = $('search-input');
        const searchResults = $('search-results');
        const clearSearchBtn = $('clear-search');
        const selectedTestsList = $('selected-tests-list');
        const testsCountEl = $('tests-count');
        const testsTotalEl = $('tests-total');
        const individualTestsTotalEl = $('individual-tests-total');
        const packagePriceRow = $('package-price-row');
        const packagePriceSummaryEl = $('package-price-summary');
        const priceWarningEl = $('price-warning');
        const clearAllBtn = $('clear-all-tests');
        const appointmentForm = $('appointment-form');
        const submitBtn = $('submit-btn');
        const notificationArea = $('notification-area');
        const confirmationEl = $('booking-confirmation');
        const confirmationDetailsEl = $('confirmation-details');
        const confirmationTotalEl = $('confirmation-total');

        const sampleLocationGroup = document.querySelector('.sample-location-group');
        const homeVisitDetails = $('home-visit-details');
        const homeVisitFeeEl = $('home-visit-fee');
        const homeGovernorate = $('home-governorate');
        const homeDistrict = $('home-district');
        const homeArea = $('home-area');
        const homeBuildingNumber = $('home-building-number');
        const homeLandmark = $('home-landmark');

        const packageBanner = $('selected-package-banner');
        const packageNameDisplay = $('package-name-display');
        const packagePriceDisplay = $('package-price-display');
        const packageTestsCount = $('package-tests-count');
        const clearPackageBtn = $('clear-package-btn');

        // Map elements (new patient)
        const locationLatInput = $('location-lat');
        const locationLngInput = $('location-lng');
        const locationUrlInput = $('location-url');

        /* ============================================
           ELEMENTS - RETURNING PATIENT
        ============================================ */
        const patientCodeSearchBox = $('patient-code-search-box');
        const patientCodeInput = $('patient-code-input');
        const searchPatientBtn = $('search-patient-btn');
        const patientFoundCard = $('patient-found-card');
        const patientInfoGrid = $('patient-info-grid');
        const usePatientBtn = $('use-patient-btn');
        const changePatientBtn = $('change-patient-btn');
        const returningPatientForm = $('returning-patient-form');
        const backToSearchBtn = $('back-to-search-btn');

        const returningPatientName = $('returning-patient-name');
        const returningPatientCode = $('returning-patient-code');
        const returningPatientId = $('returning-patient-id');
        const returningFullname = $('returning-fullname');
        const returningPhone = $('returning-phone');
        const returningAge = $('returning-age');
        const returningGender = $('returning-gender');

        const returningDoctor = $('returningDoctor');
        const returningReferralSource = $('returning-referral-source');
        const searchInputReturning = $('search-input-returning');
        const searchResultsReturning = $('search-results-returning');
        const clearSearchReturning = $('clear-search-returning');
        const selectedTestsListReturning = $('selected-tests-list-returning');
        const testsCountReturning = $('tests-count-returning');
        const testsTotalReturning = $('tests-total-returning');
        const individualTestsTotalReturning = $('individual-tests-total-returning');
        const packagePriceRowReturning = $('package-price-row-returning');
        const packagePriceSummaryReturning = $('package-price-summary-returning');
        const priceWarningReturning = $('price-warning-returning');
        const clearAllBtnReturning = $('clear-all-tests-returning');
        const appointmentFormReturning = $('appointment-form-returning');
        const submitBtnReturning = $('submit-btn-returning');
        const packageBannerReturning = $('selected-package-banner-returning');
        const packageNameDisplayReturning = $('package-name-display-returning');
        const packagePriceDisplayReturning = $('package-price-display-returning');
        const packageTestsCountReturning = $('package-tests-count-returning');
        const clearPackageBtnReturning = $('clear-package-btn-returning');

        const sampleLocationGroupReturning = document.querySelector('.sample-location-group-returning');
        const homeVisitDetailsReturning = $('home-visit-details-returning');
        const homeVisitFeeElReturning = $('home-visit-fee-returning');
        const homeGovernorateReturning = $('home-governorate-returning');
        const homeDistrictReturning = $('home-district-returning');
        const homeAreaReturning = $('home-area-returning');
        const homeBuildingNumberReturning = $('home-building-number-returning');
        const homeLandmarkReturning = $('home-landmark-returning');

        // Map elements (returning patient)
        const locationLatInputReturning = $('location-lat-returning');
        const locationLngInputReturning = $('location-lng-returning');
        const locationUrlInputReturning = $('location-url-returning');

        /* ============================================
           STATE
        ============================================ */
        let availableTests = [];
        let selectedTests = [];
        let selectedTestsReturning = [];
        let currentPackage = null;
        let currentPackageReturning = null;
        let currentFilter = 'all';
        let searchTimeout;
        let searchTimeoutReturning;
        let foundPatient = null;
        let currentMode = 'new';

        // Map state (uber-style)
        let mapInstance = null;
        let mapInstanceReturning = null;

        /* ============================================
           HELPERS
        ============================================ */
        function normalize(value) {
            return String(value || '')
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/\s*\(\s*/g, '(')
                .replace(/\s*\)\s*/g, ')')
                .trim();
        }

        function formatMoney(value) {
            return Number(value || 0).toLocaleString('ar-EG');
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function showNotification(message, type) {
            if (!notificationArea) { alert(message); return; }
            const old = notificationArea.querySelectorAll('.notification');
            old.forEach(n => n.remove());

            const notification = document.createElement('div');
            notification.className = 'notification notification-' + (type || 'info');

            const icons = {
                success: 'fa-check-circle',
                error: 'fa-times-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };

            notification.innerHTML =
                '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' +
                escapeHtml(message) + '</span>';

            notificationArea.appendChild(notification);

            setTimeout(() => {
                if (notification.parentNode) notification.remove();
            }, 4500);
        }

        /* ============================================
           UBER-STYLE MAP PICKER
           - الخريطة تفتح على موقع المستخدم (بعد إذنه)
           - الدبوس ثابت في المنتصف
           - المستخدم يحرك الخريطة
           - يظهر العنوان والرابط
           - زر تأكيد الموقع
        ============================================ */
        const DEFAULT_CENTER = [30.0444, 31.2357]; // Cairo fallback

        function initUberMap(opts) {
            const {
                mapId, pinId, statusBarId, myLocationBtnId,
                addressTextId, urlInputId, confirmBtnId,
                latInputId, lngInputId, copyBtnId
            } = opts;

            const mapEl = document.getElementById(mapId);
            if (!mapEl || typeof L === 'undefined') {
                console.warn('⚠️ Map element or Leaflet not found:', mapId);
                return null;
            }

            // ============ Map init ============
            const map = L.map(mapEl, {
                zoomControl: true,
                attributionControl: true
            }).setView(DEFAULT_CENTER, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19
            }).addTo(map);

            // ============ Elements ============
            const pinEl = document.getElementById(pinId);
            const statusBar = document.getElementById(statusBarId);
            const myLocationBtn = document.getElementById(myLocationBtnId);
            const addressTextEl = document.getElementById(addressTextId);
            const urlInput = document.getElementById(urlInputId);
            const confirmBtn = document.getElementById(confirmBtnId);
            const latInput = document.getElementById(latInputId);
            const lngInput = document.getElementById(lngInputId);
            const copyBtn = document.getElementById(copyBtnId);

            // ============ State ============
            let currentCenter = { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };
            let userLocation = null;
            let isConfirmed = false;
            let reverseTimer = null;
            let initialized = false;

            // ============ Helpers ============
            function setStatus(text, type) {
                if (!statusBar) return;
                statusBar.className = 'map-status-bar' + (type ? ' ' + type : '');
                const icon = type === 'loading' ? 'fa-spinner fa-spin'
                            : type === 'success' ? 'fa-check-circle'
                            : type === 'error' ? 'fa-exclamation-triangle'
                            : 'fa-info-circle';
                statusBar.innerHTML = '<i class="fas ' + icon + '"></i><span class="status-text">' + escapeHtml(text) + '</span>';
            }

            function showPinLifted() {
                if (pinEl) pinEl.classList.add('lifted');
            }
            function hidePinLifted() {
                if (pinEl) pinEl.classList.remove('lifted');
            }

            function reverseGeocode(lat, lng) {
                // Nominatim (OpenStreetMap) - مجاني
                const url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=ar&zoom=18';

                fetch(url, { headers: { 'Accept': 'application/json' } })
                .then(r => r.json())
                .then(data => {
                    if (data && data.display_name) {
                        if (addressTextEl) {
                            addressTextEl.textContent = data.display_name;
                            addressTextEl.classList.remove('empty');
                        }
                    } else {
                        if (addressTextEl) {
                            addressTextEl.textContent = 'الإحداثيات: ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
                            addressTextEl.classList.remove('empty');
                        }
                    }
                })
                .catch(() => {
                    if (addressTextEl) {
                        addressTextEl.textContent = 'الإحداثيات: ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
                        addressTextEl.classList.remove('empty');
                    }
                });
            }

            function updateMapCenter() {
                const center = map.getCenter();
                currentCenter = { lat: center.lat, lng: center.lng };

                // نلغي التأكيد السابق لو المستخدم حرّك الخريطة
                if (isConfirmed) {
                    isConfirmed = false;
                    if (confirmBtn) {
                        confirmBtn.classList.remove('confirmed');
                        confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> تأكيد الموقع';
                    }
                }

                if (confirmBtn) confirmBtn.disabled = false;

                // نطلب عنوان المكان (بعد توقف بسيط)
                if (reverseTimer) clearTimeout(reverseTimer);
                reverseTimer = setTimeout(() => {
                    reverseGeocode(currentCenter.lat, currentCenter.lng);
                }, 500);
            }

            // ============ Map events ============
            map.on('movestart', () => {
                showPinLifted();
                setStatus('حرّك الخريطة لتحديد المكان', 'loading');
            });

            map.on('moveend', () => {
                hidePinLifted();
                updateMapCenter();
            });

            map.on('move', () => {
                const center = map.getCenter();
                currentCenter = { lat: center.lat, lng: center.lng };
            });

            // ============ My Location button ============
            if (myLocationBtn) {
                myLocationBtn.addEventListener('click', () => {
                    if (!navigator.geolocation) {
                        setStatus('متصفحك لا يدعم تحديد الموقع', 'error');
                        return;
                    }

                    myLocationBtn.classList.add('locating');
                    setStatus('جاري تحديد موقعك...', 'loading');

                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const lat = pos.coords.latitude;
                            const lng = pos.coords.longitude;
                            userLocation = { lat, lng };
                            map.flyTo([lat, lng], 16, { duration: 1.2 });
                            myLocationBtn.classList.remove('locating');
                            setStatus('تم تحديد موقعك، اضغط تأكيد الموقع', 'success');
                        },
                        (err) => {
                            myLocationBtn.classList.remove('locating');
                            let msg = 'فشل تحديد موقعك';
                            if (err.code === 1) msg = 'الرجاء السماح بالوصول لموقعك من إعدادات المتصفح';
                            else if (err.code === 2) msg = 'تعذر تحديد الموقع، حاول مرة أخرى';
                            else if (err.code === 3) msg = 'انتهت مهلة تحديد الموقع';
                            setStatus(msg, 'error');
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                    );
                });
            }

            // ============ Confirm button ============
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    const lat = currentCenter.lat;
                    const lng = currentCenter.lng;
                    const url = 'https://www.google.com/maps?q=' + lat.toFixed(6) + ',' + lng.toFixed(6);

                    if (latInput) latInput.value = lat.toFixed(6);
                    if (lngInput) lngInput.value = lng.toFixed(6);
                    if (urlInput) urlInput.value = url;

                    isConfirmed = true;
                    confirmBtn.classList.add('confirmed');
                    confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> ✓ تم تأكيد الموقع';
                    setStatus('تم تأكيد الموقع بنجاح', 'success');

                    if (addressTextEl && addressTextEl.classList.contains('empty')) {
                        addressTextEl.textContent = 'الإحداثيات: ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
                        addressTextEl.classList.remove('empty');
                    }
                });
            }

            // ============ Copy button ============
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const val = urlInput ? urlInput.value.trim() : '';
                    if (!val) {
                        setStatus('اضغط "تأكيد الموقع" الأول', 'error');
                        return;
                    }
                    navigator.clipboard.writeText(val).then(() => {
                        const original = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> تم';
                        setTimeout(() => { copyBtn.innerHTML = original; }, 1500);
                    }).catch(() => setStatus('فشل نسخ الرابط', 'error'));
                });
            }

            // ============ Auto-locate on init ============
            function autoLocate() {
                if (!navigator.geolocation) {
                    setStatus('متصفحك لا يدعم تحديد الموقع، حرّك الخريطة يدوياً', 'error');
                    if (confirmBtn) confirmBtn.disabled = false;
                    return;
                }

                setStatus('جاري تحديد موقعك...', 'loading');

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        userLocation = { lat, lng };

                        map.setView([lat, lng], 16);
                        setStatus('تم تحديد موقعك، حرّك الدبوس لو محتاج', 'success');

                        // نطلب عنوان المكان
                        updateMapCenter();
                    },
                    (err) => {
                        let msg = 'حرّك الخريطة يدوياً لتحديد مكان العينة';
                        if (err.code === 1) msg = 'الرجاء السماح بالوصول لموقعك من المتصفح، أو حرّك الخريطة يدوياً';
                        setStatus(msg, 'error');
                        if (confirmBtn) confirmBtn.disabled = false;
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                );
            }

            // نأجل الـ autoLocate لحد ما الـ container يظهر
            setTimeout(() => {
                map.invalidateSize();
                if (!initialized) {
                    initialized = true;
                    autoLocate();
                }
            }, 400);

            // ============ Return API ============
            return {
                map,
                reset: function () {
                    isConfirmed = false;
                    if (confirmBtn) {
                        confirmBtn.classList.remove('confirmed');
                        confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> تأكيد الموقع';
                        confirmBtn.disabled = true;
                    }
                    if (latInput) latInput.value = '';
                    if (lngInput) lngInput.value = '';
                    if (urlInput) urlInput.value = '';
                    if (addressTextEl) {
                        addressTextEl.textContent = 'حرّك الخريطة حتى يقع الدبوس على مكان العينة';
                        addressTextEl.classList.add('empty');
                    }
                    map.setView(DEFAULT_CENTER, 13);
                    setStatus('جاري تحديد موقعك...', 'loading');
                    setTimeout(autoLocate, 300);
                },
                invalidate: function () {
                    setTimeout(() => map.invalidateSize(), 200);
                },
                getUserLocation: () => userLocation,
                isConfirmed: () => isConfirmed
            };
        }

        /* ============================================
           GENERATE CODES
        ============================================ */
        function generateUnifiedCode() {
            const now = new Date();
            const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            return 'WEB-' + datePart + '-' + random;
        }

        function generateBookingPassword() {
            const chars = 'ABCDEFGHJKLMNPQRTUVWXY346789';
            let pwd = '';
            for (let i = 0; i < 8; i++) {
                pwd += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return pwd;
        }

        /* ============================================
           BOOKING MODE SWITCHER
        ============================================ */
        function switchMode(mode) {
            currentMode = mode;

            if (modeNewPatientBtn) modeNewPatientBtn.classList.toggle('active', mode === 'new');
            if (modeReturningPatientBtn) modeReturningPatientBtn.classList.toggle('active', mode === 'returning');

            if (newPatientSection) {
                newPatientSection.classList.toggle('hidden', mode !== 'new');
                newPatientSection.style.display = mode === 'new' ? 'block' : 'none';
            }

            if (returningPatientSection) {
                returningPatientSection.classList.toggle('visible', mode === 'returning');
                returningPatientSection.style.display = mode === 'returning' ? 'block' : 'none';
            }

            if (mode === 'returning') resetReturningPatientSearch();

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (modeNewPatientBtn) {
            modeNewPatientBtn.onclick = function (e) { e.preventDefault(); switchMode('new'); };
        }
        if (modeReturningPatientBtn) {
            modeReturningPatientBtn.onclick = function (e) { e.preventDefault(); switchMode('returning'); };
        }

        /* ============================================
           RETURNING PATIENT - SEARCH BY CODE
        ============================================ */
        function resetReturningPatientSearch() {
            if (patientCodeInput) patientCodeInput.value = '';
            if (patientFoundCard) patientFoundCard.classList.remove('visible');
            if (patientCodeSearchBox) patientCodeSearchBox.style.display = 'block';
            if (returningPatientForm) {
                returningPatientForm.classList.remove('visible');
                returningPatientForm.style.display = 'none';
            }
            foundPatient = null;
        }

        async function searchPatientByCode(code) {
            const cleanCode = String(code || '').trim().toUpperCase();
            if (!cleanCode) {
                showNotification('الرجاء إدخال كود الحجز', 'warning');
                return;
            }

            if (searchPatientBtn) {
                searchPatientBtn.disabled = true;
                searchPatientBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';
            }

            try {
                let data = null;

                // محاولة 1: patients.patient_code
                const a1 = await supabaseClient
                    .from('patients')
                    .select('id, patient_code, full_name, phone, age, gender, birth_date, referral_source, created_at')
                    .ilike('patient_code', cleanCode)
                    .maybeSingle();
                if (a1.data) data = a1.data;

                // محاولة 2: bookings.booking_code → patient
                if (!data) {
                    const a2 = await supabaseClient
                        .from('bookings')
                        .select('id, booking_code, patient_id, patient_name, patient_phone, created_at')
                        .ilike('booking_code', cleanCode)
                        .order('created_at', { ascending: true })
                        .limit(1)
                        .maybeSingle();

                    if (a2.data && a2.data.patient_id) {
                        const p = await supabaseClient
                            .from('patients')
                            .select('id, patient_code, full_name, phone, age, gender, birth_date, referral_source, created_at')
                            .eq('id', a2.data.patient_id)
                            .maybeSingle();
                        if (p.data) data = p.data;
                    }
                }

                // محاولة 3: partial match on patients
                if (!data) {
                    const a3 = await supabaseClient
                        .from('patients')
                        .select('id, patient_code, full_name, phone, age, gender, birth_date, referral_source, created_at')
                        .like('patient_code', '%' + cleanCode + '%')
                        .limit(1)
                        .maybeSingle();
                    if (a3.data) data = a3.data;
                }

                if (!data) {
                    showNotification('لم يتم العثور على حجز بهذا الكود. تأكد من الكود وحاول مرة أخرى.', 'error');
                    if (patientFoundCard) patientFoundCard.classList.remove('visible');
                    foundPatient = null;
                    return;
                }

                foundPatient = data;
                displayFoundPatient(data);
                showNotification('تم العثور على بياناتك بنجاح!', 'success');

            } catch (error) {
                console.error('❌ خطأ في البحث:', error);
                showNotification('حدث خطأ أثناء البحث.', 'error');
                foundPatient = null;
            } finally {
                if (searchPatientBtn) {
                    searchPatientBtn.disabled = false;
                    searchPatientBtn.innerHTML = '<i class="fas fa-search"></i> بحث';
                }
            }
        }

        function calculateAgeFromBirthDate(birthDate) {
            if (!birthDate) return 'غير محدد';
            try {
                const birth = new Date(birthDate);
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                return age + ' سنة';
            } catch (e) { return 'غير محدد'; }
        }

        function displayFoundPatient(patient) {
            if (!patientInfoGrid || !patientFoundCard) return;

            const genderText = patient.gender === 'male' ? 'ذكر'
                             : (patient.gender === 'female' ? 'أنثى' : 'غير محدد');

            let ageText = 'غير محدد';
            if (patient.age !== null && patient.age !== undefined && patient.age !== '') {
                ageText = patient.age + ' سنة';
            } else if (patient.birth_date) {
                ageText = calculateAgeFromBirthDate(patient.birth_date);
            }

            patientInfoGrid.innerHTML =
                '<div class="patient-info-item">' +
                    '<span><i class="fas fa-id-card"></i> كود الحجز</span>' +
                    '<strong>' + escapeHtml(patient.patient_code) + '</strong>' +
                '</div>' +
                '<div class="patient-info-item">' +
                    '<span><i class="fas fa-user"></i> الاسم</span>' +
                    '<strong>' + escapeHtml(patient.full_name) + '</strong>' +
                '</div>' +
                '<div class="patient-info-item">' +
                    '<span><i class="fas fa-phone"></i> رقم الهاتف</span>' +
                    '<strong>' + escapeHtml(patient.phone || 'غير محدد') + '</strong>' +
                '</div>' +
                '<div class="patient-info-item">' +
                    '<span><i class="fas fa-calendar"></i> العمر</span>' +
                    '<strong>' + escapeHtml(ageText) + '</strong>' +
                '</div>' +
                '<div class="patient-info-item">' +
                    '<span><i class="fas fa-venus-mars"></i> الجنس</span>' +
                    '<strong>' + escapeHtml(genderText) + '</strong>' +
                '</div>';

            patientFoundCard.classList.add('visible');
            if (patientCodeSearchBox) patientCodeSearchBox.style.display = 'none';
        }

        if (searchPatientBtn) {
            searchPatientBtn.onclick = function (e) {
                e.preventDefault();
                if (patientCodeInput) searchPatientByCode(patientCodeInput.value);
            };
        }

        if (patientCodeInput) {
            patientCodeInput.onkeypress = function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchPatientByCode(patientCodeInput.value);
                }
            };
        }

        if (changePatientBtn) {
            changePatientBtn.onclick = function (e) {
                e.preventDefault();
                resetReturningPatientSearch();
                if (patientCodeInput) patientCodeInput.focus();
            };
        }

        if (usePatientBtn) {
            usePatientBtn.onclick = function (e) {
                e.preventDefault();
                if (!foundPatient) return;

                if (returningPatientId) returningPatientId.value = foundPatient.id || '';
                if (returningFullname) returningFullname.value = foundPatient.full_name || '';
                if (returningPhone) returningPhone.value = foundPatient.phone || '';
                if (returningAge) returningAge.value = foundPatient.age || '';
                if (returningGender) returningGender.value = foundPatient.gender || '';

                if (returningPatientName) returningPatientName.textContent = foundPatient.full_name;
                if (returningPatientCode) returningPatientCode.textContent = foundPatient.patient_code;

                if (patientFoundCard) patientFoundCard.classList.remove('visible');
                if (patientCodeSearchBox) patientCodeSearchBox.style.display = 'none';
                if (returningPatientSection) {
                    returningPatientSection.classList.remove('visible');
                    returningPatientSection.style.display = 'none';
                }
                if (returningPatientForm) {
                    returningPatientForm.classList.add('visible');
                    returningPatientForm.style.display = 'block';
                }

                loadSelectedPackageForReturning();

                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }

        if (backToSearchBtn) {
            backToSearchBtn.onclick = function (e) {
                e.preventDefault();
                if (returningPatientForm) {
                    returningPatientForm.classList.remove('visible');
                    returningPatientForm.style.display = 'none';
                }
                if (returningPatientSection) {
                    returningPatientSection.classList.add('visible');
                    returningPatientSection.style.display = 'block';
                }
                resetReturningPatientSearch();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }

        /* ============================================
           LOAD TESTS
        ============================================ */
        async function loadTestsFromSource() {
            try {
                const { data, error } = await supabaseClient
                    .from('tests')
                    .select('id, name, price, is_active, category_id, test_categories ( id, name )')
                    .eq('is_active', true)
                    .order('name');

                if (error) throw error;

                availableTests = (data || []).map(test => ({
                    id: test.id,
                    name: test.name,
                    price: test.price === null ? null : Number(test.price),
                    is_active: test.is_active,
                    category_id: test.category_id,
                    category: test.test_categories ? test.test_categories.name : 'تحاليل'
                }));

                if (!availableTests.length) {
                    renderSearchResults([]);
                    renderSearchResultsReturning([]);
                    showNotification('لا توجد تحاليل مسجلة في قاعدة البيانات', 'warning');
                    return false;
                }

                loadSelectedPackage();
                loadSelectedPackageForReturning();
                return true;

            } catch (error) {
                console.error('❌ خطأ في تحميل التحاليل:', error);
                availableTests = [];
                renderSearchResults([]);
                renderSearchResultsReturning([]);
                showNotification('فشل تحميل قائمة التحاليل', 'error');
                return false;
            }
        }

        /* ============================================
           LOAD PACKAGE
        ============================================ */
        async function loadPackageFromSupabase(packageId) {
            if (!packageId) return null;
            try {
                const { data, error } = await supabaseClient
                    .from('packages')
                    .select(`id, name, price, is_active, package_tests ( test_id, sort_order, tests ( id, name, price, is_active ) )`)
                    .eq('id', packageId)
                    .eq('is_active', true)
                    .single();

                if (error) throw error;
                if (!data) return null;

                const packageTests = (data.package_tests || [])
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map(item => item.tests)
                    .filter(Boolean);

                return {
                    id: data.id,
                    name: data.name,
                    price: Number(data.price) || 0,
                    tests: packageTests.map(test => test.name)
                };
            } catch (error) {
                console.error('❌ خطأ في تحميل الباقة:', error);
                return null;
            }
        }

        async function loadSelectedPackage() {
            try {
                const stored = localStorage.getItem('selected_package');
                if (!stored) return false;
                const parsed = JSON.parse(stored);
                if (!parsed || !parsed.name) { localStorage.removeItem('selected_package'); return false; }

                let packageData = null;
                if (parsed.id) packageData = await loadPackageFromSupabase(parsed.id);

                if (!packageData) {
                    packageData = {
                        id: parsed.id || null,
                        name: String(parsed.name),
                        price: Number(parsed.price) || 0,
                        tests: Array.isArray(parsed.tests) ? parsed.tests.map(String) : []
                    };
                }

                currentPackage = packageData;
                displayPackageBanner(currentPackage);
                addPackageTests(currentPackage.tests);
                return true;
            } catch (error) {
                console.warn('❌ خطأ في قراءة الباقة:', error);
                localStorage.removeItem('selected_package');
                return false;
            }
        }

        async function loadSelectedPackageForReturning() {
            try {
                const stored = localStorage.getItem('selected_package');
                if (!stored) return false;
                const parsed = JSON.parse(stored);
                if (!parsed || !parsed.name) { localStorage.removeItem('selected_package'); return false; }

                let packageData = null;
                if (parsed.id) packageData = await loadPackageFromSupabase(parsed.id);

                if (!packageData) {
                    packageData = {
                        id: parsed.id || null,
                        name: String(parsed.name),
                        price: Number(parsed.price) || 0,
                        tests: Array.isArray(parsed.tests) ? parsed.tests.map(String) : []
                    };
                }

                currentPackageReturning = packageData;
                displayPackageBannerReturning(currentPackageReturning);
                addPackageTestsReturning(currentPackageReturning.tests);
                return true;
            } catch (error) {
                console.warn('❌ خطأ في قراءة الباقة:', error);
                localStorage.removeItem('selected_package');
                return false;
            }
        }

        function displayPackageBanner(pkg) {
            if (!packageBanner) return;
            packageBanner.classList.add('visible');
            if (packageNameDisplay) packageNameDisplay.textContent = pkg.name;
            if (packagePriceDisplay) packagePriceDisplay.textContent = formatMoney(pkg.price) + ' جنيه';
            if (packageTestsCount) packageTestsCount.textContent = pkg.tests.length;
        }

        function displayPackageBannerReturning(pkg) {
            if (!packageBannerReturning) return;
            packageBannerReturning.classList.add('visible');
            if (packageNameDisplayReturning) packageNameDisplayReturning.textContent = pkg.name;
            if (packagePriceDisplayReturning) packagePriceDisplayReturning.textContent = formatMoney(pkg.price) + ' جنيه';
            if (packageTestsCountReturning) packageTestsCountReturning.textContent = pkg.tests.length;
        }

        function hidePackageBanner() {
            if (packageBanner) packageBanner.classList.remove('visible');
            currentPackage = null;
            localStorage.removeItem('selected_package');
            updatePriceSummary();
        }

        function hidePackageBannerReturning() {
            if (packageBannerReturning) packageBannerReturning.classList.remove('visible');
            currentPackageReturning = null;
            localStorage.removeItem('selected_package');
            updatePriceSummaryReturning();
        }

        /* ============================================
           PACKAGE TEST MATCHING
        ============================================ */
        function packageTestMatches(test, requestedName) {
            const a = normalize(test.name);
            const b = normalize(requestedName);
            if (a === b || a.includes(b) || b.includes(a)) return true;

            const aliases = {
                'cbc': ['cbc', 'صورة دم كاملة', 'صوره دم كامله', 'complete blood count'],
                'fbs': ['fbs', 'سكر صائم', 'fasting blood sugar', 'fasting glucose'],
                'hba1c': ['hba1c', 'السكر التراكمي', 'سكر تراكمي'],
                'cholesterol': ['cholesterol', 'كوليسترول', 'الكوليسترول'],
                'hdl': ['hdl'],
                'ldl': ['ldl'],
                'triglycerides': ['triglycerides', 'tg', 'دهون ثلاثية', 'الدهون الثلاثية'],
                'creatinine': ['creatinine', 'كرياتينين'],
                'urea': ['urea', 'يوريا'],
                'uric acid': ['uric acid', 'حمض اليوريك', 'اليوريك اسيد'],
                'alt': ['alt', 'sgpt'],
                'ast': ['ast', 'sgot'],
                'bilirubin total': ['bilirubin total', 'total bilirubin', 'بيليروبين كلي', 'البيليروبين الكلي'],
                'bilirubin direct': ['bilirubin direct', 'direct bilirubin', 'بيليروبين مباشر', 'البيليروبين المباشر'],
                'albumin': ['albumin', 'البيومين', 'ألبومين'],
                'urine analysis': ['urine analysis', 'urinalysis', 'تحليل بول', 'بول كامل'],
                'stool analysis': ['stool analysis', 'تحليل براز', 'براز كامل'],
                'h.pylori': ['h pylori', 'h. pylori', 'جرثومة المعدة', 'هيليكوباكتر'],
                'occult blood in stool': ['occult blood', 'دم خفي في البراز', 'الدم الخفي في البراز'],
                'microalbumin': ['microalbumin', 'micro albumin', 'ميكروالبومين', 'ميكرو ألبومين'],
                'tsh': ['tsh', 'thyroid stimulating hormone'],
                'free t3': ['free t3', 'ft3', 't3'],
                'free t4': ['free t4', 'ft4', 't4'],
                'vitamin d': ['vitamin d', '25 oh vitamin d', 'فيتامين d', 'فيتامين د'],
                'vitamin b12': ['vitamin b12', 'b12', 'فيتامين b12', 'فيتامين ب12'],
                'ferritin': ['ferritin', 'مخزون الحديد', 'الفيريتين']
            };

            const list = aliases[b] || [];
            return list.some(alias => {
                const x = normalize(alias);
                return (a === x || a.includes(x) || x.includes(a));
            });
        }

        function addPackageTests(testNames) {
            if (!currentPackage) return;
            const matchedTests = [];
            const notFound = [];

            testNames.forEach(testName => {
                const found = availableTests.find(test => packageTestMatches(test, testName));
                if (found) {
                    if (!selectedTests.some(t => t.id === found.id)) {
                        matchedTests.push({ ...found, isPackageTest: true, packageName: currentPackage.name });
                    } else {
                        const existing = selectedTests.find(t => t.id === found.id);
                        existing.isPackageTest = true;
                        existing.packageName = currentPackage.name;
                    }
                } else notFound.push(testName);
            });

            matchedTests.forEach(test => selectedTests.push(test));
            renderSelectedTests();
            updatePriceSummary();
            if (notFound.length) showNotification('بعض تحاليل الباقة غير موجودة: ' + notFound.join(', '), 'warning');
        }

        function addPackageTestsReturning(testNames) {
            if (!currentPackageReturning) return;
            const matchedTests = [];
            const notFound = [];

            testNames.forEach(testName => {
                const found = availableTests.find(test => packageTestMatches(test, testName));
                if (found) {
                    if (!selectedTestsReturning.some(t => t.id === found.id)) {
                        matchedTests.push({ ...found, isPackageTest: true, packageName: currentPackageReturning.name });
                    } else {
                        const existing = selectedTestsReturning.find(t => t.id === found.id);
                        existing.isPackageTest = true;
                        existing.packageName = currentPackageReturning.name;
                    }
                } else notFound.push(testName);
            });

            matchedTests.forEach(test => selectedTestsReturning.push(test));
            renderSelectedTestsReturning();
            updatePriceSummaryReturning();
            if (notFound.length) showNotification('بعض تحاليل الباقة غير موجودة: ' + notFound.join(', '), 'warning');
        }

        function clearPackage() {
            selectedTests = selectedTests.filter(test => !test.isPackageTest);
            hidePackageBanner();
            renderSelectedTests();
            updatePriceSummary();
            showNotification('تم إلغاء الباقة المختارة', 'info');
        }

        function clearPackageReturning() {
            selectedTestsReturning = selectedTestsReturning.filter(test => !test.isPackageTest);
            hidePackageBannerReturning();
            renderSelectedTestsReturning();
            updatePriceSummaryReturning();
            showNotification('تم إلغاء الباقة المختارة', 'info');
        }

        if (clearPackageBtn) clearPackageBtn.onclick = clearPackage;
        if (clearPackageBtnReturning) clearPackageBtnReturning.onclick = clearPackageReturning;

        /* ============================================
           SEARCH
        ============================================ */
        function categoryTerms(category) {
            const groups = {
                'وظائف الكلى': ['وظائف الكلى', 'كلى', 'kidney', 'renal', 'urea', 'creatinine', 'uric acid', 'microalbumin'],
                'وظائف الكبد': ['وظائف الكبد', 'كبد', 'liver', 'alt', 'ast', 'alp', 'bilirubin', 'albumin'],
                'الدهون': ['الدهون', 'دهون', 'lipid', 'cholesterol', 'hdl', 'ldl', 'triglycerides', 'tg'],
                'السكر': ['السكر', 'سكر', 'glucose', 'diabetes', 'fbs', 'hba1c'],
                'الغدة الدرقية': ['الغدة الدرقية', 'غدة درقية', 'thyroid', 'tsh', 'free t3', 'free t4'],
                'الفيتامينات': ['الفيتامينات', 'فيتامين', 'vitamin'],
                'دم كامل': ['دم كامل', 'صورة دم', 'cbc', 'blood'],
                'بول': ['بول', 'urine', 'urinalysis'],
                'براز': ['براز', 'stool', 'feces', 'occult blood']
            };
            return groups[category] || [category];
        }

        function testMatchesCategory(test, category) {
            const haystack = normalize([test.name, test.category].filter(Boolean).join(' '));
            return categoryTerms(category).some(term => haystack.includes(normalize(term)));
        }

        function searchTests(query, filter) {
            if (!availableTests.length) return [];
            const q = normalize(query);
            let results = availableTests;

            if (filter && filter !== 'all') {
                results = results.filter(test => testMatchesCategory(test, filter));
            }

            if (q) {
                results = results.filter(test => {
                    const haystack = normalize([test.name, test.category].filter(Boolean).join(' '));
                    return haystack.includes(q) || categoryTerms(query).some(term => haystack.includes(normalize(term)));
                });
            }

            return results;
        }

        function renderSearchResults(results) {
            if (!searchResults) return;
            searchResults.innerHTML = '';
            searchResults.classList.add('active');

            if (!results || !results.length) {
                searchResults.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>لا توجد نتائج مطابقة للبحث</p></div>';
                return;
            }

            results.forEach(test => {
                const item = document.createElement('div');
                item.className = 'result-item';

                const isAdded = selectedTests.some(t => t.id === test.id);
                const info = document.createElement('div');
                info.className = 'test-info';
                info.innerHTML = '<span class="test-name">' + escapeHtml(test.name) + '</span>' +
                    '<span class="test-category"><i class="fas fa-folder"></i> ' + escapeHtml(test.category || 'تحاليل') + '</span>';

                const priceEl = document.createElement('span');
                priceEl.className = 'test-price';
                priceEl.textContent = Number.isFinite(test.price) ? formatMoney(test.price) + ' جنيه' : 'السعر غير مسجل';

                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'add-btn' + (isAdded ? ' added' : '');
                addBtn.innerHTML = isAdded ? '<i class="fas fa-check"></i>' : '<i class="fas fa-plus"></i>';
                addBtn.onclick = function (e) { e.stopPropagation(); toggleTest(test); };

                item.onclick = function () { toggleTest(test); };
                item.append(info, priceEl, addBtn);
                searchResults.appendChild(item);
            });
        }

        function renderSearchResultsReturning(results) {
            if (!searchResultsReturning) return;
            searchResultsReturning.innerHTML = '';
            searchResultsReturning.classList.add('active');

            if (!results || !results.length) {
                searchResultsReturning.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>لا توجد نتائج مطابقة للبحث</p></div>';
                return;
            }

            results.forEach(test => {
                const item = document.createElement('div');
                item.className = 'result-item';
                const isAdded = selectedTestsReturning.some(t => t.id === test.id);

                const info = document.createElement('div');
                info.className = 'test-info';
                info.innerHTML = '<span class="test-name">' + escapeHtml(test.name) + '</span>' +
                    '<span class="test-category"><i class="fas fa-folder"></i> ' + escapeHtml(test.category || 'تحاليل') + '</span>';

                const priceEl = document.createElement('span');
                priceEl.className = 'test-price';
                priceEl.textContent = Number.isFinite(test.price) ? formatMoney(test.price) + ' جنيه' : 'السعر غير مسجل';

                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'add-btn' + (isAdded ? ' added' : '');
                addBtn.innerHTML = isAdded ? '<i class="fas fa-check"></i>' : '<i class="fas fa-plus"></i>';
                addBtn.onclick = function (e) { e.stopPropagation(); toggleTestReturning(test); };

                item.onclick = function () { toggleTestReturning(test); };
                item.append(info, priceEl, addBtn);
                searchResultsReturning.appendChild(item);
            });
        }

        function toggleTest(test) {
            const index = selectedTests.findIndex(t => t.id === test.id);
            if (index > -1) {
                if (selectedTests[index].isPackageTest) {
                    showNotification('هذا التحليل تابع للباقة ولا يمكن حذفه منفردًا', 'warning');
                    return;
                }
                selectedTests.splice(index, 1);
                showNotification('تم إزالة "' + test.name + '"', 'info');
            } else {
                selectedTests.push({ ...test, isPackageTest: false });
                showNotification('تم إضافة "' + test.name + '"', 'success');
            }
            renderSelectedTests();
            updatePriceSummary();
            applyCurrentSearch();
        }

        function toggleTestReturning(test) {
            const index = selectedTestsReturning.findIndex(t => t.id === test.id);
            if (index > -1) {
                if (selectedTestsReturning[index].isPackageTest) {
                    showNotification('هذا التحليل تابع للباقة ولا يمكن حذفه منفردًا', 'warning');
                    return;
                }
                selectedTestsReturning.splice(index, 1);
                showNotification('تم إزالة "' + test.name + '"', 'info');
            } else {
                selectedTestsReturning.push({ ...test, isPackageTest: false });
                showNotification('تم إضافة "' + test.name + '"', 'success');
            }
            renderSelectedTestsReturning();
            updatePriceSummaryReturning();
            applyCurrentSearchReturning();
        }

        function renderSelectedTests() {
            if (!selectedTestsList) return;
            selectedTestsList.innerHTML = '';

            if (!selectedTests.length) {
                selectedTestsList.innerHTML = '<div class="selected-empty"><i class="fas fa-plus-circle"></i> لم يتم اختيار أي تحاليل بعد</div>';
                return;
            }

            selectedTests.forEach(test => {
                const row = document.createElement('div');
                row.className = 'selected-test' + (test.isPackageTest ? ' package-test' : '');

                const info = document.createElement('div');
                info.className = 'selected-test-info';

                const name = document.createElement('span');
                name.className = 'selected-test-name';
                name.textContent = test.name;

                const price = document.createElement('span');
                price.className = 'selected-test-price';

                if (test.isPackageTest) {
                    price.className += ' package-test-badge';
                    price.innerHTML = '<i class="fas fa-gift"></i> ضمن الباقة — بدون سعر منفصل';
                } else {
                    price.textContent = Number.isFinite(test.price) ? formatMoney(test.price) + ' جنيه' : 'السعر غير مسجل';
                }

                info.append(name, price);

                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'remove-test';

                if (test.isPackageTest) {
                    remove.innerHTML = '<i class="fas fa-lock"></i>';
                    remove.title = 'تحليل تابع للباقة';
                    remove.disabled = true;
                    remove.style.opacity = '0.55';
                    remove.style.cursor = 'not-allowed';
                } else {
                    remove.innerHTML = '<i class="fas fa-times"></i>';
                    remove.title = 'حذف التحليل';
                    remove.onclick = function (e) {
                        e.stopPropagation();
                        selectedTests = selectedTests.filter(t => t.id !== test.id);
                        renderSelectedTests();
                        updatePriceSummary();
                        applyCurrentSearch();
                        showNotification('تم إزالة "' + test.name + '"', 'info');
                    };
                }

                row.append(info, remove);
                selectedTestsList.appendChild(row);
            });
        }

        function renderSelectedTestsReturning() {
            if (!selectedTestsListReturning) return;
            selectedTestsListReturning.innerHTML = '';

            if (!selectedTestsReturning.length) {
                selectedTestsListReturning.innerHTML = '<div class="selected-empty"><i class="fas fa-plus-circle"></i> لم يتم اختيار أي تحاليل بعد</div>';
                return;
            }

            selectedTestsReturning.forEach(test => {
                const row = document.createElement('div');
                row.className = 'selected-test' + (test.isPackageTest ? ' package-test' : '');

                const info = document.createElement('div');
                info.className = 'selected-test-info';

                const name = document.createElement('span');
                name.className = 'selected-test-name';
                name.textContent = test.name;

                const price = document.createElement('span');
                price.className = 'selected-test-price';

                if (test.isPackageTest) {
                    price.className += ' package-test-badge';
                    price.innerHTML = '<i class="fas fa-gift"></i> ضمن الباقة — بدون سعر منفصل';
                } else {
                    price.textContent = Number.isFinite(test.price) ? formatMoney(test.price) + ' جنيه' : 'السعر غير مسجل';
                }

                info.append(name, price);

                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'remove-test';

                if (test.isPackageTest) {
                    remove.innerHTML = '<i class="fas fa-lock"></i>';
                    remove.disabled = true;
                    remove.style.opacity = '0.55';
                    remove.style.cursor = 'not-allowed';
                } else {
                    remove.innerHTML = '<i class="fas fa-times"></i>';
                    remove.onclick = function (e) {
                        e.stopPropagation();
                        selectedTestsReturning = selectedTestsReturning.filter(t => t.id !== test.id);
                        renderSelectedTestsReturning();
                        updatePriceSummaryReturning();
                        applyCurrentSearchReturning();
                        showNotification('تم إزالة "' + test.name + '"', 'info');
                    };
                }

                row.append(info, remove);
                selectedTestsListReturning.appendChild(row);
            });
        }

        function updatePriceSummary() {
            const packagePrice = currentPackage ? Number(currentPackage.price) || 0 : 0;
            const individualTests = selectedTests.filter(test => !test.isPackageTest);
            const individualTotal = individualTests.reduce((sum, test) => sum + (Number.isFinite(test.price) ? Number(test.price) : 0), 0);
            const missing = individualTests.filter(test => !Number.isFinite(test.price)).length;
            const total = packagePrice + individualTotal;

            if (testsCountEl) testsCountEl.textContent = selectedTests.length;
            if (packagePriceRow) packagePriceRow.style.display = currentPackage ? 'flex' : 'none';
            if (packagePriceSummaryEl) packagePriceSummaryEl.textContent = formatMoney(packagePrice) + ' جنيه';
            if (individualTestsTotalEl) individualTestsTotalEl.textContent = formatMoney(individualTotal) + ' جنيه';
            if (testsTotalEl) testsTotalEl.textContent = formatMoney(total);
            if (priceWarningEl) priceWarningEl.style.display = missing ? 'flex' : 'none';
        }

        function updatePriceSummaryReturning() {
            const packagePrice = currentPackageReturning ? Number(currentPackageReturning.price) || 0 : 0;
            const individualTests = selectedTestsReturning.filter(test => !test.isPackageTest);
            const individualTotal = individualTests.reduce((sum, test) => sum + (Number.isFinite(test.price) ? Number(test.price) : 0), 0);
            const missing = individualTests.filter(test => !Number.isFinite(test.price)).length;
            const total = packagePrice + individualTotal;

            if (testsCountReturning) testsCountReturning.textContent = selectedTestsReturning.length;
            if (packagePriceRowReturning) packagePriceRowReturning.style.display = currentPackageReturning ? 'flex' : 'none';
            if (packagePriceSummaryReturning) packagePriceSummaryReturning.textContent = formatMoney(packagePrice) + ' جنيه';
            if (individualTestsTotalReturning) individualTestsTotalReturning.textContent = formatMoney(individualTotal) + ' جنيه';
            if (testsTotalReturning) testsTotalReturning.textContent = formatMoney(total);
            if (priceWarningReturning) priceWarningReturning.style.display = missing ? 'flex' : 'none';
        }

        function applyCurrentSearch() {
            if (!searchInput || !searchResults) return;
            const query = searchInput.value.trim();
            if ((query || currentFilter !== 'all') && availableTests.length) {
                renderSearchResults(searchTests(query, currentFilter));
            } else searchResults.classList.remove('active');
        }

        function applyCurrentSearchReturning() {
            if (!searchInputReturning || !searchResultsReturning) return;
            const query = searchInputReturning.value.trim();
            if ((query || currentFilter !== 'all') && availableTests.length) {
                renderSearchResultsReturning(searchTests(query, currentFilter));
            } else searchResultsReturning.classList.remove('active');
        }

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                clearTimeout(searchTimeout);
                const query = this.value.trim();
                if (clearSearchBtn) clearSearchBtn.classList.toggle('visible', query.length > 0);
                if (!query && currentFilter === 'all') {
                    searchResults.classList.remove('active');
                    return;
                }
                searchTimeout = setTimeout(() => renderSearchResults(searchTests(query, currentFilter)), 150);
            });
        }

        if (searchInputReturning) {
            searchInputReturning.addEventListener('input', function () {
                clearTimeout(searchTimeoutReturning);
                const query = this.value.trim();
                if (clearSearchReturning) clearSearchReturning.classList.toggle('visible', query.length > 0);
                if (!query && currentFilter === 'all') {
                    searchResultsReturning.classList.remove('active');
                    return;
                }
                searchTimeoutReturning = setTimeout(() => renderSearchResultsReturning(searchTests(query, currentFilter)), 150);
            });
        }

        document.addEventListener('click', function (e) {
            if (searchResults && searchInput && !searchResults.contains(e.target) && e.target !== searchInput) {
                searchResults.classList.remove('active');
            }
            if (searchResultsReturning && searchInputReturning && !searchResultsReturning.contains(e.target) && e.target !== searchInputReturning) {
                searchResultsReturning.classList.remove('active');
            }
        });

        if (clearSearchBtn) {
            clearSearchBtn.onclick = function () {
                if (searchInput) { searchInput.value = ''; searchInput.focus(); }
                if (searchResults) searchResults.classList.remove('active');
                this.classList.remove('visible');
            };
        }

        if (clearSearchReturning) {
            clearSearchReturning.onclick = function () {
                if (searchInputReturning) { searchInputReturning.value = ''; searchInputReturning.focus(); }
                if (searchResultsReturning) searchResultsReturning.classList.remove('active');
                this.classList.remove('visible');
            };
        }

        if (clearAllBtn) {
            clearAllBtn.onclick = function () {
                if (!selectedTests.length) { showNotification('لا توجد تحاليل لحذفها', 'warning'); return; }
                if (currentPackage && !confirm('سيتم حذف جميع التحاليل بما فيها تحاليل الباقة المختارة. هل أنت متأكد؟')) return;
                selectedTests = [];
                if (currentPackage) hidePackageBanner();
                renderSelectedTests();
                updatePriceSummary();
                applyCurrentSearch();
                showNotification('تم حذف كل التحاليل المختارة', 'info');
            };
        }

        if (clearAllBtnReturning) {
            clearAllBtnReturning.onclick = function () {
                if (!selectedTestsReturning.length) { showNotification('لا توجد تحاليل لحذفها', 'warning'); return; }
                if (currentPackageReturning && !confirm('سيتم حذف جميع التحاليل بما فيها تحاليل الباقة المختارة. هل أنت متأكد؟')) return;
                selectedTestsReturning = [];
                if (currentPackageReturning) hidePackageBannerReturning();
                renderSelectedTestsReturning();
                updatePriceSummaryReturning();
                applyCurrentSearchReturning();
                showNotification('تم حذف كل التحاليل المختارة', 'info');
            };
        }

        /* ============================================
           SAMPLE LOCATION - NEW PATIENT
        ============================================ */
        document.querySelectorAll('input[name="sample-location"]').forEach(radio => {
            radio.addEventListener('change', function () {
                if (sampleLocationGroup) sampleLocationGroup.classList.remove('is-invalid');
                updateHomeVisitUI();
            });
        });

        function updateHomeVisitUI() {
            const selected = document.querySelector('input[name="sample-location"]:checked');
            const isHome = selected && (selected.value === 'عينة منزلية' || selected.value === 'home');

            if (homeVisitDetails) homeVisitDetails.style.display = isHome ? 'block' : 'none';

            if (isHome) {
                if (!mapInstance) {
                    setTimeout(() => {
                        const api = initUberMap({
                            mapId: 'map',
                            pinId: 'map-center-pin',
                            statusBarId: 'map-status-bar',
                            myLocationBtnId: 'map-my-location-btn',
                            addressTextId: 'map-address-text',
                            urlInputId: 'location-url',
                            confirmBtnId: 'btn-confirm-location',
                            latInputId: 'location-lat',
                            lngInputId: 'location-lng',
                            copyBtnId: 'copy-location-url'
                        });
                        if (api) mapInstance = api;
                    }, 250);
                } else {
                    mapInstance.invalidate();
                }
            }

            if (!isHome) {
                if (homeVisitFeeEl) { homeVisitFeeEl.style.display = 'none'; homeVisitFeeEl.textContent = ''; }
                return;
            }

            const area = homeArea ? homeArea.value.trim() : '';
            if (homeVisitFeeEl) {
                if (area === 'الحي الحداشر') {
                    homeVisitFeeEl.style.display = 'block';
                    homeVisitFeeEl.innerHTML = '<i class="fas fa-house-chimney"></i> رسوم العينة المنزلية: <strong>100 جنيه</strong>';
                } else if (area === 'خارج الحي الحداشر') {
                    homeVisitFeeEl.style.display = 'block';
                    homeVisitFeeEl.innerHTML = '<i class="fas fa-route"></i> رسوم الانتقال: <strong>تُحدد حسب المسافة والمكان</strong>';
                } else {
                    homeVisitFeeEl.style.display = 'none';
                    homeVisitFeeEl.textContent = '';
                }
            }
        }

        if (homeArea) {
            homeArea.addEventListener('change', updateHomeVisitUI);
            homeArea.addEventListener('input', updateHomeVisitUI);
        }

        /* ============================================
           SAMPLE LOCATION - RETURNING PATIENT
        ============================================ */
        document.querySelectorAll('input[name="sample-location-returning"]').forEach(radio => {
            radio.addEventListener('change', function () {
                if (sampleLocationGroupReturning) sampleLocationGroupReturning.classList.remove('is-invalid');
                updateHomeVisitUIReturning();
            });
        });

        function updateHomeVisitUIReturning() {
            const selected = document.querySelector('input[name="sample-location-returning"]:checked');
            const isHome = selected && (selected.value === 'عينة منزلية' || selected.value === 'home');

            if (homeVisitDetailsReturning) homeVisitDetailsReturning.style.display = isHome ? 'block' : 'none';

            if (isHome) {
                if (!mapInstanceReturning) {
                    setTimeout(() => {
                        const api = initUberMap({
                            mapId: 'map-returning',
                            pinId: 'map-center-pin-returning',
                            statusBarId: 'map-status-bar-returning',
                            myLocationBtnId: 'map-my-location-btn-returning',
                            addressTextId: 'map-address-text-returning',
                            urlInputId: 'location-url-returning',
                            confirmBtnId: 'btn-confirm-location-returning',
                            latInputId: 'location-lat-returning',
                            lngInputId: 'location-lng-returning',
                            copyBtnId: 'copy-location-url-returning'
                        });
                        if (api) mapInstanceReturning = api;
                    }, 250);
                } else {
                    mapInstanceReturning.invalidate();
                }
            }

            if (!isHome) {
                if (homeVisitFeeElReturning) { homeVisitFeeElReturning.style.display = 'none'; homeVisitFeeElReturning.textContent = ''; }
                return;
            }

            const area = homeAreaReturning ? homeAreaReturning.value.trim() : '';
            if (homeVisitFeeElReturning) {
                if (area === 'الحي الحداشر') {
                    homeVisitFeeElReturning.style.display = 'block';
                    homeVisitFeeElReturning.innerHTML = '<i class="fas fa-house-chimney"></i> رسوم العينة المنزلية: <strong>100 جنيه</strong>';
                } else if (area === 'خارج الحي الحداشر') {
                    homeVisitFeeElReturning.style.display = 'block';
                    homeVisitFeeElReturning.innerHTML = '<i class="fas fa-route"></i> رسوم الانتقال: <strong>تُحدد حسب المسافة والمكان</strong>';
                } else {
                    homeVisitFeeElReturning.style.display = 'none';
                    homeVisitFeeElReturning.textContent = '';
                }
            }
        }

        if (homeAreaReturning) {
            homeAreaReturning.addEventListener('change', updateHomeVisitUIReturning);
            homeAreaReturning.addEventListener('input', updateHomeVisitUIReturning);
        }

        /* ============================================
           VALIDATION
        ============================================ */
        function validateForm() {
            let valid = true;
            const required = ['fullname', 'phone', 'date', 'time', 'referringDoctor', 'referral-source'];

            required.forEach(id => {
                const field = $(id);
                const empty = !field || !String(field.value).trim();
                if (field) field.classList.toggle('is-invalid', empty);
                if (empty) valid = false;
            });

            const sampleLocation = document.querySelector('input[name="sample-location"]:checked');
            if (sampleLocationGroup) sampleLocationGroup.classList.toggle('is-invalid', !sampleLocation);
            if (!sampleLocation) valid = false;

            const isHome = sampleLocation && (sampleLocation.value === 'عينة منزلية' || sampleLocation.value === 'home');

            if (isHome) {
                [homeGovernorate, homeDistrict, homeArea, homeBuildingNumber, homeLandmark].forEach(field => {
                    if (!field) return;
                    const missing = !String(field.value || '').trim();
                    field.classList.toggle('is-invalid', missing);
                    if (missing) valid = false;
                });
            } else {
                [homeGovernorate, homeDistrict, homeArea, homeBuildingNumber, homeLandmark].forEach(field => {
                    if (field) field.classList.remove('is-invalid');
                });
            }

            const phone = $('phone');
            if (phone) {
                const phoneValue = phone.value.replace(/\D/g, '');
                const ok = /^01\d{9}$/.test(phoneValue);
                if (!ok) { phone.classList.add('is-invalid'); valid = false; }
                else phone.classList.remove('is-invalid');
            }

            if (!selectedTests.length) {
                showNotification('الرجاء اختيار تحليل واحد على الأقل', 'error');
                valid = false;
            }

            return valid;
        }

        function validateFormReturning() {
            let valid = true;
            const required = ['returningDoctor', 'date-returning', 'time-returning', 'returning-referral-source'];

            required.forEach(id => {
                const field = $(id);
                const empty = !field || !String(field.value).trim();
                if (field) field.classList.toggle('is-invalid', empty);
                if (empty) valid = false;
            });

            const sampleLocation = document.querySelector('input[name="sample-location-returning"]:checked');
            if (sampleLocationGroupReturning) sampleLocationGroupReturning.classList.toggle('is-invalid', !sampleLocation);
            if (!sampleLocation) valid = false;

            const isHome = sampleLocation && (sampleLocation.value === 'عينة منزلية' || sampleLocation.value === 'home');

            if (isHome) {
                [homeGovernorateReturning, homeDistrictReturning, homeAreaReturning, homeBuildingNumberReturning, homeLandmarkReturning].forEach(field => {
                    if (!field) return;
                    const missing = !String(field.value || '').trim();
                    field.classList.toggle('is-invalid', missing);
                    if (missing) valid = false;
                });
            } else {
                [homeGovernorateReturning, homeDistrictReturning, homeAreaReturning, homeBuildingNumberReturning, homeLandmarkReturning].forEach(field => {
                    if (field) field.classList.remove('is-invalid');
                });
            }

            if (!selectedTestsReturning.length) {
                showNotification('الرجاء اختيار تحليل واحد على الأقل', 'error');
                valid = false;
            }

            return valid;
        }

        /* ============================================
           COLLECT DATA - NEW PATIENT
        ============================================ */
        function collectBookingData() {
            const packagePrice = currentPackage ? Number(currentPackage.price) || 0 : 0;
            const individualTests = selectedTests.filter(test => !test.isPackageTest);
            const individualTestsTotal = individualTests.reduce((sum, test) => sum + (Number.isFinite(test.price) ? Number(test.price) : 0), 0);
            const testsTotal = packagePrice + individualTestsTotal;

            const selected = document.querySelector('input[name="sample-location"]:checked');
            const isHome = selected && (selected.value === 'عينة منزلية' || selected.value === 'home');
            const location = isHome ? 'home' : 'lab';
            const area = homeArea ? homeArea.value.trim() : '';

            let homeVisitFee = 0;
            let feeStatus = 'pending';
            if (location === 'home') {
                if (area === 'الحي الحداشر') { homeVisitFee = 100; feeStatus = 'confirmed'; }
                else { homeVisitFee = 0; feeStatus = 'pending'; }
            }

            return {
                name: $('fullname') ? $('fullname').value.trim() : '',
                phone: $('phone') ? $('phone').value.trim() : '',
                age: $('age') && $('age').value ? Number($('age').value) : null,
                gender: $('gender') && $('gender').value ? $('gender').value : null,
                referral: $('referral-source') ? $('referral-source').value : '',
                referringDoctor: $('referringDoctor') ? $('referringDoctor').value.trim() : '',
                sampleLocation: location,
                sampleLocationDisplay: isHome ? 'عينة منزلية' : 'عينة في المعمل',
                sampleArea: area,
                homeGovernorate: homeGovernorate ? homeGovernorate.value : '',
                homeDistrict: homeDistrict ? homeDistrict.value.trim() : '',
                homeDetailedArea: homeArea ? homeArea.value.trim() : '',
                homeBuildingNumber: homeBuildingNumber ? homeBuildingNumber.value.trim() : '',
                homeLandmark: homeLandmark ? homeLandmark.value.trim() : '',
                homeVisitFee,
                homeVisitFeeStatus: feeStatus,
                locationLat: locationLatInput ? (parseFloat(locationLatInput.value) || null) : null,
                locationLng: locationLngInput ? (parseFloat(locationLngInput.value) || null) : null,
                locationUrl: locationUrlInput ? (locationUrlInput.value.trim() || null) : null,
                date: $('date') ? $('date').value : '',
                time: $('time') ? $('time').value : '',
                notes: $('notes') ? $('notes').value.trim() : '',
                tests: [...selectedTests],
                testsTotal,
                individualTestsTotal,
                packagePrice,
                total: testsTotal + homeVisitFee,
                missing: individualTests.some(t => !Number.isFinite(t.price)),
                package: currentPackage ? { id: currentPackage.id || null, name: currentPackage.name, price: packagePrice, tests: [...currentPackage.tests] } : null
            };
        }

        function collectBookingDataReturning() {
            const packagePrice = currentPackageReturning ? Number(currentPackageReturning.price) || 0 : 0;
            const individualTests = selectedTestsReturning.filter(test => !test.isPackageTest);
            const individualTestsTotal = individualTests.reduce((sum, test) => sum + (Number.isFinite(test.price) ? Number(test.price) : 0), 0);
            const testsTotal = packagePrice + individualTestsTotal;

            const selected = document.querySelector('input[name="sample-location-returning"]:checked');
            const isHome = selected && (selected.value === 'عينة منزلية' || selected.value === 'home');
            const location = isHome ? 'home' : 'lab';
            const area = homeAreaReturning ? homeAreaReturning.value.trim() : '';

            let homeVisitFee = 0;
            let feeStatus = 'pending';
            if (location === 'home') {
                if (area === 'الحي الحداشر') { homeVisitFee = 100; feeStatus = 'confirmed'; }
                else { homeVisitFee = 0; feeStatus = 'pending'; }
            }

            return {
                patientId: returningPatientId ? returningPatientId.value : null,
                name: returningFullname ? returningFullname.value : '',
                phone: returningPhone ? returningPhone.value : '',
                age: returningAge && returningAge.value ? Number(returningAge.value) : null,
                gender: returningGender && returningGender.value ? returningGender.value : null,
                referral: returningReferralSource ? returningReferralSource.value : '',
                referringDoctor: returningDoctor ? returningDoctor.value.trim() : '',
                sampleLocation: location,
                sampleLocationDisplay: isHome ? 'عينة منزلية' : 'عينة في المعمل',
                sampleArea: area,
                homeGovernorate: homeGovernorateReturning ? homeGovernorateReturning.value : '',
                homeDistrict: homeDistrictReturning ? homeDistrictReturning.value.trim() : '',
                homeDetailedArea: homeAreaReturning ? homeAreaReturning.value.trim() : '',
                homeBuildingNumber: homeBuildingNumberReturning ? homeBuildingNumberReturning.value.trim() : '',
                homeLandmark: homeLandmarkReturning ? homeLandmarkReturning.value.trim() : '',
                homeVisitFee,
                homeVisitFeeStatus: feeStatus,
                locationLat: locationLatInputReturning ? (parseFloat(locationLatInputReturning.value) || null) : null,
                locationLng: locationLngInputReturning ? (parseFloat(locationLngInputReturning.value) || null) : null,
                locationUrl: locationUrlInputReturning ? (locationUrlInputReturning.value.trim() || null) : null,
                date: $('date-returning') ? $('date-returning').value : '',
                time: $('time-returning') ? $('time-returning').value : '',
                notes: $('notes-returning') ? $('notes-returning').value.trim() : '',
                tests: [...selectedTestsReturning],
                testsTotal,
                individualTestsTotal,
                packagePrice,
                total: testsTotal + homeVisitFee,
                missing: individualTests.some(t => !Number.isFinite(t.price)),
                package: currentPackageReturning ? { id: currentPackageReturning.id || null, name: currentPackageReturning.name, price: packagePrice, tests: [...currentPackageReturning.tests] } : null
            };
        }

        function formatDate(value) {
            if (!value) return 'غير محدد';
            return new Date(value + 'T00:00:00').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        function buildFullAddress(booking) {
            const parts = [
                booking.homeGovernorate,
                booking.homeDistrict,
                booking.homeDetailedArea,
                booking.homeBuildingNumber ? 'رقم العقار: ' + booking.homeBuildingNumber : '',
                booking.homeLandmark ? 'علامة مميزة: ' + booking.homeLandmark : ''
            ].filter(Boolean);
            return parts.join(' - ');
        }

        /* ============================================
           SAVE BOOKING - NEW PATIENT
        ============================================ */
        async function saveBooking(booking) {
            let patientId = null;
            let bookingId = null;

            try {
                const unifiedCode = generateUnifiedCode();

                // 1. إنشاء المريض
                const patientInsertData = {
                    patient_code: unifiedCode,
                    full_name: booking.name,
                    phone: booking.phone
                };
                if (booking.age !== null && booking.age !== undefined) patientInsertData.age = booking.age;
                if (booking.gender) patientInsertData.gender = booking.gender;
                if (booking.referral) patientInsertData.referral_source = booking.referral;
                if (booking.homeGovernorate || booking.homeDistrict || booking.homeDetailedArea) {
                    patientInsertData.address = buildFullAddress(booking);
                }

                const { data: patient, error: patientError } = await supabaseClient
                    .from('patients')
                    .insert(patientInsertData)
                    .select('id, patient_code')
                    .single();

                if (patientError) throw patientError;
                patientId = patient.id;

                // 2. إنشاء الحجز مع كل البيانات
                const bookingCode = unifiedCode;
                const subtotal = booking.testsTotal + booking.homeVisitFee;
                const total = booking.total;
                const fullAddress = buildFullAddress(booking);

                const bookingData = {
                    booking_code: bookingCode,
                    source: 'online',
                    patient_id: patient.id,
                    patient_name: booking.name,
                    patient_phone: booking.phone,
                    patient_email: null,

                    // بيانات المريض الإضافية
                    patient_age: booking.age,
                    patient_gender: booking.gender,
                    referring_doctor: booking.referringDoctor || null,
                    referral_source: booking.referral || null,

                    // بيانات الزيارة
                    visit_type: booking.sampleLocation,
                    home_governorate: booking.homeGovernorate || null,
                    home_district: booking.homeDistrict || null,
                    home_area: booking.homeDetailedArea || null,
                    home_building_number: booking.homeBuildingNumber || null,
                    home_landmark: booking.homeLandmark || null,
                    home_full_address: fullAddress || null,
                    home_visit_fee: booking.homeVisitFee || 0,

                    // إحداثيات
                    location_lat: booking.locationLat,
                    location_lng: booking.locationLng,
                    location_url: booking.locationUrl,

                    // مالية
                    subtotal: subtotal,
                    discount_value: 0,
                    discount_type: 'fixed',
                    discount_amount: 0,
                    total: total,
                    paid_amount: 0,

                    status: 'pending',
                    payment_method: null,

                    scheduled_at: booking.date && booking.time
                        ? new Date(booking.date + 'T' + booking.time).toISOString()
                        : null,

                    notes: booking.notes || null,
                    created_by: null
                };

                const { data: bookingRow, error: bookingError } = await supabaseClient
                    .from('bookings')
                    .insert(bookingData)
                    .select('id, booking_code')
                    .single();

                if (bookingError) throw bookingError;
                bookingId = bookingRow.id;

                // 3. إدخال التحاليل
                const itemsData = [];
                booking.tests.filter(t => !t.isPackageTest).forEach(test => {
                    itemsData.push({
                        booking_id: bookingRow.id,
                        item_type: 'test',
                        test_id: test.id,
                        package_id: null,
                        item_name: test.name,
                        unit_price: Number.isFinite(test.price) ? Number(test.price) : 0,
                        quantity: 1,
                        line_total: Number.isFinite(test.price) ? Number(test.price) : 0
                    });
                });

                if (booking.package) {
                    itemsData.push({
                        booking_id: bookingRow.id,
                        item_type: 'package',
                        test_id: null,
                        package_id: booking.package.id,
                        item_name: booking.package.name,
                        unit_price: booking.package.price,
                        quantity: 1,
                        line_total: booking.package.price
                    });
                }

                if (itemsData.length) {
                    const { error: itemsError } = await supabaseClient
                        .from('booking_items')
                        .insert(itemsData);
                    if (itemsError) throw itemsError;
                }

                // 4. تعيين كلمة مرور
                const bookingPassword = generateBookingPassword();
                const { error: pwError } = await supabaseClient.rpc('set_booking_password_secure', {
                    p_booking_code: bookingCode,
                    p_password: bookingPassword
                });
                if (pwError) console.warn('⚠️ فشل تعيين كلمة المرور:', pwError);

                return {
                    id: bookingRow.id,
                    booking_number: bookingRow.booking_code,
                    patient_code: patient.patient_code,
                    booking_password: bookingPassword
                };

            } catch (error) {
                console.error('❌ خطأ في حفظ الحجز:', error);
                if (bookingId) {
                    await supabaseClient.from('booking_items').delete().eq('booking_id', bookingId);
                    await supabaseClient.from('bookings').delete().eq('id', bookingId);
                }
                if (patientId) {
                    await supabaseClient.from('patients').delete().eq('id', patientId);
                }
                throw error;
            }
        }

        /* ============================================
           SAVE BOOKING - RETURNING PATIENT
        ============================================ */
        async function saveBookingReturning(booking) {
            let bookingId = null;

            try {
                if (!booking.patientId) throw new Error('لم يتم تحديد المريض. الرجاء البحث بالكود مرة أخرى.');

                const bookingCode = generateUnifiedCode();
                const subtotal = booking.testsTotal + booking.homeVisitFee;
                const total = booking.total;
                const fullAddress = buildFullAddress(booking);

                const bookingData = {
                    booking_code: bookingCode,
                    source: 'online',
                    patient_id: booking.patientId,
                    patient_name: booking.name,
                    patient_phone: booking.phone,
                    patient_email: null,

                    patient_age: booking.age,
                    patient_gender: booking.gender,
                    referring_doctor: booking.referringDoctor || null,
                    referral_source: booking.referral || null,

                    visit_type: booking.sampleLocation,
                    home_governorate: booking.homeGovernorate || null,
                    home_district: booking.homeDistrict || null,
                    home_area: booking.homeDetailedArea || null,
                    home_building_number: booking.homeBuildingNumber || null,
                    home_landmark: booking.homeLandmark || null,
                    home_full_address: fullAddress || null,
                    home_visit_fee: booking.homeVisitFee || 0,

                    location_lat: booking.locationLat,
                    location_lng: booking.locationLng,
                    location_url: booking.locationUrl,

                    subtotal: subtotal,
                    discount_value: 0,
                    discount_type: 'fixed',
                    discount_amount: 0,
                    total: total,
                    paid_amount: 0,

                    status: 'pending',
                    payment_method: null,

                    scheduled_at: booking.date && booking.time
                        ? new Date(booking.date + 'T' + booking.time).toISOString()
                        : null,

                    notes: booking.notes || null,
                    created_by: null
                };

                const { data: bookingRow, error: bookingError } = await supabaseClient
                    .from('bookings')
                    .insert(bookingData)
                    .select('id, booking_code')
                    .single();

                if (bookingError) throw bookingError;
                bookingId = bookingRow.id;

                const itemsData = [];
                booking.tests.filter(t => !t.isPackageTest).forEach(test => {
                    itemsData.push({
                        booking_id: bookingRow.id,
                        item_type: 'test',
                        test_id: test.id,
                        package_id: null,
                        item_name: test.name,
                        unit_price: Number.isFinite(test.price) ? Number(test.price) : 0,
                        quantity: 1,
                        line_total: Number.isFinite(test.price) ? Number(test.price) : 0
                    });
                });

                if (booking.package) {
                    itemsData.push({
                        booking_id: bookingRow.id,
                        item_type: 'package',
                        test_id: null,
                        package_id: booking.package.id,
                        item_name: booking.package.name,
                        unit_price: booking.package.price,
                        quantity: 1,
                        line_total: booking.package.price
                    });
                }

                if (itemsData.length) {
                    const { error: itemsError } = await supabaseClient
                        .from('booking_items')
                        .insert(itemsData);
                    if (itemsError) throw itemsError;
                }

                const bookingPassword = generateBookingPassword();
                const { error: pwError } = await supabaseClient.rpc('set_booking_password_secure', {
                    p_booking_code: bookingCode,
                    p_password: bookingPassword
                });
                if (pwError) console.warn('⚠️ فشل تعيين كلمة المرور:', pwError);

                return {
                    id: bookingRow.id,
                    booking_number: bookingRow.booking_code,
                    patient_code: null,
                    booking_password: bookingPassword
                };

            } catch (error) {
                console.error('❌ خطأ في حفظ الحجز (مريض عائد):', error);
                if (bookingId) {
                    await supabaseClient.from('booking_items').delete().eq('booking_id', bookingId);
                    await supabaseClient.from('bookings').delete().eq('id', bookingId);
                }
                throw error;
            }
        }

        /* ============================================
           BUILD CONFIRMATION
        ============================================ */
        function buildBookingConfirmation(booking, savedAppointment) {
            const rows = booking.tests.map((test, index) => {
                const shownPrice = test.isPackageTest
                    ? '<span style="color:#2a6a9a;">ضمن الباقة</span>'
                    : (Number.isFinite(test.price) ? formatMoney(test.price) + ' جنيه' : 'السعر غير مسجل');

                return '<div class="confirmation-test-row"><span><b>' + (index + 1) + '.</b> ' + escapeHtml(test.name) + '</span><strong>' + shownPrice + '</strong></div>';
            }).join('');

            const packageInfo = booking.package
                ? '<div style="background:#e8f4fd;padding:0.6rem 1rem;border-radius:10px;margin-bottom:0.8rem;">' +
                  '<i class="fas fa-gift" style="color:#2a6a9a;"></i> ' +
                  '<strong>الباقة المختارة:</strong> ' + escapeHtml(booking.package.name) +
                  ' <span style="background:#2a6a9a;color:white;padding:0.1rem 0.8rem;border-radius:12px;font-size:0.85rem;">' +
                  formatMoney(booking.package.price) + ' جنيه</span></div>'
                : '';

            const homeAddress = buildFullAddress(booking);

            const codeInfo = savedAppointment && savedAppointment.booking_number
                ? '<div style="background:#d4f5e9;padding:0.8rem 1rem;border-radius:10px;margin-bottom:0.8rem;">' +
                  '<i class="fas fa-id-card" style="color:#22a86e;"></i> ' +
                  '<strong>كود الحجز:</strong> ' +
                  '<span style="background:#22a86e;color:white;padding:0.2rem 0.8rem;border-radius:12px;font-size:0.9rem;font-family:monospace;font-weight:700;letter-spacing:1px;">' +
                  escapeHtml(savedAppointment.booking_number) + '</span>' +
                  (savedAppointment.booking_password
                    ? '<br><br><i class="fas fa-lock" style="color:#e89b1f;"></i> <strong>كلمة المرور:</strong> ' +
                      '<span style="background:#e89b1f;color:white;padding:0.2rem 0.8rem;border-radius:12px;font-size:0.9rem;font-family:monospace;font-weight:700;letter-spacing:2px;">' +
                      escapeHtml(savedAppointment.booking_password) + '</span>' +
                      '<br><small style="color:#8a5a1a;display:block;margin-top:0.4rem;">⚠️ <b>احتفظ بالكود وكلمة المرور</b> — هتحتاجهم لاستلام النتائج من الموقع</small>'
                    : '') +
                  '</div>'
                : '';

            const mapLink = booking.locationUrl
                ? '<div style="grid-column:1/-1;margin-top:0.5rem;">' +
                  '<span><i class="fas fa-map-location-dot" style="color:#2a6a9a;"></i> رابط الموقع على الخريطة</span>' +
                  '<strong><a href="' + escapeHtml(booking.locationUrl) + '" target="_blank" rel="noopener" style="color:#2a6a9a;text-decoration:underline;">' +
                  'اضغط لفتح الموقع على Google Maps</a></strong></div>'
                : '';

            confirmationDetailsEl.innerHTML =
                codeInfo +
                packageInfo +
                '<div class="confirmation-meta">' +
                '<div><span>رقم الحجز</span><strong>' + escapeHtml(savedAppointment ? savedAppointment.booking_number : '') + '</strong></div>' +
                '<div><span>المريض</span><strong>' + escapeHtml(booking.name) + '</strong></div>' +
                '<div><span>الطبيب المحول</span><strong>' + escapeHtml(booking.referringDoctor) + '</strong></div>' +
                '<div><span>الموعد</span><strong>' + formatDate(booking.date) + ' - ' + escapeHtml(booking.time) + '</strong></div>' +
                '<div><span>مكان أخذ العينة</span><strong>' + escapeHtml(booking.sampleLocationDisplay) + '</strong></div>' +
                (booking.sampleArea ? '<div><span>منطقة العينة</span><strong>' + escapeHtml(booking.sampleArea) + '</strong></div>' : '') +
                (booking.sampleLocation === 'home'
                    ? '<div style="grid-column:1/-1;">' +
                      '<span>العنوان بالتفصيل</span>' +
                      '<strong>' + escapeHtml(homeAddress) + '</strong>' +
                      '</div>' + mapLink
                    : '') +
                '<div><span>عرفتنا منين</span><strong>' + escapeHtml(booking.referral) + '</strong></div>' +
                '</div>' +
                '<div class="confirmation-tests">' +
                '<div class="confirmation-tests-title">تفاصيل التحاليل (' + booking.tests.length + ')</div>' +
                rows +
                '</div>' +
                (booking.notes
                    ? '<div class="confirmation-notes"><b>ملاحظات:</b> ' + escapeHtml(booking.notes) + '</div>'
                    : '');

            if (confirmationTotalEl) confirmationTotalEl.textContent = formatMoney(booking.total);

            const priceBox = confirmationEl ? confirmationEl.querySelector('.confirmation-price-box') : null;
            if (priceBox) {
                const homeFeeText = booking.sampleLocation === 'home'
                    ? (booking.homeVisitFeeStatus === 'confirmed'
                        ? '<div style="margin-top:.45rem;font-size:.9rem;opacity:.9;">رسوم العينة المنزلية: ' + formatMoney(booking.homeVisitFee) + ' جنيه</div>'
                        : '<div style="margin-top:.45rem;font-size:.9rem;opacity:.9;">رسوم العينة المنزلية خارج الحي الحداشر: تُحدد حسب المسافة والمكان</div>')
                    : '<div style="margin-top:.45rem;font-size:.9rem;opacity:.9;">رسوم العينة: بدون رسوم منزلية</div>';

                priceBox.innerHTML =
                    '<span>إجمالي أسعار الموقع + رسوم العينة</span>' +
                    '<strong><span id="confirmation-total">' + formatMoney(booking.total) + '</span> جنيه</strong>' +
                    homeFeeText;
            }
        }

        /* ============================================
           FORM SUBMIT - NEW PATIENT
        ============================================ */
        if (appointmentForm) {
            appointmentForm.onsubmit = async function (e) {
                e.preventDefault();
                if (!validateForm()) return;

                const btnText = $('btn-text');
                const spinner = $('btn-spinner');

                if (submitBtn) submitBtn.disabled = true;
                if (btnText) btnText.textContent = 'جاري حفظ الحجز...';
                if (spinner) spinner.style.display = 'inline-block';

                try {
                    const booking = collectBookingData();
                    const savedAppointment = await saveBooking(booking);

                    buildBookingConfirmation(booking, savedAppointment);
                    showNotification('تم حفظ الحجز بنجاح في النظام!', 'success');

                    if (confirmationEl) {
                        confirmationEl.style.display = 'flex';
                        confirmationEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }

                    appointmentForm.reset();
                    if (sampleLocationGroup) sampleLocationGroup.classList.remove('is-invalid');
                    [homeGovernorate, homeDistrict, homeArea, homeBuildingNumber, homeLandmark].forEach(field => {
                        if (field) field.classList.remove('is-invalid');
                    });

                    // إعادة تعيين الخريطة
                    if (mapInstance && mapInstance.reset) {
                        mapInstance.reset();
                    } else {
                        if (locationLatInput) locationLatInput.value = '';
                        if (locationLngInput) locationLngInput.value = '';
                        if (locationUrlInput) locationUrlInput.value = '';
                    }

                    updateHomeVisitUI();

                    selectedTests = [];
                    if (currentPackage) hidePackageBanner();
                    renderSelectedTests();
                    updatePriceSummary();

                    if (searchResults) searchResults.classList.remove('active');
                    if (searchInput) searchInput.value = '';
                    if (clearSearchBtn) clearSearchBtn.classList.remove('visible');

                } catch (error) {
                    console.error('❌ Supabase booking error:', error);
                    let message = 'حدث خطأ أثناء حفظ الحجز.';
                    if (error && error.message) message += ' ' + error.message;
                    showNotification(message, 'error');
                } finally {
                    if (submitBtn) submitBtn.disabled = false;
                    if (btnText) btnText.textContent = 'تأكيد الحجز';
                    if (spinner) spinner.style.display = 'none';
                }
            };
        }

        /* ============================================
           FORM SUBMIT - RETURNING PATIENT
        ============================================ */
        if (appointmentFormReturning) {
            appointmentFormReturning.onsubmit = async function (e) {
                e.preventDefault();
                if (!validateFormReturning()) return;

                const btnText = $('btn-text-returning');
                const spinner = $('btn-spinner-returning');

                if (submitBtnReturning) submitBtnReturning.disabled = true;
                if (btnText) btnText.textContent = 'جاري حفظ الحجز...';
                if (spinner) spinner.style.display = 'inline-block';

                try {
                    const booking = collectBookingDataReturning();
                    const savedAppointment = await saveBookingReturning(booking);

                    buildBookingConfirmation(booking, savedAppointment);
                    showNotification('تم حفظ الحجز بنجاح في النظام!', 'success');

                    if (confirmationEl) {
                        confirmationEl.style.display = 'flex';
                        confirmationEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }

                    appointmentFormReturning.reset();
                    if (sampleLocationGroupReturning) sampleLocationGroupReturning.classList.remove('is-invalid');
                    [homeGovernorateReturning, homeDistrictReturning, homeAreaReturning, homeBuildingNumberReturning, homeLandmarkReturning].forEach(field => {
                        if (field) field.classList.remove('is-invalid');
                    });

                    if (mapInstanceReturning && mapInstanceReturning.reset) {
                        mapInstanceReturning.reset();
                    } else {
                        if (locationLatInputReturning) locationLatInputReturning.value = '';
                        if (locationLngInputReturning) locationLngInputReturning.value = '';
                        if (locationUrlInputReturning) locationUrlInputReturning.value = '';
                    }

                    updateHomeVisitUIReturning();

                    selectedTestsReturning = [];
                    if (currentPackageReturning) hidePackageBannerReturning();
                    renderSelectedTestsReturning();
                    updatePriceSummaryReturning();

                    if (searchResultsReturning) searchResultsReturning.classList.remove('active');
                    if (searchInputReturning) searchInputReturning.value = '';
                    if (clearSearchReturning) clearSearchReturning.classList.remove('visible');

                    setTimeout(() => {
                        if (returningPatientForm) {
                            returningPatientForm.classList.remove('visible');
                            returningPatientForm.style.display = 'none';
                        }
                        if (returningPatientSection) {
                            returningPatientSection.classList.add('visible');
                            returningPatientSection.style.display = 'block';
                        }
                        resetReturningPatientSearch();
                    }, 500);

                } catch (error) {
                    console.error('❌ Supabase booking error (returning):', error);
                    let message = 'حدث خطأ أثناء حفظ الحجز.';
                    if (error && error.message) message += ' ' + error.message;
                    showNotification(message, 'error');
                } finally {
                    if (submitBtnReturning) submitBtnReturning.disabled = false;
                    if (btnText) btnText.textContent = 'تأكيد الحجز';
                    if (spinner) spinner.style.display = 'none';
                }
            };
        }

        /* ============================================
           DATE MIN
        ============================================ */
        const dateInput = $('date');
        if (dateInput) {
            const today = new Date();
            const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
            dateInput.min = localToday;
        }

        const dateInputReturning = $('date-returning');
        if (dateInputReturning) {
            const today = new Date();
            const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
            dateInputReturning.min = localToday;
        }

        /* ============================================
           INITIAL LOAD
        ============================================ */
        renderSelectedTests();
        updatePriceSummary();
        updateHomeVisitUI();

        renderSelectedTestsReturning();
        updatePriceSummaryReturning();
        updateHomeVisitUIReturning();

        loadTestsFromSource();

        console.log('✅ Appointment system initialized. Mode:', currentMode);
    }

    if (document.readyState === 'complete') {
        initAppointmentSystem();
    } else {
        window.addEventListener('load', initAppointmentSystem);
    }
})();

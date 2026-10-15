(function () {
    'use strict';

    /* ============================================
       SUPABASE CLIENT
    ============================================ */
    const SUPABASE_URL = 'https://rlkqifdteyccagpdtdmu.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_XibO6Ri8DLKHG-rUEp4Bnw_bDzm67Xf';

    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

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

        console.log('🔍 Mode buttons found:', {
            newBtn: !!modeNewPatientBtn,
            returningBtn: !!modeReturningPatientBtn,
            newSection: !!newPatientSection,
            returningSection: !!returningPatientSection
        });

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
            if (!notificationArea) {
                console.warn('⚠️ notificationArea not found');
                alert(message);
                return;
            }
            const oldNotifications = notificationArea.querySelectorAll('.notification');
            oldNotifications.forEach(n => n.remove());

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
           GENERATE CODES
           (كود واحد فقط للمريض والحجز معاً)
        ============================================ */
        function generateUnifiedCode() {
            const now = new Date();
            const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            return 'WEB-' + datePart + '-' + random;
        }

        /* ============================================
           BOOKING MODE SWITCHER
        ============================================ */
        function switchMode(mode) {
            console.log('🔄 Switching mode to:', mode);
            currentMode = mode;

            if (modeNewPatientBtn) {
                if (mode === 'new') {
                    modeNewPatientBtn.classList.add('active');
                } else {
                    modeNewPatientBtn.classList.remove('active');
                }
            }
            if (modeReturningPatientBtn) {
                if (mode === 'returning') {
                    modeReturningPatientBtn.classList.add('active');
                } else {
                    modeReturningPatientBtn.classList.remove('active');
                }
            }

            if (newPatientSection) {
                if (mode === 'new') {
                    newPatientSection.classList.remove('hidden');
                    newPatientSection.style.display = 'block';
                } else {
                    newPatientSection.classList.add('hidden');
                    newPatientSection.style.display = 'none';
                }
            }

            if (returningPatientSection) {
                if (mode === 'returning') {
                    returningPatientSection.classList.add('visible');
                    returningPatientSection.style.display = 'block';
                } else {
                    returningPatientSection.classList.remove('visible');
                    returningPatientSection.style.display = 'none';
                }
            }

            if (mode === 'returning') {
                resetReturningPatientSearch();
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        /* ============================================
           EVENT LISTENERS - MODE BUTTONS
        ============================================ */
        if (modeNewPatientBtn) {
            modeNewPatientBtn.onclick = function (e) {
                e.preventDefault();
                console.log('🖱️ New patient button clicked');
                switchMode('new');
            };
            console.log('✅ New patient button listener attached');
        } else {
            console.error('❌ mode-new-patient button NOT FOUND!');
        }

        if (modeReturningPatientBtn) {
            modeReturningPatientBtn.onclick = function (e) {
                e.preventDefault();
                console.log('🖱️ Returning patient button clicked');
                switchMode('returning');
            };
            console.log('✅ Returning patient button listener attached');
        } else {
            console.error('❌ mode-returning-patient button NOT FOUND!');
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

            console.log('🔍 Searching for patient code:', cleanCode);

            if (!cleanCode) {
                showNotification('الرجاء إدخال كود المريض', 'warning');
                return;
            }

            if (searchPatientBtn) {
                searchPatientBtn.disabled = true;
                searchPatientBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';
            }

            try {
                // البحث بدون حساسية لحالة الأحرف
                const { data, error } = await supabaseClient
                    .from('patients')
                    .select('id, patient_code, full_name, phone, birth_date, gender, created_at')
                    .ilike('patient_code', cleanCode)
                    .maybeSingle();

                console.log('📥 Search result:', { data, error });

                if (error) {
                    console.error('❌ Supabase error:', error);
                    throw error;
                }

                                    if (!data) {
                    showNotification(
                        'لم يتم العثور على مريض بهذا الكود. تأكد من الكود وحاول مرة أخرى.',
                        'error'
                    );
                    if (patientFoundCard) patientFoundCard.classList.remove('visible');
                    foundPatient = null;
                    return;
                }

                console.log('✅ Patient found:', data);
                foundPatient = data;
                displayFoundPatient(data);
                showNotification('تم العثور على بياناتك بنجاح!', 'success');

            } catch (error) {
                console.error('❌ خطأ في البحث عن المريض:', error);
                let msg = 'حدث خطأ أثناء البحث.';
                if (error && error.message) {
                    msg += ' ' + error.message;
                }
                showNotification(msg, 'error');
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
                const monthDiff = today.getMonth() - birth.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                return age + ' سنة';
            } catch (e) {
                return 'غير محدد';
            }
        }

        function displayFoundPatient(patient) {
            if (!patientInfoGrid || !patientFoundCard) return;

            const genderText = patient.gender === 'male' ? 'ذكر' : (patient.gender === 'female' ? 'أنثى' : 'غير محدد');
            const ageText = calculateAgeFromBirthDate(patient.birth_date);

            patientInfoGrid.innerHTML =
                '<div class="patient-info-item">' +
                    '<span><i class="fas fa-id-card"></i> كود المريض</span>' +
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

                // ملء الحقول المخفية ببيانات المريض
                if (returningPatientId) returningPatientId.value = foundPatient.id || '';
                if (returningFullname) returningFullname.value = foundPatient.full_name || '';
                if (returningPhone) returningPhone.value = foundPatient.phone || '';
                if (returningAge) returningAge.value = foundPatient.birth_date || '';
                if (returningGender) returningGender.value = foundPatient.gender || '';

                // عرض اسم المريض في البانر
                if (returningPatientName) returningPatientName.textContent = foundPatient.full_name;
                if (returningPatientCode) returningPatientCode.textContent = foundPatient.patient_code;

                // إخفاء البحث وإظهار الفورم
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
                    .select(`
                        id,
                        name,
                        price,
                        is_active,
                        category_id,
                        test_categories ( id, name )
                    `)
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

                console.log('✅ تم تحميل ' + availableTests.length + ' تحليل من Supabase');

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
                showNotification('فشل تحميل قائمة التحاليل من Supabase', 'error');
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
                    .select(`
                        id, name, price, is_active,
                        package_tests (
                            test_id, sort_order,
                            tests ( id, name, price, is_active )
                        )
                    `)
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
                if (!parsed || !parsed.name) {
                    localStorage.removeItem('selected_package');
                    return false;
                }

                let packageData = null;
                if (parsed.id) {
                    packageData = await loadPackageFromSupabase(parsed.id);
                }

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
                if (!parsed || !parsed.name) {
                    localStorage.removeItem('selected_package');
                    return false;
                }

                let packageData = null;
                if (parsed.id) {
                    packageData = await loadPackageFromSupabase(parsed.id);
                }

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
                        matchedTests.push({
                            ...found,
                            isPackageTest: true,
                            packageName: currentPackage.name
                        });
                    } else {
                        const existing = selectedTests.find(t => t.id === found.id);
                        existing.isPackageTest = true;
                        existing.packageName = currentPackage.name;
                    }
                } else {
                    notFound.push(testName);
                }
            });

            matchedTests.forEach(test => selectedTests.push(test));
            renderSelectedTests();
            updatePriceSummary();

            if (notFound.length) {
                showNotification('بعض تحاليل الباقة غير موجودة: ' + notFound.join(', '), 'warning');
            }
        }

        function addPackageTestsReturning(testNames) {
            if (!currentPackageReturning) return;
            const matchedTests = [];
            const notFound = [];

            testNames.forEach(testName => {
                const found = availableTests.find(test => packageTestMatches(test, testName));
                if (found) {
                    if (!selectedTestsReturning.some(t => t.id === found.id)) {
                        matchedTests.push({
                            ...found,
                            isPackageTest: true,
                            packageName: currentPackageReturning.name
                        });
                    } else {
                        const existing = selectedTestsReturning.find(t => t.id === found.id);
                        existing.isPackageTest = true;
                        existing.packageName = currentPackageReturning.name;
                    }
                } else {
                    notFound.push(testName);
                }
            });

            matchedTests.forEach(test => selectedTestsReturning.push(test));
            renderSelectedTestsReturning();
            updatePriceSummaryReturning();

            if (notFound.length) {
                showNotification('بعض تحاليل الباقة غير موجودة: ' + notFound.join(', '), 'warning');
            }
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
                    return (
                        haystack.includes(q) ||
                        categoryTerms(query).some(term => haystack.includes(normalize(term)))
                    );
                });
            }

            return results;
        }

        function renderSearchResults(results) {
            if (!searchResults) return;
            searchResults.innerHTML = '';
            searchResults.classList.add('active');

            if (!results || !results.length) {
                searchResults.innerHTML =
                    '<div class="no-results">' +
                    '<i class="fas fa-search"></i>' +
                    '<p>لا توجد نتائج مطابقة للبحث</p>' +
                    '<small style="color:#a0aab5;">جرب كلمة بحث مختلفة</small>' +
                    '</div>';
                return;
            }

            results.forEach(test => {
                const item = document.createElement('div');
                item.className = 'result-item';

                const isAdded = selectedTests.some(t => t.id === test.id);
                const info = document.createElement('div');
                info.className = 'test-info';
                info.innerHTML =
                    '<span class="test-name">' + escapeHtml(test.name) + '</span>' +
                    '<span class="test-category">' +
                    '<i class="fas fa-folder"></i> ' + escapeHtml(test.category || 'تحاليل') +
                    '</span>';

                const priceEl = document.createElement('span');
                priceEl.className = 'test-price';
                priceEl.textContent = Number.isFinite(test.price)
                    ? formatMoney(test.price) + ' جنيه'
                    : 'السعر غير مسجل';

                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'add-btn' + (isAdded ? ' added' : '');
                addBtn.innerHTML = isAdded
                    ? '<i class="fas fa-check"></i>'
                    : '<i class="fas fa-plus"></i>';
                addBtn.title = isAdded ? 'تم الإضافة' : 'إضافة التحليل';
                addBtn.onclick = function (e) {
                    e.stopPropagation();
                    toggleTest(test);
                };

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
                searchResultsReturning.innerHTML =
                    '<div class="no-results">' +
                    '<i class="fas fa-search"></i>' +
                    '<p>لا توجد نتائج مطابقة للبحث</p>' +
                    '<small style="color:#a0aab5;">جرب كلمة بحث مختلفة</small>' +
                    '</div>';
                return;
            }

            results.forEach(test => {
                const item = document.createElement('div');
                item.className = 'result-item';

                const isAdded = selectedTestsReturning.some(t => t.id === test.id);
                const info = document.createElement('div');
                info.className = 'test-info';
                info.innerHTML =
                    '<span class="test-name">' + escapeHtml(test.name) + '</span>' +
                    '<span class="test-category">' +
                    '<i class="fas fa-folder"></i> ' + escapeHtml(test.category || 'تحاليل') +
                    '</span>';

                const priceEl = document.createElement('span');
                priceEl.className = 'test-price';
                priceEl.textContent = Number.isFinite(test.price)
                    ? formatMoney(test.price) + ' جنيه'
                    : 'السعر غير مسجل';

                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'add-btn' + (isAdded ? ' added' : '');
                addBtn.innerHTML = isAdded
                    ? '<i class="fas fa-check"></i>'
                    : '<i class="fas fa-plus"></i>';
                addBtn.title = isAdded ? 'تم الإضافة' : 'إضافة التحليل';
                addBtn.onclick = function (e) {
                    e.stopPropagation();
                    toggleTestReturning(test);
                };

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
                selectedTestsList.innerHTML =
                    '<div class="selected-empty">' +
                    '<i class="fas fa-plus-circle"></i>' +
                    'لم يتم اختيار أي تحاليل بعد' +
                    '</div>';
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
                    price.textContent = Number.isFinite(test.price)
                        ? formatMoney(test.price) + ' جنيه'
                        : 'السعر غير مسجل';
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
                selectedTestsListReturning.innerHTML =
                    '<div class="selected-empty">' +
                    '<i class="fas fa-plus-circle"></i>' +
                    'لم يتم اختيار أي تحاليل بعد' +
                    '</div>';
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
                    price.textContent = Number.isFinite(test.price)
                        ? formatMoney(test.price) + ' جنيه'
                        : 'السعر غير مسجل';
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
            const individualTotal = individualTests.reduce(
                (sum, test) => sum + (Number.isFinite(test.price) ? Number(test.price) : 0),
                0
            );
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
            const individualTotal = individualTests.reduce(
                (sum, test) => sum + (Number.isFinite(test.price) ? Number(test.price) : 0),
                0
            );
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
            } else {
                searchResults.classList.remove('active');
            }
        }

        function applyCurrentSearchReturning() {
            if (!searchInputReturning || !searchResultsReturning) return;
            const query = searchInputReturning.value.trim();

            if ((query || currentFilter !== 'all') && availableTests.length) {
                renderSearchResultsReturning(searchTests(query, currentFilter));
            } else {
                searchResultsReturning.classList.remove('active');
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                clearTimeout(searchTimeout);
                const query = this.value.trim();

                if (clearSearchBtn) {
                    clearSearchBtn.classList.toggle('visible', query.length > 0);
                }

                if (!query && currentFilter === 'all') {
                    searchResults.classList.remove('active');
                    return;
                }

                searchTimeout = setTimeout(
                    () => renderSearchResults(searchTests(query, currentFilter)),
                    150
                );
            });
        }

        if (searchInputReturning) {
            searchInputReturning.addEventListener('input', function () {
                clearTimeout(searchTimeoutReturning);
                const query = this.value.trim();

                if (clearSearchReturning) {
                    clearSearchReturning.classList.toggle('visible', query.length > 0);
                }

                if (!query && currentFilter === 'all') {
                    searchResultsReturning.classList.remove('active');
                    return;
                }

                searchTimeoutReturning = setTimeout(
                    () => renderSearchResultsReturning(searchTests(query, currentFilter)),
                    150
                );
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
                if (!selectedTests.length) {
                    showNotification('لا توجد تحاليل لحذفها', 'warning');
                    return;
                }
                if (currentPackage) {
                    if (!confirm('سيتم حذف جميع التحاليل بما فيها تحاليل الباقة المختارة. هل أنت متأكد؟')) return;
                }
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
                if (!selectedTestsReturning.length) {
                    showNotification('لا توجد تحاليل لحذفها', 'warning');
                    return;
                }
                if (currentPackageReturning) {
                    if (!confirm('سيتم حذف جميع التحاليل بما فيها تحاليل الباقة المختارة. هل أنت متأكد؟')) return;
                }
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

            if (!isHome) {
                if (homeVisitFeeEl) {
                    homeVisitFeeEl.style.display = 'none';
                    homeVisitFeeEl.textContent = '';
                }
                return;
            }

            const area = homeArea ? homeArea.value.trim() : '';

            if (homeVisitFeeEl) {
                if (area === 'الحي الحداشر') {
                    homeVisitFeeEl.style.display = 'block';
                    homeVisitFeeEl.innerHTML =
                        '<i class="fas fa-house-chimney"></i> ' +
                        'رسوم العينة المنزلية: ' +
                        '<strong>100 جنيه</strong>';
                } else if (area === 'خارج الحي الحداشر') {
                    homeVisitFeeEl.style.display = 'block';
                    homeVisitFeeEl.innerHTML =
                        '<i class="fas fa-route"></i> ' +
                        'رسوم الانتقال: ' +
                        '<strong>تُحدد حسب المسافة والمكان</strong>';
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

            if (!isHome) {
                if (homeVisitFeeElReturning) {
                    homeVisitFeeElReturning.style.display = 'none';
                    homeVisitFeeElReturning.textContent = '';
                }
                return;
            }

            const area = homeAreaReturning ? homeAreaReturning.value.trim() : '';

            if (homeVisitFeeElReturning) {
                if (area === 'الحي الحداشر') {
                    homeVisitFeeElReturning.style.display = 'block';
                    homeVisitFeeElReturning.innerHTML =
                        '<i class="fas fa-house-chimney"></i> ' +
                        'رسوم العينة المنزلية: ' +
                        '<strong>100 جنيه</strong>';
                } else if (area === 'خارج الحي الحداشر') {
                    homeVisitFeeElReturning.style.display = 'block';
                    homeVisitFeeElReturning.innerHTML =
                        '<i class="fas fa-route"></i> ' +
                        'رسوم الانتقال: ' +
                        '<strong>تُحدد حسب المسافة والمكان</strong>';
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
           VALIDATION - NEW PATIENT
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
            if (sampleLocationGroup) {
                sampleLocationGroup.classList.toggle('is-invalid', !sampleLocation);
            }
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
                const phoneValid = /^01\d{9}$/.test(phoneValue);
                if (!phoneValid) {
                    phone.classList.add('is-invalid');
                    valid = false;
                } else {
                    phone.classList.remove('is-invalid');
                }
            }

            if (!selectedTests.length) {
                showNotification('الرجاء اختيار تحليل واحد على الأقل', 'error');
                valid = false;
            }

            return valid;
        }

        /* ============================================
           VALIDATION - RETURNING PATIENT
        ============================================ */
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
            if (sampleLocationGroupReturning) {
                sampleLocationGroupReturning.classList.toggle('is-invalid', !sampleLocation);
            }
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
           COLLECT BOOKING DATA - NEW PATIENT
        ============================================ */
        function collectBookingData() {
            const packagePrice = currentPackage ? Number(currentPackage.price) || 0 : 0;
            const individualTests = selectedTests.filter(test => !test.isPackageTest);
            const individualTestsTotal = individualTests.reduce(
                (sum, test) => sum + (Number.isFinite(test.price) ? Number(test.price) : 0),
                0
            );
            const testsTotal = packagePrice + individualTestsTotal;

            const selected = document.querySelector('input[name="sample-location"]:checked');
            const isHome = selected && (selected.value === 'عينة منزلية' || selected.value === 'home');
            const location = isHome ? 'home' : 'lab';
            const area = homeArea ? homeArea.value.trim() : '';

            let homeVisitFee = 0;
            let feeStatus = 'pending';

            if (location === 'home') {
                if (area === 'الحي الحداشر') {
                    homeVisitFee = 100;
                    feeStatus = 'confirmed';
                } else {
                    homeVisitFee = 0;
                    feeStatus = 'pending';
                }
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
                date: $('date') ? $('date').value : '',
                time: $('time') ? $('time').value : '',
                notes: $('notes') ? $('notes').value.trim() : '',
                tests: [...selectedTests],
                testsTotal,
                individualTestsTotal,
                packagePrice,
                total: testsTotal + homeVisitFee,
                missing: individualTests.some(t => !Number.isFinite(t.price)),
                package: currentPackage ? {
                    id: currentPackage.id || null,
                    name: currentPackage.name,
                    price: packagePrice,
                    tests: [...currentPackage.tests]
                } : null
            };
        }

        /* ============================================
           COLLECT BOOKING DATA - RETURNING PATIENT
        ============================================ */
        function collectBookingDataReturning() {
            const packagePrice = currentPackageReturning ? Number(currentPackageReturning.price) || 0 : 0;
            const individualTests = selectedTestsReturning.filter(test => !test.isPackageTest);
            const individualTestsTotal = individualTests.reduce(
                (sum, test) => sum + (Number.isFinite(test.price) ? Number(test.price) : 0),
                0
            );
            const testsTotal = packagePrice + individualTestsTotal;

            const selected = document.querySelector('input[name="sample-location-returning"]:checked');
            const isHome = selected && (selected.value === 'عينة منزلية' || selected.value === 'home');
            const location = isHome ? 'home' : 'lab';
            const area = homeAreaReturning ? homeAreaReturning.value.trim() : '';

            let homeVisitFee = 0;
            let feeStatus = 'pending';

            if (location === 'home') {
                if (area === 'الحي الحداشر') {
                    homeVisitFee = 100;
                    feeStatus = 'confirmed';
                } else {
                    homeVisitFee = 0;
                    feeStatus = 'pending';
                }
            }

            return {
                patientId: returningPatientId ? returningPatientId.value : null,
                name: returningFullname ? returningFullname.value : '',
                phone: returningPhone ? returningPhone.value : '',
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
                date: $('date-returning') ? $('date-returning').value : '',
                time: $('time-returning') ? $('time-returning').value : '',
                notes: $('notes-returning') ? $('notes-returning').value.trim() : '',
                tests: [...selectedTestsReturning],
                testsTotal,
                individualTestsTotal,
                packagePrice,
                total: testsTotal + homeVisitFee,
                missing: individualTests.some(t => !Number.isFinite(t.price)),
                package: currentPackageReturning ? {
                    id: currentPackageReturning.id || null,
                    name: currentPackageReturning.name,
                    price: packagePrice,
                    tests: [...currentPackageReturning.tests]
                } : null
            };
        }

        function formatDate(value) {
            if (!value) return 'غير محدد';
            return new Date(value + 'T00:00:00').toLocaleDateString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        }

        /* ============================================
           SAVE BOOKING - NEW PATIENT
        ============================================ */
        async function saveBooking(booking) {
            let patientId = null;
            let bookingId = null;

            try {
                const { data: patient, error: patientError } = await supabaseClient
                    .from('patients')
                    .insert({
                        patient_code: generatePatientCode(),
                        full_name: booking.name,
                        phone: booking.phone,
                    })
                    .select('id, patient_code')
                    .single();

                if (patientError) throw patientError;
                patientId = patient.id;

                const bookingCode = generateBookingCode();

                const subtotal = booking.testsTotal + booking.homeVisitFee;
                const total = booking.total;

                const bookingData = {
                    booking_code: bookingCode,
                    source: 'online',
                    patient_id: patient.id,
                    patient_name: booking.name,
                    patient_phone: booking.phone,

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

                return {
                    id: bookingRow.id,
                    booking_number: bookingRow.booking_code,
                    patient_code: patient.patient_code,
                    daily_number: null
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
           (بدون إضافة مريض جديد - بيستخدم patient_id القديم)
        ============================================ */
        async function saveBookingReturning(booking) {
            let bookingId = null;

            try {
                if (!booking.patientId) {
                    throw new Error('لم يتم تحديد المريض. الرجاء البحث بالكود مرة أخرى.');
                }

                const bookingCode = generateBookingCode();

                const subtotal = booking.testsTotal + booking.homeVisitFee;
                const total = booking.total;

                const bookingData = {
                    booking_code: bookingCode,
                    source: 'online',
                    patient_id: booking.patientId,
                    patient_name: booking.name,
                    patient_phone: booking.phone,

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

                return {
                    id: bookingRow.id,
                    booking_number: bookingRow.booking_code,
                    daily_number: null
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
                    : (Number.isFinite(test.price)
                        ? formatMoney(test.price) + ' جنيه'
                        : 'السعر غير مسجل');

                return (
                    '<div class="confirmation-test-row">' +
                    '<span><b>' + (index + 1) + '.</b> ' + escapeHtml(test.name) + '</span>' +
                    '<strong>' + shownPrice + '</strong>' +
                    '</div>'
                );
            }).join('');

            const packageInfo = booking.package
                ? (
                    '<div style="background:#e8f4fd;padding:0.6rem 1rem;border-radius:10px;margin-bottom:0.8rem;">' +
                    '<i class="fas fa-gift" style="color:#2a6a9a;"></i> ' +
                    '<strong>الباقة المختارة:</strong> ' +
                    escapeHtml(booking.package.name) +
                    ' <span style="background:#2a6a9a;color:white;padding:0.1rem 0.8rem;border-radius:12px;font-size:0.85rem;">' +
                    formatMoney(booking.package.price) + ' جنيه</span>' +
                    '</div>'
                )
                : '';

            const homeAddress = [
                booking.homeGovernorate,
                booking.homeDistrict,
                booking.homeDetailedArea,
                booking.homeBuildingNumber ? 'رقم العقار: ' + booking.homeBuildingNumber : ''
            ].filter(Boolean).join(' - ');

            const patientCodeInfo = savedAppointment && savedAppointment.patient_code
                ? '<div style="background:#d4f5e9;padding:0.6rem 1rem;border-radius:10px;margin-bottom:0.8rem;">' +
                  '<i class="fas fa-id-card" style="color:#22a86e;"></i> ' +
                  '<strong>كود المريض:</strong> ' +
                  '<span style="background:#22a86e;color:white;padding:0.1rem 0.8rem;border-radius:12px;font-size:0.85rem;font-family:monospace;">' +
                  escapeHtml(savedAppointment.patient_code) + '</span>' +
                  '<br><small style="color:#1a5a3a;">احتفظ بالكود ده للمرة الجاية عشان تحجز أسرع</small>' +
                  '</div>'
                : '';

            confirmationDetailsEl.innerHTML =
                patientCodeInfo +
                packageInfo +
                '<div class="confirmation-meta">' +
                '<div><span>رقم الحجز</span><strong>' +
                escapeHtml(savedAppointment ? savedAppointment.booking_number : '') +
                '</strong></div>' +
                '<div><span>المريض</span><strong>' + escapeHtml(booking.name) + '</strong></div>' +
                '<div><span>الطبيب المحول</span><strong>' + escapeHtml(booking.referringDoctor) + '</strong></div>' +
                '<div><span>الموعد</span><strong>' +
                formatDate(booking.date) + ' - ' + escapeHtml(booking.time) +
                '</strong></div>' +
                '<div><span>مكان أخذ العينة</span><strong>' +
                escapeHtml(booking.sampleLocationDisplay) +
                '</strong></div>' +
                (booking.sampleArea
                    ? '<div><span>منطقة العينة</span><strong>' + escapeHtml(booking.sampleArea) + '</strong></div>'
                    : '') +
                (booking.sampleLocation === 'home'
                    ? '<div style="grid-column:1/-1;">' +
                      '<span>العنوان بالتفصيل</span>' +
                      '<strong>' + escapeHtml(homeAddress) + '</strong>' +
                      '<small style="display:block;margin-top:.3rem;color:#8a9aa8;">علامة مميزة: ' +
                      escapeHtml(booking.homeLandmark) + '</small>' +
                      '</div>'
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

            if (confirmationTotalEl) {
                confirmationTotalEl.textContent = formatMoney(booking.total);
            }

            const priceBox = confirmationEl ? confirmationEl.querySelector('.confirmation-price-box') : null;
            if (priceBox) {
                const homeFeeText = booking.sampleLocation === 'home'
                    ? (booking.homeVisitFeeStatus === 'confirmed'
                        ? '<div style="margin-top:.45rem;font-size:.9rem;opacity:.9;">رسوم العينة المنزلية: ' +
                          formatMoney(booking.homeVisitFee) + ' جنيه</div>'
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
            const localToday = new Date(
                today.getTime() - today.getTimezoneOffset() * 60000
            ).toISOString().slice(0, 10);
            dateInput.min = localToday;
        }

        const dateInputReturning = $('date-returning');
        if (dateInputReturning) {
            const today = new Date();
            const localToday = new Date(
                today.getTime() - today.getTimezoneOffset() * 60000
            ).toISOString().slice(0, 10);
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

    /* ============================================
       WAIT FOR EVERYTHING TO LOAD
    ============================================ */
    if (document.readyState === 'complete') {
        console.log('📄 Document already loaded, initializing immediately');
        initAppointmentSystem();
    } else {
        console.log('⏳ Waiting for window load event...');
        window.addEventListener('load', function () {
            console.log('✅ Window load event fired');
            initAppointmentSystem();
        });
    }
})();

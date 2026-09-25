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
       APP INIT
    ============================================ */
    document.addEventListener('DOMContentLoaded', function () {

        const $ = id => document.getElementById(id);

        /* ============================================
           ELEMENTS
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
           STATE
        ============================================ */
        let availableTests = [];
        let selectedTests = [];
        let currentPackage = null;
        let currentFilter = 'all';
        let searchTimeout;

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

            if (!notificationArea) return;

            const oldNotifications =
                notificationArea.querySelectorAll('.notification');

            oldNotifications.forEach(n => n.remove());

            const notification = document.createElement('div');

            notification.className =
                'notification notification-' + (type || 'info');

            const icons = {
                success: 'fa-check-circle',
                error: 'fa-times-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };

            notification.innerHTML =
                '<i class="fas ' +
                (icons[type] || icons.info) +
                '"></i><span>' +
                escapeHtml(message) +
                '</span>';

            notificationArea.appendChild(notification);

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 4500);
        }

        /* ============================================
           LOAD TESTS FROM SUPABASE
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
                        test_categories (
                            id,
                            name
                        )
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
                    category: test.test_categories
                        ? test.test_categories.name
                        : 'تحاليل'
                }));

                console.log(
                    '✅ تم تحميل ' +
                    availableTests.length +
                    ' تحليل من Supabase'
                );

                if (!availableTests.length) {

                    renderSearchResults([]);

                    showNotification(
                        'لا توجد تحاليل مسجلة في قاعدة البيانات',
                        'warning'
                    );

                    return false;
                }

                // ✅ لا نعرض النتائج تلقائياً
                // فقط ننتظر حتى يكتب المستخدم

                loadSelectedPackage();

                return true;

            } catch (error) {

                console.error(
                    '❌ خطأ في تحميل التحاليل:',
                    error
                );

                availableTests = [];

                renderSearchResults([]);

                showNotification(
                    'فشل تحميل قائمة التحاليل من Supabase',
                    'error'
                );

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
                        id,
                        name,
                        price,
                        is_active,
                        package_tests (
                            test_id,
                            sort_order,
                            tests (
                                id,
                                name,
                                price,
                                is_active
                            )
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

                console.error(
                    '❌ خطأ في تحميل الباقة:',
                    error
                );

                return null;
            }
        }

        async function loadSelectedPackage() {

            try {

                const stored =
                    localStorage.getItem('selected_package');

                if (!stored) return false;

                const parsed = JSON.parse(stored);

                if (!parsed || !parsed.name) {
                    localStorage.removeItem('selected_package');
                    return false;
                }

                let packageData = null;

                if (parsed.id) {
                    packageData =
                        await loadPackageFromSupabase(parsed.id);
                }

                if (!packageData) {

                    packageData = {
                        id: parsed.id || null,
                        name: String(parsed.name),
                        price: Number(parsed.price) || 0,
                        tests: Array.isArray(parsed.tests)
                            ? parsed.tests.map(String)
                            : []
                    };
                }

                currentPackage = packageData;

                displayPackageBanner(currentPackage);

                addPackageTests(currentPackage.tests);

                return true;

            } catch (error) {

                console.warn(
                    '❌ خطأ في قراءة الباقة:',
                    error
                );

                localStorage.removeItem('selected_package');

                return false;
            }
        }

        function displayPackageBanner(pkg) {

            if (!packageBanner) return;

            packageBanner.classList.add('visible');

            if (packageNameDisplay) {
                packageNameDisplay.textContent = pkg.name;
            }

            if (packagePriceDisplay) {
                packagePriceDisplay.textContent =
                    formatMoney(pkg.price) + ' جنيه';
            }

            if (packageTestsCount) {
                packageTestsCount.textContent =
                    pkg.tests.length;
            }
        }

        function hidePackageBanner() {

            if (packageBanner) {
                packageBanner.classList.remove('visible');
            }

            currentPackage = null;

            localStorage.removeItem('selected_package');

            updatePriceSummary();
        }

        /* ============================================
           PACKAGE TEST MATCHING
        ============================================ */
        function packageTestMatches(test, requestedName) {

            const a = normalize(test.name);
            const b = normalize(requestedName);

            if (
                a === b ||
                a.includes(b) ||
                b.includes(a)
            ) {
                return true;
            }

            const aliases = {

                'cbc': [
                    'cbc',
                    'صورة دم كاملة',
                    'صوره دم كامله',
                    'complete blood count'
                ],

                'fbs': [
                    'fbs',
                    'سكر صائم',
                    'fasting blood sugar',
                    'fasting glucose'
                ],

                'hba1c': [
                    'hba1c',
                    'السكر التراكمي',
                    'سكر تراكمي'
                ],

                'cholesterol': [
                    'cholesterol',
                    'كوليسترول',
                    'الكوليسترول'
                ],

                'hdl': ['hdl'],

                'ldl': ['ldl'],

                'triglycerides': [
                    'triglycerides',
                    'tg',
                    'دهون ثلاثية',
                    'الدهون الثلاثية'
                ],

                'creatinine': [
                    'creatinine',
                    'كرياتينين'
                ],

                'urea': [
                    'urea',
                    'يوريا'
                ],

                'uric acid': [
                    'uric acid',
                    'حمض اليوريك',
                    'اليوريك اسيد'
                ],

                'alt': [
                    'alt',
                    'sgpt'
                ],

                'ast': [
                    'ast',
                    'sgot'
                ],

                'bilirubin total': [
                    'bilirubin total',
                    'total bilirubin',
                    'بيليروبين كلي',
                    'البيليروبين الكلي'
                ],

                'bilirubin direct': [
                    'bilirubin direct',
                    'direct bilirubin',
                    'بيليروبين مباشر',
                    'البيليروبين المباشر'
                ],

                'albumin': [
                    'albumin',
                    'البيومين',
                    'ألبومين'
                ],

                'urine analysis': [
                    'urine analysis',
                    'urinalysis',
                    'تحليل بول',
                    'بول كامل'
                ],

                'stool analysis': [
                    'stool analysis',
                    'تحليل براز',
                    'براز كامل'
                ],

                'h.pylori': [
                    'h pylori',
                    'h. pylori',
                    'جرثومة المعدة',
                    'هيليكوباكتر'
                ],

                'occult blood in stool': [
                    'occult blood',
                    'دم خفي في البراز',
                    'الدم الخفي في البراز'
                ],

                'microalbumin': [
                    'microalbumin',
                    'micro albumin',
                    'ميكروالبومين',
                    'ميكرو ألبومين'
                ],

                'tsh': [
                    'tsh',
                    'thyroid stimulating hormone'
                ],

                'free t3': [
                    'free t3',
                    'ft3',
                    't3'
                ],

                'free t4': [
                    'free t4',
                    'ft4',
                    't4'
                ],

                'vitamin d': [
                    'vitamin d',
                    '25 oh vitamin d',
                    'فيتامين d',
                    'فيتامين د'
                ],

                'vitamin b12': [
                    'vitamin b12',
                    'b12',
                    'فيتامين b12',
                    'فيتامين ب12'
                ],

                'ferritin': [
                    'ferritin',
                    'مخزون الحديد',
                    'الفيريتين'
                ]
            };

            const list = aliases[b] || [];

            return list.some(alias => {

                const x = normalize(alias);

                return (
                    a === x ||
                    a.includes(x) ||
                    x.includes(a)
                );
            });
        }

        function addPackageTests(testNames) {

            if (!currentPackage) return;

            const matchedTests = [];
            const notFound = [];

            testNames.forEach(testName => {

                const found = availableTests.find(test =>
                    packageTestMatches(test, testName)
                );

                if (found) {

                    if (!selectedTests.some(t => t.id === found.id)) {

                        matchedTests.push({
                            ...found,
                            isPackageTest: true,
                            packageName: currentPackage.name
                        });

                    } else {

                        const existing =
                            selectedTests.find(t => t.id === found.id);

                        existing.isPackageTest = true;
                        existing.packageName = currentPackage.name;
                    }

                } else {

                    notFound.push(testName);
                }
            });

            matchedTests.forEach(test =>
                selectedTests.push(test)
            );

            renderSelectedTests();

            updatePriceSummary();

            if (notFound.length) {

                showNotification(
                    'بعض تحاليل الباقة غير موجودة: ' +
                    notFound.join(', '),
                    'warning'
                );
            }
        }

        function clearPackage() {

            selectedTests =
                selectedTests.filter(
                    test => !test.isPackageTest
                );

            hidePackageBanner();

            renderSelectedTests();

            updatePriceSummary();

            showNotification(
                'تم إلغاء الباقة المختارة',
                'info'
            );
        }

        if (clearPackageBtn) {
            clearPackageBtn.addEventListener(
                'click',
                clearPackage
            );
        }

        /* ============================================
           SEARCH
        ============================================ */
        function categoryTerms(category) {

            const groups = {

                'وظائف الكلى': [
                    'وظائف الكلى',
                    'كلى',
                    'kidney',
                    'renal',
                    'urea',
                    'creatinine',
                    'uric acid',
                    'microalbumin'
                ],

                'وظائف الكبد': [
                    'وظائف الكبد',
                    'كبد',
                    'liver',
                    'alt',
                    'ast',
                    'alp',
                    'bilirubin',
                    'albumin'
                ],

                'الدهون': [
                    'الدهون',
                    'دهون',
                    'lipid',
                    'cholesterol',
                    'hdl',
                    'ldl',
                    'triglycerides',
                    'tg'
                ],

                'السكر': [
                    'السكر',
                    'سكر',
                    'glucose',
                    'diabetes',
                    'fbs',
                    'hba1c'
                ],

                'الغدة الدرقية': [
                    'الغدة الدرقية',
                    'غدة درقية',
                    'thyroid',
                    'tsh',
                    'free t3',
                    'free t4'
                ],

                'الفيتامينات': [
                    'الفيتامينات',
                    'فيتامين',
                    'vitamin'
                ],

                'دم كامل': [
                    'دم كامل',
                    'صورة دم',
                    'cbc',
                    'blood'
                ],

                'بول': [
                    'بول',
                    'urine',
                    'urinalysis'
                ],

                'براز': [
                    'براز',
                    'stool',
                    'feces',
                    'occult blood'
                ]
            };

            return groups[category] || [category];
        }

        function testMatchesCategory(test, category) {

            const haystack = normalize([
                test.name,
                test.category
            ].filter(Boolean).join(' '));

            return categoryTerms(category).some(
                term =>
                    haystack.includes(
                        normalize(term)
                    )
            );
        }

        function searchTests(query, filter) {

            if (!availableTests.length) return [];

            const q = normalize(query);

            let results = availableTests;

            if (filter && filter !== 'all') {

                results =
                    results.filter(test =>
                        testMatchesCategory(
                            test,
                            filter
                        )
                    );
            }

            if (q) {

                results =
                    results.filter(test => {

                        const haystack =
                            normalize([
                                test.name,
                                test.category
                            ]
                            .filter(Boolean)
                            .join(' '));

                        return (
                            haystack.includes(q) ||
                            categoryTerms(query).some(
                                term =>
                                    haystack.includes(
                                        normalize(term)
                                    )
                            )
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

                const item =
                    document.createElement('div');

                item.className = 'result-item';

                const isAdded =
                    selectedTests.some(
                        t => t.id === test.id
                    );

                const info =
                    document.createElement('div');

                info.className = 'test-info';

                info.innerHTML =
                    '<span class="test-name">' +
                    escapeHtml(test.name) +
                    '</span>' +
                    '<span class="test-category">' +
                    '<i class="fas fa-folder"></i> ' +
                    escapeHtml(
                        test.category || 'تحاليل'
                    ) +
                    '</span>';

                const priceEl =
                    document.createElement('span');

                priceEl.className = 'test-price';

                priceEl.textContent =
                    Number.isFinite(test.price)
                        ? formatMoney(test.price) +
                          ' جنيه'
                        : 'السعر غير مسجل';

                const addBtn =
                    document.createElement('button');

                addBtn.type = 'button';

                addBtn.className =
                    'add-btn' +
                    (isAdded ? ' added' : '');

                addBtn.innerHTML =
                    isAdded
                        ? '<i class="fas fa-check"></i>'
                        : '<i class="fas fa-plus"></i>';

                addBtn.title =
                    isAdded
                        ? 'تم الإضافة'
                        : 'إضافة التحليل';

                addBtn.addEventListener(
                    'click',
                    e => {
                        e.stopPropagation();
                        toggleTest(test);
                    }
                );

                item.addEventListener(
                    'click',
                    () => toggleTest(test)
                );

                item.append(
                    info,
                    priceEl,
                    addBtn
                );

                searchResults.appendChild(item);
            });
        }

        function toggleTest(test) {

            const index =
                selectedTests.findIndex(
                    t => t.id === test.id
                );

            if (index > -1) {

                if (
                    selectedTests[index].isPackageTest
                ) {
                    showNotification(
                        'هذا التحليل تابع للباقة ولا يمكن حذفه منفردًا',
                        'warning'
                    );
                    return;
                }

                selectedTests.splice(index, 1);

                showNotification(
                    'تم إزالة "' +
                    test.name +
                    '"',
                    'info'
                );

            } else {

                selectedTests.push({
                    ...test,
                    isPackageTest: false
                });

                showNotification(
                    'تم إضافة "' +
                    test.name +
                    '"',
                    'success'
                );
            }

            renderSelectedTests();

            updatePriceSummary();

            applyCurrentSearch();
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

                const row =
                    document.createElement('div');

                row.className =
                    'selected-test' +
                    (test.isPackageTest
                        ? ' package-test'
                        : '');

                const info =
                    document.createElement('div');

                info.className =
                    'selected-test-info';

                const name =
                    document.createElement('span');

                name.className =
                    'selected-test-name';

                name.textContent =
                    test.name;

                const price =
                    document.createElement('span');

                price.className =
                    'selected-test-price';

                if (test.isPackageTest) {

                    price.className +=
                        ' package-test-badge';

                    price.innerHTML =
                        '<i class="fas fa-gift"></i> ' +
                        'ضمن الباقة — بدون سعر منفصل';

                } else {

                    price.textContent =
                        Number.isFinite(test.price)
                            ? formatMoney(test.price) +
                              ' جنيه'
                            : 'السعر غير مسجل';
                }

                info.append(
                    name,
                    price
                );

                const remove =
                    document.createElement('button');

                remove.type = 'button';

                remove.className =
                    'remove-test';

                if (test.isPackageTest) {

                    remove.innerHTML =
                        '<i class="fas fa-lock"></i>';

                    remove.title =
                        'تحليل تابع للباقة';

                    remove.disabled = true;

                    remove.style.opacity = '0.55';

                    remove.style.cursor =
                        'not-allowed';

                } else {

                    remove.innerHTML =
                        '<i class="fas fa-times"></i>';

                    remove.title =
                        'حذف التحليل';

                    remove.addEventListener(
                        'click',
                        e => {

                            e.stopPropagation();

                            selectedTests =
                                selectedTests.filter(
                                    t => t.id !== test.id
                                );

                            renderSelectedTests();

                            updatePriceSummary();

                            applyCurrentSearch();

                            showNotification(
                                'تم إزالة "' +
                                test.name +
                                '"',
                                'info'
                            );
                        }
                    );
                }

                row.append(
                    info,
                    remove
                );

                selectedTestsList.appendChild(row);
            });
        }

        function updatePriceSummary() {

            const packagePrice =
                currentPackage
                    ? Number(currentPackage.price) || 0
                    : 0;

            const individualTests =
                selectedTests.filter(
                    test => !test.isPackageTest
                );

            const individualTotal =
                individualTests.reduce(
                    (sum, test) =>
                        sum +
                        (
                            Number.isFinite(test.price)
                                ? Number(test.price)
                                : 0
                        ),
                    0
                );

            const missing =
                individualTests.filter(
                    test =>
                        !Number.isFinite(test.price)
                ).length;

            const total =
                packagePrice +
                individualTotal;

            if (testsCountEl) {
                testsCountEl.textContent =
                    selectedTests.length;
            }

            if (packagePriceRow) {
                packagePriceRow.style.display =
                    currentPackage
                        ? 'flex'
                        : 'none';
            }

            if (packagePriceSummaryEl) {
                packagePriceSummaryEl.textContent =
                    formatMoney(packagePrice) +
                    ' جنيه';
            }

            if (individualTestsTotalEl) {
                individualTestsTotalEl.textContent =
                    formatMoney(individualTotal) +
                    ' جنيه';
            }

            if (testsTotalEl) {
                testsTotalEl.textContent =
                    formatMoney(total);
            }

            if (priceWarningEl) {
                priceWarningEl.style.display =
                    missing
                        ? 'flex'
                        : 'none';
            }
        }

        function applyCurrentSearch() {

            if (!searchInput || !searchResults) return;

            const query =
                searchInput.value.trim();

            if (
                (query || currentFilter !== 'all') &&
                availableTests.length
            ) {

                renderSearchResults(
                    searchTests(
                        query,
                        currentFilter
                    )
                );

            } else {

                searchResults.classList.remove(
                    'active'
                );
            }
        }

        /* ============================================
           SEARCH EVENTS
           ✅ البحث فقط عند الكتابة الفعلية
        ============================================ */
        if (searchInput) {

            searchInput.addEventListener(
                'input',
                function () {

                    clearTimeout(searchTimeout);

                    const query =
                        this.value.trim();

                    if (clearSearchBtn) {
                        clearSearchBtn.classList.toggle(
                            'visible',
                            query.length > 0
                        );
                    }

                    // ✅ لو مفيش كتابة → اقفل النتائج
                    if (!query && currentFilter === 'all') {

                        searchResults.classList.remove(
                            'active'
                        );

                        return;
                    }

                    // ✅ لو فيه كتابة → ابحث
                    searchTimeout =
                        setTimeout(
                            () =>
                                renderSearchResults(
                                    searchTests(
                                        query,
                                        currentFilter
                                    )
                                ),
                            150
                        );
                }
            );

            // ✅ لا نفتح النتائج تلقائياً عند التركيز
            // فقط نتركها فاضية لحد ما المستخدم يكتب
        }

        document.addEventListener(
            'click',
            function (e) {

                if (
                    searchResults &&
                    searchInput &&
                    !searchResults.contains(e.target) &&
                    e.target !== searchInput
                ) {
                    searchResults.classList.remove(
                        'active'
                    );
                }
            }
        );

        if (clearSearchBtn) {

            clearSearchBtn.addEventListener(
                'click',
                function () {

                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.focus();
                    }

                    if (searchResults) {
                        searchResults.classList.remove(
                            'active'
                        );
                    }

                    this.classList.remove(
                        'visible'
                    );
                }
            );
        }

        if (clearAllBtn) {

            clearAllBtn.addEventListener(
                'click',
                function () {

                    if (!selectedTests.length) {

                        showNotification(
                            'لا توجد تحاليل لحذفها',
                            'warning'
                        );

                        return;
                    }

                    if (currentPackage) {

                        if (
                            !confirm(
                                'سيتم حذف جميع التحاليل بما فيها تحاليل الباقة المختارة. هل أنت متأكد؟'
                            )
                        ) {
                            return;
                        }
                    }

                    selectedTests = [];

                    if (currentPackage) {
                        hidePackageBanner();
                    }

                    renderSelectedTests();

                    updatePriceSummary();

                    applyCurrentSearch();

                    showNotification(
                        'تم حذف كل التحاليل المختارة',
                        'info'
                    );
                }
            );
        }

        /* ============================================
           SAMPLE LOCATION
        ============================================ */
        document
            .querySelectorAll(
                'input[name="sample-location"]'
            )
            .forEach(radio => {

                radio.addEventListener(
                    'change',
                    function () {

                        if (sampleLocationGroup) {
                            sampleLocationGroup.classList.remove(
                                'is-invalid'
                            );
                        }

                        updateHomeVisitUI();
                    }
                );
            });

        function updateHomeVisitUI() {

            const selected =
                document.querySelector(
                    'input[name="sample-location"]:checked'
                );

            const isHome =
                selected &&
                (
                    selected.value === 'عينة منزلية' ||
                    selected.value === 'home'
                );

            if (homeVisitDetails) {
                homeVisitDetails.style.display =
                    isHome
                        ? 'block'
                        : 'none';
            }

            if (!isHome) {

                if (homeVisitFeeEl) {

                    homeVisitFeeEl.style.display =
                        'none';

                    homeVisitFeeEl.textContent =
                        '';
                }

                return;
            }

            const area =
                homeArea
                    ? homeArea.value.trim()
                    : '';

            if (homeVisitFeeEl) {

                if (
                    area === 'الحي الحداشر'
                ) {

                    homeVisitFeeEl.style.display =
                        'block';

                    homeVisitFeeEl.innerHTML =
                        '<i class="fas fa-house-chimney"></i> ' +
                        'رسوم العينة المنزلية: ' +
                        '<strong>100 جنيه</strong>';

                } else if (
                    area === 'خارج الحي الحداشر'
                ) {

                    homeVisitFeeEl.style.display =
                        'block';

                    homeVisitFeeEl.innerHTML =
                        '<i class="fas fa-route"></i> ' +
                        'رسوم الانتقال: ' +
                        '<strong>تُحدد حسب المسافة والمكان</strong>';

                } else {

                    homeVisitFeeEl.style.display =
                        'none';

                    homeVisitFeeEl.textContent =
                        '';
                }
            }
        }

        if (homeArea) {

            homeArea.addEventListener(
                'change',
                updateHomeVisitUI
            );

            homeArea.addEventListener(
                'input',
                updateHomeVisitUI
            );
        }

        /* ============================================
           VALIDATION
        ============================================ */
        function validateForm() {

            let valid = true;

            const required = [
                'fullname',
                'phone',
                'date',
                'time',
                'referringDoctor',
                'referral-source'
            ];

            required.forEach(id => {

                const field = $(id);

                const empty =
                    !field ||
                    !String(field.value).trim();

                if (field) {
                    field.classList.toggle(
                        'is-invalid',
                        empty
                    );
                }

                if (empty) {
                    valid = false;
                }
            });

            const sampleLocation =
                document.querySelector(
                    'input[name="sample-location"]:checked'
                );

            if (sampleLocationGroup) {

                sampleLocationGroup.classList.toggle(
                    'is-invalid',
                    !sampleLocation
                );
            }

            if (!sampleLocation) {
                valid = false;
            }

            const isHome =
                sampleLocation &&
                (
                    sampleLocation.value ===
                    'عينة منزلية' ||
                    sampleLocation.value ===
                    'home'
                );

            if (isHome) {

                [
                    homeGovernorate,
                    homeDistrict,
                    homeArea,
                    homeBuildingNumber,
                    homeLandmark
                ].forEach(field => {

                    if (!field) return;

                    const missing =
                        !String(
                            field.value || ''
                        ).trim();

                    field.classList.toggle(
                        'is-invalid',
                        missing
                    );

                    if (missing) {
                        valid = false;
                    }
                });

            } else {

                [
                    homeGovernorate,
                    homeDistrict,
                    homeArea,
                    homeBuildingNumber,
                    homeLandmark
                ].forEach(field => {

                    if (field) {
                        field.classList.remove(
                            'is-invalid'
                        );
                    }
                });
            }

            const phone = $('phone');

            if (phone) {

                const phoneValue =
                    phone.value.replace(
                        /\D/g,
                        ''
                    );

                const phoneValid =
                    /^01\d{9}$/.test(phoneValue);

                if (!phoneValid) {

                    phone.classList.add(
                        'is-invalid'
                    );

                    valid = false;

                } else {

                    phone.classList.remove(
                        'is-invalid'
                    );
                }
            }

            if (!selectedTests.length) {

                showNotification(
                    'الرجاء اختيار تحليل واحد على الأقل',
                    'error'
                );

                valid = false;
            }

            return valid;
        }

        /* ============================================
           COLLECT BOOKING DATA
        ============================================ */
        function collectBookingData() {

            const packagePrice =
                currentPackage
                    ? Number(currentPackage.price) || 0
                    : 0;

            const individualTests =
                selectedTests.filter(
                    test => !test.isPackageTest
                );

            const individualTestsTotal =
                individualTests.reduce(
                    (sum, test) =>
                        sum +
                        (
                            Number.isFinite(test.price)
                                ? Number(test.price)
                                : 0
                        ),
                    0
                );

            const testsTotal =
                packagePrice +
                individualTestsTotal;

            const selected =
                document.querySelector(
                    'input[name="sample-location"]:checked'
                );

            const isHome =
                selected &&
                (
                    selected.value ===
                    'عينة منزلية' ||
                    selected.value ===
                    'home'
                );

            const location =
                isHome
                    ? 'home'
                    : 'lab';

            const area =
                homeArea
                    ? homeArea.value.trim()
                    : '';

            let homeVisitFee = 0;

            let feeStatus = 'pending';

            if (location === 'home') {

                if (
                    area ===
                    'الحي الحداشر'
                ) {

                    homeVisitFee = 100;
                    feeStatus = 'confirmed';

                } else {

                    homeVisitFee = 0;
                    feeStatus = 'pending';
                }
            }

            return {

                name: $('fullname')
                    ? $('fullname').value.trim()
                    : '',

                phone: $('phone')
                    ? $('phone').value.trim()
                    : '',

                age: $('age') &&
                    $('age').value
                    ? Number($('age').value)
                    : null,

                gender:
                    $('gender') &&
                    $('gender').value
                        ? $('gender').value
                        : null,

                referral:
                    $('referral-source')
                        ? $('referral-source').value
                        : '',

                referringDoctor:
                    $('referringDoctor')
                        ? $('referringDoctor').value.trim()
                        : '',

                sampleLocation: location,

                sampleLocationDisplay:
                    isHome
                        ? 'عينة منزلية'
                        : 'عينة في المعمل',

                sampleArea: area,

                homeGovernorate:
                    homeGovernorate
                        ? homeGovernorate.value
                        : '',

                homeDistrict:
                    homeDistrict
                        ? homeDistrict.value.trim()
                        : '',

                homeDetailedArea:
                    homeArea
                        ? homeArea.value.trim()
                        : '',

                homeBuildingNumber:
                    homeBuildingNumber
                        ? homeBuildingNumber.value.trim()
                        : '',

                homeLandmark:
                    homeLandmark
                        ? homeLandmark.value.trim()
                        : '',

                homeVisitFee,

                homeVisitFeeStatus:
                    feeStatus,

                date:
                    $('date')
                        ? $('date').value
                        : '',

                time:
                    $('time')
                        ? $('time').value
                        : '',

                notes:
                    $('notes')
                        ? $('notes').value.trim()
                        : '',

                tests: [...selectedTests],

                testsTotal,

                individualTestsTotal,

                packagePrice,

                total:
                    testsTotal +
                    homeVisitFee,

                missing:
                    individualTests.some(
                        t =>
                            !Number.isFinite(
                                t.price
                            )
                    ),

                package:
                    currentPackage
                        ? {
                            id:
                                currentPackage.id ||
                                null,

                            name:
                                currentPackage.name,

                            price:
                                packagePrice,

                            tests:
                                [
                                    ...currentPackage.tests
                                ]
                        }
                        : null
            };
        }

        function formatDate(value) {

            if (!value) {
                return 'غير محدد';
            }

            return new Date(
                value + 'T00:00:00'
            ).toLocaleDateString(
                'ar-EG',
                {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }
            );
        }

        /* ============================================
           DAILY NUMBER + BOOKING NUMBER
        ============================================ */
        async function getDailyNumber(appointmentDate) {

            const { data, error } =
                await supabaseClient
                    .from('appointments')
                    .select('daily_number')
                    .eq(
                        'appointment_date',
                        appointmentDate
                    )
                    .order(
                        'daily_number',
                        {
                            ascending: false
                        }
                    )
                    .limit(1);

            if (error) {
                throw error;
            }

            if (!data || !data.length) {
                return 1;
            }

            return (
                Number(
                    data[0].daily_number
                ) || 0
            ) + 1;
        }

        function generateBookingNumber() {

            const now =
                new Date();

            const datePart =
                now.toISOString()
                    .slice(0, 10)
                    .replace(/-/g, '');

            const timePart =
                Date.now()
                    .toString()
                    .slice(-6);

            return (
                'BK-' +
                datePart +
                '-' +
                timePart
            );
        }

        /* ============================================
           SAVE BOOKING
        ============================================ */
        async function saveBooking(booking) {

            let patientId = null;
            let appointmentId = null;

            try {

                const { data: patient, error: patientError } =
                    await supabaseClient
                        .from('patients')
                        .insert({
                            full_name: booking.name,
                            phone: booking.phone,
                            age: booking.age,
                            gender: booking.gender
                        })
                        .select('id')
                        .single();

                if (patientError) {
                    throw patientError;
                }

                patientId = patient.id;

                const bookingNumber =
                    generateBookingNumber();

                const dailyNumber =
                    await getDailyNumber(
                        booking.date
                    );

                const appointmentData = {

                    booking_number:
                        bookingNumber,

                    daily_number:
                        dailyNumber,

                    patient_id:
                        patient.id,

                    appointment_date:
                        booking.date,

                    appointment_time:
                        booking.time,

                    referring_doctor:
                        booking.referringDoctor,

                    referral_source:
                        booking.referral,

                    sample_location:
                        booking.sampleLocation,

                    home_governorate:
                        booking.homeGovernorate || null,

                    home_district:
                        booking.homeDistrict || null,

                    home_detailed_area:
                        booking.homeDetailedArea || null,

                    home_building_number:
                        booking.homeBuildingNumber || null,

                    home_landmark:
                        booking.homeLandmark || null,

                    home_visit_fee:
                        booking.homeVisitFee,

                    home_visit_fee_status:
                        booking.homeVisitFeeStatus,

                    tests_total:
                        booking.testsTotal,

                    total:
                        booking.total,

                    package_id:
                        booking.package
                            ? booking.package.id
                            : null,

                    package_name_snapshot:
                        booking.package
                            ? booking.package.name
                            : null,

                    package_price:
                        booking.package
                            ? booking.package.price
                            : null,

                    notes:
                        booking.notes,

                    status:
                        'new'
                };

                const {
                    data: appointment,
                    error: appointmentError
                } = await supabaseClient
                    .from('appointments')
                    .insert(appointmentData)
                    .select(
                        'id, booking_number, daily_number'
                    )
                    .single();

                if (appointmentError) {
                    throw appointmentError;
                }

                appointmentId =
                    appointment.id;

                const testsData =
                    booking.tests.map(
                        test => ({
                            appointment_id:
                                appointment.id,

                            test_id:
                                test.id,

                            test_name_snapshot:
                                test.name,

                            price_snapshot:
                                test.isPackageTest
                                    ? 0
                                    : (
                                        Number.isFinite(
                                            test.price
                                        )
                                            ? Number(
                                                test.price
                                            )
                                            : 0
                                    )
                        })
                    );

                if (testsData.length) {

                    const {
                        error: testsError
                    } = await supabaseClient
                        .from('appointment_tests')
                        .insert(testsData);

                    if (testsError) {
                        throw testsError;
                    }
                }

                return appointment;

            } catch (error) {

                console.error(
                    '❌ خطأ في حفظ الحجز:',
                    error
                );

                if (appointmentId) {

                    await supabaseClient
                        .from('appointment_tests')
                        .delete()
                        .eq(
                            'appointment_id',
                            appointmentId
                        );

                    await supabaseClient
                        .from('appointments')
                        .delete()
                        .eq(
                            'id',
                            appointmentId
                        );
                }

                if (patientId) {

                    await supabaseClient
                        .from('patients')
                        .delete()
                        .eq(
                            'id',
                            patientId
                        );
                }

                throw error;
            }
        }

        /* ============================================
           BUILD CONFIRMATION
        ============================================ */
        function buildBookingConfirmation(
            booking,
            savedAppointment
        ) {

            const rows =
                booking.tests.map(
                    (test, index) => {

                        const shownPrice =
                            test.isPackageTest
                                ? '<span style="color:#2a6a9a;">ضمن الباقة</span>'
                                : (
                                    Number.isFinite(
                                        test.price
                                    )
                                        ? formatMoney(
                                            test.price
                                        ) +
                                        ' جنيه'
                                        : 'السعر غير مسجل'
                                );

                        return (
                            '<div class="confirmation-test-row">' +
                            '<span><b>' +
                            (index + 1) +
                            '.</b> ' +
                            escapeHtml(test.name) +
                            '</span>' +
                            '<strong>' +
                            shownPrice +
                            '</strong>' +
                            '</div>'
                        );
                    }
                ).join('');

            const packageInfo =
                booking.package
                    ? (
                        '<div style="background:#e8f4fd;padding:0.6rem 1rem;border-radius:10px;margin-bottom:0.8rem;">' +
                        '<i class="fas fa-gift" style="color:#2a6a9a;"></i> ' +
                        '<strong>الباقة المختارة:</strong> ' +
                        escapeHtml(
                            booking.package.name
                        ) +
                        ' <span style="background:#2a6a9a;color:white;padding:0.1rem 0.8rem;border-radius:12px;font-size:0.85rem;">' +
                        formatMoney(
                            booking.package.price
                        ) +
                        ' جنيه</span>' +
                        '</div>'
                    )
                    : '';

            const homeAddress =
                [
                    booking.homeGovernorate,
                    booking.homeDistrict,
                    booking.homeDetailedArea,
                    booking.homeBuildingNumber
                        ? 'رقم العقار: ' +
                        booking.homeBuildingNumber
                        : ''
                ]
                .filter(Boolean)
                .join(' - ');

            confirmationDetailsEl.innerHTML =
                packageInfo +

                '<div class="confirmation-meta">' +

                '<div><span>رقم الحجز</span><strong>' +
                escapeHtml(
                    savedAppointment
                        ? savedAppointment.booking_number
                        : ''
                ) +
                '</strong></div>' +

                '<div><span>رقم المريض اليومي</span><strong>' +
                escapeHtml(
                    String(
                        savedAppointment
                            ? savedAppointment.daily_number
                            : ''
                    )
                ) +
                '</strong></div>' +

                '<div><span>المريض</span><strong>' +
                escapeHtml(
                    booking.name
                ) +
                '</strong></div>' +

                '<div><span>الطبيب المحول</span><strong>' +
                escapeHtml(
                    booking.referringDoctor
                ) +
                '</strong></div>' +

                '<div><span>الموعد</span><strong>' +
                formatDate(
                    booking.date
                ) +
                ' - ' +
                escapeHtml(
                    booking.time
                ) +
                '</strong></div>' +

                '<div><span>مكان أخذ العينة</span><strong>' +
                escapeHtml(
                    booking.sampleLocationDisplay
                ) +
                '</strong></div>' +

                (
                    booking.sampleArea
                        ? '<div><span>منطقة العينة</span><strong>' +
                        escapeHtml(
                            booking.sampleArea
                        ) +
                        '</strong></div>'
                        : ''
                ) +

                (
                    booking.sampleLocation === 'home'
                        ? '<div style="grid-column:1/-1;">' +
                        '<span>العنوان بالتفصيل</span>' +
                        '<strong>' +
                        escapeHtml(
                            homeAddress
                        ) +
                        '</strong>' +
                        '<small style="display:block;margin-top:.3rem;color:#8a9aa8;">علامة مميزة: ' +
                        escapeHtml(
                            booking.homeLandmark
                        ) +
                        '</small>' +
                        '</div>'
                        : ''
                ) +

                '<div><span>عرفتنا منين</span><strong>' +
                escapeHtml(
                    booking.referral
                ) +
                '</strong></div>' +

                '</div>' +

                '<div class="confirmation-tests">' +
                '<div class="confirmation-tests-title">' +
                'تفاصيل التحاليل (' +
                booking.tests.length +
                ')' +
                '</div>' +
                rows +
                '</div>' +

                (
                    booking.notes
                        ? '<div class="confirmation-notes">' +
                        '<b>ملاحظات:</b> ' +
                        escapeHtml(
                            booking.notes
                        ) +
                        '</div>'
                        : ''
                );

            if (confirmationTotalEl) {

                confirmationTotalEl.textContent =
                    formatMoney(
                        booking.total
                    );
            }

            const priceBox =
                confirmationEl
                    ? confirmationEl.querySelector(
                        '.confirmation-price-box'
                    )
                    : null;

            if (priceBox) {

                const homeFeeText =
                    booking.sampleLocation === 'home'
                        ? (
                            booking.homeVisitFeeStatus ===
                            'confirmed'
                                ? (
                                    '<div style="margin-top:.45rem;font-size:.9rem;opacity:.9;">رسوم العينة المنزلية: ' +
                                    formatMoney(
                                        booking.homeVisitFee
                                    ) +
                                    ' جنيه</div>'
                                )
                                : (
                                    '<div style="margin-top:.45rem;font-size:.9rem;opacity:.9;">رسوم العينة المنزلية خارج الحي الحداشر: تُحدد حسب المسافة والمكان</div>'
                                )
                        )
                        : (
                            '<div style="margin-top:.45rem;font-size:.9rem;opacity:.9;">رسوم العينة: بدون رسوم منزلية</div>'
                        );

                priceBox.innerHTML =
                    '<span>إجمالي أسعار الموقع + رسوم العينة</span>' +
                    '<strong><span id="confirmation-total">' +
                    formatMoney(
                        booking.total
                    ) +
                    '</span> جنيه</strong>' +
                    homeFeeText;
            }
        }

        /* ============================================
           FORM SUBMIT
        ============================================ */
        if (appointmentForm) {

            appointmentForm.addEventListener(
                'submit',
                async function (e) {

                    e.preventDefault();

                    if (!validateForm()) {
                        return;
                    }

                    const btnText =
                        $('btn-text');

                    const spinner =
                        $('btn-spinner');

                    if (submitBtn) {
                        submitBtn.disabled = true;
                    }

                    if (btnText) {
                        btnText.textContent =
                            'جاري حفظ الحجز...';
                    }

                    if (spinner) {
                        spinner.style.display =
                            'inline-block';
                    }

                    try {

                        const booking =
                            collectBookingData();

                        const savedAppointment =
                            await saveBooking(
                                booking
                            );

                        buildBookingConfirmation(
                            booking,
                            savedAppointment
                        );

                        showNotification(
                            'تم حفظ الحجز بنجاح في النظام!',
                            'success'
                        );

                        if (confirmationEl) {

                            confirmationEl.style.display =
                                'flex';

                            confirmationEl.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }

                        appointmentForm.reset();

                        if (sampleLocationGroup) {

                            sampleLocationGroup.classList.remove(
                                'is-invalid'
                            );
                        }

                        [
                            homeGovernorate,
                            homeDistrict,
                            homeArea,
                            homeBuildingNumber,
                            homeLandmark
                        ].forEach(field => {

                            if (field) {

                                field.classList.remove(
                                    'is-invalid'
                                );
                            }
                        });

                        updateHomeVisitUI();

                        selectedTests = [];

                        if (currentPackage) {
                            hidePackageBanner();
                        }

                        renderSelectedTests();

                        updatePriceSummary();

                        if (searchResults) {
                            searchResults.classList.remove(
                                'active'
                            );
                        }

                        if (searchInput) {
                            searchInput.value = '';
                        }

                        if (clearSearchBtn) {
                            clearSearchBtn.classList.remove(
                                'visible'
                            );
                        }

                    } catch (error) {

                        console.error(
                            '❌ Supabase booking error:',
                            error
                        );

                        let message =
                            'حدث خطأ أثناء حفظ الحجز.';

                        if (
                            error &&
                            error.message
                        ) {
                            message +=
                                ' ' +
                                error.message;
                        }

                        showNotification(
                            message,
                            'error'
                        );

                    } finally {

                        if (submitBtn) {
                            submitBtn.disabled = false;
                        }

                        if (btnText) {
                            btnText.textContent =
                                'تأكيد الحجز';
                        }

                        if (spinner) {
                            spinner.style.display =
                                'none';
                        }
                    }
                }
            );
        }

        /* ============================================
           DATE MIN
        ============================================ */
        const dateInput = $('date');

        if (dateInput) {

            const today =
                new Date();

            const localToday =
                new Date(
                    today.getTime() -
                    today.getTimezoneOffset() *
                    60000
                )
                .toISOString()
                .slice(0, 10);

            dateInput.min =
                localToday;
        }

        /* ============================================
           INITIAL LOAD
        ============================================ */
        renderSelectedTests();

        updatePriceSummary();

        updateHomeVisitUI();

        loadTestsFromSource();

    });

})();
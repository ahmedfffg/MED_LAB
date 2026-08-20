// دالة البحث عن التحاليل
function setupSearchFunctionality() {
    const searchInput = document.getElementById('tests-search');
    const allTestsData = {
        "تحاليل الدم (Blood Tests)": [
            "CBC (صورة دم كاملة)",
            "ESR (تحليل سرعة ترسيب الدم)",
            "Reticulocyte Count (عدد الخلايا الشبكية)",
            "Blood Film (شريحة الدم)",
            "Iron (الحديد)",
            "Ferritin (فيريتين)",
            "TIBC (السعة الكلية للحديد)",
            "Transferrin (ترانسفيرين)",
            "Vitamin B12 (فيتامين ب12)",
            "Folic Acid (حمض الفوليك)",
            "Hemoglobin Electrophoresis (هيموجلوبين كهربائي)"
        ],
        // ... (بقية التحاليل كما هي في الكود الأصلي)
    };

    // تحويل بيانات التحاليل إلى مصفوفة مسطحة للبحث
    function flattenTests(testsData) {
        let allTests = [];
        for (const [category, tests] of Object.entries(testsData)) {
            if (Array.isArray(tests)) {
                allTests.push(...tests.map(test => ({
                    name: test,
                    category: category
                })));
            } else {
                for (const [subCategory, subTests] of Object.entries(tests)) {
                    allTests.push(...subTests.map(test => ({
                        name: test,
                        category: `${category} - ${subCategory}`
                    })));
                }
            }
        }
        return allTests;
    }

    const allTests = flattenTests(allTestsData);

    // دالة البحث الضبابي (Fuzzy Search)
    function fuzzySearch(query, items) {
        if (!query || query.trim() === '') {
            return items; // إرجاع جميع العناصر إذا كان حقل البحث فارغاً
        }
        
        const queryLower = query.toLowerCase().trim();
        return items.filter(item => {
            const itemLower = item.name.toLowerCase();
            
            // بحث مباشر
            if (itemLower.includes(queryLower)) return true;
            
            // بحث باللغة الأخرى (الإنجليزية/العربية)
            const englishPart = item.name.match(/\(([^)]+)\)/);
            if (englishPart && englishPart[1].toLowerCase().includes(queryLower)) {
                return true;
            }
            
            // البحث في الجزء العربي (إذا كان البحث بالعربية)
            const arabicPart = item.name.split('(')[0].trim().toLowerCase();
            if (arabicPart.includes(queryLower)) return true;
            
            // بحث تقريبي (Fuzzy) - مطابقة الأحرف بالترتيب
            let queryIndex = 0;
            for (let i = 0; i < itemLower.length; i++) {
                if (itemLower[i] === queryLower[queryIndex]) {
                    queryIndex++;
                    if (queryIndex === queryLower.length) return true;
                }
            }
            return false;
        });
    }

    // عرض نتائج البحث
    function displaySearchResults(results) {
        const testsContainer = document.getElementById('tests-container');
        testsContainer.innerHTML = '';
        
        if (results.length === 0) {
            testsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray-dark);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>لا توجد نتائج مطابقة للبحث</p>
                </div>
            `;
            return;
        }
        
        // تجميع النتائج حسب الفئة
        const resultsByCategory = {};
        results.forEach(test => {
            if (!resultsByCategory[test.category]) {
                resultsByCategory[test.category] = [];
            }
            resultsByCategory[test.category].push(test.name);
        });
        
        // عرض النتائج المجمعة
        for (const [category, tests] of Object.entries(resultsByCategory)) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'test-category';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);
            
            const testsGrid = document.createElement('div');
            testsGrid.className = 'tests-grid';
            
            tests.forEach(test => {
                testsGrid.appendChild(createTestCheckbox(test));
            });
            
            categoryDiv.appendChild(testsGrid);
            testsContainer.appendChild(categoryDiv);
        }
    }

    // إنشاء عنصر تحليل مع خيار اختيار
    function createTestCheckbox(test) {
        const div = document.createElement('div');
        div.className = 'test-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `test-${test.replace(/\s+/g, '-')}`;
        checkbox.value = test;
        checkbox.checked = tempSelectedTests.includes(test);
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                tempSelectedTests.push(this.value);
            } else {
                tempSelectedTests = tempSelectedTests.filter(t => t !== this.value);
            }
        });
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = test;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        return div;
    }

    // التعامل مع أحداث البحث
    searchInput.addEventListener('input', function() {
        const query = this.value;
        const results = fuzzySearch(query, allTests);
        displaySearchResults(results);
    });

    // عرض جميع التحاليل عند تحميل الصفحة
    displaySearchResults(allTests);
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setupSearchFunctionality();
    
    // تعريف متغير tempSelectedTests إذا لم يكن معرّفاً
    if (typeof tempSelectedTests === 'undefined') {
        window.tempSelectedTests = [];
    }
});
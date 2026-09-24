document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.querySelector('.ai-chat-container');
    const questionButtons = document.querySelectorAll('.question-btn');

    const allowedMessages = [  
        "كيف يمكنني حجز موعد؟",  
        "ما هي ساعات العمل؟",  
        "أين يقع المعمل؟",  
        "تفاصيل عن الاسعار؟",
        "ما هي طرق الدفع المتاحة؟",
        "دليل استخدام الموقع"
    ];  
  
    function addMessage(message, isResponse = false) {  
        const messageDiv = document.createElement('div');  
        messageDiv.classList.add('ai-message');  
          
        if (isResponse) {  
            messageDiv.classList.add('ai-response');  
        } else {  
            messageDiv.classList.add('ai-user');  
        }  
          
        const contentDiv = document.createElement('div');  
        contentDiv.classList.add('message-content');  
        contentDiv.innerHTML = isResponse ? message : `<p>${message}</p>`;  
          
        messageDiv.appendChild(contentDiv);  
        chatContainer.appendChild(messageDiv);  
        chatContainer.scrollTop = chatContainer.scrollHeight;  
    }  

    function processQuestion(question) {  
        const responses = {  
            "كيف يمكنني حجز موعد؟": `يمكنك حجز موعد عن طريق زيارة صفحة حجز الموعد في موقعنا <a href="appointment.html" style="color: #f7f8faff; text-decoration: underline;">من هنا</a> أو الاتصال بنا مباشرة على الرقم <strong>01061730854</strong>.`,  

            "ما هي ساعات العمل؟": "ساعات العمل لدينا من السبت إلى الخميس من 9 صباحًا إلى 11 مساءً.",  

            "تفاصيل عن الاسعار؟": "جميع تفاصيل الأسعار يتم الاجابة عليها في جميع فروع المعمل.",  

            "أين يقع المعمل؟": `تقع معامل ميدلاب للتحاليل الطبية في مدينة 6 أكتوبر الجيزة مصر <a href="https://maps.app.goo.gl/D5hqvSsSMznigbrHA" target="_blank" style="color: #f7f8faff; text-decoration: underline;">هنا على الخريطة</a>.`,  

            "ما هي طرق الدفع المتاحة؟": "نقبل الدفع نقداً وفودافون كاش وانستا باي.",

            "دليل استخدام الموقع": `
                <div style="line-height: 1.9;">
                    <p style="margin-bottom: 12px; font-size: 15px;">📖 <strong>دليل استخدام موقع معمل ميدلاب</strong></p>
                    <p style="margin-bottom: 14px;">أهلاً بك! ده دليل مختصر لكل حاجة تقدر تعملها على الموقع خطوة بخطوة:</p>

                    <p style="margin: 10px 0;"><strong>🏠 الصفحة الرئيسية</strong></p>
                    <p style="margin-right: 15px; margin-bottom: 10px;">
                        أول ما تدخل الموقع، هتلاقي:
                        <br>• خدمات المعمل والأقسام المتاحة
                        <br>• الباقات والعروض الحالية
                        <br>• روابط سريعة لكل صفحة
                    </p>

                    <p style="margin: 10px 0;"><strong>📅 حجز فحص</strong></p>
                    <p style="margin-right: 15px; margin-bottom: 10px;">
                        تحجز موعدك بسهولة من <a href="appointment.html" style="color:#f7f8faff; text-decoration: underline;">صفحة حجز فحص</a>:
                        <br>1. اختر التحاليل المطلوبة
                        <br>2. أدخل بياناتك (الاسم، الهاتف، السن)
                        <br>3. اختر التاريخ والوقت المناسب
                        <br>4. اختر مكان سحب العينة (في المعمل أو في المنزل)
                        <br>5. اضغط "تأكيد الحجز"
                    </p>

                    <p style="margin: 10px 0;"><strong>📄 استلام النتائج</strong></p>
                    <p style="margin-right: 15px; margin-bottom: 10px;">
                        لاستلام نتائج تحاليلك من <a href="sample-receive.html" style="color:#f7f8faff; text-decoration: underline;">صفحة استلام نتيجة</a>:
                        <br>1. أدخل <strong>كود المريض</strong> (اللي استلمته من المعمل)
                        <br>2. اضغط "التحقق من الكود"
                        <br>3. أدخل <strong>كلمة السر</strong> (اللي استلمتها من المعمل)
                        <br>4. هتظهرلك كل نتائجك
                        <br>5. تقدر تعاين، تحمّل، أو تطبع أي نتيجة
                        <br>6. تقدر تفلتر النتائج حسب التاريخ
                    </p>

                    <p style="margin: 10px 0;"><strong>💬 خدمة العملاء</strong></p>
                    <p style="margin-right: 15px; margin-bottom: 10px;">
                        من <a href="contact.html" style="color:#f7f8faff; text-decoration: underline;">صفحة خدمة العملاء</a> تقدر:
                        <br>• تبعت استفسار أو شكوى أو مقترح
                        <br>• تتواصل معانا مباشرة
                        <br>• رقم خدمة العملاء: <strong>01061730854</strong>
                    </p>

                    <p style="margin: 10px 0;"><strong>📚 الإرشادات</strong></p>
                    <p style="margin-right: 15px; margin-bottom: 10px;">
                        صفحة الإرشادات فيها كل المعلومات المهمة قبل عمل التحاليل:
                        <br>• شروط الصيام للتحاليل
                        <br>• التوقيت المناسب لسحب العينة
                        <br>• طريقة التحضير لكل تحليل
                        <br>• تعليمات ما قبل وبعد التحليل
                    </p>

                    <p style="margin: 10px 0;"><strong>📌 نصائح مهمة</strong></p>
                    <p style="margin-right: 15px;">
                        • احفظ <strong>كود المريض وكلمة السر</strong> في مكان آمن
                        <br>• لو نسيت كلمة السر، اتصل بالمعمل على <strong>01061730854</strong>
                        <br>• كل النتائج بصيغة PDF تقدر تحمّلها أو تطبعها
                        <br>• لو عندك أي استفسار، كلمنا في أي وقت
                    </p>
                </div>
            `,

            "default": "أنا آسف، لا يمكنني فهم سؤالك. الرجاء اختيار أحد الأسئلة المدرجة أعلاه."  
        };  
          
        const response = responses[question] || responses["default"];  
        addMessage(response, true);  
    }   
   
    function showWelcomeMessage() {
        const welcomeMessage = "مرحباً بكم في خدمة الدردشة الآلية. الرجاء اختيار أحد الأسئلة أعلاه للحصول على المساعدة:";
        addMessage(welcomeMessage, true);
    }

    questionButtons.forEach(button => {  
        button.addEventListener('click', function() {  
            const question = this.textContent.trim();  
            
            if (!allowedMessages.includes(question)) {
                addMessage("عذراً، هذا السؤال غير متاح.", true);
                return;
            }
            
            addMessage(question);  
              
            setTimeout(() => {  
                processQuestion(question);  
            }, 1000);  
        });  
    });

    showWelcomeMessage();
});

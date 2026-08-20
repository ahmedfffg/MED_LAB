document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.querySelector('.ai-chat-container');
    const questionButtons = document.querySelectorAll('.question-btn');

    const allowedMessages = [  
        "كيف يمكنني حجز موعد؟",  
        "ما هي ساعات العمل؟",  
        "أين يقع المعمل؟",  
        "تفاصيل عن الاسعار؟",
        "ما هي طرق الدفع المتاحة؟",
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
           "تفاصيل عن الاسعار؟": "جميع تفاصل الاسعار يتم الاجابة عليها في جميع فروع المعمل.",  
            "أين يقع المعمل؟": `تقع معامل ميدلاب للتحاليل الطبية في مدينة 6 اكتوبر الجيزة مصر <a href="https://maps.app.goo.gl/D5hqvSsSMznigbrHA"_blank">هنا على الخريطة</a>.`,  
            "ما هي طرق الدفع المتاحة؟": "نقبل الدفع نقداًً وفودافون كاش وانستا باي.",
            "default": "أنا آسف، لا يمكنني فهم سؤالك. الرجاء اختيار أحد الأسئلة المدرجة أعلاه."  
        };  
          
        const response = responses[question] || responses["default"];  
        addMessage(response, true);  
    }  
   
    function showWelcomeMessage() {
        const welcomeMessage = "مرحباً بكم في خدمة الدردشة الآلية. الرجاء اختيار أحد الأسئلة اعلاه للحصول على المساعدة:";
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
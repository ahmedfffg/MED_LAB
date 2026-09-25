/* ============================================================
   AI ASSISTANT - MEDLAB
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    const chatContainer = document.querySelector('.ai-chat-container');
    const questionButtons = document.querySelectorAll('.question-btn');

    if (!chatContainer) return;

    function addMessage(message, isResponse) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('ai-message');
      messageDiv.classList.add(isResponse ? 'ai-response' : 'ai-user');

      const contentDiv = document.createElement('div');
      contentDiv.classList.add('message-content');
      contentDiv.innerHTML = message;

      messageDiv.appendChild(contentDiv);
      chatContainer.appendChild(messageDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    const responses = {
      "كيف يمكنني حجز موعد؟": 'يمكنك حجز موعد عن طريق زيارة <a href="appointment.html">صفحة حجز الموعد</a> أو الاتصال بنا على <strong>01061730854</strong>.',
      "ما هي ساعات العمل؟": "ساعات العمل لدينا من السبت إلى الخميس من 9 صباحًا إلى 11 مساءً.",
      "تفاصيل عن الاسعار؟": "جميع تفاصيل الأسعار يتم الاجابة عليها في جميع فروع المعمل.",
      "أين يقع المعمل؟": 'تقع معامل ميدلاب في مدينة 6 أكتوبر، الجيزة، مصر. <a href="https://maps.app.goo.gl/D5hqvSsSMznigbrHA" target="_blank">عرض على الخريطة</a>.',
      "ما هي طرق الدفع المتاحة؟": "نقبل الدفع نقداً وفودافون كاش وانستا باي.",
      "دليل استخدام الموقع": `
        <div style="line-height: 1.9;">
          <p><strong>📖 دليل استخدام موقع معمل ميدلاب</strong></p>
          <p><strong>🏠 الصفحة الرئيسية:</strong> خدمات المعمل، الباقات، روابط سريعة.</p>
          <p><strong>📅 حجز فحص:</strong> <a href="appointment.html">صفحة الحجز</a> — اختر التحاليل، أدخل بياناتك، حدد الموعد.</p>
          <p><strong>📄 استلام النتائج:</strong> <a href="sample-receive.html">صفحة الاستلام</a> — أدخل كود المريض وكلمة السر.</p>
          <p><strong>💬 خدمة العملاء:</strong> <a href="contact.html">تواصل معنا</a> — رقم: 01061730854.</p>
        </div>
      `,
      "default": "أنا آسف، لا يمكنني فهم سؤالك. الرجاء اختيار أحد الأسئلة المدرجة."
    };

    function processQuestion(question) {
      const response = responses[question] || responses["default"];
      addMessage(response, true);
    }

    questionButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const question = this.dataset.question || this.textContent.trim();
        addMessage(question, false);
        setTimeout(function () { processQuestion(question); }, 800);
      });
    });

    addMessage("مرحباً بكم! اختر أحد الأسئلة للحصول على المساعدة:", true);
  });

})();

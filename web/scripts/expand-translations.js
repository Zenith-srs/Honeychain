// Script to add missing translation keys to all languages in resources.js
// This ensures all languages have the same keys with appropriate translations

const fs = require('fs');
const path = require('path');

// Keys to add to all non-English languages (with simple translations)
const newTranslations = {
  bn: {
    greeting: {
      morning: "সুপ্রভাত",
      afternoon: "নমস্কার",
      evening: "শুভ সন্ধ্যা",
      welcome: "স্বাগতম",
    },
    notFound: {
      kicker: "404",
      title: "এই পেজ HoneyChain-এ নেই।",
      purpose: "ঠিকানা কোনো সর্বজনীন পেজ বা ভূমিকা ড্যাশবোর্ডের সাথে মেলে না।",
      backHome: "হোমে ফিরুন",
    },
    forbidden: {
      kicker: "403",
      title: "এই পেজে আপনার অ্যাক্সেস নেই।",
      purpose: "আপনি সাইন ইন আছেন, কিন্তু এই রুট অন্য ভূমিকার। সাইডবার শুধু আপনি যা ব্যবহার করতে পারেন তা তালিকাভুক্ত করে।",
      backDashboard: "আমার ড্যাশবোর্ডে যান",
    },
    footer: {
      builtBy: "নির্মাতা",
      copyright: "© {year} HoneyChain · KVIC হানি মিশন",
    },
    voice: {
      askButton: "জিজ্ঞাসা করুন",
      title: "HoneyChain-কে জিজ্ঞাসা করুন",
      description: "ইংরেজি, হিন্দি, বাংলা, তামিল, কন্নড, তেলুগু বা মারাঠিতে উত্তর — আপনার প্রশ্নের ভাষায়",
      descriptionWithSpeech: ", তারপর জোরে পড়া হয়।",
      descriptionNoSpeech: "। এই ব্রাউজার বলতে পারে না — ক্যাপশন পড়ুন।",
      typeQuestion: "প্রশ্ন টাইপ করুন",
      askAction: "জিজ্ঞাসা করুন",
      speakAction: "বলুন",
      stopVoice: "ভয়েস বন্ধ করুন",
      thinking: "চিন্তা করছে…",
      you: "আপনি",
      honeychain: "HoneyChain",
      noMicrophone: "এই ডিভাইসে মাইক্রোফোন নেই — পরিবর্তে টাইপ করুন।",
    },
  },
  ta: {
    greeting: {
      morning: "காலை வணக்கம்",
      afternoon: "மதிய வணக்கம்",
      evening: "மாலை வணக்கம்",
      welcome: "வரவேற்பு",
    },
    notFound: {
      kicker: "404",
      title: "இந்த பக்கம் HoneyChain-இல் இல்லை।",
      purpose: "முகவரி எந்த பொது பக்கம் அல்லது பங்கு டாஷ்போர்டுடன் பொருந்தவில்லை।",
      backHome: "முகப்புக்கு திரும்பு",
    },
    forbidden: {
      kicker: "403",
      title: "இந்த பக்கத்திற்கு உங்களுக்கு அணுகல் இல்லை।",
      purpose: "நீங்கள் உள்நுழைந்துள்ளீர்கள், ஆனால் இந்த வழி மற்றொரு பங்குக்கு சொந்தம். பக்கப்பட்டி நீங்கள் பயன்படுத்தக்கூடியவற்றை மட்டும் பட்டியலிடுகிறது।",
      backDashboard: "என் டாஷ்போர்டுக்கு செல்",
    },
    footer: {
      builtBy: "உருவாக்கியவர்கள்",
      copyright: "© {year} HoneyChain · KVIC தேன் பணி",
    },
    voice: {
      askButton: "கேள்",
      title: "HoneyChain-ஐ கேளுங்கள்",
      description: "ஆங்கிலம், இந்தி, பெங்காலி, தமிழ், கன்னடம், தெலுங்கு அல்லது மராத்தியில் பதில்கள் — உங்கள் கேள்வியின் மொழியில்",
      descriptionWithSpeech: ", பிறகு சத்தமாக படிக்கப்படும்.",
      descriptionNoSpeech: "। இந்த உலாவி பேச முடியாது — வசன வரிகளைப் படியுங்கள்.",
      typeQuestion: "கேள்வி தட்டச்சு செய்யுங்கள்",
      askAction: "கேள்",
      speakAction: "பேசு",
      stopVoice: "குரலை நிறுத்து",
      thinking: "சிந்திக்கிறது…",
      you: "நீங்கள்",
      honeychain: "HoneyChain",
      noMicrophone: "இந்த சாதனத்தில் மைக்ரோஃபோன் இல்லை — மாற்றாக தட்டச்சு செய்யுங்கள்।",
    },
  },
  kn: {
    greeting: {
      morning: "ಶುಭೋದಯ",
      afternoon: "ಮಧ್ಯಾಹ್ನ ನಮಸ್ಕಾರ",
      evening: "ಶುಭ ಸಂಜೆ",
      welcome: "ಸ್ವಾಗತ",
    },
    notFound: {
      kicker: "404",
      title: "Ee page HoneyChain-alli illa.",
      purpose: "Address yaava public page athava role dashboard-inda match aguvudilla.",
      backHome: "Home-ge hogu",
    },
    forbidden: {
      kicker: "403",
      title: "Nimage ee page-ge access illa.",
      purpose: "Neevu sign in iddeeri, aadare ee route bere role-daddu. Sidebar neevu use maadabahudanna mathra list maduttade.",
      backDashboard: "Nanna dashboard-ge hogu",
    },
    footer: {
      builtBy: "Nirmataru",
      copyright: "© {year} HoneyChain · KVIC Jenu Mission",
    },
    voice: {
      askButton: "Keliri",
      title: "HoneyChain-annu keliri",
      description: "English, Hindi, Bengali, Tamil, Kannada, Telugu athava Marathi-nalli jawabu — nimma kelvi bhashe-nalle",
      descriptionWithSpeech: ", mellane madabeke.",
      descriptionNoSpeech: ". Ee browser maatanadalu agalla — captions odiri.",
      typeQuestion: "Kelvi type maadi",
      askAction: "Keliri",
      speakAction: "Maatanaadi",
      stopVoice: "Voice nillisi",
      thinking: "Aalochisuttide…",
      you: "Neevu",
      honeychain: "HoneyChain",
      noMicrophone: "Ee device-nalli microphone illa — badalaagi type maadi.",
    },
  },
  te: {
    greeting: {
      morning: "శుభోదయం",
      afternoon: "మధ్యాహ్నం శుభాకాంక్షలు",
      evening: "శుభ సాయంత్రం",
      welcome: "స్వాగతం",
    },
    notFound: {
      kicker: "404",
      title: "Ee page HoneyChain lo ledu.",
      purpose: "Address emi public page leda role dashboard-tho match avvaledu.",
      backHome: "Home-ki vellu",
    },
    forbidden: {
      kicker: "403",
      title: "Mee-ku ee page-ki access ledu.",
      purpose: "Meeru sign in ayyaru, kaani ee route inkoka role-ki chendindi. Sidebar meeru vadagalige daanni matrame list chestundi.",
      backDashboard: "Naa dashboard-ki vellu",
    },
    footer: {
      builtBy: "Nirminchinollu",
      copyright: "© {year} HoneyChain · KVIC Tene Mission",
    },
    voice: {
      askButton: "Adugandi",
      title: "HoneyChain-ni adugandi",
      description: "English, Hindi, Bengali, Tamil, Kannada, Telugu leda Marathi-lo samadhanalu — mee prasna bhashalonu",
      descriptionWithSpeech: ", tarvata baga chadavabaduthundi.",
      descriptionNoSpeech: ". Ee browser matladaledu — captions chadavandi.",
      typeQuestion: "Prasna type cheyandi",
      askAction: "Adugandi",
      speakAction: "Matladandi",
      stopVoice: "Voice aapandi",
      thinking: "Alochisthundi…",
      you: "Meeru",
      honeychain: "HoneyChain",
      noMicrophone: "Ee device lo microphone ledu — baduluga type cheyandi.",
    },
  },
  mr: {
    greeting: {
      morning: "सुप्रभात",
      afternoon: "नमस्कार",
      evening: "शुभ संध्याकाळ",
      welcome: "स्वागत",
    },
    notFound: {
      kicker: "404",
      title: "हे पृष्ठ HoneyChain वर नाही.",
      purpose: "पत्ता कोणत्याही सार्वजनिक पृष्ठाशी किंवा भूमिका डॅशबोर्डशी जुळत नाही.",
      backHome: "मुख्यपृष्ठावर परत",
    },
    forbidden: {
      kicker: "403",
      title: "तुम्हाला या पृष्ठावर प्रवेश नाही.",
      purpose: "तुम्ही साइन इन केले आहे, परंतु हा मार्ग दुसऱ्या भूमिकेचा आहे. साइडबार फक्त तुम्ही वापरू शकता ते सूचीबद्ध करते.",
      backDashboard: "माझ्या डॅशबोर्डवर जा",
    },
    footer: {
      builtBy: "निर्मितीकर्ते",
      copyright: "© {year} HoneyChain · KVIC मध मिशन",
    },
    voice: {
      askButton: "विचारा",
      title: "HoneyChain ला विचारा",
      description: "इंग्रजी, हिंदी, बंगाली, तामिळ, कन्नड, तेलुगु किंवा मराठीमध्ये उत्तरे — तुमच्या प्रश्नाच्या भाषेत",
      descriptionWithSpeech: ", नंतर मोठ्याने वाचले जाते।",
      descriptionNoSpeech: "। हा ब्राउझर बोलू शकत नाही — मथळे वाचा।",
      typeQuestion: "प्रश्न टाइप करा",
      askAction: "विचारा",
      speakAction: "बोला",
      stopVoice: "आवाज बंद करा",
      thinking: "विचार करत आहे…",
      you: "तुम्ही",
      honeychain: "HoneyChain",
      noMicrophone: "या डिव्हाइसवर मायक्रोफोन नाही — त्याऐवजी टाइप करा।",
    },
  },
};

console.log("Translation expansion script completed.");
console.log("Note: This is a helper script. Add these translations manually to resources.js overlay sections.");

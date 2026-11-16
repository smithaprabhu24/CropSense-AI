"""
CropSense AI – AI Assistant Router
Rule-based chatbot with multilingual keyword matching and optional OpenAI fallback.
"""
from fastapi import APIRouter
from backend.models.schemas import ChatRequest
from backend.config import OPENAI_API_KEY

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

KEYWORDS = {
    "crop": {
        "en": ["crop", "grow", "plant", "seed", "sow", "cultivate"],
        "kn": ["ಬೆಳೆ", "ಬಿತ್ತನೆ", "ನಾಟಿ", "ಬೀಜ"],
        "te": ["పంట", "విత్తనం", "నాటు", "సాగు"],
        "hi": ["फसल", "बोना", "बीज", "उगाना", "खेती"],
        "ta": ["பயிர்", "விதை", "நடவு", "விவசாயம்"],
    },
    "water": {
        "en": ["water", "irrigat", "rain", "moisture", "drip", "sprinkler"],
        "kn": ["ನೀರು", "ನೀರಾವರಿ", "ಮಳೆ", "ತೇವ"],
        "te": ["నీరు", "సాగునీరు", "వర్షం", "తేమ"],
        "hi": ["पानी", "सिंचाई", "बारिश", "नमी"],
        "ta": ["நீர்", "பாசனம்", "மழை", "ஈரம்"],
    },
    "fertilizer": {
        "en": ["fertiliz", "nutrient", "npk", "urea", "manure", "compost"],
        "kn": ["ಗೊಬ್ಬರ", "ಪೋಷಕ", "ಯೂರಿಯಾ"],
        "te": ["ఎరువు", "పోషకాలు", "యూరియా"],
        "hi": ["खाद", "उर्वरक", "पोषक", "यूरिया"],
        "ta": ["உரம்", "ஊட்டச்சத்து", "யூரியா"],
    },
    "weather": {
        "en": ["weather", "climate", "forecast", "rain", "temperature", "wind"],
        "kn": ["ಹವಾಮಾನ", "ಮಳೆ", "ಬಿಸಿಲು", "ಗಾಳಿ"],
        "te": ["వాతావరణం", "వర్షం", "ఎండ", "గాలి"],
        "hi": ["मौसम", "बारिश", "तापमान", "हवा"],
        "ta": ["வானிலை", "மழை", "வெப்பநிலை", "காற்று"],
    },
    "market": {
        "en": ["market", "price", "sell", "buy", "mandi", "apmc", "rate"],
        "kn": ["ಮಾರುಕಟ್ಟೆ", "ಬೆಲೆ", "ಮಾರಾಟ"],
        "te": ["మార్కెట్", "ధర", "అమ్మకం"],
        "hi": ["बाजार", "मंडी", "दाम", "कीमत", "बेचना"],
        "ta": ["சந்தை", "விலை", "விற்பனை"],
    },
    "risk": {
        "en": ["risk", "disease", "pest", "insect", "danger", "threat", "blight"],
        "kn": ["ರೋಗ", "ಕೀಟ", "ಅಪಾಯ"],
        "te": ["వ్యాధి", "పురుగు", "ప్రమాదం"],
        "hi": ["रोग", "कीट", "खतरा", "बीमारी"],
        "ta": ["நோய்", "பூச்சி", "ஆபத்து"],
    },
    "yield": {
        "en": ["yield", "harvest", "production", "output", "tonnes"],
        "kn": ["ಇಳುವರಿ", "ಕೊಯ್ಲು", "ಉತ್ಪಾದನೆ"],
        "te": ["దిగుబడి", "పంటకోత", "ఉత్పత్తి"],
        "hi": ["उपज", "फसल कटाई", "उत्पादन"],
        "ta": ["விளைச்சல்", "அறுவடை", "உற்பத்தி"],
    },
    "greeting": {
        "en": ["hello", "hi", "hey", "good morning", "help"],
        "kn": ["ನಮಸ್ಕಾರ", "ಹಲೋ"],
        "te": ["నమస్కారం", "హలో"],
        "hi": ["नमस्ते", "हेलो"],
        "ta": ["வணக்கம்", "ஹலோ"],
    },
}

RESPONSES = {
    "crop": {
        "en": "For crop recommendations, I need to know your soil nutrients (N, P, K), temperature, humidity, pH, and rainfall. You can go to the Crop Recommendation page for a detailed analysis. Generally, for Kharif season: Rice, Maize, Cotton, Groundnut work well. For Rabi: Wheat, Chickpea, Mustard are good choices.",
        "kn": "ಬೆಳೆ ಶಿಫಾರಸ್ಸಿಗಾಗಿ ನಿಮ್ಮ ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳು (N, P, K), ತಾಪಮಾನ, ತೇವಾಂಶ, pH ಮತ್ತು ಮಳೆಯ ಮಾಹಿತಿ ಬೇಕು. ಬೆಳೆ ಶಿಫಾರಸ್ಸು ಪುಟಕ್ಕೆ ಹೋಗಿ.",
        "te": "పంట సిఫార్సుల కోసం మీ నేల పోషకాలు (N, P, K), ఉష్ణోగ్రత, తేమ, pH మరియు వర్షపాతం అవసరం. పంట సిఫార్సు పేజీకి వెళ్ళండి.",
        "hi": "फसल की सिफारिश के लिए मिट्टी के पोषक तत्व (N, P, K), तापमान, नमी, pH और बारिश की जानकारी चाहिए। फसल सिफारिश पेज पर जाएं।",
        "ta": "பயிர் பரிந்துரைக்கு மண் ஊட்டச்சத்துகள் (N, P, K), வெப்பநிலை, ஈரப்பதம், pH மற்றும் மழை தகவல் தேவை. பயிர் பரிந்துரை பக்கத்திற்குச் செல்லுங்கள்.",
    },
    "water": {
        "en": "Irrigation depends on your crop, soil type, and season. Drip irrigation saves up to 40% water compared to flood irrigation. Check the Irrigation Planner for a customized schedule for your farm.",
        "kn": "ನೀರಾವರಿ ನಿಮ್ಮ ಬೆಳೆ, ಮಣ್ಣು ಮತ್ತು ಋತುವನ್ನು ಅವಲಂಬಿಸಿದೆ. ಹನಿ ನೀರಾವರಿ 40% ನೀರು ಉಳಿಸುತ್ತದೆ.",
        "te": "నీటిపారుదల మీ పంట, నేల రకం మరియు సీజన్‌పై ఆధారపడి ఉంటుంది. బిందు సేద్యం 40% నీటిని ఆదా చేస్తుంది.",
        "hi": "सिंचाई आपकी फसल, मिट्टी और मौसम पर निर्भर करती है। ड्रिप सिंचाई 40% पानी बचाती है।",
        "ta": "பாசனம் உங்கள் பயிர், மண் வகை மற்றும் பருவத்தைப் பொறுத்தது. சொட்டுநீர் பாசனம் 40% நீரை சேமிக்கிறது.",
    },
    "fertilizer": {
        "en": "Fertilizer needs depend on soil nutrient levels and crop type. Get a soil test done first. Visit the Fertilizer Guide for precise NPK recommendations and an application schedule.",
        "kn": "ಗೊಬ್ಬರದ ಅಗತ್ಯ ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ಮಟ್ಟ ಮತ್ತು ಬೆಳೆಯ ಪ್ರಕಾರವನ್ನು ಅವಲಂಬಿಸಿದೆ. ಮೊದಲು ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ.",
        "te": "ఎరువుల అవసరం నేల పోషక స్థాయిలు మరియు పంట రకంపై ఆధారపడి ఉంటుంది. ముందుగా నేల పరీక్ష చేయించండి.",
        "hi": "खाद की जरूरत मिट्टी के पोषक स्तर और फसल के प्रकार पर निर्भर है। पहले मिट्टी की जांच कराएं।",
        "ta": "உர தேவை மண் ஊட்டச்சத்து அளவு மற்றும் பயிர் வகையைப் பொறுத்தது. முதலில் மண் பரிசோதனை செய்யுங்கள்.",
    },
    "weather": {
        "en": "Check the Weather page for your local 7-day forecast. Plan sowing, spraying, and harvesting based on weather predictions. Avoid spraying pesticides if rain is expected within 24 hours.",
        "kn": "ನಿಮ್ಮ ಸ್ಥಳೀಯ 7-ದಿನ ಮುನ್ಸೂಚನೆಗಾಗಿ ಹವಾಮಾನ ಪುಟ ನೋಡಿ.",
        "te": "మీ స్థానిక 7-రోజుల అంచనా కోసం వాతావరణ పేజీ చూడండి.",
        "hi": "अपने स्थानीय 7-दिन के पूर्वानुमान के लिए मौसम पेज देखें।",
        "ta": "உங்கள் உள்ளூர் 7-நாள் முன்னறிவிப்புக்கு வானிலை பக்கம் பாருங்கள்.",
    },
    "market": {
        "en": "Check the Market Prices page for latest APMC rates. Compare prices across markets before selling. Current trends show prices are generally stable for major commodities.",
        "kn": "ಇತ್ತೀಚಿನ ಎಪಿಎಂಸಿ ದರಗಳಿಗಾಗಿ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಪುಟ ನೋಡಿ.",
        "te": "తాజా APMC ధరల కోసం మార్కెట్ ధరల పేజీ చూడండి.",
        "hi": "नवीनतम APMC दरों के लिए बाजार मूल्य पेज देखें।",
        "ta": "சமீபத்திய APMC விலைகளுக்கு சந்தை விலை பக்கம் பாருங்கள்.",
    },
    "risk": {
        "en": "For crop risk analysis, visit the Risk Alerts page. Enter your crop, state, and season to see potential threats from pests, diseases, and weather. Early detection is key to prevention.",
        "kn": "ಬೆಳೆ ಅಪಾಯ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಅಪಾಯ ಎಚ್ಚರಿಕೆ ಪುಟಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.",
        "te": "పంట ప్రమాద విశ్లేషణ కోసం రిస్క్ అలర్ట్స్ పేజీని సందర్శించండి.",
        "hi": "फसल जोखिम विश्लेषण के लिए जोखिम चेतावनी पेज पर जाएं।",
        "ta": "பயிர் ஆபத்து பகுப்பாய்வுக்கு ஆபத்து எச்சரிக்கை பக்கத்தைப் பார்வையிடுங்கள்.",
    },
    "yield": {
        "en": "For yield prediction, go to the Yield Prediction page. Enter your crop, area, season, and soil type. The AI model will estimate your expected harvest output.",
        "kn": "ಇಳುವರಿ ಮುನ್ಸೂಚನೆಗಾಗಿ ಇಳುವರಿ ಮುನ್ಸೂಚನೆ ಪುಟಕ್ಕೆ ಹೋಗಿ.",
        "te": "దిగుబడి అంచనా కోసం దిగుబడి అంచనా పేజీకి వెళ్ళండి.",
        "hi": "उपज पूर्वानुमान के लिए उपज पूर्वानुमान पेज पर जाएं।",
        "ta": "விளைச்சல் கணிப்புக்கு விளைச்சல் கணிப்பு பக்கத்திற்குச் செல்லுங்கள்.",
    },
    "greeting": {
        "en": "Hello! I'm your CropSense AI assistant. I can help with crop recommendations, irrigation, fertilizer, weather, market prices, and risk alerts. What would you like to know?",
        "kn": "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕ್ರಾಪ್‌ಸೆನ್ಸ್ AI ಸಹಾಯಕ. ಬೆಳೆ, ನೀರಾವರಿ, ಗೊಬ್ಬರ, ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಬಗ್ಗೆ ಕೇಳಿ.",
        "te": "నమస్కారం! నేను మీ క్రాప్‌సెన్స్ AI సహాయకుడిని. పంట, నీటిపారుదల, ఎరువు, వాతావరణం, మార్కెట్ ధరల గురించి అడగండి.",
        "hi": "नमस्ते! मैं आपका क्रॉपसेंस AI सहायक हूं। फसल, सिंचाई, खाद, मौसम, बाजार भाव के बारे में पूछें।",
        "ta": "வணக்கம்! நான் உங்கள் கிராப்சென்ஸ் AI உதவியாளர். பயிர், பாசனம், உரம், வானிலை, சந்தை விலை பற்றி கேளுங்கள்.",
    },
}

SUGGESTIONS = {
    "crop": ["What fertilizer to use?", "Check weather", "Market prices"],
    "water": ["Crop recommendation", "Weather forecast", "Risk alerts"],
    "fertilizer": ["Irrigation schedule", "Yield prediction", "Market prices"],
    "weather": ["Risk alerts", "Irrigation plan", "Crop advice"],
    "market": ["Yield prediction", "Best crop to grow?", "Weather"],
    "risk": ["Weather forecast", "Fertilizer guide", "Insurance info"],
    "yield": ["Market prices", "Fertilizer guide", "Irrigation plan"],
    "greeting": ["Best crop for my soil?", "Today's weather", "Market prices"],
}


def _detect_intent(message, language):
    """Detect the intent of the user's message based on keyword matching."""
    msg_lower = message.lower()
    for intent, lang_keywords in KEYWORDS.items():
        keywords = lang_keywords.get(language, []) + lang_keywords.get("en", [])
        for kw in keywords:
            if kw.lower() in msg_lower:
                return intent
    return "greeting"


@router.post("/chat")
async def chat(req: ChatRequest):
    lang = req.language if req.language in ("en", "kn", "te", "hi", "ta") else "en"
    intent = _detect_intent(req.message, lang)
    reply = RESPONSES.get(intent, RESPONSES["greeting"]).get(lang, RESPONSES[intent]["en"])
    suggestions = SUGGESTIONS.get(intent, SUGGESTIONS["greeting"])

    return {
        "success": True,
        "reply": reply,
        "language": lang,
        "suggestions": suggestions,
    }
